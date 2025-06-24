import React from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { OrderWithDetails } from '../../types/order';
import { Card } from '../ui/Card';

interface OrderDetailContentProps {
  order: OrderWithDetails;
  formatPrice: (price: number) => string;
}

export const OrderDetailContent: React.FC<OrderDetailContentProps> = ({
  order,
  formatPrice,
}) => {
  return (
    <>
      {/* Order Items */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sản phẩm đã đặt
        </h2>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
            >
              <img
                src={
                  item.product?.images?.[0] || 'https://via.placeholder.com/80'
                }
                alt={item.product?.name || item.customTitle || 'Product'}
                className="w-16 h-16 object-cover rounded-lg"
              />

              <div className="flex-1">
                {item.isCustomOrder ? (
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {item.customTitle || 'Đơn hàng tùy chỉnh'}
                    </h3>
                    {item.customDescription && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.customDescription}
                      </p>
                    )}
                  </div>
                ) : (
                  <Link
                    to={`/shop/${item.product?.id}`}
                    className="font-medium text-gray-900 hover:text-primary"
                  >
                    {item.product?.name}
                  </Link>
                )}

                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>SL: {item.quantity}</span>
                  <span>Đơn giá: {formatPrice(item.price)}</span>
                  <span>
                    Người bán: {item.seller.firstName} {item.seller.lastName}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Shipping Address */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPinIcon className="w-5 h-5 mr-2" />
          Địa chỉ giao hàng
        </h2>

        {order.shippingAddress ? (
          <div>
            <p className="font-medium text-gray-900 mb-1">
              {order.shippingAddress.fullName}
            </p>

            {order.shippingAddress.phone && (
              <p className="text-gray-600 mb-1 flex items-center">
                <PhoneIcon className="w-4 h-4 mr-2" />
                {order.shippingAddress.phone}
              </p>
            )}

            <p className="text-gray-600">
              {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
              {order.shippingAddress.state} {order.shippingAddress.zipCode},{' '}
              {order.shippingAddress.country}
            </p>
          </div>
        ) : (
          <p className="text-gray-500">Chưa có thông tin địa chỉ</p>
        )}
      </Card>

      {/* Order Notes */}
      {order.notes && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Ghi chú đơn hàng
          </h2>
          <p className="text-gray-700">{order.notes}</p>
        </Card>
      )}
    </>
  );
};
