import React, { useState } from 'react';
import {
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  CreditCardIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { CustomOrderProposal } from '../../types/message';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useForm } from '../../hooks/common/useForm';
import { formatPrice } from '../../utils/format';
import { getCustomOrderActions } from '../../utils/custom-order';

interface CustomOrderCardProps {
  proposal: CustomOrderProposal;
  negotiationId: string;
  status: string;
  customerId: string;
  artisanId: string;
  currentUserId: string;
  lastActor?: 'customer' | 'artisan';
  finalPrice?: number;
  onAccept?: (negotiationId: string, proposal: CustomOrderProposal) => void;
  onDecline?: (negotiationId: string, reason?: string) => void;
  onCounterOffer?: (
    negotiationId: string,
    data: {
      finalPrice: number;
      message: string;
      timeline?: string;
    },
  ) => void;
  loading?: boolean;
}

export const CustomOrderCard: React.FC<CustomOrderCardProps> = ({
  proposal,
  negotiationId,
  status,
  customerId,
  artisanId,
  currentUserId,
  lastActor,
  finalPrice,
  onAccept,
  onDecline,
  onCounterOffer,
  loading = false,
}) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);

  // Create mock order for permissions calculation
  const mockOrder = {
    customer: { id: customerId },
    artisan: { id: artisanId },
    status: status as any,
    negotiationHistory: lastActor
      ? [
          {
            actor: lastActor,
            timestamp: new Date().toISOString(),
            action: 'COUNTER_OFFER',
            data: {},
          },
        ]
      : [],
    expiresAt: null,
  } as any;

  const permissions = getCustomOrderActions(mockOrder, currentUserId);

  const {
    values: counterValues,
    handleChange: handleCounterChange,
    handleSubmit: handleCounterSubmit,
    errors: counterErrors,
  } = useForm({
    initialValues: {
      finalPrice: (finalPrice || proposal.estimatedPrice || 0).toString(),
      message: '',
      timeline: proposal.timeline || '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.finalPrice || isNaN(Number(values.finalPrice))) {
        errors.finalPrice = 'Vui lòng nhập giá hợp lệ';
      }
      if (Number(values.finalPrice) <= 0) {
        errors.finalPrice = 'Giá phải lớn hơn 0';
      }
      if (!values.message.trim()) {
        errors.message = 'Vui lòng nhập tin nhắn';
      }
      return errors;
    },
    onSubmit: async (data) => {
      onCounterOffer?.(negotiationId, {
        finalPrice: Number(data.finalPrice),
        message: data.message,
        timeline: data.timeline || undefined,
      });
      setShowCounterModal(false);
    },
  });

  const getStatusBadge = () => {
    const statusConfig = {
      pending: { variant: 'warning' as const, text: 'Chờ phản hồi' },
      accepted: { variant: 'success' as const, text: 'Đã chấp nhận' },
      rejected: { variant: 'danger' as const, text: 'Đã từ chối' },
      counter_offered: { variant: 'info' as const, text: 'Đang thương lượng' },
      expired: { variant: 'default' as const, text: 'Đã hết hạn' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <Badge variant={config.variant} size="sm">
        {config.text}
      </Badge>
    );
  };

  const displayPrice = finalPrice || proposal.estimatedPrice;
  const isCustomer = currentUserId === customerId;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 max-w-sm shadow-sm hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="p-2 bg-gradient-to-r from-orange-100 to-pink-100 rounded-lg mr-2">
              <WrenchScrewdriverIcon className="w-5 h-5 text-orange-500" />
            </div>
            <h4 className="font-semibold text-gray-900">Custom Order</h4>
          </div>
          {getStatusBadge()}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <h5 className="font-medium text-gray-900 line-clamp-1">
              {proposal.title}
            </h5>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {proposal.description}
            </p>
          </div>

          {/* Price & Timeline */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {displayPrice && (
              <div className="flex items-center space-x-1">
                <CurrencyDollarIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-gray-600">Giá:</span>
                  <div className="font-medium text-green-600">
                    {formatPrice(displayPrice)}
                  </div>
                  {finalPrice && finalPrice !== proposal.estimatedPrice && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatPrice(proposal.estimatedPrice || 0)}
                    </div>
                  )}
                </div>
              </div>
            )}

            {proposal.timeline && (
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-gray-600 text-xs">Thời gian:</span>
                  <div className="font-medium text-xs">{proposal.timeline}</div>
                </div>
              </div>
            )}
          </div>

          {/* Specifications Preview */}
          {proposal.specifications &&
            Object.keys(proposal.specifications).length > 0 && (
              <div>
                <h6 className="text-sm font-medium text-gray-700 mb-1">
                  Yêu cầu kỹ thuật:
                </h6>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                  {Object.entries(proposal.specifications)
                    .filter(([_, value]) => value)
                    .slice(0, 2) // Show only first 2 specs
                    .map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
                  {Object.keys(proposal.specifications).length > 2 && (
                    <div className="text-gray-500">...</div>
                  )}
                </div>
              </div>
            )}

          {/* Status Message */}
          {permissions.message && (
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
              💡 {permissions.message}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
          {/* Accept Button */}
          {permissions.canAccept && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => onAccept?.(negotiationId, proposal)}
              disabled={loading}
              leftIcon={<CheckIcon className="w-4 h-4" />}
              className="bg-green-600 hover:bg-green-700"
            >
              Chấp nhận
            </Button>
          )}

          {/* Counter Offer Button */}
          {permissions.canCounterOffer && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCounterModal(true)}
              disabled={loading}
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Đề xuất lại
            </Button>
          )}

          {/* Decline Button */}
          {permissions.canReject && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDeclineModal(true)}
              disabled={loading}
              leftIcon={<XMarkIcon className="w-4 h-4" />}
              className="text-red-600 hover:bg-red-50"
            >
              Từ chối
            </Button>
          )}

          {/* Payment Button - Only for customer when accepted */}
          {permissions.canProceedToPayment && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                window.location.href = `/checkout?customOrderId=${negotiationId}`;
              }}
              leftIcon={<CreditCardIcon className="w-4 h-4" />}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Thanh toán
            </Button>
          )}

          {/* View Details Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              window.open(`/custom-orders/${negotiationId}`, '_blank');
            }}
            leftIcon={<EyeIcon className="w-4 h-4" />}
            className="text-gray-600 hover:bg-gray-50"
          >
            Chi tiết
          </Button>
        </div>
      </div>

      {/* Decline Modal */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="Từ chối đề xuất"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            onDecline?.(negotiationId, formData.get('reason') as string);
            setShowDeclineModal(false);
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do từ chối (tùy chọn)
            </label>
            <textarea
              name="reason"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Nhập lý do từ chối để giúp đối phương hiểu rõ hơn..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeclineModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={loading}
              leftIcon={<XMarkIcon className="w-4 h-4" />}
            >
              Từ chối
            </Button>
          </div>
        </form>
      </Modal>

      {/* Counter Offer Modal */}
      <Modal
        isOpen={showCounterModal}
        onClose={() => setShowCounterModal(false)}
        title="Đề xuất giá mới"
        size="md"
      >
        <form onSubmit={handleCounterSubmit}>
          <div className="space-y-4">
            {/* Current Price Display */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Giá hiện tại:</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(displayPrice || 0)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá đề xuất mới (VNĐ) *
              </label>
              <input
                type="number"
                name="finalPrice"
                value={counterValues.finalPrice}
                onChange={handleCounterChange}
                placeholder="Nhập giá đề xuất"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
                min="1"
                step="1000"
              />
              {counterErrors.finalPrice && (
                <p className="text-sm text-red-600 mt-1">
                  {counterErrors.finalPrice}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian thực hiện
              </label>
              <input
                type="text"
                name="timeline"
                value={counterValues.timeline}
                onChange={handleCounterChange}
                placeholder="VD: 2-3 tuần, 1 tháng..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tin nhắn giải thích *
              </label>
              <textarea
                name="message"
                rows={3}
                value={counterValues.message}
                onChange={handleCounterChange}
                placeholder="Giải thích lý do thay đổi giá hoặc điều kiện..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
              {counterErrors.message && (
                <p className="text-sm text-red-600 mt-1">
                  {counterErrors.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCounterModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              loading={loading}
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
            >
              Gửi đề xuất
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
