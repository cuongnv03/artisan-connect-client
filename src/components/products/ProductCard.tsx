import React from 'react';
import { Link } from 'react-router-dom';
import {
  StarIcon,
  HeartIcon,
  ShoppingCartIcon,
  EyeIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { Product } from '../../types/product';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../hooks/wishlist/useWishlist';
import { WishlistItemType } from '../../types/wishlist';
import { getRouteHelpers } from '../../constants/routes';

interface ProductCardProps {
  product: Product;
  viewMode: 'shop' | 'management';
  onEdit?: () => void;
  onStatusChange?: (newStatus: string) => void;
  onDelete?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode,
  onEdit,
  onStatusChange,
  onDelete,
  className = '',
}) => {
  const { state: authState } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlistItem, checkWishlistStatus } = useWishlist();
  const [isInWishlist, setIsInWishlist] = React.useState(false);
  const [wishlistLoading, setWishlistLoading] = React.useState(false);

  const currentPrice = product.discountPrice || product.price;
  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  const isOwner =
    authState.user?.role === 'ARTISAN' &&
    product.seller?.id === authState.user.id;
  const isOutOfStock = product.quantity <= 0;
  const canAddToCart =
    authState.isAuthenticated &&
    !isOwner &&
    !isOutOfStock &&
    product.status === 'PUBLISHED';

  // Check wishlist status
  React.useEffect(() => {
    if (authState.isAuthenticated && viewMode === 'shop') {
      checkWishlistStatus(WishlistItemType.PRODUCT, product.id).then(
        setIsInWishlist,
      );
    }
  }, [authState.isAuthenticated, product.id, viewMode]);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!canAddToCart) return;

    try {
      await addToCart(product.id, 1);
    } catch (error) {
      // Error handled in context
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authState.isAuthenticated || wishlistLoading) return;

    setWishlistLoading(true);
    try {
      const result = await toggleWishlistItem(
        WishlistItemType.PRODUCT,
        product.id,
      );
      setIsInWishlist(result);
    } catch (error) {
      // Error handled in hook
    } finally {
      setWishlistLoading(false);
    }
  };

  const getProductLink = () => {
    if (viewMode === 'management') {
      return getRouteHelpers.productDetail(product.id);
    }
    return getRouteHelpers.shopProductDetail(product.id);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'success';
      case 'DRAFT':
        return 'warning';
      case 'OUT_OF_STOCK':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Đã xuất bản';
      case 'DRAFT':
        return 'Bản nháp';
      case 'OUT_OF_STOCK':
        return 'Hết hàng';
      default:
        return status;
    }
  };

  return (
    <Card
      className={`group hover:shadow-lg transition-all ${className}`}
      padding={false}
    >
      <Link to={getProductLink()} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg">
          <img
            src={product.featuredImage || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discountPercentage > 0 && (
              <Badge variant="danger" size="sm">
                -{discountPercentage}%
              </Badge>
            )}
            {viewMode === 'management' && (
              <Badge variant={getStatusBadgeVariant(product.status)} size="sm">
                {getStatusLabel(product.status)}
              </Badge>
            )}
          </div>

          {/* Wishlist button for shop view */}
          {viewMode === 'shop' && authState.isAuthenticated && (
            <button
              onClick={handleWishlistToggle}
              disabled={wishlistLoading}
              className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
              {isInWishlist ? (
                <HeartIconSolid className="w-5 h-5 text-red-500" />
              ) : (
                <HeartIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          )}

          {/* Quick actions for management view */}
          {viewMode === 'management' && (
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit?.();
                  }}
                  leftIcon={<PencilIcon className="w-4 h-4" />}
                >
                  Sửa
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Title */}
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>

          {/* Seller info for shop view */}
          {viewMode === 'shop' && product.seller && (
            <div className="flex items-center mb-2 text-sm text-gray-600">
              <span>bởi</span>
              <span className="ml-1 font-medium">
                {product.seller.artisanProfile?.shopName ||
                  `${product.seller.firstName} ${product.seller.lastName}`}
              </span>
              {product.seller.artisanProfile?.isVerified && (
                <span className="ml-1 text-blue-500">✓</span>
              )}
            </div>
          )}

          {/* Price */}
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-lg font-bold text-primary">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(currentPrice)}
            </span>
            {discountPercentage > 0 && (
              <span className="text-sm text-gray-500 line-through">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND',
                }).format(product.price)}
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center space-x-4">
              {product.avgRating && (
                <div className="flex items-center">
                  <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                  <span>{product.avgRating.toFixed(1)}</span>
                  <span className="ml-1">({product.reviewCount})</span>
                </div>
              )}
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-1" />
                <span>{product.viewCount}</span>
              </div>
            </div>
            <span className="text-xs">
              {isOutOfStock ? 'Hết hàng' : `Còn ${product.quantity}`}
            </span>
          </div>

          {/* Actions */}
          {viewMode === 'shop' && (
            <Button
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              fullWidth
              size="sm"
              leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
            >
              {isOwner
                ? 'Sản phẩm của bạn'
                : isOutOfStock
                ? 'Hết hàng'
                : 'Thêm vào giỏ'}
            </Button>
          )}

          {viewMode === 'management' && (
            <div className="flex space-x-2">
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit?.();
                }}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Chỉnh sửa
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  // Handle status change
                }}
                size="sm"
                className="flex-1"
              >
                {product.status === 'PUBLISHED' ? 'Ẩn' : 'Xuất bản'}
              </Button>
            </div>
          )}
        </div>
      </Link>
    </Card>
  );
};
