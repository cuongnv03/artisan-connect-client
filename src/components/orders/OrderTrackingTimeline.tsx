import React from 'react';
import {
  CheckCircleIcon,
  ClockIcon,
  TruckIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { OrderWithDetails, OrderStatus } from '../../types/order';

interface TrackingEvent {
  date: string;
  status: string;
  description: string;
  completed: boolean;
  icon?: React.ComponentType<any>;
  color?: string;
}

interface OrderTrackingTimelineProps {
  order: OrderWithDetails;
  formatDate: (date: string) => string;
  compact?: boolean;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  order,
  formatDate,
  compact = false,
}) => {
  const generateTrackingEvents = (): TrackingEvent[] => {
    const events: TrackingEvent[] = [];

    // Parse status history from JSON field
    const statusHistory = Array.isArray(order.statusHistory)
      ? order.statusHistory
      : [];

    if (statusHistory.length > 0) {
      statusHistory.forEach((history: any) => {
        const statusLabels: Record<string, string> = {
          PENDING: 'Đơn hàng được tạo',
          CONFIRMED: 'Đã xác nhận',
          PAID: 'Đã thanh toán',
          PROCESSING: 'Đang chuẩn bị',
          SHIPPED: 'Đã gửi hàng',
          DELIVERED: 'Đã giao hàng',
          CANCELLED: 'Đã hủy',
          REFUNDED: 'Đã hoàn tiền',
        };

        const statusDescriptions: Record<string, string> = {
          PENDING: 'Đơn hàng đã được tạo và đang chờ xác nhận',
          CONFIRMED: 'Người bán đã xác nhận đơn hàng',
          PAID: 'Thanh toán đã được xử lý thành công',
          PROCESSING: 'Đang chuẩn bị và đóng gói sản phẩm',
          SHIPPED: 'Đơn hàng đã được giao cho đơn vị vận chuyển',
          DELIVERED: 'Đơn hàng đã được giao thành công',
          CANCELLED: 'Đơn hàng đã bị hủy',
          REFUNDED: 'Đã hoàn tiền cho khách hàng',
        };

        const getIconAndColor = (status: string) => {
          switch (status) {
            case 'PENDING':
              return { icon: ClockIcon, color: 'text-yellow-500' };
            case 'CONFIRMED':
            case 'PAID':
              return { icon: CheckCircleIcon, color: 'text-green-500' };
            case 'PROCESSING':
              return { icon: ClockIcon, color: 'text-blue-500' };
            case 'SHIPPED':
              return { icon: TruckIcon, color: 'text-blue-500' };
            case 'DELIVERED':
              return { icon: CheckCircleIcon, color: 'text-green-500' };
            case 'CANCELLED':
            case 'REFUNDED':
              return { icon: ExclamationCircleIcon, color: 'text-red-500' };
            default:
              return { icon: ClockIcon, color: 'text-gray-500' };
          }
        };

        const { icon, color } = getIconAndColor(history.status);

        events.push({
          date: history.timestamp,
          status: statusLabels[history.status] || history.status,
          description:
            history.note ||
            statusDescriptions[history.status] ||
            'Cập nhật trạng thái',
          completed: true,
          icon,
          color,
        });
      });
    } else {
      // Fallback if no status history
      events.push({
        date: order.createdAt.toString(),
        status: 'Đơn hàng được tạo',
        description: 'Đơn hàng đã được tạo thành công',
        completed: true,
        icon: CheckCircleIcon,
        color: 'text-green-500',
      });
    }

    // Add expected delivery if available
    if (
      order.expectedDelivery &&
      order.status !== OrderStatus.DELIVERED &&
      order.status !== OrderStatus.CANCELLED
    ) {
      events.push({
        date: order.expectedDelivery.toString(),
        status: 'Dự kiến giao hàng',
        description: 'Thời gian dự kiến giao hàng đến bạn',
        completed: false,
        icon: TruckIcon,
        color: 'text-gray-400',
      });
    }

    return events.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  };

  const events = generateTrackingEvents();

  if (compact) {
    const latestEvent = events[events.length - 1];
    return (
      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
        {latestEvent.icon &&
          React.createElement(latestEvent.icon, {
            className: `w-5 h-5 ${latestEvent.color}`,
          })}
        <div>
          <p className="font-medium text-gray-900">{latestEvent.status}</p>
          <p className="text-sm text-gray-500">
            {formatDate(latestEvent.date)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Lịch trình đơn hàng
      </h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-6">
          {events.map((event, index) => {
            const IconComponent = event.icon || ClockIcon;

            return (
              <div key={index} className="relative flex items-start">
                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                    event.completed
                      ? 'bg-white border-green-200'
                      : 'bg-gray-100 border-gray-200'
                  }`}
                >
                  <IconComponent
                    className={`w-6 h-6 ${
                      event.completed
                        ? event.color || 'text-green-500'
                        : 'text-gray-400'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-medium ${
                        event.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {event.status}
                    </h4>

                    <span className="text-sm text-gray-500">
                      {formatDate(event.date)}
                    </span>
                  </div>

                  <p
                    className={`text-sm mt-1 ${
                      event.completed ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {event.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking number if available */}
      {order.trackingNumber && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Mã vận đơn</h4>
          <p className="text-blue-800 font-mono text-sm">
            {order.trackingNumber}
          </p>
          <p className="text-blue-700 text-sm mt-1">
            Bạn có thể tra cứu tình trạng vận chuyển bằng mã này
          </p>
        </div>
      )}
    </div>
  );
};
