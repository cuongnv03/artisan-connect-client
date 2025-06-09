import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Product,
  Category,
  ProductAttribute,
  ProductVariant,
  CategoryAttributeTemplate,
  CustomAttributeTemplate,
  PriceHistory,
  CreateProductRequest,
  UpdateProductRequest,
  UpdatePriceRequest,
  CreateProductAttributeRequest,
  CreateProductVariantRequest,
  GetProductsQuery,
  SearchProductsQuery,
  ProductStats,
} from '../types/product';
import { PaginatedResponse } from '../types/common';

export const productService = {
  // Basic Product CRUD
  async getProducts(
    query: GetProductsQuery = {},
  ): Promise<PaginatedResponse<Product>> {
    return await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.BASE,
      query,
    );
  },

  async searchProducts(
    query: SearchProductsQuery,
  ): Promise<PaginatedResponse<Product>> {
    return await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.SEARCH,
      query,
    );
  },

  async getProduct(id: string): Promise<Product> {
    return await apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  async getProductBySlug(slug: string): Promise<Product> {
    return await apiClient.get<Product>(API_ENDPOINTS.PRODUCTS.BY_SLUG(slug));
  },

  async createProduct(data: CreateProductRequest): Promise<Product> {
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, data);
  },

  async updateProduct(
    id: string,
    data: UpdateProductRequest,
  ): Promise<Product> {
    return await apiClient.patch<Product>(
      API_ENDPOINTS.PRODUCTS.BY_ID(id),
      data,
    );
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  async viewProduct(id: string): Promise<void> {
    await apiClient.post(API_ENDPOINTS.PRODUCTS.VIEW(id));
  },

  // My Products (Artisan)
  async getMyProducts(
    query: GetProductsQuery = {},
  ): Promise<PaginatedResponse<Product>> {
    return await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.MY_PRODUCTS,
      query,
    );
  },

  async getMyProductStats(): Promise<ProductStats> {
    return await apiClient.get<ProductStats>(API_ENDPOINTS.PRODUCTS.MY_STATS);
  },

  // Price Management
  async getPriceHistory(
    id: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResponse<PriceHistory>> {
    return await apiClient.get<PaginatedResponse<PriceHistory>>(
      API_ENDPOINTS.PRODUCTS.PRICE_HISTORY(id),
      { page, limit },
    );
  },

  async updatePrice(id: string, data: UpdatePriceRequest): Promise<Product> {
    return await apiClient.patch<Product>(
      API_ENDPOINTS.PRODUCTS.UPDATE_PRICE(id),
      data,
    );
  },

  // Product Status
  async publishProduct(id: string): Promise<Product> {
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.PUBLISH(id));
  },

  async unpublishProduct(id: string): Promise<Product> {
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.UNPUBLISH(id));
  },

  // Product Attributes
  async getProductAttributes(productId: string): Promise<ProductAttribute[]> {
    return await apiClient.get<ProductAttribute[]>(
      API_ENDPOINTS.ATTRIBUTES.PRODUCT_ATTRIBUTES(productId),
    );
  },

  async setProductAttributes(
    productId: string,
    attributes: CreateProductAttributeRequest[],
  ): Promise<ProductAttribute[]> {
    return await apiClient.post<ProductAttribute[]>(
      API_ENDPOINTS.ATTRIBUTES.PRODUCT_ATTRIBUTES(productId),
      { attributes },
    );
  },

  // Product Variants
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    return await apiClient.get<ProductVariant[]>(
      API_ENDPOINTS.VARIANTS.PRODUCT_VARIANTS(productId),
    );
  },

  async createProductVariant(
    productId: string,
    data: CreateProductVariantRequest,
  ): Promise<ProductVariant> {
    return await apiClient.post<ProductVariant>(
      API_ENDPOINTS.VARIANTS.PRODUCT_VARIANTS(productId),
      data,
    );
  },

  async updateProductVariant(
    variantId: string,
    data: Partial<CreateProductVariantRequest>,
  ): Promise<ProductVariant> {
    return await apiClient.patch<ProductVariant>(
      API_ENDPOINTS.VARIANTS.VARIANT_BY_ID(variantId),
      data,
    );
  },

  async deleteProductVariant(variantId: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.VARIANTS.VARIANT_BY_ID(variantId));
  },

  async generateVariantsFromAttributes(
    productId: string,
  ): Promise<ProductVariant[]> {
    return await apiClient.post<ProductVariant[]>(
      API_ENDPOINTS.VARIANTS.GENERATE_VARIANTS(productId),
    );
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.BASE);
  },

  async getCategoryTree(): Promise<Category[]> {
    return await apiClient.get<Category[]>(API_ENDPOINTS.CATEGORIES.TREE);
  },

  async getCategory(id: string): Promise<Category> {
    return await apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  },

  async getCategoryBySlug(slug: string): Promise<Category> {
    return await apiClient.get<Category>(
      API_ENDPOINTS.CATEGORIES.BY_SLUG(slug),
    );
  },

  // Category Attribute Templates
  async getCategoryAttributeTemplates(
    categoryId: string,
  ): Promise<CategoryAttributeTemplate[]> {
    return await apiClient.get<CategoryAttributeTemplate[]>(
      API_ENDPOINTS.ATTRIBUTES.CATEGORY_TEMPLATES(categoryId),
    );
  },

  // Custom Attribute Templates (Artisan)
  async getCustomAttributeTemplates(): Promise<CustomAttributeTemplate[]> {
    return await apiClient.get<CustomAttributeTemplate[]>(
      API_ENDPOINTS.ATTRIBUTES.CUSTOM_TEMPLATES,
    );
  },

  async createCustomAttributeTemplate(data: {
    name: string;
    type: string;
    options?: string[];
    unit?: string;
    description?: string;
  }): Promise<CustomAttributeTemplate> {
    return await apiClient.post<CustomAttributeTemplate>(
      API_ENDPOINTS.ATTRIBUTES.CUSTOM_TEMPLATES,
      data,
    );
  },
};
