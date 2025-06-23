import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  TagIcon,
  TruckIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
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

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { success, error: showError } = useToastContext();

  // Determine if this is management view based on URL
  const isManagementView = window.location.pathname.startsWith('/products/');

  const { product, loading, error, isOwner, refetch } = useProduct(
    productId!,
    isManagementView,
  );
  const { reviews, statistics, loadProductReviews } = useProductReviews(
    productId!,
    { page: 1, limit: 5 },
  );
  const {
    existingNegotiation,
    hasActiveNegotiation,
    refetch: refetchNegotiation,
    cancelNegotiation,
    canceling,
  } = useExistingNegotiation(productId!, authState.isAuthenticated && !isOwner);

  const { addToCartWithLoading, loading: cartLoading } = useCartOperations();
  const { toggleWishlistItem, checkWishlistStatus } = useWishlist();

  // Component state
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showNegotiationForm, setShowNegotiationForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      label: 'Mô tả',
      content: (
        <div className="prose max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">
            {product.description || 'Chưa có mô tả cho sản phẩm này.'}
          </p>

          {/* Specifications */}
          {product.specifications &&
            Object.keys(product.specifications).length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông số kỹ thuật
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {Object.entries(product.specifications).map(
                      ([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm font-medium text-gray-500">
                            {key}
                          </dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            {String(value)}
                          </dd>
                        </div>
                      ),
                    )}
                  </dl>
                </div>
              </div>
            )}

          {/* Shipping Info */}
          {product.shippingInfo && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin vận chuyển
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center text-blue-800">
                  <TruckIcon className="w-5 h-5 mr-2" />
                  <span className="text-sm">
                    {JSON.stringify(product.shippingInfo)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'reviews',
      label: `Đánh giá (${product.reviewCount})`,
      content: (
        <div className="space-y-6">
          {statistics && <ReviewStats statistics={statistics} />}
          <ReviewsList
            reviews={reviews}
            onFilterChange={(filters) => loadProductReviews(filters)}
          />
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
        {/* Management View Header */}
        {isManagementView && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-4">
                  <li>
                    <Link
                      to="/products"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Sản phẩm của tôi
                    </Link>
                  </li>
                  <li>
                    <span className="text-gray-400">/</span>
                  </li>
                  <li>
                    <span className="text-gray-900">{product.name}</span>
                  </li>
                </ol>
              </nav>

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
            </div>
          </div>
        )}

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
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 border rounded-lg text-left transition-colors ${
                        selectedVariant?.id === variant.id
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium text-sm">
                        {variant.name || 'Tùy chọn'}
                      </div>
                      <div className="text-xs text-gray-600">
                        {Object.entries(variant.attributes)
                          .map(([key, value]) => `${key}: ${value}`)
                          .join(', ')}
                      </div>
                      <div className="text-sm font-medium text-primary mt-1">
                        {formatPrice(variant.discountPrice || variant.price)}
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
