import React, { useState } from 'react';
import { useAdminProducts } from '../../../hooks/products/useAdminProducts';
import { AdminProductTable } from '../../../components/products/admin/AdminProductTable/AdminProductTable';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Dropdown';
import { Card } from '../../../components/ui/Card';
import { Tabs } from '../../../components/ui/Tabs';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export const AdminProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);

  const {
    products,
    loading,
    error,
    pagination,
    refetch,
    deleteProduct,
    updateProductStatus,
  } = useAdminProducts({
    search: searchQuery || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
    sortBy,
    sortOrder,
    limit: 20,
  });

  // Count products by status for tabs
  const productCounts = {
    ALL: pagination.total,
    PUBLISHED: products.filter((p) => p.status === 'PUBLISHED').length,
    DRAFT: products.filter((p) => p.status === 'DRAFT').length,
    OUT_OF_STOCK: products.filter((p) => p.status === 'OUT_OF_STOCK').length,
    DELETED: products.filter((p) => p.status === 'DELETED').length,
  };

  const statusOptions = [
    { label: 'Tất cả', value: 'ALL' },
    { label: 'Đã xuất bản', value: 'PUBLISHED' },
    { label: 'Bản nháp', value: 'DRAFT' },
    { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
    { label: 'Đã xóa', value: 'DELETED' },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Tên A-Z', value: 'name' },
    { label: 'Giá thấp đến cao', value: 'price' },
    { label: 'Lượt xem nhiều nhất', value: 'viewCount' },
    { label: 'Bán chạy nhất', value: 'salesCount' },
    { label: 'Đánh giá cao nhất', value: 'avgRating' },
  ];

  const tabItems = [
    {
      key: 'ALL',
      label: 'Tất cả',
      content: null,
      badge: productCounts.ALL.toString(),
    },
    {
      key: 'PUBLISHED',
      label: 'Đã xuất bản',
      content: null,
      badge: productCounts.PUBLISHED.toString(),
    },
    {
      key: 'DRAFT',
      label: 'Bản nháp',
      content: null,
      badge: productCounts.DRAFT.toString(),
    },
    {
      key: 'OUT_OF_STOCK',
      label: 'Hết hàng',
      content: null,
      badge: productCounts.OUT_OF_STOCK.toString(),
    },
    {
      key: 'DELETED',
      label: 'Đã xóa',
      content: null,
      badge: productCounts.DELETED.toString(),
    },
  ];

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export products');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600">
            Quản lý tất cả sản phẩm trong hệ thống
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleExport}
            leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
          >
            Xuất dữ liệu
          </Button>
          <Button
            variant="outline"
            leftIcon={<ChartBarIcon className="w-4 h-4" />}
          >
            Thống kê
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {Object.entries(productCounts).map(([status, count]) => {
          const labels = {
            ALL: 'Tổng sản phẩm',
            PUBLISHED: 'Đã xuất bản',
            DRAFT: 'Bản nháp',
            OUT_OF_STOCK: 'Hết hàng',
            DELETED: 'Đã xóa',
          };

          const colors = {
            ALL: 'bg-blue-100 text-blue-600',
            PUBLISHED: 'bg-green-100 text-green-600',
            DRAFT: 'bg-yellow-100 text-yellow-600',
            OUT_OF_STOCK: 'bg-orange-100 text-orange-600',
            DELETED: 'bg-red-100 text-red-600',
          };

          return (
            <Card key={status} className="p-6">
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg ${
                    colors[status as keyof typeof colors]
                  }`}
                >
                  <ChartBarIcon className="w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {labels[status as keyof typeof labels]}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {count.toLocaleString()}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Tìm kiếm sản phẩm, SKU, nghệ nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
              }
            />
          </div>

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FunnelIcon className="w-4 h-4" />}
            >
              Bộ lọc
            </Button>
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

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Trạng thái"
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
              />
              {/* Add more filters as needed */}
            </div>
          </div>
        )}
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
        <AdminProductTable
          products={products}
          loading={loading}
          onDelete={deleteProduct}
          onStatusUpdate={updateProductStatus}
        />
      </Card>

      {/* Error State */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            Thử lại
          </Button>
        </div>
      )}

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="p-4 mt-6 bg-gray-50">
          <p className="text-sm text-gray-600">
            <strong>Debug:</strong> Admin Products | Products Count:{' '}
            {products.length} | Total: {pagination.total} | Filter:{' '}
            {statusFilter}
          </p>
        </Card>
      )}
    </div>
  );
};
