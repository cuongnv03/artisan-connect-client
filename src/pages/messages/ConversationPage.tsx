import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  PlusIcon,
  PhoneIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { messageService } from '../../services/message.service';
import { orderService } from '../../services/order.service';
import { userService } from '../../services/user.service';
import { Message, MessageType } from '../../types/message';
import { User } from '../../types/auth';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useForm } from '../../hooks/useForm';
import { useToastContext } from '../../contexts/ToastContext';
import { formatRelativeTime } from '../../utils/format';
import { CustomOrderProposalForm } from '../../components/common/CustomOrderProposalForm';
import { CustomOrderDisplay } from '../../components/common/CustomOrderDisplay';
import { CustomOrderCard } from '../../components/common/CustomOrderCard';

interface MessageFormData {
  content: string;
}

export const ConversationPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const { socket, onlineUsers } = useSocketContext();
  const { error: showError, success: showSuccess } = useToastContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [participantTyping, setParticipantTyping] = useState(false);
  const [showCustomOrderForm, setShowCustomOrderForm] = useState(false);
  const [customOrderLoading, setCustomOrderLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number>();

  const { values, handleChange, handleSubmit, resetForm } =
    useForm<MessageFormData>({
      initialValues: { content: '' },
      validate: (values) => {
        const errors: Record<string, string> = {};
        if (!values.content.trim()) {
          errors.content = 'Tin nhắn không được để trống';
        }
        return errors;
      },
      onSubmit: handleSendMessage,
    });

  useEffect(() => {
    if (userId) {
      loadConversation();
      loadParticipant();
    }
  }, [userId]);

  useEffect(() => {
    if (page === 1) {
      scrollToBottom();
    }
  }, [messages]);

  // Real-time message handling
  useEffect(() => {
    if (!socket || !userId) return;

    // Join conversation room
    socket.emit('join-chat', {
      roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
    });

    const handleNewMessage = (message: Message) => {
      // Only add message if it's for this conversation
      if (
        (message.senderId === userId &&
          message.receiverId === state.user?.id) ||
        (message.senderId === state.user?.id && message.receiverId === userId)
      ) {
        setMessages((prev) => {
          // Check if message already exists (prevent duplicates)
          if (prev.some((msg) => msg.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });

        // Mark as read if message is from participant
        if (message.senderId === userId) {
          setTimeout(() => {
            messageService.markAsRead(message.id).catch(console.error);
          }, 1000);
        }

        // Scroll to bottom for new messages
        setTimeout(() => scrollToBottom(), 100);
      }
    };

    const handleMessageRead = (data: { messageId: string; readBy: string }) => {
      if (data.readBy === userId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, isRead: true } : msg,
          ),
        );
      }
    };

    const handleTypingStatus = (data: {
      userId: string;
      isTyping: boolean;
      roomId: string;
    }) => {
      if (data.userId === userId) {
        setParticipantTyping(data.isTyping);
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-read-update', handleMessageRead);
    socket.on('typing-status', handleTypingStatus);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-read-update', handleMessageRead);
      socket.off('typing-status', handleTypingStatus);

      // Leave conversation room
      socket.emit('leave-chat', {
        roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
      });
    };
  }, [socket, userId, state.user?.id]);

  // Handle typing indicator
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);

    if (!socket || !userId) return;

    // Send typing start
    if (!isTyping) {
      setIsTyping(true);
      socket.emit('typing', {
        roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
        isTyping: true,
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit('typing', {
        roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
        isTyping: false,
      });
    }, 2000);
  };

  const loadConversation = async (pageNum = 1) => {
    if (!userId) return;

    try {
      if (pageNum > 1) {
        setLoadingMore(true);
      }

      const result = await messageService.getConversationMessages(userId, {
        page: pageNum,
        limit: 50,
        sortOrder: 'desc',
      });

      if (pageNum === 1) {
        setMessages(result.data.reverse());
        // Mark as read
        await messageService.markConversationAsRead(userId);
      } else {
        setMessages((prev) => [...result.data.reverse(), ...prev]);
      }

      setHasMore(pageNum < result.meta.totalPages);
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      showError(error.message || 'Không thể tải cuộc trò chuyện');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadParticipant = async () => {
    if (!userId) return;

    try {
      const user = await userService.getUserProfile(userId);
      setParticipant(user);
    } catch (error: any) {
      console.error('Error loading participant:', error);
      showError('Không thể tải thông tin người dùng');
    }
  };

  const loadMoreMessages = async () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await loadConversation(nextPage);
    }
  };

  async function handleSendMessage(data: MessageFormData) {
    if (!userId || !data.content.trim()) return;

    setSending(true);
    try {
      const newMessage = await messageService.sendMessage({
        receiverId: userId,
        content: data.content.trim(),
        type: MessageType.TEXT,
      });

      // Message will be added via socket event, but add immediately for better UX
      setMessages((prev) => {
        // Check if message already exists
        if (prev.some((msg) => msg.id === newMessage.id)) {
          return prev;
        }
        return [...prev, newMessage];
      });

      resetForm();

      // Stop typing indicator
      if (isTyping && socket) {
        setIsTyping(false);
        socket.emit('typing', {
          roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
          isTyping: false,
        });
      }

      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(), 100);
    } catch (error: any) {
      console.error('Error sending message:', error);
      showError(error.message || 'Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  }

  const handleSendCustomOrder = async (proposal: any) => {
    if (!userId) return;

    setCustomOrderLoading(true);
    try {
      // Gửi message với metadata structured để render CustomOrderCard
      await messageService.sendMessage({
        receiverId: userId,
        content: `🛠️ Tôi có một đề xuất custom order cho bạn: "${proposal.productName}"`,
        type: MessageType.CUSTOM_ORDER,
        metadata: {
          type: 'custom_order_proposal',
          negotiationId: `custom_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`,
          proposal: {
            ...proposal,
            // Ensure deadline is string if it exists
            deadline: proposal.deadline
              ? proposal.deadline.toISOString()
              : undefined,
          },
          status: 'pending',
          timestamp: new Date().toISOString(),
        },
      });

      showSuccess('Đề xuất custom order đã được gửi');
      setShowCustomOrderForm(false);
    } catch (error: any) {
      showError(error.message || 'Không thể gửi đề xuất custom order');
    } finally {
      setCustomOrderLoading(false);
    }
  };

  // src/pages/messages/ConversationPage.tsx (updated handlers)
  const handleAcceptCustomOrder = async (
    negotiationId: string,
    proposal: any,
  ) => {
    if (!userId) return;

    setSending(true);
    try {
      // Gửi message response
      await messageService.sendMessage({
        receiverId: userId,
        content: `✅ Tôi đồng ý với đề xuất "${proposal.productName}". Hãy tiến hành thanh toán!`,
        type: MessageType.CUSTOM_ORDER,
        metadata: {
          type: 'custom_order_response',
          negotiationId,
          originalProposal: proposal,
          response: {
            accepted: true,
            message: 'Đề xuất được chấp nhận',
            canProceed: true,
          },
          status: 'accepted',
          timestamp: new Date().toISOString(),
        },
      });

      showSuccess('Đã chấp nhận đề xuất custom order');

      // Update local message status if needed
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.metadata?.negotiationId === negotiationId) {
            return {
              ...msg,
              metadata: {
                ...msg.metadata,
                status: 'accepted',
              },
            };
          }
          return msg;
        }),
      );
    } catch (error: any) {
      showError(error.message || 'Không thể chấp nhận đề xuất');
    } finally {
      setSending(false);
    }
  };

  const handleDeclineCustomOrder = async (
    negotiationId: string,
    reason?: string,
  ) => {
    if (!userId) return;

    setSending(true);
    try {
      await messageService.sendMessage({
        receiverId: userId,
        content: `❌ Tôi từ chối đề xuất này.${
          reason ? ` Lý do: ${reason}` : ''
        }`,
        type: MessageType.CUSTOM_ORDER,
        metadata: {
          type: 'custom_order_response',
          negotiationId,
          response: {
            accepted: false,
            message: reason || 'Đề xuất bị từ chối',
            canProceed: false,
          },
          status: 'declined',
          timestamp: new Date().toISOString(),
        },
      });

      showSuccess('Đã từ chối đề xuất custom order');

      // Update local message status
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.metadata?.negotiationId === negotiationId) {
            return {
              ...msg,
              metadata: {
                ...msg.metadata,
                status: 'declined',
              },
            };
          }
          return msg;
        }),
      );
    } catch (error: any) {
      showError(error.message || 'Không thể từ chối đề xuất');
    } finally {
      setSending(false);
    }
  };

  const handleRequestChanges = async (
    negotiationId: string,
    changes: string,
  ) => {
    if (!userId) return;

    setSending(true);
    try {
      await messageService.sendMessage({
        receiverId: userId,
        content: `🔄 Tôi muốn yêu cầu một số thay đổi: ${changes}`,
        type: MessageType.CUSTOM_ORDER,
        metadata: {
          type: 'custom_order_response',
          negotiationId,
          response: {
            accepted: false,
            message: `Yêu cầu thay đổi: ${changes}`,
            canProceed: false,
            requiresMoreInfo: true,
            additionalQuestions: [changes],
          },
          status: 'negotiating',
          timestamp: new Date().toISOString(),
        },
      });

      showSuccess('Đã gửi yêu cầu thay đổi');

      // Update local message status
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.metadata?.negotiationId === negotiationId) {
            return {
              ...msg,
              metadata: {
                ...msg.metadata,
                status: 'negotiating',
              },
            };
          }
          return msg;
        }),
      );
    } catch (error: any) {
      showError(error.message || 'Không thể gửi yêu cầu thay đổi');
    } finally {
      setSending(false);
    }
  };

  const handleCustomOrderResponse = async (
    originalMessageId: string,
    response: any,
  ) => {
    if (!userId) return;

    try {
      await messageService.sendCustomOrder({
        type: 'response',
        customerId: userId,
        originalMessageId,
        response,
      });

      showSuccess('Phản hồi đã được gửi');
    } catch (error: any) {
      showError(error.message || 'Không thể gửi phản hồi');
    }
  };

  const handleCreateOrderFromNegotiation = async (negotiationId: string) => {
    try {
      // Tích hợp với address selection và payment method
      // Có thể mở modal để chọn địa chỉ và phương thức thanh toán
      showSuccess('Chức năng tạo đơn hàng sẽ được triển khai');
    } catch (error: any) {
      showError(error.message || 'Không thể tạo đơn hàng');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string | Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      });
    }
  };

  const isUserOnline = () => {
    return userId ? onlineUsers.has(userId) : false;
  };

  // src/pages/messages/ConversationPage.tsx (updated renderMessage)
  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.senderId === state.user?.id;
    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];

    const showAvatar =
      !isOwn && (!nextMessage || nextMessage.senderId !== message.senderId);
    const showDate =
      !prevMessage ||
      new Date(message.createdAt).toDateString() !==
        new Date(prevMessage.createdAt).toDateString();

    return (
      <div key={message.id}>
        {showDate && (
          <div className="text-center my-4">
            <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
              {formatDate(message.createdAt)}
            </span>
          </div>
        )}

        <div className={`flex mb-4 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          {!isOwn && (
            <div className="mr-3">
              {showAvatar ? (
                <Avatar
                  src={participant?.avatarUrl}
                  alt={`${participant?.firstName} ${participant?.lastName}`}
                  size="sm"
                />
              ) : (
                <div className="w-8 h-8" />
              )}
            </div>
          )}

          <div
            className={`max-w-xs lg:max-w-md ${isOwn ? 'order-1' : 'order-2'}`}
          >
            {/* Render based on message type */}
            {message.type === MessageType.CUSTOM_ORDER ? (
              // Custom Order - render without background, let CustomOrderCard handle styling
              <div>
                {/* Short message text */}
                {message.content && (
                  <div
                    className={`px-4 py-2 rounded-lg mb-2 ${
                      isOwn
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                )}

                {/* Custom Order Card */}
                {message.metadata?.type === 'custom_order_proposal' &&
                  message.metadata?.proposal && (
                    <CustomOrderCard
                      proposal={message.metadata.proposal}
                      negotiationId={message.metadata.negotiationId}
                      status={message.metadata.status || 'pending'}
                      isOwn={isOwn}
                      userRole={state.user?.role || 'CUSTOMER'}
                      onAccept={handleAcceptCustomOrder}
                      onDecline={handleDeclineCustomOrder}
                      onRequestChanges={handleRequestChanges}
                      loading={sending}
                    />
                  )}

                {/* Response type custom orders */}
                {message.metadata?.type === 'custom_order_response' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">
                      {message.metadata.response?.accepted
                        ? 'Đề xuất được chấp nhận'
                        : 'Phản hồi đề xuất'}
                    </h4>
                    <p>{message.content}</p>
                    {message.metadata.response?.counterOffer && (
                      <div className="mt-2 p-3 bg-white rounded border">
                        <h5 className="font-medium mb-1">Đề xuất mới:</h5>
                        <p className="text-sm">
                          Giá: ${message.metadata.response.counterOffer.price}
                        </p>
                        <p className="text-sm">
                          Thời gian:{' '}
                          {message.metadata.response.counterOffer.duration}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Update type custom orders */}
                {message.metadata?.type === 'custom_order_update' && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h4 className="font-semibold mb-2">
                      Đề xuất đã được cập nhật
                    </h4>
                    <p>{message.content}</p>
                  </div>
                )}
              </div>
            ) : (
              // Regular messages
              <div
                className={`px-4 py-2 rounded-lg ${
                  isOwn ? 'bg-primary text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                {message.type === MessageType.IMAGE ? (
                  <div>
                    <img
                      src={message.metadata?.mediaUrl || message.metadata?.url}
                      alt="Shared image"
                      className="rounded-lg max-w-full h-auto"
                    />
                    {message.content && (
                      <p className="mt-2">{message.content}</p>
                    )}
                  </div>
                ) : message.type === MessageType.QUOTE_DISCUSSION ? (
                  <div>
                    <div className="flex items-center mb-2">
                      <InformationCircleIcon className="w-4 h-4 mr-2" />
                      <span className="font-medium">Thảo luận báo giá</span>
                    </div>
                    <p>{message.content}</p>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </div>
            )}

            {/* Timestamp */}
            <div
              className={`text-xs text-gray-500 mt-1 ${
                isOwn ? 'text-right' : 'text-left'
              }`}
            >
              {formatTime(message.createdAt)}
              {isOwn && message.isRead && (
                <span className="ml-1 text-blue-500">✓✓</span>
              )}
              {isOwn && !message.isRead && <span className="ml-1">✓</span>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải cuộc trò chuyện...</p>
        </div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy người dùng
        </h3>
        <Link to="/messages">
          <Button>Quay lại tin nhắn</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/messages">
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
                className="mr-4"
              >
                Quay lại
              </Button>
            </Link>

            <div className="flex items-center">
              <Avatar
                src={participant.avatarUrl}
                alt={`${participant.firstName} ${participant.lastName}`}
                size="md"
                online={isUserOnline()}
              />

              <div className="ml-3">
                <h1 className="font-semibold text-gray-900">
                  {participant.firstName} {participant.lastName}
                </h1>
                <div className="flex items-center space-x-2">
                  {participant.role === 'ARTISAN' && (
                    <Badge variant="primary" size="sm">
                      Nghệ nhân
                    </Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {isUserOnline()
                      ? 'Đang hoạt động'
                      : participant.lastSeenAt
                      ? `Hoạt động ${formatRelativeTime(
                          participant.lastSeenAt,
                        )}`
                      : 'Không rõ'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" disabled>
              <PhoneIcon className="w-4 h-4" />
            </Button>

            <Link to={`/profile/${participant.id}`}>
              <Button variant="ghost" size="sm">
                <InformationCircleIcon className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-gray-50"
      >
        {hasMore && (
          <div className="text-center mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMoreMessages}
              loading={loadingMore}
              disabled={loadingMore}
            >
              {loadingMore ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}
            </Button>
          </div>
        )}

        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Avatar
                src={participant.avatarUrl}
                alt={`${participant.firstName} ${participant.lastName}`}
                size="xl"
              />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bắt đầu cuộc trò chuyện
            </h3>
            <p className="text-gray-500">
              Gửi tin nhắn đầu tiên cho {participant.firstName}
            </p>
          </div>
        ) : (
          <div>
            {messages.map(renderMessage)}

            {/* Typing indicator */}
            {participantTyping && (
              <div className="flex justify-start mb-4">
                <div className="mr-3">
                  <Avatar
                    src={participant.avatarUrl}
                    alt={`${participant.firstName} ${participant.lastName}`}
                    size="sm"
                  />
                </div>
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex space-x-2">
            <Button type="button" variant="ghost" size="sm" disabled>
              <PhotoIcon className="w-5 h-5" />
            </Button>

            {/* Custom Order Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowCustomOrderForm(true)}
              title="Tạo đề xuất custom order"
            >
              <WrenchScrewdriverIcon className="w-5 h-5" />
            </Button>

            <Button type="button" variant="ghost" size="sm" disabled>
              <PlusIcon className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1">
            <textarea
              name="content"
              rows={1}
              className="block w-full rounded-lg border-gray-300 resize-none focus:border-primary focus:ring-primary"
              placeholder="Nhập tin nhắn..."
              value={values.content}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              style={{
                minHeight: '40px',
                maxHeight: '120px',
                resize: 'none',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 120) + 'px';
              }}
            />
          </div>

          <Button
            type="submit"
            disabled={!values.content.trim() || sending}
            loading={sending}
            leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
          >
            Gửi
          </Button>
        </form>
      </div>

      {/* Custom Order Proposal Form */}
      <CustomOrderProposalForm
        isOpen={showCustomOrderForm}
        onClose={() => setShowCustomOrderForm(false)}
        onSubmit={handleSendCustomOrder}
        loading={customOrderLoading}
      />
    </div>
  );
};
