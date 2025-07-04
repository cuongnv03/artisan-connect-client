import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartIcon,
  StarIcon,
  ShoppingCartIcon,
  EyeIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  ScaleIcon,
  TruckIcon,
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
  size?: 'sm' | 'md' | 'lg';
  showFullInfo?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isManagementView = false,
  onEdit,
  onDelete,
  onStatusChange,
  className = '',
  size = 'md',
  showFullInfo = false,
}) => {
  const { state: authState } = useAuth();
  const { toggleWishlistItem } = useWishlist();
  const { addToCartWithLoading, loading } = useCartOperations();
  const [isWishlisted, setIsWishlisted] = useState(
    product.isWishlisted || false,
  );
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // ===== COMPLETELY FIXED: Enhanced variant logic =====
  const hasVariants =
    product.hasVariants && product.variants && product.variants.length > 0;
  const defaultVariant = hasVariants
    ? product.variants?.find((v) => v.isDefault) || product.variants?.[0]
    : null;

  // ===== FIXED: All display values based on variants =====
  const getDisplayPrice = () => {
    if (hasVariants && defaultVariant) {
      return defaultVariant.discountPrice || defaultVariant.price;
    }
    return product.discountPrice || product.price;
  };

  const getDisplayOriginalPrice = () => {
    if (hasVariants && defaultVariant) {
      return defaultVariant.price;
    }
    return product.price;
  };

  const getDisplayImage = () => {
    if (hasVariants && defaultVariant && defaultVariant.images.length > 0) {
      return defaultVariant.images[0];
    }
    return product.featuredImage || product.images[0];
  };

  const getDisplayStock = () => {
    if (hasVariants && defaultVariant) {
      return defaultVariant.quantity;
    }
    return product.quantity;
  };

  const getTotalStock = () => {
    if (hasVariants && product.variants) {
      return product.variants.reduce(
        (sum, variant) => sum + variant.quantity,
        0,
      );
    }
    return product.quantity;
  };

  // ===== FIXED: Use calculated values consistently =====
  const displayPrice = getDisplayPrice();
  const displayOriginalPrice = getDisplayOriginalPrice();
  const displayImage = getDisplayImage();
  const displayStock = getDisplayStock();
  const totalStock = getTotalStock();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  // const getStatusBadge = (status: string) => {
  //   const configs = {
  //     PUBLISHED: { variant: 'success' as const, label: 'Đang bán' },
  //     DRAFT: { variant: 'secondary' as const, label: 'Nháp' },
  //     OUT_OF_STOCK: { variant: 'warning' as const, label: 'Hết hàng' },
  //     DELETED: { variant: 'danger' as const, label: 'Đã xóa' },
  //   };
  //   return configs[status as keyof typeof configs] || configs.DRAFT;
  // };

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

  // ===== FIXED: Add to cart handler =====
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authState.isAuthenticated) return;

    // FIXED: Always pass variant ID for products with variants
    const variantId =
      hasVariants && defaultVariant ? defaultVariant.id : undefined;

    console.log('ProductCard: Adding to cart:', {
      productId: product.id,
      variantId,
      hasVariants,
      defaultVariant: defaultVariant?.name || 'N/A',
      defaultVariantPrice: defaultVariant?.price,
      displayPrice,
    });

    await addToCartWithLoading(product.id, 1, variantId);
  };

  const getProductLink = () => {
    if (isManagementView) {
      return `/products/${product.id}`;
    }
    return `/shop/${product.id}`;
  };

  const isOwner = authState.user?.id === product.seller?.id;

  // ===== FIXED: Discount calculation using display prices =====
  const hasDiscount = displayPrice < displayOriginalPrice;
  const discountPercent = hasDiscount
    ? Math.round(
        ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100,
      )
    : 0;

  // ===== FIXED: Can add to cart logic =====
  const canAddToCart =
    authState.isAuthenticated &&
    !isOwner &&
    product.status === 'PUBLISHED' &&
    displayStock > 0;

  // const statusConfig = getStatusBadge(product.status);

  const cardSizeClasses = {
    sm: 'h-80',
    md: 'h-96',
    lg: 'h-[28rem]',
  };

  const imageSizeClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-56',
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group ${cardSizeClasses[size]} ${className}`}
    >
      <Link to={getProductLink()} className="block h-full flex flex-col">
        {/* Image Section */}
        <div className={`relative ${imageSizeClasses[size]} overflow-hidden`}>
          {/* ===== UPDATED: Use display image ===== */}
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {/* <Badge variant={statusConfig.variant} size="sm">
              {statusConfig.label}
            </Badge> */}
            {hasDiscount && (
              <Badge variant="danger" size="sm">
                -{discountPercent}%
              </Badge>
            )}
            {hasVariants && (
              <Badge variant="info" size="sm">
                {product.variants!.length} tùy chọn
              </Badge>
            )}
            {product.allowNegotiation && !isManagementView && (
              <Badge variant="info" size="sm">
                <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1" />
                Có thể thương lượng
              </Badge>
            )}
          </div>

          {/* Actions Overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-1">
            {!isManagementView && authState.isAuthenticated && !isOwner && (
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all group-hover:scale-110"
              >
                {isWishlisted ? (
                  <HeartIconSolid className="w-4 h-4 text-red-500" />
                ) : (
                  <HeartIcon className="w-4 h-4 text-gray-600 hover:text-red-500" />
                )}
              </button>
            )}
          </div>

          {/* Stats Overlay */}
          <div className="absolute bottom-2 left-2 flex gap-2">
            <div className="flex items-center bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
              <EyeIcon className="w-3 h-3 mr-1" />
              {product.viewCount}
            </div>
            {product.avgRating && (
              <div className="flex items-center bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                <StarIcon className="w-3 h-3 mr-1 fill-current text-yellow-400" />
                {product.avgRating.toFixed(1)}
              </div>
            )}
          </div>

          {/* ===== FIXED: Quick Add to Cart button text ===== */}
          {canAddToCart && size !== 'sm' && (
            <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                onClick={handleAddToCart}
                loading={
                  loading[
                    `add-${product.id}${
                      hasVariants && defaultVariant
                        ? `-${defaultVariant.id}`
                        : ''
                    }`
                  ]
                }
                size="sm"
                className="w-full bg-primary/90 hover:bg-primary"
                leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
              >
                {hasVariants
                  ? `Thêm ${defaultVariant?.name || 'tùy chọn mặc định'}`
                  : 'Thêm vào giỏ'}
              </Button>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Product Name */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
            {/* ===== UPDATED: Show default variant name ===== */}
            {hasVariants && defaultVariant && defaultVariant.name && (
              <span className="text-sm text-gray-500 block font-normal">
                Mặc định: {defaultVariant.name}
              </span>
            )}
          </h3>

          {/* Seller Info */}
          {!isManagementView && product.seller && size !== 'sm' && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-1">
              {product.seller.artisanProfile?.shopName ||
                `${product.seller.firstName} ${product.seller.lastName}`}
            </p>
          )}

          {/* ===== UPDATED: Price Section using display prices ===== */}
          <div className="mb-3">
            {hasDiscount ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-bold text-red-600">
                  {formatPrice(displayPrice)}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(displayOriginalPrice)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </span>
            )}
            {/* FIXED: Show variant price indicator */}
            {hasVariants && defaultVariant && (
              <div className="text-xs text-gray-500 mt-1">
                Giá {defaultVariant.name || 'tùy chọn mặc định'}
                {product.variants!.length > 1 && (
                  <span className="ml-1">
                    ({product.variants!.length} tùy chọn)
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Categories & Tags */}
          {showFullInfo &&
            product.categories &&
            product.categories.length > 0 && (
              <div className="mb-3">
                <div className="flex flex-wrap gap-1">
                  {product.categories.slice(0, 2).map((category) => (
                    <Badge key={category.id} variant="secondary" size="sm">
                      <TagIcon className="w-3 h-3 mr-1" />
                      {category.name}
                    </Badge>
                  ))}
                  {product.categories.length > 2 && (
                    <Badge variant="secondary" size="sm">
                      +{product.categories.length - 2}
                    </Badge>
                  )}
                </div>
              </div>
            )}

          {/* Additional Info for larger cards */}
          {size === 'lg' && showFullInfo && (
            <div className="space-y-2 mb-3 text-sm text-gray-600">
              {/* ===== UPDATED: Stock Info showing total quantity ===== */}
              <div className="flex items-center justify-between">
                <span>Kho:</span>
                <span
                  className={
                    totalQuantity > 0 ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {totalQuantity > 0
                    ? `${totalQuantity} sản phẩm${hasVariants ? ' (tổng)' : ''}`
                    : 'Hết hàng'}
                </span>
              </div>

              {/* ===== UPDATED: Physical info from default variant ===== */}
              {displayWeight && (
                <div className="flex items-center gap-1">
                  <ScaleIcon className="w-3 h-3" />
                  <span>{displayWeight}kg</span>
                  {hasVariants && (
                    <span className="text-xs text-gray-500">
                      (tùy chọn mặc định)
                    </span>
                  )}
                </div>
              )}

              {/* Shipping */}
              {product.shippingInfo?.estimatedDays && (
                <div className="flex items-center gap-1">
                  <TruckIcon className="w-3 h-3" />
                  <span>Giao trong {product.shippingInfo.estimatedDays}</span>
                </div>
              )}
            </div>
          )}

          {/* ===== FIXED: Stock Info =====*/}
          {!showFullInfo && (
            <div className="text-sm text-gray-600 mb-3">
              {totalStock > 0 ? (
                <div>
                  {hasVariants ? (
                    <div>
                      <span className="text-green-600">
                        Còn {displayStock} sản phẩm{' '}
                        {defaultVariant?.name && `(${defaultVariant.name})`}
                      </span>
                      {product.variants!.length > 1 && (
                        <div className="text-xs text-gray-500 mt-1">
                          Tổng {totalStock} sản phẩm •{' '}
                          {product.variants!.length} tùy chọn
                        </div>
                      )}
                    </div>
                  ) : (
                    <span>Còn {totalStock} sản phẩm</span>
                  )}
                </div>
              ) : (
                <span className="text-red-600">Hết hàng</span>
              )}
            </div>
          )}

          {/* Rating & Sales */}
          {size !== 'sm' && (
            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
              <div className="flex items-center gap-3">
                {product.avgRating && (
                  <div className="flex items-center gap-1">
                    <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
                    <span>{product.avgRating.toFixed(1)}</span>
                    <span>({product.reviewCount})</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span>Đã bán: {product.salesCount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto">
            {isManagementView ? (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit?.();
                  }}
                  className="flex-1"
                >
                  Chỉnh sửa
                </Button>
                {product.status === 'DRAFT' && onStatusChange && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onStatusChange('PUBLISHED');
                    }}
                    className="flex-1"
                  >
                    Đăng bán
                  </Button>
                )}
                {product.status === 'PUBLISHED' && onStatusChange && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      onStatusChange('DRAFT');
                    }}
                    className="flex-1"
                  >
                    Ẩn
                  </Button>
                )}
              </div>
            ) : (
              canAddToCart &&
              size === 'sm' && (
                <Button
                  onClick={handleAddToCart}
                  loading={
                    loading[
                      `add-${product.id}${
                        hasVariants && defaultVariant
                          ? `-${defaultVariant.id}`
                          : ''
                      }`
                    ]
                  }
                  disabled={displayStock === 0}
                  size="sm"
                  className="w-full"
                  leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
                >
                  {hasVariants
                    ? `Thêm ${defaultVariant?.name || 'mặc định'}`
                    : 'Thêm vào giỏ'}
                </Button>
              )
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};
