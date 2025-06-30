import React, { useState } from 'react';
import {
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline';
import { CustomOrderProposal } from '../../types/message';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useForm } from '../../hooks/common/useForm';
import { formatPrice } from '../../utils/format';

interface CustomOrderCardProps {
  proposal: CustomOrderProposal;
  negotiationId: string;
  status: string;
  customerId: string;
  artisanId: string;
  currentUserId: string;
  // Thêm thông tin về ai là người thao tác cuối
  lastActor?: 'customer' | 'artisan';
  finalPrice?: number; // Giá cuối cùng nếu có counter offer
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

  // Xác định vai trò của user hiện tại
  const isCustomer = currentUserId === customerId;
  const isArtisan = currentUserId === artisanId;
  const isOwn = isCustomer; // Người tạo custom order ban đầu

  // Logic xác định ai có thể thao tác
  const getActionPermissions = () => {
    switch (status) {
      case 'pending':
        // Custom order mới - chỉ artisan mới được phản hồi
        return {
          canAccept: isArtisan,
          canDecline: isArtisan,
          canCounter: isArtisan,
          message: isArtisan
            ? 'Bạn có thể phản hồi yêu cầu'
            : 'Đang chờ nghệ nhân phản hồi',
        };

      case 'counter_offered':
        // Có counter offer - ai nhận counter offer thì được phản hồi
        // Logic: nếu lastActor là artisan thì customer phản hồi, và ngược lại
        const canCustomerRespond = lastActor === 'artisan';
        const canArtisanRespond = lastActor === 'customer';

        return {
          canAccept:
            (isCustomer && canCustomerRespond) ||
            (isArtisan && canArtisanRespond),
          canDecline:
            (isCustomer && canCustomerRespond) ||
            (isArtisan && canArtisanRespond),
          canCounter:
            (isCustomer && canCustomerRespond) ||
            (isArtisan && canArtisanRespond),
          message:
            isCustomer && canCustomerRespond
              ? 'Nghệ nhân đã gửi đề xuất ngược'
              : isArtisan && canArtisanRespond
              ? 'Khách hàng đã gửi đề xuất ngược'
              : 'Đang chờ phản hồi từ đối phương',
        };

      case 'accepted':
        return {
          canPayment: isCustomer,
          message: 'Đã chấp nhận - có thể thanh toán',
        };

      case 'rejected':
        return {
          message: 'Đã bị từ chối',
        };

      default:
        return {
          message: 'Trạng thái không xác định',
        };
    }
  };

  const permissions = getActionPermissions();

  const {
    values: declineValues,
    handleChange: handleDeclineChange,
    handleSubmit: handleDeclineSubmit,
  } = useForm({
    initialValues: { reason: '' },
    onSubmit: async (data) => {
      onDecline?.(negotiationId, data.reason);
      setShowDeclineModal(false);
    },
  });

  const {
    values: counterValues,
    handleChange: handleCounterChange,
    handleSubmit: handleCounterSubmit,
    errors: counterErrors,
    setFieldValue,
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

          {/* Specifications */}
          {proposal.specifications &&
            Object.keys(proposal.specifications).length > 0 && (
              <div>
                <h6 className="text-sm font-medium text-gray-700 mb-1">
                  Yêu cầu kỹ thuật:
                </h6>
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
                  {Object.entries(proposal.specifications)
                    .filter(([_, value]) => value)
                    .map(([key, value]) => (
                      <div key={key} className="mb-1">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
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
        {(permissions.canAccept ||
          permissions.canDecline ||
          permissions.canCounter ||
          permissions.canPayment) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-gray-100">
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

            {permissions.canCounter && (
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

            {permissions.canDecline && (
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

            {permissions.canPayment && (
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
          </div>
        )}
      </div>

      {/* Decline Modal */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="Từ chối đề xuất"
        size="md"
      >
        <form onSubmit={handleDeclineSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do từ chối (tùy chọn)
            </label>
            <textarea
              name="reason"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Nhập lý do từ chối để giúp đối phương hiểu rõ hơn..."
              value={declineValues.reason}
              onChange={handleDeclineChange}
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
              <Input
                type="number"
                name="finalPrice"
                value={counterValues.finalPrice}
                onChange={handleCounterChange}
                placeholder="Nhập giá đề xuất"
                error={counterErrors.finalPrice}
                required
                min="1"
                step="1000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian thực hiện
              </label>
              <Input
                type="text"
                name="timeline"
                value={counterValues.timeline}
                onChange={handleCounterChange}
                placeholder="VD: 2-3 tuần, 1 tháng..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tin nhắn giải thích *
              </label>
              <textarea
                name="message"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Giải thích lý do thay đổi giá hoặc điều kiện..."
                value={counterValues.message}
                onChange={handleCounterChange}
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
