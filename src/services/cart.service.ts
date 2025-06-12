import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { CartItem, CartSummary, CartValidation } from '../types/cart';

export const cartService = {
  async getCart(): Promise<{ items: CartItem[] }> {
    return await apiClient.get<{ items: CartItem[] }>(API_ENDPOINTS.CART.BASE);
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

  async addToCart(
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<CartItem> {
    const payload: any = {
      productId,
      quantity,
    };

    if (variantId) {
      payload.variantId = variantId;
    }

    return await apiClient.post<CartItem>(API_ENDPOINTS.CART.BASE, payload);
  },

  async updateCartItem(
    productId: string,
    quantity: number,
    variantId?: string,
  ): Promise<CartItem> {
    const params = new URLSearchParams();
    if (variantId) {
      params.append('variantId', variantId);
    }

    const url = `${API_ENDPOINTS.CART.ITEM(productId)}${
      params.toString() ? `?${params.toString()}` : ''
    }`;

    return await apiClient.patch<CartItem>(url, {
      quantity,
    });
  },

  async removeFromCart(productId: string, variantId?: string): Promise<void> {
    const params = new URLSearchParams();
    if (variantId) {
      params.append('variantId', variantId);
    }

    const url = `${API_ENDPOINTS.CART.ITEM(productId)}${
      params.toString() ? `?${params.toString()}` : ''
    }`;

    await apiClient.delete(url);
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
