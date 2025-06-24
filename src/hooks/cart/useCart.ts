import { useState } from 'react';
import { useCart as useCartContext } from '../../contexts/CartContext';
import { useToastContext } from '../../contexts/ToastContext';

export const useCartOperations = () => {
  const {
    state,
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCartCount,
  } = useCartContext();

  const { success, error } = useToastContext();
  const [updating, setUpdating] = useState<string | null>(null);

  // ===== UPDATED: Create proper item key for variants =====
  const createItemKey = (productId: string, variantId?: string) => {
    return `${productId}${variantId ? `-${variantId}` : ''}`;
  };

  const handleUpdateQuantity = async (
    productId: string,
    newQuantity: number,
    variantId?: string,
  ) => {
    if (newQuantity < 1) {
      await handleRemoveItem(productId, variantId);
      return;
    }

    const itemKey = createItemKey(productId, variantId);
    setUpdating(itemKey);
    try {
      await updateCartItem(productId, newQuantity, variantId);
    } catch (err) {
      // Error already handled in context
    } finally {
      setUpdating(null);
    }
  };

  const handleRemoveItem = async (productId: string, variantId?: string) => {
    const itemKey = createItemKey(productId, variantId);
    setUpdating(itemKey);
    try {
      await removeFromCart(productId, variantId);
    } catch (err) {
      // Error already handled in context
    } finally {
      setUpdating(null);
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
    } catch (err: any) {
      error(err.message || 'Không thể xóa giỏ hàng');
    }
  };

  const handleAddToCart = async (
    productId: string,
    quantity: number = 1,
    variantId?: string,
  ) => {
    try {
      await addToCart(productId, quantity, variantId);
    } catch (err) {
      // Error already handled in context
    }
  };

  return {
    // State
    ...state,
    updating,

    // Actions
    loadCart,
    updateQuantity: handleUpdateQuantity,
    removeItem: handleRemoveItem,
    clearCart: handleClearCart,
    addToCart: handleAddToCart,
    refreshCartCount,
  };
};
