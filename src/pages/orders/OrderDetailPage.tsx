import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  TruckIcon,
  PrinterIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useOrderDetail } from '../../hooks/orders/useOrderDetail';
import { UpdateOrderStatusRequest } from '../../types/order';
import { UpdateOrderStatusModal } from '../../components/orders/UpdateOrderStatusModal/UpdateOrderStatusModal';
import { OrderDetailContent } from '../../components/orders/OrderDetailContent/OrderDetailContent';
import { OrderSidebar } from '../../components/orders/OrderSidebar/OrderSidebar';
import { OrderStatusBadge } from '../../components/orders/OrderStatusBadge/OrderStatusBadge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmModal } from '../../components/ui/Modal';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);

  const {
    order,
    loading,
    updating,
    updateOrderStatus,
    cancelOrder,
    canUpdateStatus,
    canCancelOrder,
    getNextPossibleStatuses,
    formatPrice,
    formatDate,
  } = useOrderDetail(orderId!);

  const handleUpdateStatus = async (data: UpdateOrderStatusRequest) => {
    await updateOrderStatus(data);
    setShowUpdateStatusModal(false);
  };

  const handleCancelOrder = async () => {
    await cancelOrder('Khách hàng yêu cầu hủy đơn');
    setShowCancelModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy đơn hàng
        </h3>
        <p className="text-gray-500 mb-6">
          Đơn hàng này không tồn tại hoặc bạn không có quyền xem
        </p>
        <Link to="/orders">
          <Button>Quay lại danh sách đơn hàng</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/orders">
            <Button
              variant="ghost"
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
              className="mr-4"
            >
              Quay lại
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Đơn hàng #{order.orderNumber}
            </h1>
            <p className="text-gray-500">
              Đặt lúc {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <OrderStatusBadge status={order.status} />

          <Button
            variant="ghost"
            leftIcon={<PrinterIcon className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            In
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <OrderDetailContent order={order} formatPrice={formatPrice} />

          {/* Tracking */}
          {order.orderNumber && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TruckIcon className="w-5 h-5 mr-2" />
                Theo dõi đơn hàng
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium mb-2">
                  Mã đơn hàng:{' '}
                  <span className="font-mono">{order.orderNumber}</span>
                </p>
                <p className="text-blue-700 text-sm mb-3">
                  Theo dõi chi tiết trạng thái và lịch trình giao hàng
                </p>

                <Link to={`/orders/tracking/${order.orderNumber}`}>
                  <Button variant="outline" size="sm">
                    Xem lịch trình chi tiết
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <OrderSidebar
            order={order}
            formatPrice={formatPrice}
            formatDate={formatDate}
          />

          {/* Actions */}
          {(canCancelOrder || canUpdateStatus()) && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thao tác
              </h2>

              <div className="space-y-3">
                {canUpdateStatus() && getNextPossibleStatuses().length > 0 && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setShowUpdateStatusModal(true)}
                    leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                  >
                    Cập nhật trạng thái
                  </Button>
                )}

                {canCancelOrder && (
                  <Button
                    variant="danger"
                    fullWidth
                    onClick={() => setShowCancelModal(true)}
                    leftIcon={<XCircleIcon className="w-4 h-4" />}
                  >
                    Hủy đơn hàng
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        title="Xác nhận hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác."
        confirmText="Hủy đơn hàng"
        cancelText="Giữ đơn hàng"
        type="danger"
        loading={updating}
      />

      <UpdateOrderStatusModal
        isOpen={showUpdateStatusModal}
        onClose={() => setShowUpdateStatusModal(false)}
        onUpdate={handleUpdateStatus}
        currentStatus={order.status}
        loading={updating}
      />
    </div>
  );
};
