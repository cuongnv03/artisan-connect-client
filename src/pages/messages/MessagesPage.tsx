import React from 'react';
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBox } from '../../components/common/SearchBox';
import { ConversationItem } from '../../components/messages/ConversationItem';
import { useConversations } from '../../hooks/messages/useConversations';

export const MessagesPage: React.FC = () => {
  const { state } = useAuth();
  const { onlineUsers } = useSocketContext();
  const {
    conversations,
    loading,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    totalUnread,
    handleMarkAsRead,
    handleMarkAllAsRead,
    refreshConversations,
  } = useConversations();

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

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

          <Button variant="ghost" onClick={refreshConversations}>
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
              onSubmit={() => {}}
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
      {conversations.length === 0 ? (
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
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.participantId}
              conversation={conversation}
              isOnline={isUserOnline(conversation.participantId)}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
};
