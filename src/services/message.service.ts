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
  // ===== EXISTING METHODS =====
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

  // ===== FIXED: CUSTOM ORDER INTEGRATION =====

  async sendCustomOrderMessage(
    data: SendCustomOrderRequest,
  ): Promise<MessageWithUsers> {
    return await apiClient.post<MessageWithUsers>(
      API_ENDPOINTS.MESSAGES.CUSTOM_ORDER,
      data,
    );
  },

  // ===== NEW: SIMPLIFIED CUSTOM ORDER FLOW METHODS =====

  // Customer creates custom order via chat
  async createCustomOrderInChat(data: {
    receiverId: string;
    content: string;
    customOrderData: {
      title: string;
      description: string;
      estimatedPrice?: number;
      customerBudget?: number;
      timeline?: string;
      specifications?: any;
      attachments?: string[];
      referenceProductId?: string;
      expiresInDays?: number;
    };
  }): Promise<MessageWithUsers> {
    return await this.sendCustomOrderMessage({
      type: 'create_custom_order',
      receiverId: data.receiverId,
      content: data.content,
      customOrderData: data.customOrderData,
    });
  },

  // Send existing custom order card to chat
  async sendExistingCustomOrderCard(data: {
    receiverId: string;
    content: string;
    customOrderId: string;
  }): Promise<MessageWithUsers> {
    return await this.sendCustomOrderMessage({
      type: 'send_existing_custom_order',
      receiverId: data.receiverId,
      content: data.content,
      quoteRequestId: data.customOrderId,
    });
  },

  // Artisan responds to custom order via chat
  async respondToCustomOrderInChat(data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
    response: {
      action: 'ACCEPT' | 'REJECT' | 'COUNTER_OFFER';
      finalPrice?: number;
      data?: any;
      expiresInDays?: number;
    };
  }): Promise<MessageWithUsers> {
    return await this.sendCustomOrderMessage({
      type: 'respond_custom_order',
      receiverId: data.receiverId,
      content: data.content,
      quoteRequestId: data.quoteRequestId,
      response: data.response,
    });
  },

  // Customer counter offer via chat
  async customerCounterOfferInChat(data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
    counterOffer: {
      finalPrice: number;
      timeline?: string;
      data?: any;
      expiresInDays?: number;
    };
  }): Promise<MessageWithUsers> {
    return await this.sendCustomOrderMessage({
      type: 'customer_counter_offer',
      receiverId: data.receiverId,
      content: data.content,
      quoteRequestId: data.quoteRequestId,
      counterOffer: data.counterOffer,
    });
  },

  // Customer accept offer via chat
  async customerAcceptOfferInChat(data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
  }): Promise<MessageWithUsers> {
    return await this.sendCustomOrderMessage({
      type: 'customer_accept_offer',
      receiverId: data.receiverId,
      content: data.content,
      quoteRequestId: data.quoteRequestId,
    });
  },

  // Customer reject offer via chat
  async customerRejectOfferInChat(data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
    rejectOffer?: {
      reason?: string;
    };
  }): Promise<MessageWithUsers> {
    return await this.sendCustomOrderMessage({
      type: 'customer_reject_offer',
      receiverId: data.receiverId,
      content: data.content,
      quoteRequestId: data.quoteRequestId,
      rejectOffer: data.rejectOffer,
    });
  },

  // Continue quote discussion
  async sendQuoteDiscussionMessage(data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
  }): Promise<MessageWithUsers> {
    return await this.sendCustomOrderMessage({
      type: 'quote_discussion',
      receiverId: data.receiverId,
      content: data.content,
      quoteRequestId: data.quoteRequestId,
    });
  },

  // ===== MEDIA MESSAGING =====

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

  // ===== HELPER METHODS FOR UI =====

  // Check if message is custom order related
  isCustomOrderMessage(message: MessageWithUsers): boolean {
    return message.type === 'CUSTOM_ORDER';
  },

  // Get custom order context from message
  getCustomOrderContext(message: MessageWithUsers) {
    if (!this.isCustomOrderMessage(message) || !message.productMentions) {
      return null;
    }

    return {
      type: message.productMentions.type,
      quoteRequestId:
        message.productMentions.quoteRequestId || message.quoteRequestId,
      action: message.productMentions.action,
      finalPrice: message.productMentions.finalPrice,
      customOrderData: message.productMentions.customOrderData,
      negotiationId: message.productMentions.negotiationId,
      status: message.productMentions.status,
      lastActor: message.productMentions.lastActor,
      proposal: message.productMentions.proposal,
    };
  },

  // Format message for display
  formatMessageForDisplay(message: MessageWithUsers) {
    const context = this.getCustomOrderContext(message);

    if (!context) {
      return {
        content: message.content,
        type: message.type,
        isCustomOrder: false,
      };
    }

    let actionText = '';
    switch (context.action) {
      case 'ACCEPT':
        actionText = '✅ Đã chấp nhận yêu cầu custom order';
        break;
      case 'REJECT':
        actionText = '❌ Đã từ chối yêu cầu custom order';
        break;
      case 'COUNTER_OFFER':
        actionText = `💰 Đề xuất ngược: ${context.finalPrice?.toLocaleString()}đ`;
        break;
      case 'CUSTOMER_COUNTER_OFFER':
        actionText = `💰 Đề xuất ngược từ khách hàng: ${context.finalPrice?.toLocaleString()}đ`;
        break;
      case 'CUSTOMER_ACCEPT':
        actionText = '✅ Khách hàng đã chấp nhận đề xuất';
        break;
      case 'CUSTOMER_REJECT':
        actionText = '❌ Khách hàng đã từ chối đề xuất';
        break;
      default:
        actionText =
          context.type === 'custom_order_creation'
            ? '📋 Yêu cầu custom order mới'
            : '🔄 Cập nhật custom order';
    }

    return {
      content: message.content,
      type: message.type,
      isCustomOrder: true,
      actionText,
      context,
    };
  },
};
