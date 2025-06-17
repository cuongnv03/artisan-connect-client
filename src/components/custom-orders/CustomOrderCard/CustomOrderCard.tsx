import React, { useState } from 'react';
import {
  WrenchScrewdriverIcon,
  CurrencyDollarIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { CustomOrderProposal } from '../../../types/message';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Modal } from '../../ui/Modal';
import { useForm } from '../../../hooks/common/useForm';

interface CustomOrderCardProps {
  proposal: CustomOrderProposal;
  negotiationId: string;
  status: string;
  isOwn: boolean;
  onAccept?: (negotiationId: string, proposal: CustomOrderProposal) => void;
  onDecline?: (negotiationId: string, reason?: string) => void;
  onRequestChanges?: (negotiationId: string, changes: string) => void;
  loading?: boolean;
}

export const CustomOrderCard: React.FC<CustomOrderCardProps> = ({
  proposal,
  negotiationId,
  status,
  isOwn,
  onAccept,
  onDecline,
  onRequestChanges,
  loading = false,
}) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);

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
    values: changesValues,
    handleChange: handleChangesChange,
    handleSubmit: handleChangesSubmit,
  } = useForm({
    initialValues: { changes: '' },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.changes.trim()) {
        errors.changes = 'Vui lòng mô tả thay đổi mong muốn';
      }
      return errors;
    },
    onSubmit: async (data) => {
      onRequestChanges?.(negotiationId, data.changes);
      setShowChangesModal(false);
    },
  });

  const getStatusColor = () => {
    switch (status) {
      case 'accepted':
        return 'success';
      case 'declined':
        return 'danger';
      case 'negotiating':
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
        return 'Đã từ chối';
      case 'negotiating':
        return 'Đang thương lượng';
      default:
        return 'Không xác định';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 max-w-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <WrenchScrewdriverIcon className="w-5 h-5 text-blue-500 mr-2" />
          <h4 className="font-semibold text-gray-900">Đề xuất Custom Order</h4>
        </div>
        <Badge variant={getStatusColor() as any} size="sm">
          {getStatusText()}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <h5 className="font-medium text-gray-900">{proposal.productName}</h5>
          <p className="text-sm text-gray-600 mt-1">{proposal.description}</p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center">
            <CurrencyDollarIcon className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-gray-600">Giá:</span>
            <span className="font-medium ml-1">
              {formatPrice(proposal.estimatedPrice)}
            </span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 text-blue-500 mr-1" />
            <span className="text-gray-600">Thời gian:</span>
            <span className="font-medium ml-1">{proposal.timeline}</span>
          </div>
        </div>

        {proposal.specifications && (
          <div>
            <h6 className="text-sm font-medium text-gray-700 mb-1">Yêu cầu:</h6>
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              {typeof proposal.specifications === 'string'
                ? proposal.specifications
                : JSON.stringify(proposal.specifications)}
            </div>
          </div>
        )}

        {proposal.deadline && (
          <div className="text-xs text-gray-500">
            Hạn phản hồi:{' '}
            {new Date(proposal.deadline).toLocaleDateString('vi-VN')}
          </div>
        )}
      </div>

      {/* Action buttons - chỉ hiện cho người nhận và khi status là pending */}
      {!isOwn && status === 'pending' && (
        <div className="flex space-x-2 mt-4">
          <Button
            size="sm"
            variant="primary"
            onClick={() => onAccept?.(negotiationId, proposal)}
            disabled={loading}
            leftIcon={<CheckIcon className="w-4 h-4" />}
          >
            Chấp nhận
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDeclineModal(true)}
            disabled={loading}
            leftIcon={<XMarkIcon className="w-4 h-4" />}
          >
            Từ chối
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowChangesModal(true)}
            disabled={loading}
            leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
          >
            Thương lượng
          </Button>
        </div>
      )}

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
            <Button type="submit" variant="danger">
              Từ chối
            </Button>
          </div>
        </form>
      </Modal>

      {/* Request Changes Modal */}
      <Modal
        isOpen={showChangesModal}
        onClose={() => setShowChangesModal(false)}
        title="Yêu cầu thay đổi"
      >
        <form onSubmit={handleChangesSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thay đổi mong muốn *
            </label>
            <textarea
              name="changes"
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Mô tả chi tiết những thay đổi bạn muốn..."
              value={changesValues.changes}
              onChange={handleChangesChange}
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowChangesModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary">
              Gửi yêu cầu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
