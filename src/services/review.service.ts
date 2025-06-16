import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { Review, ReviewStatistics } from '../types/product';
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
  isVerifiedPurchase?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'rating' | 'updatedAt' | 'helpfulCount';
  sortOrder?: 'asc' | 'desc';
}

export interface ReviewableProduct {
  productId: string;
  orderId: string;
  orderDate: Date;
  product: {
    id: string;
    name: string;
    slug?: string;
    images: string[];
    price: number;
    discountPrice?: number;
    featuredImage?: string;
  };
}

export const reviewService = {
  // Create review
  async createReview(data: CreateReviewRequest): Promise<Review> {
    return await apiClient.post<Review>(API_ENDPOINTS.REVIEWS.BASE, data);
  },

  // Update review
  async updateReview(id: string, data: UpdateReviewRequest): Promise<Review> {
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
    query: GetReviewsQuery = {},
  ): Promise<PaginatedResponse<Review>> {
    return await apiClient.get<PaginatedResponse<Review>>(
      API_ENDPOINTS.REVIEWS.BASE,
      query,
    );
  },

  // Get product reviews with statistics
  async getProductReviews(
    productId: string,
    query: Omit<GetReviewsQuery, 'productId'> = {},
  ): Promise<{
    reviews: PaginatedResponse<Review>;
    statistics: ReviewStatistics;
  }> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.REVIEWS.PRODUCT_REVIEWS(productId),
      query,
    );

    // Handle different response structures
    if (response.reviews && response.statistics) {
      return {
        reviews: response.reviews,
        statistics: response.statistics,
      };
    }

    // Fallback for direct structure
    return {
      reviews: response,
      statistics: await this.getProductReviewStatistics(productId),
    };
  },

  // Get product review statistics
  async getProductReviewStatistics(
    productId: string,
  ): Promise<ReviewStatistics> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.REVIEWS.PRODUCT_STATS(productId),
    );

    return response.statistics || response;
  },

  // Get user's reviews
  async getUserReviews(
    query: Omit<GetReviewsQuery, 'userId'> = {},
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
      if (error.status === 404 || error.response?.status === 404) {
        return null;
      }
      console.warn('Error checking user review status:', error);
      return null;
    }
  },

  // Check if user can review product (helper)
  async canUserReviewProduct(productId: string): Promise<boolean> {
    const review = await this.getReviewByUserAndProduct(productId);
    return review === null;
  },

  // Get review summary for product (helper)
  async getProductReviewSummary(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    canUserReview: boolean;
    userReview?: Review;
  }> {
    const [statistics, userReview] = await Promise.all([
      this.getProductReviewStatistics(productId),
      this.getReviewByUserAndProduct(productId),
    ]);

    return {
      averageRating: statistics.averageRating,
      totalReviews: statistics.totalReviews,
      canUserReview: userReview === null,
      userReview: userReview || undefined,
    };
  },
};
