import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  StarIcon,
  HeartIcon,
  ShareIcon,
  ShoppingCartIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useProduct } from '../../hooks/products/useProduct';
import { useProductReviews } from '../../hooks/reviews/useProductReviews';
import { useExistingNegotiation } from '../../hooks/price-negotiation/useExistingNegotiation';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useWishlist } from '../../hooks/wishlist/useWishlist';
import { ImageGallery } from '../../components/common/ImageGallery';
import { ProductVariants } from '../../components/products/ProductVariants';
import { CreateNegotiationForm } from '../../components/negotiations/CreateNegotiationForm';
import { ExistingNegotiationCard } from '../../components/negotiations/ExistingNegotiationCard';
import { ReviewsList } from '../../components/reviews/ReviewsList';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import { WishlistItemType } from '../../types/wishlist';
import { getRouteHelpers } from '../../constants/routes';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { addToCart } = useCart();
  const { toggleWishlistItem, checkWishlistStatus } = useWishlist();

  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);

  // Determine if this is management view (from /products/* route)
  const isManagementView = location.pathname.startsWith('/products');

  const { product, loading, error, isOwner, refetch } = useProduct(
    productId || '',
    isManagementView,
  );

  const {
    reviews,
    statistics,
    loading: reviewsLoading,
    loadMore: loadMoreReviews,
    hasMore: hasMoreReviews,
  } = useProductReviews(productId || '', { limit: 5 });

  const {
    existingNegotiation,
    hasActiveNegotiation,
    refetch: refetchNegotiation,
    cancelNegotiation,
  } = useExistingNegotiation(productId || '', authState.isAuthenticated);

  useEffect(() => {
    if (authState.isAuthenticated && productId) {
      checkWishlistStatus(WishlistItemType.PRODUCT, productId).then(
        setIsInWishlist,
      );
    }
  }, [authState.isAuthenticated, productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy sản phẩm
          </h1>
          <p className="text-gray-600 mb-4">
            Sản phẩm này có thể đã bị xóa hoặc không tồn tại.
          </p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)?.discountPrice ||
      product.variants?.find((v) => v.id === selectedVariant)?.price ||
      product.price
    : product.discountPrice || product.price;

  const originalPrice = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)?.price ||
      product.price
    : product.price;

  const availableQuantity = selectedVariant
    ? product.variants?.find((v) => v.id === selectedVariant)?.quantity || 0
    : product.quantity;

  const discountPercentage =
    currentPrice < originalPrice
      ? Math.round((1 - currentPrice / originalPrice) * 100)
      : 0;

  const isOutOfStock = availableQuantity <= 0;
  const canAddToCart =
    authState.isAuthenticated &&
    !isOwner &&
    !isOutOfStock &&
    product.status === 'PUBLISHED';

  const canNegotiate =
    authState.isAuthenticated &&
    !isOwner &&
    product.allowNegotiation &&
    product.status === 'PUBLISHED';

  const handleAddToCart = async () => {
    if (!canAddToCart) return;

    try {
      await addToCart(product.id, quantity, selectedVariant || undefined);
      // Show success message handled in context
    } catch (error) {
      // Error handled in context
    }
  };

  const handleWishlistToggle = async () => {
    if (!authState.isAuthenticated) return;

    try {
      const result = await toggleWishlistItem(
        WishlistItemType.PRODUCT,
        product.id,
      );
      setIsInWishlist(result);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleNegotiationSuccess = () => {
    setShowNegotiation(false);
    refetchNegotiation();
  };

  const tabs = [
    {
      key: 'description',
      label: 'Mô tả',
      content: (
        <div className="prose max-w-none">
          <p className="text-gray-700 leading-relaxed">
            {product.description || 'Chưa có mô tả cho sản phẩm này.'}
          </p>

          {/* Specifications */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Thông số kỹ thuật</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div key={key}>
                          <dt className="font-medium text-gray-900">{key}:</dt>
                          <dd className="text-gray-700">{String(value)}</dd>
                        </div>
                      ),
                    )}
                  </dl>
                </div>
              </div>
            )}
        </div>
      ),
    },
    {
      key: 'reviews',
      label: `Đánh giá (${statistics?.totalReviews || 0})`,
      content: (
        <div>
          {/* Review Summary */}
          {statistics && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-gray-900">
                      {statistics.averageRating.toFixed(1)}
                    </span>
                    <div className="ml-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <StarIcon
                            key={rating}
                            className={`w-5 h-5 ${
                              rating <= Math.round(statistics.averageRating)
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        {statistics.totalReviews} đánh giá
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-1">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center text-sm">
                      <span className="w-3">{rating}</span>
                      <StarIcon className="w-3 h-3 text-yellow-400 mx-1" />
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${
                              statistics.totalReviews > 0
                                ? (statistics.ratingDistribution[
                                    rating as keyof typeof statistics.ratingDistribution
                                  ] /
                                    statistics.totalReviews) *
                                  100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-600 w-8">
                        {
                          statistics.ratingDistribution[
                            rating as keyof typeof statistics.ratingDistribution
                          ]
                        }
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <ReviewsList
            reviews={reviews}
            loading={reviewsLoading}
            onLoadMore={hasMoreReviews ? loadMoreReviews : undefined}
          />
        </div>
      ),
    },
  ];

  // Add negotiation tab if applicable
  if (canNegotiate) {
    tabs.push({
      key: 'negotiation',
      label: 'Thương lượng giá',
      content: (
        <div>
          {hasActiveNegotiation && existingNegotiation ? (
            <ExistingNegotiationCard
              negotiation={existingNegotiation}
              onCancel={cancelNegotiation}
              onCreateNew={() => setShowNegotiation(true)}
            />
          ) : (
            <CreateNegotiationForm
              product={product}
              onSuccess={handleNegotiationSuccess}
              onCancel={() => setShowNegotiation(false)}
            />
          )}
        </div>
      ),
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <button
            onClick={() => navigate(isManagementView ? '/products' : '/shop')}
            className="hover:text-primary"
          >
            {isManagementView ? 'Quản lý sản phẩm' : 'Cửa hàng'}
          </button>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
          <div>
            <ImageGallery
              images={product.images}
              className="rounded-lg overflow-hidden"
            />
          </div>

          {/* Product Info */}
          <div>
            {/* Title and Basic Info */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Seller Info (for shop view) */}
              {!isManagementView && product.seller && (
                <div className="flex items-center mb-4">
                  <span className="text-gray-600">bởi</span>
                  <button
                    onClick={() => navigate(`/artisan/${product.seller!.id}`)}
                    className="ml-2 font-medium text-primary hover:underline"
                  >
                    {product.seller.artisanProfile?.shopName ||
                      `${product.seller.firstName} ${product.seller.lastName}`}
                  </button>
                  {product.seller.artisanProfile?.isVerified && (
                    <Badge variant="success" size="sm" className="ml-2">
                      Đã xác minh
                    </Badge>
                  )}
                </div>
              )}

              {/* Rating and Reviews */}
              {statistics && statistics.totalReviews > 0 && (
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <StarIcon
                        key={rating}
                        className={`w-4 h-4 ${
                          rating <= Math.round(statistics.averageRating)
                            ? 'text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">
                    {statistics.averageRating.toFixed(1)} (
                    {statistics.totalReviews} đánh giá)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-bold text-primary">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(currentPrice)}
                </span>
                {discountPercentage > 0 && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(originalPrice)}
                    </span>
                    <Badge variant="danger">-{discountPercentage}%</Badge>
                  </>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {isOutOfStock ? (
                  <Badge variant="danger" size="lg">
                    Hết hàng
                  </Badge>
                ) : (
                  <span className="text-green-600 font-medium">
                    Còn {availableQuantity} sản phẩm
                  </span>
                )}
              </div>
            </div>

            {/* Variants */}
            {product.hasVariants &&
              product.variants &&
              product.variants.length > 0 && (
                <div className="mb-6">
                  <ProductVariants
                    variants={product.variants}
                    selectedVariant={selectedVariant}
                    onVariantChange={setSelectedVariant}
                  />
                </div>
              )}

            {/* Quantity Selector */}
            {!isManagementView && canAddToCart && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="w-16 text-center font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(availableQuantity, quantity + 1))
                    }
                    className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-4">
              {!isManagementView && (
                <div className="flex space-x-4">
                  <Button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className="flex-1"
                    size="lg"
                    leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
                  >
                    {isOwner
                      ? 'Sản phẩm của bạn'
                      : isOutOfStock
                      ? 'Hết hàng'
                      : 'Thêm vào giỏ'}
                  </Button>

                  {authState.isAuthenticated && (
                    <Button
                      onClick={handleWishlistToggle}
                      variant="outline"
                      size="lg"
                      leftIcon={
                        isInWishlist ? (
                          <HeartIconSolid className="w-5 h-5 text-red-500" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )
                      }
                    >
                      {isInWishlist ? 'Đã thích' : 'Yêu thích'}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="lg"
                    leftIcon={<ShareIcon className="w-5 h-5" />}
                    onClick={() => {
                      navigator.share?.({
                        title: product.name,
                        url: window.location.href,
                      }) || navigator.clipboard.writeText(window.location.href);
                    }}
                  >
                    Chia sẻ
                  </Button>
                </div>
              )}

              {/* Management Actions */}
              {isManagementView && isOwner && (
                <div className="flex space-x-4">
                  <Button
                    onClick={() =>
                      navigate(getRouteHelpers.editProduct(product.id))
                    }
                    className="flex-1"
                    size="lg"
                  >
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant={
                      product.status === 'PUBLISHED' ? 'outline' : 'primary'
                    }
                    size="lg"
                    onClick={() => {
                      // Handle status change
                    }}
                  >
                    {product.status === 'PUBLISHED'
                      ? 'Ẩn sản phẩm'
                      : 'Xuất bản'}
                  </Button>
                </div>
              )}

              {/* Negotiation Button */}
              {canNegotiate && !hasActiveNegotiation && (
                <Button
                  onClick={() => setActiveTab('negotiation')}
                  variant="outline"
                  fullWidth
                  size="lg"
                  leftIcon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
                >
                  Thương lượng giá
                </Button>
              )}
            </div>

            {/* Quick Info */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">SKU:</span>
                <span className="ml-2 font-medium">{product.sku || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-600">Lượt xem:</span>
                <span className="ml-2 font-medium">{product.viewCount}</span>
              </div>
              {product.weight && (
                <div>
                  <span className="text-gray-600">Khối lượng:</span>
                  <span className="ml-2 font-medium">{product.weight}g</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Đã bán:</span>
                <span className="ml-2 font-medium">{product.salesCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Card className="p-6">
          <Tabs
            items={tabs}
            activeKey={activeTab}
            onChange={setActiveTab}
            variant="line"
          />
        </Card>
      </div>
    </div>
  );
};
