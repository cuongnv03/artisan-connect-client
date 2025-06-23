import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  StarIcon,
  ShoppingCartIcon,
  EyeIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Product } from '../../types/product';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { useWishlist } from '../../hooks/wishlist/useWishlist';
import { useCartOperations } from '../../contexts/CartContext';
import { WishlistItemType } from '../../types/wishlist';
import { useAuth } from '../../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  isManagementView?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isManagementView = false,
  onEdit,
  onDelete,
  onStatusChange,
  className = '',
}) => {
  const { state: authState } = useAuth();
  const { toggleWishlistItem, checkWishlistStatus } = useWishlist();
  const { addToCartWithLoading, loading } = useCartOperations();
  const [isWishlisted, setIsWishlisted] = useState(
    product.isWishlisted || false,
  );
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      PUBLISHED: { variant: 'success' as const, label: 'Đang bán' },
      DRAFT: { variant: 'secondary' as const, label: 'Nháp' },
      OUT_OF_STOCK: { variant: 'warning' as const, label: 'Hết hàng' },
      DELETED: { variant: 'danger' as const, label: 'Đã xóa' },
    };
    return configs[status as keyof typeof configs] || configs.DRAFT;
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authState.isAuthenticated) return;

    setWishlistLoading(true);
    try {
      const newStatus = await toggleWishlistItem(
        WishlistItemType.PRODUCT,
        product.id,
      );
      setIsWishlisted(newStatus);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authState.isAuthenticated) return;

    await addToCartWithLoading(product.id, 1);
  };

  const getProductLink = () => {
    if (isManagementView) {
      return `/products/${product.id}`;
    }
    return `/shop/${product.id}`;
  };

  const isOwner = authState.user?.id === product.seller?.id;
  const canAddToCart =
    authState.isAuthenticated &&
    !isOwner &&
    product.status === 'PUBLISHED' &&
    product.quantity > 0;

  const statusConfig = getStatusBadge(product.status);
  const discountPercent = product.discountPrice
    ? Math.round(
        ((product.price - product.discountPrice) / product.price) * 100,
      )
    : 0;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow ${className}`}
    >
      <Link to={getProductLink()} className="block">
        {/* Image */}
        <div className="relative aspect-square">
          <img
            src={product.featuredImage || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <Badge variant={statusConfig.variant} size="sm">
              {statusConfig.label}
            </Badge>
            {discountPercent > 0 && (
              <Badge variant="danger" size="sm">
                -{discountPercent}%
              </Badge>
            )}
          </div>

          {/* Actions */}
          <div className="absolute top-2 right-2 flex flex-col gap-1">
            {!isManagementView && authState.isAuthenticated && !isOwner && (
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
              >
                {isWishlisted ? (
                  <HeartIconSolid className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-600" />
                )}
              </button>
            )}
          </div>

          {/* Stats overlay */}
          <div className="absolute bottom-2 left-2 flex gap-2">
            <div className="flex items-center bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              <EyeIcon className="w-3 h-3 mr-1" />
              {product.viewCount}
            </div>
            {product.avgRating && (
              <div className="flex items-center bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                <StarIcon className="w-3 h-3 mr-1" />
                {product.avgRating.toFixed(1)}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2">
            {product.name}
          </h3>

          {/* Seller */}
          {!isManagementView && product.seller && (
            <p className="text-sm text-gray-600 mb-2">
              {product.seller.artisanProfile?.shopName ||
                `${product.seller.firstName} ${product.seller.lastName}`}
            </p>
          )}

          {/* Price */}
          <div className="mb-3">
            {product.discountPrice ? (
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-red-600">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {product.categories.slice(0, 2).map((category) => (
                <Badge key={category.id} variant="secondary" size="sm">
                  {category.name}
                </Badge>
              ))}
              {product.categories.length > 2 && (
                <Badge variant="secondary" size="sm">
                  +{product.categories.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Stock info */}
          <div className="text-sm text-gray-600 mb-3">
            {product.quantity > 0 ? (
              <span>Còn {product.quantity} sản phẩm</span>
            ) : (
              <span className="text-red-600">Hết hàng</span>
            )}
          </div>
        </div>
      </Link>

      {/* Actions */}
      <div className="p-4 pt-0">
        {isManagementView ? (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1"
            >
              Chỉnh sửa
            </Button>
            {product.status === 'DRAFT' && onStatusChange && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStatusChange('PUBLISHED')}
                className="flex-1"
              >
                Đăng bán
              </Button>
            )}
            {product.status === 'PUBLISHED' && onStatusChange && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onStatusChange('DRAFT')}
                className="flex-1"
              >
                Ẩn
              </Button>
            )}
          </div>
        ) : (
          canAddToCart && (
            <Button
              onClick={handleAddToCart}
              loading={loading[`add-${product.id}`]}
              disabled={product.quantity === 0}
              className="w-full"
              leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
            >
              Thêm vào giỏ
            </Button>
          )
        )}
      </div>
    </div>
  );
};
