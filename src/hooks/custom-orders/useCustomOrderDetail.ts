import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { customOrderService } from '../../services/custom-order.service';
import {
  CustomOrderWithDetails,
  ArtisanResponseRequest,
  UpdateCustomOrderRequest,
} from '../../types/custom-order';

export const useCustomOrderDetail = (orderId: string) => {
  const { state } = useAuth();
  const { success, error } = useToastContext();

  const [order, setOrder] = useState<CustomOrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      const orderData = await customOrderService.getCustomOrder(orderId);
      setOrder(orderData);
    } catch (err: any) {
      error(err.message || 'Không thể tải thông tin custom order');
    } finally {
      setLoading(false);
    }
  };

  const respondToOrder = async (data: ArtisanResponseRequest) => {
    if (!order) return;

    setUpdating(true);
    try {
      const updatedOrder = await customOrderService.respondToCustomOrder(
        order.id,
        data,
      );
      setOrder(updatedOrder);

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

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const canRespond =
    order &&
    state.user?.role === 'ARTISAN' &&
    order.artisan.id === state.user.id &&
    ['PENDING', 'COUNTER_OFFERED'].includes(order.status);

  const canUpdate =
    order && state.user?.id === order.customer.id && order.status === 'PENDING';

  const canAcceptCounter =
    order &&
    state.user?.id === order.customer.id &&
    order.status === 'COUNTER_OFFERED';

  const canCancel =
    order &&
    ['PENDING', 'COUNTER_OFFERED'].includes(order.status) &&
    (state.user?.id === order.customer.id ||
      state.user?.id === order.artisan.id);

  return {
    order,
    loading,
    updating,
    loadOrder,
    respondToOrder,
    updateOrder,
    acceptCounterOffer,
    cancelOrder,
    canRespond,
    canUpdate,
    canAcceptCounter,
    canCancel,
  };
};
