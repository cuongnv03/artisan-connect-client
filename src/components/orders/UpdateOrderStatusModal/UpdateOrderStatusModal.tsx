import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';
import { Select } from '../../ui/Dropdown';
import { Input } from '../../ui/Input';
import { OrderStatus, UpdateOrderStatusRequest } from '../../../types/order';
import { useAuth } from '../../../contexts/AuthContext';

interface UpdateOrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: UpdateOrderStatusRequest) => Promise<void>;
  currentStatus: OrderStatus;
  loading?: boolean;
}

export const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  currentStatus,
  loading = false,
}) => {
  const { state } = useAuth();
  const [formData, setFormData] = useState<UpdateOrderStatusRequest>({
    status: currentStatus,
    note: '',
  });

  const getAvailableStatuses = () => {
    const { user } = state;

    if (user?.role === 'ADMIN') {
      return Object.values(OrderStatus);
    }

    if (user?.role === 'ARTISAN') {
      const transitions: Record<OrderStatus, OrderStatus[]> = {
        [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
        [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING],
        [OrderStatus.PAID]: [OrderStatus.PROCESSING],
        [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED],
        [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
        [OrderStatus.DELIVERED]: [],
        [OrderStatus.CANCELLED]: [],
        [OrderStatus.REFUNDED]: [],
      };
      return transitions[currentStatus] || [];
    }

    return [];
  };

  const getStatusLabel = (status: OrderStatus) => {
    const labels = {
      [OrderStatus.PENDING]: 'Chờ xác nhận',
      [OrderStatus.CONFIRMED]: 'Đã xác nhận',
      [OrderStatus.PAID]: 'Đã thanh toán',
      [OrderStatus.PROCESSING]: 'Đang xử lý',
      [OrderStatus.SHIPPED]: 'Đã gửi hàng',
      [OrderStatus.DELIVERED]: 'Đã giao hàng',
      [OrderStatus.CANCELLED]: 'Đã hủy',
      [OrderStatus.REFUNDED]: 'Đã hoàn tiền',
    };
    return labels[status];
  };

  const getStatusDescription = (status: OrderStatus) => {
    const descriptions = {
      [OrderStatus.CONFIRMED]: 'Xác nhận nhận đơn và bắt đầu chuẩn bị hàng',
      [OrderStatus.PROCESSING]: 'Đang chuẩn bị và đóng gói sản phẩm',
      [OrderStatus.SHIPPED]: 'Đã giao cho đơn vị vận chuyển',
      [OrderStatus.DELIVERED]: 'Đã giao hàng thành công đến khách',
      [OrderStatus.CANCELLED]: 'Hủy đơn hàng',
    };
    return descriptions[status];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  const availableStatuses = getAvailableStatuses();
  const statusOptions = availableStatuses.map((status) => ({
    label: getStatusLabel(status),
    value: status,
  }));

  if (availableStatuses.length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cập nhật trạng thái đơn hàng"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Trạng thái mới
          </label>
          <Select
            value={formData.status}
            onChange={(value) =>
              setFormData({ ...formData, status: value as OrderStatus })
            }
            options={statusOptions}
            placeholder="Chọn trạng thái"
          />
          {formData.status && getStatusDescription(formData.status) && (
            <p className="text-xs text-gray-500 mt-1">
              {getStatusDescription(formData.status)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú
          </label>
          <Input
            as="textarea"
            rows={3}
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Ghi chú về việc cập nhật trạng thái (tùy chọn)..."
          />
        </div>

        {(formData.status === OrderStatus.SHIPPED ||
          formData.status === OrderStatus.DELIVERED) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày dự kiến giao hàng
            </label>
            <Input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimatedDelivery: e.target.value
                    ? new Date(e.target.value)
                    : undefined,
                })
              }
            />
          </div>
        )}

        <div className="flex space-x-3 justify-end pt-4">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" loading={loading}>
            Cập nhật trạng thái
          </Button>
        </div>
      </form>
    </Modal>
  );
};
