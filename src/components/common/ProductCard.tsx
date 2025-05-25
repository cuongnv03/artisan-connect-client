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
import { Product } from '../../types/product';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cartService } from '../../services/cart.service';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  showSellerInfo?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showSellerInfo = false,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { success, error } = useToastContext();
  const { state: authState } = useAuth();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleLike = async () => {
    try {
      setIsLiked(!isLiked);
      // TODO: Call API to toggle like
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) {
      error('Vui lòng đăng nhập để thêm vào giỏ hàng');
      return;
    }

    if (product.quantity === 0) {
      error('Sản phẩm đã hết hàng');
      return;
    }

    setIsAddingToCart(true);
    try {
      await cartService.addToCart(product.id, 1);
      success('Đã thêm sản phẩm vào giỏ hàng');
    } catch (err: any) {
      error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const discountPercentage = product.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Product Images */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/products/${product.slug || product.id}`}>
          <img
            src={product.images[currentImageIndex] || product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Image Indicators */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              {product.images.slice(0, 5).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

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
            onClick={handleLike}
            className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            {isLiked ? (
              <HeartIconSolid className="w-4 h-4 text-red-500" />
            ) : (
              <HeartIcon className="w-4 h-4 text-gray-600" />
            )}
          </button>
          <Link
            to={`/products/${product.slug || product.id}`}
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
          to={`/products/${product.slug || product.id}`}
          className="block font-medium text-gray-900 hover:text-primary transition-colors mb-2"
        >
          <h3 className="line-clamp-2">{product.name}</h3>
        </Link>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="secondary" size="sm">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Rating & Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="flex items-center mr-3">
              <StarIconSolid className="w-4 h-4 text-yellow-400 mr-1" />
              <span className="text-sm">
                {product.avgRating?.toFixed(1) || 'N/A'}
              </span>
              <span className="text-sm text-gray-500 ml-1">
                ({product.reviewCount})
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {product.salesCount} đã bán
            </span>
          </div>
        </div>

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
          disabled={product.quantity === 0 || isAddingToCart}
          loading={isAddingToCart}
          leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
          className="justify-center"
        >
          {product.quantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </Button>
      </div>
    </Card>
  );
};
