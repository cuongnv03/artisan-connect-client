import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Product,
  Category,
  CreateProductRequest,
  UpdateProductRequest,
  GetProductsQuery,
  SearchProductsQuery,
} from '../types/product';
import { PaginatedResponse } from '../types/common';

export const productService = {
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

  async viewProduct(id: string): Promise<void> {
    await apiClient.post(`${API_ENDPOINTS.PRODUCTS.BY_ID(id)}/view`);
  },

  async updateProductStatus(
    id: string,
    status: 'publish' | 'unpublish',
  ): Promise<Product> {
    const endpoint =
      status === 'publish'
        ? API_ENDPOINTS.PRODUCTS.PUBLISH(id)
        : API_ENDPOINTS.PRODUCTS.UNPUBLISH(id);
    return await apiClient.post<Product>(endpoint);
  },

  async deleteProduct(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.PRODUCTS.BY_ID(id));
  },

  async getMyProducts(
    query: GetProductsQuery = {},
  ): Promise<PaginatedResponse<Product>> {
    return await apiClient.get<PaginatedResponse<Product>>(
      API_ENDPOINTS.PRODUCTS.MY_PRODUCTS,
      query,
    );
  },

  async getMyProductStats(): Promise<any> {
    return await apiClient.get<any>(API_ENDPOINTS.PRODUCTS.MY_STATS);
  },

  async getPriceHistory(id: string): Promise<any[]> {
    return await apiClient.get<any[]>(API_ENDPOINTS.PRODUCTS.PRICE_HISTORY(id));
  },

  async updatePrice(
    id: string,
    price: number,
    changeNote?: string,
  ): Promise<Product> {
    return await apiClient.patch<Product>(
      API_ENDPOINTS.PRODUCTS.UPDATE_PRICE(id),
      {
        price,
        changeNote,
      },
    );
  },

  async publishProduct(id: string): Promise<Product> {
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.PUBLISH(id));
  },

  async unpublishProduct(id: string): Promise<Product> {
    return await apiClient.post<Product>(API_ENDPOINTS.PRODUCTS.UNPUBLISH(id));
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
      `${API_ENDPOINTS.CATEGORIES.BASE}/slug/${slug}`,
    );
  },
};
