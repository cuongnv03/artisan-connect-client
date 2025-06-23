import React from 'react';
import {
  AdjustmentsHorizontalIcon,
  FunnelIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Select } from '../ui/Dropdown';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Category } from '../../types/product';

interface ProductFiltersProps {
  filters: {
    search?: string;
    categoryIds?: string[];
    status?: string;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    minPrice?: number;
    maxPrice?: number;
  };
  onFilterChange: (filters: any) => void;
  categories?: Category[];
  showStatusFilter?: boolean;
  isManagementView?: boolean;
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  categories = [],
  showStatusFilter = false,
  isManagementView = false,
  className = '',
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = filters.categoryIds || [];
    let newCategories;

    if (currentCategories.includes(categoryId)) {
      newCategories = currentCategories.filter((id) => id !== categoryId);
    } else {
      newCategories = [...currentCategories, categoryId];
    }

    handleFilterChange('categoryIds', newCategories);
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof typeof filters];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  });

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt', order: 'desc' },
    { label: 'Cũ nhất', value: 'createdAt', order: 'asc' },
    { label: 'Giá thấp đến cao', value: 'price', order: 'asc' },
    { label: 'Giá cao đến thấp', value: 'price', order: 'desc' },
    { label: 'Tên A-Z', value: 'name', order: 'asc' },
    { label: 'Tên Z-A', value: 'name', order: 'desc' },
    { label: 'Phổ biến nhất', value: 'viewCount', order: 'desc' },
    { label: 'Đánh giá cao', value: 'avgRating', order: 'desc' },
  ];

  const statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang bán', value: 'PUBLISHED' },
    { label: 'Nháp', value: 'DRAFT' },
    { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
  ];

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <h3 className="font-medium text-gray-900">Bộ lọc</h3>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XMarkIcon className="w-4 h-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Search */}
        <div>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp
          </label>
          <Select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(value) => {
              const [sortBy, sortOrder] = value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder);
            }}
            options={sortOptions.map((opt) => ({
              label: opt.label,
              value: `${opt.value}-${opt.order}`,
            }))}
          />
        </div>

        {/* Status Filter (for management view) */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <Select
              value={filters.status || ''}
              onChange={(value) => handleFilterChange('status', value)}
              options={statusOptions}
            />
          </div>
        )}

        {/* Stock Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tình trạng kho
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="stock"
                checked={filters.inStock === undefined}
                onChange={() => handleFilterChange('inStock', undefined)}
                className="mr-2"
              />
              <span className="text-sm">Tất cả</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="stock"
                checked={filters.inStock === true}
                onChange={() => handleFilterChange('inStock', true)}
                className="mr-2"
              />
              <span className="text-sm">Còn hàng</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="stock"
                checked={filters.inStock === false}
                onChange={() => handleFilterChange('inStock', false)}
                className="mr-2"
              />
              <span className="text-sm">Hết hàng</span>
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khoảng giá
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Từ"
              value={filters.minPrice || ''}
              onChange={(e) =>
                handleFilterChange(
                  'minPrice',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
            <Input
              type="number"
              placeholder="Đến"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                handleFilterChange(
                  'maxPrice',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.categoryIds || []).includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="mr-2"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bộ lọc đang áp dụng
            </label>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange('search', '')}
                >
                  Tìm kiếm: {filters.search} ×
                </Badge>
              )}
              {filters.status && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange('status', '')}
                >
                  Trạng thái:{' '}
                  {
                    statusOptions.find((opt) => opt.value === filters.status)
                      ?.label
                  }{' '}
                  ×
                </Badge>
              )}
              {filters.categoryIds?.map((categoryId) => {
                const category = categories.find(
                  (cat) => cat.id === categoryId,
                );
                return category ? (
                  <Badge
                    key={categoryId}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleCategoryToggle(categoryId)}
                  >
                    {category.name} ×
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
