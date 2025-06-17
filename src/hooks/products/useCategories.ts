import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { Category } from '../../types/product';

export interface UseCategoriesReturn {
  categories: Category[];
  categoryTree: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
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

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    categoryTree,
    loading,
    error,
    refetch: fetchCategories,
  };
};
