import React from 'react';
import { CustomOrderWithDetails } from '../../../types/custom-order';
import { CustomOrderListItem } from './CustomOrderListItem';
import { EmptyState } from '../../common/EmptyState';
import { WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

interface CustomOrderListProps {
  orders: CustomOrderWithDetails[];
  loading: boolean;
  userRole: string;
  onOrderClick: (orderId: string) => void;
}

export const CustomOrderList: React.FC<CustomOrderListProps> = ({
  orders,
  loading,
  userRole,
  onOrderClick,
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 h-32 rounded-lg" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={<WrenchScrewdriverIcon className="w-16 h-16" />}
        title={
          userRole === 'CUSTOMER'
            ? 'Chưa có yêu cầu custom order nào'
            : 'Chưa nhận được yêu cầu custom order nào'
        }
        description={
          userRole === 'CUSTOMER'
            ? 'Hãy tạo yêu cầu custom order đầu tiên với nghệ nhân'
            : 'Khi có khách hàng yêu cầu custom order, bạn sẽ thấy ở đây'
        }
        action={
          userRole === 'CUSTOMER'
            ? {
                label: 'Tạo custom order',
                onClick: () => (window.location.href = '/custom-orders/create'),
              }
            : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <CustomOrderListItem
          key={order.id}
          order={order}
          userRole={userRole}
          onClick={() => onOrderClick(order.id)}
        />
      ))}
    </div>
  );
};
