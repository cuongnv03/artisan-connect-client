import React, { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  CheckIcon,
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  SparklesIcon,
  PhotoIcon,
  DocumentTextIcon,
  SwatchIcon,
  WrenchScrewdriverIcon,
  CreditCardIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useCustomOrderDetail } from '../../hooks/custom-orders/useCustomOrderDetail';
import { useCustomOrderPayment } from '../../hooks/custom-orders/useCustomOrderPayment';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ImageGallery } from '../../components/common/ImageGallery';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { formatPrice, formatRelativeTime } from '../../utils/format';
import { QuoteStatus } from '../../types/custom-order';
import { useForm } from '../../hooks/common/useForm';

export const CustomOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state: authState } = useAuth();

  // Modal states
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showCustomerCounterModal, setShowCustomerCounterModal] =
    useState(false);
  const [showCustomerRejectModal, setShowCustomerRejectModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNegotiationHistory, setShowNegotiationHistory] = useState(false);
  const { proceedToPayment, loading: paymentLoading } = useCustomOrderPayment();

  const {
    order,
    loading,
    updating,
    permissions,
    respondToOrder,
    updateOrder,
    cancelOrder,
    customerCounterOffer,
    customerAcceptOffer,
    customerRejectOffer,
    // Permission helpers
    canRespond,
    canUpdate,
    canAcceptOffer,
    canRejectOffer,
    canCounterOffer,
    canCancel,
    canProceedToPayment,
    // Status helpers
    isExpired,
    isActive,
    isCompleted,
    isCancelled,
  } = useCustomOrderDetail(id!);

  // Handle URL actions
  React.useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'accept' && canRespond) {
      handleQuickAccept();
    } else if (action === 'accept-offer' && canAcceptOffer) {
      handleAcceptOffer();
    }
  }, [searchParams, canRespond, canAcceptOffer]);

  // Forms
  const {
    values: responseValues,
    handleChange: handleResponseChange,
    handleSubmit: handleResponseSubmit,
    setFieldValue: setResponseFieldValue,
  } = useForm({
    initialValues: {
      action: 'ACCEPT' as 'ACCEPT' | 'REJECT' | 'COUNTER_OFFER',
      finalPrice: order?.estimatedPrice || 0,
      message: '',
      timeline: '',
    },
    onSubmit: async (data) => {
      await respondToOrder({
        action: data.action,
        finalPrice:
          data.action === 'COUNTER_OFFER' ? data.finalPrice : undefined,
        response: {
          message: data.message,
          timeline: data.timeline,
        },
      });
      setShowResponseModal(false);
    },
  });

  // Quick action handlers
  const handleQuickAccept = async () => {
    await respondToOrder({
      action: 'ACCEPT',
      response: { message: 'Tôi chấp nhận yêu cầu này!' },
    });
  };

  const handleAcceptOffer = async () => {
    await customerAcceptOffer({
      action: 'ACCEPT',
      message: 'Tôi chấp nhận đề xuất này!',
    });
  };

  const handleProceedToPayment = async () => {
    if (!order) return;
    await proceedToPayment(order);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Đang tải Custom Order
          </h3>
          <p className="text-gray-600">Vui lòng đợi trong giây lát...</p>
        </div>
      </div>
    );
  }

  // Not found state
  if (!order) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WrenchScrewdriverIcon className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Không tìm thấy Custom Order
        </h3>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Custom Order này không tồn tại hoặc bạn không có quyền truy cập
        </p>
        <Button
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Quay lại
        </Button>
      </div>
    );
  }

  // Helper functions
  const getStatusBadge = (status: QuoteStatus) => {
    const statusConfig = {
      PENDING: {
        variant: 'warning' as const,
        text: 'Chờ phản hồi',
        bg: 'from-yellow-400 to-orange-400',
      },
      ACCEPTED: {
        variant: 'success' as const,
        text: 'Đã chấp nhận',
        bg: 'from-green-400 to-emerald-400',
      },
      REJECTED: {
        variant: 'danger' as const,
        text: 'Đã từ chối',
        bg: 'from-red-400 to-pink-400',
      },
      COUNTER_OFFERED: {
        variant: 'info' as const,
        text: 'Đang thương lượng',
        bg: 'from-blue-400 to-indigo-400',
      },
      EXPIRED: {
        variant: 'default' as const,
        text: 'Đã hết hạn',
        bg: 'from-gray-400 to-gray-500',
      },
      [QuoteStatus.COMPLETED]: {
        variant: 'success' as const,
        text: 'Đã hoàn thành',
        bg: 'from-green-400 to-emerald-400',
      },
    };

    const config = statusConfig[status];
    return (
      <div
        className={`inline-flex items-center px-4 py-2 rounded-full text-white font-medium bg-gradient-to-r ${config.bg} shadow-lg`}
      >
        {config.text}
      </div>
    );
  };

  const isCustomer = authState.user?.id === order.customer.id;
  const isArtisan = authState.user?.id === order.artisan.id;
  const partner = isCustomer ? order.artisan : order.customer;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Artistic Header */}
      <div className="relative bg-gradient-to-br from-orange-500 via-pink-500 to-purple-600 rounded-3xl p-8 text-white overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-8 left-8 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute top-16 right-16 w-8 h-8 bg-white rounded-full"></div>
          <div className="absolute bottom-8 left-1/3 w-12 h-12 bg-white rounded-full"></div>
        </div>

        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              leftIcon={<ArrowLeftIcon className="w-5 h-5" />}
              className="text-white hover:bg-white/20 border border-white/30"
            >
              Quay lại
            </Button>

            <div className="flex items-center space-x-4">
              {getStatusBadge(order.status)}
              {isExpired && (
                <div className="px-3 py-1 bg-red-500/80 rounded-full text-sm backdrop-blur-sm">
                  ⏰ Đã hết hạn
                </div>
              )}
              {order.expiresAt && !isExpired && (
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                  Hết hạn {formatRelativeTime(order.expiresAt)}
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-bold mb-3">{order.title}</h1>
            <p className="text-white/90 text-lg">
              Custom Order #{order.id.slice(-8)}
            </p>
            {permissions?.message && (
              <div className="mt-4 p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <p className="text-white/90">💡 {permissions.message}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Order Description */}
          <Card className="p-8 border-l-4 border-l-orange-400">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-100 to-pink-100 rounded-xl mr-4">
                <DocumentTextIcon className="w-6 h-6 text-orange-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Mô tả yêu cầu
              </h2>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {order.description}
              </p>
            </div>
          </Card>

          {/* Specifications */}
          {order.specifications &&
            Object.keys(order.specifications).length > 0 && (
              <Card className="p-8 border-l-4 border-l-purple-400">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl mr-4">
                    <SwatchIcon className="w-6 h-6 text-purple-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Thông số kỹ thuật
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(order.specifications)
                    .filter(([_, value]) => value && String(value).trim())
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-4 border border-purple-100"
                      >
                        <h3 className="font-semibold text-gray-800 capitalize mb-2 flex items-center">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h3>
                        <p className="text-gray-700">{String(value)}</p>
                      </div>
                    ))}
                </div>
              </Card>
            )}

          {/* Images Gallery */}
          {order.attachmentUrls && order.attachmentUrls.length > 0 && (
            <Card className="p-8 border-l-4 border-l-green-400">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-green-100 to-teal-100 rounded-xl mr-4">
                  <PhotoIcon className="w-6 h-6 text-green-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Hình ảnh tham khảo
                </h2>
              </div>

              <ImageGallery
                images={order.attachmentUrls}
                maxHeight="500px"
                className="rounded-xl overflow-hidden shadow-lg"
              />
            </Card>
          )}

          {/* Reference Product */}
          {order.referenceProduct && (
            <Card className="p-8 border-l-4 border-l-blue-400">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl mr-4">
                  <SparklesIcon className="w-6 h-6 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Sản phẩm tham khảo
                </h2>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-4">
                  <img loading="lazy"
                    src={order.referenceProduct.images[0]}
                    alt={order.referenceProduct.name}
                    className="w-20 h-20 object-cover rounded-xl shadow-md"
                  />
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg">
                      {order.referenceProduct.name}
                    </h3>
                    <p className="text-blue-700 font-semibold">
                      {formatPrice(order.referenceProduct.price)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Artisan Response */}
          {order.artisanResponse && (
            <Card className="p-8 border-l-4 border-l-indigo-400">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl mr-4">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-indigo-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Phản hồi của nghệ nhân
                </h2>
              </div>

              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                <div className="prose max-w-none">
                  {typeof order.artisanResponse === 'object' ? (
                    <div className="space-y-3">
                      {order.artisanResponse.message && (
                        <p className="text-gray-700">
                          {order.artisanResponse.message}
                        </p>
                      )}
                      {order.artisanResponse.timeline && (
                        <p className="text-sm text-indigo-700">
                          <strong>Thời gian thực hiện:</strong>{' '}
                          {order.artisanResponse.timeline}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-700">{order.artisanResponse}</p>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Negotiation History */}
          {order.negotiationHistory && order.negotiationHistory.length > 0 && (
            <Card className="p-8 border-l-4 border-l-gray-400">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl mr-4">
                    <ClockIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Lịch sử thương lượng
                  </h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNegotiationHistory(true)}
                  leftIcon={<EyeIcon className="w-4 h-4" />}
                >
                  Xem chi tiết
                </Button>
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto">
                {order.negotiationHistory.slice(-3).map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        entry.actor === 'customer'
                          ? 'bg-blue-400'
                          : 'bg-orange-400'
                      }`}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">
                          {entry.actor === 'customer'
                            ? 'Khách hàng'
                            : 'Nghệ nhân'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(entry.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">
                        {entry.data.message || `Đã thực hiện: ${entry.action}`}
                      </p>
                      {entry.data.finalPrice && (
                        <p className="text-xs text-green-600 font-medium">
                          Giá: {formatPrice(entry.data.finalPrice)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Information */}
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
            <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center">
              <CurrencyDollarIcon className="w-6 h-6 mr-2" />
              Thông tin giá
            </h3>

            <div className="space-y-4">
              {order.estimatedPrice && (
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-700">Giá ước tính:</span>
                  <span className="font-semibold text-green-600">
                    {formatPrice(order.estimatedPrice)}
                  </span>
                </div>
              )}

              {order.customerBudget && (
                <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <span className="text-gray-700">Ngân sách khách:</span>
                  <span className="font-semibold">
                    {formatPrice(order.customerBudget)}
                  </span>
                </div>
              )}

              {order.finalPrice && (
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border-2 border-orange-300">
                  <span className="font-bold text-orange-900">Giá cuối:</span>
                  <span className="font-bold text-2xl text-orange-600">
                    {formatPrice(order.finalPrice)}
                  </span>
                </div>
              )}

              {order.timeline && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 p-3 bg-white/50 rounded-lg">
                  <ClockIcon className="w-4 h-4" />
                  <span>Thời gian: {order.timeline}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Participants */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <UserIcon className="w-6 h-6 mr-2" />
              Người tham gia
            </h3>

            <div className="space-y-4">
              {/* Customer */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <p className="text-sm text-blue-600 font-medium mb-2">
                  Khách hàng {isCustomer && '(Bạn)'}
                </p>
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={order.customer.avatarUrl}
                    alt={`${order.customer.firstName} ${order.customer.lastName}`}
                    size="md"
                    className="ring-2 ring-blue-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{order.customer.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Artisan */}
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="text-sm text-orange-600 font-medium mb-2">
                  Nghệ nhân {isArtisan && '(Bạn)'}
                </p>
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={order.artisan.avatarUrl}
                    alt={`${order.artisan.firstName} ${order.artisan.lastName}`}
                    size="md"
                    className="ring-2 ring-orange-200"
                  />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {order.artisan.firstName} {order.artisan.lastName}
                    </p>
                    {order.artisan.artisanProfile && (
                      <p className="text-sm text-orange-600 font-medium">
                        {order.artisan.artisanProfile.shopName}
                        {order.artisan.artisanProfile.isVerified && ' ✓'}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      @{order.artisan.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
            <h3 className="text-xl font-bold text-purple-900 mb-4">
              Hành động
            </h3>

            <div className="space-y-3">
              {/* Message Button - Always available */}
              <Button
                fullWidth
                variant="outline"
                onClick={() => navigate(`/messages/${partner.id}`)}
                leftIcon={<ChatBubbleLeftRightIcon className="w-4 h-4" />}
                className="border-purple-300 text-purple-700 hover:bg-purple-100"
              >
                Nhắn tin với {isCustomer ? 'nghệ nhân' : 'khách hàng'}
              </Button>

              {/* Artisan Actions */}
              {canRespond && (
                <Button
                  fullWidth
                  onClick={() => setShowResponseModal(true)}
                  loading={updating}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  leftIcon={<CheckIcon className="w-4 h-4" />}
                >
                  Phản hồi yêu cầu
                </Button>
              )}

              {/* Customer Actions - Accept Offer */}
              {canAcceptOffer && (
                <Button
                  fullWidth
                  onClick={() =>
                    customerAcceptOffer({
                      action: 'ACCEPT',
                      message: 'Tôi chấp nhận đề xuất này!',
                    })
                  }
                  loading={updating}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  leftIcon={<CheckIcon className="w-4 h-4" />}
                >
                  Chấp nhận đề xuất
                </Button>
              )}

              {/* Customer Actions - Counter Offer */}
              {canCounterOffer && (
                <Button
                  fullWidth
                  onClick={() => setShowCustomerCounterModal(true)}
                  loading={updating}
                  variant="outline"
                  leftIcon={<ArrowPathIcon className="w-4 h-4" />}
                  className="border-orange-300 text-orange-700 hover:bg-orange-50"
                >
                  Đề xuất ngược
                </Button>
              )}

              {/* Customer Actions - Reject Offer */}
              {canRejectOffer && (
                <Button
                  fullWidth
                  onClick={() => setShowCustomerRejectModal(true)}
                  loading={updating}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  leftIcon={<XMarkIcon className="w-4 h-4" />}
                >
                  Từ chối đề xuất
                </Button>
              )}

              {/* Proceed to Checkout */}
              {canProceedToPayment && (
                <Button
                  fullWidth
                  onClick={handleProceedToPayment}
                  loading={paymentLoading}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
                  leftIcon={<CreditCardIcon className="w-4 h-4" />}
                >
                  Tiến hành thanh toán •{' '}
                  {formatPrice(order.finalPrice || order.estimatedPrice || 0)}
                </Button>
              )}

              {/* Cancel Order */}
              {canCancel && !isCompleted && (
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => setShowCancelModal(true)}
                  loading={updating}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  leftIcon={<XMarkIcon className="w-4 h-4" />}
                >
                  Hủy yêu cầu
                </Button>
              )}

              {/* View History */}
              <Button
                fullWidth
                variant="ghost"
                onClick={() => setShowNegotiationHistory(true)}
                leftIcon={<EyeIcon className="w-4 h-4" />}
              >
                Xem lịch sử thương lượng
              </Button>
            </div>

            {/* Status Message */}
            {permissions?.message && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 {permissions.message}
                </p>
              </div>
            )}
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <ClockIcon className="w-6 h-6 mr-2" />
              Thời gian
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Tạo:</span>
                <span className="font-medium">
                  {formatRelativeTime(order.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Cập nhật:</span>
                <span className="font-medium">
                  {formatRelativeTime(order.updatedAt)}
                </span>
              </div>
              {order.expiresAt && (
                <div
                  className={`flex justify-between items-center p-3 rounded-lg border ${
                    isExpired
                      ? 'bg-red-50 border-red-200'
                      : 'bg-orange-50 border-orange-200'
                  }`}
                >
                  <span
                    className={isExpired ? 'text-red-700' : 'text-orange-700'}
                  >
                    {isExpired ? 'Đã hết hạn:' : 'Hết hạn:'}
                  </span>
                  <span
                    className={`font-medium ${
                      isExpired ? 'text-red-600' : 'text-orange-700'
                    }`}
                  >
                    {formatRelativeTime(order.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* MODALS */}

      {/* Artisan Response Modal */}
      <Modal
        isOpen={showResponseModal}
        onClose={() => setShowResponseModal(false)}
        title="Phản hồi Custom Order"
        size="lg"
      >
        <form onSubmit={handleResponseSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hành động
            </label>
            <select
              name="action"
              value={responseValues.action}
              onChange={handleResponseChange}
              className="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="ACCEPT">Chấp nhận yêu cầu</option>
              <option value="COUNTER_OFFER">Đề xuất giá khác</option>
              <option value="REJECT">Từ chối yêu cầu</option>
            </select>
          </div>

          {responseValues.action === 'COUNTER_OFFER' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Giá đề xuất (VNĐ) *
                </label>
                <input
                  type="number"
                  name="finalPrice"
                  value={responseValues.finalPrice}
                  onChange={handleResponseChange}
                  className="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  placeholder="Nhập giá đề xuất"
                  required
                  min="1"
                  step="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian thực hiện
                </label>
                <input
                  type="text"
                  name="timeline"
                  value={responseValues.timeline}
                  onChange={handleResponseChange}
                  className="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                  placeholder="VD: 2-3 tuần"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tin nhắn phản hồi *
            </label>
            <textarea
              name="message"
              rows={4}
              value={responseValues.message}
              onChange={handleResponseChange}
              className="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              placeholder="Nhập tin nhắn phản hồi chi tiết..."
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowResponseModal(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              loading={updating}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              Gửi phản hồi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Counter Offer Modal */}
      <Modal
        isOpen={showCustomerCounterModal}
        onClose={() => setShowCustomerCounterModal(false)}
        title="Đề xuất giá ngược"
        size="lg"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            customerCounterOffer({
              action: 'COUNTER_OFFER',
              finalPrice: Number(formData.get('finalPrice')),
              timeline: formData.get('timeline') as string,
              message: formData.get('message') as string,
            });
            setShowCustomerCounterModal(false);
          }}
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Giá hiện tại:</div>
              <div className="text-lg font-semibold text-gray-900">
                {formatPrice(order?.finalPrice || order?.estimatedPrice || 0)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá đề xuất mới (VNĐ) *
              </label>
              <input
                type="number"
                name="finalPrice"
                required
                min="1"
                step="1"
                defaultValue={order?.finalPrice || order?.estimatedPrice || ''}
                className="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Nhập giá đề xuất"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian thực hiện
              </label>
              <input
                type="text"
                name="timeline"
                defaultValue={order?.timeline || ''}
                className="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="VD: 2-3 tuần"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tin nhắn giải thích *
              </label>
              <textarea
                name="message"
                rows={3}
                required
                className="w-full rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                placeholder="Giải thích lý do đề xuất giá mới..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCustomerCounterModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit" loading={updating}>
              Gửi đề xuất
            </Button>
          </div>
        </form>
      </Modal>

      {/* Customer Reject Modal */}
      <Modal
        isOpen={showCustomerRejectModal}
        onClose={() => setShowCustomerRejectModal(false)}
        title="Từ chối đề xuất"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            customerRejectOffer({
              action: 'REJECT',
              reason: formData.get('reason') as string,
              message: formData.get('message') as string,
            });
            setShowCustomerRejectModal(false);
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối
              </label>
              <select
                name="reason"
                className="w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
              >
                <option value="">Chọn lý do...</option>
                <option value="Giá quá cao">Giá quá cao</option>
                <option value="Thời gian quá lâu">Thời gian quá lâu</option>
                <option value="Không phù hợp yêu cầu">
                  Không phù hợp yêu cầu
                </option>
                <option value="Khác">Lý do khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tin nhắn bổ sung
              </label>
              <textarea
                name="message"
                rows={3}
                className="w-full rounded-lg border-gray-300 focus:border-red-500 focus:ring-red-500"
                placeholder="Thêm tin nhắn để giải thích chi tiết..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCustomerRejectModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit" variant="danger" loading={updating}>
              Từ chối
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Hủy Custom Order"
        size="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            cancelOrder(formData.get('reason') as string);
            setShowCancelModal(false);
          }}
        >
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600" />
              <p className="text-amber-800 text-sm">
                <strong>Cảnh báo:</strong> Bạn có chắc chắn muốn hủy custom
                order này? Hành động này không thể hoàn tác.
              </p>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do hủy (tùy chọn)
            </label>
            <textarea
              name="reason"
              rows={3}
              className="w-full rounded-lg border-gray-300 focus:border-gray-500 focus:ring-gray-500"
              placeholder="Nhập lý do hủy để giúp đối phương hiểu rõ hơn..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCancelModal(false)}
            >
              Không hủy
            </Button>
            <Button type="submit" variant="danger" loading={updating}>
              Xác nhận hủy
            </Button>
          </div>
        </form>
      </Modal>

      {/* Negotiation History Modal */}
      <Modal
        isOpen={showNegotiationHistory}
        onClose={() => setShowNegotiationHistory(false)}
        title="Lịch sử thương lượng"
        size="lg"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {order.negotiationHistory && order.negotiationHistory.length > 0 ? (
            order.negotiationHistory.map((entry, index) => (
              <div
                key={index}
                className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg"
              >
                <div
                  className={`w-3 h-3 rounded-full mt-2 ${
                    entry.actor === 'customer' ? 'bg-blue-400' : 'bg-orange-400'
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {entry.actor === 'customer' ? 'Khách hàng' : 'Nghệ nhân'}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-700">
                      <strong>Hành động:</strong> {entry.action}
                    </p>
                    {entry.data.message && (
                      <p className="text-sm text-gray-700">
                        <strong>Tin nhắn:</strong> {entry.data.message}
                      </p>
                    )}
                    {entry.data.finalPrice && (
                      <p className="text-sm text-green-600 font-medium">
                        <strong>Giá:</strong>{' '}
                        {formatPrice(entry.data.finalPrice)}
                      </p>
                    )}
                    {entry.data.timeline && (
                      <p className="text-sm text-blue-600">
                        <strong>Thời gian:</strong> {entry.data.timeline}
                      </p>
                    )}
                    {entry.data.reason && (
                      <p className="text-sm text-red-600">
                        <strong>Lý do:</strong> {entry.data.reason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              Chưa có lịch sử thương lượng
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
