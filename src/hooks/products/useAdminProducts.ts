import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
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
  loadMore: () => Promise<void>;
  hasMore: boolean;
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

  const fetchProducts = async (reset = true) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      // Admin sees all products regardless of seller
      const response: PaginatedResponse<Product> =
        await productService.getProducts({
          ...query,
          page: reset ? 1 : pagination.currentPage + 1,
          // Don't filter by sellerId for admin
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

  const deleteProduct = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      throw new Error(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const updateProductStatus = async (productId: string, status: string) => {
    try {
      const updatedProduct = await productService.updateProduct(productId, {
        status,
      } as any);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, status: updatedProduct.status } : p,
        ),
      );
    } catch (err: any) {
      throw new Error(err.message || 'Không thể cập nhật trạng thái sản phẩm');
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
    deleteProduct,
    updateProductStatus,
  };
};
