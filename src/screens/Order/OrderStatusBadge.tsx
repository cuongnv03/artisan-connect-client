import React from 'react';
import { Badge } from '../../components/common/Badge';
import { OrderStatus } from '../../types/order.types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  status,
}) => {
  let variant:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info' = 'default';

  switch (status) {
    case OrderStatus.PENDING:
      variant = 'warning';
      break;
    case OrderStatus.PAID:
      variant = 'info';
      break;
    case OrderStatus.PROCESSING:
      variant = 'primary';
      break;
    case OrderStatus.SHIPPED:
      variant = 'info';
      break;
    case OrderStatus.DELIVERED:
      variant = 'success';
      break;
    case OrderStatus.CANCELLED:
    case OrderStatus.REFUNDED:
      variant = 'danger';
      break;
    default:
      variant = 'default';
  }

  // Make status display more user-friendly
  const getDisplayStatus = (status: OrderStatus): string => {
    return status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ');
  };

  return <Badge variant={variant}>{getDisplayStatus(status)}</Badge>;
};
