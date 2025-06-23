import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePriceNegotiation } from '../../hooks/price-negotiation/usePriceNegotiation';
import { RespondToNegotiationForm } from '../../components/negotiations/RespondToNegotiationForm';
import { PriceNegotiationStatus } from '../../components/products/customer/ProductDetailPage/PriceNegotiationStatus';
import { NegotiationStatus } from '../../types/price-negotiation';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Avatar } from '../../components/ui/Avatar';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  ShoppingCartIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';

export const NegotiationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [showRespondForm, setShowRespondForm] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

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
      // Tạm thời bỏ access check
      // const hasAccess = await validateAccess(id);
      // if (!hasAccess) {
      //   navigate('/unauthorized');
      //   return;
      // }

      await getNegotiation(id);
    } catch (err) {
      console.error('Error loading negotiation:', err);
    }
  };

  const handleCancel = async () => {
    if (!id) return;
    await cancelNegotiation(id, 'Hủy bởi người dùng');
    setShowCancelModal(false);
    loadNegotiation();
  };

  const handleRespondSuccess = () => {
    setShowRespondForm(false);
    loadNegotiation();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
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
        <p className="text-gray-600">
          Thương lượng cho sản phẩm "{negotiation.product.name}"
        </p>
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
                src={negotiation.product.images[0]}
                alt={negotiation.product.name}
                className="w-24 h-24 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-2">
                  {negotiation.product.name}
                </h4>
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
                      {negotiation.product.quantity}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex space-x-3">
                  <Link
                    to={`/products/${
                      negotiation.product.slug || negotiation.product.id
                    }`}
                  >
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
                    >
                      Thêm vào giỏ
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Negotiation Status */}
          <PriceNegotiationStatus
            negotiation={negotiation}
            userRole={userRole}
            onCancel={canCancel ? () => setShowCancelModal(true) : undefined}
            onRefresh={loadNegotiation}
          />

          {/* Negotiation History */}
          {negotiation.negotiationHistory && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Lịch sử thương lượng
              </h3>
              <div className="space-y-4">
                {negotiation.negotiationHistory.map(
                  (history: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Avatar
                        src={
                          history.actor === 'customer'
                            ? negotiation.customer.avatarUrl
                            : negotiation.artisan.avatarUrl
                        }
                        alt={history.actor}
                        size="sm"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {history.actor === 'customer'
                              ? `${negotiation.customer.firstName} ${negotiation.customer.lastName}`
                              : `${negotiation.artisan.firstName} ${negotiation.artisan.lastName}`}
                          </span>
                          <Badge variant="secondary" size="sm">
                            {history.action}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(history.timestamp).toLocaleString(
                              'vi-VN',
                            )}
                          </span>
                        </div>
                        {history.price && (
                          <p className="text-sm">
                            Giá: {formatPrice(history.price)}
                          </p>
                        )}
                        {history.reason && (
                          <p className="text-sm text-gray-600">
                            Lý do: {history.reason}
                          </p>
                        )}
                        {history.response && (
                          <p className="text-sm text-gray-600">
                            Phản hồi: {history.response}
                          </p>
                        )}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Card>
          )}

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

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Thao tác nhanh
            </h3>
            <div className="space-y-3">
              <Link
                to={`/products/${
                  negotiation.product.slug || negotiation.product.id
                }`}
              >
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
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Xác nhận hủy thương lượng"
      >
        <p className="text-gray-600 mb-6">
          Bạn có chắc chắn muốn hủy thương lượng này? Hành động này không thể
          hoàn tác.
        </p>
        <div className="flex space-x-3 justify-end">
          <Button variant="outline" onClick={() => setShowCancelModal(false)}>
            Không hủy
          </Button>
          <Button variant="danger" onClick={handleCancel}>
            Xác nhận hủy
          </Button>
        </div>
      </Modal>
    </div>
  );
};
