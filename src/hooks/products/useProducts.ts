import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { Product, GetProductsQuery } from '../../types/product';
import { PaginatedResponse } from '../../types/common';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export interface UseProductsOptions extends GetProductsQuery {
  enabled?: boolean;
  publicOnly?: boolean; // For shop view
}

export const useProducts = (options: UseProductsOptions = {}) => {
  const { enabled = true, publicOnly = false, ...query } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginatedResponse<Product>['meta'] | null>(
    null,
  );
  const { error: showError } = useToastContext();
  const { state: authState } = useAuth();

  const fetchProducts = async (reset = true) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const finalQuery = {
        ...query,
        page: reset ? 1 : (meta?.page || 1) + 1,
      };

      // For public shop view, only get published products
      if (publicOnly) {
        finalQuery.status = 'PUBLISHED';
      }

      const response = publicOnly
        ? await productService.getProducts(finalQuery)
        : await productService.getMyProducts(finalQuery);

      if (reset) {
        setProducts(response.data);
      } else {
        setProducts((prev) => [...prev, ...response.data]);
      }
      setMeta(response.meta);
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể tải danh sách sản phẩm';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled && (publicOnly || authState.isAuthenticated)) {
      fetchProducts(true);
    }
  }, [enabled, publicOnly, authState.isAuthenticated, JSON.stringify(query)]);

  const refetch = () => fetchProducts(true);
  const loadMore = () => fetchProducts(false);

  return {
    products,
    loading,
    error,
    meta,
    refetch,
    loadMore,
    hasMore: meta ? meta.page < meta.totalPages : false,
  };
};
