import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { customOrderService } from '../../services/custom-order.service';
import { messageService } from '../../services/message.service';
import {
  CustomOrderWithDetails,
  ArtisanResponseRequest,
  UpdateCustomOrderRequest,
  CounterOfferRequest,
  AcceptOfferRequest,
  RejectOfferRequest,
} from '../../types/custom-order';
import { formatPrice } from '../../utils/format';
import {
  getCustomOrderActions,
  getLastNegotiationActor,
} from '../../utils/custom-order';
import { MessageType } from '../../types/message';

export const useCustomOrderDetail = (orderId: string) => {
  const { state } = useAuth();
  const { success, error } = useToastContext();

  const [order, setOrder] = useState<CustomOrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [permissions, setPermissions] = useState<any>(null);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const orderData = await customOrderService.getCustomOrder(orderId);
      setOrder(orderData);

      // Calculate permissions using new utility
      if (state.user) {
        const userPermissions = getCustomOrderActions(orderData, state.user.id);
        setPermissions(userPermissions);
      }
    } catch (err: any) {
      error(err.message || 'Không thể tải thông tin custom order');
    } finally {
      setLoading(false);
    }
  };

  // Auto-send message helper
  const sendAutoMessage = async (
    action: string,
    updatedOrder: CustomOrderWithDetails,
    data?: any,
  ) => {
    try {
      const isCustomer = state.user?.id === updatedOrder.customer.id;
      const receiverId = isCustomer
        ? updatedOrder.artisan.id
        : updatedOrder.customer.id;

      let content = '🛠️ Custom Order';

      let productMentions: any = {
        type: 'custom_order_response',
        negotiationId: updatedOrder.id,
        customerId: updatedOrder.customer.id,
        artisanId: updatedOrder.artisan.id,
        action,
        status: updatedOrder.status,
        lastActor: isCustomer ? 'customer' : 'artisan',
        timestamp: new Date().toISOString(),
        proposal: {
          title: updatedOrder.title,
          description: updatedOrder.description,
          estimatedPrice: updatedOrder.estimatedPrice,
          timeline: updatedOrder.timeline,
          specifications: updatedOrder.specifications,
        },
      };

      if (data?.finalPrice) {
        productMentions.finalPrice = data.finalPrice;
      }

      if (action.includes('COUNTER')) {
        productMentions.status = 'counter_offered';
      }

      // switch (action) {
      //   case 'ACCEPT':
      //     content = `✅ Tôi đã chấp nhận custom order "${updatedOrder.title}"`;
      //     break;
      //   case 'REJECT':
      //     content = `❌ Tôi đã từ chối custom order "${updatedOrder.title}"`;
      //     if (data?.reason) {
      //       content += `: ${data.reason}`;
      //     }
      //     break;
      //   case 'COUNTER_OFFER':
      //     content = `💰 Tôi đã gửi đề xuất ngược cho custom order "${
      //       updatedOrder.title
      //     }" với giá ${formatPrice(data.finalPrice)}`;
      //     productMentions.finalPrice = data.finalPrice;
      //     productMentions.status = 'counter_offered';
      //     break;
      //   case 'CUSTOMER_COUNTER_OFFER':
      //     content = `💰 Tôi đã gửi đề xuất ngược với giá ${formatPrice(
      //       data.finalPrice,
      //     )}`;
      //     productMentions.finalPrice = data.finalPrice;
      //     productMentions.status = 'counter_offered';
      //     break;
      //   case 'CUSTOMER_ACCEPT':
      //     content = `✅ Tôi đã chấp nhận đề xuất cho custom order "${updatedOrder.title}"`;
      //     break;
      //   case 'CUSTOMER_REJECT':
      //     content = `❌ Tôi đã từ chối đề xuất cho custom order "${updatedOrder.title}"`;
      //     break;
      // }

      await messageService.sendMessage({
        receiverId,
        content,
        type: MessageType.CUSTOM_ORDER,
        productMentions,
      });
    } catch (error) {
      console.error('Error sending auto message:', error);
      // Don't throw error, just log it
    }
  };

  // Artisan methods
  const respondToOrder = async (data: ArtisanResponseRequest) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updatedOrder = await customOrderService.respondToCustomOrder(
        order.id,
        data,
      );
      setOrder(updatedOrder);

      // Auto send message
      await sendAutoMessage(data.action, updatedOrder, data);

      const actionMessages = {
        ACCEPT: 'Đã chấp nhận yêu cầu custom order',
        REJECT: 'Đã từ chối yêu cầu custom order',
        COUNTER_OFFER: 'Đã gửi đề xuất ngược',
      };

      success(actionMessages[data.action]);
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  // Customer methods
  const customerCounterOffer = async (data: CounterOfferRequest) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updatedOrder = await customOrderService.customerCounterOffer(
        order.id,
        data,
      );
      setOrder(updatedOrder);

      // Auto send message
      await sendAutoMessage('CUSTOMER_COUNTER_OFFER', updatedOrder, data);

      success('Đã gửi đề xuất ngược');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  const customerAcceptOffer = async (data: AcceptOfferRequest) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updatedOrder = await customOrderService.customerAcceptOffer(
        order.id,
        data,
      );
      setOrder(updatedOrder);

      // Auto send message
      await sendAutoMessage('CUSTOMER_ACCEPT', updatedOrder, data);

      success('Đã chấp nhận đề xuất');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  const customerRejectOffer = async (data: RejectOfferRequest) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updatedOrder = await customOrderService.customerRejectOffer(
        order.id,
        data,
      );
      setOrder(updatedOrder);

      // Auto send message
      await sendAutoMessage('CUSTOMER_REJECT', updatedOrder, data);

      success('Đã từ chối đề xuất');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  const updateOrder = async (data: UpdateCustomOrderRequest) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updatedOrder = await customOrderService.updateCustomOrder(
        order.id,
        data,
      );
      setOrder(updatedOrder);
      success('Đã cập nhật custom order');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async (reason?: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updatedOrder = await customOrderService.cancelCustomOrder(
        order.id,
        reason,
      );
      setOrder(updatedOrder);
      success('Đã hủy custom order');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  // Legacy method for backward compatibility
  const acceptCounterOffer = async () => {
    return customerAcceptOffer({
      action: 'ACCEPT',
      message: 'Chấp nhận đề xuất',
    });
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // Update permissions when order or user changes
  useEffect(() => {
    if (order && state.user) {
      const userPermissions = getCustomOrderActions(order, state.user.id);
      setPermissions(userPermissions);
    }
  }, [order, state.user]);

  return {
    order,
    loading,
    updating,
    permissions,

    // Core methods
    loadOrder,
    updateOrder,
    cancelOrder,

    // Artisan methods
    respondToOrder,

    // Customer methods
    customerCounterOffer,
    customerAcceptOffer,
    customerRejectOffer,

    // Legacy methods (keep for backward compatibility)
    acceptCounterOffer,

    // Permission helpers (computed from permissions)
    canRespond: permissions?.canRespond || false,
    canUpdate: permissions?.canUpdate || false,
    canAcceptOffer: permissions?.canAccept || false,
    canRejectOffer: permissions?.canReject || false,
    canCounterOffer: permissions?.canCounterOffer || false,
    canCancel: permissions?.canCancel || false,
    canMessage: permissions?.canMessage !== false, // Default true
    canProceedToPayment: permissions?.canProceedToPayment || false,

    // Status helpers
    isExpired: permissions?.expired || false,
    isActive: permissions?.actionFor !== undefined,
    isCompleted: permissions?.completed || false,
    isCancelled: permissions?.rejected || false,
  };
};
