import React from 'react';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { OrderStatus } from '../../../types/order';
import { Badge } from '../../ui/Badge';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
}) => {
  const statusConfig = {
    [OrderStatus.PENDING]: {
      variant: 'warning' as const,
      text: 'Chờ xác nhận',
      icon: ClockIcon,
    },
    [OrderStatus.CONFIRMED]: {
      variant: 'info' as const,
      text: 'Đã xác nhận',
      icon: CheckCircleIcon,
    },
    [OrderStatus.PAID]: {
      variant: 'success' as const,
      text: 'Đã thanh toán',
      icon: CheckCircleIcon,
    },
    [OrderStatus.PROCESSING]: {
      variant: 'info' as const,
      text: 'Đang xử lý',
      icon: ClockIcon,
    },
    [OrderStatus.SHIPPED]: {
      variant: 'info' as const,
      text: 'Đã gửi hàng',
      icon: TruckIcon,
    },
    [OrderStatus.DELIVERED]: {
      variant: 'success' as const,
      text: 'Đã giao hàng',
      icon: CheckCircleIcon,
    },
    [OrderStatus.CANCELLED]: {
      variant: 'danger' as const,
      text: 'Đã hủy',
      icon: XCircleIcon,
    },
    [OrderStatus.REFUNDED]: {
      variant: 'secondary' as const,
      text: 'Đã hoàn tiền',
      icon: CheckCircleIcon,
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <Badge variant={config.variant} className="inline-flex items-center">
      <IconComponent className="w-4 h-4 mr-1" />
      {config.text}
    </Badge>
  );
};
