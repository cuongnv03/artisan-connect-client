import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../../types/product';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { ConfirmModal } from '../../ui/Modal';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ClipboardDocumentIcon,
  PhotoIcon,
} from '@heroicons/react/24/outline';

interface ProductTableProps {
  products: Product[];
  loading?: boolean;
  onDelete?: (productId: string) => void;
  onDuplicate?: (productId: string) => void;
  onToggleStatus?: (productId: string, status: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading = false,
  onDelete,
  onDuplicate,
  onToggleStatus,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      PUBLISHED: { variant: 'success' as const, label: 'Đã xuất bản' },
      DRAFT: { variant: 'secondary' as const, label: 'Bản nháp' },
      OUT_OF_STOCK: { variant: 'warning' as const, label: 'Hết hàng' },
      DELETED: { variant: 'danger' as const, label: 'Đã xóa' },
    };

    const config = statusMap[status as keyof typeof statusMap] || {
      variant: 'secondary' as const,
      label: status,
    };

    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete && onDelete) {
      onDelete(productToDelete);
    }
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
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
                    <div className="flex-shrink-0 h-16 w-16">
                      {product.images?.[0] ? (
                        <img
                          className="h-16 w-16 rounded-lg object-cover"
                          src={product.images[0]}
                          alt={product.name}
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <PhotoIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {product.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.sku || 'Không có SKU'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatPrice(product.discountPrice || product.price)}
                  </div>
                  {product.discountPrice && (
                    <div className="text-sm text-gray-500 line-through">
                      {formatPrice(product.price)}
                    </div>
                  )}
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
                  <div>Xem: {product.viewCount}</div>
                  <div>Bán: {product.salesCount}</div>
                  {product.avgRating && (
                    <div>★ {product.avgRating.toFixed(1)}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Link to={`/products/${product.slug || product.id}`}>
                      {' '}
                      {/* View product */}
                      <Button variant="ghost" size="sm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link to={`/products/manage/${product.id}/edit`}>
                      {' '}
                      {/* Edit product - correct route */}
                      <Button variant="ghost" size="sm">
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    {onDuplicate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicate(product.id)}
                      >
                        <ClipboardDocumentIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(product.id)}
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Chưa có sản phẩm nào
          </p>
          <p className="text-gray-500 mb-6">
            Tạo sản phẩm đầu tiên để bắt đầu bán hàng
          </p>
          <Link to="/products/manage/create">
            <Button>Tạo sản phẩm</Button>
          </Link>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa sản phẩm"
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        type="danger"
      />
    </>
  );
};
