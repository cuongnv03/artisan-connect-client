import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  ArrowPathIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../types/order';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { SearchBox } from '../../components/common/SearchBox';
import { Select } from '../../components/ui/Dropdown';
import { Pagination } from '../../components/ui/Pagination';
import { Tabs } from '../../components/ui/Tabs';

export const OrdersPage: React.FC = () => {
  const { state } = useAuth();
  const [buyOrders, setBuyOrders] = useState<Order[]>([]);
  const [sellOrders, setSellOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('buy');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [activeTab, statusFilter, searchQuery, currentPage]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const query = {
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      let result;
      if (activeTab === 'buy') {
        result = await orderService.getMyOrders(query);
        setBuyOrders(result.data);
      } else {
        result = await orderService.getSellerOrders(query);
        setSellOrders(result.data);
      }

      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      [OrderStatus.PENDING]: {
        variant: 'warning' as const,
        text: 'Chờ xác nhận',
      },
      [OrderStatus.CONFIRMED]: {
        variant: 'info' as const,
        text: 'Đã xác nhận',
      },
      [OrderStatus.PAID]: {
        variant: 'success' as const,
        text: 'Đã thanh toán',
      },
      [OrderStatus.PROCESSING]: {
        variant: 'info' as const,
        text: 'Đang xử lý',
      },
      [OrderStatus.SHIPPED]: { variant: 'info' as const, text: 'Đã gửi hàng' },
      [OrderStatus.DELIVERED]: {
        variant: 'success' as const,
        text: 'Đã giao hàng',
      },
      [OrderStatus.CANCELLED]: { variant: 'danger' as const, text: 'Đã hủy' },
      [OrderStatus.REFUNDED]: {
        variant: 'secondary' as const,
        text: 'Đã hoàn tiền',
      },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

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

  const currentOrders = activeTab === 'buy' ? buyOrders : sellOrders;

  const renderOrderCard = (order: Order) => (
    <Card key={order.id} className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h3 className="font-semibold text-gray-900">
              #{order.orderNumber}
            </h3>
            {getStatusBadge(order.status)}
          </div>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>

        <div className="text-right">
          <p className="text-lg font-semibold text-accent">
            {formatPrice(order.totalAmount)}
          </p>
          <p className="text-sm text-gray-500">{order.items.length} sản phẩm</p>
        </div>
      </div>

      {/* Order Items Preview */}
      <div className="space-y-3 mb-4">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <img
              src={item.product.images[0] || 'https://via.placeholder.com/60'}
              alt={item.product.name}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.product.name}
              </p>
              <p className="text-sm text-gray-500">
                SL: {item.quantity} x {formatPrice(item.price)}
              </p>
              {activeTab === 'buy' && item.seller && (
                <p className="text-xs text-gray-400">
                  Bởi {item.seller.firstName} {item.seller.lastName}
                </p>
              )}
            </div>
          </div>
        ))}

        {order.items.length > 2 && (
          <p className="text-sm text-gray-500">
            và {order.items.length - 2} sản phẩm khác...
          </p>
        )}
      </div>

      {/* Order Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          {order.trackingNumber && (
            <Link to={`/orders/tracking/${order.trackingNumber}`}>
              <Button variant="ghost" size="sm">
                Theo dõi đơn hàng
              </Button>
            </Link>
          )}
        </div>

        <Link to={`/orders/${order.id}`}>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<EyeIcon className="w-4 h-4" />}
          >
            Xem chi tiết
          </Button>
        </Link>
      </div>
    </Card>
  );

  const tabItems = [
    {
      key: 'buy',
      label: 'Đơn mua',
      content: (
        <div className="space-y-6">
          {currentOrders.length > 0 ? (
            currentOrders.map(renderOrderCard)
          ) : (
            <EmptyState
              icon={<ClipboardDocumentListIcon className="w-12 h-12" />}
              title="Chưa có đơn hàng nào"
              description="Bạn chưa có đơn mua nào. Hãy khám phá sản phẩm và đặt hàng!"
              action={{
                label: 'Khám phá sản phẩm',
                onClick: () => (window.location.href = '/shop'),
              }}
            />
          )}
        </div>
      ),
    },
  ];

  // Add sell tab for artisans
  if (state.user?.role === 'ARTISAN') {
    tabItems.push({
      key: 'sell',
      label: 'Đơn bán',
      content: (
        <div className="space-y-6">
          {currentOrders.length > 0 ? (
            currentOrders.map(renderOrderCard)
          ) : (
            <EmptyState
              icon={<ClipboardDocumentListIcon className="w-12 h-12" />}
              title="Chưa có đơn bán nào"
              description="Chưa có khách hàng nào đặt mua sản phẩm của bạn."
            />
          )}
        </div>
      ),
    });
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Quản lý đơn hàng
      </h1>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <SearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Tìm theo mã đơn hàng..."
            />
          </div>

          <div className="flex gap-3">
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={statusOptions}
              className="md:w-48"
            />

            <Button
              variant="ghost"
              onClick={loadOrders}
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Làm mới
            </Button>
          </div>
        </div>
      </Card>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-gray-600">Đang tải đơn hàng...</p>
          </div>
        </div>
      ) : (
        <>
          <Tabs
            items={tabItems}
            activeKey={activeTab}
            onChange={setActiveTab}
            variant="line"
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={10}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};
