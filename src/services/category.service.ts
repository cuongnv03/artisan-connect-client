import api from './api';
import { Category } from '../types/category.types';
import { PaginatedResponse } from '../types/api.types';

export const CategoryService = {
  getCategories: async (): Promise<PaginatedResponse<Category>> => {
    const response = await api.get('/categories');
    return response.data.data;
  },

  getCategoryById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data.data;
  },

  getCategoryBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data.data;
  },
};
