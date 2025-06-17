import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cart.service';
import {
  CartItem,
  CartSummary,
  AddToCartRequest,
  UpdateCartItemRequest,
} from '../types/cart';
import { useAuth } from './AuthContext';
import { useToastContext } from './ToastContext';

interface CartState {
  items: CartItem[];
  summary: CartSummary | null;
  itemCount: number;
  isLoading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'CART_LOADING' }
  | {
      type: 'CART_LOADED';
      payload: { items: CartItem[]; summary: CartSummary; itemCount: number };
    }
  | { type: 'CART_ERROR'; payload: string }
  | { type: 'CART_CLEARED' }
  | { type: 'ITEM_ADDED'; payload: CartItem }
  | { type: 'ITEM_UPDATED'; payload: CartItem }
  | { type: 'ITEM_REMOVED'; payload: { productId: string; variantId?: string } }
  | { type: 'COUNT_UPDATED'; payload: number }
  | { type: 'RESET_ERROR' };

interface CartContextType {
  state: CartState;
  loadCart: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity: number,
    variantId?: string,
    negotiationId?: string,
  ) => Promise<void>;
  updateCartItem: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCartCount: () => Promise<void>;
  addNegotiatedItemToCart: (
    negotiationId: string,
    quantity?: number,
  ) => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  summary: null,
  itemCount: 0,
  isLoading: false,
  error: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'CART_LOADING':
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case 'CART_LOADED':
      return {
        ...state,
        items: action.payload.items,
        summary: action.payload.summary,
        itemCount: action.payload.itemCount,
        isLoading: false,
        error: null,
      };

    case 'CART_ERROR':
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    case 'CART_CLEARED':
      return {
        ...state,
        items: [],
        summary: null,
        itemCount: 0,
        error: null,
      };

    case 'ITEM_ADDED':
      return {
        ...state,
        items: [...state.items, action.payload],
        itemCount: state.itemCount + action.payload.quantity,
        error: null,
      };

    case 'ITEM_UPDATED':
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId
            ? action.payload
            : item,
        ),
        error: null,
      };

    case 'ITEM_REMOVED':
      const removedItem = state.items.find(
        (item) =>
          item.productId === action.payload.productId &&
          item.variantId === action.payload.variantId,
      );
      return {
        ...state,
        items: state.items.filter(
          (item) =>
            !(
              item.productId === action.payload.productId &&
              item.variantId === action.payload.variantId
            ),
        ),
        itemCount: state.itemCount - (removedItem?.quantity || 0),
        error: null,
      };

    case 'COUNT_UPDATED':
      return {
        ...state,
        itemCount: action.payload,
      };

    case 'RESET_ERROR':
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { state: authState } = useAuth();
  const { success, error: showError } = useToastContext();

  // Load cart when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadCart();
    } else {
      dispatch({ type: 'CART_CLEARED' });
    }
  }, [authState.isAuthenticated, authState.user]);

  const loadCart = async () => {
    if (!authState.isAuthenticated) {
      dispatch({ type: 'CART_CLEARED' });
      return;
    }

    dispatch({ type: 'CART_LOADING' });
    try {
      const [summary, itemCount] = await Promise.all([
        cartService.getCartSummary(),
        cartService.getCartCount(),
      ]);

      dispatch({
        type: 'CART_LOADED',
        payload: {
          items: summary.items,
          summary,
          itemCount,
        },
      });
    } catch (err: any) {
      console.error('Error loading cart:', err);
      dispatch({
        type: 'CART_ERROR',
        payload: err.message || 'Không thể tải giỏ hàng',
      });
    }
  };

  const addToCart = async (
    productId: string,
    quantity: number,
    variantId?: string,
    negotiationId?: string,
  ) => {
    if (!authState.isAuthenticated) {
      showError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    if (quantity <= 0) {
      showError('Số lượng phải lớn hơn 0');
      return;
    }

    try {
      // Create the proper AddToCartRequest object
      const addToCartData: AddToCartRequest = {
        productId,
        quantity,
        ...(variantId && { variantId }),
        ...(negotiationId && { negotiationId }),
      };

      const cartItem = await cartService.addToCart(addToCartData);
      dispatch({ type: 'ITEM_ADDED', payload: cartItem });

      // Refresh full cart to get updated totals
      await loadCart();

      success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    } catch (err: any) {
      const errorMessage =
        err.message || 'Không thể thêm sản phẩm vào giỏ hàng';
      showError(errorMessage);
      dispatch({ type: 'CART_ERROR', payload: errorMessage });
      throw err;
    }
  };

  const updateCartItem = async (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => {
    if (!authState.isAuthenticated) {
      showError('Vui lòng đăng nhập để cập nhật giỏ hàng');
      return;
    }

    if (quantity <= 0) {
      // If quantity is 0 or negative, remove the item
      await removeFromCart(productId, variantId);
      return;
    }

    try {
      // Create the proper UpdateCartItemRequest object
      const updateData: UpdateCartItemRequest = {
        quantity,
      };

      const cartItem = await cartService.updateCartItem(
        productId,
        updateData,
        variantId,
      );

      dispatch({ type: 'ITEM_UPDATED', payload: cartItem });
      await loadCart();
      success('Đã cập nhật số lượng sản phẩm');
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể cập nhật sản phẩm';
      showError(errorMessage);
      dispatch({ type: 'CART_ERROR', payload: errorMessage });
      throw err;
    }
  };

  const removeFromCart = async (productId: string, variantId?: string) => {
    if (!authState.isAuthenticated) {
      showError('Vui lòng đăng nhập để xóa sản phẩm khỏi giỏ hàng');
      return;
    }

    try {
      await cartService.removeFromCart(productId, variantId);

      dispatch({
        type: 'ITEM_REMOVED',
        payload: { productId, variantId },
      });

      await loadCart();
      success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể xóa sản phẩm';
      showError(errorMessage);
      dispatch({ type: 'CART_ERROR', payload: errorMessage });
      throw err;
    }
  };

  const clearCart = async () => {
    if (!authState.isAuthenticated) {
      showError('Vui lòng đăng nhập để xóa giỏ hàng');
      return;
    }

    try {
      await cartService.clearCart();
      dispatch({ type: 'CART_CLEARED' });
      success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
    } catch (err: any) {
      const errorMessage = err.message || 'Không thể xóa giỏ hàng';
      showError(errorMessage);
      dispatch({ type: 'CART_ERROR', payload: errorMessage });
      throw err;
    }
  };

  const refreshCartCount = async () => {
    if (!authState.isAuthenticated) {
      dispatch({ type: 'COUNT_UPDATED', payload: 0 });
      return;
    }

    try {
      const count = await cartService.getCartCount();
      dispatch({ type: 'COUNT_UPDATED', payload: count });
    } catch (err: any) {
      console.error('Error refreshing cart count:', err);
      // Don't show error to user for count refresh failures
    }
  };

  const addNegotiatedItemToCart = async (
    negotiationId: string,
    quantity?: number,
  ) => {
    if (!authState.isAuthenticated) {
      showError('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng');
      return;
    }

    try {
      const cartItem = await cartService.addNegotiatedItemToCart(
        negotiationId,
        quantity,
      );

      dispatch({ type: 'ITEM_ADDED', payload: cartItem });
      await loadCart();

      success(`Đã thêm sản phẩm với giá thương lượng vào giỏ hàng`);
    } catch (err: any) {
      const errorMessage =
        err.message || 'Không thể thêm sản phẩm với giá thương lượng';
      showError(errorMessage);
      dispatch({ type: 'CART_ERROR', payload: errorMessage });
      throw err;
    }
  };

  const clearError = () => {
    dispatch({ type: 'RESET_ERROR' });
  };

  const value: CartContextType = {
    state,
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCartCount,
    addNegotiatedItemToCart,
    clearError,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// Helper hook for cart operations with loading states
export function useCartOperations() {
  const cart = useCart();
  const [loading, setLoading] = React.useState<Record<string, boolean>>({});

  const withLoading = async <T,>(
    key: string,
    operation: () => Promise<T>,
  ): Promise<T | null> => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    try {
      const result = await operation();
      return result;
    } catch (error) {
      return null;
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  return {
    ...cart,
    loading,
    addToCartWithLoading: (
      productId: string,
      quantity: number,
      variantId?: string,
    ) =>
      withLoading(`add-${productId}`, () =>
        cart.addToCart(productId, quantity, variantId),
      ),
    updateCartItemWithLoading: (
      productId: string,
      quantity: number,
      variantId?: string,
    ) =>
      withLoading(`update-${productId}`, () =>
        cart.updateCartItem(productId, quantity, variantId),
      ),
    removeFromCartWithLoading: (productId: string, variantId?: string) =>
      withLoading(`remove-${productId}`, () =>
        cart.removeFromCart(productId, variantId),
      ),
  };
}
