import React from 'react';
import { Category } from '../../types/product';
import { Select } from '../ui/Dropdown';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface ProductFiltersProps {
  categories: Category[];
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
  onFiltersChange: (filters: any) => void;
  showStatusFilter?: boolean;
  showPriceFilter?: boolean;
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  filters,
  onFiltersChange,
  showStatusFilter = false,
  showPriceFilter = true,
  className = '',
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleCategoryChange = (categoryId: string) => {
    const currentCategories = filters.categoryIds || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];

    handleFilterChange('categoryIds', newCategories);
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      filters[key] !== undefined &&
      filters[key] !== '' &&
      (Array.isArray(filters[key]) ? filters[key].length > 0 : true),
  );

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AdjustmentsHorizontalIcon className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-900">Bộ lọc</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {/* Search */}
        <div>
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Danh mục
          </label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.categoryIds?.includes(category.id) || false}
                  onChange={() => handleCategoryChange(category.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {category.name}
                  {category.productCount !== undefined && (
                    <span className="text-gray-500 ml-1">
                      ({category.productCount})
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Status Filter for management view */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <Select
              value={filters.status || ''}
              onChange={(value) => handleFilterChange('status', value)}
              options={[
                { label: 'Tất cả', value: '' },
                { label: 'Đã xuất bản', value: 'PUBLISHED' },
                { label: 'Bản nháp', value: 'DRAFT' },
                { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
              ]}
            />
          </div>
        )}

        {/* Price Range */}
        {showPriceFilter && (
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
        )}

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp theo
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={filters.sortBy || 'createdAt'}
              onChange={(value) => handleFilterChange('sortBy', value)}
              options={[
                { label: 'Mới nhất', value: 'createdAt' },
                { label: 'Giá', value: 'price' },
                { label: 'Tên', value: 'name' },
                { label: 'Lượt xem', value: 'viewCount' },
                { label: 'Đánh giá', value: 'avgRating' },
              ]}
            />
            <Select
              value={filters.sortOrder || 'desc'}
              onChange={(value) => handleFilterChange('sortOrder', value)}
              options={[
                { label: 'Giảm dần', value: 'desc' },
                { label: 'Tăng dần', value: 'asc' },
              ]}
            />
          </div>
        </div>

        {/* Stock Status */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.inStock || false}
              onChange={(e) => handleFilterChange('inStock', e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="ml-2 text-sm text-gray-700">
              Chỉ hiển thị sản phẩm còn hàng
            </span>
          </label>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-gray-300"
                onClick={() => handleFilterChange('search', '')}
              >
                "{filters.search}" ×
              </Badge>
            )}
            {filters.categoryIds?.map((categoryId) => {
              const category = categories.find((c) => c.id === categoryId);
              return category ? (
                <Badge
                  key={categoryId}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-300"
                  onClick={() => handleCategoryChange(categoryId)}
                >
                  {category.name} ×
                </Badge>
              ) : null;
            })}
            {filters.status && (
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-gray-300"
                onClick={() => handleFilterChange('status', '')}
              >
                {filters.status} ×
              </Badge>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
