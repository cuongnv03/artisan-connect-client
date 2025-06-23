import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CubeIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductFilters } from '../../components/products/ProductFilters';
import { CategorySidebar } from '../../components/products/CategorySidebar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/common/EmptyState';
import { useProducts } from '../../hooks/products/useProducts';
import { useCategories } from '../../hooks/products/useCategories';
import { useToastContext } from '../../contexts/ToastContext';
import { productService } from '../../services/product.service';

export const ArtisanProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToastContext();
  const [showFilters, setShowFilters] = useState(false);

  // Get filters from URL
  const filters = {
    search: searchParams.get('search') || undefined,
    categoryIds: searchParams.getAll('categoryId') || undefined,
    status: searchParams.get('status') || undefined,
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
    publicOnly: false, // Show all products including drafts
  });

  const { categories, loading: categoriesLoading } = useCategories();

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

  const handleEdit = (productId: string) => {
    navigate(`/products/${productId}/edit`);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
      await productService.deleteProduct(productId);
      success('Đã xóa sản phẩm thành công');
      refetch();
    } catch (err: any) {
      showError(err.message || 'Không thể xóa sản phẩm');
    }
  };

  const handleStatusChange = async (productId: string, status: string) => {
    try {
      if (status === 'PUBLISHED') {
        await productService.publishProduct(productId);
        success('Đã đăng bán sản phẩm');
      } else {
        await productService.unpublishProduct(productId);
        success('Đã ẩn sản phẩm');
      }
      refetch();
    } catch (err: any) {
      showError(err.message || 'Không thể thay đổi trạng thái sản phẩm');
    }
  };

  const getProductStats = () => {
    if (!products.length) return null;

    const stats = {
      total: products.length,
      published: products.filter((p) => p.status === 'PUBLISHED').length,
      draft: products.filter((p) => p.status === 'DRAFT').length,
      outOfStock: products.filter((p) => p.quantity === 0).length,
    };

    return stats;
  };

  const selectedCategoryId = filters.categoryIds?.[0];
  const stats = getProductStats();

  return (
    <>
      <Helmet>
        <title>Quản lý sản phẩm - Artisan Connect</title>
        <meta name="description" content="Quản lý sản phẩm của nghệ nhân" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CubeIcon className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-gray-900">
                Sản phẩm của tôi
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Quản lý và theo dõi các sản phẩm của bạn
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              as={Link}
              to="/products/stats"
              variant="outline"
              leftIcon={<ChartBarIcon className="w-4 h-4" />}
            >
              Thống kê
            </Button>
            <Button
              as={Link}
              to="/products/create"
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Tổng sản phẩm</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {stats.published}
              </div>
              <div className="text-sm text-gray-600">Đang bán</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.draft}
              </div>
              <div className="text-sm text-gray-600">Nháp</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {stats.outOfStock}
              </div>
              <div className="text-sm text-gray-600">Hết hàng</div>
            </Card>
          </div>
        )}

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
                  isManagementView
                />
              )}

              {/* Filters */}
              {showFilters && (
                <ProductFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  categories={categories}
                  showStatusFilter
                  isManagementView
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
                title="Chưa có sản phẩm nào"
                description="Hãy tạo sản phẩm đầu tiên của bạn"
                icon={<CubeIcon className="w-12 h-12" />}
                action={{
                  label: 'Thêm sản phẩm',
                  onClick: () => navigate('/products/create'),
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isManagementView
                    onEdit={() => handleEdit(product.id)}
                    onDelete={() => handleDelete(product.id)}
                    onStatusChange={(status) =>
                      handleStatusChange(product.id, status)
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
