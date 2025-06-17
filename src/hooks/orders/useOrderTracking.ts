import { useState, useEffect } from 'react';
import { orderService } from '../../services/order.service';
import { OrderWithDetails } from '../../types/order';

interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  location?: string;
  completed: boolean;
}

export const useOrderTracking = (orderNumber: string) => {
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      loadOrderInfo();
    }
  }, [orderNumber]);

  const loadOrderInfo = async () => {
    if (!orderNumber) return;

    try {
      const orderData = await orderService.getOrderByNumber(orderNumber);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading order info:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingEvents = (order: OrderWithDetails): TrackingEvent[] => {
    const events: TrackingEvent[] = [];

    if (order.statusHistory && order.statusHistory.length > 0) {
      const sortedHistory = order.statusHistory.sort(
        (a: any, b: any) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
      );

      sortedHistory.forEach((history: any) => {
        const statusLabels: Record<string, string> = {
          PENDING: 'Đơn hàng được tạo',
          CONFIRMED: 'Đã xác nhận',
          PAID: 'Đã thanh toán',
          PROCESSING: 'Đang chuẩn bị hàng',
          SHIPPED: 'Đã giao cho vận chuyển',
          DELIVERED: 'Đã giao hàng thành công',
          CANCELLED: 'Đã hủy đơn hàng',
          REFUNDED: 'Đã hoàn tiền',
        };

        const statusDescriptions: Record<string, string> = {
          PENDING: 'Đơn hàng đã được tạo và đang chờ xác nhận từ người bán',
          CONFIRMED: 'Người bán đã xác nhận đơn hàng và bắt đầu chuẩn bị',
          PAID: 'Thanh toán đã được xác nhận thành công',
          PROCESSING: 'Người bán đang chuẩn bị và đóng gói sản phẩm',
          SHIPPED: 'Đơn hàng đã được giao cho đơn vị vận chuyển',
          DELIVERED: 'Đơn hàng đã được giao thành công đến địa chỉ nhận hàng',
          CANCELLED: 'Đơn hàng đã bị hủy',
          REFUNDED: 'Đã hoàn tiền cho khách hàng',
        };

        events.push({
          date: history.timestamp,
          status: statusLabels[history.status] || history.status,
          description:
            history.note ||
            statusDescriptions[history.status] ||
            'Cập nhật trạng thái đơn hàng',
          completed: true,
        });
      });
    } else {
      events.push({
        date: order.createdAt,
        status: 'Đơn hàng được tạo',
        description: 'Đơn hàng đã được tạo và đang chờ xác nhận từ người bán',
        completed: true,
      });
    }

    // Add next step if not completed
    const currentStatus = order.status;
    if (
      currentStatus !== 'DELIVERED' &&
      currentStatus !== 'CANCELLED' &&
      currentStatus !== 'REFUNDED'
    ) {
      const nextSteps: Record<string, any> = {
        PENDING: {
          status: 'Chờ xác nhận',
          description:
            'Người bán sẽ xác nhận đơn hàng trong thời gian sớm nhất',
        },
        CONFIRMED: {
          status: 'Chuẩn bị hàng',
          description: 'Người bán sẽ bắt đầu chuẩn bị sản phẩm',
        },
        PAID: {
          status: 'Chuẩn bị hàng',
          description: 'Người bán đang chuẩn bị sản phẩm của bạn',
        },
        PROCESSING: {
          status: 'Chuẩn bị giao hàng',
          description: 'Sản phẩm sẽ được giao cho đơn vị vận chuyển',
        },
        SHIPPED: {
          status: 'Đang giao đến bạn',
          description: 'Đơn hàng đang trên đường giao đến địa chỉ của bạn',
        },
      };

      const nextStep = nextSteps[currentStatus];
      if (nextStep) {
        events.push({
          date: order.expectedDelivery || '',
          status: nextStep.status,
          description: nextStep.description,
          location: order.shippingAddress?.city,
          completed: false,
        });
      }
    }

    return events;
  };

  const formatDate = (date: string) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    order,
    loading,
    trackingEvents: order ? generateTrackingEvents(order) : [],
    formatDate,
  };
};
