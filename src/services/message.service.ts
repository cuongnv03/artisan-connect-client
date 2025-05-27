import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Message,
  Conversation,
  SendMessageRequest,
  MessageType,
  MessageQueryOptions,
} from '../types/message';
import { PaginatedResponse } from '../types/common';

export interface SendMediaMessageRequest {
  receiverId: string;
  mediaUrl: string;
  mediaType: string;
  content?: string;
}

export interface SendQuoteMessageRequest {
  quoteId: string;
  content: string;
}

export interface SendCustomOrderRequest {
  type: 'proposal' | 'response' | 'simple_message';
  artisanId?: string;
  customerId?: string;
  originalMessageId?: string;
  receiverId?: string;
  content?: string;
  proposal?: {
    productName: string;
    description: string;
    estimatedPrice: number;
    estimatedDuration: string;
    specifications?: Record<string, string>;
    materials?: string[];
    dimensions?: string;
    colorPreferences?: string[];
    deadline?: Date;
  };
  response?: {
    accepted: boolean;
    message: string;
    counterOffer?: {
      price: number;
      duration: string;
      modifications: string;
      conditions?: string[];
    };
    canProceed?: boolean;
    requiresMoreInfo?: boolean;
    additionalQuestions?: string[];
  };
  orderData?: any;
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
    options: MessageQueryOptions = {},
  ): Promise<PaginatedResponse<Message>> {
    return await apiClient.get<PaginatedResponse<Message>>(
      API_ENDPOINTS.MESSAGES.BASE,
      options,
    );
  },

  async getConversationMessages(
    userId: string,
    options: MessageQueryOptions = {},
  ): Promise<PaginatedResponse<Message>> {
    return await apiClient.get<PaginatedResponse<Message>>(
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
    data: any,
  ): Promise<any> {
    return await apiClient.patch<any>(
      API_ENDPOINTS.MESSAGES.UPDATE_PROPOSAL(negotiationId),
      data,
    );
  },

  async cancelNegotiation(
    negotiationId: string,
    data: { reason?: string },
  ): Promise<any> {
    return await apiClient.post<any>(
      API_ENDPOINTS.MESSAGES.CANCEL_NEGOTIATION(negotiationId),
      data,
    );
  },
};
