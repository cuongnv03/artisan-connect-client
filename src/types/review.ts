import { BaseEntity } from './common';
import { User } from './auth';

export interface Review extends BaseEntity {
  userId: string;
  productId: string;
  rating: number; // 1-5
  title?: string | null;
  comment?: string | null;
  images: string[];
  helpfulCount: number;
  isVerifiedPurchase: boolean;
  orderItemId?: string | null;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
  };
}

export interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  verifiedPurchaseCount: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export interface CreateReviewDto {
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewDto {
  rating?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface ReviewFilterOptions {
  productId?: string;
  userId?: string;
  rating?: number;
  isVerifiedPurchase?: boolean;
  sortBy?: 'createdAt' | 'rating' | 'updatedAt' | 'helpfulCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
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
