import { useState, useEffect } from 'react';
import { ReviewableProduct } from '../../types/review';
import { reviewService } from '../../services/review.service';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export const useReviewableProducts = () => {
  const [products, setProducts] = useState<ReviewableProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToastContext();
  const { state: authState } = useAuth();

  const loadReviewableProducts = async () => {
    if (!authState.isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);
      const response = await reviewService.getReviewableProducts();
      setProducts(response);
    } catch (err: any) {
      const errorMessage =
        err.message || 'Không thể tải danh sách sản phẩm có thể đánh giá';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated) {
      loadReviewableProducts();
    }
  }, [authState.isAuthenticated]);

  return {
    products,
    loading,
    error,
    refetch: loadReviewableProducts,
  };
};
