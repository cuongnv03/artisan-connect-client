import React from 'react';
import { Card } from '../../ui/Card';
import { SellerCartGroup } from '../../../types/cart';
import { CartItemCard } from './CartItemCard';

interface SellerGroupProps {
  sellerGroup: SellerCartGroup;
  updating: string | null;
  onUpdateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => Promise<void>;
  onRemoveItem: (productId: string, variantId?: string) => Promise<void>;
  formatPrice: (price: number) => string;
}

export const SellerGroup: React.FC<SellerGroupProps> = ({
  sellerGroup,
  updating,
  onUpdateQuantity,
  onRemoveItem,
  formatPrice,
}) => {
  return (
    <Card className="p-6">
      {/* Seller Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-primary font-semibold">
              {sellerGroup.sellerInfo.name.charAt(0)}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">
              {sellerGroup.sellerInfo.shopName || sellerGroup.sellerInfo.name}
            </h3>
            <p className="text-sm text-gray-500">
              @{sellerGroup.sellerInfo.username}
              {sellerGroup.sellerInfo.isVerified && (
                <span className="ml-1 text-primary">✓</span>
              )}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Tổng</p>
          <p className="font-semibold text-primary">
            {formatPrice(sellerGroup.total)}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-4">
        {sellerGroup.items.map((item) => (
          <CartItemCard
            key={item.id}
            item={item}
            updating={updating}
            onUpdateQuantity={onUpdateQuantity}
            onRemoveItem={onRemoveItem}
            formatPrice={formatPrice}
          />
        ))}
      </div>
    </Card>
  );
};
