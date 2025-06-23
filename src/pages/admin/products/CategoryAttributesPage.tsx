import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategoryAttributes } from '../../../hooks/products/useCategoryAttributes';
import { useAdminCategories } from '../../../hooks/products/useAdminCategories';
import { AttributeForm } from '../../../components/products/admin/AttributeForm';
import { AttributeTable } from '../../../components/products/admin/AttributeTable';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { useToastContext } from '../../../contexts/ToastContext';
import {
  ArrowLeftIcon,
  PlusIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import {
  CategoryAttributeTemplate,
  CreateCategoryAttributeTemplateRequest,
} from '../../../types/product';

export const CategoryAttributesPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const { categories } = useAdminCategories();
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingAttribute, setEditingAttribute] =
    useState<CategoryAttributeTemplate | null>(null);

  const {
    attributes,
    loading,
    error: fetchError,
    refetch,
    createAttribute,
    updateAttribute,
    deleteAttribute,
  } = useCategoryAttributes(categoryId || '');

  const category = categories.find((c) => c.id === categoryId);

  const handleCreateAttribute = async (
    data: CreateCategoryAttributeTemplateRequest,
  ) => {
    try {
      await createAttribute(data);
      success('Tạo thuộc tính thành công');
      setFormModalOpen(false);
    } catch (err: any) {
      error(err.message);
      throw err;
    }
  };

  const handleUpdateAttribute = async (
    data: CreateCategoryAttributeTemplateRequest,
  ) => {
    if (!editingAttribute) return;

    try {
      await updateAttribute(editingAttribute.id, data);
      success('Cập nhật thuộc tính thành công');
      setEditingAttribute(null);
      setFormModalOpen(false);
    } catch (err: any) {
      error(err.message);
      throw err;
    }
  };

  const handleEdit = (attribute: CategoryAttributeTemplate) => {
    setEditingAttribute(attribute);
    setFormModalOpen(true);
  };

  const handleDelete = async (attributeId: string) => {
    await deleteAttribute(attributeId);
  };

  const handleReorder = async (
    reorderedAttributes: CategoryAttributeTemplate[],
  ) => {
    try {
      // Update sort orders for all attributes
      const updatePromises = reorderedAttributes.map((attr) =>
        updateAttribute(attr.id, { sortOrder: attr.sortOrder }),
      );
      await Promise.all(updatePromises);
      success('Cập nhật thứ tự thành công');
    } catch (err: any) {
      error(err.message);
    }
  };

  const closeModal = () => {
    setFormModalOpen(false);
    setEditingAttribute(null);
  };

  if (!categoryId) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Lỗi tham số</h1>
        <p className="text-gray-600 mb-6">Không tìm thấy ID danh mục</p>
        <Button onClick={() => navigate('/admin/categories')}>
          Quay về danh sách danh mục
        </Button>
      </div>
    );
  }

  if (!category && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
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
    <div className="max-w-7xl mx-auto px-4 py-8">
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

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Thuộc tính danh mục
          </h1>
          <p className="text-gray-600">
            Quản lý thuộc tính cho danh mục "{category?.name}"
          </p>
        </div>
        <Button
          onClick={() => setFormModalOpen(true)}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Thêm thuộc tính
        </Button>
      </div>

      {/* Category Info */}
      {category && (
        <Card className="p-6 mb-8">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-16 w-16">
              {category.imageUrl ? (
                <img
                  className="h-16 w-16 rounded-lg object-cover"
                  src={category.imageUrl}
                  alt={category.name}
                />
              ) : (
                <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Cog6ToothIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div className="ml-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {category.name}
              </h2>
              <p className="text-gray-600">{category.description}</p>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Slug: {category.slug}</span>
                <span>•</span>
                <span>Level: {category.level}</span>
                <span>•</span>
                <span>{category.productCount || 0} sản phẩm</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error State */}
      {fetchError && (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{fetchError}</p>
          <Button onClick={refetch} variant="outline">
            Thử lại
          </Button>
        </div>
      )}

      {/* Attributes Table */}
      {!loading && !fetchError && (
        <Card>
          <AttributeTable
            attributes={attributes}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onReorder={handleReorder}
          />
        </Card>
      )}

      {/* Form Modal */}
      <Modal
        isOpen={formModalOpen}
        onClose={closeModal}
        title={editingAttribute ? 'Chỉnh sửa thuộc tính' : 'Tạo thuộc tính mới'}
        size="lg"
      >
        <AttributeForm
          initialData={
            editingAttribute
              ? {
                  name: editingAttribute.name,
                  key: editingAttribute.key,
                  type: editingAttribute.type,
                  isRequired: editingAttribute.isRequired,
                  isVariant: editingAttribute.isVariant,
                  options: editingAttribute.options || [],
                  unit: editingAttribute.unit || '',
                  sortOrder: editingAttribute.sortOrder,
                  description: editingAttribute.description || '',
                }
              : undefined
          }
          onSubmit={
            editingAttribute ? handleUpdateAttribute : handleCreateAttribute
          }
          onCancel={closeModal}
          isEditing={!!editingAttribute}
        />
      </Modal>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 mt-6 bg-gray-50">
          <p className="text-sm text-gray-600">
            <strong>Debug:</strong> Category Attributes | Category:{' '}
            {category?.name} | Attributes: {attributes.length} | Loading:{' '}
            {loading.toString()}
          </p>
        </Card>
      )}
    </div>
  );
};
