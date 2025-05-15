import { Category } from './category.types';

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  price: number;
  discountPrice?: number | null;
  quantity: number;
  sku?: string | null;
  weight?: number | null;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  } | null;
  status: ProductStatus;
  images: string[];
  tags: string[];
  attributes?: Record<string, any> | null;
  isCustomizable: boolean;
  avgRating?: number | null;
  reviewCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
  categories?: Category[];
  seller?: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string | null;
    artisanProfile?: {
      shopName: string;
      isVerified: boolean;
    } | null;
  };
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED',
  DELETED = 'DELETED',
}

export interface ProductFormData {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  sku?: string;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  status: ProductStatus;
  tags: string[];
  isCustomizable: boolean;
  categoryIds?: string[];
  attributes?: Record<string, any>;
}

export interface ProductQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  tags?: string[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: ProductStatus | ProductStatus[];
}
