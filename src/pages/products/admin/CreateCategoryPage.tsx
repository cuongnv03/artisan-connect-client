import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminCategories } from '../../../hooks/products/useAdminCategories';
import { CategoryForm } from '../../../components/products/admin/CategoryForm/CategoryForm';
import { CreateCategoryRequest } from '../../../types/product';
import { useToastContext } from '../../../contexts/ToastContext';
import { Button } from '../../../components/ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const CreateCategoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const { categories, createCategory } = useAdminCategories();

  const handleSubmit = async (data: CreateCategoryRequest) => {
    try {
      await createCategory(data);
      success('Tạo danh mục thành công');
      navigate('/admin/categories');
    } catch (err: any) {
      error(err.message);
      throw err; // Re-throw to prevent form from resetting
    }
  };

  const handleCancel = () => {
    navigate('/admin/categories');
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Tạo danh mục mới</h1>
        <p className="text-gray-600">Tạo danh mục mới để tổ chức sản phẩm</p>
      </div>

      {/* Form */}
      <CategoryForm
        categories={categories}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isEditing={false}
      />
    </div>
  );
};
