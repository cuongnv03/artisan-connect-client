import React, { useState } from 'react';
import { useAdminCategories } from '../../../hooks/products/useAdminCategories';
import { useCategoryAttributes } from '../../../hooks/products/useCategoryAttributes';
import { AdminCategoryTable } from '../../../components/products/admin/AdminCategoryTable';
import { CategoryForm } from '../../../components/products/admin/CategoryForm';
import { SimpleAttributeManager } from '../../../components/products/admin/SimpleAttributeManager';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Modal } from '../../../components/ui/Modal';
import { useToastContext } from '../../../contexts/ToastContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../../../types/product';

type ViewMode = 'list' | 'edit' | 'attributes';

export const AdminCategoriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { success, error } = useToastContext();

  const {
    categories,
    categoryTree,
    loading,
    error: fetchError,
    refetch,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useAdminCategories();

  // Category attributes hook
  const {
    attributes,
    loading: attributesLoading,
    createAttribute,
    deleteAttribute,
    refetch: refetchAttributes,
  } = useCategoryAttributes(selectedCategory?.id || '');

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      success('Xóa danh mục thành công');
    } catch (err: any) {
      error(err.message);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setViewMode('edit');
  };

  const handleManageAttributes = (category: Category) => {
    setSelectedCategory(category);
    setViewMode('attributes');
  };

  const handleCreateCategory = async (data: CreateCategoryRequest) => {
    try {
      await createCategory(data);
      success('Tạo danh mục thành công');
      setShowCreateModal(false);
    } catch (err: any) {
      error(err.message);
      throw err;
    }
  };

  const handleUpdateCategory = async (data: UpdateCategoryRequest) => {
    if (!selectedCategory) return;

    try {
      await updateCategory(selectedCategory.id, data);
      success('Cập nhật danh mục thành công');
      setViewMode('list');
      setSelectedCategory(null);
    } catch (err: any) {
      error(err.message);
      throw err;
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Calculate stats
  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    withProducts: categories.filter((c) => c.productCount && c.productCount > 0)
      .length,
    totalProducts: categories.reduce(
      (sum, c) => sum + (c.productCount || 0),
      0,
    ),
  };

  // Render different views
  if (viewMode === 'edit' && selectedCategory) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => {
              setViewMode('list');
              setSelectedCategory(null);
            }}
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Quay lại
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Chỉnh sửa danh mục
          </h1>
          <p className="text-gray-600">
            Cập nhật thông tin danh mục "{selectedCategory.name}"
          </p>
        </div>

        <CategoryForm
          initialData={{
            name: selectedCategory.name,
            description: selectedCategory.description || '',
            imageUrl: selectedCategory.imageUrl || '',
            parentId: selectedCategory.parentId || '',
            sortOrder: selectedCategory.sortOrder,
          }}
          categoryId={selectedCategory.id}
          categories={categories}
          onSubmit={handleUpdateCategory}
          onCancel={() => {
            setViewMode('list');
            setSelectedCategory(null);
          }}
          isEditing={true}
        />
      </div>
    );
  }

  if (viewMode === 'attributes' && selectedCategory) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            onClick={() => {
              setViewMode('list');
              setSelectedCategory(null);
            }}
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Quay lại
          </Button>
        </div>

        <SimpleAttributeManager
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          attributes={attributes}
          onCreateAttribute={createAttribute}
          onDeleteAttribute={deleteAttribute}
        />
      </div>
    );
  }

  // Default list view
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý danh mục</h1>
          <p className="text-gray-600">Tổ chức và quản lý danh mục sản phẩm</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={refetch}
            leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Làm mới
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Tạo danh mục mới
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <FolderIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng danh mục</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg text-green-600">
              <FolderIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Đang hoạt động
              </p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <FolderIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Có sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.withProducts}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
              <FolderIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProducts}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-6 mb-6">
        <div className="max-w-md">
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
          />
        </div>
      </Card>

      {/* Categories Table */}
      <Card>
        <AdminCategoryTable
          categories={filteredCategories}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onManageAttributes={handleManageAttributes}
        />
      </Card>

      {/* Error State */}
      {fetchError && (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{fetchError}</p>
          <Button onClick={refetch} variant="outline">
            Thử lại
          </Button>
        </div>
      )}

      {/* Create Category Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo danh mục mới"
        size="lg"
      >
        <CategoryForm
          categories={categories}
          onSubmit={handleCreateCategory}
          onCancel={() => setShowCreateModal(false)}
          isEditing={false}
        />
      </Modal>
    </div>
  );
};
