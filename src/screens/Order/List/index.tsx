import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '../../../hooks/useOrders';
import { OrderStatus } from '../../../types/order.types';
import { formatDate, formatPrice } from '../../../helpers/formatters';
import { Card } from '../../../components/common/Card';
import { Loader } from '../../../components/feedback/Loader';
import { Tabs } from '../../../components/navigation/Tabs';
import { Button } from '../../../components/form/Button';
import { Dropdown } from '../../../components/form/Dropdown';
import { useAuth } from '../../../context/AuthContext';
import { UserRole } from '../../../types/user.types';
import { OrderStatusBadge } from '../OrderStatusBadge';
import { PaginationControls } from '../../../components/common/PaginationControls';

const OrdersList: React.FC = () => {
  const { state } = useAuth();
  const { user } = state;
  const isArtisan = user?.role === UserRole.ARTISAN;

  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get status filter based on active tab
  const getStatusFilter = (): OrderStatus[] | undefined => {
    switch (activeTab) {
      case 'pending':
        return [OrderStatus.PENDING, OrderStatus.PAID];
      case 'processing':
        return [OrderStatus.PROCESSING];
      case 'shipping':
        return [OrderStatus.SHIPPED];
      case 'delivered':
        return [OrderStatus.DELIVERED];
      case 'cancelled':
        return [OrderStatus.CANCELLED, OrderStatus.REFUNDED];
      default:
        return undefined;
    }
  };

  // Query params
  const queryOptions = {
    status: getStatusFilter(),
    page: currentPage,
    limit: pageSize,
    sortBy,
    sortOrder,
  };

  // Fetch orders based on user role
  const { useMyOrders, useMyArtisanOrders } = useOrders();
  const {
    data: ordersData,
    isLoading,
    isError,
  } = isArtisan ? useMyArtisanOrders(queryOptions) : useMyOrders(queryOptions);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Sort options
  const sortOptions = [
    { value: 'createdAt', label: 'Date (newest first)' },
    { value: 'createdAt_asc', label: 'Date (oldest first)' },
    { value: 'totalAmount', label: 'Amount (high to low)' },
    { value: 'totalAmount_asc', label: 'Amount (low to high)' },
  ];

  // Handle sort change
  const handleSortChange = (value: string | number) => {
    const sortValue = value.toString();
    if (sortValue.includes('_asc')) {
      setSortBy(sortValue.replace('_asc', ''));
      setSortOrder('asc');
    } else {
      setSortBy(sortValue);
      setSortOrder('desc');
    }
  };

  // Define tabs
  const tabs = [
    { id: 'all', label: 'All', content: '' },
    {
      id: 'pending',
      label: 'Pending',
      content: '',
      badge: ordersData?.data.filter(
        (o) =>
          o.status === OrderStatus.PENDING || o.status === OrderStatus.PAID,
      ).length,
    },
    { id: 'processing', label: 'Processing', content: '' },
    { id: 'shipping', label: 'Shipping', content: '' },
    { id: 'delivered', label: 'Delivered', content: '' },
    { id: 'cancelled', label: 'Cancelled', content: '' },
  ];

  // Render the tab content
  const renderOrders = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <Loader text="Loading orders..." />
        </div>
      );
    }

    if (isError) {
      return (
        <div className="text-center py-8 text-red-600">
          Failed to load orders. Please try again.
        </div>
      );
    }

    if (!ordersData?.data || ordersData.data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No orders found for this filter.
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {ordersData.data.map((order) => (
          <Card
            key={order.id}
            className="hover:shadow-md transition-shadow"
            isInteractive
            onClick={() => (window.location.href = `/orders/${order.id}`)}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between md:block">
                  <h3 className="font-medium">Order #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-500">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="mt-2">
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">
                  {order.items.length}{' '}
                  {order.items.length === 1 ? 'item' : 'items'}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  From {isArtisan ? 'customer' : 'seller'}:{' '}
                  {isArtisan
                    ? `${order.customer?.firstName} ${order.customer?.lastName}`
                    : order.items[0]?.seller?.firstName
                    ? `${order.items[0]?.seller?.firstName} ${order.items[0]?.seller?.lastName}`
                    : 'Multiple sellers'}
                </p>
              </div>

              <div className="flex flex-col md:items-end justify-between">
                <p className="font-medium text-lg">
                  {formatPrice(order.totalAmount)}
                </p>
                <Link
                  to={`/orders/${order.id}`}
                  className="text-accent hover:text-accent-dark"
                  onClick={(e) => e.stopPropagation()}
                >
                  View details
                </Link>
              </div>
            </div>
          </Card>
        ))}

        {/* Pagination */}
        {ordersData.meta && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={ordersData.meta.totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {isArtisan ? 'Received Orders' : 'My Orders'}
        </h1>

        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <Dropdown
              options={sortOptions}
              value={sortOrder === 'asc' ? `${sortBy}_asc` : sortBy}
              onChange={handleSortChange}
              placeholder="Sort by"
              className="w-full md:w-40"
            />
            {isArtisan && (
              <Button
                variant="outline"
                as={Link}
                to="/orders/export"
                className="w-full md:w-auto"
              >
                Export CSV
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs
        tabs={tabs}
        defaultTab="all"
        onChange={handleTabChange}
        variant="underline"
      />

      <div className="mt-6">{renderOrders()}</div>
    </div>
  );
};

export default OrdersList;
