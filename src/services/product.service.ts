import api from './api';
import { PaginatedResponse } from '../types/api.types';

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  discountPrice?: number;
  quantity: number;
  sku?: string;
  status: string;
  images: string[];
  tags: string[];
  isCustomizable: boolean;
  avgRating?: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
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
}

export const ProductService = {
  getProducts: async (
    options: ProductQueryOptions = {},
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products', { params: options });
    return response.data.data;
  },

  getProductById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data.data;
  },

  getProductBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/slug/${slug}`);
    return response.data.data;
  },

  getMyProducts: async (
    options: ProductQueryOptions = {},
  ): Promise<PaginatedResponse<Product>> => {
    const response = await api.get('/products/me', { params: options });
    return response.data.data;
  },

  getProductsByIds: async (ids: string[]): Promise<Product[]> => {
    if (ids.length === 0) return [];
    const response = await api.get('/products/batch', {
      params: { ids: ids.join(',') },
    });
    return response.data.data;
  },

  createProduct: async (data: FormData): Promise<Product> => {
    const response = await api.post('/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  updateProduct: async (id: string, data: FormData): Promise<Product> => {
    const response = await api.patch(`/products/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getPriceHistory: async (id: string): Promise<any[]> => {
    const response = await api.get(`/products/${id}/price-history`);
    return response.data.data;
  },

  updatePrice: async (
    id: string,
    data: { price: number; changeNote?: string },
  ): Promise<Product> => {
    const response = await api.patch(`/products/${id}/price`, data);
    return response.data.data;
  },
};
