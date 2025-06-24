import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePriceNegotiation } from '../../hooks/price-negotiation/usePriceNegotiation';
import { useCartOperations } from '../../contexts/CartContext';
import { RespondToNegotiationForm } from '../../components/negotiations/RespondToNegotiationForm';
import { NegotiationStatus } from '../../types/price-negotiation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal, ConfirmModal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Avatar } from '../../components/ui/Avatar';
import { useToastContext } from '../../contexts/ToastContext';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ShoppingCartIcon,
  ChatBubbleLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  SwatchIcon,
} from '@heroicons/react/24/outline';

export const NegotiationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { success, error: showError } = useToastContext();
  const { addNegotiatedItemToCart, loading: cartLoading } = useCartOperations();
  const [showRespondForm, setShowRespondForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const {
    negotiation,
    loading,
    error,
    getNegotiation,
    cancelNegotiation,
    validateAccess,
  } = usePriceNegotiation();

  useEffect(() => {
    if (id) {
      loadNegotiation();
    }
  }, [id]);

  const loadNegotiation = async () => {
    if (!id) return;

    try {
      await getNegotiation(id);
    } catch (err) {
      console.error('Error loading negotiation:', err);
    }
  };

  const handleCancel = async () => {
    if (!id) return;

    try {
      await cancelNegotiation(id, cancelReason || 'Hủy bởi người dùng');
      setShowCancelModal(false);
      setCancelReason('');
      success('Đã hủy thương lượng thành công');
      loadNegotiation();
    } catch (err: any) {
      showError(err.message || 'Không thể hủy thương lượng');
    }
  };

  const handleRespondSuccess = () => {
    setShowRespondForm(false);
    loadNegotiation();
  };

  const handleAddToCart = async () => {
    if (!negotiation) return;

    try {
      await addNegotiatedItemToCart(negotiation.id, negotiation.quantity);
      success('Đã thêm sản phẩm với giá thương lượng vào giỏ hàng!');
    } catch (err: any) {
      showError(err.message || 'Không thể thêm sản phẩm vào giỏ hàng');
    }
  };

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
      },
      [NegotiationStatus.COUNTER_OFFERED]: {
        variant: 'info' as const,
        label: 'Đề nghị mới',
        icon: ArrowPathIcon,
      },
      [NegotiationStatus.ACCEPTED]: {
        variant: 'success' as const,
        label: 'Đã chấp nhận',
        icon: CheckCircleIcon,
      },
      [NegotiationStatus.REJECTED]: {
        variant: 'danger' as const,
        label: 'Đã từ chối',
        icon: XCircleIcon,
      },
      [NegotiationStatus.EXPIRED]: {
        variant: 'secondary' as const,
        label: 'Đã hết hạn',
        icon: ClockIcon,
      },
      [NegotiationStatus.COMPLETED]: {
        variant: 'success' as const,
        label: 'Đã hoàn thành',
        icon: CheckCircleIcon,
      },
    };
    return configs[status] || configs[NegotiationStatus.PENDING];
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (error || !negotiation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Không tìm thấy thương lượng
        </h1>
        <p className="text-gray-600 mb-6">
          Thương lượng có thể đã bị xóa hoặc bạn không có quyền xem
        </p>
        <Button onClick={() => navigate('/negotiations')}>
          Quay về danh sách thương lượng
        </Button>
      </div>
    );
  }

  const userRole =
    authState.user?.id === negotiation.customerId ? 'CUSTOMER' : 'ARTISAN';
  const isArtisan = userRole === 'ARTISAN';
  const canRespond =
    isArtisan &&
    [NegotiationStatus.PENDING, NegotiationStatus.COUNTER_OFFERED].includes(
      negotiation.status,
    );
  const canCancel = [
    NegotiationStatus.PENDING,
    NegotiationStatus.COUNTER_OFFERED,
  ].includes(negotiation.status);

  const statusConfig = getStatusConfig(negotiation.status);
  const StatusIcon = statusConfig.icon;

  // Determine display images
  const displayImages = negotiation.variant?.images.length
    ? negotiation.variant.images
    : negotiation.product.images;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Quay lại
        </Button>
      </div>

      <div className="mb-8">
        <div className="flex items-center mb-2">
          <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary mr-2" />
          <h1 className="text-3xl font-bold text-gray-900">
            Chi tiết thương lượng
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-gray-600">
            Thương lượng cho sản phẩm "{negotiation.product.name}"
          </span>
          <Badge variant={statusConfig.variant}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Product Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin sản phẩm
            </h3>
            <div className="flex items-start space-x-4">
              <img
                src={displayImages[0]}
                alt={negotiation.product.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">
                  {negotiation.product.name}
                </h4>

                {/* Variant details */}
                {negotiation.variant && (
                  <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center mb-2">
                      <SwatchIcon className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="font-medium text-blue-900">
                        Tùy chọn: {negotiation.variant.name || 'Biến thể'}
                      </span>
                    </div>

                    {Object.keys(negotiation.variant.attributes).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-xs font-medium text-blue-800">
                          Thuộc tính:
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
                          {Object.entries(negotiation.variant.attributes).map(
                            ([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span>{key}:</span>
                                <span className="font-medium">{value}</span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Giá hiện tại:</span>
                    <p className="font-medium">
                      {formatPrice(negotiation.originalPrice)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Còn lại:</span>
                    <p className="font-medium">
                      {negotiation.variant?.quantity ||
                        negotiation.product.quantity}
                      {negotiation.variant && ' (tùy chọn này)'}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex space-x-3">
                  <Link to={`/shop/${negotiation.product.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<EyeIcon className="w-4 h-4" />}
                    >
                      Xem sản phẩm
                    </Button>
                  </Link>
                  {negotiation.status === NegotiationStatus.ACCEPTED && (
                    <Button
                      size="sm"
                      leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
                      onClick={handleAddToCart}
                      loading={cartLoading[`negotiated-${negotiation.id}`]}
                    >
                      Thêm vào giỏ
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Negotiation Details */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiết thương lượng
            </h3>

            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              {/* Price comparison */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Giá gốc:</span>
                  <p className="text-lg font-semibold">
                    {formatPrice(negotiation.originalPrice)}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Giá đề nghị:</span>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatPrice(negotiation.proposedPrice)}
                  </p>
                </div>
              </div>

              {/* Final price if accepted */}
              {negotiation.finalPrice && (
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Giá thỏa thuận:</span>
                  <p className="text-xl font-bold text-green-600">
                    {formatPrice(negotiation.finalPrice)}
                  </p>
                </div>
              )}

              {/* Additional details */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <span className="text-sm text-gray-600">Số lượng:</span>
                  <p className="font-medium">{negotiation.quantity}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Tiết kiệm:</span>
                  <p className="font-medium text-green-600">
                    {formatPrice(
                      (negotiation.finalPrice || negotiation.proposedPrice) *
                        negotiation.quantity -
                        negotiation.originalPrice * negotiation.quantity,
                    )}
                  </p>
                </div>
              </div>

              {/* Customer reason */}
              {negotiation.customerReason && (
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600 block mb-2">
                    Lý do từ khách hàng:
                  </span>
                  <p className="text-gray-900 bg-white p-3 rounded border">
                    {negotiation.customerReason}
                  </p>
                </div>
              )}

              {/* Artisan response */}
              {negotiation.artisanResponse && (
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600 block mb-2">
                    Phản hồi từ nghệ nhân:
                  </span>
                  <p className="text-gray-900 bg-blue-50 p-3 rounded border border-blue-200">
                    {negotiation.artisanResponse}
                  </p>
                </div>
              )}

              {/* Expiration */}
              {negotiation.expiresAt && (
                <div className="pt-4 border-t border-gray-200">
                  <span className="text-sm text-gray-600">Hết hạn:</span>
                  <p className="font-medium">
                    {new Date(negotiation.expiresAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Respond Form for Artisan */}
          {canRespond && !showRespondForm && (
            <Card className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Phản hồi thương lượng
                </h3>
                <p className="text-gray-600 mb-4">
                  Bạn có yêu cầu thương lượng mới cần phản hồi
                </p>
                <Button onClick={() => setShowRespondForm(true)}>
                  Phản hồi ngay
                </Button>
              </div>
            </Card>
          )}

          {showRespondForm && (
            <RespondToNegotiationForm
              negotiation={negotiation}
              onSuccess={handleRespondSuccess}
              onCancel={() => setShowRespondForm(false)}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participant Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userRole === 'CUSTOMER' ? 'Nghệ nhân' : 'Khách hàng'}
            </h3>
            {(() => {
              const participant =
                userRole === 'CUSTOMER'
                  ? negotiation.artisan
                  : negotiation.customer;
              return (
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={participant.avatarUrl}
                    alt={`${participant.firstName} ${participant.lastName}`}
                    size="lg"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {participant.firstName} {participant.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      @{participant.username}
                    </p>
                    {userRole === 'CUSTOMER' &&
                      negotiation.artisan.artisanProfile && (
                        <p className="text-sm text-gray-600">
                          {negotiation.artisan.artisanProfile.shopName}
                        </p>
                      )}
                  </div>
                </div>
              );
            })()}
            <div className="mt-4">
              <Button
                size="sm"
                variant="outline"
                fullWidth
                leftIcon={<ChatBubbleLeftIcon className="w-4 h-4" />}
              >
                Nhắn tin
              </Button>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thời gian
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạo lúc:</span>
                <span>
                  {new Date(negotiation.createdAt).toLocaleString('vi-VN')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cập nhật:</span>
                <span>
                  {new Date(negotiation.updatedAt).toLocaleString('vi-VN')}
                </span>
              </div>
              {negotiation.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Hết hạn:</span>
                  <span
                    className={
                      new Date(negotiation.expiresAt) < new Date()
                        ? 'text-red-600 font-medium'
                        : ''
                    }
                  >
                    {new Date(negotiation.expiresAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              )}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thao tác nhanh
            </h3>
            <div className="space-y-3">
              <Link to={`/shop/${negotiation.product.id}`}>
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<EyeIcon className="w-4 h-4" />}
                >
                  Xem sản phẩm
                </Button>
              </Link>

              {negotiation.status === NegotiationStatus.ACCEPTED && (
                <Button
                  fullWidth
                  leftIcon={<ShoppingCartIcon className="w-4 h-4" />}
                  onClick={handleAddToCart}
                  loading={cartLoading[`negotiated-${negotiation.id}`]}
                >
                  Thêm vào giỏ hàng
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="outline"
                  fullWidth
                  onClick={() => setShowCancelModal(true)}
                >
                  Hủy thương lượng
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Xác nhận hủy thương lượng"
        message="Bạn có chắc chắn muốn hủy thương lượng này? Hành động này không thể hoàn tác."
        confirmText="Xác nhận hủy"
        cancelText="Không hủy"
        type="danger"
        loading={loading}
      />
    </div>
  );
};
