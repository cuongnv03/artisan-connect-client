import { BaseEntity, SoftDeleteEntity, PaginationParams } from './common';
import { User } from './auth';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DELETED = 'DELETED',
}

export interface Product extends SoftDeleteEntity {
  sellerId: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  status: ProductStatus;
  images: string[];
  tags: string[];
  isCustomizable: boolean;
  avgRating?: number;
  reviewCount: number;
  viewCount: number;
  salesCount: number;
  seller?: User;
  categories?: Category[];
}

export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  level: number;
  sortOrder: number;
  isActive: boolean;
  children?: Category[];
}

export interface PriceHistory extends BaseEntity {
  productId: string;
  price: number;
  changeNote?: string;
}

export interface Review extends BaseEntity {
  userId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  user?: User;
  product?: Product;
}

// DTOs
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  images: string[];
  tags?: string[];
  isCustomizable?: boolean;
  categoryIds?: string[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface GetProductsQuery extends PaginationParams {
  categoryId?: string;
  sellerId?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  isCustomizable?: boolean;
}

export interface SearchProductsQuery extends GetProductsQuery {
  q: string;
}
