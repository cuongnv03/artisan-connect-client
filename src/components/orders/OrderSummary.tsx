import React from 'react';
import { OrderWithDetails } from '../../types/order';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderSummaryProps {
  order: OrderWithDetails;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
  compact?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  order,
  formatPrice,
  formatDate,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              #{order.orderNumber}
            </h3>
            <p className="text-sm text-gray-500">
              {formatDate(order.createdAt)}
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {order.items.length} sản phẩm
          </span>
          <span className="font-semibold text-primary">
            {formatPrice(order.totalAmount)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Đơn hàng #{order.orderNumber}
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>Đặt lúc: {formatDate(order.createdAt)}</span>
            <span>•</span>
            <span>{order.items.length} sản phẩm</span>
          </div>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-200">
        <div>
          <p className="text-sm text-gray-500">Tạm tính</p>
          <p className="font-semibold">{formatPrice(order.subtotal)}</p>
        </div>

        <div>
          <p className="text-sm text-gray-500">Phí vận chuyển</p>
          <p className="font-semibold">
            {order.shippingCost > 0
              ? formatPrice(order.shippingCost)
              : 'Miễn phí'}
          </p>
        </div>

        {order.discountAmount && order.discountAmount > 0 && (
          <div>
            <p className="text-sm text-gray-500">Giảm giá</p>
            <p className="font-semibold text-green-600">
              -{formatPrice(order.discountAmount)}
            </p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-500">Tổng cộng</p>
          <p className="text-lg font-bold text-primary">
            {formatPrice(order.totalAmount)}
          </p>
        </div>
      </div>

      {order.notes && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-1">Ghi chú</p>
          <p className="text-gray-700">{order.notes}</p>
        </div>
      )}
    </Card>
  );
};
