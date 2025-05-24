import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Message,
  Conversation,
  SendMessageRequest,
  MessageType,
} from '../types/message';
import { PaginatedResponse } from '../types/common';

export interface GetMessagesQuery {
  page?: number;
  limit?: number;
  type?: MessageType;
  isRead?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SendMediaMessageRequest {
  receiverId: string;
  mediaUrl: string;
  mediaType: string;
  caption?: string;
}

export interface SendQuoteMessageRequest {
  receiverId: string;
  quoteId: string;
  message: string;
}

export interface SendCustomOrderRequest {
  receiverId: string;
  type: 'proposal' | 'response' | 'message';
  content: string;
  orderData?: {
    productName: string;
    description: string;
    price: number;
    quantity: number;
    specifications?: string;
  };
}

export interface UpdateCustomOrderProposalRequest {
  content: string;
  orderData: {
    productName: string;
    description: string;
    price: number;
    quantity: number;
    specifications?: string;
  };
}

export interface CancelNegotiationRequest {
  reason: string;
}

export const messageService = {
  // Core messaging
  async sendMessage(data: SendMessageRequest): Promise<Message> {
    return await apiClient.post<Message>(API_ENDPOINTS.MESSAGES.BASE, data);
  },

  async getConversations(): Promise<Conversation[]> {
    return await apiClient.get<Conversation[]>(
      API_ENDPOINTS.MESSAGES.CONVERSATIONS,
    );
  },

  async getMessages(
    query: GetMessagesQuery = {},
  ): Promise<PaginatedResponse<Message>> {
    return await apiClient.get<PaginatedResponse<Message>>(
      API_ENDPOINTS.MESSAGES.BASE,
      query,
    );
  },

  async getConversationMessages(
    userId: string,
    query: GetMessagesQuery = {},
  ): Promise<PaginatedResponse<Message>> {
    return await apiClient.get<PaginatedResponse<Message>>(
      API_ENDPOINTS.MESSAGES.CONVERSATION(userId),
      query,
    );
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return await apiClient.get<{ count: number }>(
      API_ENDPOINTS.MESSAGES.UNREAD_COUNT,
    );
  },

  // Message management
  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(API_ENDPOINTS.MESSAGES.MARK_READ(id));
  },

  async markConversationAsRead(userId: string): Promise<void> {
    await apiClient.patch(
      API_ENDPOINTS.MESSAGES.MARK_CONVERSATION_READ(userId),
    );
  },

  async deleteMessage(id: string): Promise<void> {
    await apiClient.delete(`${API_ENDPOINTS.MESSAGES.BASE}/${id}`);
  },

  // Media messaging
  async sendMediaMessage(data: SendMediaMessageRequest): Promise<Message> {
    return await apiClient.post<Message>(API_ENDPOINTS.MESSAGES.MEDIA, data);
  },

  // Quote integration
  async sendQuoteMessage(data: SendQuoteMessageRequest): Promise<Message> {
    return await apiClient.post<Message>(
      API_ENDPOINTS.MESSAGES.QUOTE_DISCUSSION,
      data,
    );
  },

  // Custom order negotiation
  async sendCustomOrder(data: SendCustomOrderRequest): Promise<Message> {
    return await apiClient.post<Message>(
      API_ENDPOINTS.MESSAGES.CUSTOM_ORDER,
      data,
    );
  },

  async getActiveNegotiations(): Promise<any[]> {
    return await apiClient.get<any[]>(API_ENDPOINTS.MESSAGES.NEGOTIATIONS);
  },

  async getNegotiationHistory(negotiationId: string): Promise<any[]> {
    return await apiClient.get<any[]>(
      API_ENDPOINTS.MESSAGES.NEGOTIATION_HISTORY(negotiationId),
    );
  },

  async updateCustomOrderProposal(
    negotiationId: string,
    data: UpdateCustomOrderProposalRequest,
  ): Promise<any> {
    return await apiClient.patch<any>(
      API_ENDPOINTS.MESSAGES.UPDATE_PROPOSAL(negotiationId),
      data,
    );
  },

  async cancelNegotiation(
    negotiationId: string,
    data: CancelNegotiationRequest,
  ): Promise<any> {
    return await apiClient.post<any>(
      API_ENDPOINTS.MESSAGES.CANCEL_NEGOTIATION(negotiationId),
      data,
    );
  },
};
