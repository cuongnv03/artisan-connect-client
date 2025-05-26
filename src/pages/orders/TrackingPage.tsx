// src/pages/orders/TrackingPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { orderService } from '../../services/order.service';
import { OrderWithDetails } from '../../types/order';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  location?: string;
  completed: boolean;
}

export const TrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
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
      // Sort by creation time
      const sortedHistory = order.statusHistory.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );

      sortedHistory.forEach((history) => {
        const statusLabels = {
          PENDING: 'Đơn hàng được tạo',
          CONFIRMED: 'Đã xác nhận',
          PAID: 'Đã thanh toán',
          PROCESSING: 'Đang chuẩn bị hàng',
          SHIPPED: 'Đã giao cho vận chuyển',
          DELIVERED: 'Đã giao hàng thành công',
          CANCELLED: 'Đã hủy đơn hàng',
          REFUNDED: 'Đã hoàn tiền',
        };

        const statusDescriptions = {
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
          date: history.createdAt,
          status: statusLabels[history.status] || history.status,
          description:
            history.note ||
            statusDescriptions[history.status] ||
            'Cập nhật trạng thái đơn hàng',
          completed: true,
        });
      });
    } else {
      // Fallback nếu không có status history
      events.push({
        date: order.createdAt,
        status: 'Đơn hàng được tạo',
        description: 'Đơn hàng đã được tạo và đang chờ xác nhận từ người bán',
        completed: true,
      });
    }

    // Thêm bước tiếp theo nếu chưa hoàn thành
    const currentStatus = order.status;
    if (
      currentStatus !== 'DELIVERED' &&
      currentStatus !== 'CANCELLED' &&
      currentStatus !== 'REFUNDED'
    ) {
      const nextSteps = {
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
          date: order.estimatedDelivery || '',
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy đơn hàng
        </h3>
        <p className="text-gray-500 mb-6">
          Mã đơn hàng không hợp lệ hoặc không tồn tại
        </p>
        <Link to="/orders">
          <Button>Quay lại đơn hàng</Button>
        </Link>
      </div>
    );
  }

  const trackingEvents = generateTrackingEvents(order);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link to={`/orders/${order.id}`}>
          <Button
            variant="ghost"
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            className="mr-4"
          >
            Quay lại
          </Button>
        </Link>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Theo dõi đơn hàng
          </h1>
          <p className="text-gray-500">
            Mã đơn hàng: <span className="font-mono">{orderNumber}</span>
          </p>
        </div>
      </div>

      {/* Order Info Card */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Đơn hàng #{order.orderNumber}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {order.items.length} sản phẩm •{' '}
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(order.totalAmount)}
            </p>
          </div>

          {order.estimatedDelivery && (
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Dự kiến giao hàng
              </div>
              <p className="font-medium">
                {formatDate(order.estimatedDelivery)}
              </p>
            </div>
          )}
        </div>

        {order.shippingAddress && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start">
              <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-gray-600 text-sm">
                  {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Tracking Timeline */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Lịch trình đơn hàng
        </h2>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-6">
            {trackingEvents.map((event, index) => (
              <div key={index} className="relative flex items-start">
                {/* Timeline dot */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                    event.completed
                      ? 'bg-green-100 border-green-200'
                      : 'bg-gray-100 border-gray-200'
                  }`}
                >
                  {event.completed ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <ClockIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                {/* Event content */}
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium ${
                        event.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {event.status}
                    </h3>

                    {event.date && (
                      <span className="text-sm text-gray-500">
                        {formatDate(event.date)}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm mt-1 ${
                      event.completed ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {event.description}
                  </p>

                  {event.location && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Cần hỗ trợ?</h3>
        <p className="text-blue-800 text-sm mb-4">
          Nếu bạn có thắc mắc về đơn hàng hoặc cần hỗ trợ thêm, hãy liên hệ với
          chúng tôi.
        </p>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            Liên hệ người bán
          </Button>
          <Button variant="outline" size="sm">
            Hỗ trợ khách hàng
          </Button>
        </div>
      </Card>
    </div>
  );
};
