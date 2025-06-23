import React, { useState } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  ArrowUturnLeftIcon,
  PrinterIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { OrderWithDetails, OrderStatus } from '../../types/order';
import { Button } from '../ui/Button';
import { ConfirmModal } from '../ui/Modal';
import { useAuth } from '../../contexts/AuthContext';

interface OrderActionsProps {
  order: OrderWithDetails;
  onUpdateStatus?: (status: OrderStatus, note?: string) => void;
  onCancelOrder?: (reason?: string) => void;
  onCreateDispute?: () => void;
  onCreateReturn?: () => void;
  onContactSeller?: () => void;
  loading?: boolean;
}

export const OrderActions: React.FC<OrderActionsProps> = ({
  order,
  onUpdateStatus,
  onCancelOrder,
  onCreateDispute,
  onCreateReturn,
  onContactSeller,
  loading = false,
}) => {
  const { state } = useAuth();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const canCancel = () => {
    const cancellableStatuses = [
      OrderStatus.PENDING,
      OrderStatus.CONFIRMED,
      OrderStatus.PAID,
    ];
    return cancellableStatuses.includes(order.status);
  };

  const canCreateDispute = () => {
    const disputeableStatuses = [
      OrderStatus.PAID,
      OrderStatus.PROCESSING,
      OrderStatus.SHIPPED,
      OrderStatus.DELIVERED,
    ];
    return disputeableStatuses.includes(order.status) && !order.hasDispute;
  };

  const canCreateReturn = () => {
    return (
      order.status === OrderStatus.DELIVERED &&
      order.canReturn &&
      (!order.returnDeadline || new Date() <= new Date(order.returnDeadline))
    );
  };

  const canUpdateStatus = () => {
    if (state.user?.role !== 'ARTISAN') return false;
    return order.items.some((item) => item.seller.id === state.user?.id);
  };

  const getNextAvailableStatus = () => {
    const statusFlow = {
      [OrderStatus.PENDING]: OrderStatus.CONFIRMED,
      [OrderStatus.CONFIRMED]: OrderStatus.PROCESSING,
      [OrderStatus.PAID]: OrderStatus.PROCESSING,
      [OrderStatus.PROCESSING]: OrderStatus.SHIPPED,
      [OrderStatus.SHIPPED]: OrderStatus.DELIVERED,
    };
    return statusFlow[order.status];
  };

  const getStatusUpdateLabel = () => {
    const nextStatus = getNextAvailableStatus();
    const statusLabels = {
      [OrderStatus.CONFIRMED]: 'Xác nhận đơn hàng',
      [OrderStatus.PROCESSING]: 'Bắt đầu xử lý',
      [OrderStatus.SHIPPED]: 'Đã gửi hàng',
      [OrderStatus.DELIVERED]: 'Đã giao hàng',
    };
    return statusLabels[nextStatus] || 'Cập nhật trạng thái';
  };

  const handleCancelConfirm = async () => {
    if (onCancelOrder) {
      await onCancelOrder(cancelReason || undefined);
    }
    setShowCancelModal(false);
    setCancelReason('');
  };

  const nextStatus = getNextAvailableStatus();

  return (
    <>
      <div className="flex flex-wrap gap-3">
        {/* Customer Actions */}
        {state.user?.id === order.customer.id && (
          <>
            {canCancel() && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                leftIcon={<XCircleIcon className="w-4 h-4" />}
                loading={loading}
              >
                Hủy đơn hàng
              </Button>
            )}

            {canCreateDispute() && onCreateDispute && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateDispute}
                leftIcon={<ExclamationTriangleIcon className="w-4 h-4" />}
              >
                Khiếu nại
              </Button>
            )}

            {canCreateReturn() && onCreateReturn && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateReturn}
                leftIcon={<ArrowUturnLeftIcon className="w-4 h-4" />}
              >
                Trả hàng
              </Button>
            )}

            {onContactSeller && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onContactSeller}
                leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
              >
                Liên hệ người bán
              </Button>
            )}
          </>
        )}

        {/* Seller Actions */}
        {canUpdateStatus() && nextStatus && onUpdateStatus && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onUpdateStatus(nextStatus)}
            leftIcon={<CheckCircleIcon className="w-4 h-4" />}
            loading={loading}
          >
            {getStatusUpdateLabel()}
          </Button>
        )}

        {/* Common Actions */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<PrinterIcon className="w-4 h-4" />}
        >
          In đơn hàng
        </Button>

        {order.trackingNumber && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<TruckIcon className="w-4 h-4" />}
            onClick={() =>
              window.open(`/orders/tracking/${order.orderNumber}`, '_blank')
            }
          >
            Theo dõi
          </Button>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelConfirm}
        title="Xác nhận hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác."
        confirmText="Hủy đơn hàng"
        cancelText="Giữ đơn hàng"
        type="danger"
        loading={loading}
      >
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lý do hủy (tùy chọn)
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={3}
            className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Nhập lý do hủy đơn hàng..."
          />
        </div>
      </ConfirmModal>
    </>
  );
};
