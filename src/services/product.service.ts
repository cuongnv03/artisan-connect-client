import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Product,
  Category,
  CategoryAttributeTemplate,
  PriceHistory,
  CreateProductRequest,
  UpdateProductRequest,
  UpdatePriceRequest,
  GetProductsQuery,
  SearchProductsQuery,
  ProductStats,
  CategoryQueryOptions,
  CreateCategoryAttributeTemplateRequest,
  UpdateCategoryRequest,
  CreateCategoryRequest,
} from '../types/product';
import { PaginatedResponse } from '../types/common';

export const productService = {
  // === PRODUCT CRUD ===
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
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.BASE, {
      ...data,
      tags: data.tags || [],
      featuredImage: data.featuredImage || data.images[0],
    });
  },

  async updateProduct(
    id: string,
    data: UpdateProductRequest,
  ): Promise<Product> {
    return await apiClient.patch<Product>(API_ENDPOINTS.PRODUCTS.BY_ID(id), {
      ...data,
      tags: data.tags || [],
    });
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  // === MY PRODUCTS (ARTISAN) ===
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

  // === PRICE MANAGEMENT ===
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

  // === PRODUCT STATUS ===
  async publishProduct(id: string): Promise<Product> {
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.PUBLISH(id));
  },

  async unpublishProduct(id: string): Promise<Product> {
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.UNPUBLISH(id));
  },

  // === CATEGORIES ===
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

  // === CATEGORY ATTRIBUTE TEMPLATES ===
  async getCategoryAttributeTemplates(
    categoryId: string,
  ): Promise<CategoryAttributeTemplate[]> {
    return await apiClient.get<CategoryAttributeTemplate[]>(
      API_ENDPOINTS.CATEGORIES.ATTRIBUTE_TEMPLATES(categoryId),
    );
  },

  // === CATEGORY MANAGEMENT (ADMIN) ===
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return await apiClient.post<Category>(API_ENDPOINTS.CATEGORIES.BASE, data);
  },

  async updateCategory(
    id: string,
    data: UpdateCategoryRequest,
  ): Promise<Category> {
    return await apiClient.patch<Category>(
      API_ENDPOINTS.CATEGORIES.BY_ID(id),
      data,
    );
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id));
  },

  // === CATEGORY ATTRIBUTE TEMPLATES ===
  async createCategoryAttributeTemplate(
    categoryId: string,
    data: CreateCategoryAttributeTemplateRequest,
  ): Promise<CategoryAttributeTemplate> {
    return await apiClient.post<CategoryAttributeTemplate>(
      API_ENDPOINTS.CATEGORIES.ATTRIBUTE_TEMPLATES(categoryId),
      data,
    );
  },

  async updateCategoryAttributeTemplate(
    templateId: string,
    data: Partial<CreateCategoryAttributeTemplateRequest>,
  ): Promise<CategoryAttributeTemplate> {
    return await apiClient.patch<CategoryAttributeTemplate>(
      `/categories/templates/${templateId}`,
      data,
    );
  },

  async deleteCategoryAttributeTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/categories/templates/${templateId}`);
  },

  // === ENHANCED CATEGORY QUERIES ===
  async getCategoryWithOptions(
    slug: string,
    options: CategoryQueryOptions = {},
  ): Promise<Category> {
    return await apiClient.get<Category>(
      API_ENDPOINTS.CATEGORIES.BY_SLUG(slug),
      options,
    );
  },
};
