import React from 'react';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Select } from '../../ui/Dropdown';

interface FilterOption {
  label: string;
  value: string;
}

interface ProductFiltersProps {
  filters: Record<string, any>;
  onFilterChange: (filters: Record<string, any>) => void;
  categoryOptions?: FilterOption[];
  priceRanges?: Array<{ label: string; min?: number; max?: number }>;
  className?: string;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFilterChange,
  categoryOptions = [],
  priceRanges = [
    { label: 'Dưới 100K', max: 100000 },
    { label: '100K - 500K', min: 100000, max: 500000 },
    { label: '500K - 1M', min: 500000, max: 1000000 },
    { label: '1M - 5M', min: 1000000, max: 5000000 },
    { label: 'Trên 5M', min: 5000000 },
  ],
  className = '',
}) => {
  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).some((key) => filters[key]);

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Bán chạy nhất', value: 'salesCount' },
    { label: 'Đánh giá cao', value: 'avgRating' },
    { label: 'Giá thấp đến cao', value: 'price_asc' },
    { label: 'Giá cao đến thấp', value: 'price_desc' },
    { label: 'Xem nhiều nhất', value: 'viewCount' },
  ];

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FunnelIcon className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-900">Bộ lọc</h3>
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Xóa bộ lọc
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Category Filter */}
        {categoryOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <Select
              value={filters.categoryId || ''}
              onChange={(value) => handleFilterChange('categoryId', value)}
              options={[
                { label: 'Tất cả danh mục', value: '' },
                ...categoryOptions,
              ]}
              placeholder="Chọn danh mục"
            />
          </div>
        )}

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khoảng giá
          </label>
          <div className="flex flex-wrap gap-2">
            {priceRanges.map((range, index) => (
              <Badge
                key={index}
                variant={
                  filters.minPrice === range.min &&
                  filters.maxPrice === range.max
                    ? 'primary'
                    : 'secondary'
                }
                className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                onClick={() =>
                  handleFilterChange('priceRange', {
                    minPrice: range.min,
                    maxPrice: range.max,
                  })
                }
              >
                {range.label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sắp xếp theo
          </label>
          <Select
            value={filters.sortBy || ''}
            onChange={(value) => handleFilterChange('sortBy', value)}
            options={[{ label: 'Mặc định', value: '' }, ...sortOptions]}
            placeholder="Chọn cách sắp xếp"
          />
        </div>

        {/* Quick Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lọc nhanh
          </label>
          <div className="flex flex-wrap gap-2">
            <Badge
              variant={filters.inStock ? 'primary' : 'secondary'}
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
              onClick={() => handleFilterChange('inStock', !filters.inStock)}
            >
              Còn hàng
            </Badge>
            <Badge
              variant={filters.isCustomizable ? 'primary' : 'secondary'}
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
              onClick={() =>
                handleFilterChange('isCustomizable', !filters.isCustomizable)
              }
            >
              Tùy chỉnh được
            </Badge>
            <Badge
              variant={filters.hasDiscount ? 'primary' : 'secondary'}
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
              onClick={() =>
                handleFilterChange('hasDiscount', !filters.hasDiscount)
              }
            >
              Đang giảm giá
            </Badge>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;

              let displayValue = value;
              if (key === 'categoryId') {
                const option = categoryOptions.find(
                  (opt) => opt.value === value,
                );
                displayValue = option?.label || value;
              }

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-300"
                  onClick={() => handleFilterChange(key, '')}
                >
                  {displayValue}
                  <XMarkIcon className="ml-1 w-3 h-3" />
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
};
