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
} from '@heroicons/react/24/outline';
import { useCustomOrderDetail } from '../../hooks/custom-orders/useCustomOrderDetail';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ImageGallery } from '../../components/common/ImageGallery';
import { Modal } from '../../components/ui/Modal';
import { formatPrice, formatRelativeTime } from '../../utils/format';
import { QuoteStatus } from '../../types/custom-order';
import { useForm } from '../../hooks/common/useForm';

export const CustomOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state: authState } = useAuth();
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showNegotiationHistory, setShowNegotiationHistory] = useState(false);

  const {
    order,
    loading,
    updating,
    respondToOrder,
    updateOrder,
    acceptCounterOffer,
    cancelOrder,
    canRespond,
    canUpdate,
    canAcceptCounter,
    canCancel,
  } = useCustomOrderDetail(id!);

  // Handle URL actions
  React.useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'accept' && canRespond) {
      handleQuickAccept();
    } else if (action === 'accept-counter' && canAcceptCounter) {
      handleAcceptCounter();
    }
  }, [searchParams, canRespond, canAcceptCounter]);

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

  const handleQuickAccept = async () => {
    await respondToOrder({
      action: 'ACCEPT',
      response: { message: 'Tôi chấp nhận yêu cầu này!' },
    });
  };

  const handleAcceptCounter = async () => {
    await acceptCounterOffer();
  };

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
        text: 'Đề xuất ngược',
        bg: 'from-blue-400 to-indigo-400',
      },
      EXPIRED: {
        variant: 'default' as const,
        text: 'Đã hết hạn',
        bg: 'from-gray-400 to-gray-500',
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
              {order.expiresAt && new Date(order.expiresAt) > new Date() && (
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
          {order.specifications && (
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
                {Object.entries(order.specifications).map(([key, value]) =>
                  value ? (
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
                  ) : null,
                )}
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
                  <img
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
                  Khách hàng
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
                  Nghệ nhân
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
              {/* Message Button */}
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
              {canRespond && isArtisan && (
                <div className="space-y-2">
                  <Button
                    fullWidth
                    onClick={() => setShowResponseModal(true)}
                    loading={updating}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    leftIcon={<CheckIcon className="w-4 h-4" />}
                  >
                    Phản hồi yêu cầu
                  </Button>
                </div>
              )}

              {/* Customer Actions */}
              {canAcceptCounter && isCustomer && (
                <Button
                  fullWidth
                  onClick={() => acceptCounterOffer()}
                  loading={updating}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  leftIcon={<CheckIcon className="w-4 h-4" />}
                >
                  Chấp nhận đề xuất ngược
                </Button>
              )}

              {/* Proceed to Checkout */}
              {order.status === 'ACCEPTED' && isCustomer && (
                <Button
                  fullWidth
                  onClick={() =>
                    navigate('/checkout', {
                      state: { customOrderId: order.id },
                    })
                  }
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-lg"
                >
                  Tiến hành thanh toán
                </Button>
              )}

              {/* Cancel Order */}
              {canCancel && (
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => cancelOrder()}
                  loading={updating}
                  className="border-red-300 text-red-700 hover:bg-red-50"
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
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <span className="text-orange-700">Hết hạn:</span>
                  <span
                    className={`font-medium ${
                      new Date(order.expiresAt) < new Date()
                        ? 'text-red-600'
                        : 'text-orange-700'
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

      {/* Response Modal */}
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
    </div>
  );
};
