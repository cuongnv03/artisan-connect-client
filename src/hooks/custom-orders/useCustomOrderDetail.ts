import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { customOrderService } from '../../services/custom-order.service';
import {
  CustomOrderWithDetails,
  ArtisanResponseRequest,
  UpdateCustomOrderRequest,
  CounterOfferRequest,
  AcceptOfferRequest,
  RejectOfferRequest,
} from '../../types/custom-order';
import { messageService } from '../../services/message.service';
import { formatPrice } from '../../utils/format';

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

      // Calculate permissions
      if (state.user) {
        const userPermissions = customOrderService.getUserPermissions(
          orderData,
          state.user.id,
          state.user.role,
        );
        setPermissions(userPermissions);
      }
    } catch (err: any) {
      error(err.message || 'Không thể tải thông tin custom order');
    } finally {
      setLoading(false);
    }
  };

  // ===== EXISTING METHODS =====

  const respondToOrder = async (data: ArtisanResponseRequest) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updatedOrder = await customOrderService.respondToCustomOrder(
        order.id,
        data,
      );
      setOrder(updatedOrder);

      // AUTO SEND MESSAGE TO CUSTOMER
      try {
        const actionMessages = {
          ACCEPT: `✅ Tôi đã chấp nhận yêu cầu custom order "${order.title}"`,
          REJECT: `❌ Tôi đã từ chối yêu cầu custom order "${order.title}"${
            data.response?.message ? `: ${data.response.message}` : ''
          }`,
          COUNTER_OFFER: `💰 Tôi đã gửi đề xuất ngược cho custom order "${
            order.title
          }" với giá ${data.finalPrice ? formatPrice(data.finalPrice) : 'N/A'}`,
        };

        await messageService.sendMessage({
          receiverId: order.customer.id,
          content: actionMessages[data.action],
          type: 'QUOTE_DISCUSSION',
          quoteRequestId: order.id,
          productMentions: {
            type: 'custom_order_response',
            action: data.action,
            finalPrice: data.finalPrice,
            quoteRequestId: order.id,
            response: data.response,
          },
        });
      } catch (msgError) {
        console.error('Error sending auto message:', msgError);
      }

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

  const acceptCounterOffer = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      const updatedOrder = await customOrderService.acceptCounterOffer(
        order.id,
      );
      setOrder(updatedOrder);
      success('Đã chấp nhận đề xuất ngược');
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

  // ===== NEW: BIDIRECTIONAL NEGOTIATION METHODS =====

  const customerCounterOffer = async (data: CounterOfferRequest) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updatedOrder = await customOrderService.customerCounterOffer(
        order.id,
        data,
      );
      setOrder(updatedOrder);

      // AUTO SEND MESSAGE TO ARTISAN
      try {
        await messageService.sendMessage({
          receiverId: order.artisan.id,
          content: `💰 Tôi đã gửi đề xuất ngược cho custom order "${
            order.title
          }" với giá ${formatPrice(data.finalPrice)}${
            data.message ? `: ${data.message}` : ''
          }`,
          type: 'QUOTE_DISCUSSION',
          quoteRequestId: order.id,
          productMentions: {
            type: 'customer_counter_offer',
            action: 'CUSTOMER_COUNTER_OFFER',
            finalPrice: data.finalPrice,
            quoteRequestId: order.id,
            timeline: data.timeline,
            message: data.message,
          },
        });
      } catch (msgError) {
        console.error('Error sending auto message:', msgError);
      }

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

      // AUTO SEND MESSAGE TO ARTISAN
      try {
        await messageService.sendMessage({
          receiverId: order.artisan.id,
          content: `✅ Tôi đã chấp nhận đề xuất custom order "${order.title}"${
            data.message ? `: ${data.message}` : ''
          }`,
          type: 'QUOTE_DISCUSSION',
          quoteRequestId: order.id,
          productMentions: {
            type: 'customer_accept_offer',
            action: 'CUSTOMER_ACCEPT',
            quoteRequestId: order.id,
            finalPrice: updatedOrder.finalPrice,
            message: data.message,
          },
        });
      } catch (msgError) {
        console.error('Error sending auto message:', msgError);
      }

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

      // AUTO SEND MESSAGE TO ARTISAN
      try {
        await messageService.sendMessage({
          receiverId: order.artisan.id,
          content: `❌ Tôi đã từ chối đề xuất custom order "${order.title}"${
            data.reason ? `: ${data.reason}` : ''
          }${data.message ? ` - ${data.message}` : ''}`,
          type: 'QUOTE_DISCUSSION',
          quoteRequestId: order.id,
          productMentions: {
            type: 'customer_reject_offer',
            action: 'CUSTOMER_REJECT',
            quoteRequestId: order.id,
            reason: data.reason,
            message: data.message,
          },
        });
      } catch (msgError) {
        console.error('Error sending auto message:', msgError);
      }

      success('Đã từ chối đề xuất');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  // Update permissions when order or user changes
  useEffect(() => {
    if (order && state.user) {
      const userPermissions = customOrderService.getUserPermissions(
        order,
        state.user.id,
        state.user.role,
      );
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
    canAcceptOffer: permissions?.canAcceptOffer || false,
    canRejectOffer: permissions?.canRejectOffer || false,
    canCounterOffer: permissions?.canCounterOffer || false,
    canCancel: permissions?.canCancel || false,
    canMessage: permissions?.canMessage || false,

    // Status helpers
    isExpired: permissions?.isExpired || false,
    isActive: permissions?.isActive || false,
    isCompleted: permissions?.isCompleted || false,
    isCancelled: permissions?.isCancelled || false,
  };
};
