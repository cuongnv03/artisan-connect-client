import React from 'react';
import {
  PriceNegotiationWithDetails,
  NegotiationStatus,
} from '../../../../types/price-negotiation';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { Card } from '../../../ui/Card';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';

interface PriceNegotiationStatusProps {
  negotiation: PriceNegotiationWithDetails;
  userRole: 'CUSTOMER' | 'ARTISAN';
  onCancel?: () => void;
  onRefresh?: () => void;
}

export const PriceNegotiationStatus: React.FC<PriceNegotiationStatusProps> = ({
  negotiation,
  userRole,
  onCancel,
  onRefresh,
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
        color: 'yellow',
      },
      [NegotiationStatus.COUNTER_OFFERED]: {
        variant: 'info' as const,
        label: 'Đề nghị mới',
        icon: ArrowPathIcon,
        color: 'blue',
      },
      [NegotiationStatus.ACCEPTED]: {
        variant: 'success' as const,
        label: 'Đã chấp nhận',
        icon: CheckCircleIcon,
        color: 'green',
      },
      [NegotiationStatus.REJECTED]: {
        variant: 'danger' as const,
        label: 'Đã từ chối',
        icon: XCircleIcon,
        color: 'red',
      },
      [NegotiationStatus.EXPIRED]: {
        variant: 'secondary' as const,
        label: 'Đã hết hạn',
        icon: ClockIcon,
        color: 'gray',
      },
      [NegotiationStatus.COMPLETED]: {
        variant: 'success' as const,
        label: 'Đã hoàn thành',
        icon: CheckCircleIcon,
        color: 'green',
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

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Trạng thái thương lượng
        </h3>
        <Badge variant={statusConfig.variant}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig.label}
        </Badge>
      </div>

      {/* Price Comparison */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
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
          <div className="mt-3 pt-3 border-t border-gray-200">
            <span className="text-sm text-gray-600">Giá thỏa thuận:</span>
            <p className="font-bold text-green-600 text-lg">
              {formatPrice(negotiation.finalPrice)}
            </p>
          </div>
        )}

        <div className="mt-3 flex items-center justify-between">
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

      {/* Customer Reason */}
      {negotiation.customerReason && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">
            Lý do thương lượng:
          </h4>
          <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
            {negotiation.customerReason}
          </p>
        </div>
      )}

      {/* Artisan Response */}
      {negotiation.artisanResponse && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-1">
            Phản hồi từ nghệ nhân:
          </h4>
          <p className="text-sm text-gray-600 bg-green-50 p-3 rounded-lg">
            {negotiation.artisanResponse}
          </p>
        </div>
      )}

      {/* Expiration Warning */}
      {negotiation.expiresAt && !isExpired && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 text-yellow-600 mr-2" />
            <span className="text-sm text-yellow-800">
              Hết hạn: {new Date(negotiation.expiresAt).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-3">
        {negotiation.status === NegotiationStatus.ACCEPTED &&
          userRole === 'CUSTOMER' && (
            <Button
              leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
              className="flex-1"
            >
              Thêm vào giỏ hàng
            </Button>
          )}

        {[
          NegotiationStatus.PENDING,
          NegotiationStatus.COUNTER_OFFERED,
        ].includes(negotiation.status) &&
          onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Hủy thương lượng
            </Button>
          )}

        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            Làm mới
          </Button>
        )}
      </div>
    </Card>
  );
};
