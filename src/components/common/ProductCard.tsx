import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  ShoppingCartIcon,
  StarIcon,
  EyeIcon,
  SwatchIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import { Product, ProductVariant } from '../../types/product';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';

interface ProductCardProps {
  product: Product;
  showSellerInfo?: boolean;
  variant?: 'grid' | 'list';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showSellerInfo = false,
  variant = 'grid',
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants?.find((v) => v.isDefault) || product.variants?.[0] || null,
  );
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addToCart } = useCart();
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
      return;
    }

    const effectiveQuantity = selectedVariant?.quantity || product.quantity;
    if (effectiveQuantity === 0) {
      return;
    }

    setIsAddingToCart(true);
    try {
      await addToCart(product.id, 1, selectedVariant?.id);
    } catch (err: any) {
      // Error already handled in cart context
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Use variant price if selected, otherwise product price
  const currentPrice = selectedVariant?.price || product.price;
  const currentDiscountPrice =
    selectedVariant?.discountPrice || product.discountPrice;
  const currentQuantity = selectedVariant?.quantity || product.quantity;
  const currentImages = selectedVariant?.images?.length
    ? selectedVariant.images
    : product.images;

  const discountPercentage = currentDiscountPrice
    ? Math.round((1 - currentDiscountPrice / currentPrice) * 100)
    : 0;

  // Get unique variant attributes for quick selection
  const getVariantOptions = () => {
    if (!product.variants || product.variants.length <= 1) return null;

    const attributeGroups: Record<string, Set<string>> = {};

    product.variants.forEach((variant) => {
      variant.attributes.forEach((attr) => {
        if (!attributeGroups[attr.key]) {
          attributeGroups[attr.key] = new Set();
        }
        attributeGroups[attr.key].add(attr.value);
      });
    });

    return Object.entries(attributeGroups).map(([key, values]) => ({
      key,
      name: key.charAt(0).toUpperCase() + key.slice(1),
      values: Array.from(values),
    }));
  };

  const variantOptions = getVariantOptions();

  const handleVariantChange = (attributeKey: string, value: string) => {
    if (!product.variants) return;

    // Find variant that matches the selected attribute
    const matchingVariant = product.variants.find((variant) =>
      variant.attributes.some(
        (attr) => attr.key === attributeKey && attr.value === value,
      ),
    );

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
    }
  };

  if (variant === 'list') {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300">
        <div className="flex">
          {/* Product Image */}
          <div className="relative w-48 h-48 flex-shrink-0 overflow-hidden bg-gray-100">
            <Link to={`/products/${product.slug || product.id}`}>
              <img
                src={currentImages?.[0] || '/placeholder-image.jpg'}
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
              {product.hasVariants && (
                <Badge variant="info" size="sm">
                  <SwatchIcon className="w-3 h-3 mr-1" />
                  Nhiều lựa chọn
                </Badge>
              )}
              {product.isCustomizable && (
                <Badge variant="info" size="sm">
                  Tùy chỉnh
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex-1 p-4">
            <div className="flex justify-between">
              <div className="flex-1">
                {/* Seller Info */}
                {showSellerInfo && product.seller && (
                  <div className="flex items-center mb-2">
                    <img
                      src={
                        product.seller.avatarUrl ||
                        'https://via.placeholder.com/24'
                      }
                      alt={`${product.seller.firstName} ${product.seller.lastName}`}
                      className="w-5 h-5 rounded-full object-cover"
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

                {/* Rating & Stats */}
                {product.avgRating && (
                  <div className="flex items-center gap-4 mb-2">
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

                {/* Variant Options */}
                {variantOptions && (
                  <div className="mb-3">
                    {variantOptions.slice(0, 1).map((option) => (
                      <div key={option.key} className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          {option.name}:
                        </span>
                        <div className="flex gap-1">
                          {option.values.slice(0, 3).map((value) => (
                            <button
                              key={value}
                              onClick={() =>
                                handleVariantChange(option.key, value)
                              }
                              className={`px-2 py-1 text-xs border rounded ${
                                selectedVariant?.attributes.some(
                                  (attr) =>
                                    attr.key === option.key &&
                                    attr.value === value,
                                )
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                              }`}
                            >
                              {value}
                            </button>
                          ))}
                          {option.values.length > 3 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{option.values.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-center space-x-2 mb-3">
                  {currentDiscountPrice ? (
                    <>
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(currentDiscountPrice)}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {formatPrice(currentPrice)}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(currentPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 ml-4">
                <Button
                  size="sm"
                  onClick={handleAddToCart}
                  disabled={currentQuantity === 0 || isAddingToCart}
                  loading={isAddingToCart}
                  leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
                >
                  {currentQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
                </Button>

                <div className="flex gap-1">
                  <button
                    onClick={handleLike}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    {isLiked ? (
                      <HeartIconSolid className="w-4 h-4 text-red-500" />
                    ) : (
                      <HeartIcon className="w-4 h-4" />
                    )}
                  </button>
                  <Link
                    to={`/products/${product.slug || product.id}`}
                    className="p-2 text-gray-400 hover:text-primary transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid variant (default)
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Product Images */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Link to={`/products/${product.slug || product.id}`}>
          <img
            src={
              currentImages?.[currentImageIndex] ||
              currentImages?.[0] ||
              '/placeholder-image.jpg'
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Image Indicators */}
        {currentImages && currentImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="flex space-x-1">
              {currentImages.slice(0, 5).map((_, index) => (
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
          {product.hasVariants && (
            <Badge variant="info" size="sm">
              <SwatchIcon className="w-3 h-3 mr-1" />
              Nhiều lựa chọn
            </Badge>
          )}
          {product.isCustomizable && (
            <Badge variant="info" size="sm">
              Tùy chỉnh
            </Badge>
          )}
          {currentQuantity === 0 && (
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

        {/* Variant Options (quick selection) */}
        {variantOptions && variantOptions.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {variantOptions[0].values.slice(0, 4).map((value) => (
                <button
                  key={value}
                  onClick={() =>
                    handleVariantChange(variantOptions[0].key, value)
                  }
                  className={`px-2 py-1 text-xs border rounded ${
                    selectedVariant?.attributes.some(
                      (attr) =>
                        attr.key === variantOptions[0].key &&
                        attr.value === value,
                    )
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                  }`}
                >
                  {value}
                </button>
              ))}
              {variantOptions[0].values.length > 4 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{variantOptions[0].values.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
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
            {currentDiscountPrice ? (
              <>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(currentDiscountPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(currentPrice)}
                </span>
              </>
            ) : (
              <span className="text-lg font-bold text-primary">
                {formatPrice(currentPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          fullWidth
          onClick={handleAddToCart}
          disabled={currentQuantity === 0 || isAddingToCart}
          loading={isAddingToCart}
          leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
          className="justify-center"
        >
          {currentQuantity === 0 ? 'Hết hàng' : 'Thêm vào giỏ'}
        </Button>
      </div>
    </Card>
  );
};
