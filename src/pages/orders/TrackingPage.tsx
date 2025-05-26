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
  const { trackingNumber } = useParams<{ trackingNumber: string }>();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (trackingNumber) {
      loadTrackingInfo();
    }
  }, [trackingNumber]);

  const loadTrackingInfo = async () => {
    if (!trackingNumber) return;

    try {
      // In a real app, you'd have a specific tracking endpoint
      // For now, we'll try to find the order by tracking number
      const orderData = await orderService.getOrderByNumber(trackingNumber);
      setOrder(orderData);
    } catch (error) {
      console.error('Error loading tracking info:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateTrackingEvents = (order: OrderWithDetails): TrackingEvent[] => {
    const events: TrackingEvent[] = [
      {
        date: order.createdAt,
        status: 'Đơn hàng được tạo',
        description: 'Đơn hàng đã được tạo và đang chờ xác nhận từ người bán',
        completed: true,
      },
    ];

    if (
      ['CONFIRMED', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(
        order.status,
      )
    ) {
      events.push({
        date: order.updatedAt,
        status: 'Đã xác nhận',
        description: 'Người bán đã xác nhận đơn hàng và bắt đầu chuẩn bị',
        completed: true,
      });
    }

    if (['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
      events.push({
        date: order.updatedAt,
        status: 'Đã thanh toán',
        description: 'Thanh toán đã được xác nhận thành công',
        completed: true,
      });
    }

    if (['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status)) {
      events.push({
        date: order.updatedAt,
        status: 'Đang chuẩn bị hàng',
        description: 'Người bán đang chuẩn bị và đóng gói sản phẩm',
        completed: true,
      });
    }

    if (['SHIPPED', 'DELIVERED'].includes(order.status)) {
      events.push({
        date: order.updatedAt,
        status: 'Đã giao cho đơn vị vận chuyển',
        description: `Đơn hàng đã được giao cho đơn vị vận chuyển`,
        location: order.shippingAddress?.city,
        completed: true,
      });
    }

    if (order.status === 'DELIVERED') {
      events.push({
        date: order.deliveredAt || order.updatedAt,
        status: 'Đã giao hàng thành công',
        description: 'Đơn hàng đã được giao thành công đến địa chỉ nhận hàng',
        location: order.shippingAddress?.city,
        completed: true,
      });
    } else {
      // Add pending events
      if (!['SHIPPED', 'DELIVERED'].includes(order.status)) {
        events.push({
          date: '',
          status: 'Đang vận chuyển',
          description: 'Đơn hàng đang được vận chuyển đến địa chỉ của bạn',
          completed: false,
        });
      }

      if (order.status !== 'DELIVERED') {
        events.push({
          date: order.estimatedDelivery || '',
          status: 'Giao hàng thành công',
          description: 'Đơn hàng sẽ được giao đến địa chỉ của bạn',
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
          <p className="mt-4 text-gray-600">Đang tải thông tin vận chuyển...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy thông tin vận chuyển
        </h3>
        <p className="text-gray-500 mb-6">
          Mã vận đơn không hợp lệ hoặc đơn hàng chưa được giao cho đơn vị vận
          chuyển
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
            Mã vận đơn: <span className="font-mono">{trackingNumber}</span>
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
          Lịch trình vận chuyển
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
