import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { Category } from '../../types/product';
import { useToastContext } from '../../contexts/ToastContext';

export const useProductCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { error: showError } = useToastContext();

  useEffect(() => {
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
        const errorMessage = err.message || 'Không thể tải danh mục sản phẩm';
        setError(errorMessage);
        showError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
    try {
      return await productService.getCategoryBySlug(slug);
    } catch (err) {
      return null;
    }
  };

  const getCategoryById = (id: string): Category | null => {
    return categories.find((cat) => cat.id === id) || null;
  };

  return {
    categories,
    categoryTree,
    loading,
    error,
    getCategoryBySlug,
    getCategoryById,
  };
};
