import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/product.service';
import { Product, GetProductsQuery } from '../../types/product';
import { PaginatedResponse } from '../../types/common';

export interface UseProductsOptions extends GetProductsQuery {
  enabled?: boolean;
}

export interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useProducts = (
  options: UseProductsOptions = {},
): UseProductsReturn => {
  const { enabled = true, ...query } = options;
  const { state: authState } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: query.page || 1,
    limit: query.limit || 20,
  });

  const fetchProducts = async (reset = true) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const response: PaginatedResponse<Product> =
        await productService.getProducts({
          ...query,
          page: reset ? 1 : pagination.currentPage + 1,
          userId: authState.user?.id,
        });

      if (reset) {
        setProducts(response.data);
        setPagination({
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          currentPage: response.meta.page,
          limit: response.meta.limit,
        });
      } else {
        setProducts((prev) => [...prev, ...response.data]);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.meta.page,
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchProducts(true);
  const loadMore = () => fetchProducts(false);

  useEffect(() => {
    if (enabled) {
      fetchProducts(true);
    }
  }, [enabled, JSON.stringify(query)]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    hasMore: pagination.currentPage < pagination.totalPages,
  };
};
