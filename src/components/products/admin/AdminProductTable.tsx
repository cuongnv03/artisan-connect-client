import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../../types/product';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { ConfirmModal } from '../../ui/Modal';
import { Select } from '../../ui/Dropdown';
import { useToastContext } from '../../../contexts/ToastContext';
import {
  EyeIcon,
  TrashIcon,
  UserIcon,
  PhotoIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

interface AdminProductTableProps {
  products: Product[];
  loading?: boolean;
  onDelete?: (productId: string) => Promise<void>;
  onStatusUpdate?: (productId: string, status: string) => Promise<void>;
}

export const AdminProductTable: React.FC<AdminProductTableProps> = ({
  products,
  loading = false,
  onDelete,
  onStatusUpdate,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<Record<string, boolean>>(
    {},
  );
  const { success, error } = useToastContext();

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

  const handleDeleteConfirm = async () => {
    if (productToDelete && onDelete) {
      try {
        await onDelete(productToDelete);
        success('Xóa sản phẩm thành công');
      } catch (err: any) {
        error(err.message);
      }
    }
    setDeleteModalOpen(false);
    setProductToDelete(null);
  };

  const handleStatusChange = async (productId: string, newStatus: string) => {
    if (!onStatusUpdate) return;

    setUpdatingStatus((prev) => ({ ...prev, [productId]: true }));
    try {
      await onStatusUpdate(productId, newStatus);
      success('Cập nhật trạng thái thành công');
    } catch (err: any) {
      error(err.message);
    } finally {
      setUpdatingStatus((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const statusOptions = [
    { label: 'Đã xuất bản', value: 'PUBLISHED' },
    { label: 'Bản nháp', value: 'DRAFT' },
    { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
    { label: 'Đã xóa', value: 'DELETED' },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
                Nghệ nhân
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Giá / Kho
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
                        SKU: {product.sku || 'Không có'}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                      {product.seller?.avatarUrl ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={product.seller.avatarUrl}
                          alt={`${product.seller.firstName} ${product.seller.lastName}`}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-4 w-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900 flex items-center">
                        {product.seller?.artisanProfile?.shopName ||
                          `${product.seller?.firstName} ${product.seller?.lastName}`}
                        {product.seller?.artisanProfile?.isVerified && (
                          <ShieldCheckIcon className="w-4 h-4 text-blue-500 ml-1" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        @{product.seller?.username}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatPrice(product.discountPrice || product.price)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Kho: {product.quantity}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    {getStatusBadge(product.status)}
                    <Select
                      value={product.status}
                      onChange={(value) =>
                        handleStatusChange(product.id, value)
                      }
                      options={statusOptions}
                      size="sm"
                      disabled={updatingStatus[product.id]}
                    />
                  </div>
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
                    <Link to={`/shop/${product.id}`}>
                      <Button variant="ghost" size="sm" title="Xem sản phẩm">
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(product.id)}
                      title="Xóa sản phẩm"
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
          <p className="text-gray-500">
            Hiện tại chưa có sản phẩm nào trong hệ thống
          </p>
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
