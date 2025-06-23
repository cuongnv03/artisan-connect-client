import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { useCustomOrders } from '../../hooks/custom-orders/useCustomOrders';
import { useCustomOrderOperations } from '../../hooks/custom-orders/useCustomOrderOperations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Dropdown';
import { Pagination } from '../../components/ui/Pagination';
import { CustomOrderList } from '../../components/custom-orders/CustomOrderList/CustomOrderList';
import { QuoteStatus } from '../../types/custom-order';

export const CustomerCustomOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { exportOrders, loading: exporting } = useCustomOrderOperations();
  const {
    orders,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    filters,
    updateFilters,
    refreshOrders,
    userRole,
  } = useCustomOrders('customer');

  const statusOptions = [
    { label: 'Tất cả trạng thái', value: '' },
    { label: 'Chờ phản hồi', value: QuoteStatus.PENDING },
    { label: 'Đã chấp nhận', value: QuoteStatus.ACCEPTED },
    { label: 'Đã từ chối', value: QuoteStatus.REJECTED },
    { label: 'Đề xuất ngược', value: QuoteStatus.COUNTER_OFFERED },
    { label: 'Đã hết hạn', value: QuoteStatus.EXPIRED },
  ];

  const handleStatusFilter = (status: string) => {
    updateFilters({
      ...filters,
      status: (status as QuoteStatus) || undefined,
    });
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/custom-orders/${orderId}`);
  };

  const handleExport = () => {
    exportOrders(filters);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Yêu cầu Custom Order của tôi
          </h1>
          <p className="text-gray-600">
            Quản lý các yêu cầu custom order bạn đã gửi
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={handleExport}
            loading={exporting}
            leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
          >
            Xuất Excel
          </Button>

          <Button
            onClick={() => navigate('/custom-orders/create')}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Tạo yêu cầu mới
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Bộ lọc:</span>

          <Select
            value={filters.status?.toString() || ''}
            onChange={handleStatusFilter}
            options={statusOptions}
            className="w-48"
          />

          <Button variant="ghost" size="sm" onClick={refreshOrders}>
            Làm mới
          </Button>
        </div>
      </Card>

      {/* Orders List */}
      <CustomOrderList
        orders={orders}
        loading={loading}
        userRole={userRole || 'CUSTOMER'}
        onOrderClick={handleOrderClick}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={10}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
