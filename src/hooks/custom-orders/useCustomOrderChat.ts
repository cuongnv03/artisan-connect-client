import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { messageService } from '../../services/message.service';
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

  // Create custom order via chat
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
      const message = await messageService.createCustomOrderInChat({
        ...data,
        content: '🛠️ Custom Order Request',
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

  // Artisan respond to custom order via chat
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
    if (!state.user || state.user.role !== 'ARTISAN') {
      error('Chỉ nghệ nhân mới có thể phản hồi yêu cầu custom order');
      return null;
    }

    setSending(true);
    try {
      const message = await messageService.respondToCustomOrderInChat({
        ...data,
        content: '🛠️ Custom Order Response', // SỬA: Content đơn giản
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

  // Customer counter offer via chat
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
      const message = await messageService.customerCounterOfferInChat({
        ...data,
        content: '🛠️ Custom Order Response', // SỬA: Content đơn giản
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

  // Customer accept offer via chat
  const customerAcceptOfferInChat = async (data: {
    receiverId: string;
    content: string;
    quoteRequestId: string;
  }): Promise<MessageWithUsers | null> => {
    setSending(true);
    try {
      const message = await messageService.customerAcceptOfferInChat({
        ...data,
        content: '🛠️ Custom Order Response', // SỬA: Content đơn giản
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

  // Customer reject offer via chat
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
      const message = await messageService.customerRejectOfferInChat({
        ...data,
        content: '🛠️ Custom Order Response', // SỬA: Content đơn giản
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

  // // Continue quote discussion
  // const sendQuoteDiscussionMessage = async (data: {
  //   receiverId: string;
  //   content: string;
  //   quoteRequestId: string;
  // }): Promise<MessageWithUsers | null> => {
  //   setSending(true);
  //   try {
  //     const message = await messageService.sendQuoteDiscussionMessage(data);
  //     return message;
  //   } catch (err: any) {
  //     error(err.message || 'Không thể gửi tin nhắn');
  //     return null;
  //   } finally {
  //     setSending(false);
  //   }
  // };

  return {
    sending,
    createCustomOrderInChat,
    respondToCustomOrderInChat,
    customerCounterOfferInChat,
    customerAcceptOfferInChat,
    customerRejectOfferInChat,
  };
};
