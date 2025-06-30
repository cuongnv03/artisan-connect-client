import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { OrderSummary, OrderStatus } from '../../../types/order';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { ConfirmModal } from '../../ui/Modal';
import { OrderStatusBadge } from '../OrderStatusBadge';

interface AdminOrderCardProps {
  order: OrderSummary;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string) => void;
  loading?: boolean;
  formatPrice: (price: number) => string;
  formatDate: (date: string) => string;
}

export const AdminOrderCard: React.FC<AdminOrderCardProps> = ({
  order,
  onDelete,
  onUpdateStatus,
  loading = false,
  formatPrice,
  formatDate,
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = () => {
    onDelete(order.id);
    setShowDeleteModal(false);
  };

  const canDelete = () => {
    return (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.REFUNDED
    );
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-gray-900">
                #{order.orderNumber}
              </h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-gray-500">
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="text-right">
            <p className="text-lg font-semibold text-primary">
              {formatPrice(order.totalAmount)}
            </p>
            <p className="text-sm text-gray-500">{order.itemCount} sản phẩm</p>
          </div>
        </div>

        {/* Customer info */}
        {order.customer && (
          <div className="mb-4 p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium">
              Khách hàng: {order.customer.name}
            </p>
            <p className="text-xs text-gray-500">{order.customer.email}</p>
          </div>
        )}

        {/* Seller info */}
        {order.primarySeller && (
          <div className="mb-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium">
              Người bán: {order.primarySeller.name}
              {order.primarySeller.shopName &&
                ` (${order.primarySeller.shopName})`}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <Link to={`/orders/${order.id}`}>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<EyeIcon className="w-4 h-4" />}
              >
                Xem
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onUpdateStatus(order.id)}
              leftIcon={<PencilIcon className="w-4 h-4" />}
            >
              Sửa trạng thái
            </Button>
          </div>

          {canDelete() && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteModal(true)}
              leftIcon={<TrashIcon className="w-4 h-4" />}
              disabled={loading}
            >
              Xóa
            </Button>
          )}
        </div>
      </Card>

      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa đơn hàng"
        message={
          <div>
            <p className="mb-2">
              Bạn có chắc chắn muốn xóa đơn hàng #{order.orderNumber}?
            </p>
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-sm text-red-700">
                Hành động này không thể hoàn tác và sẽ xóa toàn bộ dữ liệu liên
                quan.
              </p>
            </div>
          </div>
        }
        confirmText="Xóa đơn hàng"
        cancelText="Hủy"
        type="danger"
        loading={loading}
      />
    </>
  );
};
