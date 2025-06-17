import React from 'react';
import { Link } from 'react-router-dom';
import {
  PriceNegotiationWithDetails,
  NegotiationStatus,
} from '../../../../types/price-negotiation';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import {
  HandshakeIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  EyeIcon,
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
        description:
          userRole === 'CUSTOMER'
            ? 'Nghệ nhân đang xem xét yêu cầu của bạn'
            : 'Bạn có yêu cầu thương lượng mới cần phản hồi',
      },
      [NegotiationStatus.COUNTER_OFFERED]: {
        variant: 'info' as const,
        label: 'Đề nghị mới',
        icon: ArrowPathIcon,
        description:
          userRole === 'CUSTOMER'
            ? 'Nghệ nhân đã gửi đề nghị giá mới'
            : 'Bạn đã gửi đề nghị giá mới',
      },
      [NegotiationStatus.ACCEPTED]: {
        variant: 'success' as const,
        label: 'Đã chấp nhận',
        icon: CheckCircleIcon,
        description:
          'Thương lượng thành công! Bạn có thể thêm vào giỏ hàng với giá đã thỏa thuận',
      },
      [NegotiationStatus.REJECTED]: {
        variant: 'danger' as const,
        label: 'Đã từ chối',
        icon: XCircleIcon,
        description: 'Yêu cầu thương lượng đã bị từ chối',
      },
      [NegotiationStatus.EXPIRED]: {
        variant: 'secondary' as const,
        label: 'Đã hết hạn',
        icon: ClockIcon,
        description: 'Yêu cầu thương lượng đã hết hạn',
      },
      [NegotiationStatus.COMPLETED]: {
        variant: 'success' as const,
        label: 'Đã hoàn thành',
        icon: CheckCircleIcon,
        description: 'Thương lượng đã hoàn thành và sản phẩm đã được mua',
      },
    };

    return configs[status];
  };

  const statusConfig = getStatusConfig(negotiation.status);
  const StatusIcon = statusConfig.icon;

  const isExpired =
    negotiation.expiresAt && new Date(negotiation.expiresAt) < new Date();
  const canCancel =
    [NegotiationStatus.PENDING, NegotiationStatus.COUNTER_OFFERED].includes(
      negotiation.status,
    ) && !isExpired;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <HandshakeIcon className="w-5 h-5 text-primary mr-2" />
          <h4 className="font-semibold text-gray-900">Thương lượng giá</h4>
        </div>
        <div className="flex items-center space-x-2">
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Làm mới
            </Button>
          )}
          <Link to={`/negotiations/${negotiation.id}`}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<EyeIcon className="w-4 h-4" />}
            >
              Chi tiết
            </Button>
          </Link>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center mb-4">
        <StatusIcon className="w-5 h-5 mr-2" />
        <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        <span className="ml-2 text-sm text-gray-600">
          {statusConfig.description}
        </span>
      </div>

      {/* Price Info */}
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600">Giá gốc:</span>
            <p className="font-medium">
              {formatPrice(negotiation.originalPrice)}
            </p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Giá đề nghị:</span>
            <p className="font-medium text-primary">
              {formatPrice(negotiation.proposedPrice)}
            </p>
          </div>
          {negotiation.finalPrice && (
            <div className="col-span-2">
              <span className="text-sm text-gray-600">Giá thỏa thuận:</span>
              <p className="font-bold text-green-600">
                {formatPrice(negotiation.finalPrice)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Số lượng:</span>
            <span>{negotiation.quantity}</span>
          </div>
          {negotiation.expiresAt && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Hết hạn:</span>
              <span className={isExpired ? 'text-red-600' : 'text-gray-900'}>
                {new Date(negotiation.expiresAt).toLocaleString('vi-VN')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Customer Reason */}
      {negotiation.customerReason && (
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700">
            Lý do thương lượng:
          </span>
          <p className="text-sm text-gray-600 mt-1">
            {negotiation.customerReason}
          </p>
        </div>
      )}

      {/* Artisan Response */}
      {negotiation.artisanResponse && (
        <div className="mb-4">
          <span className="text-sm font-medium text-gray-700">
            Phản hồi từ nghệ nhân:
          </span>
          <p className="text-sm text-gray-600 mt-1">
            {negotiation.artisanResponse}
          </p>
        </div>
      )}

      {/* Actions */}
      {canCancel && userRole === 'CUSTOMER' && onCancel && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            Hủy thương lượng
          </Button>
        </div>
      )}
    </Card>
  );
};
