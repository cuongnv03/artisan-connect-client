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
  PhotoIcon,
  SwatchIcon,
  SparklesIcon,
  ExclamationTriangleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { CustomOrderProposal } from '../../types/message';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useForm } from '../../hooks/common/useForm';
import { formatPrice } from '../../utils/format';
import {
  getCustomOrderActions,
  getStatusDisplayInfo,
} from '../../utils/custom-order';
// ADD: Import the payment hook
import { useCustomOrderPayment } from '../../hooks/custom-orders/useCustomOrderPayment';

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // ADD: Initialize payment hook
  const { proceedToPayment, loading: paymentLoading } = useCustomOrderPayment();

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
  const statusInfo = getStatusDisplayInfo(status as any);

  // ADD: Payment handler similar to detail page
  const handleProceedToPayment = async () => {
    try {
      // Create a complete order object for payment
      const orderForPayment = {
        id: negotiationId,
        customerId,
        artisanId,
        title: proposal.title,
        description: proposal.description,
        estimatedPrice: proposal.estimatedPrice,
        customerBudget: proposal.customerBudget,
        finalPrice: finalPrice || proposal.estimatedPrice,
        timeline: proposal.timeline,
        specifications: proposal.specifications,
        attachmentUrls: proposal.attachmentUrls || [],
        status: status as any,
        customer: { id: customerId, firstName: '', lastName: '', email: '', username: '' },
        artisan: {
          id: artisanId,
          firstName: '',
          lastName: '',
          username: '',
          artisanProfile: { shopName: '', isVerified: false },
        },
        referenceProduct: null,
        messages: [],
        negotiationHistory: [],
        expiresAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await proceedToPayment(orderForPayment);
    } catch (error) {
      console.error('Error proceeding to payment:', error);
    }
  };

  const {
    values: counterValues,
    handleChange: handleCounterChange,
    handleSubmit: handleCounterSubmit,
    errors: counterErrors,
    resetForm: resetCounterForm,
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
      resetCounterForm();
    },
  });

  const getStatusBadge = () => {
    const config = statusInfo;
    const variantMap = {
      warning: 'warning' as const,
      info: 'info' as const,
      success: 'success' as const,
      danger: 'danger' as const,
      default: 'default' as const,
    };

    return (
      <Badge
        variant={variantMap[config.color as keyof typeof variantMap]}
        size="sm"
        className="flex items-center gap-1"
      >
        <span>{config.icon}</span>
        {config.text}
      </Badge>
    );
  };

  const displayPrice = finalPrice || proposal.estimatedPrice;
  const isCustomer = currentUserId === customerId;
  const isArtisan = currentUserId === artisanId;
  const hasSpecifications =
    proposal.specifications && Object.keys(proposal.specifications).length > 0;
  const hasAttachments =
    proposal.attachmentUrls && proposal.attachmentUrls.length > 0;

  // ADDED: Check if this user should see interactive actions
  const showActions =
    !!(
      permissions.canAccept ||
      permissions.canReject ||
      permissions.canCounterOffer ||
      permissions.canProceedToPayment
    ) && mockOrder.status !== 'COMPLETED';

  return (
    <>
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-5 max-w-sm shadow-md hover:shadow-lg transition-all duration-300">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <div className="p-2.5 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl mr-3 shadow-sm">
              <WrenchScrewdriverIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Custom Order</h4>
              <p className="text-xs text-gray-500">
                #{negotiationId.slice(-8)}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {/* Title & Description */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
            <h5 className="font-semibold text-gray-900 line-clamp-1 mb-1">
              {proposal.title}
            </h5>
            <p className="text-sm text-gray-600 line-clamp-2">
              {proposal.description}
            </p>

            {/* Quick View Details Button */}
            <button
              onClick={() => setShowDetailsModal(true)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center mt-2"
            >
              <EyeIcon className="w-3 h-3 mr-1" />
              Xem chi tiết
            </button>
          </div>

          {/* Price & Timeline */}
          <div className="grid grid-cols-2 gap-3">
            {displayPrice && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                <div className="flex items-center space-x-1 mb-1">
                  <CurrencyDollarIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-green-700 font-medium">
                    Giá:
                  </span>
                </div>
                <div className="text-sm font-bold text-green-700">
                  {formatPrice(displayPrice)}
                </div>
                {finalPrice && finalPrice !== proposal.estimatedPrice && (
                  <div className="text-xs text-gray-500 line-through">
                    {formatPrice(proposal.estimatedPrice || 0)}
                  </div>
                )}
              </div>
            )}

            {proposal.timeline && (
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                <div className="flex items-center space-x-1 mb-1">
                  <ClockIcon className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  <span className="text-xs text-purple-700 font-medium">
                    Thời gian:
                  </span>
                </div>
                <div className="text-sm font-medium text-purple-700 line-clamp-1">
                  {proposal.timeline}
                </div>
              </div>
            )}
          </div>

          {/* Quick Preview of Specifications & Attachments */}
          {(hasSpecifications || hasAttachments) && (
            <div className="flex items-center justify-center space-x-4 py-2 bg-gray-50 rounded-lg">
              {hasSpecifications && (
                <div className="flex items-center text-xs text-gray-600">
                  <SwatchIcon className="w-3 h-3 mr-1" />
                  {Object.keys(proposal.specifications).length} thông số
                </div>
              )}
              {hasAttachments && (
                <div className="flex items-center text-xs text-gray-600">
                  <PhotoIcon className="w-3 h-3 mr-1" />
                  {proposal.attachmentUrls!.length} hình ảnh
                </div>
              )}
            </div>
          )}

          {/* Customer Budget Display */}
          {proposal.customerBudget && (
            <div className="text-center py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <span className="text-xs text-yellow-700">
                💰 Ngân sách: {formatPrice(proposal.customerBudget)}
              </span>
            </div>
          )}

          {/* ENHANCED: Status Message with better context */}
          {permissions.message && (
            <div
              className={`text-xs p-3 rounded-lg flex items-start border ${
                showActions
                  ? 'text-orange-700 bg-orange-50 border-orange-200'
                  : 'text-blue-700 bg-blue-50 border-blue-200'
              }`}
            >
              <ExclamationTriangleIcon className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <div className="font-medium mb-1">{permissions.message}</div>
                <div className="text-xs opacity-75">
                  {statusInfo.description}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ENHANCED: Actions - Show different actions based on permissions */}
        {showActions && status !== 'COMPLETED' && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
            {/* Accept Button */}
            {permissions.canAccept && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => onAccept?.(negotiationId, proposal)}
                disabled={loading}
                leftIcon={<CheckIcon className="w-4 h-4" />}
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
              >
                {status === 'PENDING' ? 'Chấp nhận yêu cầu' : 'Chấp nhận'}
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
                className="border-orange-300 text-orange-700 hover:bg-orange-50 flex-1"
              >
                {status === 'PENDING' ? 'Đề xuất giá' : 'Đề xuất lại'}
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
                {status === 'PENDING' ? 'Từ chối yêu cầu' : 'Từ chối'}
              </Button>
            )}

            {/* UPDATED: Payment Button with proper logic */}
            {permissions.canProceedToPayment && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleProceedToPayment}
                loading={paymentLoading}
                leftIcon={<CreditCardIcon className="w-4 h-4" />}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 flex-1 shadow-lg"
              >
                Thanh toán • {formatPrice(displayPrice || 0)}
              </Button>
            )}
          </div>
        )}

        {/* Status message for completed orders */}
        {status === 'COMPLETED' && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 flex items-center">
              <CheckIcon className="w-4 h-4 mr-2" />
              Custom order đã hoàn thành và được chuyển thành đơn hàng
            </p>
          </div>
        )}

        {/* Always show view details button */}
        <div
          className={`${
            showActions ? 'mt-2' : 'mt-4 pt-4 border-t border-gray-100'
          }`}
        >
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              window.open(`/custom-orders/${negotiationId}`, '_blank');
            }}
            leftIcon={<EyeIcon className="w-4 h-4" />}
            className="text-gray-600 hover:bg-gray-50 w-full"
          >
            Xem chi tiết đầy đủ
          </Button>
        </div>
      </div>

      {/* Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={`Chi tiết: ${proposal.title}`}
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {/* Status Info */}
          <div
            className={`p-4 rounded-lg border ${
              showActions
                ? 'bg-orange-50 border-orange-200'
                : 'bg-blue-50 border-blue-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-900">
                Trạng thái hiện tại:
              </h4>
              {getStatusBadge()}
            </div>
            <p className="text-sm text-gray-600">{statusInfo.description}</p>
            {permissions.message && (
              <p className="text-sm font-medium text-gray-800 mt-2">
                💡 {permissions.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Mô tả chi tiết:
            </h4>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
              {proposal.description}
            </p>
          </div>

          {/* Specifications */}
          {hasSpecifications && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <SwatchIcon className="w-4 h-4 mr-1" />
                Thông số kỹ thuật:
              </h4>
              <div className="space-y-2">
                {Object.entries(proposal.specifications!)
                  .filter(([_, value]) => value)
                  .map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <div className="font-medium text-gray-900 capitalize mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </div>
                      <div className="text-gray-700">{String(value)}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Images */}
          {hasAttachments && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                <PhotoIcon className="w-4 h-4 mr-1" />
                Hình ảnh tham khảo:
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {proposal.attachmentUrls!.map((url, index) => (
                  <img loading="lazy"
                    key={index}
                    src={url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-2">
              Thông tin giá:
            </h4>
            <div className="space-y-2">
              {proposal.estimatedPrice && (
                <div className="flex justify-between">
                  <span className="text-green-700">Giá ước tính:</span>
                  <span className="font-semibold text-green-900">
                    {formatPrice(proposal.estimatedPrice)}
                  </span>
                </div>
              )}
              {proposal.customerBudget && (
                <div className="flex justify-between">
                  <span className="text-green-700">Ngân sách khách:</span>
                  <span className="font-semibold text-green-900">
                    {formatPrice(proposal.customerBudget)}
                  </span>
                </div>
              )}
              {finalPrice && finalPrice !== proposal.estimatedPrice && (
                <div className="flex justify-between border-t border-green-300 pt-2">
                  <span className="text-green-800 font-medium">Giá cuối:</span>
                  <span className="font-bold text-green-900 text-lg">
                    {formatPrice(finalPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Decline Modal */}
      <Modal
        isOpen={showDeclineModal}
        onClose={() => setShowDeclineModal(false)}
        title={status === 'PENDING' ? 'Từ chối yêu cầu' : 'Từ chối đề xuất'}
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
              placeholder={
                status === 'PENDING'
                  ? 'Nhập lý do từ chối yêu cầu này...'
                  : 'Nhập lý do từ chối đề xuất để giúp đối phương hiểu rõ hơn...'
              }
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
              {status === 'PENDING' ? 'Từ chối yêu cầu' : 'Từ chối đề xuất'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Counter Offer Modal */}
      <Modal
        isOpen={showCounterModal}
        onClose={() => setShowCounterModal(false)}
        title={
          status === 'PENDING' ? 'Đề xuất giá cho yêu cầu' : 'Đề xuất giá mới'
        }
        size="md"
      >
        <form onSubmit={handleCounterSubmit}>
          <div className="space-y-4">
            {/* Current Price Display */}
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">
                {status === 'PENDING'
                  ? 'Giá ước tính của khách:'
                  : 'Giá hiện tại:'}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(displayPrice || 0)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {status === 'PENDING'
                  ? 'Giá bạn đề xuất (VNĐ) *'
                  : 'Giá đề xuất mới (VNĐ) *'}
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
                step="1"
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
                Tin nhắn {status === 'PENDING' ? 'phản hồi' : 'giải thích'} *
              </label>
              <textarea
                name="message"
                rows={3}
                value={counterValues.message}
                onChange={handleCounterChange}
                placeholder={
                  status === 'PENDING'
                    ? 'Phản hồi về yêu cầu và giải thích giá đề xuất...'
                    : 'Giải thích lý do thay đổi giá hoặc điều kiện...'
                }
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
              {status === 'PENDING' ? 'Gửi đề xuất' : 'Gửi đề xuất mới'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
