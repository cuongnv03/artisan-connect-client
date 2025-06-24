import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  CubeIcon,
  PlusIcon,
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductFilters } from '../../components/products/ProductFilters';
import { CategorySidebar } from '../../components/products/CategorySidebar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { ConfirmModal } from '../../components/ui/Modal';
import { SearchBox } from '../../components/common/SearchBox';
import { useProducts } from '../../hooks/products/useProducts';
import { useCategories } from '../../hooks/products/useCategories';
import { useToastContext } from '../../contexts/ToastContext';
import { productService } from '../../services/product.service';

export const ArtisanProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToastContext();
  const [showFilters, setShowFilters] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [bulkSelected, setBulkSelected] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    publicOnly: false,
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
    try {
      await productService.deleteProduct(productId);
      success('Đã xóa sản phẩm thành công');
      refetch();
      setDeleteProductId(null);
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

  const handleBulkAction = async (action: string) => {
    if (bulkSelected.length === 0) return;

    try {
      if (action === 'delete') {
        await Promise.all(
          bulkSelected.map((id) => productService.deleteProduct(id)),
        );
        success(`Đã xóa ${bulkSelected.length} sản phẩm`);
      } else if (action === 'publish') {
        await Promise.all(
          bulkSelected.map((id) => productService.publishProduct(id)),
        );
        success(`Đã đăng bán ${bulkSelected.length} sản phẩm`);
      } else if (action === 'unpublish') {
        await Promise.all(
          bulkSelected.map((id) => productService.unpublishProduct(id)),
        );
        success(`Đã ẩn ${bulkSelected.length} sản phẩm`);
      }

      setBulkSelected([]);
      refetch();
    } catch (err: any) {
      showError(err.message || 'Không thể thực hiện thao tác');
    }
  };

  const handleSelectAll = () => {
    if (bulkSelected.length === products.length) {
      setBulkSelected([]);
    } else {
      setBulkSelected(products.map((p) => p.id));
    }
  };

  const getProductStats = () => {
    if (!products.length) return null;

    const stats = {
      total: products.length,
      published: products.filter((p) => p.status === 'PUBLISHED').length,
      draft: products.filter((p) => p.status === 'DRAFT').length,
      outOfStock: products.filter((p) => p.quantity === 0).length,
      inStock: products.filter((p) => p.quantity > 0).length,
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
                Quản lý sản phẩm
              </h1>
            </div>
            <p className="text-lg text-gray-600">
              Tạo, chỉnh sửa và theo dõi các sản phẩm của bạn
            </p>
          </div>

          <div className="flex gap-3">
            {/* SỬA: Sử dụng navigate thay vì as={Link} */}
            <Button
              variant="outline"
              onClick={() => navigate('/products/stats')}
              leftIcon={<ChartBarIcon className="w-4 h-4" />}
            >
              Thống kê
            </Button>
            <Button
              onClick={() => navigate('/products/create')}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Thêm sản phẩm
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFilterChange({})}
            >
              <div className="text-2xl font-bold text-blue-600">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Tổng sản phẩm</div>
            </Card>
            <Card
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFilterChange({ status: 'PUBLISHED' })}
            >
              <div className="text-2xl font-bold text-green-600">
                {stats.published}
              </div>
              <div className="text-sm text-gray-600">Đang bán</div>
            </Card>
            <Card
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFilterChange({ status: 'DRAFT' })}
            >
              <div className="text-2xl font-bold text-yellow-600">
                {stats.draft}
              </div>
              <div className="text-sm text-gray-600">Nháp</div>
            </Card>
            <Card
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFilterChange({ inStock: false })}
            >
              <div className="text-2xl font-bold text-red-600">
                {stats.outOfStock}
              </div>
              <div className="text-sm text-gray-600">Hết hàng</div>
            </Card>
            <Card
              className="p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleFilterChange({ inStock: true })}
            >
              <div className="text-2xl font-bold text-purple-600">
                {stats.inStock}
              </div>
              <div className="text-sm text-gray-600">Còn hàng</div>
            </Card>
          </div>
        )}

        {/* Search and Controls */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <SearchBox
            value={filters.search || ''}
            onChange={(value) =>
              handleFilterChange({ ...filters, search: value })
            }
            onSubmit={(value) =>
              handleFilterChange({ ...filters, search: value })
            }
            placeholder="Tìm kiếm sản phẩm theo tên, SKU..."
            className="max-w-lg"
          />

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<FunnelIcon className="w-4 h-4" />}
              >
                Bộ lọc {showFilters ? '▼' : '▶'}
              </Button>

              {/* View Mode Toggle */}
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-sm ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  Lưới
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-700'
                  }`}
                >
                  Danh sách
                </button>
              </div>

              {meta && (
                <span className="text-sm text-gray-600">
                  {products.length} / {meta.total} sản phẩm
                </span>
              )}
            </div>

            {/* Bulk Actions */}
            {bulkSelected.length > 0 && (
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium">
                  Đã chọn {bulkSelected.length} sản phẩm
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('publish')}
                  >
                    Đăng bán
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleBulkAction('unpublish')}
                  >
                    Ẩn
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleBulkAction('delete')}
                  >
                    Xóa
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setBulkSelected([])}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
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
                  showProductCount
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
                description={
                  filters.search ||
                  filters.categoryIds?.length ||
                  filters.status
                    ? 'Không tìm thấy sản phẩm phù hợp với bộ lọc'
                    : 'Hãy tạo sản phẩm đầu tiên của bạn'
                }
                icon={<CubeIcon className="w-12 h-12" />}
                action={{
                  label:
                    filters.search ||
                    filters.categoryIds?.length ||
                    filters.status
                      ? 'Xóa bộ lọc'
                      : 'Thêm sản phẩm',
                  onClick: () =>
                    filters.search ||
                    filters.categoryIds?.length ||
                    filters.status
                      ? handleFilterChange({})
                      : navigate('/products/create'),
                }}
              />
            ) : (
              <div className="space-y-6">
                {/* Select All */}
                {products.length > 0 && (
                  <div className="flex items-center gap-2 pb-4 border-b">
                    <input
                      type="checkbox"
                      checked={bulkSelected.length === products.length}
                      onChange={handleSelectAll}
                      className="rounded text-primary focus:ring-primary"
                    />
                    <label className="text-sm text-gray-600">
                      Chọn tất cả {products.length} sản phẩm
                    </label>
                  </div>
                )}

                {/* Products Grid/List */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <div key={product.id} className="relative">
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 left-2 z-10">
                          <input
                            type="checkbox"
                            checked={bulkSelected.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelected([...bulkSelected, product.id]);
                              } else {
                                setBulkSelected(
                                  bulkSelected.filter(
                                    (id) => id !== product.id,
                                  ),
                                );
                              }
                            }}
                            className="rounded text-primary focus:ring-primary bg-white"
                          />
                        </div>

                        <ProductCard
                          product={product}
                          isManagementView
                          onEdit={() => handleEdit(product.id)}
                          onDelete={() => setDeleteProductId(product.id)}
                          onStatusChange={(status) =>
                            handleStatusChange(product.id, status)
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <Card key={product.id} className="p-4">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={bulkSelected.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelected([...bulkSelected, product.id]);
                              } else {
                                setBulkSelected(
                                  bulkSelected.filter(
                                    (id) => id !== product.id,
                                  ),
                                );
                              }
                            }}
                            className="rounded text-primary focus:ring-primary"
                          />

                          <img
                            src={product.featuredImage || product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />

                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">
                              SKU: {product.sku || 'N/A'}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="font-medium text-primary">
                                {product.price.toLocaleString()}₫
                              </span>
                              <Badge
                                variant={
                                  product.status === 'PUBLISHED'
                                    ? 'success'
                                    : product.status === 'DRAFT'
                                    ? 'secondary'
                                    : 'warning'
                                }
                                size="sm"
                              >
                                {product.status === 'PUBLISHED'
                                  ? 'Đang bán'
                                  : product.status === 'DRAFT'
                                  ? 'Nháp'
                                  : 'Hết hàng'}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                Kho: {product.quantity}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(product.id)}
                              leftIcon={<PencilIcon className="w-4 h-4" />}
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setDeleteProductId(product.id)}
                              leftIcon={<TrashIcon className="w-4 h-4" />}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          isOpen={!!deleteProductId}
          onClose={() => setDeleteProductId(null)}
          onConfirm={() => deleteProductId && handleDelete(deleteProductId)}
          title="Xác nhận xóa sản phẩm"
          message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
          confirmText="Xóa sản phẩm"
          type="danger"
        />
      </div>
    </>
  );
};
