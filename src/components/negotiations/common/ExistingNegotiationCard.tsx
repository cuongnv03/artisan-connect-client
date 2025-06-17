import React, { useState } from 'react';
import {
  PriceNegotiationWithDetails,
  NegotiationStatus,
} from '../../../types/price-negotiation';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { ConfirmModal } from '../../ui/Modal';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  TrashIcon,
  ShoppingCartIcon,
} from '@heroicons/react/24/outline';

interface ExistingNegotiationCardProps {
  negotiation: PriceNegotiationWithDetails;
  onCancel: (reason?: string) => Promise<void>;
  onCreateNew: () => void;
  canceling?: boolean;
}

export const ExistingNegotiationCard: React.FC<
  ExistingNegotiationCardProps
> = ({ negotiation, onCancel, onCreateNew, canceling = false }) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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
        description: 'Nghệ nhân chưa phản hồi yêu cầu của bạn',
      },
      [NegotiationStatus.COUNTER_OFFERED]: {
        variant: 'info' as const,
        label: 'Có đề nghị mới',
        icon: ArrowPathIcon,
        description: 'Nghệ nhân đã gửi đề nghị mới cho bạn',
      },
      [NegotiationStatus.ACCEPTED]: {
        variant: 'success' as const,
        label: 'Đã chấp nhận',
        icon: CheckCircleIcon,
        description: 'Thương lượng thành công! Bạn có thể thêm vào giỏ hàng.',
      },
      [NegotiationStatus.REJECTED]: {
        variant: 'danger' as const,
        label: 'Đã từ chối',
        icon: XCircleIcon,
        description: 'Nghệ nhân đã từ chối yêu cầu của bạn',
      },
      [NegotiationStatus.EXPIRED]: {
        variant: 'secondary' as const,
        label: 'Đã hết hạn',
        icon: ClockIcon,
        description: 'Thời hạn thương lượng đã kết thúc',
      },
    };
    return configs[status] || configs[NegotiationStatus.PENDING];
  };

  const statusConfig = getStatusConfig(negotiation.status);
  const StatusIcon = statusConfig.icon;

  const discountPercent = Math.round(
    ((negotiation.originalPrice - negotiation.proposedPrice) /
      negotiation.originalPrice) *
      100,
  );

  const isExpired =
    negotiation.expiresAt && new Date(negotiation.expiresAt) < new Date();
  const canCancel = [
    NegotiationStatus.PENDING,
    NegotiationStatus.COUNTER_OFFERED,
  ].includes(negotiation.status);
  const canCreateNew = [
    NegotiationStatus.REJECTED,
    NegotiationStatus.EXPIRED,
  ].includes(negotiation.status);

  const handleCancel = async () => {
    try {
      await onCancel(cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error) {
      // Error handled by parent
    }
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Thương lượng hiện tại
          </h3>
          <Badge variant={statusConfig.variant}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>

        <p className="text-sm text-gray-600 mb-4">{statusConfig.description}</p>

        {/* Price info */}
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

        {/* Artisan response */}
        {negotiation.artisanResponse && (
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <h4 className="text-sm font-medium text-blue-900 mb-1">
              Phản hồi từ nghệ nhân:
            </h4>
            <p className="text-sm text-blue-700">
              {negotiation.artisanResponse}
            </p>
          </div>
        )}

        {/* Expiration warning */}
        {negotiation.expiresAt && !isExpired && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center">
              <ClockIcon className="w-4 h-4 text-yellow-600 mr-2" />
              <span className="text-sm text-yellow-800">
                Hết hạn:{' '}
                {new Date(negotiation.expiresAt).toLocaleString('vi-VN')}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={() =>
              window.open(`/negotiations/${negotiation.id}`, '_blank')
            }
            leftIcon={<EyeIcon className="w-4 h-4" />}
            variant="outline"
            className="flex-1"
          >
            Xem chi tiết
          </Button>

          {negotiation.status === NegotiationStatus.ACCEPTED && (
            <Button
              leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
              className="flex-1"
            >
              Thêm vào giỏ
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(true)}
              leftIcon={<TrashIcon className="w-4 h-4" />}
              disabled={canceling}
            >
              Hủy
            </Button>
          )}

          {canCreateNew && (
            <Button
              onClick={onCreateNew}
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
              className="flex-1"
            >
              Thương lượng lại
            </Button>
          )}
        </div>
      </Card>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Hủy thương lượng"
        message="Bạn có chắc chắn muốn hủy thương lượng này?"
        confirmText="Hủy thương lượng"
        cancelText="Không"
        type="danger"
        loading={canceling}
      />
    </>
  );
};
