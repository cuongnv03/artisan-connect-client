import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBagIcon,
  AdjustmentsHorizontalIcon,
  ViewColumnsIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductFilters } from '../../components/products/ProductFilters';
import { CategorySidebar } from '../../components/products/CategorySidebar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/common/EmptyState';
import { useProducts } from '../../hooks/products/useProducts';
import { useCategories } from '../../hooks/products/useCategories';
import { useInfiniteScroll } from '../../hooks/common/useInfiniteScroll';

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Get filters from URL
  const filters = {
    search: searchParams.get('search') || undefined,
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

  const { products, loading, error, meta, refetch, loadMore, hasMore } =
    useProducts({
      ...filters,
      publicOnly: true, // Only show published products
    });

  const { categories, loading: categoriesLoading } = useCategories();

  const [targetRef] = useInfiniteScroll({
    loading,
    hasMore,
    onLoadMore: loadMore,
  });

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

  const selectedCategoryId = filters.categoryIds?.[0];

  return (
    <>
      <Helmet>
        <title>Cửa hàng - Artisan Connect</title>
        <meta
          name="description"
          content="Khám phá các sản phẩm thủ công độc đáo từ các nghệ nhân tài năng"
        />
      </Helmet>

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

        {/* Controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
            >
              Bộ lọc
            </Button>

            {meta && (
              <span className="text-sm text-gray-600">
                Hiển thị {products.length} / {meta.total} sản phẩm
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <ViewColumnsIcon className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Categories */}
              {!categoriesLoading && (
                <CategorySidebar
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onCategorySelect={handleCategorySelect}
                  showProductCount
                />
              )}

              {/* Filters */}
              {showFilters && (
                <ProductFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                />
              )}
            </div>
          </div>

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
                title="Không tìm thấy sản phẩm"
                description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                icon={<ShoppingBagIcon className="w-12 h-12" />}
              />
            ) : (
              <div className="space-y-6">
                {/* Products Grid */}
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
                      className={viewMode === 'list' ? 'flex' : ''}
                    />
                  ))}
                </div>

                {/* Load More */}
                {hasMore && (
                  <div ref={targetRef} className="text-center py-8">
                    {loading ? (
                      <LoadingSpinner size="md" />
                    ) : (
                      <Button onClick={loadMore} variant="outline">
                        Xem thêm sản phẩm
                      </Button>
                    )}
                  </div>
                )}

                {/* Pagination */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex justify-center">
                    <Pagination
                      currentPage={meta.page}
                      totalPages={meta.totalPages}
                      totalItems={meta.total}
                      itemsPerPage={meta.limit}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
