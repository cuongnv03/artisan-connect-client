import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PaperAirplaneIcon,
  PhotoIcon,
  PlusIcon,
  EllipsisVerticalIcon,
  PhoneIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { messageService } from '../../services/message.service';
import { userService } from '../../services/user.service';
import { Message, MessageType } from '../../types/message';
import { User } from '../../types/auth';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useForm } from '../../hooks/useForm';

interface MessageFormData {
  content: string;
}

export const ConversationPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { state } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    if (!userId) return;

    try {
      const result = await messageService.getConversationMessages(userId, {
        page,
        limit: 50,
        sortOrder: 'desc',
      });

      if (page === 1) {
        setMessages(result.data.reverse());
      } else {
        setMessages((prev) => [...result.data.reverse(), ...prev]);
      }

      setHasMore(page < result.meta.totalPages);

      // Mark as read
      await messageService.markConversationAsRead(userId);
    } catch (error) {
      console.error('Error loading conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadParticipant = async () => {
    if (!userId) return;

    try {
      const user = await userService.getUserProfile(userId);
      setParticipant(user);
    } catch (error) {
      console.error('Error loading participant:', error);
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

      setMessages((prev) => [...prev, newMessage]);
      resetForm();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: string) => {
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
            <div
              className={`px-4 py-2 rounded-lg ${
                isOwn ? 'bg-accent text-white' : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.type === MessageType.IMAGE ? (
                <div>
                  <img
                    src={message.metadata?.url}
                    alt="Shared image"
                    className="rounded-lg max-w-full h-auto"
                  />
                  {message.content && <p className="mt-2">{message.content}</p>}
                </div>
              ) : message.type === MessageType.CUSTOM_ORDER ? (
                <div>
                  <div className="flex items-center mb-2">
                    <InformationCircleIcon className="w-4 h-4 mr-2" />
                    <span className="font-medium">Yêu cầu đặt hàng</span>
                  </div>
                  <p>{message.content}</p>
                  {message.metadata && (
                    <div className="mt-2 p-2 bg-black bg-opacity-10 rounded">
                      <p className="text-sm">
                        {message.metadata.productName} -{' '}
                        {message.metadata.price}₫
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
            </div>

            <div
              className={`text-xs text-gray-500 mt-1 ${
                isOwn ? 'text-right' : 'text-left'
              }`}
            >
              {formatTime(message.createdAt)}
              {isOwn && message.isRead && <span className="ml-1">✓✓</span>}
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
    <div className="max-w-7xl mx-auto h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
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
                online={
                  participant.lastSeenAt
                    ? new Date().getTime() -
                        new Date(participant.lastSeenAt).getTime() <
                      5 * 60 * 1000
                    : false
                }
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
                    {participant.lastSeenAt
                      ? new Date().getTime() -
                          new Date(participant.lastSeenAt).getTime() <
                        5 * 60 * 1000
                        ? 'Đang hoạt động'
                        : `Hoạt động ${new Date(
                            participant.lastSeenAt,
                          ).toLocaleString('vi-VN')}`
                      : 'Không rõ'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
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
              onClick={() => {
                setPage((prev) => prev + 1);
                loadConversation();
              }}
            >
              Tải tin nhắn cũ hơn
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
          <div>{messages.map(renderMessage)}</div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3">
          <div className="flex space-x-2">
            <Button type="button" variant="ghost" size="sm" disabled>
              <PhotoIcon className="w-5 h-5" />
            </Button>

            <Button type="button" variant="ghost" size="sm" disabled>
              <PlusIcon className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex-1">
            <textarea
              name="content"
              rows={1}
              className="block w-full rounded-lg border-gray-300 resize-none focus:border-accent focus:ring-accent"
              placeholder="Nhập tin nhắn..."
              value={values.content}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              style={{ minHeight: '40px', maxHeight: '120px' }}
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
    </div>
  );
};
