import React from 'react';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { OrderStatus } from '../../../types/order';
import { Button } from '../../ui/Button';
import { Card } from '../../ui/Card';
import { SearchBox } from '../../common/SearchBox';
import { Select } from '../../ui/Dropdown';

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusChange: (status: string) => void;
  onRefresh: () => void;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onRefresh,
}) => {
  const statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Chờ xác nhận', value: OrderStatus.PENDING },
    { label: 'Đã xác nhận', value: OrderStatus.CONFIRMED },
    { label: 'Đã thanh toán', value: OrderStatus.PAID },
    { label: 'Đang xử lý', value: OrderStatus.PROCESSING },
    { label: 'Đã gửi hàng', value: OrderStatus.SHIPPED },
    { label: 'Đã giao hàng', value: OrderStatus.DELIVERED },
    { label: 'Đã hủy', value: OrderStatus.CANCELLED },
  ];

  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <SearchBox
            value={searchQuery}
            onChange={onSearchChange}
            onSubmit={onSearchChange}
            placeholder="Tìm theo mã đơn hàng..."
          />
        </div>

        <div className="flex gap-3">
          <Select
            value={statusFilter}
            onChange={onStatusChange}
            options={statusOptions}
            className="md:w-48"
          />

          <Button
            variant="ghost"
            onClick={onRefresh}
            leftIcon={<ArrowPathIcon className="w-4 h-4" />}
          >
            Làm mới
          </Button>
        </div>
      </div>
    </Card>
  );
};
