import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { useToastContext } from '../../contexts/ToastContext';
import { productService } from '../../services/product.service';
import { Product, ProductStatus } from '../../types/product';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBox } from '../../components/common/SearchBox';
import { FilterPanel } from '../../components/common/FilterPanel';
import { Pagination } from '../../components/ui/Pagination';
import { ConfirmModal } from '../../components/ui/Modal';

export const ProductsPage: React.FC = () => {
  const { success, error } = useToastContext();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    product: Product | null;
  }>({
    isOpen: false,
    product: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [currentPage, filters, searchQuery]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const result = await productService.getMyProducts({
        page: currentPage,
        limit: 12,
        q: searchQuery || undefined,
        status: filters.status || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      setProducts(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
    } catch (err) {
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (product: Product) => {
    try {
      if (product.status === ProductStatus.PUBLISHED) {
        await productService.unpublishProduct(product.id);
        success('Đã ẩn sản phẩm');
      } else {
        await productService.publishProduct(product.id);
        success('Đã xuất bản sản phẩm');
      }
      loadProducts();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteProduct = async () => {
    if (!deleteModal.product) return;

    setDeleting(true);
    try {
      await productService.deleteProduct(deleteModal.product.id);
      success('Xóa sản phẩm thành công');
      setDeleteModal({ isOpen: false, product: null });
      loadProducts();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: ProductStatus) => {
    const statusConfig = {
      [ProductStatus.DRAFT]: { variant: 'secondary' as const, text: 'Nháp' },
      [ProductStatus.PUBLISHED]: {
        variant: 'success' as const,
        text: 'Đã xuất bản',
      },
      [ProductStatus.OUT_OF_STOCK]: {
        variant: 'warning' as const,
        text: 'Hết hàng',
      },
      [ProductStatus.DELETED]: { variant: 'danger' as const, text: 'Đã xóa' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const statusOptions = [
    { label: 'Nháp', value: ProductStatus.DRAFT },
    { label: 'Đã xuất bản', value: ProductStatus.PUBLISHED },
    { label: 'Hết hàng', value: ProductStatus.OUT_OF_STOCK },
  ];

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Tên A-Z', value: 'name' },
    { label: 'Giá thấp đến cao', value: 'price' },
    { label: 'Lượt xem', value: 'viewCount' },
    { label: 'Đã bán', value: 'salesCount' },
  ];

  if (loading && products.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý sản phẩm</h1>
        <Link to="/products/create">
          <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
            Thêm sản phẩm
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <SearchBox
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm kiếm sản phẩm..."
        />

        <FilterPanel
          filters={filters}
          onFilterChange={setFilters}
          categoryOptions={statusOptions.map((s) => ({
            label: s.label,
            value: s.value,
          }))}
          sortOptions={sortOptions}
        />
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <EmptyState
          icon={<PlusIcon className="w-16 h-16" />}
          title="Chưa có sản phẩm nào"
          description="Tạo sản phẩm đầu tiên để bắt đầu bán hàng"
          action={{
            label: 'Tạo sản phẩm đầu tiên',
            onClick: () => (window.location.href = '/products/create'),
          }}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                {/* Product Image */}
                <div className="aspect-square bg-gray-100 relative">
                  {product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400">Chưa có ảnh</span>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    {getStatusBadge(product.status)}
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col space-y-1">
                      <Link to={`/products/${product.id}`}>
                        <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                          <EyeIcon className="w-4 h-4 text-gray-600" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between mb-2">
                    <div>
                      {product.discountPrice ? (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-primary">
                            {formatPrice(product.discountPrice)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    <span className="text-sm text-gray-500">
                      SL: {product.quantity}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>{product.viewCount} lượt xem</span>
                    <span>{product.salesCount} đã bán</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product.id}/edit`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" fullWidth>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Sửa
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusToggle(product)}
                    >
                      {product.status === ProductStatus.PUBLISHED ? (
                        <EyeSlashIcon className="w-4 h-4" />
                      ) : (
                        <EyeIcon className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteModal({ isOpen: true, product })}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={12}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, product: null })}
        onConfirm={handleDeleteProduct}
        title="Xác nhận xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${deleteModal.product?.name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa sản phẩm"
        cancelText="Hủy"
        type="danger"
        loading={deleting}
      />
    </div>
  );
};
