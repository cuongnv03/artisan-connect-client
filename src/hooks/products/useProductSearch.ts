import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { Product, SearchProductsQuery } from '../../types/product';
import { PaginatedResponse } from '../../types/common';
import { useDebounce } from '../common/useDebounce';

export interface UseProductSearchReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  totalResults: number;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchProductsQuery>) => void;
  search: (query: string) => void;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const useProductSearch = (): UseProductSearchReturn => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState<Partial<SearchProductsQuery>>({});
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 20,
  });

  const debouncedQuery = useDebounce(searchQuery, 500);

  const performSearch = async (query: string, page = 1, reset = true) => {
    if (!query.trim()) {
      setProducts([]);
      setPagination({ total: 0, totalPages: 0, currentPage: 1, limit: 20 });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const searchParams: SearchProductsQuery = {
        q: query,
        page,
        limit: 20,
        ...filters,
      };

      const response: PaginatedResponse<Product> =
        await productService.searchProducts(searchParams);

      if (reset) {
        setProducts(response.data);
      } else {
        setProducts((prev) => [...prev, ...response.data]);
      }

      setPagination({
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        currentPage: response.meta.page,
        limit: response.meta.limit,
      });

      // Update URL
      const params = new URLSearchParams();
      params.set('q', query);
      if (page > 1) params.set('page', page.toString());
      setSearchParams(params);
    } catch (err: any) {
      setError(err.message || 'Lỗi tìm kiếm');
      if (reset) setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const search = (query: string) => {
    setSearchQuery(query);
    performSearch(query, 1, true);
  };

  const loadMore = async () => {
    if (pagination.currentPage < pagination.totalPages && !loading) {
      await performSearch(debouncedQuery, pagination.currentPage + 1, false);
    }
  };

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery, 1, true);
    }
  }, [debouncedQuery, JSON.stringify(filters)]);

  return {
    products,
    loading,
    error,
    searchQuery,
    totalResults: pagination.total,
    pagination,
    setSearchQuery,
    setFilters,
    search,
    loadMore,
    hasMore: pagination.currentPage < pagination.totalPages,
  };
};
