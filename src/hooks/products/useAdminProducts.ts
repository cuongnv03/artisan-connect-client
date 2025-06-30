import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';
import { Product, GetProductsQuery } from '../../types/product';
import { PaginatedResponse } from '../../types/common';

export interface UseAdminProductsOptions extends GetProductsQuery {
  enabled?: boolean;
}

export interface UseAdminProductsReturn {
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
  deleteProduct: (productId: string) => Promise<void>;
  updateProductStatus: (productId: string, status: string) => Promise<void>;
}

export const useAdminProducts = (
  options: UseAdminProductsOptions = {},
): UseAdminProductsReturn => {
  const { enabled = true, ...query } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: query.page || 1,
    limit: query.limit || 20,
  });

  const fetchProducts = async () => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      const response: PaginatedResponse<Product> = await apiClient.get(
        '/admin/products',
        query,
      );

      setProducts(response.data);
      setPagination({
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        currentPage: response.meta.page,
        limit: response.meta.limit,
      });
    } catch (err: any) {
      setError(err.message || 'Không thể tải sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      await apiClient.delete(`/admin/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      throw new Error(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const updateProductStatus = async (productId: string, status: string) => {
    try {
      await apiClient.patch(`/admin/products/${productId}/status`, { status });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, status } : p)),
      );
    } catch (err: any) {
      throw new Error(err.message || 'Không thể cập nhật trạng thái sản phẩm');
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchProducts();
    }
  }, [enabled, JSON.stringify(query)]);

  return {
    products,
    loading,
    error,
    pagination,
    refetch: fetchProducts,
    deleteProduct,
    updateProductStatus,
  };
};
