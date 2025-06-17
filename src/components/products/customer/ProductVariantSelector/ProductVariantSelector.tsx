import React, { useState } from 'react';
import { ProductVariant } from '../../../../types/product';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId?: string;
  onVariantChange: (variantId: string) => void;
  disabled?: boolean;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  selectedVariantId,
  onVariantChange,
  disabled = false,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    () => {
      if (selectedVariantId) {
        return variants.find((v) => v.id === selectedVariantId) || null;
      }
      return variants.find((v) => v.isDefault) || variants[0] || null;
    },
  );

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    onVariantChange(variant.id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (!variants || variants.length <= 1) {
    return null;
  }

  // Group attributes by key for display
  const attributeKeys = Array.from(
    new Set(
      variants.flatMap((variant) => Object.keys(variant.attributes || {})),
    ),
  );

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Tùy chọn sản phẩm</h4>

      {attributeKeys.map((attrKey) => {
        const values = Array.from(
          new Set(
            variants
              .filter((v) => v.attributes?.[attrKey])
              .map((v) => v.attributes[attrKey]),
          ),
        );

        const selectedValue = selectedVariant?.attributes?.[attrKey];

        return (
          <div key={attrKey} className="space-y-2">
            <label className="text-sm font-medium text-gray-700 capitalize">
              {attrKey}
            </label>
            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const variant = variants.find(
                  (v) => v.attributes?.[attrKey] === value && v.isActive,
                );

                if (!variant) return null;

                const isSelected = selectedValue === value;
                const isAvailable = variant.quantity > 0;

                return (
                  <Button
                    key={value}
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => handleVariantSelect(variant)}
                    disabled={disabled || !isAvailable}
                    className={`relative ${!isAvailable ? 'opacity-50' : ''}`}
                  >
                    {value}
                    {!isAvailable && (
                      <Badge
                        variant="danger"
                        size="sm"
                        className="absolute -top-1 -right-1"
                      >
                        Hết
                      </Badge>
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        );
      })}

      {selectedVariant && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">
                {selectedVariant.name || 'Biến thể đã chọn'}
              </p>
              <p className="text-sm text-gray-600">
                SKU: {selectedVariant.sku}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-primary">
                {formatPrice(
                  selectedVariant.discountPrice || selectedVariant.price,
                )}
              </p>
              {selectedVariant.discountPrice && (
                <p className="text-sm text-gray-500 line-through">
                  {formatPrice(selectedVariant.price)}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Còn lại: {selectedVariant.quantity}
              </p>
            </div>
          </div>

          {selectedVariant.images.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {selectedVariant.images.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${selectedVariant.name} ${index + 1}`}
                  className="w-12 h-12 object-cover rounded border"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
