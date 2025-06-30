import React from 'react';
import {
  CustomOrderWithDetails,
  QuoteStatus,
} from '../../../types/custom-order';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Avatar } from '../../ui/Avatar';
import { formatPrice, formatRelativeTime } from '../../../utils/format';

interface CustomOrderListItemProps {
  order: CustomOrderWithDetails;
  userRole: string;
  onClick: () => void;
}

export const CustomOrderListItem: React.FC<CustomOrderListItemProps> = ({
  order,
  userRole,
  onClick,
}) => {
  const getStatusBadge = (status: QuoteStatus) => {
    const statusConfig = {
      PENDING: { variant: 'warning' as const, text: 'Chờ phản hồi' },
      ACCEPTED: { variant: 'success' as const, text: 'Đã chấp nhận' },
      REJECTED: { variant: 'danger' as const, text: 'Đã từ chối' },
      COUNTER_OFFERED: { variant: 'info' as const, text: 'Đề xuất ngược' },
      EXPIRED: { variant: 'default' as const, text: 'Đã hết hạn' },
      COMPLETED: { variant: 'success' as const, text: 'Đã hoàn thành' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const partner = userRole === 'CUSTOMER' ? order.artisan : order.customer;
  const isOwn = userRole === 'CUSTOMER';

  return (
    <Card
      className={`p-6 hover:shadow-md transition-shadow cursor-pointer ${
        !isOwn && order.status === 'PENDING'
          ? 'border-l-4 border-l-primary'
          : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4 flex-1">
          <Avatar
            src={partner.avatarUrl}
            alt={`${partner.firstName} ${partner.lastName}`}
            size="md"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {order.title}
              </h3>
              {getStatusBadge(order.status)}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <span>
                {userRole === 'CUSTOMER' ? 'Nghệ nhân' : 'Khách hàng'}:{' '}
                {partner.firstName} {partner.lastName}
              </span>
              <span>•</span>
              <span>{formatRelativeTime(order.createdAt)}</span>
            </div>

            <p className="text-gray-700 line-clamp-2 mb-3">
              {order.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm">
                {order.estimatedPrice && (
                  <span>
                    Giá ước tính:{' '}
                    <strong>{formatPrice(order.estimatedPrice)}</strong>
                  </span>
                )}
                {order.finalPrice && (
                  <span>
                    Giá cuối:{' '}
                    <strong className="text-primary">
                      {formatPrice(order.finalPrice)}
                    </strong>
                  </span>
                )}
                {order.timeline && <span>Thời gian: {order.timeline}</span>}
              </div>

              {order.expiresAt && new Date(order.expiresAt) > new Date() && (
                <span className="text-xs text-orange-600">
                  Hết hạn {formatRelativeTime(order.expiresAt)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {order.referenceProduct && (
        <div className="border-t pt-3 mt-3">
          <div className="flex items-center space-x-3">
            <img
              src={order.referenceProduct.images[0]}
              alt={order.referenceProduct.name}
              className="w-12 h-12 object-cover rounded"
            />
            <div>
              <p className="text-sm font-medium">Sản phẩm tham khảo:</p>
              <p className="text-sm text-gray-600">
                {order.referenceProduct.name}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
