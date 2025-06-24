import React from 'react';
import {
  FunnelIcon,
  XMarkIcon,
  CurrencyDollarIcon,
  TagIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Select } from '../ui/Dropdown';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Toggle } from '../ui/Toggle';
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
    hasVariants?: boolean;
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

  const statusOptions = [
    { label: 'Tất cả', value: '' },
    { label: 'Đang bán', value: 'PUBLISHED' },
    { label: 'Nháp', value: 'DRAFT' },
    { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
  ];

  return (
    <Card className={`p-6 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Bộ lọc nâng cao</h3>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <XMarkIcon className="w-4 h-4 mr-1" />
              Xóa tất cả
            </Button>
          )}
        </div>

        {/* Price Range */}
        <div>
          <div className="flex items-center mb-3">
            <CurrencyDollarIcon className="w-4 h-4 text-gray-500 mr-2" />
            <label className="text-sm font-medium text-gray-700">
              Khoảng giá
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              type="number"
              placeholder="Từ (₫)"
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
              placeholder="Đến (₫)"
              value={filters.maxPrice || ''}
              onChange={(e) =>
                handleFilterChange(
                  'maxPrice',
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            />
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {[
              { label: 'Dưới 100K', min: 0, max: 100000 },
              { label: '100K - 500K', min: 100000, max: 500000 },
              { label: '500K - 1M', min: 500000, max: 1000000 },
              { label: 'Trên 1M', min: 1000000, max: undefined },
            ].map((range) => (
              <button
                key={range.label}
                type="button"
                onClick={() => {
                  handleFilterChange('minPrice', range.min);
                  handleFilterChange('maxPrice', range.max);
                }}
                className="px-3 py-1 text-xs border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stock Status */}
        <div>
          <div className="flex items-center mb-3">
            <TruckIcon className="w-4 h-4 text-gray-500 mr-2" />
            <label className="text-sm font-medium text-gray-700">
              Tình trạng kho
            </label>
          </div>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="stock"
                checked={filters.inStock === undefined}
                onChange={() => handleFilterChange('inStock', undefined)}
                className="mr-2 text-primary focus:ring-primary"
              />
              <span className="text-sm">Tất cả</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="stock"
                checked={filters.inStock === true}
                onChange={() => handleFilterChange('inStock', true)}
                className="mr-2 text-primary focus:ring-primary"
              />
              <span className="text-sm">Còn hàng</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="stock"
                checked={filters.inStock === false}
                onChange={() => handleFilterChange('inStock', false)}
                className="mr-2 text-primary focus:ring-primary"
              />
              <span className="text-sm">Hết hàng</span>
            </label>
          </div>
        </div>

        {/* Product Status (for management view) */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái sản phẩm
            </label>
            <Select
              value={filters.status || ''}
              onChange={(value) => handleFilterChange('status', value)}
              options={statusOptions}
            />
          </div>
        )}

        {/* Categories (if not using sidebar) */}
        {categories.length > 0 && !isManagementView && (
          <div>
            <div className="flex items-center mb-3">
              <TagIcon className="w-4 h-4 text-gray-500 mr-2" />
              <label className="text-sm font-medium text-gray-700">
                Danh mục sản phẩm
              </label>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {categories.map((category) => (
                <label key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(filters.categoryIds || []).includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="mr-2 text-primary focus:ring-primary rounded"
                  />
                  <span className="text-sm">{category.name}</span>
                  {category.productCount !== undefined && (
                    <span className="ml-auto text-xs text-gray-500">
                      ({category.productCount})
                    </span>
                  )}
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Product Features */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tính năng sản phẩm
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Có nhiều phiên bản</span>
              <Toggle
                checked={filters.hasVariants || false}
                onChange={(checked) =>
                  handleFilterChange('hasVariants', checked || undefined)
                }
              />
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bộ lọc đang áp dụng
            </label>
            <div className="flex flex-wrap gap-2">
              {filters.categoryIds?.map((categoryId) => {
                const category = categories.find(
                  (cat) => cat.id === categoryId,
                );
                return category ? (
                  <Badge
                    key={categoryId}
                    variant="primary"
                    size="sm"
                    className="cursor-pointer"
                    onClick={() => handleCategoryToggle(categoryId)}
                  >
                    {category.name} ×
                  </Badge>
                ) : null;
              })}
              {filters.status && (
                <Badge
                  variant="secondary"
                  size="sm"
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
              {filters.inStock !== undefined && (
                <Badge
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => handleFilterChange('inStock', undefined)}
                >
                  {filters.inStock ? 'Còn hàng' : 'Hết hàng'} ×
                </Badge>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <Badge
                  variant="secondary"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => {
                    handleFilterChange('minPrice', undefined);
                    handleFilterChange('maxPrice', undefined);
                  }}
                >
                  Giá: {filters.minPrice?.toLocaleString() || '0'}₫ -{' '}
                  {filters.maxPrice?.toLocaleString() || '∞'} ×
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
