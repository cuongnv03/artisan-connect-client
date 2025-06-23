import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useProducts } from '../../hooks/products/useProducts';
import { useProductCategories } from '../../hooks/products/useProductCategories';
import { ProductList } from '../../components/products/ProductList';
import { ProductFilters } from '../../components/products/ProductFilters';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Product } from '../../types/product';
import { getRouteHelpers } from '../../constants/routes';

export const ArtisanProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Get filters from URL params
  const filters = {
    search: searchParams.get('search') || '',
    categoryIds: searchParams.getAll('categoryId'),
    status: searchParams.get('status') || '',
    sortBy: searchParams.get('sortBy') || 'updatedAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    inStock: searchParams.get('inStock') === 'true',
  };

  const { products, loading, error, meta, loadMore, hasMore, refetch } =
    useProducts({
      ...filters,
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

  const handleProductEdit = (product: Product) => {
    navigate(getRouteHelpers.editProduct(product.id));
  };

  const handleProductStatusChange = async (
    product: Product,
    newStatus: string,
  ) => {
    // TODO: Implement status change API call
    try {
      // await productService.updateProductStatus(product.id, newStatus);
      refetch();
    } catch (error) {
      console.error('Failed to update product status:', error);
    }
  };

  const handleProductDelete = async (product: Product) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      return;
    }

    try {
      // await productService.deleteProduct(product.id);
      refetch();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  // Calculate stats
  const stats = products.reduce(
    (acc, product) => {
      acc.total++;
      switch (product.status) {
        case 'PUBLISHED':
          acc.published++;
          break;
        case 'DRAFT':
          acc.draft++;
          break;
        case 'OUT_OF_STOCK':
          acc.outOfStock++;
          break;
      }
      if (product.quantity <= 0) acc.lowStock++;
      return acc;
    },
    { total: 0, published: 0, draft: 0, outOfStock: 0, lowStock: 0 },
  );

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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Quản lý sản phẩm
            </h1>
            <p className="text-gray-600 mt-1">
              Quản lý tất cả sản phẩm của bạn
            </p>
          </div>
          <Button
            onClick={() => navigate('/products/create')}
            leftIcon={<PlusIcon className="w-5 h-5" />}
          >
            Thêm sản phẩm mới
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Tổng sản phẩm</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.published}
            </div>
            <div className="text-sm text-gray-600">Đã xuất bản</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.draft}
            </div>
            <div className="text-sm text-gray-600">Bản nháp</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.outOfStock}
            </div>
            <div className="text-sm text-gray-600">Hết hàng</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {stats.lowStock}
            </div>
            <div className="text-sm text-gray-600">Sắp hết hàng</div>
          </Card>
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
              showStatusFilter={true}
              showPriceFilter={false}
              className="sticky top-4"
            />
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden"
                >
                  Bộ lọc
                </Button>

                {/* Quick Status Filters */}
                <div className="hidden md:flex space-x-2">
                  {[
                    { label: 'Tất cả', value: '', count: stats.total },
                    {
                      label: 'Đã xuất bản',
                      value: 'PUBLISHED',
                      count: stats.published,
                    },
                    { label: 'Bản nháp', value: 'DRAFT', count: stats.draft },
                    {
                      label: 'Hết hàng',
                      value: 'OUT_OF_STOCK',
                      count: stats.outOfStock,
                    },
                  ].map((item) => (
                    <button
                      key={item.value}
                      onClick={() =>
                        handleFiltersChange({ ...filters, status: item.value })
                      }
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        filters.status === item.value
                          ? 'bg-primary text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {item.label} ({item.count})
                    </button>
                  ))}
                </div>
              </div>

              {meta && <p className="text-gray-600">{meta.total} sản phẩm</p>}
            </div>

            {/* Products List */}
            <ProductList
              products={products}
              loading={loading}
              error={error}
              meta={meta}
              viewMode="management"
              onLoadMore={hasMore ? loadMore : undefined}
              onProductEdit={handleProductEdit}
              onProductStatusChange={handleProductStatusChange}
              onProductDelete={handleProductDelete}
              emptyTitle="Chưa có sản phẩm nào"
              emptyDescription="Bắt đầu bằng cách tạo sản phẩm đầu tiên của bạn"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
