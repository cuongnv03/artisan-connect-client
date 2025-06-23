import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../../hooks/products/useProducts';
import { useProductCategories } from '../../hooks/products/useProductCategories';
import { ProductList } from '../../components/products/ProductList';
import { ProductFilters } from '../../components/products/ProductFilters';
import { SearchBox } from '../../components/common/SearchBox';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import {
  AdjustmentsHorizontalIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  // Get filters from URL params
  const filters = {
    search: searchParams.get('search') || '',
    categoryIds: searchParams.getAll('categoryId'),
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    inStock: searchParams.get('inStock') === 'true',
  };

  const { products, loading, error, meta, loadMore, hasMore } = useProducts({
    ...filters,
    publicOnly: true,
    limit: 20,
  });

  const { categories, loading: categoriesLoading } = useProductCategories();

  const handleFiltersChange = (newFilters: any) => {
    const newParams = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v: string) =>
            newParams.append(key === 'categoryIds' ? 'categoryId' : key, v),
          );
        } else {
          newParams.set(key, String(value));
        }
      }
    });

    setSearchParams(newParams);
  };

  const handleSearch = (searchValue: string) => {
    handleFiltersChange({ ...filters, search: searchValue });
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cửa hàng</h1>

          {/* Search and Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <SearchBox
                value={filters.search}
                onChange={() => {}} // Real-time search disabled for performance
                onSubmit={handleSearch}
                placeholder="Tìm kiếm sản phẩm..."
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* View Type Toggle */}
              <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                <button
                  onClick={() => setViewType('grid')}
                  className={`p-2 ${
                    viewType === 'grid'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewType('list')}
                  className={`p-2 ${
                    viewType === 'list'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  <ListBulletIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
              >
                Bộ lọc
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <ProductFilters
              categories={categories}
              filters={filters}
              onFiltersChange={handleFiltersChange}
              showPriceFilter={true}
              className="sticky top-4"
            />
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Results Info */}
            {meta && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Hiển thị{' '}
                  <span className="font-medium">{products.length}</span> trong
                  số <span className="font-medium">{meta.total}</span> sản phẩm
                </p>

                {/* Quick Sort */}
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-');
                    handleFiltersChange({ ...filters, sortBy, sortOrder });
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="createdAt-desc">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                  <option value="name-asc">Tên: A-Z</option>
                  <option value="viewCount-desc">Phổ biến nhất</option>
                  <option value="avgRating-desc">Đánh giá cao</option>
                </select>
              </div>
            )}

            {/* Products List */}
            <ProductList
              products={products}
              loading={loading}
              error={error}
              meta={meta}
              viewMode="shop"
              onLoadMore={hasMore ? loadMore : undefined}
              emptyTitle="Không tìm thấy sản phẩm"
              emptyDescription="Thử thay đổi bộ lọc hoặc tìm kiếm khác"
              className={viewType === 'list' ? 'list-view' : ''}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
