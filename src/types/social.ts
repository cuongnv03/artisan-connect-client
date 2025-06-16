import { BaseEntity, SoftDeleteEntity } from './common';
import { User } from './auth';
import { Post } from './post';

export interface Comment extends SoftDeleteEntity {
  postId: string;
  userId: string;
  parentId?: string;
  content: string;
  mediaUrl?: string;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  post?: Post;
  user: User;
  parent?: Comment;
  replies?: Comment[];
  isLiked?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface Like extends BaseEntity {
  userId: string;
  postId?: string;
  commentId?: string;
  reaction: string;
  user?: User;
  post?: Post;
  comment?: Comment;
}
export enum WishlistItemType {
  PRODUCT = 'PRODUCT',
  POST = 'POST',
}

// Base Wishlist interface (entity)
export interface Wishlist extends BaseEntity {
  userId: string;
  itemType: WishlistItemType;
  productId?: string;
  postId?: string;
}

export interface WishlistWithDetails {
  id: string;
  userId: string;
  itemType: WishlistItemType;
  productId?: string;
  postId?: string;
  createdAt: Date;
  product?: {
    id: string;
    name: string;
    slug?: string;
    images: string[];
    price: number;
    discountPrice?: number;
    status: string;
    avgRating?: number;
    reviewCount: number;
    seller: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      artisanProfile?: {
        shopName: string;
        isVerified: boolean;
      };
    };
  };
  post?: {
    id: string;
    title: string;
    slug?: string;
    summary?: string;
    thumbnailUrl?: string;
    type: string;
    createdAt: Date;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
      artisanProfile?: {
        shopName: string;
        isVerified: boolean;
      };
    };
  };
}

// DTOs
export interface CreateCommentRequest {
  postId: string;
  parentId?: string;
  content: string;
  mediaUrl?: string;
}

export interface UpdateCommentRequest {
  content?: string;
  mediaUrl?: string;
}

export interface LikeToggleRequest {
  postId?: string;
  commentId?: string;
}

export interface AddToWishlistRequest {
  itemType: WishlistItemType;
  productId?: string;
  postId?: string;
}

export interface WishlistToggleRequest {
  itemType: WishlistItemType;
  productId?: string;
  postId?: string;
}

// Pagination result cho Wishlist
export interface WishlistPaginationResult {
  data: WishlistWithDetails[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
