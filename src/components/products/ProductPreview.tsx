import React from 'react';
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ImageGallery } from '../common/ImageGallery';

interface ProductPreviewProps {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  categories: { id: string; name: string }[];
  tags: string[];
  attributes?: Record<string, any>;
  isCustomizable?: boolean;
  allowNegotiation?: boolean;
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({
  name,
  description,
  price,
  discountPrice,
  images,
  categories,
  tags,
  attributes,
  isCustomizable,
  allowNegotiation,
}) => {
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const discountPercent = discountPrice
    ? Math.round(((price - discountPrice) / price) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <ImageGallery images={images} className="w-full" />
          ) : (
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chưa có hình ảnh</p>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {name || 'Tên sản phẩm'}
            </h1>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center">
                <StarIcon className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-600 ml-1">
                  5.0 (0 đánh giá)
                </span>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-red-600">
                {formatPrice(discountPrice || price)}
              </span>
              {discountPrice && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(price)}
                  </span>
                  <Badge variant="danger" size="sm">
                    -{discountPercent}%
                  </Badge>
                </>
              )}
            </div>

            {allowNegotiation && (
              <p className="text-sm text-green-600">
                💬 Có thể thương lượng giá
              </p>
            )}
          </div>

          {/* Categories */}
          {categories.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Danh mục:</p>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge key={category.id} variant="secondary">
                    {category.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Thẻ:</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline" size="sm">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          <div className="space-y-2">
            {isCustomizable && (
              <div className="flex items-center text-sm text-blue-600">
                <span>🎨 Có thể tùy chỉnh theo yêu cầu</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                className="flex-1"
                leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
              >
                Thêm vào giỏ
              </Button>
              <Button
                variant="outline"
                leftIcon={<HeartIcon className="w-4 h-4" />}
              >
                Yêu thích
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-8 pt-8 border-t">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Mô tả sản phẩm
        </h3>
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-line">
            {description || 'Chưa có mô tả sản phẩm'}
          </p>
        </div>
      </div>

      {/* Attributes */}
      {attributes && Object.keys(attributes).length > 0 && (
        <div className="mt-8 pt-8 border-t">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thông số kỹ thuật
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(attributes).map(([key, value]) => (
              <div
                key={key}
                className="flex justify-between py-2 border-b border-gray-200"
              >
                <span className="text-gray-600 capitalize">{key}:</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
