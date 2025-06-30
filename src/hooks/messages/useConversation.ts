import { useState, useEffect, useRef, useCallback } from 'react';
import { messageService } from '../../services/message.service';
import {
  MessageWithUsers,
  MessageType,
  SendMessageRequest,
} from '../../types/message';
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
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [participantTyping, setParticipantTyping] = useState(false);

  const typingTimeoutRef = useRef<number>();
  const pendingMessagesRef = useRef<Map<string, MessageWithUsers>>(new Map());

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
      const conversations = await messageService.getConversations();
      const conversation = conversations.find(
        (conv) => conv.participantId === userId,
      );

      if (conversation) {
        const participantUser: User = {
          id: conversation.participant.id,
          username: conversation.participant.username,
          firstName: conversation.participant.firstName,
          lastName: conversation.participant.lastName,
          avatarUrl: conversation.participant.avatarUrl,
          role: conversation.participant.role as any,
          lastSeenAt: conversation.participant.lastSeenAt,
          email: '',
          status: 'ACTIVE' as any,
          bio: null,
          isVerified: false,
          emailVerified: false,
          phone: null,
          followerCount: 0,
          followingCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setParticipant(participantUser);
      }
    } catch (error: any) {
      console.error('Error loading participant:', error);
    }
  }, [userId]);

  // Extract participant info from messages if not found in conversations
  useEffect(() => {
    if (!participant && messages.length > 0) {
      const firstMessage = messages[0];
      let participantInfo;

      if (firstMessage.senderId === userId) {
        participantInfo = firstMessage.sender;
      } else if (firstMessage.receiverId === userId) {
        participantInfo = firstMessage.receiver;
      }

      if (participantInfo) {
        const participantUser: User = {
          id: participantInfo.id,
          username: participantInfo.username,
          firstName: participantInfo.firstName,
          lastName: participantInfo.lastName,
          avatarUrl: participantInfo.avatarUrl,
          role: participantInfo.role as any,
          lastSeenAt: participantInfo.lastSeenAt,
          email: '',
          status: 'ACTIVE' as any,
          bio: null,
          isVerified: false,
          emailVerified: false,
          phone: null,
          followerCount: 0,
          followingCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setParticipant(participantUser);
      }
    }
  }, [participant, messages, userId]);

  // ENHANCED: Create optimistic message for immediate UI update
  const createOptimisticMessage = useCallback(
    (messageData: SendMessageRequest): MessageWithUsers => {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const currentUser = state.user!;

      return {
        id: tempId,
        senderId: currentUser.id,
        receiverId: messageData.receiverId,
        content: messageData.content,
        type: messageData.type || MessageType.TEXT,
        attachments: messageData.attachments || [],
        quoteRequestId: messageData.quoteRequestId,
        productMentions: messageData.productMentions,
        isRead: false,
        readAt: null,
        isEdited: false,
        editedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        sender: {
          id: currentUser.id,
          username: currentUser.username,
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          avatarUrl: currentUser.avatarUrl,
          role: currentUser.role,
          lastSeenAt: currentUser.lastSeenAt,
        },
        receiver: participant
          ? {
              id: participant.id,
              username: participant.username,
              firstName: participant.firstName,
              lastName: participant.lastName,
              avatarUrl: participant.avatarUrl,
              role: participant.role,
              lastSeenAt: participant.lastSeenAt,
            }
          : {
              id: userId,
              username: '',
              firstName: 'Loading',
              lastName: '...',
              avatarUrl: undefined,
              role: 'CUSTOMER',
              lastSeenAt: undefined,
            },
      };
    },
    [state.user, participant, userId],
  );

  // ENHANCED: Universal send message method
  const sendMessage = useCallback(
    async (
      messageData: SendMessageRequest,
      skipOptimistic = false,
    ): Promise<MessageWithUsers | null> => {
      if (!userId || !messageData.content.trim()) return null;

      // Determine loading state based on message type
      if (
        messageData.type === MessageType.IMAGE ||
        messageData.type === MessageType.FILE
      ) {
        setUploadingMedia(true);
      } else {
        setSending(true);
      }

      let optimisticMessage: MessageWithUsers | null = null;

      try {
        // Create optimistic message for immediate UI feedback (except for uploads which handle their own loading)
        if (!skipOptimistic) {
          optimisticMessage = createOptimisticMessage(messageData);

          // Add optimistic message to UI immediately
          setMessages((prev) => [...prev, optimisticMessage!]);
          pendingMessagesRef.current.set(
            optimisticMessage.id,
            optimisticMessage,
          );
        }

        // Send message to server
        const sentMessage = await messageService.sendMessage(messageData);

        // Replace optimistic message with real message
        if (optimisticMessage) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === optimisticMessage!.id ? sentMessage : msg,
            ),
          );
          pendingMessagesRef.current.delete(optimisticMessage.id);
        } else {
          // Add message if no optimistic update was made
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === sentMessage.id)) {
              return prev;
            }
            return [...prev, sentMessage];
          });
        }

        // Stop typing indicator
        if (isTyping && socket && messageData.type === MessageType.TEXT) {
          setIsTyping(false);
          socket.emit('typing', {
            roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
            isTyping: false,
          });
        }

        return sentMessage;
      } catch (error: any) {
        console.error('Error sending message:', error);

        // Remove optimistic message on error
        if (optimisticMessage) {
          setMessages((prev) =>
            prev.filter((msg) => msg.id !== optimisticMessage!.id),
          );
          pendingMessagesRef.current.delete(optimisticMessage.id);
        }

        showError(error.message || 'Không thể gửi tin nhắn');
        throw error;
      } finally {
        setSending(false);
        setUploadingMedia(false);
      }
    },
    [
      userId,
      isTyping,
      socket,
      state.user?.id,
      showError,
      createOptimisticMessage,
    ],
  );

  // ENHANCED: Send text message
  const sendTextMessage = useCallback(
    async (content: string) => {
      return sendMessage({
        receiverId: userId,
        content: content.trim(),
        type: MessageType.TEXT,
      });
    },
    [sendMessage, userId],
  );

  // ENHANCED: Send media message with optimistic updates
  const sendMediaMessage = useCallback(
    async (
      file: File,
      type: 'image' | 'file',
      onProgress?: (progress: number) => void,
    ): Promise<MessageWithUsers | null> => {
      if (!userId) return null;

      try {
        setUploadingMedia(true);

        // Create optimistic message with loading state
        const loadingContent =
          type === 'image'
            ? '📷 Đang tải hình ảnh...'
            : `📄 Đang tải tài liệu: ${file.name}`;

        const optimisticMessage = createOptimisticMessage({
          receiverId: userId,
          content: loadingContent,
          type: type === 'image' ? MessageType.IMAGE : MessageType.FILE,
          attachments: [], // Will be updated when upload completes
          productMentions: {
            originalFileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploading: true,
          },
        });

        // Add optimistic message
        setMessages((prev) => [...prev, optimisticMessage]);
        pendingMessagesRef.current.set(optimisticMessage.id, optimisticMessage);

        // Validate file
        const validation =
          type === 'image'
            ? messageService.validateImageFile?.(file) || { valid: true }
            : messageService.validateFileUpload?.(file) || { valid: true };

        if (!validation.valid) {
          throw new Error(validation.error || 'File không hợp lệ');
        }

        // Upload file with progress
        const { uploadService } = await import('../../services/upload.service');
        const uploadResult = await uploadService.uploadImage(file, {
          folder: 'messages',
        });

        onProgress?.(100);

        // Prepare final message data
        const finalContent =
          type === 'image' ? '📷 Hình ảnh' : `📄 ${file.name}`;

        const messageData: SendMessageRequest = {
          receiverId: userId,
          content: finalContent,
          type: type === 'image' ? MessageType.IMAGE : MessageType.FILE,
          attachments: [uploadResult.url],
          productMentions: {
            originalFileName: file.name,
            fileSize: file.size,
            fileType: file.type,
          },
        };

        // Send message to server (skip optimistic update since we already have one)
        const sentMessage = await messageService.sendMessage(messageData);

        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? sentMessage : msg,
          ),
        );
        pendingMessagesRef.current.delete(optimisticMessage.id);

        showSuccess(
          `${type === 'image' ? 'Hình ảnh' : 'Tài liệu'} đã được gửi`,
        );
        return sentMessage;
      } catch (error: any) {
        // Remove optimistic message on error
        setMessages((prev) =>
          prev.filter((msg) => !msg.id.startsWith('temp-')),
        );

        showError(
          error.message ||
            `Không thể gửi ${type === 'image' ? 'hình ảnh' : 'tài liệu'}`,
        );
        throw error;
      } finally {
        setUploadingMedia(false);
      }
    },
    [userId, createOptimisticMessage, showError, showSuccess],
  );

  // ENHANCED: Send custom order message with optimistic updates
  const sendCustomOrderMessage = useCallback(
    async (customOrderData: any): Promise<MessageWithUsers | null> => {
      if (!userId) return null;

      try {
        setSending(true);

        // Create optimistic message
        const optimisticMessage = createOptimisticMessage({
          receiverId: userId,
          content: `🛠️ Đang tạo custom order: "${customOrderData.title}"`,
          type: MessageType.CUSTOM_ORDER,
          productMentions: {
            type: 'create_custom_order',
            proposal: customOrderData,
            status: 'PENDING',
            creating: true,
          },
        });

        // Add optimistic message
        setMessages((prev) => [...prev, optimisticMessage]);
        pendingMessagesRef.current.set(optimisticMessage.id, optimisticMessage);

        // Send custom order message via service
        const { messageService: ms } = await import(
          '../../services/message.service'
        );
        const sentMessage = await ms.createCustomOrderInChat({
          receiverId: userId,
          content: `🛠️ Tôi có một đề xuất custom order: "${customOrderData.title}"`,
          customOrderData,
        });

        // Replace optimistic message with real message
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id ? sentMessage : msg,
          ),
        );
        pendingMessagesRef.current.delete(optimisticMessage.id);

        showSuccess('Đã gửi yêu cầu custom order');
        return sentMessage;
      } catch (error: any) {
        // Remove optimistic message on error
        setMessages((prev) =>
          prev.filter((msg) => !msg.id.startsWith('temp-')),
        );

        showError(error.message || 'Không thể gửi yêu cầu custom order');
        throw error;
      } finally {
        setSending(false);
      }
    },
    [userId, createOptimisticMessage, showError, showSuccess],
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

  // Socket handlers with improved duplicate detection
  useEffect(() => {
    if (!socket || !userId) return;

    // Join conversation room
    socket.emit('join-chat', {
      roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
    });

    const handleNewMessage = (message: MessageWithUsers) => {
      // Skip if this is our own message that we already have optimistically
      if (
        message.senderId === state.user?.id &&
        pendingMessagesRef.current.has(message.id)
      ) {
        return;
      }

      if (
        (message.senderId === userId &&
          message.receiverId === state.user?.id) ||
        (message.senderId === state.user?.id && message.receiverId === userId)
      ) {
        setMessages((prev) => {
          // Check for duplicates more thoroughly
          if (
            prev.some(
              (msg) =>
                msg.id === message.id ||
                (msg.content === message.content &&
                  msg.senderId === message.senderId &&
                  Math.abs(
                    new Date(msg.createdAt).getTime() -
                      new Date(message.createdAt).getTime(),
                  ) < 1000),
            )
          ) {
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

    // Enhanced error handling
    const handleMessageError = (data: {
      tempId?: string;
      error: string;
      type: string;
    }) => {
      if (data.tempId && pendingMessagesRef.current.has(data.tempId)) {
        // Remove failed optimistic message
        setMessages((prev) => prev.filter((msg) => msg.id !== data.tempId));
        pendingMessagesRef.current.delete(data.tempId);
        showError(data.error || 'Không thể gửi tin nhắn');
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('message-read-update', handleMessageRead);
    socket.on('typing-status', handleTypingStatus);
    socket.on('message-error', handleMessageError);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('message-read-update', handleMessageRead);
      socket.off('typing-status', handleTypingStatus);
      socket.off('message-error', handleMessageError);

      // Leave conversation room
      socket.emit('leave-chat', {
        roomId: `conversation:${[state.user?.id, userId].sort().join(':')}`,
      });
    };
  }, [socket, userId, state.user?.id, showError]);

  // Initial load
  useEffect(() => {
    if (userId) {
      loadConversation();
      loadParticipant();
    }
  }, [userId, loadConversation, loadParticipant]);

  // Cleanup pending messages on unmount
  useEffect(() => {
    return () => {
      pendingMessagesRef.current.clear();
    };
  }, []);

  return {
    messages,
    participant,
    loading,
    sending,
    uploadingMedia,
    hasMore,
    loadingMore,
    isTyping,
    participantTyping,

    // Enhanced methods
    sendMessage,
    sendTextMessage,
    sendMediaMessage,
    sendCustomOrderMessage,
    loadMoreMessages,
    handleTyping,
    refreshConversation: () => loadConversation(1),
  };
};
