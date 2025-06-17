import { useState, useEffect } from 'react';
import {
  Review,
  ReviewStatistics,
  ReviewFilterOptions,
} from '../../types/review';
import { PaginatedResponse } from '../../types/common';
import { reviewService } from '../../services/review.service';
import { useToastContext } from '../../contexts/ToastContext';

export const useProductReviews = (
  productId: string,
  options: Omit<ReviewFilterOptions, 'productId'> = {},
) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginatedResponse<Review>['meta'] | null>(
    null,
  );
  const { error: showError } = useToastContext();

  const loadProductReviews = async (
    newOptions?: Omit<ReviewFilterOptions, 'productId'>,
  ) => {
    if (!productId) return;

    try {
      setLoading(true);
      setError(null);

      const finalOptions = { ...options, ...newOptions };
      const response = await reviewService.getProductReviews(
        productId,
        finalOptions,
      );

      if (finalOptions.page === 1) {
        setReviews(response.reviews.data);
      } else {
        setReviews((prev) => [...prev, ...response.reviews.data]);
      }
      setMeta(response.reviews.meta);
      setStatistics(response.statistics);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải đánh giá sản phẩm';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProductReviews();
    }
  }, [productId]);

  const refetch = () => loadProductReviews({ ...options, page: 1 });
  const loadMore = () => {
    if (meta && meta.page < meta.totalPages) {
      loadProductReviews({ ...options, page: meta.page + 1 });
    }
  };

  return {
    reviews,
    statistics,
    loading,
    error,
    meta,
    loadProductReviews,
    refetch,
    loadMore,
    hasMore: meta ? meta.page < meta.totalPages : false,
  };
};
