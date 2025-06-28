import React, { useState } from 'react';
import {
  PriceNegotiationWithDetails,
  NegotiationStatus,
} from '../../types/price-negotiation';
import { useAuth } from '../../contexts/AuthContext';
import { CustomerResponseForm } from './CustomerResponseForm';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { ConfirmModal } from '../ui/Modal';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  TrashIcon,
  ShoppingCartIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';

interface ExistingNegotiationCardProps {
  negotiation: PriceNegotiationWithDetails;
  onCancel: (reason?: string) => Promise<void>;
  onCreateNew: () => void;
  onResponseSuccess?: () => void;
  canceling?: boolean;
}

export const ExistingNegotiationCard: React.FC<
  ExistingNegotiationCardProps
> = ({
  negotiation,
  onCancel,
  onCreateNew,
  onResponseSuccess,
  canceling = false,
}) => {
  const { state: authState } = useAuth();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // Check if current user is customer and can respond
  const isProductOwner = authState.user?.id === negotiation.product.seller.id;
  const isCustomer = authState.user?.id === negotiation.customer.id;

  const canRespond =
    isCustomer && negotiation.status === NegotiationStatus.COUNTER_OFFERED;

  const canAddToCart =
    isCustomer &&
    negotiation.status === NegotiationStatus.ACCEPTED &&
    !isProductOwner;

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
      [NegotiationStatus.COMPLETED]: {
        variant: 'success' as const,
        label: 'Đã hoàn thành',
        icon: CheckCircleIcon,
        description: 'Thương lượng đã được hoàn thành.',
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

  const handleResponseSuccess = () => {
    setShowResponseForm(false);
    onResponseSuccess?.();
  };

  const handleCancel = async () => {
    try {
      await onCancel(cancelReason);
      setShowCancelModal(false);
      setCancelReason('');
    } catch (error) {
      // Error handled by parent
    }
  };

  // NEW: Get display images based on variant or product
  const displayImages = negotiation.variant?.images.length
    ? negotiation.variant.images
    : negotiation.product.images;

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

        {/* Product info with variant */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <div className="flex items-start space-x-3 mb-3">
            <img
              src={displayImages[0]}
              alt={negotiation.product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">
                {negotiation.product.name}
              </h4>

              {/* NEW: Variant information */}
              {negotiation.variant && (
                <div className="mt-1">
                  <div className="flex items-center gap-1 text-sm text-blue-700">
                    <SwatchIcon className="w-3 h-3" />
                    <span>
                      Tùy chọn: {negotiation.variant.name || 'Biến thể'}
                    </span>
                  </div>
                  {Object.keys(negotiation.variant.attributes).length > 0 && (
                    <div className="text-xs text-gray-600 mt-1">
                      {Object.entries(negotiation.variant.attributes)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

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

        {/* NEW: Customer Response Section */}
        {canRespond && !showResponseForm && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">
                  Nghệ nhân đã phản hồi!
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Họ đề nghị giá {formatPrice(negotiation.proposedPrice)}. Bạn
                  muốn phản hồi như thế nào?
                </p>
              </div>
              <Button
                onClick={() => setShowResponseForm(true)}
                size="sm"
                leftIcon={<ArrowPathIcon className="w-4 h-4" />}
              >
                Phản hồi ngay
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={
              () => window.open(`/negotiations/${negotiation.id}`, '_blank') // Open in new tab
            }
            leftIcon={<EyeIcon className="w-4 h-4" />}
            variant="outline"
            className="flex-1"
          >
            Xem chi tiết
          </Button>

          {canAddToCart && (
            <Button
              leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
              className="flex-1"
            >
              Thêm vào giỏ
            </Button>
          )}

          {/* Show message for product owner */}
          {isProductOwner &&
            negotiation.status === NegotiationStatus.ACCEPTED && (
              <div className="flex-1 p-2 bg-gray-50 rounded-lg border text-center">
                <p className="text-xs text-gray-600">
                  Khách hàng sẽ mua sản phẩm của bạn với giá{' '}
                  {formatPrice(Number(negotiation.finalPrice))}.
                </p>
              </div>
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

      {/* NEW: Customer Response Form */}
      {showResponseForm && (
        <CustomerResponseForm
          negotiation={negotiation}
          onSuccess={handleResponseSuccess}
          onCancel={() => setShowResponseForm(false)}
        />
      )}

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
