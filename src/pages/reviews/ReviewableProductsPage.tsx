import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, ShoppingBagIcon } from '@heroicons/react/24/outline';
import { useReviewableProducts } from '../../hooks/reviews/useReviewableProducts';
import { useReview } from '../../hooks/reviews/useReview';
import { ReviewForm } from '../../components/reviews/ReviewForm';
import { Modal } from '../../components/ui/Modal';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ReviewableProduct } from '../../types/review';

export const ReviewableProductsPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] =
    useState<ReviewableProduct | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const { products, loading, error, refetch } = useReviewableProducts();
  const { createReview, loading: reviewLoading } = useReview();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleReviewClick = (product: ReviewableProduct) => {
    setSelectedProduct(product);
    setShowReviewModal(true);
  };

  const handleCreateReview = async (data: any) => {
    if (!selectedProduct) return;

    const result = await createReview({
      ...data,
      productId: selectedProduct.productId,
    });

    if (result) {
      setShowReviewModal(false);
      setSelectedProduct(null);
      refetch();
    }
  };

  const handleCloseModal = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải danh sách sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <Button onClick={refetch} className="mt-4">
            Thử lại
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Sản phẩm chờ đánh giá
        </h1>
        <p className="text-gray-600">
          Chia sẻ trải nghiệm của bạn về những sản phẩm đã mua
        </p>
      </div>

      {/* Products List */}
      {products.length === 0 ? (
        <EmptyState
          title="Không có sản phẩm nào chờ đánh giá"
          description="Bạn đã đánh giá tất cả sản phẩm hoặc chưa có đơn hàng nào được giao thành công"
          icon={<StarIcon className="w-16 h-16" />}
          action={{
            label: 'Mua sắm ngay',
            onClick: () => (window.location.href = '/products'),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((item) => {
            const product = item.product;
            const currentPrice = product.discountPrice || product.price;
            const discountPercentage = product.discountPrice
              ? Math.round((1 - product.discountPrice / product.price) * 100)
              : 0;

            return (
              <Card key={item.productId} className="overflow-hidden">
                <div className="flex">
                  {/* Product Image */}
                  <div className="w-24 h-24 flex-shrink-0">
                    <Link to={`/shop/${product.id}`}>
                      <img
                        src={product.images[0] || '/placeholder-image.jpg'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 p-4">
                    <Link
                      to={`/shop/${product.id}`}
                      className="block font-medium text-gray-900 hover:text-primary transition-colors mb-2"
                    >
                      <h3 className="line-clamp-2">{product.name}</h3>
                    </Link>

                    <div className="flex items-center space-x-2 mb-3">
                      <span className="font-bold text-primary">
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

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Đơn hàng: #{item.orderId.slice(-8)}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleReviewClick(item)}
                        leftIcon={<StarIcon className="w-4 h-4" />}
                      >
                        Đánh giá
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <Modal
        isOpen={showReviewModal}
        onClose={handleCloseModal}
        title={`Đánh giá sản phẩm: ${selectedProduct?.product.name}`}
        size="lg"
      >
        {selectedProduct && (
          <ReviewForm
            productId={selectedProduct.productId}
            onSubmit={handleCreateReview}
            onCancel={handleCloseModal}
            loading={reviewLoading}
          />
        )}
      </Modal>
    </div>
  );
};
