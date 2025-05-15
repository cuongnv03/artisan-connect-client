import React from 'react';
import { formatPrice } from '../../helpers/formatters';
import { Card } from '../../components/common/Card';

interface CartSummaryProps {
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  isCheckout?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  subtotal,
  tax,
  shipping,
  discount,
  total,
  isCheckout = false,
}) => {
  return (
    <Card>
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        {isCheckout ? 'Order Summary' : 'Cart Summary'}
      </h2>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Subtotal</span>
          <span className="text-gray-900 font-medium">
            {formatPrice(subtotal)}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Shipping</span>
          <span className="text-gray-900 font-medium">
            {formatPrice(shipping)}
          </span>
        </div>

        {tax > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Tax</span>
            <span className="text-gray-900 font-medium">
              {formatPrice(tax)}
            </span>
          </div>
        )}

        {discount > 0 && (
          <div className="flex justify-between">
            <span className="text-gray-500">Discount</span>
            <span className="text-green-600 font-medium">
              -{formatPrice(discount)}
            </span>
          </div>
        )}

        <div className="pt-3 border-t border-gray-200 flex justify-between">
          <span className="text-base font-medium text-gray-900">Total</span>
          <span className="text-base font-medium text-gray-900">
            {formatPrice(total)}
          </span>
        </div>
      </div>
    </Card>
  );
};
