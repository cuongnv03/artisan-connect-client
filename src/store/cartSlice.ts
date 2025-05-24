import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem } from '../types/order';

interface CartState {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  subtotal: 0,
  loading: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCartItems: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.totalItems = action.payload.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.subtotal = action.payload.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },
    addCartItem: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId,
      );
      if (existingIndex >= 0) {
        state.items[existingIndex].quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.subtotal = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },
    updateCartItem: (
      state,
      action: PayloadAction<{ productId: string; quantity: number }>,
    ) => {
      const item = state.items.find(
        (item) => item.productId === action.payload.productId,
      );
      if (item) {
        item.quantity = action.payload.quantity;
        state.totalItems = state.items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
        state.subtotal = state.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
      }
    },
    removeCartItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload,
      );
      state.totalItems = state.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
      state.subtotal = state.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    },
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.subtotal = 0;
    },
  },
});

export const {
  setLoading,
  setCartItems,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
