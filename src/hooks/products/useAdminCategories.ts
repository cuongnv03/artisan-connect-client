import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
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

      const [categoriesData, treeData] = await Promise.all([
        productService.getCategories(),
        productService.getCategoryTree(),
      ]);

      setCategories(categoriesData);
      setCategoryTree(treeData);
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
      const newCategory = await productService.createCategory(data);
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
      const updatedCategory = await productService.updateCategory(id, data);
      await fetchCategories(); // Refresh data
      return updatedCategory;
    } catch (err: any) {
      throw new Error(err.message || 'Không thể cập nhật danh mục');
    }
  };

  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await productService.deleteCategory(id);
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
