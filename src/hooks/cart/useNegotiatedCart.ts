import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useToastContext } from '../../contexts/ToastContext';

export const useNegotiatedCart = () => {
  const {
    addNegotiatedItemToCart: contextAddNegotiatedItem,
    refreshCartCount,
  } = useCart();
  const { success, error } = useToastContext();
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  const addNegotiatedItemToCart = async (
    negotiationId: string,
    quantity?: number,
  ) => {
    const loadingKey = `negotiated-${negotiationId}`;
    setLoading((prev) => ({ ...prev, [loadingKey]: true }));

    try {
      await contextAddNegotiatedItem(negotiationId, quantity);
      await refreshCartCount();
      success('Đã thêm sản phẩm với giá thương lượng vào giỏ hàng!');
    } catch (err: any) {
      error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      throw err;
    } finally {
      setLoading((prev) => ({ ...prev, [loadingKey]: false }));
    }
  };

  return {
    addNegotiatedItemToCart,
    loading,
  };
};
