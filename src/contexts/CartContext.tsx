import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { cartService } from '../services/cart.service';
import { CartItem, CartSummary } from '../types/cart';
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
  | { type: 'ITEM_REMOVED'; payload: string }
  | { type: 'COUNT_UPDATED'; payload: number };

interface CartContextType {
  state: CartState;
  loadCart: () => Promise<void>;
  addToCart: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => Promise<void>;
  updateCartItem: (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => Promise<void>;
  removeFromCart: (productId: string, variantId?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCartCount: () => Promise<void>;
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
      };
    case 'ITEM_REMOVED':
      const removedItem = state.items.find(
        (item) => item.id === action.payload,
      );
      return {
        ...state,
        items: state.items.filter((item) => item.id !== action.payload),
        itemCount: state.itemCount - (removedItem?.quantity || 0),
      };
    case 'COUNT_UPDATED':
      return {
        ...state,
        itemCount: action.payload,
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
  const { success, error } = useToastContext();

  // Load cart when user is authenticated
  useEffect(() => {
    if (authState.isAuthenticated && authState.user) {
      loadCart();
    } else {
      dispatch({ type: 'CART_CLEARED' });
    }
  }, [authState.isAuthenticated, authState.user]);

  const loadCart = async () => {
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
        payload: err.message || 'Failed to load cart',
      });
    }
  };

  const refreshCartCount = async () => {
    try {
      const count = await cartService.getCartCount();
      dispatch({ type: 'COUNT_UPDATED', payload: count });
    } catch (err) {
      console.error('Error refreshing cart count:', err);
    }
  };

  const addToCart = async (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => {
    try {
      const cartItem = await cartService.addToCart(
        productId,
        quantity,
        variantId,
      );
      dispatch({ type: 'ITEM_ADDED', payload: cartItem });

      // Refresh full cart to get updated totals
      await loadCart();

      success(`Đã thêm ${quantity} sản phẩm vào giỏ hàng`);
    } catch (err: any) {
      error(err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
      throw err;
    }
  };

  const updateCartItem = async (
    productId: string,
    quantity: number,
    variantId?: string,
  ) => {
    try {
      const cartItem = await cartService.updateCartItem(
        productId,
        quantity,
        variantId,
      );
      dispatch({ type: 'ITEM_UPDATED', payload: cartItem });
      await loadCart();
      success('Đã cập nhật số lượng sản phẩm');
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật sản phẩm');
      throw err;
    }
  };

  const removeFromCart = async (productId: string, variantId?: string) => {
    try {
      await cartService.removeFromCart(productId, variantId);
      // Find the item to remove by productId and variantId
      const itemToRemove = state.items.find(
        (item) => item.productId === productId && item.variantId === variantId,
      );
      if (itemToRemove) {
        dispatch({ type: 'ITEM_REMOVED', payload: itemToRemove.id });
      }
      await loadCart();
      success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (err: any) {
      error(err.message || 'Không thể xóa sản phẩm');
      throw err;
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      dispatch({ type: 'CART_CLEARED' });
      success('Đã xóa tất cả sản phẩm khỏi giỏ hàng');
    } catch (err: any) {
      error(err.message || 'Không thể xóa giỏ hàng');
      throw err;
    }
  };

  const value = {
    state,
    loadCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCartCount,
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
