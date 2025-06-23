import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FunnelIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { useCustomOrders } from '../../hooks/custom-orders/useCustomOrders';
import { useCustomOrderOperations } from '../../hooks/custom-orders/useCustomOrderOperations';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Dropdown';
import { Pagination } from '../../components/ui/Pagination';
import { CustomOrderList } from '../../components/custom-orders/CustomOrderList/CustomOrderList';
import { QuoteStatus } from '../../types/custom-order';

export const ArtisanCustomOrdersPage: React.FC = () => {
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
  } = useCustomOrders('artisan');

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
            Yêu cầu Custom Order nhận được
          </h1>
          <p className="text-gray-600">
            Quản lý các yêu cầu custom order từ khách hàng
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/custom-orders/stats')}
            leftIcon={<ChartBarIcon className="w-4 h-4" />}
          >
            Thống kê
          </Button>

          <Button
            variant="ghost"
            onClick={handleExport}
            loading={exporting}
            leftIcon={<ArrowDownTrayIcon className="w-4 h-4" />}
          >
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{totalItems}</p>
            <p className="text-sm text-gray-600">Tổng yêu cầu</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              {orders.filter((o) => o.status === QuoteStatus.PENDING).length}
            </p>
            <p className="text-sm text-gray-600">Chờ phản hồi</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {orders.filter((o) => o.status === QuoteStatus.ACCEPTED).length}
            </p>
            <p className="text-sm text-gray-600">Đã chấp nhận</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {
                orders.filter((o) => o.status === QuoteStatus.COUNTER_OFFERED)
                  .length
              }
            </p>
            <p className="text-sm text-gray-600">Đề xuất ngược</p>
          </div>
        </Card>
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
        userRole={userRole || 'ARTISAN'}
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
