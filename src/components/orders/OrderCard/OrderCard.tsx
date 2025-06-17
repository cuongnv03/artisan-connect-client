import React from 'react';
import { Link } from 'react-router-dom';
import { EyeIcon } from '@heroicons/react/24/outline';
import { OrderSummary } from '../../../types/order';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { OrderStatusBadge } from '../OrderStatusBadge/OrderStatusBadge';

interface OrderCardProps {
  order: OrderSummary;
  userRole: string;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  userRole,
  formatPrice,
  formatDate,
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-gray-900">
              #{order.orderNumber}
            </h3>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-primary">
            {formatPrice(order.totalAmount)}
          </p>
          <p className="text-sm text-gray-500">{order.itemCount} sản phẩm</p>
        </div>
      </div>

      {/* Customer/Seller info */}
      {userRole === 'ARTISAN' && order.customer && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium">
            Khách hàng: {order.customer.name}
          </p>
          <p className="text-xs text-gray-500">{order.customer.email}</p>
        </div>
      )}

      {userRole !== 'ARTISAN' && order.primarySeller && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <p className="text-sm font-medium">
            Người bán: {order.primarySeller.name}
            {order.primarySeller.shopName &&
              ` (${order.primarySeller.shopName})`}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end pt-4 border-t border-gray-100">
        <Link to={`/orders/${order.id}`}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<EyeIcon className="w-4 h-4" />}
          >
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </Card>
  );
};
