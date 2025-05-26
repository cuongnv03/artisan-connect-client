import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  EllipsisVerticalIcon,
  CheckIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { useMessage } from '../../contexts/MessageContext';
import { messageService } from '../../services/message.service';
import { Conversation, Message } from '../../types/message';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBox } from '../../components/common/SearchBox';
import { Dropdown } from '../../components/ui/Dropdown';
import { useToastContext } from '../../contexts/ToastContext';

export const MessagesPage: React.FC = () => {
  const { state } = useAuth();
  const { socket, onlineUsers } = useSocketContext();
  const { markConversationAsRead, markAllAsRead } = useMessage();
  const { error: showError } = useToastContext();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadConversations();
  }, []);

  // Real-time message updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: Message) => {
      setConversations((prev) => {
        const updatedConversations = [...prev];
        const existingIndex = updatedConversations.findIndex(
          (conv) =>
            conv.participantId === message.senderId ||
            conv.participantId === message.receiverId,
        );

        const partnerId =
          message.senderId === state.user?.id
            ? message.receiverId
            : message.senderId;

        if (existingIndex >= 0) {
          // Update existing conversation
          updatedConversations[existingIndex] = {
            ...updatedConversations[existingIndex],
            lastMessage: message,
            lastActivity: message.createdAt,
            unreadCount:
              message.receiverId === state.user?.id
                ? updatedConversations[existingIndex].unreadCount + 1
                : updatedConversations[existingIndex].unreadCount,
          };

          // Move to top
          const updated = updatedConversations.splice(existingIndex, 1)[0];
          updatedConversations.unshift(updated);
        } else {
          // Add new conversation (this would need participant info)
          // For now, we'll refresh the conversations list
          loadConversations();
          return prev;
        }

        return updatedConversations;
      });
    };

    const handleMessageRead = (data: {
      conversationWith: string;
      readCount: number;
    }) => {
      if (data.conversationWith === state.user?.id) {
        setConversations((prev) =>
          prev.map((conv) =>
            conv.participantId === data.conversationWith
              ? {
                  ...conv,
                  unreadCount: Math.max(0, conv.unreadCount - data.readCount),
                }
              : conv,
          ),
        );
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('conversation-read', handleMessageRead);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('conversation-read', handleMessageRead);
    };
  }, [socket, state.user?.id]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const conversationsData = await messageService.getConversations();
      setConversations(conversationsData);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      showError(error.message || 'Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (userId: string) => {
    try {
      await markConversationAsRead(userId);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.participantId === userId ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    } catch (error: any) {
      console.error('Error marking as read:', error);
      showError('Không thể đánh dấu đã đọc');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setConversations((prev) =>
        prev.map((conv) => ({ ...conv, unreadCount: 0 })),
      );
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      showError('Không thể đánh dấu tất cả đã đọc');
    }
  };

  const formatTime = (date: string | Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return messageDate.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return messageDate.toLocaleDateString('vi-VN', { weekday: 'long' });
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  };

  const getLastMessagePreview = (conversation: Conversation) => {
    if (!conversation.lastMessage) return 'Chưa có tin nhắn';

    const { content, type, senderId } = conversation.lastMessage;
    const isOwn = senderId === state.user?.id;
    const prefix = isOwn ? 'Bạn: ' : '';

    switch (type) {
      case 'IMAGE':
        return `${prefix}📷 Đã gửi hình ảnh`;
      case 'CUSTOM_ORDER':
        return `${prefix}📝 Yêu cầu đặt hàng tùy chỉnh`;
      case 'QUOTE_DISCUSSION':
        return `${prefix}💬 Thảo luận báo giá`;
      default:
        return `${prefix}${content}`;
    }
  };

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch =
      conv.participant.firstName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conv.participant.lastName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      conv.participant.username
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFilter =
      filter === 'all' || (filter === 'unread' && conv.unreadCount > 0);

    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce(
    (sum, conv) => sum + conv.unreadCount,
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải tin nhắn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
          {totalUnread > 0 && (
            <p className="text-gray-600">{totalUnread} tin nhắn chưa đọc</p>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {totalUnread > 0 && (
            <Button
              variant="ghost"
              onClick={handleMarkAllAsRead}
              leftIcon={<CheckIcon className="w-4 h-4" />}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          )}

          <Button variant="ghost" onClick={loadConversations}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm kiếm cuộc trò chuyện..."
            />
          </div>

          <div className="flex space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border-gray-300 text-sm focus:border-primary focus:ring-primary"
            >
              <option value="all">Tất cả ({conversations.length})</option>
              <option value="unread">Chưa đọc ({totalUnread})</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <EmptyState
          icon={<ChatBubbleLeftRightIcon className="w-16 h-16" />}
          title={
            searchQuery
              ? 'Không tìm thấy cuộc trò chuyện'
              : 'Chưa có tin nhắn nào'
          }
          description={
            searchQuery
              ? 'Thử tìm kiếm với từ khóa khác'
              : 'Bắt đầu trò chuyện với nghệ nhân hoặc khách hàng'
          }
          action={
            !searchQuery
              ? {
                  label: 'Khám phá nghệ nhân',
                  onClick: () => (window.location.href = '/discover'),
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-2">
          {filteredConversations.map((conversation) => (
            <Link
              key={conversation.participantId}
              to={`/messages/${conversation.participantId}`}
              className="block"
            >
              <Card className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar
                      src={conversation.participant.avatarUrl}
                      alt={`${conversation.participant.firstName} ${conversation.participant.lastName}`}
                      size="lg"
                      online={isUserOnline(conversation.participantId)}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3
                        className={`font-medium truncate ${
                          conversation.unreadCount > 0
                            ? 'text-gray-900'
                            : 'text-gray-700'
                        }`}
                      >
                        {conversation.participant.firstName}{' '}
                        {conversation.participant.lastName}
                        {isUserOnline(conversation.participantId) && (
                          <span className="ml-2 inline-block w-2 h-2 bg-green-400 rounded-full"></span>
                        )}
                      </h3>

                      <div className="flex items-center space-x-2">
                        {conversation.lastActivity && (
                          <span className="text-sm text-gray-500">
                            {formatTime(conversation.lastActivity)}
                          </span>
                        )}

                        {conversation.unreadCount > 0 && (
                          <Badge variant="primary" size="sm">
                            {conversation.unreadCount > 99
                              ? '99+'
                              : conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p
                        className={`text-sm truncate flex-1 ${
                          conversation.unreadCount > 0
                            ? 'text-gray-900 font-medium'
                            : 'text-gray-500'
                        }`}
                      >
                        {getLastMessagePreview(conversation)}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center space-x-2 ml-4">
                        {conversation.participant.role === 'ARTISAN' && (
                          <Badge variant="primary" size="sm">
                            Nghệ nhân
                          </Badge>
                        )}

                        <Dropdown
                          trigger={
                            <button
                              className="p-1 text-gray-400 hover:text-gray-600"
                              onClick={(e) => e.preventDefault()}
                            >
                              <EllipsisVerticalIcon className="w-4 h-4" />
                            </button>
                          }
                          items={[
                            {
                              label: 'Đánh dấu đã đọc',
                              value: 'mark-read',
                              onClick: () =>
                                handleMarkAsRead(conversation.participantId),
                            },
                            {
                              label: 'Lưu trữ',
                              value: 'archive',
                              icon: <ArchiveBoxIcon className="w-4 h-4" />,
                              onClick: () =>
                                console.log('Archive conversation'),
                              disabled: true,
                            },
                          ]}
                          placement="bottom-end"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
