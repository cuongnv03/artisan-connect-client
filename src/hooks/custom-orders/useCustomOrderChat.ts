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
   * FIXED: Create custom order via chat (NEW APPROACH)
   * Only calls the message service which handles both creation and messaging
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
      // FIXED: Use the new unified approach - single API call
      const message = await messageService.sendCustomOrderMessage({
        type: 'create_custom_order',
        receiverId: data.receiverId,
        content: data.content,
        customOrderData: data.customOrderData,
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
   * Send existing custom order card to chat
   */
  const sendExistingCustomOrderCard = async (data: {
    receiverId: string;
    content: string;
    customOrderId: string;
  }): Promise<MessageWithUsers | null> => {
    if (!state.user) {
      error('Bạn cần đăng nhập để thực hiện hành động này');
      return null;
    }

    setSending(true);
    try {
      const message = await messageService.sendCustomOrderMessage({
        type: 'send_existing_custom_order',
        receiverId: data.receiverId,
        content: data.content,
        quoteRequestId: data.customOrderId,
      });

      success('Đã gửi thông tin custom order');
      return message;
    } catch (err: any) {
      error(err.message || 'Không thể gửi thông tin custom order');
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

  /**
   * Continue discussion about quote
   */
  const sendQuoteDiscussionMessage = async (data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
  }): Promise<MessageWithUsers | null> => {
    setSending(true);
    try {
      const message = await messageService.sendCustomOrderMessage({
        type: 'quote_discussion',
        receiverId: data.receiverId,
        content: data.content,
        quoteRequestId: data.quoteRequestId,
      });

      return message;
    } catch (err: any) {
      error(err.message || 'Không thể gửi tin nhắn');
      return null;
    } finally {
      setSending(false);
    }
  };

  return {
    sending,
    createCustomOrderInChat,
    sendExistingCustomOrderCard,
    respondToCustomOrderInChat,
    customerCounterOfferInChat,
    customerAcceptOfferInChat,
    customerRejectOfferInChat,
    sendQuoteDiscussionMessage,
  };
};
