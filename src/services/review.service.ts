import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Review,
  ReviewStatistics,
  CreateReviewDto,
  UpdateReviewDto,
  ReviewFilterOptions,
  ReviewableProduct,
} from '../types/review';
import { PaginatedResponse } from '../types/common';

export const reviewService = {
  // Create review
  async createReview(data: CreateReviewDto): Promise<Review> {
    return await apiClient.post<Review>(API_ENDPOINTS.REVIEWS.BASE, data);
  },

  // Update review
  async updateReview(id: string, data: UpdateReviewDto): Promise<Review> {
    return await apiClient.patch<Review>(API_ENDPOINTS.REVIEWS.BY_ID(id), data);
  },

  // Delete review
  async deleteReview(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.REVIEWS.BY_ID(id));
  },

  // Get single review
  async getReview(id: string): Promise<Review> {
    return await apiClient.get<Review>(API_ENDPOINTS.REVIEWS.BY_ID(id));
  },

  // Get reviews with filtering
  async getReviews(
    query: ReviewFilterOptions = {},
  ): Promise<PaginatedResponse<Review>> {
    return await apiClient.get<PaginatedResponse<Review>>(
      API_ENDPOINTS.REVIEWS.BASE,
      query,
    );
  },

  // Get product reviews with statistics
  async getProductReviews(
    productId: string,
    query: Omit<ReviewFilterOptions, 'productId'> = {},
  ): Promise<{
    reviews: PaginatedResponse<Review>;
    statistics: ReviewStatistics;
  }> {
    return await apiClient.get<any>(
      API_ENDPOINTS.REVIEWS.PRODUCT_REVIEWS(productId),
      query,
    );
  },

  // Get product review statistics
  async getProductReviewStatistics(
    productId: string,
  ): Promise<ReviewStatistics> {
    return await apiClient.get<ReviewStatistics>(
      API_ENDPOINTS.REVIEWS.PRODUCT_STATS(productId),
    );
  },

  // Get user's reviews
  async getUserReviews(
    query: Omit<ReviewFilterOptions, 'userId'> = {},
  ): Promise<PaginatedResponse<Review>> {
    return await apiClient.get<PaginatedResponse<Review>>(
      API_ENDPOINTS.REVIEWS.USER_REVIEWS,
      query,
    );
  },

  // Get products user can review
  async getReviewableProducts(): Promise<ReviewableProduct[]> {
    return await apiClient.get<ReviewableProduct[]>(
      API_ENDPOINTS.REVIEWS.REVIEWABLE_PRODUCTS,
    );
  },

  // Get user's review for specific product
  async getReviewByUserAndProduct(productId: string): Promise<Review | null> {
    try {
      return await apiClient.get<Review>(
        API_ENDPOINTS.REVIEWS.USER_PRODUCT_REVIEW(productId),
      );
    } catch (error: any) {
      if (error.status === 404) {
        return null;
      }
      throw error;
    }
  },
};
