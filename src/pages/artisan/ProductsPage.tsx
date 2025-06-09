import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChartBarIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { Product, ProductStatus, ProductStats } from '../../types/product';
import { PaginatedResponse } from '../../types/common';
import { productService } from '../../services/product.service';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { Select } from '../../components/ui/Dropdown';
import { ConfirmModal } from '../../components/ui/Modal';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { useToastContext } from '../../contexts/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { ROUTE_PATHS, getArtisanRoutes } from '../../constants/routes';

type ViewMode = 'grid' | 'list' | 'table';

interface ProductFilters {
  status?: ProductStatus;
  search?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 12,
  });
  const [filters, setFilters] = useState<ProductFilters>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const { success, error } = useToastContext();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchQuery, 500);

  useEffect(() => {
    loadProducts();
    loadStats();
  }, [currentPage, filters, debouncedSearch]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        status: filters.status,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const response = await productService.getMyProducts(params);
      setProducts(response.data);
      setPagination({
        total: response.meta.total,
        totalPages: response.meta.totalPages,
        limit: response.meta.limit,
      });
    } catch (err) {
      console.error('Error loading products:', err);
      error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await productService.getMyProductStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      await productService.deleteProduct(productToDelete.id);
      success('Đã xóa sản phẩm thành công');
      setShowDeleteModal(false);
      setProductToDelete(null);
      await loadProducts();
      await loadStats();
    } catch (err) {
      error('Không thể xóa sản phẩm');
    }
  };

  const handleStatusChange = async (
    productId: string,
    newStatus: 'publish' | 'unpublish',
  ) => {
    try {
      if (newStatus === 'publish') {
        await productService.publishProduct(productId);
        success('Đã xuất bản sản phẩm');
      } else {
        await productService.unpublishProduct(productId);
        success('Đã gỡ xuất bản sản phẩm');
      }
      await loadProducts();
      await loadStats();
    } catch (err) {
      error('Không thể thay đổi trạng thái sản phẩm');
    }
  };

  const getStatusBadge = (status: ProductStatus) => {
    const statusConfig = {
      [ProductStatus.PUBLISHED]: {
        variant: 'success' as const,
        label: 'Đã xuất bản',
      },
      [ProductStatus.DRAFT]: {
        variant: 'secondary' as const,
        label: 'Bản nháp',
      },
      [ProductStatus.OUT_OF_STOCK]: {
        variant: 'warning' as const,
        label: 'Hết hàng',
      },
      [ProductStatus.DELETED]: { variant: 'danger' as const, label: 'Đã xóa' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Đã xuất bản', value: ProductStatus.PUBLISHED },
    { label: 'Bản nháp', value: ProductStatus.DRAFT },
    { label: 'Hết hàng', value: ProductStatus.OUT_OF_STOCK },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Tên A-Z', value: 'name' },
    { label: 'Giá thấp đến cao', value: 'price' },
    { label: 'Lượt xem nhiều nhất', value: 'viewCount' },
    { label: 'Bán chạy nhất', value: 'salesCount' },
  ];

  const renderTableView = () => (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kho
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thống kê
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-16 w-16 rounded-lg object-cover"
                      src={product.images[0] || '/placeholder-image.jpg'}
                      alt={product.name}
                    />
                    <div className="ml-4">
                      <Link
                        to={`/products/${product.slug || product.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary"
                      >
                        {product.name}
                      </Link>
                      <p className="text-sm text-gray-500 line-clamp-1">
                        {product.description}
                      </p>
                      {product.hasVariants && (
                        <Badge variant="info" size="sm" className="mt-1">
                          {product.variants?.length || 0} biến thể
                        </Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {formatPrice(product.discountPrice || product.price)}
                    </div>
                    {product.discountPrice && (
                      <div className="text-gray-500 line-through">
                        {formatPrice(product.price)}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {product.quantity}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(product.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div>{product.viewCount} lượt xem</div>
                  <div>{product.salesCount} đã bán</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Link to={`/products/${product.slug || product.id}`}>
                      <Button variant="ghost" size="sm" title="Xem sản phẩm">
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Link to={getArtisanRoutes.editProduct(product.id)}>
                      <Button variant="ghost" size="sm" title="Chỉnh sửa">
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    </Link>

                    {/* Status toggle buttons */}
                    {product.status === ProductStatus.DRAFT ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(product.id, 'publish')
                        }
                        title="Xuất bản"
                        className="text-green-600 hover:text-green-700"
                      >
                        Xuất bản
                      </Button>
                    ) : product.status === ProductStatus.PUBLISHED ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleStatusChange(product.id, 'unpublish')
                        }
                        title="Gỡ xuất bản"
                        className="text-yellow-600 hover:text-yellow-700"
                      >
                        Gỡ xuất bản
                      </Button>
                    ) : null}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setProductToDelete(product);
                        setShowDeleteModal(true);
                      }}
                      title="Xóa"
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý sản phẩm</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả sản phẩm của bạn</p>
        </div>
        <Link to={ROUTE_PATHS.APP.ARTISAN.CREATE_PRODUCT}>
          <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
            Thêm sản phẩm mới
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProducts}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Đã xuất bản</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.publishedProducts}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bản nháp</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.draftProducts}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng lượt xem</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters & Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Select
              value={filters.status || ''}
              onChange={(value) =>
                setFilters({
                  ...filters,
                  status: (value as ProductStatus) || undefined,
                })
              }
              options={statusOptions}
            />

            <Select
              value={filters.sortBy}
              onChange={(value) => setFilters({ ...filters, sortBy: value })}
              options={sortOptions}
            />

            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ListBulletIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 ${
                  viewMode === 'table'
                    ? 'bg-primary text-white'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <ChartBarIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Products Display */}
      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          {viewMode === 'table' ? (
            renderTableView()
          ) : viewMode === 'list' ? (
            <div className="space-y-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  variant="list"
                  showSellerInfo={false}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showSellerInfo={false}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={<PlusIcon className="w-16 h-16" />}
          title="Chưa có sản phẩm nào"
          description="Tạo sản phẩm đầu tiên để bắt đầu bán hàng trên nền tảng"
          action={{
            label: 'Thêm sản phẩm mới',
            onClick: () => navigate(ROUTE_PATHS.APP.ARTISAN.CREATE_PRODUCT),
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProduct}
        title="Xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}"? Thao tác này không thể hoàn tác.`}
        confirmText="Xóa sản phẩm"
        type="danger"
      />
    </div>
  );
};
