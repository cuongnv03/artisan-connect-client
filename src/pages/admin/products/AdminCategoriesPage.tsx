import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAdminCategories } from '../../../hooks/products/useAdminCategories';
import { AdminCategoryTable } from '../../../components/products/admin/AdminCategoryTable';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';
import { Toggle } from '../../../components/ui/Toggle';
import { useToastContext } from '../../../contexts/ToastContext';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const AdminCategoriesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showHierarchy, setShowHierarchy] = useState(true);
  const { success, error } = useToastContext();

  const {
    categories,
    categoryTree,
    loading,
    error: fetchError,
    refetch,
    deleteCategory,
  } = useAdminCategories();

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategory(categoryId);
      success('Xóa danh mục thành công');
    } catch (err: any) {
      error(err.message);
    }
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredCategoryTree = categoryTree.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const displayCategories = showHierarchy
    ? filteredCategoryTree
    : filteredCategories;

  // Calculate stats
  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
    withProducts: categories.filter((c) => c.productCount && c.productCount > 0)
      .length,
    totalProducts: categories.reduce(
      (sum, c) => sum + (c.productCount || 0),
      0,
    ),
  };

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
          <Link to="/admin/categories/create">
            <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
              Tạo danh mục mới
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
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
            <div className="p-2 bg-yellow-100 rounded-lg text-yellow-600">
              <FolderIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tạm dừng</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.inactive}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
              <Squares2X2Icon className="w-6 h-6" />
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
              <ListBulletIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProducts.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Controls */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
              }
            />
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <ListBulletIcon className="w-4 h-4 text-gray-500" />
              <Toggle checked={showHierarchy} onChange={setShowHierarchy} />
              <Squares2X2Icon className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {showHierarchy ? 'Dạng cây' : 'Dạng danh sách'}
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Categories Table */}
      <Card>
        <AdminCategoryTable
          categories={displayCategories}
          loading={loading}
          onDelete={handleDelete}
          showHierarchy={showHierarchy}
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

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 mt-6 bg-gray-50">
          <p className="text-sm text-gray-600">
            <strong>Debug:</strong> Admin Categories | Total:{' '}
            {categories.length} | Display: {displayCategories.length} | Mode:{' '}
            {showHierarchy ? 'Tree' : 'List'} | Search: "{searchQuery}"
          </p>
        </Card>
      )}
    </div>
  );
};
