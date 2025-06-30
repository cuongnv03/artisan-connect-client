import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../types/product';

export interface UseAdminCategoriesReturn {
  categories: Category[];
  categoryTree: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createCategory: (data: CreateCategoryRequest) => Promise<Category>;
  updateCategory: (
    id: string,
    data: UpdateCategoryRequest,
  ) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useAdminCategories = (): UseAdminCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<{
        categories: Category[];
        categoryTree: Category[];
      }>('/admin/categories');

      setCategories(response.categories);
      setCategoryTree(response.categoryTree);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (
    data: CreateCategoryRequest,
  ): Promise<Category> => {
    try {
      const newCategory = await apiClient.post<Category>(
        '/admin/categories',
        data,
      );
      await fetchCategories(); // Refresh data
      return newCategory;
    } catch (err: any) {
      throw new Error(err.message || 'Không thể tạo danh mục');
    }
  };

  const updateCategory = async (
    id: string,
    data: UpdateCategoryRequest,
  ): Promise<Category> => {
    try {
      const updatedCategory = await apiClient.patch<Category>(
        `/admin/categories/${id}`,
        data,
      );
      await fetchCategories(); // Refresh data
      return updatedCategory;
    } catch (err: any) {
      throw new Error(err.message || 'Không thể cập nhật danh mục');
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/categories/${id}`);
      await fetchCategories(); // Refresh data
    } catch (err: any) {
      throw new Error(err.message || 'Không thể xóa danh mục');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    categoryTree,
    loading,
    error,
    refetch: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
