import api from './api';

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: {
    id: string;
    name: string;
    price: number;
    discountPrice?: number | null;
    images: string[];
    sellerId: string;
    seller?: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      artisanProfile?: {
        shopName: string;
      } | null;
    };
  };
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
}

export const CartService = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get('/cart');
    return response.data.data;
  },

  addItem: async (productId: string, quantity: number): Promise<Cart> => {
    const response = await api.post('/cart', { productId, quantity });
    return response.data.data;
  },

  updateCartItem: async (
    productId: string,
    quantity: number,
  ): Promise<CartItem> => {
    const response = await api.patch(`/cart/${productId}`, { quantity });
    return response.data.data;
  },

  removeFromCart: async (productId: string): Promise<void> => {
    await api.delete(`/cart/${productId}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },

  validateCart: async (): Promise<{ valid: boolean; message?: string }> => {
    const response = await api.get('/cart/validate');
    return response.data.data;
  },
};
