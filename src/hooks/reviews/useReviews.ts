import { useState, useEffect } from 'react';
import { Review, ReviewFilterOptions } from '../../types/review';
import { PaginatedResponse } from '../../types/common';
import { reviewService } from '../../services/review.service';
import { useToastContext } from '../../contexts/ToastContext';

export const useReviews = (options: ReviewFilterOptions = {}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginatedResponse<Review>['meta'] | null>(
    null,
  );
  const { error: showError } = useToastContext();

  const loadReviews = async (newOptions?: ReviewFilterOptions) => {
    try {
      setLoading(true);
      setError(null);

      const finalOptions = { ...options, ...newOptions };
      const response = await reviewService.getReviews(finalOptions);

      if (finalOptions.page === 1) {
        setReviews(response.data);
      } else {
        setReviews((prev) => [...prev, ...response.data]);
      }
      setMeta(response.meta);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải danh sách đánh giá';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [options.productId, options.userId]);

  const refetch = () => loadReviews({ ...options, page: 1 });
  const loadMore = () => {
    if (meta && meta.page < meta.totalPages) {
      loadReviews({ ...options, page: meta.page + 1 });
    }
  };

  return {
    reviews,
    loading,
    error,
    meta,
    loadReviews,
    refetch,
    loadMore,
    hasMore: meta ? meta.page < meta.totalPages : false,
  };
};
