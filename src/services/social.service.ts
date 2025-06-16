import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Comment,
  Like,
  Wishlist,
  WishlistWithDetails,
  WishlistItemType,
  WishlistPaginationResult,
  CreateCommentRequest,
  UpdateCommentRequest,
  LikeToggleRequest,
  AddToWishlistRequest,
  WishlistToggleRequest,
} from '../types/social';
import { PaginatedResponse } from '../types/common';
import { User } from '../types/auth';

export interface GetCommentsQuery {
  parentId?: string;
  page?: number;
  limit?: number;
  includeReplies?: boolean;
  sortBy?: 'createdAt' | 'likeCount';
  sortOrder?: 'asc' | 'desc';
}

export interface GetLikesQuery {
  page?: number;
  limit?: number;
}

export interface GetWishlistQuery {
  itemType?: WishlistItemType;
  page?: number;
  limit?: number;
}

export const socialService = {
  // Like methods
  async toggleLike(
    data: LikeToggleRequest,
  ): Promise<{ liked: boolean; message: string }> {
    return await apiClient.post<{ liked: boolean; message: string }>(
      API_ENDPOINTS.SOCIAL.LIKE,
      data,
    );
  },

  async getPostLikes(
    postId: string,
    query: GetLikesQuery = {},
  ): Promise<PaginatedResponse<Like & { user: User }>> {
    return await apiClient.get<PaginatedResponse<Like & { user: User }>>(
      API_ENDPOINTS.SOCIAL.POST_LIKES(postId),
      query,
    );
  },

  async getCommentLikes(
    commentId: string,
    query: GetLikesQuery = {},
  ): Promise<PaginatedResponse<Like & { user: User }>> {
    return await apiClient.get<PaginatedResponse<Like & { user: User }>>(
      API_ENDPOINTS.SOCIAL.COMMENT_LIKES(commentId),
      query,
    );
  },

  // Comment methods
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    return await apiClient.post<Comment>(API_ENDPOINTS.SOCIAL.COMMENTS, data);
  },

  async updateComment(
    id: string,
    data: UpdateCommentRequest,
  ): Promise<Comment> {
    return await apiClient.patch<Comment>(
      API_ENDPOINTS.SOCIAL.COMMENT_BY_ID(id),
      data,
    );
  },

  async deleteComment(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.SOCIAL.COMMENT_BY_ID(id));
  },

  async getPostComments(
    postId: string,
    query: GetCommentsQuery = {},
  ): Promise<PaginatedResponse<Comment>> {
    return await apiClient.get<PaginatedResponse<Comment>>(
      API_ENDPOINTS.SOCIAL.POST_COMMENTS(postId),
      query,
    );
  },

  async getCommentReplies(
    commentId: string,
    query: GetCommentsQuery = {},
  ): Promise<PaginatedResponse<Comment>> {
    return await apiClient.get<PaginatedResponse<Comment>>(
      API_ENDPOINTS.SOCIAL.COMMENT_REPLIES(commentId),
      query,
    );
  },

  // Wishlist methods
  async addToWishlist(data: AddToWishlistRequest): Promise<Wishlist> {
    return await apiClient.post<Wishlist>(API_ENDPOINTS.SOCIAL.WISHLIST, data);
  },

  async removeFromWishlist(
    itemType: WishlistItemType,
    itemId: string,
  ): Promise<void> {
    await apiClient.delete(
      API_ENDPOINTS.SOCIAL.WISHLIST_ITEM(itemType, itemId),
    );
  },

  async toggleWishlistItem(data: WishlistToggleRequest): Promise<{
    inWishlist: boolean;
    message: string;
  }> {
    return await apiClient.post<{
      inWishlist: boolean;
      message: string;
    }>(API_ENDPOINTS.SOCIAL.WISHLIST_TOGGLE, data);
  },

  async getWishlistItems(
    query: GetWishlistQuery = {},
  ): Promise<WishlistPaginationResult> {
    return await apiClient.get<WishlistPaginationResult>(
      API_ENDPOINTS.SOCIAL.WISHLIST,
      query,
    );
  },

  async checkWishlistStatus(
    itemType: WishlistItemType,
    itemId: string,
  ): Promise<{ inWishlist: boolean }> {
    return await apiClient.get<{ inWishlist: boolean }>(
      API_ENDPOINTS.SOCIAL.WISHLIST_CHECK(itemType, itemId),
    );
  },
};
