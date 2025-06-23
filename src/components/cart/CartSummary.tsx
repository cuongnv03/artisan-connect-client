import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CartSummary as CartSummaryType } from '../../types/cart';

interface CartSummaryProps {
  summary: CartSummaryType;
  onCheckout: () => void;
  formatPrice: (price: number) => string;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  summary,
  onCheckout,
  formatPrice,
}) => {
  return (
    <Card className="p-6 sticky top-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Tóm tắt đơn hàng
      </h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600">
            Tạm tính ({summary.totalQuantity} sản phẩm)
          </span>
          <span className="font-medium">{formatPrice(summary.subtotal)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Phí vận chuyển</span>
          <span className="font-medium">
            {summary.total > summary.subtotal
              ? formatPrice(summary.total - summary.subtotal)
              : 'Tính khi thanh toán'}
          </span>
        </div>

        <hr className="my-4" />

        <div className="flex justify-between text-lg font-semibold">
          <span>Tổng cộng</span>
          <span className="text-primary">{formatPrice(summary.total)}</span>
        </div>

        <Button
          fullWidth
          onClick={onCheckout}
          className="mt-6"
          leftIcon={<ShoppingBagIcon className="w-4 h-4" />}
        >
          Tiến hành thanh toán
        </Button>

        <Link to="/products">
          <Button variant="outline" fullWidth className="mt-3">
            Tiếp tục mua sắm
          </Button>
        </Link>
      </div>

      {/* Negotiated Items Warning */}
      {summary.hasNegotiatedItems && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            💰 Giỏ hàng có sản phẩm với giá đã thương lượng
          </p>
        </div>
      )}

      {/* Seller breakdown */}
      {summary.groupedBySeller.length > 1 && (
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Phân theo người bán
          </h3>
          <div className="space-y-2">
            {summary.groupedBySeller.map((group) => (
              <div
                key={group.sellerId}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-600">
                  {group.sellerInfo.shopName || group.sellerInfo.name}
                </span>
                <span className="font-medium">{formatPrice(group.total)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
