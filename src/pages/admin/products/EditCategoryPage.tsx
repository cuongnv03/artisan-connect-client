import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminCategories } from '../../../hooks/products/useAdminCategories';
import { CategoryForm } from '../../../components/products/admin/CategoryForm';
import { UpdateCategoryRequest, Category } from '../../../types/product';
import { useToastContext } from '../../../contexts/ToastContext';
import { Button } from '../../../components/ui/Button';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const EditCategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const { categories, updateCategory } = useAdminCategories();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (categories.length > 0 && categoryId) {
      const foundCategory = categories.find((c) => c.id === categoryId);
      setCategory(foundCategory || null);
      setLoading(false);
    }
  }, [categories, categoryId]);

  const handleSubmit = async (data: UpdateCategoryRequest) => {
    if (!categoryId) return;

    try {
      await updateCategory(categoryId, data);
      success('Cập nhật danh mục thành công');
      navigate('/admin/categories');
    } catch (err: any) {
      error(err.message);
      throw err;
    }
  };

  const handleCancel = () => {
    navigate('/admin/categories');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Không tìm thấy danh mục
        </h1>
        <p className="text-gray-600 mb-6">
          Danh mục có thể đã bị xóa hoặc không tồn tại
        </p>
        <Button onClick={() => navigate('/admin/categories')}>
          Quay về danh sách danh mục
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/categories')}
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Quay lại
        </Button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa danh mục</h1>
        <p className="text-gray-600">
          Cập nhật thông tin danh mục "{category.name}"
        </p>
      </div>

      {/* Form */}
      <CategoryForm
        initialData={{
          name: category.name,
          description: category.description || '',
          imageUrl: category.imageUrl || '',
          parentId: category.parentId || '',
          sortOrder: category.sortOrder,
        }}
        categoryId={category.id}
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditing={true}
      />
    </div>
  );
};
