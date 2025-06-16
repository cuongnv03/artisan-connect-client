import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product';

export interface UseProductOptions {
  productId?: string;
  slug?: string;
  enabled?: boolean;
}

export interface UseProductReturn {
  product: Product | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useProduct = (options: UseProductOptions): UseProductReturn => {
  const { productId, slug, enabled = true } = options;
  const { state: authState } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!enabled || (!productId && !slug)) return;

    try {
      setLoading(true);
      setError(null);

      let productData: Product;
      if (slug) {
        productData = await productService.getProductBySlug(slug);
      } else if (productId) {
        productData = await productService.getProduct(productId);
      } else {
        throw new Error('Product ID or slug is required');
      }

      setProduct(productData);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin sản phẩm');
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [productId, slug, enabled]);

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  };
};
