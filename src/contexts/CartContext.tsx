import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, CartSummary } from '../types/order';
import { cartService } from '../services/cart.service';
import { useToastContext } from './ToastContext';

interface CartState {
  items: CartItem[];
  summary: CartSummary | null;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'SET_SUMMARY'; payload: CartSummary }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_ITEM'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' };

interface CartContextType {
  state: CartState;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const initialState: CartState = {
  items: [],
  summary: null,
  loading: false,
  error: null,
};

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false, error: null };
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId,
      );
      if (existingItemIndex >= 0) {
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity:
            updatedItems[existingItemIndex].quantity + action.payload.quantity,
        };
        return { ...state, items: updatedItems };
      } else {
        return { ...state, items: [...state.items, action.payload] };
      }
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item,
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.productId !== action.payload),
      };
    case 'CLEAR_CART':
      return { ...state, items: [], summary: null };
    default:
      return state;
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { success, error: showError } = useToastContext();

  useEffect(() => {
    refreshCart();
  }, []);

  const refreshCart = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const [items, summary] = await Promise.all([
        cartService.getCart(),
        cartService.getCartSummary(),
      ]);
      dispatch({ type: 'SET_ITEMS', payload: items });
      dispatch({ type: 'SET_SUMMARY', payload: summary });
    } catch (err: any) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
    }
  };

  const addToCart = async (productId: string, quantity: number) => {
    try {
      const newItem = await cartService.addToCart(productId, quantity);
      dispatch({ type: 'ADD_ITEM', payload: newItem });

      // Refresh summary
      const summary = await cartService.getCartSummary();
      dispatch({ type: 'SET_SUMMARY', payload: summary });

      success('Đã thêm vào giỏ hàng');
    } catch (err: any) {
      showError(err.message || 'Có lỗi xảy ra khi thêm vào giỏ hàng');
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    try {
      if (quantity <= 0) {
        await removeFromCart(productId);
        return;
      }

      await cartService.updateCartItem(productId, quantity);
      dispatch({ type: 'UPDATE_ITEM', payload: { productId, quantity } });

      // Refresh summary
      const summary = await cartService.getCartSummary();
      dispatch({ type: 'SET_SUMMARY', payload: summary });
    } catch (err: any) {
      showError(err.message || 'Có lỗi xảy ra khi cập nhật giỏ hàng');
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await cartService.removeFromCart(productId);
      dispatch({ type: 'REMOVE_ITEM', payload: productId });

      // Refresh summary
      const summary = await cartService.getCartSummary();
      dispatch({ type: 'SET_SUMMARY', payload: summary });

      success('Đã xóa khỏi giỏ hàng');
    } catch (err: any) {
      showError(err.message || 'Có lỗi xảy ra khi xóa khỏi giỏ hàng');
    }
  };

  const clearCart = async () => {
    try {
      await cartService.clearCart();
      dispatch({ type: 'CLEAR_CART' });
      success('Đã xóa tất cả sản phẩm');
    } catch (err: any) {
      showError(err.message || 'Có lỗi xảy ra khi xóa giỏ hàng');
    }
  };

  const value = {
    state,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    refreshCart,
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
