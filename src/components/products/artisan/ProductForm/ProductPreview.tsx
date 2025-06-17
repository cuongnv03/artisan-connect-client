import React from 'react';
import { CreateProductRequest } from '../../../../types/product';
import { Modal } from '../../../ui/Modal';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';

interface ProductPreviewProps {
  product: CreateProductRequest;
  images: string[];
  onClose: () => void;
}

export const ProductPreview: React.FC<ProductPreviewProps> = ({
  product,
  images,
  onClose,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <Modal isOpen={true} onClose={onClose} title="Xem trước sản phẩm" size="xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <div className="space-y-4">
              <img
                src={images[0]}
                alt={product.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${product.name} ${index + 2}`}
                      className="aspect-square object-cover rounded border"
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">Chưa có hình ảnh</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {product.name || 'Tên sản phẩm'}
            </h1>

            <div className="flex items-center space-x-3 mb-4">
              <span className="text-2xl font-bold text-primary">
                {formatPrice(product.discountPrice || product.price)}
              </span>
              {product.discountPrice && (
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {product.description && (
              <p className="text-gray-600">{product.description}</p>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Specifications */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Số lượng:</span>
                <p className="font-medium">{product.quantity}</p>
              </div>
              <div>
                <span className="text-gray-600">SKU:</span>
                <p className="font-medium">{product.sku || 'Tự động tạo'}</p>
              </div>
              {product.weight && (
                <div>
                  <span className="text-gray-600">Trọng lượng:</span>
                  <p className="font-medium">{product.weight}g</p>
                </div>
              )}
            </div>

            {/* Product Features */}
            <div className="space-y-2">
              {product.isCustomizable && (
                <div className="flex items-center text-green-600 text-sm">
                  <span>✓ Có thể tùy chỉnh</span>
                </div>
              )}
              {product.allowNegotiation && (
                <div className="flex items-center text-blue-600 text-sm">
                  <span>✓ Có thể thương lượng</span>
                </div>
              )}
            </div>
          </div>

          {/* Variants Preview */}
          {product.variants && product.variants.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Biến thể ({product.variants.length})
              </h3>
              <div className="space-y-2">
                {product.variants.slice(0, 3).map((variant, index) => (
                  <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                    <span className="font-medium">
                      {variant.name || `Biến thể ${index + 1}`}
                    </span>
                    - {formatPrice(variant.price || product.price)}- SL:{' '}
                    {variant.quantity}
                  </div>
                ))}
                {product.variants.length > 3 && (
                  <p className="text-sm text-gray-500">
                    +{product.variants.length - 3} biến thể khác
                  </p>
                )}
              </div>
            </div>
          )}

          <Button fullWidth onClick={onClose}>
            Đóng xem trước
          </Button>
        </div>
      </div>
    </Modal>
  );
};
