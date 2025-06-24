import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBagIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductFilters } from '../../components/products/ProductFilters';
import { CategorySidebar } from '../../components/products/CategorySidebar';
import { SearchBox } from '../../components/common/SearchBox';
import { SortSelector, SortOption } from '../../components/common/SortSelector';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { Badge } from '../../components/ui/Badge';
import { useProducts } from '../../hooks/products/useProducts';
import { useCategories } from '../../hooks/products/useCategories';
import { useDebounce } from '../../hooks/common/useDebounce';

const SORT_OPTIONS: SortOption[] = [
  { label: 'Mới nhất', value: 'newest', field: 'createdAt', order: 'desc' },
  { label: 'Cũ nhất', value: 'oldest', field: 'createdAt', order: 'asc' },
  {
    label: 'Giá thấp đến cao',
    value: 'price-asc',
    field: 'price',
    order: 'asc',
  },
  {
    label: 'Giá cao đến thấp',
    value: 'price-desc',
    field: 'price',
    order: 'desc',
  },
  { label: 'Tên A-Z', value: 'name-asc', field: 'name', order: 'asc' },
  { label: 'Tên Z-A', value: 'name-desc', field: 'name', order: 'desc' },
  {
    label: 'Phổ biến nhất',
    value: 'popular',
    field: 'viewCount',
    order: 'desc',
  },
  {
    label: 'Bán chạy nhất',
    value: 'bestseller',
    field: 'salesCount',
    order: 'desc',
  },
  { label: 'Đánh giá cao', value: 'rating', field: 'avgRating', order: 'desc' },
];

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || '',
  );
  const debouncedSearch = useDebounce(searchValue, 500);

  // Get filters from URL
  const filters = {
    search: debouncedSearch || undefined,
    categoryIds: searchParams.getAll('categoryId') || undefined,
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    inStock: searchParams.get('inStock')
      ? searchParams.get('inStock') === 'true'
      : undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
  };

  const { products, loading, error, meta, refetch } = useProducts({
    ...filters,
    publicOnly: true, // Only show published products
  });

  const { categories, loading: categoriesLoading } = useCategories();

  // Update URL when search changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    } else {
      params.delete('search');
    }
    params.set('page', '1'); // Reset to first page on search
    setSearchParams(params);
  }, [debouncedSearch, setSearchParams]);

  const handleFilterChange = (newFilters: any) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((v) =>
            params.append(key === 'categoryIds' ? 'categoryId' : key, v),
          );
        } else {
          params.set(key, String(value));
        }
      }
    });

    // Reset to page 1 when filters change
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleCategorySelect = (categoryId: string) => {
    const newFilters = { ...filters };
    if (categoryId) {
      newFilters.categoryIds = [categoryId];
    } else {
      delete newFilters.categoryIds;
    }
    handleFilterChange(newFilters);
  };

  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    handleFilterChange(newFilters);
  };

  const handleSortChange = (value: string, option: SortOption) => {
    handleFilterChange({
      ...filters,
      sortBy: option.field,
      sortOrder: option.order,
    });
  };

  const handleSearchSubmit = (query: string) => {
    setSearchValue(query);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchValue('');
  };

  const selectedCategoryId = filters.categoryIds?.[0];
  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof typeof filters];
    if (
      key === 'page' ||
      key === 'limit' ||
      key === 'sortBy' ||
      key === 'sortOrder'
    ) {
      return false;
    }
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== '';
  });

  const currentSortValue =
    SORT_OPTIONS.find(
      (opt) => opt.field === filters.sortBy && opt.order === filters.sortOrder,
    )?.value || 'newest';

  return (
    <>
      <Helmet>
        <title>Cửa hàng - Artisan Connect</title>
        <meta
          name="description"
          content="Khám phá các sản phẩm thủ công độc đáo từ các nghệ nhân tài năng"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBagIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">Cửa hàng</h1>
            </div>
            <p className="text-lg text-gray-600">
              Khám phá các sản phẩm thủ công độc đáo từ các nghệ nhân tài năng
            </p>
          </div>

          {/* Search & Quick Filters */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* Search Bar */}
              <div className="mb-6">
                <SearchBox
                  value={searchValue}
                  onChange={setSearchValue}
                  onSubmit={handleSearchSubmit}
                  placeholder="Tìm kiếm sản phẩm theo tên, mô tả, thẻ..."
                  className="max-w-2xl mx-auto"
                />
              </div>

              {/* Quick Filters & Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    leftIcon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
                    className="lg:hidden"
                  >
                    Bộ lọc
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMobileFilters(true)}
                    leftIcon={<FunnelIcon className="w-4 h-4" />}
                    className="lg:hidden"
                  >
                    Lọc nâng cao
                  </Button>

                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      leftIcon={<XMarkIcon className="w-4 h-4" />}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}

                  {meta && (
                    <span className="text-sm text-gray-600">
                      {products.length} / {meta.total} sản phẩm
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  {/* Sort Selector */}
                  <SortSelector
                    value={currentSortValue}
                    onChange={handleSortChange}
                    options={SORT_OPTIONS}
                    className="min-w-[180px]"
                  />

                  {/* View Mode Toggle */}
                  <div className="flex border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-2 text-sm transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Squares2X2Icon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-2 text-sm transition-colors ${
                        viewMode === 'list'
                          ? 'bg-primary text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ViewColumnsIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex flex-wrap gap-2">
                    {filters.search && (
                      <Badge
                        variant="primary"
                        className="cursor-pointer"
                        onClick={() => {
                          setSearchValue('');
                          handleFilterChange({ ...filters, search: undefined });
                        }}
                      >
                        Tìm kiếm: {filters.search} ×
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
                          onClick={() => handleCategorySelect('')}
                        >
                          {category.name} ×
                        </Badge>
                      ) : null;
                    })}
                    {filters.inStock !== undefined && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          handleFilterChange({
                            ...filters,
                            inStock: undefined,
                          });
                        }}
                      >
                        {filters.inStock ? 'Còn hàng' : 'Hết hàng'} ×
                      </Badge>
                    )}
                    {(filters.minPrice || filters.maxPrice) && (
                      <Badge
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => {
                          handleFilterChange({
                            ...filters,
                            minPrice: undefined,
                            maxPrice: undefined,
                          });
                        }}
                      >
                        Giá:{' '}
                        {filters.minPrice
                          ? `${filters.minPrice.toLocaleString()}₫`
                          : '0₫'}{' '}
                        -{' '}
                        {filters.maxPrice
                          ? `${filters.maxPrice.toLocaleString()}₫`
                          : '∞'}{' '}
                        ×
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="space-y-6 sticky top-4">
                {/* Categories */}
                {!categoriesLoading && (
                  <CategorySidebar
                    categories={categories}
                    selectedCategoryId={selectedCategoryId}
                    onCategorySelect={handleCategorySelect}
                    showProductCount
                  />
                )}

                {/* Advanced Filters */}
                <ProductFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                />
              </div>
            </div>

            {/* Mobile Filters Modal */}
            {showMobileFilters && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div
                  className="fixed inset-0 bg-black bg-opacity-50"
                  onClick={() => setShowMobileFilters(false)}
                />
                <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Bộ lọc</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMobileFilters(false)}
                      >
                        <XMarkIcon className="w-5 h-5" />
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <CategorySidebar
                        categories={categories}
                        selectedCategoryId={selectedCategoryId}
                        onCategorySelect={(id) => {
                          handleCategorySelect(id);
                          setShowMobileFilters(false);
                        }}
                        showProductCount
                      />

                      <ProductFilters
                        filters={filters}
                        onFilterChange={(newFilters) => {
                          handleFilterChange(newFilters);
                          setShowMobileFilters(false);
                        }}
                        categories={categories}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="lg:col-span-3">
              {loading && products.length === 0 ? (
                <div className="text-center py-12">
                  <LoadingSpinner size="lg" />
                  <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={refetch}>Thử lại</Button>
                </div>
              ) : products.length === 0 ? (
                <EmptyState
                  title={
                    hasActiveFilters
                      ? 'Không tìm thấy sản phẩm'
                      : 'Chưa có sản phẩm'
                  }
                  description={
                    hasActiveFilters
                      ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                      : 'Hãy quay lại sau để khám phá các sản phẩm mới'
                  }
                  icon={<ShoppingBagIcon className="w-12 h-12" />}
                  action={
                    hasActiveFilters
                      ? {
                          label: 'Xóa bộ lọc',
                          onClick: clearFilters,
                        }
                      : undefined
                  }
                />
              ) : (
                <div className="space-y-6">
                  {/* Products Grid/List */}
                  <div
                    className={`grid gap-6 ${
                      viewMode === 'grid'
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-1'
                    }`}
                  >
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        size={viewMode === 'list' ? 'lg' : 'md'}
                        showFullInfo={viewMode === 'list'}
                        className={viewMode === 'list' ? 'lg:flex-row' : ''}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {meta && meta.totalPages > 1 && (
                    <div className="flex justify-center mt-12">
                      <Pagination
                        currentPage={meta.page}
                        totalPages={meta.totalPages}
                        totalItems={meta.total}
                        itemsPerPage={meta.limit}
                        onPageChange={handlePageChange}
                      />
                    </div>
                  )}

                  {/* Load More for mobile */}
                  {meta && meta.page < meta.totalPages && (
                    <div className="text-center lg:hidden">
                      <Button
                        variant="outline"
                        onClick={() => handlePageChange(meta.page + 1)}
                        loading={loading}
                      >
                        Xem thêm sản phẩm
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
