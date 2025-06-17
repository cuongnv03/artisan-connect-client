import React from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '../..//ui/Button';
import { CartSummary } from '../../../types/cart';

interface CartHeaderProps {
  summary: CartSummary;
  onClearCart: () => void;
}

export const CartHeader: React.FC<CartHeaderProps> = ({
  summary,
  onClearCart,
}) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Giỏ hàng của bạn
        </h1>
        <p className="text-gray-600">
          {summary.totalItems} mặt hàng, {summary.totalQuantity} sản phẩm
        </p>
      </div>

      {summary.totalItems > 0 && (
        <Button
          variant="outline"
          onClick={onClearCart}
          leftIcon={<TrashIcon className="w-4 h-4" />}
        >
          Xóa tất cả
        </Button>
      )}
    </div>
  );
};
