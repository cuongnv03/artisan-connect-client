import { useState } from 'react';
import { Review, CreateReviewDto, UpdateReviewDto } from '../../types/review';
import { reviewService } from '../../services/review.service';
import { useToastContext } from '../../contexts/ToastContext';

export const useReview = () => {
  const [loading, setLoading] = useState(false);
  const { success, error: showError } = useToastContext();

  const createReview = async (
    data: CreateReviewDto,
  ): Promise<Review | null> => {
    try {
      setLoading(true);
      const review = await reviewService.createReview(data);
      success('Đánh giá của bạn đã được tạo thành công!');
      return review;
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tạo đánh giá';
      showError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (
    id: string,
    data: UpdateReviewDto,
  ): Promise<Review | null> => {
    try {
      setLoading(true);
      const review = await reviewService.updateReview(id, data);
      success('Đánh giá đã được cập nhật!');
      return review;
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể cập nhật đánh giá';
      showError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      await reviewService.deleteReview(id);
      success('Đánh giá đã được xóa!');
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể xóa đánh giá';
      showError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createReview,
    updateReview,
    deleteReview,
    loading,
  };
};
