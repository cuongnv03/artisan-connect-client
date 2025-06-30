import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { messageService } from '../../services/message.service';
import { customOrderService } from '../../services/custom-order.service';
import {
  CustomOrderChatData,
  CounterOfferRequest,
  AcceptOfferRequest,
  RejectOfferRequest,
} from '../../types/custom-order';
import { MessageWithUsers } from '../../types/message';

export const useCustomOrderChat = () => {
  const { state } = useAuth();
  const { success, error } = useToastContext();
  const [sending, setSending] = useState(false);

  /**
   * Create custom order via chat
   */
  const createCustomOrderInChat = async (data: {
    receiverId: string;
    content: string;
    customOrderData: CustomOrderChatData;
  }): Promise<MessageWithUsers | null> => {
    if (!state.user) {
      error('Bạn cần đăng nhập để thực hiện hành động này');
      return null;
    }

    setSending(true);
    try {
      // First create the actual custom order
      const customOrder = await customOrderService.createCustomOrder({
        artisanId: data.receiverId,
        title: data.customOrderData.title,
        description: data.customOrderData.description,
        estimatedPrice: data.customOrderData.estimatedPrice,
        customerBudget: data.customOrderData.customerBudget,
        timeline: data.customOrderData.timeline,
        specifications: data.customOrderData.specifications,
        attachmentUrls: data.customOrderData.attachments || [],
        referenceProductId: data.customOrderData.referenceProductId,
        expiresInDays: data.customOrderData.expiresInDays,
      });

      // Then send the custom order card to chat
      const message = await messageService.sendCustomOrderMessage({
        type: 'create_custom_order',
        receiverId: data.receiverId,
        content: `🛠️ Tôi có một đề xuất custom order: "${customOrder.title}"`,
        customOrderData: {
          negotiationId: customOrder.id,
          customerId: state.user.id,
          artisanId: data.receiverId,
          status: 'pending',
          proposal: {
            title: customOrder.title,
            description: customOrder.description,
            estimatedPrice: customOrder.estimatedPrice,
            timeline: customOrder.timeline,
            specifications: customOrder.specifications,
          },
          timestamp: new Date().toISOString(),
        },
      });

      success('Đã gửi yêu cầu custom order');
      return message;
    } catch (err: any) {
      error(err.message || 'Không thể gửi yêu cầu custom order');
      return null;
    } finally {
      setSending(false);
    }
  };

  /**
   * Artisan respond to custom order via chat
   */
  const respondToCustomOrderInChat = async (data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
    response: {
      action: 'ACCEPT' | 'REJECT' | 'COUNTER_OFFER';
      finalPrice?: number;
      data?: any;
      expiresInDays?: number;
    };
  }): Promise<MessageWithUsers | null> => {
    setSending(true);
    try {
      // First update the custom order in database
      const updatedOrder = await customOrderService.respondToCustomOrder(
        data.quoteRequestId,
        {
          action: data.response.action,
          finalPrice: data.response.finalPrice,
          response: data.response.data,
          expiresInDays: data.response.expiresInDays,
        },
      );

      // Then send the response card to chat
      const message = await messageService.sendCustomOrderMessage({
        type: 'respond_custom_order',
        receiverId: data.receiverId,
        content: data.content,
        quoteRequestId: data.quoteRequestId,
        response: data.response,
      });

      const actionMessages = {
        ACCEPT: 'Đã chấp nhận yêu cầu custom order',
        REJECT: 'Đã từ chối yêu cầu custom order',
        COUNTER_OFFER: 'Đã gửi đề xuất ngược',
      };

      success(actionMessages[data.response.action]);
      return message;
    } catch (err: any) {
      error(err.message || 'Không thể phản hồi yêu cầu custom order');
      return null;
    } finally {
      setSending(false);
    }
  };

  /**
   * Customer counter offer via chat
   */
  const customerCounterOfferInChat = async (data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
    counterOffer: {
      finalPrice: number;
      timeline?: string;
      data?: any;
      expiresInDays?: number;
    };
  }): Promise<MessageWithUsers | null> => {
    setSending(true);
    try {
      // First update the custom order in database
      const updatedOrder = await customOrderService.customerCounterOffer(
        data.quoteRequestId,
        {
          action: 'COUNTER_OFFER',
          finalPrice: data.counterOffer.finalPrice,
          timeline: data.counterOffer.timeline,
          message: data.counterOffer.data?.message,
          response: data.counterOffer.data,
          expiresInDays: data.counterOffer.expiresInDays,
        },
      );

      // Then send the counter offer card to chat
      const message = await messageService.sendCustomOrderMessage({
        type: 'customer_counter_offer',
        receiverId: data.receiverId,
        content: data.content,
        quoteRequestId: data.quoteRequestId,
        counterOffer: data.counterOffer,
      });

      success('Đã gửi đề xuất ngược');
      return message;
    } catch (err: any) {
      error(err.message || 'Không thể gửi đề xuất ngược');
      return null;
    } finally {
      setSending(false);
    }
  };

  /**
   * Customer accept offer via chat
   */
  const customerAcceptOfferInChat = async (data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
  }): Promise<MessageWithUsers | null> => {
    setSending(true);
    try {
      // First update the custom order in database
      const updatedOrder = await customOrderService.customerAcceptOffer(
        data.quoteRequestId,
        {
          action: 'ACCEPT',
          message: 'Chấp nhận đề xuất',
        },
      );

      // Then send the accept card to chat
      const message = await messageService.sendCustomOrderMessage({
        type: 'customer_accept_offer',
        receiverId: data.receiverId,
        content: data.content,
        quoteRequestId: data.quoteRequestId,
      });

      success('Đã chấp nhận đề xuất');
      return message;
    } catch (err: any) {
      error(err.message || 'Không thể chấp nhận đề xuất');
      return null;
    } finally {
      setSending(false);
    }
  };

  /**
   * Customer reject offer via chat
   */
  const customerRejectOfferInChat = async (data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
    rejectOffer?: {
      reason?: string;
    };
  }): Promise<MessageWithUsers | null> => {
    setSending(true);
    try {
      // First update the custom order in database
      const updatedOrder = await customOrderService.customerRejectOffer(
        data.quoteRequestId,
        {
          action: 'REJECT',
          reason: data.rejectOffer?.reason,
          message: data.rejectOffer?.reason || 'Từ chối đề xuất',
        },
      );

      // Then send the reject card to chat
      const message = await messageService.sendCustomOrderMessage({
        type: 'customer_reject_offer',
        receiverId: data.receiverId,
        content: data.content,
        quoteRequestId: data.quoteRequestId,
        rejectOffer: data.rejectOffer,
      });

      success('Đã từ chối đề xuất');
      return message;
    } catch (err: any) {
      error(err.message || 'Không thể từ chối đề xuất');
      return null;
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    createCustomOrderInChat,
    respondToCustomOrderInChat,
    customerCounterOfferInChat,
    customerAcceptOfferInChat,
    customerRejectOfferInChat,
  };
};
