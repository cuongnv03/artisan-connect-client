import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { Review } from '../types/product';
import { PaginatedResponse } from '../types/common';

export interface CreateReviewRequest {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface GetReviewsQuery {
  productId?: string;
  userId?: string;
  rating?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export const reviewService = {
  async createReview(data: CreateReviewRequest): Promise<Review> {
    return await apiClient.post<Review>(API_ENDPOINTS.REVIEWS.BASE, data);
  },

  async updateReview(id: string, data: UpdateReviewRequest): Promise<Review> {
    return await apiClient.patch<Review>(API_ENDPOINTS.REVIEWS.BY_ID(id), data);
  },

  async deleteReview(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.REVIEWS.BY_ID(id));
  },

  async getReview(id: string): Promise<Review> {
    return await apiClient.get<Review>(API_ENDPOINTS.REVIEWS.BY_ID(id));
  },

  async getReviews(
    query: GetReviewsQuery = {},
  ): Promise<PaginatedResponse<Review>> {
    return await apiClient.get<PaginatedResponse<Review>>(
      API_ENDPOINTS.REVIEWS.BASE,
      query,
    );
  },

  async getProductReviews(
    productId: string,
    query: Omit<GetReviewsQuery, 'productId'> = {},
  ): Promise<any> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.REVIEWS.PRODUCT_REVIEWS(productId),
      query,
    );

    if (response.reviews && response.reviews.data) {
      return {
        data: response.reviews.data,
        meta: response.reviews.meta,
        statistics: response.statistics,
      };
    }

    // Fallback for direct structure
    return response;
  },

  async getProductReviewStatistics(
    productId: string,
  ): Promise<ReviewStatistics> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.REVIEWS.PRODUCT_STATS(productId),
    );

    return response.statistics || response;
  },

  async getUserReviews(
    query: Omit<GetReviewsQuery, 'userId'> = {},
  ): Promise<PaginatedResponse<Review>> {
    return await apiClient.get<PaginatedResponse<Review>>(
      API_ENDPOINTS.REVIEWS.USER_REVIEWS,
      query,
    );
  },

  async getReviewableProducts(): Promise<
    {
      productId: string;
      orderId: string;
      orderDate: Date;
      product: {
        id: string;
        name: string;
        slug: string;
        images: string[];
        price: number;
        discountPrice?: number;
      };
    }[]
  > {
    return await apiClient.get(API_ENDPOINTS.REVIEWS.REVIEWABLE_PRODUCTS);
  },

  async getReviewByUserAndProduct(productId: string): Promise<Review | null> {
    try {
      return await apiClient.get<Review>(
        `${API_ENDPOINTS.REVIEWS.BASE}/user-product/${productId}`,
      );
    } catch (error: any) {
      if (error.status === 404 || error.response?.status === 404) {
        return null;
      }
      console.warn('Error checking user review status:', error);
      return null;
    }
  },
};
