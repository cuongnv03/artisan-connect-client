import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import { Product } from '../../../../types/product';
import { useCart } from '../../../../contexts/CartContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { Card } from '../../../ui/Card';

interface ProductCardProps {
  product: Product;
  showSellerInfo?: boolean;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showSellerInfo = true,
  className = '',
}) => {
  const [isLiked, setIsLiked] = useState(product.isWishlisted || false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
  const { state: authState } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) return;

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, 1);
    } catch (err) {
      // Error handled in cart context
    } finally {
      setIsAddingToCart(false);
    }
  };

  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  const productUrl = `/products/${product.slug || product.id}`;

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={productUrl}>
          <img
            src={product.images?.[0] || '/placeholder-image.jpg'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {discountPercentage > 0 && (
            <Badge variant="danger" size="sm">
              -{discountPercentage}%
            </Badge>
          )}
          {product.isCustomizable && (
            <Badge variant="info" size="sm">
              Tùy chỉnh
            </Badge>
          )}
          {product.quantity === 0 && (
            <Badge variant="secondary" size="sm">
              Hết hàng
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsLiked(!isLiked)}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            {isLiked ? (
              <HeartIconSolid className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <Link
            to={productUrl}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            <EyeIcon className="w-4 h-4 text-gray-600" />
          </Link>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Seller Info */}
        {showSellerInfo && product.seller && (
          <div className="flex items-center mb-2">
            <img
              src={product.seller.avatarUrl || 'https://via.placeholder.com/24'}
              alt={`${product.seller.firstName} ${product.seller.lastName}`}
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="ml-2 text-sm text-gray-500">
              {product.seller.firstName} {product.seller.lastName}
            </span>
          </div>
        )}

        {/* Product Name */}
        <Link
          to={productUrl}
          className="block font-medium text-gray-900 hover:text-primary transition-colors mb-2"
        >
          <h3 className="line-clamp-2">{product.name}</h3>
        </Link>

        {/* Rating & Stats */}
        {product.avgRating && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-sm">
                {product.avgRating.toFixed(1)} ({product.reviewCount})
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {product.salesCount} đã bán
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {product.discountPrice ? (
              <>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.discountPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          fullWidth
          onClick={handleAddToCart}
          disabled={
            product.quantity === 0 ||
            isAddingToCart ||
            !authState.isAuthenticated
          }
          loading={isAddingToCart}
          leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
          className="justify-center"
        >
          {product.quantity === 0
            ? 'Hết hàng'
            : !authState.isAuthenticated
            ? 'Đăng nhập để mua'
            : 'Thêm vào giỏ'}
        </Button>
      </div>
    </Card>
  );
};
