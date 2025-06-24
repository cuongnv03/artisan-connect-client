import React from 'react';
import { Link } from 'react-router-dom';
import { OrderItemWithDetails } from '../../types/order';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface OrderItemsListProps {
  items: OrderItemWithDetails[];
  formatPrice: (price: number) => string;
  showSeller?: boolean;
  compact?: boolean;
}

export const OrderItemsList: React.FC<OrderItemsListProps> = ({
  items,
  formatPrice,
  showSeller = true,
  compact = false,
}) => {
  if (compact) {
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
          >
            <img
              src={
                item.product?.images?.[0] || 'https://via.placeholder.com/48'
              }
              alt={item.product?.name || item.customTitle || 'Product'}
              className="w-12 h-12 object-cover rounded-lg"
            />

            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {item.isCustomOrder ? item.customTitle : item.product?.name}
              </p>
              <p className="text-sm text-gray-500">
                {item.quantity} x {formatPrice(item.price)}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold text-gray-900">
                {formatPrice(item.price * item.quantity)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sản phẩm đã đặt ({items.length})
      </h3>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
          >
            <img
              src={
                item.product?.images?.[0] || 'https://via.placeholder.com/80'
              }
              alt={item.product?.name || item.customTitle || 'Product'}
              className="w-20 h-20 object-cover rounded-lg"
            />

            <div className="flex-1 min-w-0">
              <div className="mb-2">
                {item.isCustomOrder ? (
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {item.customTitle || 'Đơn hàng tùy chỉnh'}
                    </h4>
                    {item.customDescription && (
                      <p className="text-sm text-gray-600 mt-1">
                        {item.customDescription}
                      </p>
                    )}
                    <Badge variant="info" size="sm" className="mt-1">
                      Sản phẩm tùy chỉnh
                    </Badge>
                  </div>
                ) : (
                  <div>
                    {item.product?.id ? (
                      <Link
                        to={`/shop/${item.product.id}`}
                        className="font-medium text-gray-900 hover:text-primary"
                      >
                        {item.product.name}
                      </Link>
                    ) : (
                      <h4 className="font-medium text-gray-900">
                        {item.product?.name || 'Sản phẩm'}
                      </h4>
                    )}

                    {item.variant && (
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">
                          Phiên bản: {item.variant.name || item.variant.sku}
                        </p>
                        {item.variant.attributes && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.variant.attributes).map(
                              ([key, value]) => (
                                <Badge key={key} variant="secondary" size="sm">
                                  {key}: {value}
                                </Badge>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Số lượng: {item.quantity}</span>
                  <span>Đơn giá: {formatPrice(item.price)}</span>

                  {showSeller && (
                    <span>
                      Người bán: {item.seller.firstName} {item.seller.lastName}
                      {item.seller.artisanProfile?.shopName && (
                        <span className="ml-1">
                          ({item.seller.artisanProfile.shopName})
                        </span>
                      )}
                      {item.seller.artisanProfile?.isVerified && (
                        <Badge variant="success" size="sm" className="ml-1">
                          Đã xác minh
                        </Badge>
                      )}
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
