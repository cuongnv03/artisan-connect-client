import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { EmptyState } from '../common/EmptyState';

export const EmptyCart: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto">
      <EmptyState
        icon={<ShoppingCartIcon className="w-16 h-16" />}
        title="Giỏ hàng trống"
        description="Bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá cửa hàng để tìm những sản phẩm thú vị!"
        action={{
          label: 'Tiếp tục mua sắm',
          onClick: () => navigate('/shop'),
        }}
      />
    </div>
  );
};
