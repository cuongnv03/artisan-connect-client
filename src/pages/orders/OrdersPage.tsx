import React, { useState } from 'react';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../hooks/orders/useOrders';
import { OrderCard } from '../../components/orders/OrderCard';
import { OrderFilters } from '../../components/orders/OrderFilters';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { Tabs } from '../../components/ui/Tabs';

export const OrdersPage: React.FC = () => {
  const { state } = useAuth();
  const [activeTab, setActiveTab] = useState('buy');

  const {
    orders,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    refreshOrders,
    formatPrice,
    formatDate,
    userRole,
  } = useOrders(activeTab as 'buy' | 'sell');

  const tabItems = [
    {
      key: 'buy',
      label: 'Đơn mua',
      content: (
        <div className="space-y-6">
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole || 'CUSTOMER'}
                formatPrice={formatPrice}
                formatDate={formatDate}
              />
            ))
          ) : (
            <EmptyState
              icon={<ClipboardDocumentListIcon className="w-12 h-12" />}
              title="Chưa có đơn hàng nào"
              description="Bạn chưa có đơn mua nào. Hãy khám phá sản phẩm và đặt hàng!"
              action={{
                label: 'Khám phá sản phẩm',
                onClick: () => (window.location.href = '/products'),
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
          {orders.length > 0 ? (
            orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                userRole={userRole || 'ARTISAN'}
                formatPrice={formatPrice}
                formatDate={formatDate}
              />
            ))
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

      <OrderFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onRefresh={refreshOrders}
      />

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
