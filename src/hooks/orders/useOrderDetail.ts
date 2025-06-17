import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { orderService } from '../../services/order.service';
import {
  OrderWithDetails,
  OrderStatus,
  UpdateOrderStatusRequest,
} from '../../types/order';

export const useOrderDetail = (orderId: string) => {
  const { success, error } = useToastContext();
  const { state } = useAuth();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      const orderData = await orderService.getOrder(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error('Error loading order:', err);
      error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (data: UpdateOrderStatusRequest) => {
    if (!order) return;

    setUpdating(true);
    try {
      await orderService.updateOrderStatus(order.id, data);
      success('Đã cập nhật trạng thái đơn hàng');
      loadOrder();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const cancelOrder = async (reason?: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      await orderService.cancelOrder(order.id, reason);
      success('Đã hủy đơn hàng thành công');
      loadOrder();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi hủy đơn hàng');
    } finally {
      setUpdating(false);
    }
  };

  const canUpdateStatus = () => {
    if (!order || !state.user) return false;

    const { user } = state;
    if (user.role === 'ADMIN') return true;

    if (user.role === 'ARTISAN') {
      return order.items.some((item) => item.seller.id === user.id);
    }

    return false;
  };

  const canCancelOrder =
    order &&
    [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status);

  const getNextPossibleStatuses = () => {
    if (!order || !state.user) return [];

    const { user } = state;

    if (user.role === 'ARTISAN') {
      const transitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.CONFIRMED],
        [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING],
        [OrderStatus.PAID]: [OrderStatus.PROCESSING],
        [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
        [OrderStatus.DELIVERED]: [],
        [OrderStatus.CANCELLED]: [],
        [OrderStatus.REFUNDED]: [],
      };
      return transitions[order.status] || [];
    }

    return [];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    order,
    loading,
    updating,
    loadOrder,
    updateOrderStatus,
    cancelOrder,
    canUpdateStatus,
    canCancelOrder,
    getNextPossibleStatuses,
    formatPrice,
    formatDate,
  };
};
