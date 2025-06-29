import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  ChatBubbleLeftRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { SearchBox } from '../../components/common/SearchBox';
import { ConversationItem } from '../../components/messages/ConversationItem';
import { ConversationView } from '../../components/messages/ConversationView';
import { useConversations } from '../../hooks/messages/useConversations';

export const MessagesPage: React.FC = () => {
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
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

  const selectedUserId = userId || null;

  const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
  };

  const handleConversationSelect = (targetUserId: string) => {
    // Update URL
    navigate(`/messages/${targetUserId}`);

    // Auto mark as read when conversation is selected
    const conversation = conversations.find(
      (conv) => conv.participantId === targetUserId,
    );
    if (conversation && conversation.unreadCount > 0) {
      handleMarkAsRead(targetUserId);
    }
  };

  const handleCloseConversation = () => {
    navigate('/messages');
  };

  // Validate that selected user exists in conversations
  const selectedConversation = selectedUserId
    ? conversations.find((conv) => conv.participantId === selectedUserId)
    : null;

  // If we have a userId in URL but no matching conversation, redirect to messages
  useEffect(() => {
    if (selectedUserId && conversations.length > 0 && !selectedConversation) {
      navigate('/messages');
    }
  }, [selectedUserId, conversations, selectedConversation, navigate]);

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
      {/* Header - Fixed */}
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

      {/* Main Content Container - Fixed height with scroll */}
      <div className="h-[calc(100vh-12rem)] flex bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Left Sidebar - Conversations List (1/3) */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Search and Filters - Fixed */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gray-50">
            <div className="space-y-3">
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={() => {}}
                placeholder="Tìm kiếm cuộc trò chuyện..."
                className="w-full"
              />

              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full rounded-lg border-gray-300 text-sm focus:border-primary focus:ring-primary"
              >
                <option value="all">Tất cả ({conversations.length})</option>
                <option value="unread">Chưa đọc ({totalUnread})</option>
              </select>
            </div>
          </div>

          {/* Conversations List - Scrollable */}
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <ChatBubbleLeftRightIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  {searchQuery
                    ? 'Không tìm thấy cuộc trò chuyện'
                    : 'Chưa có tin nhắn nào'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.participantId}
                    onClick={() =>
                      handleConversationSelect(conversation.participantId)
                    }
                    className={`cursor-pointer transition-colors duration-200 hover:bg-gray-50 ${
                      selectedUserId === conversation.participantId
                        ? 'bg-primary/5 border-r-2 border-r-primary'
                        : ''
                    }`}
                  >
                    <ConversationItem
                      conversation={conversation}
                      isOnline={isUserOnline(conversation.participantId)}
                      onMarkAsRead={handleMarkAsRead}
                      isSelected={selectedUserId === conversation.participantId}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Content - Conversation View (2/3) */}
        <div className="flex-1 flex flex-col">
          {selectedUserId && selectedConversation ? (
            <ConversationView
              userId={selectedUserId}
              onClose={handleCloseConversation}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Chọn một cuộc trò chuyện
                </h3>
                <p className="text-gray-500">
                  Chọn cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
