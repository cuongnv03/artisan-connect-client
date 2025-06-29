import React from 'react';
import { Link } from 'react-router-dom';
import { MinusIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { CartItem } from '../../../types/cart';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { Badge } from '../../ui/Badge';

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
  // ===== UPDATED: Create unique key for loading state =====
  const itemKey = `${item.productId}${
    item.variantId ? `-${item.variantId}` : ''
  }`;
  const isUpdating = updating === itemKey;

  // ===== UPDATED: Get display image (variant image or product image) =====
  const getDisplayImage = () => {
    if (item.variant && item.variant.images.length > 0) {
      return item.variant.images[0];
    }
    return item.product?.images?.[0] || 'https://via.placeholder.com/150';
  };

  // ===== UPDATED: Get current price (variant price or product price) =====
  const getCurrentPrice = () => {
    // If item has negotiation, use the negotiated price stored in item.price
    if (item.negotiationId && item.negotiation) {
      return item.negotiation.finalPrice;
    }

    // If item has negotiationId but no negotiation details, use item.price (which should be negotiated price)
    if (item.negotiationId) {
      return item.price;
    }

    // Otherwise, use variant or product price
    if (item.variant) {
      return item.variant.discountPrice || item.variant.price;
    }
    return item.product?.discountPrice || item.product?.price || item.price;
  };

  const getOriginalPrice = () => {
    // If item has negotiation, show original price for comparison
    if (item.negotiationId && item.negotiation) {
      return item.negotiation.originalPrice;
    }

    // Otherwise, show regular price hierarchy
    if (item.variant) {
      return item.variant.price;
    }
    return item.product?.price || item.price;
  };

  const currentPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const hasDiscount = (() => {
    if (item.negotiationId) {
      // For negotiated items, there's always a "discount" compared to original price
      return originalPrice > currentPrice;
    }
    // For regular items, check if discountPrice exists
    return currentPrice < originalPrice;
  })();

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <img
          src={getDisplayImage()}
          alt={item.product?.name || 'Product'}
          className="w-24 h-24 object-cover rounded-lg"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <Link
              to={`/shop/${item.productId}`}
              className="font-medium text-gray-900 hover:text-primary"
            >
              {item.product?.name || 'Unknown Product'}
            </Link>

            {/* ===== FIXED: Variant Info with proper attributes handling ===== */}
            {item.variant && (
              <div className="mt-2 space-y-1">
                {item.variant.name && (
                  <div className="text-sm">
                    <Badge variant="secondary" size="sm">
                      {item.variant.name}
                    </Badge>
                  </div>
                )}

                {/* FIXED: Handle both array and object formats for attributes */}
                {item.variant.attributes && (
                  <div className="text-sm text-gray-600">
                    {(() => {
                      // Check if attributes is an array or object
                      if (Array.isArray(item.variant.attributes)) {
                        // Handle array format: [{"key":"size","name":"Size","value":"Nhỏ"}]
                        return item.variant.attributes.map(
                          (attr: any, index: number) => (
                            <span
                              key={attr.key || index}
                              className="mr-3 inline-block"
                            >
                              <span className="font-medium">
                                {attr.name || attr.key}:
                              </span>{' '}
                              <span className="text-gray-800">
                                {attr.value}
                              </span>
                            </span>
                          ),
                        );
                      } else if (typeof item.variant.attributes === 'object') {
                        // Handle object format: {"color": "Xanh", "size": "M"}
                        return Object.entries(item.variant.attributes).map(
                          ([key, value]) => (
                            <span key={key} className="mr-3 inline-block">
                              <span className="font-medium capitalize">
                                {key}:
                              </span>{' '}
                              <span className="text-gray-800">
                                {String(value)}
                              </span>
                            </span>
                          ),
                        );
                      } else {
                        // Fallback for string or other formats
                        return (
                          <span className="text-gray-500 italic">
                            {String(item.variant.attributes)}
                          </span>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* ===== UPDATED: Price info using current prices ===== */}
            <div className="text-sm text-gray-600 mt-2">
              {item.negotiationId ? (
                // Negotiated price display
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 font-bold">
                      {formatPrice(currentPrice)}
                    </span>
                    <Badge variant="success" size="sm">
                      Giá thương lượng
                    </Badge>
                  </div>
                  {hasDiscount && (
                    <div className="text-xs text-gray-500">
                      <span className="line-through">
                        Giá gốc: {formatPrice(originalPrice)}
                      </span>
                      <span className="ml-2 text-green-600">
                        Tiết kiệm: {formatPrice(originalPrice - currentPrice)}
                      </span>
                    </div>
                  )}
                </div>
              ) : hasDiscount ? (
                // Regular discount display
                <>
                  <span className="text-primary font-medium">
                    {formatPrice(currentPrice)}
                  </span>
                  <span className="ml-2 line-through text-gray-400">
                    {formatPrice(originalPrice)}
                  </span>
                </>
              ) : (
                // Regular price display
                <span className="text-gray-900 font-medium">
                  {formatPrice(currentPrice)}
                </span>
              )}
            </div>

            {/* Negotiated Price Warning */}
            {item.negotiationId && (
              <div className="text-sm text-blue-600 mt-1">
                💰 Giá đã thương lượng
              </div>
            )}

            {/* ===== UPDATED: Stock warning based on variant or product ===== */}
            {(() => {
              const availableStock =
                item.variant?.quantity || item.product?.quantity || 0;
              return (
                availableStock < item.quantity && (
                  <p className="text-sm text-red-500 mt-1">
                    ⚠️ Chỉ còn {availableStock} sản phẩm
                  </p>
                )
              );
            })()}
          </div>

          <button
            onClick={() => onRemoveItem(item.productId, item.variantId)}
            disabled={isUpdating}
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
                disabled={isUpdating || item.quantity <= 1}
                className="p-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <MinusIcon className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 min-w-[50px] text-center">
                {isUpdating ? <LoadingSpinner size="sm" /> : item.quantity}
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
                  isUpdating ||
                  (() => {
                    const availableStock =
                      item.variant?.quantity || item.product?.quantity || 0;
                    return item.quantity >= availableStock;
                  })()
                }
                className="p-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <PlusIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ===== UPDATED: Price calculation using current price ===== */}
          <div className="text-right">
            <div className="text-lg font-semibold text-primary">
              {formatPrice(currentPrice * item.quantity)}
            </div>
            {item.quantity > 1 && (
              <div className="text-sm text-gray-500">
                {formatPrice(currentPrice)} x {item.quantity}
              </div>
            )}

            {/* Show savings for negotiated items */}
            {item.negotiationId && hasDiscount && (
              <div className="text-xs text-green-600 mt-1">
                Tiết kiệm:{' '}
                {formatPrice((originalPrice - currentPrice) * item.quantity)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
