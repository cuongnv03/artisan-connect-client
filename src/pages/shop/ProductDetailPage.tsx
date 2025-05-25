import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  HeartIcon,
  ShoppingCartIcon,
  ShareIcon,
  StarIcon,
  ChevronLeftIcon,
  ChatBubbleLeftIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { productService } from '../../services/product.service';
import { cartService } from '../../services/cart.service';
import { reviewService } from '../../services/review.service';
import { quoteService } from '../../services/quote.service';
import { Product } from '../../types/product';
import { Review } from '../../types/product';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ImageGallery } from '../../components/common/ImageGallery';
import { Modal } from '../../components/ui/Modal';
import { useForm } from '../../hooks/useForm';

interface QuoteRequestData {
  requestedPrice: number;
  specifications: string;
  customerMessage: string;
}

interface ReviewFormData {
  rating: number;
  title: string;
  comment: string;
}

export const ProductDetailPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { success, error } = useToastContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    if (productId) {
      loadProduct();
      loadReviews();
      loadReviewStats();
    }
  }, [productId]);

  const loadProduct = async () => {
    if (!productId) return;

    try {
      const productData = await productService.getProduct(productId);
      setProduct(productData);
    } catch (err) {
      error('Không thể tải thông tin sản phẩm');
      navigate('/shop');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!productId) return;

    try {
      const reviewsResult = await reviewService.getProductReviews(productId, {
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
      setReviews(reviewsResult.data);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const loadReviewStats = async () => {
    if (!productId) return;

    try {
      const stats = await reviewService.getProductReviewStatistics(productId);
      setReviewStats(stats);
    } catch (err) {
      console.error('Error loading review stats:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;

    setAddingToCart(true);
    try {
      await cartService.addToCart(product.id, quantity);
      success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    } catch (err) {
      error('Không thể thêm sản phẩm vào giỏ hàng');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const handleRequestQuote = async (values: QuoteRequestData) => {
    if (!product) return;

    try {
      await quoteService.createQuoteRequest({
        productId: product.id,
        requestedPrice: values.requestedPrice,
        specifications: values.specifications,
        customerMessage: values.customerMessage,
      });
      success('Đã gửi yêu cầu báo giá');
      setShowQuoteModal(false);
      resetQuoteForm();
    } catch (err) {
      error('Không thể gửi yêu cầu báo giá');
    }
  };

  const handleSubmitReview = async (values: ReviewFormData) => {
    if (!product) return;

    try {
      await reviewService.createReview({
        productId: product.id,
        rating: values.rating,
        title: values.title,
        comment: values.comment,
      });
      success('Đã gửi đánh giá');
      setShowReviewModal(false);
      resetReviewForm();
      await loadReviews();
      await loadReviewStats();
    } catch (err) {
      error('Không thể gửi đánh giá');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled sharing
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        success('Đã sao chép liên kết');
      } catch (err) {
        error('Không thể sao chép liên kết');
      }
    }
  };

  const {
    values: quoteValues,
    errors: quoteErrors,
    touched: quoteTouched,
    handleChange: handleQuoteChange,
    handleSubmit: onQuoteSubmit,
    resetForm: resetQuoteForm,
    isSubmitting: isQuoteSubmitting,
  } = useForm<QuoteRequestData>({
    initialValues: {
      requestedPrice: product?.price || 0,
      specifications: '',
      customerMessage: '',
    },
    onSubmit: handleRequestQuote,
  });

  const {
    values: reviewValues,
    errors: reviewErrors,
    touched: reviewTouched,
    handleChange: handleReviewChange,
    handleSubmit: onReviewSubmit,
    resetForm: resetReviewForm,
    setFieldValue: setReviewFieldValue,
    isSubmitting: isReviewSubmitting,
  } = useForm<ReviewFormData>({
    initialValues: {
      rating: 5,
      title: '',
      comment: '',
    },
    onSubmit: handleSubmitReview,
  });

  const renderStarRating = (
    rating: number,
    size: 'sm' | 'md' | 'lg' = 'md',
  ) => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIconSolid
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const discountPercentage = product?.discountPrice
    ? Math.round((1 - product.discountPrice / product.price) * 100)
    : 0;

  const isOwner = product?.seller?.id === authState.user?.id;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Không tìm thấy sản phẩm
        </h2>
        <p className="text-gray-600 mb-4">
          Sản phẩm này không tồn tại hoặc đã bị xóa.
        </p>
        <Button onClick={() => navigate('/shop')}>Quay lại cửa hàng</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link to="/shop" className="hover:text-primary">
          Cửa hàng
        </Link>
        <ChevronLeftIcon className="w-4 h-4 rotate-180" />
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Product Images */}
        <div>
          <ImageGallery
            images={product.images}
            maxHeight="500px"
            showThumbnails={true}
          />
        </div>

        {/* Product Info */}
        <div>
          {/* Seller Info */}
          {product.seller && (
            <div className="flex items-center mb-4 p-4 bg-gray-50 rounded-lg">
              <Avatar
                src={product.seller.avatarUrl}
                alt={`${product.seller.firstName} ${product.seller.lastName}`}
                size="md"
              />
              <div className="ml-3 flex-1">
                <Link
                  to={`/profile/${product.seller.id}`}
                  className="font-medium text-gray-900 hover:text-primary"
                >
                  {product.seller.firstName} {product.seller.lastName}
                </Link>
                <p className="text-sm text-gray-500">Nghệ nhân</p>
              </div>
              {!isOwner && (
                <Button size="sm" variant="outline">
                  <ChatBubbleLeftIcon className="w-4 h-4 mr-2" />
                  Nhắn tin
                </Button>
              )}
            </div>
          )}

          {/* Product Title */}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {/* Rating */}
          {reviewStats && (
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {renderStarRating(reviewStats.averageRating)}
                <span className="ml-2 text-sm text-gray-600">
                  {reviewStats.averageRating.toFixed(1)} (
                  {reviewStats.totalReviews} đánh giá)
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {product.salesCount} đã bán
              </div>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center gap-4">
              {product.discountPrice ? (
                <>
                  <span className="text-3xl font-bold text-primary">
                    {formatPrice(product.discountPrice)}
                  </span>
                  <span className="text-lg text-gray-500 line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="danger">-{discountPercentage}%</Badge>
                </>
              ) : (
                <span className="text-3xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">
                Mô tả sản phẩm
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {product.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Thẻ</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Customizable */}
          {product.isCustomizable && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">
                🎨 Sản phẩm có thể tùy chỉnh
              </h3>
              <p className="text-blue-700 text-sm">
                Bạn có thể yêu cầu tùy chỉnh sản phẩm này theo ý muốn. Liên hệ
                trực tiếp với nghệ nhân để thảo luận chi tiết.
              </p>
            </div>
          )}

          {/* Quantity and Actions */}
          {!isOwner && (
            <div className="space-y-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-50"
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className="px-4 py-2 min-w-[50px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(Math.min(product.quantity, quantity + 1))
                      }
                      className="p-2 hover:bg-gray-50"
                      disabled={quantity >= product.quantity}
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    {product.quantity} có sẵn
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handleAddToCart}
                  loading={addingToCart}
                  disabled={product.quantity === 0}
                  leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
                  className="flex-1"
                >
                  Thêm vào giỏ
                </Button>

                <Button
                  variant="primary"
                  onClick={handleBuyNow}
                  disabled={product.quantity === 0 || addingToCart}
                  className="flex-1"
                >
                  Mua ngay
                </Button>

                <Button variant="outline" onClick={() => setIsLiked(!isLiked)}>
                  {isLiked ? (
                    <HeartIconSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5" />
                  )}
                </Button>

                <Button variant="outline" onClick={handleShare}>
                  <ShareIcon className="w-5 h-5" />
                </Button>
              </div>

              {/* Additional Actions */}
              <div className="flex gap-3">
                {product.isCustomizable && (
                  <Button
                    variant="outline"
                    onClick={() => setShowQuoteModal(true)}
                    className="flex-1"
                  >
                    Yêu cầu báo giá
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Policies */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center">
                <ShieldCheckIcon className="w-5 h-5 text-green-500 mr-2" />
                <span>Đảm bảo chất lượng</span>
              </div>
              <div className="flex items-center">
                <TruckIcon className="w-5 h-5 text-blue-500 mr-2" />
                <span>Giao hàng toàn quốc</span>
              </div>
              <div className="flex items-center">
                <ArrowPathIcon className="w-5 h-5 text-orange-500 mr-2" />
                <span>Đổi trả trong 7 ngày</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Đánh giá sản phẩm ({reviewStats?.totalReviews || 0})
          </h2>
          {!isOwner && (
            <Button variant="outline" onClick={() => setShowReviewModal(true)}>
              Viết đánh giá
            </Button>
          )}
        </div>

        {/* Review Stats */}
        {reviewStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-2">
                {reviewStats.averageRating.toFixed(1)}
              </div>
              {renderStarRating(reviewStats.averageRating, 'lg')}
              <p className="text-sm text-gray-500 mt-2">
                Dựa trên {reviewStats.totalReviews} đánh giá
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => (
                <div key={star} className="flex items-center">
                  <span className="text-sm w-8">{star}</span>
                  <StarIconSolid className="w-4 h-4 text-yellow-400 mr-2" />
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{
                        width: `${
                          reviewStats.totalReviews > 0
                            ? (reviewStats.ratingDistribution[
                                star as keyof typeof reviewStats.ratingDistribution
                              ] /
                                reviewStats.totalReviews) *
                              100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-8">
                    {
                      reviewStats.ratingDistribution[
                        star as keyof typeof reviewStats.ratingDistribution
                      ]
                    }
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-gray-200 pb-4 last:border-b-0"
            >
              <div className="flex items-start">
                <Avatar
                  src={review.user?.avatarUrl}
                  alt={`${review.user?.firstName} ${review.user?.lastName}`}
                  size="md"
                />
                <div className="ml-3 flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-gray-900">
                        {review.user?.firstName} {review.user?.lastName}
                      </p>
                      <div className="flex items-center">
                        {renderStarRating(review.rating, 'sm')}
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            'vi-VN',
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-1">
                      {review.title}
                    </h4>
                  )}

                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {reviews.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
          </p>
        )}
      </Card>

      {/* Quote Request Modal */}
      <Modal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        title="Yêu cầu báo giá"
        size="lg"
      >
        <form onSubmit={onQuoteSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Giá mong muốn (VND)
            </label>
            <input
              type="number"
              name="requestedPrice"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              value={quoteValues.requestedPrice}
              onChange={handleQuoteChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yêu cầu đặc biệt
            </label>
            <textarea
              name="specifications"
              rows={3}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Mô tả yêu cầu tùy chỉnh..."
              value={quoteValues.specifications}
              onChange={handleQuoteChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lời nhắn
            </label>
            <textarea
              name="customerMessage"
              rows={3}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Lời nhắn gửi nghệ nhân..."
              value={quoteValues.customerMessage}
              onChange={handleQuoteChange}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowQuoteModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit" loading={isQuoteSubmitting}>
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title="Viết đánh giá"
        size="lg"
      >
        <form onSubmit={onReviewSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đánh giá
            </label>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewFieldValue('rating', star)}
                  className="text-yellow-400 hover:text-yellow-500"
                >
                  <StarIconSolid
                    className={`w-6 h-6 ${
                      star <= reviewValues.rating
                        ? 'text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tiêu đề
            </label>
            <input
              type="text"
              name="title"
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Tóm tắt đánh giá của bạn..."
              value={reviewValues.title}
              onChange={handleReviewChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nhận xét
            </label>
            <textarea
              name="comment"
              rows={4}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
              value={reviewValues.comment}
              onChange={handleReviewChange}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowReviewModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit" loading={isReviewSubmitting}>
              Gửi đánh giá
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
