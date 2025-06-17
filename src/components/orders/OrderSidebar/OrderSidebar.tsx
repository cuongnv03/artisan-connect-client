import React from 'react';
import {
  CreditCardIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { OrderWithDetails } from '../../../types/order';
import { Card } from '../../ui/Card';

interface OrderSidebarProps {
  order: OrderWithDetails;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}

export const OrderSidebar: React.FC<OrderSidebarProps> = ({
  order,
  formatPrice,
  formatDate,
}) => {
  return (
    <>
      {/* Order Summary */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tóm tắt đơn hàng
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">Tạm tính</span>
            <span className="font-medium">{formatPrice(order.subtotal)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển</span>
            <span className="font-medium">
              {order.shippingCost > 0
                ? formatPrice(order.shippingCost)
                : 'Miễn phí'}
            </span>
          </div>

          {order.taxAmount && order.taxAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Thuế</span>
              <span className="font-medium">
                {formatPrice(order.taxAmount)}
              </span>
            </div>
          )}

          {order.discountAmount && order.discountAmount > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Giảm giá</span>
              <span className="font-medium text-green-600">
                -{formatPrice(order.discountAmount)}
              </span>
            </div>
          )}

          <hr />

          <div className="flex justify-between text-lg font-semibold">
            <span>Tổng cộng</span>
            <span className="text-primary">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>
      </Card>

      {/* Payment Info */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CreditCardIcon className="w-5 h-5 mr-2" />
          Thanh toán
        </h2>

        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-600">Phương thức:</span>
            <p className="font-medium">
              {order.paymentMethod === 'CASH_ON_DELIVERY'
                ? 'Thanh toán khi nhận hàng'
                : 'Thanh toán online'}
            </p>
          </div>

          <div>
            <span className="text-sm text-gray-600">
              Trạng thái thanh toán:
            </span>
            <p className="font-medium">
              {order.paymentStatus === 'COMPLETED'
                ? 'Đã thanh toán'
                : order.paymentStatus === 'PENDING'
                ? 'Chờ thanh toán'
                : 'Chưa thanh toán'}
            </p>
          </div>

          {order.paymentReference && (
            <div>
              <span className="text-sm text-gray-600">Mã giao dịch:</span>
              <p className="font-medium font-mono text-sm">
                {order.paymentReference}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Delivery Info */}
      {order.expectedDelivery && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Thông tin giao hàng
          </h2>

          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
              <span className="text-gray-600">Dự kiến giao:</span>
            </div>
            <p className="font-medium">{formatDate(order.expectedDelivery)}</p>

            {order.actualDelivery && (
              <>
                <div className="flex items-center text-sm mt-3">
                  <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                  <span className="text-gray-600">Đã giao:</span>
                </div>
                <p className="font-medium">
                  {formatDate(order.actualDelivery)}
                </p>
              </>
            )}
          </div>
        </Card>
      )}
    </>
  );
};
