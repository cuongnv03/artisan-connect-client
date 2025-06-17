import { useState } from 'react';
import { useCart } from '../../contexts/CartContext';
import { useToastContext } from '../../contexts/ToastContext';
import { cartService } from '../../services/cart.service';

export const useNegotiatedCart = () => {
  const { refreshCartCount } = useCart();
  const { success, error } = useToastContext();
  const [loading, setLoading] = useState(false);

  const addNegotiatedItemToCart = async (
    negotiationId: string,
    quantity?: number,
  ) => {
    setLoading(true);
    try {
      await cartService.addNegotiatedItemToCart(negotiationId, quantity);
      await refreshCartCount();
      success('Đã thêm sản phẩm thương lượng vào giỏ hàng!');
    } catch (err: any) {
      error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    addNegotiatedItemToCart,
    loading,
  };
};
