import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  WishlistWithDetails,
  WishlistPaginationResult,
  WishlistItemType,
} from '../types/wishlist';

export interface AddToWishlistRequest {
  itemType: WishlistItemType;
  productId?: string;
  postId?: string;
}

export interface GetWishlistQuery {
  itemType?: WishlistItemType;
  page?: number;
  limit?: number;
}

export const wishlistService = {
  // Add to wishlist
  async addToWishlist(
    data: AddToWishlistRequest,
  ): Promise<WishlistWithDetails> {
    return await apiClient.post<WishlistWithDetails>(
      API_ENDPOINTS.SOCIAL.WISHLIST,
      data,
    );
  },

  // Remove from wishlist
  async removeFromWishlist(
    itemType: WishlistItemType,
    itemId: string,
  ): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.SOCIAL.WISHLIST_ITEM(itemType, itemId),
    );
  },

  // Toggle wishlist item
  async toggleWishlistItem(data: AddToWishlistRequest): Promise<{
    inWishlist: boolean;
    message: string;
  }> {
    return await apiClient.post<{
      inWishlist: boolean;
      message: string;
    }>(API_ENDPOINTS.SOCIAL.WISHLIST_TOGGLE, data);
  },

  // Get wishlist items
  async getWishlistItems(
    query: GetWishlistQuery = {},
  ): Promise<WishlistPaginationResult> {
    return await apiClient.get<WishlistPaginationResult>(
      API_ENDPOINTS.SOCIAL.WISHLIST,
      query,
    );
  },

  // Check wishlist status
  async checkWishlistStatus(
    itemType: WishlistItemType,
    itemId: string,
  ): Promise<{ inWishlist: boolean }> {
    return await apiClient.get<{ inWishlist: boolean }>(
      API_ENDPOINTS.SOCIAL.WISHLIST_CHECK(itemType, itemId),
    );
  },
};
