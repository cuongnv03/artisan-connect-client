import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  TagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ScaleIcon,
  CubeIcon,
  SwatchIcon,
  SparklesIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { ImageGallery } from '../../components/common/ImageGallery';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Tabs } from '../../components/ui/Tabs';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { CreateNegotiationForm } from '../../components/negotiations/CreateNegotiationForm';
import { ExistingNegotiationCard } from '../../components/negotiations/ExistingNegotiationCard';
import { ReviewsList } from '../../components/reviews/ReviewsList';
import { ReviewStats } from '../../components/reviews/ReviewStats';
import { Modal } from '../../components/ui/Modal';
import { useProduct } from '../../hooks/products/useProduct';
import { useProductReviews } from '../../hooks/reviews/useProductReviews';
import { useExistingNegotiation } from '../../hooks/price-negotiation/useExistingNegotiation';
import { useCartOperations } from '../../contexts/CartContext';
import { useWishlist } from '../../hooks/wishlist/useWishlist';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { WishlistItemType } from '../../types/wishlist';
import { ProductVariant } from '../../types/product';
import { reviewService } from '../../services/review.service';
import { useReview } from '../../hooks/reviews/useReview';
import { ReviewForm } from '@/components/reviews/ReviewForm';

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state: authState } = useAuth();
  const { success, error: showError } = useToastContext();

  // Determine if this is management view based on URL
  const isManagementView = location.pathname.startsWith('/products/');
  const isShopView = location.pathname.startsWith('/shop/');

  const { product, loading, error, isOwner, refetch } = useProduct(
    productId!,
    isManagementView,
  );
  const {
    reviews,
    statistics,
    loadProductReviews,
    refetch: refetchReviews,
  } = useProductReviews(productId!, { page: 1, limit: 5 });
  const {
    existingNegotiation,
    hasActiveNegotiation,
    refetch: refetchNegotiation,
    cancelNegotiation,
    canceling,
  } = useExistingNegotiation(productId!, authState.isAuthenticated && !isOwner);

  const { addToCartWithLoading, loading: cartLoading } = useCartOperations();
  const { toggleWishlistItem, checkWishlistStatus } = useWishlist();
  const { createReview, loading: createReviewLoading } = useReview();

  // Component state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showNegotiationForm, setShowNegotiationForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // NEW: Review states
  const [canWriteReview, setCanWriteReview] = useState(false);
  const [userExistingReview, setUserExistingReview] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewEligibilityLoading, setReviewEligibilityLoading] =
    useState(false);
  const [currentReviewCount, setCurrentReviewCount] = useState(0);

  // Check wishlist status
  useEffect(() => {
    if (product && authState.isAuthenticated && !isOwner) {
      checkWishlistStatus(WishlistItemType.PRODUCT, product.id)
        .then(setIsWishlisted)
        .catch(() => setIsWishlisted(false));
    }
  }, [product, authState.isAuthenticated, isOwner]);

  // Set default variant
  useEffect(() => {
    if (product?.variants?.length) {
      const defaultVariant =
        product.variants.find((v) => v.isDefault) || product.variants[0];
      setSelectedVariant(defaultVariant);
    }
  }, [product]);

  // NEW: Check if user can write review
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!authState.isAuthenticated || isOwner || !product) {
        setCanWriteReview(false);
        setUserExistingReview(null);
        return;
      }

      setReviewEligibilityLoading(true);
      try {
        // Check if user already has a review
        const existingReview = await reviewService.getReviewByUserAndProduct(
          product.id,
        );
        setUserExistingReview(existingReview);

        // Check if user can write review (has purchased but not reviewed)
        if (!existingReview) {
          const reviewableProducts =
            await reviewService.getReviewableProducts();
          const canReview = reviewableProducts.some(
            (item) => item.productId === product.id,
          );
          setCanWriteReview(canReview);
        } else {
          setCanWriteReview(false);
        }
      } catch (error) {
        console.error('Error checking review eligibility:', error);
        setCanWriteReview(false);
        setUserExistingReview(null);
      } finally {
        setReviewEligibilityLoading(false);
      }
    };

    checkReviewEligibility();
  }, [product, authState.isAuthenticated, isOwner]);

  // Update review count khi statistics thay đổi
  useEffect(() => {
    if (statistics) {
      setCurrentReviewCount(statistics.totalReviews);
    } else if (product) {
      setCurrentReviewCount(product.reviewCount);
    }
  }, [statistics, product]);

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
          <p className="text-red-600 mb-4">
            {error || 'Không tìm thấy sản phẩm'}
          </p>
          <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getCurrentPrice = () => {
    if (selectedVariant) {
      return selectedVariant.discountPrice || selectedVariant.price;
    }
    return product.discountPrice || product.price;
  };

  const getCurrentAttributes = () => {
    if (selectedVariant && selectedVariant.attributes) {
      return selectedVariant.attributes;
    }
    return product.attributes || {};
  };

  const getOriginalPrice = () => {
    if (selectedVariant) {
      return selectedVariant.price;
    }
    return product.price;
  };

  const getAvailableQuantity = () => {
    if (selectedVariant) {
      return selectedVariant.quantity;
    }
    return product.quantity;
  };

  const getBackPath = () => {
    if (isManagementView) {
      return '/products'; // Back to artisan product management
    } else if (isShopView) {
      return '/shop'; // Back to shop
    }
    return '/'; // Default fallback
  };

  const getBackLabel = () => {
    if (isManagementView) {
      return 'Quay lại quản lý sản phẩm';
    } else if (isShopView) {
      return 'Quay lại cửa hàng';
    }
    return 'Quay lại';
  };

  const handleAddToCart = async () => {
    if (!authState.isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    if (isOwner) {
      showError('Bạn không thể mua sản phẩm của chính mình');
      return;
    }

    await addToCartWithLoading(product.id, quantity, selectedVariant?.id);
  };

  const handleWishlistToggle = async () => {
    if (!authState.isAuthenticated) {
      navigate('/auth/login');
      return;
    }

    const newStatus = await toggleWishlistItem(
      WishlistItemType.PRODUCT,
      product.id,
    );
    setIsWishlisted(newStatus);
  };

  const handleEdit = () => {
    navigate(`/products/${product.id}/edit`);
  };

  const handleDelete = async () => {
    try {
      // Call delete API
      success('Đã xóa sản phẩm thành công');
      navigate('/products');
    } catch (err: any) {
      showError(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      // Call status change API
      success(`Đã ${status === 'PUBLISHED' ? 'đăng bán' : 'ẩn'} sản phẩm`);
      refetch();
    } catch (err: any) {
      showError(err.message || 'Không thể thay đổi trạng thái');
    }
  };

  // NEW: Handle review submission
  const handleCreateReview = async (data: any) => {
    if (!product) return;

    try {
      // Optimistic update - tăng count ngay lập tức
      setCurrentReviewCount((prev) => prev + 1);

      const result = await createReview({
        ...data,
        productId: product.id,
      });

      if (result) {
        setShowReviewForm(false);
        setCanWriteReview(false);
        setUserExistingReview(result);

        // Refresh data to get accurate count
        await refetchReviews();

        success('Đánh giá của bạn đã được gửi thành công!');
      }
    } catch (error) {
      // Revert optimistic update on error
      setCurrentReviewCount((prev) => Math.max(0, prev - 1));
      // Error sẽ được handle bởi createReview hook
    }
  };

  const currentPrice = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const availableQuantity = getAvailableQuantity();
  const hasDiscount = currentPrice < originalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const canAddToCart =
    authState.isAuthenticated &&
    !isOwner &&
    product.status === 'PUBLISHED' &&
    availableQuantity > 0;
  const canNegotiate =
    authState.isAuthenticated &&
    !isOwner &&
    product.allowNegotiation &&
    product.status === 'PUBLISHED';

  const tabItems = [
    {
      key: 'description',
      label: 'Mô tả sản phẩm',
      content: (
        <div className="space-y-8">
          {/* Main Description */}
          <div className="prose max-w-none">
            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {product.description || 'Chưa có mô tả cho sản phẩm này.'}
            </div>
          </div>

          {/* UPDATED: Product Attributes - Show from selected variant */}
          {(() => {
            const currentAttributes = getCurrentAttributes();
            return (
              Object.keys(currentAttributes).length > 0 && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <SwatchIcon className="w-5 h-5 mr-2" />
                    {selectedVariant
                      ? 'Thuộc tính tùy chọn'
                      : 'Thuộc tính sản phẩm'}
                    {selectedVariant && (
                      <Badge variant="primary" size="sm" className="ml-2">
                        {selectedVariant.name || 'Tùy chọn hiện tại'}
                      </Badge>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(currentAttributes).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-2 border-b border-gray-100"
                      >
                        <dt className="font-medium text-gray-600">{key}:</dt>
                        <dd className="text-gray-900">{String(value)}</dd>
                      </div>
                    ))}
                  </div>
                </Card>
              )
            );
          })()}

          {/* Specifications - Only from product level */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CubeIcon className="w-5 h-5 mr-2" />
                  Thông số kỹ thuật
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(product.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between py-3 border-b border-gray-100"
                      >
                        <dt className="font-medium text-gray-600">{key}:</dt>
                        <dd className="text-gray-900 text-right">
                          {String(value)}
                        </dd>
                      </div>
                    ),
                  )}
                </div>
              </Card>
            )}

          {/* Custom Fields - Only from product level */}
          {product.customFields &&
            Object.keys(product.customFields).length > 0 && (
              <Card className="p-6 bg-amber-50 border-amber-200">
                <h3 className="text-lg font-semibold text-amber-900 mb-4 flex items-center">
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  Điểm đặc biệt
                </h3>
                <div className="space-y-3">
                  {Object.entries(product.customFields).map(([key, value]) => (
                    <div key={key} className="border-l-4 border-amber-400 pl-4">
                      <dt className="font-medium text-amber-800">{key}</dt>
                      <dd className="text-amber-700 mt-1">{String(value)}</dd>
                    </div>
                  ))}
                </div>
              </Card>
            )}

          {/* UPDATED: Physical Properties - Show from selected variant if available */}
          {(() => {
            const currentWeight = selectedVariant?.weight || product.weight;
            const currentDimensions =
              selectedVariant?.dimensions || product.dimensions;

            return (
              (currentWeight || currentDimensions) && (
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <ScaleIcon className="w-5 h-5 mr-2" />
                    Thông tin vật lý
                    {selectedVariant && (
                      <Badge variant="info" size="sm" className="ml-2">
                        Của tùy chọn hiện tại
                      </Badge>
                    )}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentWeight && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="font-medium text-gray-600">
                          Trọng lượng:
                        </dt>
                        <dd className="text-gray-900">{currentWeight} kg</dd>
                      </div>
                    )}
                    {currentDimensions && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <dt className="font-medium text-gray-600">
                          Kích thước:
                        </dt>
                        <dd className="text-gray-900">
                          {[
                            currentDimensions.length &&
                              `${currentDimensions.length}${
                                currentDimensions.unit || 'cm'
                              }`,
                            currentDimensions.width &&
                              `${currentDimensions.width}${
                                currentDimensions.unit || 'cm'
                              }`,
                            currentDimensions.height &&
                              `${currentDimensions.height}${
                                currentDimensions.unit || 'cm'
                              }`,
                          ]
                            .filter(Boolean)
                            .join(' × ') || 'Chưa có thông tin'}
                        </dd>
                      </div>
                    )}
                  </div>
                </Card>
              )
            );
          })()}

          {/* Shipping Info - Only from product level */}
          {product.shippingInfo && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <TruckIcon className="w-5 h-5 mr-2" />
                Thông tin vận chuyển
              </h3>
              <div className="space-y-3">
                {product.shippingInfo.estimatedDays && (
                  <div className="flex items-center text-blue-800">
                    <span className="font-medium mr-2">
                      Thời gian giao hàng:
                    </span>
                    <span>{product.shippingInfo.estimatedDays}</span>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      ),
    },
    {
      key: 'reviews',
      label: `Đánh giá (${currentReviewCount})`,
      content: (
        <div className="space-y-6">
          {/* Review Statistics */}
          {statistics && <ReviewStats statistics={statistics} />}

          {/* NEW: Write Review Section */}
          {authState.isAuthenticated && !isOwner && (
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Đánh giá của bạn
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {userExistingReview
                      ? 'Bạn đã đánh giá sản phẩm này'
                      : canWriteReview
                      ? 'Chia sẻ trải nghiệm của bạn về sản phẩm này'
                      : 'Bạn cần mua sản phẩm để có thể đánh giá'}
                  </p>
                </div>

                <div className="flex gap-3">
                  {userExistingReview ? (
                    <div className="text-right">
                      <div className="flex items-center justify-end mb-1">
                        {[...Array(5)].map((_, i) => (
                          <StarIcon
                            key={i}
                            className={`w-4 h-4 ${
                              i < userExistingReview.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <Badge variant="success" size="sm">
                        Đã đánh giá {userExistingReview.rating}/5 sao
                      </Badge>
                    </div>
                  ) : canWriteReview ? (
                    <Button
                      onClick={() => setShowReviewForm(true)}
                      leftIcon={<StarIcon className="w-4 h-4" />}
                      loading={reviewEligibilityLoading}
                    >
                      Viết đánh giá
                    </Button>
                  ) : authState.isAuthenticated ? (
                    <Badge variant="secondary" size="sm">
                      Chưa mua sản phẩm
                    </Badge>
                  ) : null}
                </div>
              </div>

              {/* Show user's existing review */}
              {userExistingReview && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  {userExistingReview.title && (
                    <h4 className="font-medium text-gray-900 mb-2">
                      {userExistingReview.title}
                    </h4>
                  )}
                  {userExistingReview.comment && (
                    <p className="text-gray-700 mb-3">
                      {userExistingReview.comment}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>
                      Đánh giá vào{' '}
                      {new Date(
                        userExistingReview.createdAt,
                      ).toLocaleDateString('vi-VN')}
                    </span>
                    {userExistingReview.isVerifiedPurchase && (
                      <Badge variant="success" size="sm">
                        Đã mua hàng
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Guest message */}
          {!authState.isAuthenticated && (
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="text-center">
                <StarIcon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-medium text-blue-900 mb-2">
                  Đăng nhập để viết đánh giá
                </h3>
                <p className="text-blue-700 text-sm mb-4">
                  Chỉ những khách hàng đã mua sản phẩm mới có thể viết đánh giá
                </p>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/auth/login')}
                  size="sm"
                >
                  Đăng nhập ngay
                </Button>
              </div>
            </Card>
          )}

          {/* Reviews List */}
          <ReviewsList
            reviews={reviews}
            onFilterChange={(filters) => loadProductReviews(filters)}
          />

          {/* UPDATED: Show empty state with current count */}
          {currentReviewCount === 0 && (
            <Card className="p-8 text-center">
              <StarIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chưa có đánh giá nào
              </h3>
              <p className="text-gray-600 mb-4">
                Hãy là người đầu tiên đánh giá sản phẩm này
              </p>
              {canWriteReview && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  leftIcon={<StarIcon className="w-4 h-4" />}
                >
                  Viết đánh giá đầu tiên
                </Button>
              )}
            </Card>
          )}
        </div>
      ),
    },
  ];

  if (canNegotiate) {
    tabItems.push({
      key: 'negotiation',
      label: 'Thương lượng giá',
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center text-green-800">
              <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
              <div>
                <h4 className="font-medium">Thương lượng giá với nghệ nhân</h4>
                <p className="text-sm mt-1">
                  Bạn có thể đề xuất mức giá phù hợp cho sản phẩm này
                </p>
              </div>
            </div>
          </div>

          {hasActiveNegotiation && existingNegotiation ? (
            <ExistingNegotiationCard
              negotiation={existingNegotiation}
              onCancel={cancelNegotiation}
              onCreateNew={() => setShowNegotiationForm(true)}
              canceling={canceling}
            />
          ) : (
            <CreateNegotiationForm
              product={product}
              onSuccess={() => {
                refetchNegotiation();
                setShowNegotiationForm(false);
              }}
            />
          )}
        </div>
      ),
    });
  }

  return (
    <>
      <Helmet>
        <title>{product.name} - Artisan Connect</title>
        <meta
          name="description"
          content={product.description || product.name}
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Universal Back Navigation */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <nav className="flex" aria-label="Breadcrumb">
              <Button
                variant="ghost"
                onClick={() => navigate(getBackPath())}
                leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
                className="mb-4"
              >
                {getBackLabel()}
              </Button>
            </nav>

            {/* Management View Actions */}
            {isManagementView && isOwner && (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  leftIcon={<PencilIcon className="w-4 h-4" />}
                >
                  Chỉnh sửa
                </Button>

                {product.status === 'DRAFT' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange('PUBLISHED')}
                  >
                    Đăng bán
                  </Button>
                )}

                {product.status === 'PUBLISHED' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleStatusChange('DRAFT')}
                  >
                    Ẩn sản phẩm
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteModal(true)}
                  leftIcon={<TrashIcon className="w-4 h-4" />}
                  className="text-red-600 hover:text-red-700"
                >
                  Xóa
                </Button>
              </div>
            )}
          </div>

          {/* Breadcrumb for different views */}
          <nav className="flex text-sm text-gray-500" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              {isManagementView ? (
                <>
                  <li>
                    <Link
                      to="/products"
                      className="hover:text-gray-700 transition-colors"
                    >
                      Sản phẩm của tôi
                    </Link>
                  </li>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                  <li>
                    <span className="text-gray-900">{product.name}</span>
                  </li>
                </>
              ) : isShopView ? (
                <>
                  <li>
                    <Link
                      to="/shop"
                      className="hover:text-gray-700 transition-colors"
                    >
                      Cửa hàng
                    </Link>
                  </li>
                  <li>
                    <span className="mx-2">/</span>
                  </li>
                  {product.categories && product.categories.length > 0 && (
                    <>
                      <li>
                        <Link
                          to={`/shop/categories/${product.categories[0].slug}`}
                          className="hover:text-gray-700 transition-colors"
                        >
                          {product.categories[0].name}
                        </Link>
                      </li>
                      <li>
                        <span className="mx-2">/</span>
                      </li>
                    </>
                  )}
                  <li>
                    <span className="text-gray-900">{product.name}</span>
                  </li>
                </>
              ) : (
                <li>
                  <span className="text-gray-900">{product.name}</span>
                </li>
              )}
            </ol>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Images */}
          <div>
            <ImageGallery
              images={
                selectedVariant?.images.length
                  ? selectedVariant.images
                  : product.images
              }
              className="sticky top-4"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  product.status === 'PUBLISHED'
                    ? 'success'
                    : product.status === 'DRAFT'
                    ? 'secondary'
                    : product.status === 'OUT_OF_STOCK'
                    ? 'warning'
                    : 'danger'
                }
              >
                {product.status === 'PUBLISHED'
                  ? 'Đang bán'
                  : product.status === 'DRAFT'
                  ? 'Nháp'
                  : product.status === 'OUT_OF_STOCK'
                  ? 'Hết hàng'
                  : 'Đã xóa'}
              </Badge>

              {hasDiscount && (
                <Badge variant="danger">-{discountPercent}%</Badge>
              )}

              {/* Management view indicator */}
              {isManagementView && (
                <Badge variant="info" size="sm">
                  Chế độ quản lý
                </Badge>
              )}
            </div>

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Seller Info */}
              {!isManagementView && product.seller && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Bởi</span>
                  <Link
                    to={`/artisan/${product.seller.id}`}
                    className="text-primary hover:underline font-medium"
                  >
                    {product.seller.artisanProfile?.shopName ||
                      `${product.seller.firstName} ${product.seller.lastName}`}
                  </Link>
                  {product.seller.artisanProfile?.isVerified && (
                    <ShieldCheckIcon className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              )}
            </div>

            {/* Rating & Stats */}
            <div className="flex items-center gap-6">
              {product.avgRating && (
                <div className="flex items-center gap-1">
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium">
                    {product.avgRating.toFixed(1)}
                  </span>
                  <span className="text-gray-600">
                    ({product.reviewCount} đánh giá)
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1 text-gray-600">
                <EyeIcon className="w-4 h-4" />
                <span>{product.viewCount} lượt xem</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-red-600">
                  {formatPrice(currentPrice)}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {product.allowNegotiation && !isOwner && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Có thể thương lượng giá
                </p>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Tùy chọn sản phẩm</h3>
                <div className="grid grid-cols-1 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {variant.name || 'Tùy chọn'}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {Object.entries(variant.attributes)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Còn {variant.quantity} sản phẩm
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-primary">
                            {formatPrice(
                              variant.discountPrice || variant.price,
                            )}
                          </div>
                          {variant.discountPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {formatPrice(variant.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Số lượng</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(
                          1,
                          Math.min(availableQuantity, Number(e.target.value)),
                        ),
                      )
                    }
                    className="w-20 text-center border-0"
                    min={1}
                    max={availableQuantity}
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(availableQuantity, quantity + 1))
                    }
                    className="p-2 hover:bg-gray-100"
                    disabled={quantity >= availableQuantity}
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {availableQuantity} sản phẩm có sẵn
                </span>
              </div>
            </div>

            {/* Actions */}
            {!isManagementView && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  {canAddToCart && (
                    <Button
                      onClick={handleAddToCart}
                      loading={cartLoading[`add-${product.id}`]}
                      disabled={availableQuantity === 0}
                      className="flex-1"
                      leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
                    >
                      Thêm vào giỏ
                    </Button>
                  )}

                  {authState.isAuthenticated && !isOwner && (
                    <Button
                      variant="outline"
                      onClick={handleWishlistToggle}
                      leftIcon={
                        isWishlisted ? (
                          <HeartIconSolid className="w-5 h-5 text-red-500" />
                        ) : (
                          <HeartIcon className="w-5 h-5" />
                        )
                      }
                    >
                      {isWishlisted ? 'Đã yêu thích' : 'Yêu thích'}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    leftIcon={<ShareIcon className="w-5 h-5" />}
                  >
                    Chia sẻ
                  </Button>
                </div>

                {!authState.isAuthenticated && (
                  <p className="text-sm text-gray-600 text-center">
                    <Link
                      to="/auth/login"
                      className="text-primary hover:underline"
                    >
                      Đăng nhập
                    </Link>{' '}
                    để mua hàng và tương tác với sản phẩm
                  </p>
                )}
              </div>
            )}

            {/* Categories */}
            {product.categories && product.categories.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Danh mục</h3>
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <Badge key={category.id} variant="secondary">
                      <TagIcon className="w-3 h-3 mr-1" />
                      {category.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">Thẻ</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline" size="sm">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs items={tabItems} />

        {/* NEW: Review Form Modal */}
        <Modal
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
          title={`Đánh giá sản phẩm: ${product.name}`}
          size="lg"
        >
          <ReviewForm
            productId={product.id}
            onSubmit={handleCreateReview}
            onCancel={() => setShowReviewForm(false)}
            loading={createReviewLoading}
          />
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Xác nhận xóa sản phẩm"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa sản phẩm "{product.name}"? Hành động này
              không thể hoàn tác.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Hủy
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Xóa sản phẩm
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};
