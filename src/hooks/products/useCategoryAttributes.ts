import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import {
  CategoryAttributeTemplate,
  CreateCategoryAttributeTemplateRequest,
} from '../../types/product';

export interface UseCategoryAttributesReturn {
  attributes: CategoryAttributeTemplate[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createAttribute: (
    data: CreateCategoryAttributeTemplateRequest,
  ) => Promise<CategoryAttributeTemplate>;
  updateAttribute: (
    id: string,
    data: Partial<CreateCategoryAttributeTemplateRequest>,
  ) => Promise<CategoryAttributeTemplate>;
  deleteAttribute: (id: string) => Promise<void>;
}

export const useCategoryAttributes = (
  categoryId: string,
): UseCategoryAttributesReturn => {
  const [attributes, setAttributes] = useState<CategoryAttributeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttributes = async () => {
    if (!categoryId) return;

    try {
      setLoading(true);
      setError(null);
      const attributesData = await productService.getCategoryAttributeTemplates(
        categoryId,
      );
      setAttributes(attributesData);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thuộc tính');
    } finally {
      setLoading(false);
    }
  };

  const createAttribute = async (
    data: CreateCategoryAttributeTemplateRequest,
  ): Promise<CategoryAttributeTemplate> => {
    try {
      const newAttribute = await productService.createCategoryAttributeTemplate(
        categoryId,
        data,
      );
      setAttributes((prev) => [...prev, newAttribute]);
      return newAttribute;
    } catch (err: any) {
      throw new Error(err.message || 'Không thể tạo thuộc tính');
    }
  };

  const updateAttribute = async (
    id: string,
    data: Partial<CreateCategoryAttributeTemplateRequest>,
  ): Promise<CategoryAttributeTemplate> => {
    try {
      const updatedAttribute =
        await productService.updateCategoryAttributeTemplate(id, data);
      setAttributes((prev) =>
        prev.map((attr) => (attr.id === id ? updatedAttribute : attr)),
      );
      return updatedAttribute;
    } catch (err: any) {
      throw new Error(err.message || 'Không thể cập nhật thuộc tính');
    }
  };

  const deleteAttribute = async (id: string): Promise<void> => {
    try {
      await productService.deleteCategoryAttributeTemplate(id);
      setAttributes((prev) => prev.filter((attr) => attr.id !== id));
    } catch (err: any) {
      throw new Error(err.message || 'Không thể xóa thuộc tính');
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, [categoryId]);

  return {
    attributes,
    loading,
    error,
    refetch: fetchAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
  };
};
