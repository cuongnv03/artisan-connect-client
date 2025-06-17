import React, { useState } from 'react';
import { Review } from '../../types/review';
import { useReviews } from '../../hooks/reviews/useReviews';
import { useReview } from '../../hooks/reviews/useReview';
import { ReviewsList } from '../../components/reviews/ReviewsList';
import { ReviewForm } from '../../components/reviews/ReviewForm';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../contexts/AuthContext';

export const MyReviewsPage: React.FC = () => {
  const { state: authState } = useAuth();
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { reviews, loading, error, meta, loadMore, refetch, hasMore } =
    useReviews({
      userId: authState.user?.id,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

  const { updateReview, deleteReview, loading: actionLoading } = useReview();

  const handleEdit = (review: Review) => {
    setEditingReview(review);
    setShowEditModal(true);
  };

  const handleUpdate = async (data: any) => {
    if (!editingReview) return;

    const result = await updateReview(editingReview.id, data);
    if (result) {
      setShowEditModal(false);
      setEditingReview(null);
      refetch();
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      const result = await deleteReview(reviewId);
      if (result) {
        refetch();
      }
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingReview(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Đánh giá của tôi
        </h1>
        <p className="text-gray-600">
          Quản lý các đánh giá sản phẩm bạn đã viết
        </p>
      </div>

      {/* Reviews List */}
      <ReviewsList
        reviews={reviews}
        loading={loading}
        error={error}
        meta={meta}
        showActions={true}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onLoadMore={hasMore ? loadMore : undefined}
      />

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseModal}
        title="Chỉnh sửa đánh giá"
        size="lg"
      >
        {editingReview && (
          <ReviewForm
            review={editingReview}
            onSubmit={handleUpdate}
            onCancel={handleCloseModal}
            loading={actionLoading}
          />
        )}
      </Modal>
    </div>
  );
};
