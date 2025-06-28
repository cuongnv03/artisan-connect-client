import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePriceNegotiation } from '../../hooks/price-negotiation/usePriceNegotiation';
import { useCartOperations } from '../../contexts/CartContext';
import { RespondToNegotiationForm } from '../../components/negotiations/RespondToNegotiationForm';
import {
  NegotiationStatus,
  PriceNegotiationWithDetails,
} from '../../types/price-negotiation';
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
import { CustomerResponseForm } from '../../components/negotiations/CustomerResponseForm';

export const NegotiationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const { success, error: showError } = useToastContext();
  const { addNegotiatedItemToCart, loading: cartLoading } = useCartOperations();
  const [showRespondForm, setShowRespondForm] = useState(false);
  const [showCustomerResponseForm, setShowCustomerResponseForm] =
    useState(false);
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
  const isCustomer = userRole === 'CUSTOMER';

  const canRespond =
    isArtisan &&
    [NegotiationStatus.PENDING, NegotiationStatus.COUNTER_OFFERED].includes(
      negotiation.status,
    );

  const canCustomerRespond =
    isCustomer && negotiation.status === NegotiationStatus.COUNTER_OFFERED;
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

  const AcceptedNegotiationInfo: React.FC<{
    negotiation: PriceNegotiationWithDetails;
    onAddToCart: () => void;
    cartLoading: boolean;
  }> = ({ negotiation, onAddToCart, cartLoading }) => {
    const formatPrice = (price: number) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
      }).format(price);
    };

    const displayImages = negotiation.variant?.images.length
      ? negotiation.variant.images
      : negotiation.product.images;

    const savingsAmount =
      negotiation.originalPrice - (negotiation.finalPrice || 0);
    const savingsPercent = Math.round(
      (savingsAmount / negotiation.originalPrice) * 100,
    );

    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center mb-4">
          <CheckCircleIcon className="w-6 h-6 text-green-600 mr-2" />
          <h3 className="text-lg font-semibold text-green-900">
            Thương lượng thành công!
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Product Info */}
          <div className="flex items-start space-x-4">
            <img
              src={displayImages[0]}
              alt={negotiation.product.name}
              className="w-20 h-20 rounded-lg object-cover border-2 border-green-200"
            />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-2">
                {negotiation.product.name}
              </h4>

              {/* Variant Info */}
              {negotiation.variant && (
                <div className="mb-3 p-3 bg-white rounded-lg border border-green-200">
                  <div className="flex items-center mb-2">
                    <SwatchIcon className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">
                      Tùy chọn: {negotiation.variant.name || 'Biến thể'}
                    </span>
                  </div>

                  {Object.keys(negotiation.variant.attributes).length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-green-800">
                        Thuộc tính:
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs text-green-700">
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

              <div className="text-sm text-gray-600">
                <p>
                  Số lượng có sẵn:{' '}
                  {negotiation.variant?.quantity ||
                    negotiation.product.quantity}
                </p>
                <p>Số lượng đã thương lượng: {negotiation.quantity}</p>
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-green-200">
              <h5 className="font-medium text-gray-900 mb-3">Thông tin giá</h5>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá gốc:</span>
                  <span className="line-through text-gray-500">
                    {formatPrice(negotiation.originalPrice)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Giá thương lượng:</span>
                  <span className="font-bold text-green-600">
                    {formatPrice(negotiation.finalPrice || 0)}
                  </span>
                </div>

                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium text-gray-900">
                    Bạn tiết kiệm:
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-green-600">
                      {formatPrice(savingsAmount)}
                    </span>
                    <span className="text-sm text-green-600 ml-2">
                      ({savingsPercent}%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              fullWidth
              onClick={onAddToCart}
              loading={cartLoading}
              leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
            >
              Thêm vào giỏ hàng với giá đã thương lượng
            </Button>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Compact version */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
                size="sm"
              >
                Quay lại
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Chi tiết thương lượng
                </h1>
                <p className="text-sm text-gray-600">
                  {negotiation.product.name}
                </p>
              </div>
            </div>
            <Badge variant={statusConfig.variant}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content - Full width with better spacing */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Content - Take more space */}
          <div className="xl:col-span-3 space-y-6">
            {/* Product & Negotiation Info Card */}
            <Card className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Product Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thông tin sản phẩm
                  </h3>
                  <div className="flex items-start space-x-4">
                    <img
                      src={displayImages[0]}
                      alt={negotiation.product.name}
                      className="w-20 h-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {negotiation.product.name}
                      </h4>

                      {/* Enhanced Variant Display */}
                      {negotiation.variant && (
                        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <SwatchIcon className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium text-blue-900">
                              {negotiation.variant.name || 'Biến thể'}
                            </span>
                          </div>

                          {Object.keys(negotiation.variant.attributes).length >
                            0 && (
                            <div className="space-y-1">
                              {Object.entries(
                                negotiation.variant.attributes,
                              ).map(([key, value]) => (
                                <div
                                  key={key}
                                  className="flex justify-between text-sm"
                                >
                                  <span className="text-blue-700 capitalize">
                                    {key}:
                                  </span>
                                  <span className="font-medium text-blue-900">
                                    {value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Còn lại:</span>
                          <p className="font-medium">
                            {negotiation.variant?.quantity ||
                              negotiation.product.quantity}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Negotiation Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Chi tiết thương lượng
                  </h3>

                  {/* Enhanced Price Display */}
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-600">
                            Giá gốc:
                          </span>
                          <p className="text-lg font-semibold text-gray-900">
                            {formatPrice(negotiation.originalPrice)}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">
                            Số lượng:
                          </span>
                          <p className="text-lg font-semibold text-gray-900">
                            {negotiation.quantity}
                          </p>
                        </div>
                      </div>

                      {/* Final Price or Proposed Price */}
                      {negotiation.finalPrice ? (
                        <div className="border-t pt-4">
                          <span className="text-sm text-gray-600">
                            Giá thỏa thuận:
                          </span>
                          <p className="text-2xl font-bold text-green-600">
                            {formatPrice(negotiation.finalPrice)}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-sm text-gray-600">
                              Tiết kiệm:
                            </span>
                            <div className="text-right">
                              <span className="font-medium text-green-600">
                                {formatPrice(
                                  (negotiation.originalPrice -
                                    negotiation.finalPrice) *
                                    negotiation.quantity,
                                )}
                              </span>
                              <span className="text-sm text-green-600 ml-2">
                                (
                                {Math.round(
                                  ((negotiation.originalPrice -
                                    negotiation.finalPrice) /
                                    negotiation.originalPrice) *
                                    100,
                                )}
                                %)
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border-t pt-4">
                          <span className="text-sm text-gray-600">
                            Giá đề nghị:
                          </span>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatPrice(negotiation.proposedPrice)}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Customer Reason */}
                    {negotiation.customerReason && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 block mb-2">
                          Lý do từ khách hàng:
                        </span>
                        <p className="text-gray-900 bg-white p-3 rounded border text-sm">
                          {negotiation.customerReason}
                        </p>
                      </div>
                    )}

                    {/* Artisan Response */}
                    {negotiation.artisanResponse && (
                      <div>
                        <span className="text-sm font-medium text-gray-700 block mb-2">
                          Phản hồi từ nghệ nhân:
                        </span>
                        <p className="text-gray-900 bg-blue-50 p-3 rounded border border-blue-200 text-sm">
                          {negotiation.artisanResponse}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* ACCEPTED Status Actions */}
            {negotiation.status === NegotiationStatus.ACCEPTED && (
              <Card className="p-6 bg-green-50 border-green-200">
                <div className="flex items-center mb-4">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">
                      Thương lượng thành công!
                    </h3>
                    <p className="text-green-700 text-sm">
                      Bạn có thể thêm sản phẩm vào giỏ hàng với giá đã thỏa
                      thuận
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Thông tin mua hàng
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sản phẩm:</span>
                        <span className="font-medium">
                          {negotiation.product.name}
                        </span>
                      </div>

                      {negotiation.variant && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tùy chọn:</span>
                          <span className="font-medium">
                            {negotiation.variant.name}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-600">Số lượng:</span>
                        <span className="font-medium">
                          {negotiation.quantity}
                        </span>
                      </div>

                      <div className="flex justify-between border-t pt-2">
                        <span className="text-gray-600">Giá mỗi sản phẩm:</span>
                        <span className="font-bold text-green-600">
                          {formatPrice(negotiation.finalPrice!)}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium text-gray-900">
                          Tổng cộng:
                        </span>
                        <span className="font-bold text-green-600 text-lg">
                          {formatPrice(
                            negotiation.finalPrice! * negotiation.quantity,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-3">
                    <Button
                      onClick={handleAddToCart}
                      loading={cartLoading[`negotiated-${negotiation.id}`]}
                      size="lg"
                      leftIcon={<ShoppingCartIcon className="w-5 h-5" />}
                      className="w-full"
                    >
                      Thêm vào giỏ hàng
                    </Button>

                    <Link to={`/shop/${negotiation.product.id}`}>
                      <Button
                        variant="outline"
                        size="lg"
                        leftIcon={<EyeIcon className="w-5 h-5" />}
                        className="w-full"
                      >
                        Xem sản phẩm
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* Response Forms */}
            {canRespond && !showRespondForm && (
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Phản hồi thương lượng
                </h3>
                <p className="text-gray-600 mb-4">
                  Bạn có yêu cầu thương lượng mới cần phản hồi
                </p>
                <Button onClick={() => setShowRespondForm(true)}>
                  Phản hồi ngay
                </Button>
              </Card>
            )}

            {canCustomerRespond && !showCustomerResponseForm && (
              <Card className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nghệ nhân đã phản hồi
                </h3>
                <p className="text-gray-600 mb-4">
                  Họ đã gửi đề nghị mới cho bạn. Bạn muốn phản hồi như thế nào?
                </p>
                <Button onClick={() => setShowCustomerResponseForm(true)}>
                  Phản hồi ngay
                </Button>
              </Card>
            )}

            {showRespondForm && (
              <RespondToNegotiationForm
                negotiation={negotiation}
                onSuccess={handleRespondSuccess}
                onCancel={() => setShowRespondForm(false)}
              />
            )}

            {showCustomerResponseForm && (
              <CustomerResponseForm
                negotiation={negotiation}
                onSuccess={() => {
                  setShowCustomerResponseForm(false);
                  loadNegotiation();
                }}
                onCancel={() => setShowCustomerResponseForm(false)}
              />
            )}
          </div>

          {/* Compact Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Participant Info - Compact */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                {userRole === 'CUSTOMER' ? 'Nghệ nhân' : 'Khách hàng'}
              </h3>
              {(() => {
                const participant =
                  userRole === 'CUSTOMER'
                    ? negotiation.artisan
                    : negotiation.customer;
                return (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={participant.avatarUrl}
                        alt={`${participant.firstName} ${participant.lastName}`}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {participant.firstName} {participant.lastName}
                        </h4>
                        <p className="text-sm text-gray-600 truncate">
                          @{participant.username}
                        </p>
                        {userRole === 'CUSTOMER' &&
                          negotiation.artisan.artisanProfile && (
                            <p className="text-sm text-blue-600 truncate">
                              {negotiation.artisan.artisanProfile.shopName}
                            </p>
                          )}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      fullWidth
                      leftIcon={<ChatBubbleLeftIcon className="w-4 h-4" />}
                    >
                      Nhắn tin
                    </Button>
                  </div>
                );
              })()}
            </Card>

            {/* Timeline - Compact */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thời gian</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạo:</span>
                  <span className="font-medium">
                    {new Date(negotiation.createdAt).toLocaleDateString(
                      'vi-VN',
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cập nhật:</span>
                  <span className="font-medium">
                    {new Date(negotiation.updatedAt).toLocaleDateString(
                      'vi-VN',
                    )}
                  </span>
                </div>
                {negotiation.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hết hạn:</span>
                    <span
                      className={`font-medium ${
                        new Date(negotiation.expiresAt) < new Date()
                          ? 'text-red-600'
                          : 'text-gray-900'
                      }`}
                    >
                      {new Date(negotiation.expiresAt).toLocaleDateString(
                        'vi-VN',
                      )}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Actions - Compact */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Thao tác</h3>
              <div className="space-y-2">
                <Link to={`/shop/${negotiation.product.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    leftIcon={<EyeIcon className="w-4 h-4" />}
                  >
                    Xem sản phẩm
                  </Button>
                </Link>

                {canCancel && (
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => setShowCancelModal(true)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Hủy thương lượng
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals remain the same */}
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
