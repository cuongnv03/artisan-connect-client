import React from 'react';
import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CartItem } from '../../../types/cart';
import { LoadingSpinner } from '../../ui/LoadingSpinner';

interface CartItemCardProps {
  item: CartItem;
  updating: string | null;
  onUpdateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => Promise<void>;
  onRemoveItem: (productId: string, variantId?: string) => Promise<void>;
  formatPrice: (price: number) => string;
}

export const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  updating,
  onUpdateQuantity,
  onRemoveItem,
  formatPrice,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={item.product?.images?.[0] || 'https://via.placeholder.com/150'}
          alt={item.product?.name || 'Product'}
          className="w-24 h-24 object-cover rounded-lg"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link
              to={`/products/${item.product?.slug || item.productId}`}
              className="font-medium text-gray-900 hover:text-primary"
            >
              {item.product?.name || 'Unknown Product'}
            </Link>

            {/* Variant Info */}
            {item.variant && item.variant.attributes && (
              <div className="text-sm text-gray-600 mt-1">
                {Array.isArray(item.variant.attributes)
                  ? item.variant.attributes.map((attr) => (
                      <span key={attr.key} className="mr-2">
                        {attr.name}: {attr.value}
                      </span>
                    ))
                  : Object.entries(item.variant.attributes).map(
                      ([key, value]) => (
                        <span key={key} className="mr-2">
                          {key}: {String(value)}
                        </span>
                      ),
                    )}
              </div>
            )}

            {/* Price info */}
            <div className="text-sm text-gray-600 mt-1">
              {item.product?.discountPrice &&
              item.product.discountPrice < item.product.price ? (
                <>
                  <span className="text-primary font-medium">
                    {formatPrice(item.product.discountPrice)}
                  </span>
                  <span className="ml-2 line-through text-gray-400">
                    {formatPrice(item.product.price)}
                  </span>
                </>
              ) : (
                <span className="text-gray-900 font-medium">
                  {formatPrice(item.product?.price || item.price)}
                </span>
              )}
            </div>

            {/* Negotiated Price Warning */}
            {item.negotiationId && (
              <div className="text-sm text-blue-600 mt-1">
                💰 Giá đã thương lượng
              </div>
            )}

            {/* Stock warning */}
            {item.product && item.product.quantity < item.quantity && (
              <p className="text-sm text-red-500 mt-1">
                ⚠️ Chỉ còn {item.product.quantity} sản phẩm
              </p>
            )}
          </div>

          <button
            onClick={() => onRemoveItem(item.productId, item.variantId)}
            disabled={updating === item.productId}
            className="text-gray-400 hover:text-red-500 p-1"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Quantity */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Số lượng:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() =>
                  onUpdateQuantity(
                    item.productId,
                    item.quantity - 1,
                    item.variantId,
                  )
                }
                disabled={updating === item.productId || item.quantity <= 1}
                className="p-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 min-w-[50px] text-center">
                {updating === item.productId ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  item.quantity
                )}
              </span>
              <button
                onClick={() =>
                  onUpdateQuantity(
                    item.productId,
                    item.quantity + 1,
                    item.variantId,
                  )
                }
                disabled={
                  updating === item.productId ||
                  (item.product && item.quantity >= item.product.quantity)
                }
                className="p-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">
              {formatPrice(
                (item.product?.discountPrice ||
                  item.product?.price ||
                  item.price) * item.quantity,
              )}
            </div>
            {item.quantity > 1 && (
              <div className="text-sm text-gray-500">
                {formatPrice(
                  item.product?.discountPrice ||
                    item.product?.price ||
                    item.price,
                )}{' '}
                x {item.quantity}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
