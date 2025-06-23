import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product';
import { useToastContext } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { getRouteHelpers } from '../../constants/routes';

export const useProduct = (productId: string, isManagementView = false) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToastContext();
  const { state: authState } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const productData = await productService.getProduct(productId);
        setProduct(productData);

        // Auto-redirect logic for artisan viewing their own product
        if (
          !isManagementView &&
          authState.user?.role === 'ARTISAN' &&
          productData.seller?.id === authState.user.id
        ) {
          navigate(getRouteHelpers.productDetail(productId), { replace: true });
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Không thể tải thông tin sản phẩm';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, isManagementView, authState.user, navigate]);

  const refetch = async () => {
    if (!productId) return;

    try {
      setLoading(true);
      const productData = await productService.getProduct(productId);
      setProduct(productData);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thông tin sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is the owner
  const isOwner =
    authState.user?.role === 'ARTISAN' &&
    product?.seller?.id === authState.user.id;

  return {
    product,
    loading,
    error,
    isOwner,
    refetch,
  };
};
