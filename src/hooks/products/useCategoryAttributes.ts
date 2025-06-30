import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';
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
  ) => Promise<void>;
  deleteAttribute: (templateId: string) => Promise<void>;
}

export const useCategoryAttributes = (
  categoryId: string,
): UseCategoryAttributesReturn => {
  const [attributes, setAttributes] = useState<CategoryAttributeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttributes = async () => {
    if (!categoryId) {
      setAttributes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const attributesData = await apiClient.get<CategoryAttributeTemplate[]>(
        `/admin/categories/${categoryId}/attributes`,
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
  ): Promise<void> => {
    try {
      const newAttribute = await apiClient.post<CategoryAttributeTemplate>(
        `/admin/categories/${categoryId}/attributes`,
        data,
      );
      setAttributes((prev) => [...prev, newAttribute]);
    } catch (err: any) {
      throw new Error(err.message || 'Không thể tạo thuộc tính');
    }
  };

  const deleteAttribute = async (templateId: string): Promise<void> => {
    try {
      await apiClient.delete(`/admin/categories/attributes/${templateId}`);
      setAttributes((prev) => prev.filter((attr) => attr.id !== templateId));
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
    deleteAttribute,
  };
};
