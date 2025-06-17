import { useState, useEffect, useRef, useCallback } from 'react';
import { messageService } from '../../services/message.service';
import { userService } from '../../services/user.service';
import { MessageWithUsers, MessageType } from '../../types/message';
import { User } from '../../types/auth';
import { useAuth } from '../../contexts/AuthContext';
import { useSocketContext } from '../../contexts/SocketContext';
import { useToastContext } from '../../contexts/ToastContext';

export const useConversation = (userId: string) => {
  const { state } = useAuth();
  const { socket } = useSocketContext();
  const { error: showError, success: showSuccess } = useToastContext();

  const [messages, setMessages] = useState<MessageWithUsers[]>([]);
  const [participant, setParticipant] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [participantTyping, setParticipantTyping] = useState(false);

  const typingTimeoutRef = useRef<number>();

  // Load conversation
  const loadConversation = useCallback(
    async (pageNum = 1) => {
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
    },
    [userId, showError],
  );

  // Load participant info
  const loadParticipant = useCallback(async () => {
    if (!userId) return;

    try {
      const user = await userService.getUserProfile(userId);
      setParticipant(user);
    } catch (error: any) {
      console.error('Error loading participant:', error);
      showError('Không thể tải thông tin người dùng');
    }
  }, [userId, showError]);

  // Send message
  const sendMessage = useCallback(
    async (
      content: string,
      type: MessageType = MessageType.TEXT,
      productMentions?: any,
    ) => {
      if (!userId || !content.trim()) return;

      setSending(true);
      try {
        const newMessage = await messageService.sendMessage({
          receiverId: userId,
          content: content.trim(),
          type,
          productMentions,
        });

        // Add to messages immediately for better UX
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        // Stop typing indicator
        if (isTyping && socket) {
          setIsTyping(false);
          socket.emit('typing', {
            roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
            isTyping: false,
          });
        }

        return newMessage;
      } catch (error: any) {
        console.error('Error sending message:', error);
        showError(error.message || 'Không thể gửi tin nhắn');
        throw error;
      } finally {
        setSending(false);
      }
    },
    [userId, isTyping, socket, state.user?.id, showError],
  );

  // Load more messages
  const loadMoreMessages = useCallback(async () => {
    if (hasMore && !loadingMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      await loadConversation(nextPage);
    }
  }, [hasMore, loadingMore, page, loadConversation]);

  // Handle typing
  const handleTypingStart = useCallback(() => {
    if (!socket || !userId || isTyping) return;

    setIsTyping(true);
    socket.emit('typing', {
      roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
      isTyping: true,
    });
  }, [socket, userId, isTyping, state.user?.id]);

  const handleTypingStop = useCallback(() => {
    if (!socket || !userId || !isTyping) return;

    setIsTyping(false);
    socket.emit('typing', {
      roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
      isTyping: false,
    });
  }, [socket, userId, isTyping, state.user?.id]);

  const handleTyping = useCallback(
    (content: string) => {
      if (content && !isTyping) {
        handleTypingStart();
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        handleTypingStop();
      }, 2000);
    },
    [isTyping, handleTypingStart, handleTypingStop],
  );

  // Socket handlers
  useEffect(() => {
    if (!socket || !userId) return;

    // Join conversation room
    socket.emit('join-chat', {
      roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
    });

    const handleNewMessage = (message: MessageWithUsers) => {
      if (
        (message.senderId === userId &&
          message.receiverId === state.user?.id) ||
        (message.senderId === state.user?.id && message.receiverId === userId)
      ) {
        setMessages((prev) => {
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

  // Initial load
  useEffect(() => {
    if (userId) {
      loadConversation();
      loadParticipant();
    }
  }, [userId, loadConversation, loadParticipant]);

  return {
    messages,
    participant,
    loading,
    sending,
    hasMore,
    loadingMore,
    isTyping,
    participantTyping,
    sendMessage,
    loadMoreMessages,
    handleTyping,
    refreshConversation: () => loadConversation(1),
  };
};
