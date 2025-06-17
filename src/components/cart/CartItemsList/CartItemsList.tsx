import React from 'react';
import { CartSummary } from '../../../types/cart';
import { SellerGroup } from './SellerGroup';

interface CartItemsListProps {
  summary: CartSummary;
  updating: string | null;
  onUpdateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => Promise<void>;
  onRemoveItem: (productId: string, variantId?: string) => Promise<void>;
  formatPrice: (price: number) => string;
}

export const CartItemsList: React.FC<CartItemsListProps> = ({
  summary,
  updating,
  onUpdateQuantity,
  onRemoveItem,
  formatPrice,
}) => {
  return (
    <div className="space-y-6">
      {summary.groupedBySeller.map((sellerGroup) => (
        <SellerGroup
          key={sellerGroup.sellerId}
          sellerGroup={sellerGroup}
          updating={updating}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          formatPrice={formatPrice}
        />
      ))}
    </div>
  );
};
