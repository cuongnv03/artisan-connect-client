import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { CartItem, CartSummary, CartValidation } from '../types/order';

export const cartService = {
  async getCart(): Promise<CartItem[]> {
    return await apiClient.get<CartItem[]>(API_ENDPOINTS.CART.BASE);
  },

  async getCartSummary(): Promise<CartSummary> {
    return await apiClient.get<CartSummary>(API_ENDPOINTS.CART.SUMMARY);
  },

  async getCartCount(): Promise<number> {
    const response = await apiClient.get<{ count: number }>(
      API_ENDPOINTS.CART.COUNT,
    );
    return response.count;
  },

  async addToCart(productId: string, quantity: number): Promise<CartItem> {
    return await apiClient.post<CartItem>(API_ENDPOINTS.CART.BASE, {
      productId,
      quantity,
    });
  },

  async updateCartItem(productId: string, quantity: number): Promise<CartItem> {
    return await apiClient.patch<CartItem>(API_ENDPOINTS.CART.ITEM(productId), {
      quantity,
    });
  },

  async removeFromCart(productId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CART.ITEM(productId));
  },

  async clearCart(): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CART.BASE);
  },

  async validateCart(
    type: 'basic' | 'checkout' = 'basic',
  ): Promise<CartValidation> {
    return await apiClient.get<CartValidation>(API_ENDPOINTS.CART.VALIDATE, {
      type,
    });
  },

  async validateForCheckout(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    summary?: CartSummary;
  }> {
    return await apiClient.get(API_ENDPOINTS.CART.VALIDATE, {
      type: 'checkout',
    });
  },
};
