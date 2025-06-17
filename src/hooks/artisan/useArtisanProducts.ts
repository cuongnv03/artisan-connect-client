import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product';

export const useArtisanProducts = (artisanId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadProducts();
  }, [artisanId]);

  const loadProducts = async (reset = true) => {
    setLoading(true);
    try {
      const currentPage = reset ? 1 : page;
      const result = await productService.getProducts({
        sellerId: artisanId,
        page: currentPage,
        limit: 12,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (reset) {
        setProducts(result.data);
        setPage(1);
      } else {
        setProducts((prev) => [...prev, ...result.data]);
      }

      setHasMore(currentPage < result.meta.totalPages);
      setPage((prev) => (reset ? 2 : prev + 1));
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreProducts = () => {
    if (!loading && hasMore) {
      loadProducts(false);
    }
  };

  return {
    products,
    loading,
    hasMore,
    loadProducts: () => loadProducts(true),
    loadMoreProducts,
  };
};
