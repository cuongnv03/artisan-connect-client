import React, { useState, useEffect } from 'react';
import {
  ShoppingBagIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { orderService } from '../../../services/order.service';
import { useToastContext } from '../../../contexts/ToastContext';
import {
  OrderSummary,
  GetOrdersQuery,
  OrderStatus,
  PaymentStatus,
  DeliveryStatus,
  UpdateOrderStatusRequest,
} from '../../../types/order';
import { PaginatedResponse } from '../../../types/common';
import { AdminOrderCard } from '../../../components/orders/admin/AdminOrderCard';
import { UpdateOrderStatusModal } from '../../../components/orders/UpdateOrderStatusModal';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Dropdown';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { Pagination } from '../../../components/ui/Pagination';
import { EmptyState } from '../../../components/common/EmptyState';

export const AdminOrdersPage: React.FC = () => {
  const { success, error } = useToastContext();

  // State
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  // Modal state
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrderStatus, setSelectedOrderStatus] =
    useState<OrderStatus | null>(null);
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [currentPage, statusFilter, paymentStatusFilter, deliveryStatusFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const query: GetOrdersQuery = {
        page: currentPage,
        limit,
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined,
        deliveryStatus: deliveryStatusFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      const result: PaginatedResponse<OrderSummary> =
        await orderService.admin.getAllOrders(query);

      setOrders(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
    } catch (err: any) {
      error(err.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await orderService.admin.getOrderStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setActionLoading(true);
    try {
      await orderService.admin.deleteOrder(orderId);
      success('Đã xóa đơn hàng thành công');
      loadOrders();
      loadStats();
    } catch (err: any) {
      error(err.message || 'Không thể xóa đơn hàng');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      setSelectedOrderId(orderId);
      setSelectedOrderStatus(order.status);
      setShowUpdateStatusModal(true);
    }
  };

  const handleStatusUpdate = async (data: UpdateOrderStatusRequest) => {
    if (!selectedOrderId) return;

    setActionLoading(true);
    try {
      await orderService.admin.updateOrderStatus(selectedOrderId, data);
      success('Đã cập nhật trạng thái đơn hàng');
      setShowUpdateStatusModal(false);
      setSelectedOrderId(null);
      setSelectedOrderStatus(null);
      loadOrders();
      loadStats();
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật trạng thái');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    loadOrders();
    loadStats();
  };

  const handleSearch = () => {
    setCurrentPage(1);
    loadOrders();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý đơn hàng</h1>
          <p className="text-gray-600">
            Quản lý tất cả đơn hàng trong hệ thống
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          leftIcon={<ArrowPathIcon className="w-4 h-4" />}
        >
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm text-gray-500">Tổng đơn hàng</p>
                <p className="text-2xl font-semibold">{stats.totalOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">⏳</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Chờ xử lý</p>
                <p className="text-2xl font-semibold">{stats.pendingOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Hoàn thành</p>
                <p className="text-2xl font-semibold">
                  {stats.completedOrders}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 font-semibold">₫</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-500">Tổng doanh thu</p>
                <p className="text-lg font-semibold">
                  {formatPrice(stats.totalRevenue)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Tìm theo mã đơn hàng hoặc tên khách hàng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { label: 'Tất cả trạng thái', value: '' },
                { label: 'Chờ xác nhận', value: OrderStatus.PENDING },
                { label: 'Đã xác nhận', value: OrderStatus.CONFIRMED },
                { label: 'Đã thanh toán', value: OrderStatus.PAID },
                { label: 'Đang xử lý', value: OrderStatus.PROCESSING },
                { label: 'Đã gửi hàng', value: OrderStatus.SHIPPED },
                { label: 'Đã giao hàng', value: OrderStatus.DELIVERED },
                { label: 'Đã hủy', value: OrderStatus.CANCELLED },
              ]}
              className="md:w-48"
            />

            <Select
              value={paymentStatusFilter}
              onChange={setPaymentStatusFilter}
              options={[
                { label: 'Tất cả thanh toán', value: '' },
                { label: 'Chờ thanh toán', value: PaymentStatus.PENDING },
                { label: 'Đã thanh toán', value: PaymentStatus.COMPLETED },
                { label: 'Thất bại', value: PaymentStatus.FAILED },
                { label: 'Đã hủy', value: PaymentStatus.CANCELLED },
              ]}
              className="md:w-48"
            />

            <Button
              onClick={handleSearch}
              leftIcon={<FunnelIcon className="w-4 h-4" />}
            >
              Lọc
            </Button>
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Đang tải danh sách đơn hàng...</p>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="Không có đơn hàng nào"
          description="Chưa có đơn hàng nào trong hệ thống hoặc theo bộ lọc hiện tại"
          icon={<ShoppingBagIcon className="w-12 h-12" />}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4">
            {orders.map((order) => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onDelete={handleDeleteOrder}
                onUpdateStatus={handleUpdateStatus}
                loading={actionLoading}
                formatPrice={formatPrice}
                formatDate={formatDate}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                showInfo={true}
                totalItems={totalItems}
                itemsPerPage={limit}
              />
            </div>
          )}
        </>
      )}

      {/* Update Status Modal */}
      {selectedOrderStatus && (
        <UpdateOrderStatusModal
          isOpen={showUpdateStatusModal}
          onClose={() => {
            setShowUpdateStatusModal(false);
            setSelectedOrderId(null);
            setSelectedOrderStatus(null);
          }}
          onUpdate={handleStatusUpdate}
          currentStatus={selectedOrderStatus}
          loading={actionLoading}
        />
      )}
    </div>
  );
};
