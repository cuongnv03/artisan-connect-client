import React from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Select } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';

interface FilterOption {
  label: string;
  value: string;
}

interface FilterPanelProps {
  filters: {
    category?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    [key: string]: any;
  };
  onFilterChange: (filters: any) => void;
  categoryOptions?: FilterOption[];
  sortOptions?: FilterOption[];
  className?: string;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  categoryOptions = [],
  sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Phổ biến', value: 'viewCount' },
    { label: 'Đánh giá cao', value: 'rating' },
  ],
  className = '',
}) => {
  const handleFilterChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(filters).some((key) => filters[key]);

  return (
    <div
      className={`bg-white p-4 rounded-lg border border-gray-200 ${className}`}
    >
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {categoryOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <Select
              value={filters.category || ''}
              onChange={(value) => handleFilterChange('category', value)}
              options={[
                { label: 'Tất cả danh mục', value: '' },
                ...categoryOptions,
              ]}
              placeholder="Chọn danh mục"
            />
          </div>
        )}

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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thứ tự
          </label>
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

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (!value) return null;

              let displayValue = value;
              if (key === 'category') {
                const option = categoryOptions.find(
                  (opt) => opt.value === value,
                );
                displayValue = option?.label || value;
              } else if (key === 'sortBy') {
                const option = sortOptions.find((opt) => opt.value === value);
                displayValue = option?.label || value;
              }

              return (
                <Badge
                  key={key}
                  variant="secondary"
                  className="cursor-pointer hover:bg-gray-300"
                  onClick={() => handleFilterChange(key, '')}
                >
                  {displayValue} ×
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
