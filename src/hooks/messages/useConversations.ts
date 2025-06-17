import { useState, useEffect, useCallback } from 'react';
import { messageService } from '../../services/message.service';
import { Conversation, MessageWithUsers } from '../../types/message';
import { useAuth } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { useMessage } from '../../contexts/MessageContext';
import { useToastContext } from '../../contexts/ToastContext';

export const useConversations = () => {
  const { state } = useAuth();
  const { socket } = useSocketContext();
  const { markConversationAsRead, markAllAsRead } = useMessage();
  const { error: showError } = useToastContext();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const loadConversations = useCallback(async () => {
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
  }, [showError]);

  // Real-time message updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message: MessageWithUsers) => {
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
          // New conversation - refresh list
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
  }, [socket, state.user?.id, loadConversations]);

  const handleMarkAsRead = async (userId: string) => {
    try {
      await markConversationAsRead(userId);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.participantId === userId ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    } catch (error: any) {
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
      showError('Không thể đánh dấu tất cả đã đọc');
    }
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

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  return {
    conversations: filteredConversations,
    loading,
    searchQuery,
    setSearchQuery,
    filter,
    setFilter,
    totalUnread,
    handleMarkAsRead,
    handleMarkAllAsRead,
    refreshConversations: loadConversations,
  };
};
