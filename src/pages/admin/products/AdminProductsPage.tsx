import React, { useState } from 'react';
import { useAdminProducts } from '../../../hooks/products/useAdminProducts';
import { AdminProductTable } from '../../../components/products/admin/AdminProductTable';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Dropdown';
import { Card } from '../../../components/ui/Card';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export const AdminProductsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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
    status: statusFilter || undefined,
    sortBy,
    sortOrder,
    limit: 20,
  });

  const statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Đã xuất bản', value: 'PUBLISHED' },
    { label: 'Bản nháp', value: 'DRAFT' },
    { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
    { label: 'Đã xóa', value: 'DELETED' },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Tên A-Z', value: 'name' },
    { label: 'Giá thấp đến cao', value: 'price' },
    { label: 'Lượt xem', value: 'viewCount' },
    { label: 'Bán chạy', value: 'salesCount' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600">
            Quản lý tất cả sản phẩm trong hệ thống ({pagination.total} sản phẩm)
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={refetch}
            leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <ChartBarIcon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
              <p className="text-2xl font-bold text-gray-900">
                {pagination.total}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Tìm kiếm sản phẩm, SKU, nghệ nhân..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
              }
            />
          </div>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={statusOptions}
            placeholder="Trạng thái"
          />
          <Select
            value={sortBy}
            onChange={setSortBy}
            options={sortOptions}
            placeholder="Sắp xếp"
          />
        </div>
      </Card>

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
    </div>
  );
};
