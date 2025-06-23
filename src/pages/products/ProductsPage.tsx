import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../hooks/products/useProducts';
import { useProductStats } from '../../hooks/products/useProductStats';
import { productService } from '../../services/product.service';
import { useToastContext } from '../../contexts/ToastContext';
import { ProductTable } from '../../components/products/artisan/ProductTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Dropdown';
import { Card } from '../../components/ui/Card';
import { Tabs } from '../../components/ui/Tabs';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ChartBarIcon,
  EyeIcon,
  ShoppingCartIcon,
  StarIcon,
} from '@heroicons/react/24/outline';

export const ProductsPage: React.FC = () => {
  const { success, error } = useToastContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const { stats, loading: statsLoading, error: statsError } = useProductStats();

  // Use isMyProducts=true for artisan management
  const {
    products,
    loading,
    error: fetchError,
    pagination,
    refetch,
  } = useProducts({
    isMyProducts: true, // This will call /api/products/my/products
    search: searchQuery || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    sortBy,
    sortOrder,
    limit: 20,
  });

  const handleDelete = async (productId: string) => {
    try {
      await productService.deleteProduct(productId);
      success('Xóa sản phẩm thành công');
      refetch();
    } catch (err: any) {
      error(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleDuplicate = async (productId: string) => {
    try {
      // Navigate to create page with duplicate parameter
      window.location.href = `/products/manage/create?duplicate=${productId}`;
    } catch (err: any) {
      error(err.message || 'Không thể sao chép sản phẩm');
    }
  };

  const statusOptions = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Đã xuất bản', value: 'PUBLISHED' },
    { label: 'Bản nháp', value: 'DRAFT' },
    { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Tên A-Z', value: 'name' },
    { label: 'Giá thấp đến cao', value: 'price' },
    { label: 'Số lượng', value: 'quantity' },
    { label: 'Lượt xem', value: 'viewCount' },
    { label: 'Đã bán', value: 'salesCount' },
  ];

  const tabItems = [
    {
      key: 'ALL',
      label: 'Tất cả',
      content: null,
      badge: stats.totalProducts.toString(),
    },
    {
      key: 'PUBLISHED',
      label: 'Đã xuất bản',
      content: null,
      badge: stats.publishedProducts.toString(),
    },
    {
      key: 'DRAFT',
      label: 'Bản nháp',
      content: null,
      badge: stats.draftProducts.toString(),
    },
    {
      key: 'OUT_OF_STOCK',
      label: 'Hết hàng',
      content: null,
      badge: stats.outOfStockProducts.toString(),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600">Quản lý tất cả sản phẩm của bạn</p>
        </div>
        <Link to="/products/manage/create">
          <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
            Tạo sản phẩm mới
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats.totalProducts}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <EyeIcon className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Lượt xem</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <ShoppingCartIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đã bán</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading ? '...' : stats.totalSales.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <StarIcon className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Đánh giá TB</p>
              <p className="text-2xl font-bold text-gray-900">
                {statsLoading
                  ? '...'
                  : stats.avgRating
                  ? stats.avgRating.toFixed(1)
                  : 'Chưa có'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Error States */}
      {statsError && (
        <Card className="p-4 mb-6 bg-red-50 border-red-200">
          <p className="text-red-600">Lỗi tải thống kê: {statsError}</p>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
              }
            />
          </div>

          <div className="flex space-x-4">
            <Select
              value={sortBy}
              onChange={(value) => setSortBy(value)}
              options={sortOptions}
            />

            <Button
              variant="outline"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Status Tabs */}
      <Tabs
        items={tabItems}
        activeKey={statusFilter}
        onChange={setStatusFilter}
        className="mb-6"
      />

      {/* Products Table */}
      <Card>
        <ProductTable
          products={products}
          loading={loading}
          onDelete={handleDelete}
          onDuplicate={handleDuplicate}
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
    </div>
  );
};
