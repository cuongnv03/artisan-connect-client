import React from 'react';
import { Link } from 'react-router-dom';
import {
  NegotiationSummary,
  NegotiationStatus,
} from '../../types/price-negotiation';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface NegotiationCardProps {
  negotiation: NegotiationSummary;
  userRole: 'CUSTOMER' | 'ARTISAN';
  showProduct?: boolean;
  showUser?: boolean;
  onClick?: () => void;
}

export const NegotiationCard: React.FC<NegotiationCardProps> = ({
  negotiation,
  userRole,
  showProduct = true,
  showUser = true,
  onClick,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getStatusConfig = (status: NegotiationStatus) => {
    const configs = {
      [NegotiationStatus.PENDING]: {
        variant: 'warning' as const,
        label: 'Chờ phản hồi',
        icon: ClockIcon,
      },
      [NegotiationStatus.COUNTER_OFFERED]: {
        variant: 'info' as const,
        label: 'Đề nghị mới',
        icon: ArrowPathIcon,
      },
      [NegotiationStatus.ACCEPTED]: {
        variant: 'success' as const,
        label: 'Đã chấp nhận',
        icon: CheckCircleIcon,
      },
      [NegotiationStatus.REJECTED]: {
        variant: 'danger' as const,
        label: 'Đã từ chối',
        icon: XCircleIcon,
      },
      [NegotiationStatus.EXPIRED]: {
        variant: 'secondary' as const,
        label: 'Đã hết hạn',
        icon: ClockIcon,
      },
      [NegotiationStatus.COMPLETED]: {
        variant: 'success' as const,
        label: 'Đã hoàn thành',
        icon: CheckCircleIcon,
      },
    };

    return configs[status];
  };

  const statusConfig = getStatusConfig(negotiation.status);
  const StatusIcon = statusConfig.icon;

  const isExpired =
    negotiation.expiresAt && new Date(negotiation.expiresAt) < new Date();
  const discountPercent = Math.round(
    ((negotiation.originalPrice - negotiation.proposedPrice) /
      negotiation.originalPrice) *
      100,
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Card
      className={`p-6 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start space-x-4">
        {/* Product Image */}
        {showProduct && negotiation.productImages?.[0] && (
          <div className="flex-shrink-0">
            <img
              src={negotiation.productImages[0]}
              alt={negotiation.productName}
              className="w-16 h-16 rounded-lg object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              {showProduct && (
                <h3 className="font-medium text-gray-900 line-clamp-1">
                  {negotiation.productName}
                </h3>
              )}

              {/* User Info */}
              {showUser &&
                (userRole === 'CUSTOMER'
                  ? negotiation.artisan
                  : negotiation.customer) && (
                  <div className="flex items-center mt-1">
                    <span className="text-sm text-gray-600 mr-2">
                      {userRole === 'CUSTOMER' ? 'Nghệ nhân:' : 'Khách hàng:'}
                    </span>
                    <span className="text-sm font-medium">
                      {userRole === 'CUSTOMER'
                        ? negotiation.artisan?.name
                        : negotiation.customer?.name}
                    </span>
                  </div>
                )}
            </div>

            <div className="flex items-center space-x-2">
              <Badge variant={statusConfig.variant}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {statusConfig.label}
              </Badge>
            </div>
          </div>

          {/* Price Info */}
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Giá gốc:</span>
                <p className="font-medium">
                  {formatPrice(negotiation.originalPrice)}
                </p>
              </div>
              <div>
                <span className="text-gray-600">Giá đề nghị:</span>
                <p className="font-medium text-primary">
                  {formatPrice(negotiation.proposedPrice)}
                </p>
              </div>
            </div>

            {negotiation.finalPrice && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Giá thỏa thuận:</span>
                <p className="font-bold text-green-600">
                  {formatPrice(negotiation.finalPrice)}
                </p>
              </div>
            )}

            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Số lượng: {negotiation.quantity}
              </span>
              {discountPercent > 0 && (
                <Badge variant="success" size="sm">
                  -{discountPercent}%
                </Badge>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              <span>
                Tạo:{' '}
                {new Date(negotiation.createdAt).toLocaleDateString('vi-VN')}
              </span>
              {negotiation.expiresAt && (
                <span className={`ml-3 ${isExpired ? 'text-red-600' : ''}`}>
                  Hết hạn:{' '}
                  {new Date(negotiation.expiresAt).toLocaleDateString('vi-VN')}
                </span>
              )}
            </div>

            <Link
              to={`/negotiations/${negotiation.id}`}
              onClick={(e) => e.stopPropagation()}
            >
              <Badge
                variant="secondary"
                className="cursor-pointer hover:bg-gray-300"
              >
                <EyeIcon className="w-3 h-3 mr-1" />
                Chi tiết
              </Badge>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
};
