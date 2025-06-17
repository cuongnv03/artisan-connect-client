import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  HeartIcon,
  EyeIcon,
  ShoppingCartIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { WishlistWithDetails, WishlistItemType } from '../../types/wishlist';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';

interface WishlistItemProps {
  item: WishlistWithDetails;
  onRemove?: (itemType: WishlistItemType, itemId: string) => void;
  onAddToCart?: (productId: string) => void;
  className?: string;
}

export const WishlistItem: React.FC<WishlistItemProps> = ({
  item,
  onRemove,
  onAddToCart,
  className = '',
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleRemove = () => {
    const itemId =
      item.itemType === WishlistItemType.PRODUCT
        ? item.productId!
        : item.postId!;
    onRemove?.(item.itemType, itemId);
  };

  const handleAddToCart = () => {
    if (item.product?.id) {
      onAddToCart?.(item.product.id);
    }
  };

  if (item.itemType === WishlistItemType.PRODUCT && item.product) {
    const product = item.product;
    const currentPrice = product.discountPrice || product.price;
    const discountPercentage = product.discountPrice
      ? Math.round((1 - product.discountPrice / product.price) * 100)
      : 0;

    return (
      <Card
        className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}
      >
        <div className="flex">
          {/* Product Image */}
          <div className="w-32 h-32 flex-shrink-0">
            <Link to={`/products/${product.slug || product.id}`}>
              <img
                src={product.images[0] || '/placeholder-image.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </Link>
          </div>

          {/* Product Info */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Seller */}
                <div className="flex items-center mb-2">
                  <Avatar
                    src={product.seller.avatarUrl}
                    alt={`${product.seller.firstName} ${product.seller.lastName}`}
                    size="xs"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {product.seller.artisanProfile?.shopName ||
                      `${product.seller.firstName} ${product.seller.lastName}`}
                  </span>
                  {product.seller.artisanProfile?.isVerified && (
                    <Badge variant="info" size="sm" className="ml-2">
                      Đã xác thực
                    </Badge>
                  )}
                </div>

                {/* Product Name */}
                <Link
                  to={`/products/${product.slug || product.id}`}
                  className="block font-medium text-gray-900 hover:text-primary transition-colors mb-2"
                >
                  <h3 className="line-clamp-2">{product.name}</h3>
                </Link>

                {/* Rating & Reviews */}
                {product.avgRating && (
                  <div className="flex items-center mb-2">
                    <StarIcon className="w-4 h-4 text-yellow-400 mr-1" />
                    <span className="text-sm">
                      {product.avgRating.toFixed(1)} ({product.reviewCount})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center space-x-2 mb-3">
                  <span className="text-lg font-bold text-primary">
                    {formatPrice(currentPrice)}
                  </span>
                  {discountPercentage > 0 && (
                    <>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </span>
                      <Badge variant="danger" size="sm">
                        -{discountPercentage}%
                      </Badge>
                    </>
                  )}
                </div>

                {/* Added time */}
                <p className="text-xs text-gray-500">
                  Đã thêm{' '}
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  leftIcon={<HeartIconSolid className="w-4 h-4 text-red-500" />}
                >
                  Bỏ thích
                </Button>
                <Link to={`/products/${product.slug || product.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<EyeIcon className="w-4 h-4" />}
                  >
                    Xem
                  </Button>
                </Link>
                {onAddToCart && product.status === 'PUBLISHED' && (
                  <Button
                    size="sm"
                    onClick={handleAddToCart}
                    leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
                  >
                    Thêm vào giỏ
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (item.itemType === WishlistItemType.POST && item.post) {
    const post = item.post;

    return (
      <Card
        className={`overflow-hidden hover:shadow-md transition-shadow ${className}`}
      >
        <div className="flex">
          {/* Post Thumbnail */}
          <div className="w-32 h-32 flex-shrink-0">
            <Link to={`/posts/${post.slug || post.id}`}>
              <img
                src={post.thumbnailUrl || '/placeholder-image.jpg'}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </Link>
          </div>

          {/* Post Info */}
          <div className="flex-1 p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Author */}
                <div className="flex items-center mb-2">
                  <Avatar
                    src={post.user.avatarUrl}
                    alt={`${post.user.firstName} ${post.user.lastName}`}
                    size="xs"
                  />
                  <span className="ml-2 text-sm text-gray-600">
                    {post.user.artisanProfile?.shopName ||
                      `${post.user.firstName} ${post.user.lastName}`}
                  </span>
                  {post.user.artisanProfile?.isVerified && (
                    <Badge variant="info" size="sm" className="ml-2">
                      Đã xác thực
                    </Badge>
                  )}
                </div>

                {/* Post Title */}
                <Link
                  to={`/posts/${post.slug || post.id}`}
                  className="block font-medium text-gray-900 hover:text-primary transition-colors mb-2"
                >
                  <h3 className="line-clamp-2">{post.title}</h3>
                </Link>

                {/* Summary */}
                {post.summary && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {post.summary}
                  </p>
                )}

                {/* Type & Date */}
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="secondary" size="sm">
                    {post.type}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(post.createdAt), {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </span>
                </div>

                {/* Added time */}
                <p className="text-xs text-gray-500">
                  Đã thêm{' '}
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-2 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemove}
                  leftIcon={<HeartIconSolid className="w-4 h-4 text-red-500" />}
                >
                  Bỏ thích
                </Button>
                <Link to={`/posts/${post.slug || post.id}`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<EyeIcon className="w-4 h-4" />}
                  >
                    Xem
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};
