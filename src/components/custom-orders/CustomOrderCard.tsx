import React, { useState } from 'react';
import {
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
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
  isOwn: boolean;
  currentUserRole: string;
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
  isOwn,
  currentUserRole,
  onAccept,
  onDecline,
  onCounterOffer,
  loading = false,
}) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);

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
  } = useForm({
    initialValues: {
      finalPrice: proposal.estimatedPrice?.toString() || '',
      message: '',
      timeline: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.finalPrice || isNaN(Number(values.finalPrice))) {
        errors.finalPrice = 'Vui lòng nhập giá hợp lệ';
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

  const getStatusColor = () => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'declined':
      case 'rejected':
        return 'danger';
      case 'negotiating':
      case 'counter_offered':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Chờ phản hồi';
      case 'accepted':
        return 'Đã chấp nhận';
      case 'declined':
      case 'rejected':
        return 'Đã từ chối';
      case 'negotiating':
      case 'counter_offered':
        return 'Đang thương lượng';
      default:
        return 'Không xác định';
    }
  };

  // Determine what actions to show
  const showAcceptButton =
    !isOwn &&
    (status === 'pending' || status === 'counter_offered') &&
    ((currentUserRole === 'ARTISAN' && status === 'pending') ||
      (currentUserRole === 'CUSTOMER' && status === 'counter_offered'));

  const showDeclineButton =
    !isOwn && (status === 'pending' || status === 'counter_offered');

  const showCounterButton =
    !isOwn && (status === 'pending' || status === 'counter_offered');

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm shadow-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <WrenchScrewdriverIcon className="w-5 h-5 text-blue-500 mr-2" />
            <h4 className="font-semibold text-gray-900">Custom Order</h4>
          </div>
          <Badge variant={getStatusColor() as any} size="sm">
            {getStatusText()}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <h5 className="font-medium text-gray-900">{proposal.title}</h5>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {proposal.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {proposal.estimatedPrice && (
              <div className="flex items-center">
                <CurrencyDollarIcon className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-gray-600">Giá:</span>
                <span className="font-medium ml-1">
                  {formatPrice(proposal.estimatedPrice)}
                </span>
              </div>
            )}
            {proposal.timeline && (
              <div className="flex items-center">
                <ClockIcon className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-gray-600">Thời gian:</span>
                <span className="font-medium ml-1">{proposal.timeline}</span>
              </div>
            )}
          </div>

          {proposal.specifications && (
            <div>
              <h6 className="text-sm font-medium text-gray-700 mb-1">
                Yêu cầu:
              </h6>
              <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                {typeof proposal.specifications === 'string'
                  ? proposal.specifications
                  : JSON.stringify(proposal.specifications)}
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {(showAcceptButton || showDeclineButton || showCounterButton) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t">
            {showAcceptButton && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onAccept?.(negotiationId, proposal)}
                disabled={loading}
                leftIcon={<CheckIcon className="w-4 h-4" />}
              >
                Chấp nhận
              </Button>
            )}

            {showCounterButton && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowCounterModal(true)}
                disabled={loading}
                leftIcon={<ArrowPathIcon className="w-4 h-4" />}
              >
                Đề xuất ngược
              </Button>
            )}

            {showDeclineButton && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeclineModal(true)}
                disabled={loading}
                leftIcon={<XMarkIcon className="w-4 h-4" />}
              >
                Từ chối
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
      >
        <form onSubmit={handleDeclineSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do từ chối (tùy chọn)
            </label>
            <textarea
              name="reason"
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Nhập lý do từ chối..."
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
            <Button type="submit" variant="danger" loading={loading}>
              Từ chối
            </Button>
          </div>
        </form>
      </Modal>

      {/* Counter Offer Modal */}
      <Modal
        isOpen={showCounterModal}
        onClose={() => setShowCounterModal(false)}
        title="Đề xuất ngược"
        size="md"
      >
        <form onSubmit={handleCounterSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá đề xuất (VNĐ) *
              </label>
              <Input
                type="number"
                name="finalPrice"
                value={counterValues.finalPrice}
                onChange={handleCounterChange}
                placeholder="Nhập giá đề xuất"
                error={counterErrors.finalPrice}
                required
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
                placeholder="VD: 2-3 tuần"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tin nhắn *
              </label>
              <textarea
                name="message"
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Giải thích về đề xuất của bạn..."
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
            <Button type="submit" loading={loading}>
              Gửi đề xuất
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
