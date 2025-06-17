import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Message,
  MessageWithUsers,
  Conversation,
  SendMessageRequest,
  SendCustomOrderRequest,
  MessageQueryOptions,
} from '../types/message';
import { PaginatedResponse } from '../types/common';

export const messageService = {
  // Core messaging
  async sendMessage(data: SendMessageRequest): Promise<MessageWithUsers> {
    return await apiClient.post<MessageWithUsers>(
      API_ENDPOINTS.MESSAGES.BASE,
      data,
    );
  },

  async getConversations(): Promise<Conversation[]> {
    return await apiClient.get<Conversation[]>(
      API_ENDPOINTS.MESSAGES.CONVERSATIONS,
    );
  },

  async getMessages(
    options: MessageQueryOptions = {},
  ): Promise<PaginatedResponse<MessageWithUsers>> {
    return await apiClient.get<PaginatedResponse<MessageWithUsers>>(
      API_ENDPOINTS.MESSAGES.BASE,
      options,
    );
  },

  async getConversationMessages(
    userId: string,
    options: MessageQueryOptions = {},
  ): Promise<PaginatedResponse<MessageWithUsers>> {
    return await apiClient.get<PaginatedResponse<MessageWithUsers>>(
      API_ENDPOINTS.MESSAGES.CONVERSATION(userId),
      options,
    );
  },

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    return await apiClient.get<{ unreadCount: number }>(
      API_ENDPOINTS.MESSAGES.UNREAD_COUNT,
    );
  },

  // Message management
  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.MESSAGES.MARK_READ(id));
  },

  async markConversationAsRead(
    userId: string,
  ): Promise<{ markedCount: number }> {
    return await apiClient.patch<{ markedCount: number }>(
      API_ENDPOINTS.MESSAGES.MARK_CONVERSATION_READ(userId),
    );
  },

  async deleteMessage(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.MESSAGES.BASE}/${id}`);
  },

  // Custom Order Integration
  async sendCustomOrderMessage(
    data: SendCustomOrderRequest,
  ): Promise<MessageWithUsers> {
    return await apiClient.post<MessageWithUsers>(
      API_ENDPOINTS.MESSAGES.CUSTOM_ORDER,
      data,
    );
  },

  // Media messaging
  async sendMediaMessage(data: {
    receiverId: string;
    mediaUrl: string;
    mediaType: 'image' | 'file';
    content?: string;
    originalFileName?: string;
    fileSize?: number;
    fileType?: string;
  }): Promise<MessageWithUsers> {
    return await apiClient.post<MessageWithUsers>(API_ENDPOINTS.MESSAGES.BASE, {
      receiverId: data.receiverId,
      content: data.content || `Shared ${data.mediaType}`,
      type: data.mediaType === 'image' ? 'IMAGE' : 'FILE',
      attachments: [data.mediaUrl],
      productMentions: {
        originalFileName: data.originalFileName,
        fileSize: data.fileSize,
        fileType: data.fileType,
      },
    });
  },
};
