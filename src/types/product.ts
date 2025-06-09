import { BaseEntity, SoftDeleteEntity, PaginationParams } from './common';
import { User } from './auth';

export enum ProductStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DELETED = 'DELETED',
}

export enum AttributeType {
  TEXT = 'TEXT',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  BOOLEAN = 'BOOLEAN',
  DATE = 'DATE',
  URL = 'URL',
  EMAIL = 'EMAIL',
}

// Enhanced Product interface
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

  // New fields
  specifications?: Record<string, any>;
  customFields?: Record<string, any>;
  hasVariants: boolean;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };

  // Relations
  seller?: User;
  categories?: Category[];
  attributes?: ProductAttribute[];
  variants?: ProductVariant[];
  priceHistory?: PriceHistory[];
}

// Product Attributes
export interface ProductAttribute extends BaseEntity {
  productId: string;
  key: string;
  name: string;
  value: string;
  type: AttributeType;
  unit?: string;
}

// Product Variants
export interface ProductVariant extends BaseEntity {
  productId: string;
  sku: string;
  name?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  images: string[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  attributes: ProductVariantAttribute[];
}

export interface ProductVariantAttribute {
  id: string;
  variantId: string;
  key: string;
  name: string;
  value: string;
}

// Attribute Templates
export interface CategoryAttributeTemplate extends BaseEntity {
  categoryId: string;
  name: string;
  key: string;
  type: AttributeType;
  isRequired: boolean;
  isVariant: boolean;
  options?: string[];
  unit?: string;
  sortOrder: number;
  description?: string;
}

export interface CustomAttributeTemplate extends BaseEntity {
  artisanId: string;
  name: string;
  key: string;
  type: AttributeType;
  options?: string[];
  unit?: string;
  description?: string;
  isActive: boolean;
}

// Price History
export interface PriceHistory extends BaseEntity {
  productId: string;
  price: number;
  changeNote?: string;
}

// DTOs for API calls
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  categories: string[];
  images: string[];
  tags?: string[];
  isCustomizable?: boolean;
  specifications?: Record<string, any>;
  customFields?: Record<string, any>;
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  attributes?: CreateProductAttributeRequest[];
  variants?: CreateProductVariantRequest[];
}

export interface CreateProductAttributeRequest {
  key: string;
  value: string;
  unit?: string;
}

export interface CreateProductVariantRequest {
  name?: string;
  price?: number;
  discountPrice?: number;
  quantity: number;
  images?: string[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  attributes: { key: string; value: string }[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: ProductStatus;
}

export interface UpdatePriceRequest {
  price: number;
  note?: string;
}

// Query interfaces
export interface GetProductsQuery extends PaginationParams {
  categoryId?: string;
  sellerId?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  tags?: string[];
  isCustomizable?: boolean;
  inStock?: boolean;
}

export interface SearchProductsQuery extends GetProductsQuery {
  q: string;
}

// Category interface (updated)
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
  productCount?: number;
  attributeTemplates?: CategoryAttributeTemplate[];
}

export interface ProductStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  totalViews: number;
  totalSales: number;
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
