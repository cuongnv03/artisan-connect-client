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

// Product interface
export interface Product extends SoftDeleteEntity {
  sellerId: string;
  name: string;
  slug?: string | null;
  description?: string | null;
  price: number; // Đã convert từ Decimal
  discountPrice?: number | null;
  quantity: number;
  minOrderQty: number;
  maxOrderQty?: number | null;
  sku?: string | null;
  barcode?: string | null;
  weight?: number | null;
  dimensions?: Record<string, any> | null;
  isCustomizable: boolean;
  allowNegotiation: boolean;
  shippingInfo?: Record<string, any> | null;
  status: ProductStatus;
  tags: string[];
  images: string[];
  featuredImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  attributes?: Record<string, any> | null;
  specifications?: Record<string, any> | null;
  customFields?: Record<string, any> | null;
  hasVariants: boolean;
  viewCount: number;
  salesCount: number;
  avgRating?: number | null;
  reviewCount: number;

  // Relations
  seller?: {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    avatarUrl?: string | null;
    artisanProfile?: {
      shopName: string;
      isVerified: boolean;
    } | null;
  };
  categories?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  variants?: ProductVariant[];
  priceHistory?: PriceHistory[];
  postMentions?: PostProductMention[];
  isWishlisted?: boolean; // For authenticated users
}

// Product Variants
export interface ProductVariant extends BaseEntity {
  productId: string;
  sku: string;
  name?: string | null;
  price: number;
  discountPrice?: number | null;
  quantity: number;
  images: string[];
  weight?: number | null;
  dimensions?: Record<string, any> | null;
  attributes: Record<string, any>; // Thay đổi từ array sang object
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

// Price History
export interface PriceHistory extends BaseEntity {
  productId: string;
  price: number;
  changeNote?: string | null;
  changedBy?: string | null;
}

// Category
export interface Category extends BaseEntity {
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  parentId?: string | null;
  level: number;
  sortOrder: number;
  isActive: boolean;
  parent?: Category | null;
  children?: Category[];
  productCount?: number;
  attributeTemplates?: CategoryAttributeTemplate[];
}

// Category Attribute Template
export interface CategoryAttributeTemplate extends BaseEntity {
  categoryId: string;
  name: string;
  key: string;
  type: AttributeType;
  isRequired: boolean;
  isVariant: boolean;
  options?: string[] | null;
  unit?: string | null;
  sortOrder: number;
  description?: string | null;
  isCustom: boolean;
  createdBy?: string | null;
}

// Post Product Mention
export interface PostProductMention {
  id: string;
  postId: string;
  productId: string;
  contextText?: string | null;
  position?: number | null;
  post: {
    id: string;
    title: string;
    slug?: string | null;
    type: string;
    user: {
      id: string;
      username: string;
      firstName: string;
      lastName: string;
    };
  };
}

// DTOs
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  minOrderQty?: number;
  maxOrderQty?: number;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: Record<string, any>;
  isCustomizable?: boolean;
  allowNegotiation?: boolean;
  shippingInfo?: Record<string, any>;
  tags?: string[];
  images: string[];
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  attributes?: Record<string, any>;
  specifications?: Record<string, any>;
  customFields?: Record<string, any>;
  categoryIds: string[]; // Thay đổi từ categories sang categoryIds
  variants?: CreateProductVariantRequest[];
}

export interface CreateProductVariantRequest {
  name?: string;
  price?: number;
  discountPrice?: number;
  quantity: number;
  images?: string[];
  weight?: number;
  dimensions?: Record<string, any>;
  attributes: Record<string, any>; // Object thay vì array
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
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
  sellerId?: string;
  categoryIds?: string | string[]; // Support both single and multiple
  search?: string;
  status?: ProductStatus;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  inStock?: boolean;
  hasVariants?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface SearchProductsQuery extends PaginationParams {
  q: string;
  categoryIds?: string | string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductStats {
  totalProducts: number;
  publishedProducts: number;
  draftProducts: number;
  outOfStockProducts: number;
  totalViews: number;
  totalSales: number;
  avgRating?: number;
}

export interface CategoryQueryOptions {
  includeParent?: boolean;
  includeChildren?: boolean;
  includeProductCount?: boolean;
  includeAttributeTemplates?: boolean;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  isActive?: boolean;
}

export interface CreateCategoryAttributeTemplateRequest {
  name: string;
  key: string;
  type: AttributeType;
  isRequired?: boolean;
  isVariant?: boolean;
  options?: string[];
  unit?: string;
  sortOrder?: number;
  description?: string;
}

// Thêm interface cho product pagination result
export interface ProductPaginationResult {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
