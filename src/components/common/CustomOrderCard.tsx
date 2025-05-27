import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { formatPrice } from '../../utils/format';
import {
  CheckIcon,
  XMarkIcon,
  PencilIcon,
  ClockIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  ShoppingCartIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

interface CustomOrderProposal {
  productName: string;
  description: string;
  estimatedPrice: number;
  estimatedDuration: string;
  specifications?: Record<string, string>;
  materials?: string[];
  dimensions?: string;
  colorPreferences?: string[];
  deadline?: string;
}

interface CustomOrderCardProps {
  proposal: CustomOrderProposal;
  negotiationId: string;
  status: string;
  isOwn: boolean;
  userRole: string;
  onAccept?: (negotiationId: string, proposal: CustomOrderProposal) => void;
  onDecline?: (negotiationId: string, reason?: string) => void;
  onEdit?: (negotiationId: string) => void;
  onRequestChanges?: (negotiationId: string, changes: string) => void;
  loading?: boolean;
}

export const CustomOrderCard: React.FC<CustomOrderCardProps> = ({
  proposal,
  negotiationId,
  status,
  isOwn,
  userRole,
  onAccept,
  onDecline,
  onEdit,
  onRequestChanges,
  loading = false,
}) => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [requestedChanges, setRequestedChanges] = useState('');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          variant: 'warning' as const,
          text: 'Chờ phản hồi',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
        };
      case 'accepted':
        return {
          variant: 'success' as const,
          text: 'Đã chấp nhận',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
        };
      case 'declined':
        return {
          variant: 'danger' as const,
          text: 'Đã từ chối',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
        };
      case 'negotiating':
        return {
          variant: 'info' as const,
          text: 'Đang đàm phán',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
        };
      default:
        return {
          variant: 'default' as const,
          text: 'Chưa xác định',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
        };
    }
  };

  const statusConfig = getStatusConfig(status);

  // Cập nhật để reactive với status changes
  const currentStatus = status;

  const handleAccept = () => {
    onAccept?.(negotiationId, proposal);
  };

  const handleDecline = () => {
    onDecline?.(negotiationId, declineReason);
    setShowDeclineModal(false);
    setDeclineReason('');
  };

  const handleRequestChanges = () => {
    onRequestChanges?.(negotiationId, requestedChanges);
    setShowChangesModal(false);
    setRequestedChanges('');
  };

  const handleProceedToCheckout = () => {
    // Chuyển đến trang checkout với custom order data
    const customOrderData = {
      type: 'custom_order',
      negotiationId,
      proposal,
    };

    // Store data in sessionStorage để sử dụng trong checkout
    sessionStorage.setItem('customOrderData', JSON.stringify(customOrderData));
    navigate('/checkout');
  };

  return (
    <div
      className={`rounded-lg border-2 ${statusConfig.borderColor} ${statusConfig.bgColor} p-4 mt-2`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <ShoppingCartIcon className="w-5 h-5 text-gray-600" />
            <h4 className="font-semibold text-lg text-gray-900">
              Đề xuất Custom Order
            </h4>
            <Badge variant={statusConfig.variant} size="sm">
              {statusConfig.text}
            </Badge>
          </div>

          <h5 className="font-medium text-gray-800 mb-1">
            {proposal.productName}
          </h5>

          <p className="text-gray-600 text-sm line-clamp-2">
            {proposal.description}
          </p>
        </div>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-white rounded-lg border">
        <div className="flex items-center space-x-2">
          <CurrencyDollarIcon className="w-4 h-4 text-green-600" />
          <div>
            <p className="text-xs text-gray-500">Giá ước tính</p>
            <p className="font-semibold text-green-700">
              {formatPrice(proposal.estimatedPrice)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <ClockIcon className="w-4 h-4 text-blue-600" />
          <div>
            <p className="text-xs text-gray-500">Thời gian</p>
            <p className="font-semibold text-blue-700">
              {proposal.estimatedDuration}
            </p>
          </div>
        </div>
      </div>

      {/* Additional Info (Collapsible) */}
      <div className="mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <EyeIcon className="w-4 h-4" />
          <span>{showDetails ? 'Ẩn' : 'Xem'} chi tiết</span>
          {showDetails ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </button>

        {showDetails && (
          <div className="mt-3 space-y-3 p-3 bg-white rounded-lg border">
            {proposal.dimensions && (
              <div>
                <strong className="text-sm text-gray-700">Kích thước:</strong>
                <p className="text-sm text-gray-600">{proposal.dimensions}</p>
              </div>
            )}

            {proposal.deadline && (
              <div>
                <strong className="text-sm text-gray-700">Deadline:</strong>
                <p className="text-sm text-gray-600">
                  {new Date(proposal.deadline).toLocaleDateString('vi-VN')}
                </p>
              </div>
            )}

            {proposal.materials && proposal.materials.length > 0 && (
              <div>
                <strong className="text-sm text-gray-700">Chất liệu:</strong>
                <div className="flex flex-wrap gap-1 mt-1">
                  {proposal.materials.map((material, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {material}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {proposal.colorPreferences &&
              proposal.colorPreferences.length > 0 && (
                <div>
                  <strong className="text-sm text-gray-700">Màu sắc:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proposal.colorPreferences.map((color, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {proposal.specifications &&
              Object.keys(proposal.specifications).length > 0 && (
                <div>
                  <strong className="text-sm text-gray-700">
                    Thông số kỹ thuật:
                  </strong>
                  <div className="mt-1 space-y-1">
                    {Object.entries(proposal.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-gray-600">{key}:</span>
                          <span className="text-gray-800 font-medium">
                            {value}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="border-t pt-4">
        {/* Nếu là người gửi (nghệ nhân) */}
        {isOwn && currentStatus === 'pending' && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit?.(negotiationId)}
              leftIcon={<PencilIcon className="w-4 h-4" />}
              disabled={loading}
            >
              Chỉnh sửa
            </Button>
          </div>
        )}

        {/* Nếu là người nhận (khách hàng) */}
        {!isOwn && userRole === 'CUSTOMER' && currentStatus === 'pending' && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={handleAccept}
              leftIcon={<CheckIcon className="w-4 h-4" />}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              Đồng ý
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowChangesModal(true)}
              leftIcon={<InformationCircleIcon className="w-4 h-4" />}
              disabled={loading}
            >
              Yêu cầu sửa đổi
            </Button>

            <Button
              size="sm"
              variant="danger"
              onClick={() => setShowDeclineModal(true)}
              leftIcon={<XMarkIcon className="w-4 h-4" />}
              disabled={loading}
            >
              Từ chối
            </Button>
          </div>
        )}

        {/* Nếu đã chấp nhận và là khách hàng */}
        {!isOwn && userRole === 'CUSTOMER' && currentStatus === 'accepted' && (
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={handleProceedToCheckout}
              leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Tiến hành thanh toán
            </Button>
          </div>
        )}

        {/* Message cho status khác */}
        {currentStatus === 'accepted' && isOwn && (
          <div className="text-sm text-green-700 bg-green-100 rounded p-2">
            ✅ Đề xuất đã được chấp nhận. Khách hàng có thể tiến hành thanh
            toán.
          </div>
        )}

        {currentStatus === 'declined' && (
          <div className="text-sm text-red-700 bg-red-100 rounded p-2">
            ❌ Đề xuất đã bị từ chối.
          </div>
        )}
      </div>

      {/* Decline Modal */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title="Từ chối đề xuất"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Bạn có chắc chắn muốn từ chối đề xuất này không?
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do từ chối (tùy chọn)
            </label>
            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="Nhập lý do từ chối..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowDeclineModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDecline} loading={loading}>
              Từ chối
            </Button>
          </div>
        </div>
      </Modal>

      {/* Request Changes Modal */}
      <Modal
        isOpen={showChangesModal}
        onClose={() => setShowChangesModal(false)}
        title="Yêu cầu sửa đổi"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Hãy mô tả những thay đổi bạn muốn cho đề xuất này:
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Yêu cầu thay đổi *
            </label>
            <textarea
              rows={4}
              value={requestedChanges}
              onChange={(e) => setRequestedChanges(e.target.value)}
              className="w-full rounded-lg border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="VD: Có thể giảm giá xuống $80 không? Hoặc thay đổi chất liệu thành bạc 925..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setShowChangesModal(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleRequestChanges}
              disabled={!requestedChanges.trim()}
              loading={loading}
            >
              Gửi yêu cầu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
