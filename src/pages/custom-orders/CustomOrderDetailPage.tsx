import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ClockIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useCustomOrderDetail } from '../../hooks/custom-orders/useCustomOrderDetail';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ImageGallery } from '../../components/common/ImageGallery';
import { formatPrice, formatRelativeTime } from '../../utils/format';
import { QuoteStatus } from '../../types/custom-order';

export const CustomOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: authState } = useAuth();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            Đang tải thông tin custom order...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy custom order
        </h3>
        <p className="text-gray-500 mb-6">
          Custom order này không tồn tại hoặc bạn không có quyền truy cập
        </p>
        <Button onClick={() => navigate(-1)}>Quay lại</Button>
      </div>
    );
  }

  const getStatusBadge = (status: QuoteStatus) => {
    const statusConfig = {
      PENDING: { variant: 'warning' as const, text: 'Chờ phản hồi' },
      ACCEPTED: { variant: 'success' as const, text: 'Đã chấp nhận' },
      REJECTED: { variant: 'danger' as const, text: 'Đã từ chối' },
      COUNTER_OFFERED: { variant: 'info' as const, text: 'Đề xuất ngược' },
      EXPIRED: { variant: 'default' as const, text: 'Đã hết hạn' },
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const isCustomer = authState.user?.id === order.customer.id;
  const isArtisan = authState.user?.id === order.artisan.id;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
          >
            Quay lại
          </Button>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.title}</h1>
            <p className="text-gray-600">Custom Order #{order.id.slice(-8)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getStatusBadge(order.status)}
          {order.expiresAt && new Date(order.expiresAt) > new Date() && (
            <Badge variant="warning">
              Hết hạn {formatRelativeTime(order.expiresAt)}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Chi tiết yêu cầu
            </h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Mô tả</h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {order.description}
                </p>
              </div>

              {order.specifications && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Yêu cầu kỹ thuật
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <pre className="text-gray-700 text-sm whitespace-pre-wrap">
                      {typeof order.specifications === 'string'
                        ? order.specifications
                        : JSON.stringify(order.specifications, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {order.attachmentUrls && order.attachmentUrls.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Hình ảnh tham khảo
                  </h3>
                  <ImageGallery
                    images={order.attachmentUrls}
                    maxHeight="300px"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Reference Product */}
          {order.referenceProduct && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sản phẩm tham khảo
              </h2>
              <div className="flex items-center space-x-4">
                <img
                  src={order.referenceProduct.images[0]}
                  alt={order.referenceProduct.name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <h3 className="font-medium text-gray-900">
                    {order.referenceProduct.name}
                  </h3>
                  <p className="text-gray-600">
                    {formatPrice(order.referenceProduct.price)}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Artisan Response */}
          {order.artisanResponse && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Phản hồi của nghệ nhân
              </h2>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700">
                  {typeof order.artisanResponse === 'string'
                    ? order.artisanResponse
                    : JSON.stringify(order.artisanResponse, null, 2)}
                </p>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Price Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin giá
            </h2>
            <div className="space-y-3">
              {order.estimatedPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Giá ước tính:</span>
                  <span className="font-medium">
                    {formatPrice(order.estimatedPrice)}
                  </span>
                </div>
              )}

              {order.customerBudget && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ngân sách khách:</span>
                  <span className="font-medium">
                    {formatPrice(order.customerBudget)}
                  </span>
                </div>
              )}

              {order.finalPrice && (
                <div className="flex items-center justify-between pt-3 border-t">
                  <span className="font-medium text-gray-900">Giá cuối:</span>
                  <span className="font-semibold text-lg text-primary">
                    {formatPrice(order.finalPrice)}
                  </span>
                </div>
              )}

              {order.timeline && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-3">
                  <ClockIcon className="w-4 h-4" />
                  <span>Thời gian: {order.timeline}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Participants */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Người tham gia
            </h2>

            <div className="space-y-4">
              {/* Customer */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Khách hàng</p>
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={order.customer.avatarUrl}
                    alt={`${order.customer.firstName} ${order.customer.lastName}`}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.customer.firstName} {order.customer.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{order.customer.username}
                    </p>
                  </div>
                </div>
              </div>

              {/* Artisan */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Nghệ nhân</p>
                <div className="flex items-center space-x-3">
                  <Avatar
                    src={order.artisan.avatarUrl}
                    alt={`${order.artisan.firstName} ${order.artisan.lastName}`}
                    size="md"
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.artisan.firstName} {order.artisan.lastName}
                    </p>
                    {order.artisan.artisanProfile && (
                      <p className="text-sm text-primary font-medium">
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
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Hành động
            </h2>

            <div className="space-y-3">
              {canRespond && isArtisan && (
                <div className="space-y-2">
                  <Button
                    fullWidth
                    onClick={() => respondToOrder({ action: 'ACCEPT' })}
                    loading={updating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Chấp nhận
                  </Button>
                  <Button
                    fullWidth
                    variant="outline"
                    onClick={() =>
                      respondToOrder({
                        action: 'COUNTER_OFFER',
                        finalPrice: order.estimatedPrice || 0,
                      })
                    }
                    loading={updating}
                  >
                    Đề xuất ngược
                  </Button>
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={() => respondToOrder({ action: 'REJECT' })}
                    loading={updating}
                  >
                    Từ chối
                  </Button>
                </div>
              )}

              {canAcceptCounter && isCustomer && (
                <Button
                  fullWidth
                  onClick={() => acceptCounterOffer()}
                  loading={updating}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Chấp nhận đề xuất ngược
                </Button>
              )}

              {canCancel && (
                <Button
                  fullWidth
                  variant="outline"
                  onClick={() => cancelOrder()}
                  loading={updating}
                >
                  Hủy yêu cầu
                </Button>
              )}

              {order.status === 'ACCEPTED' && isCustomer && (
                <Button
                  fullWidth
                  onClick={() =>
                    navigate('/checkout', {
                      state: { customOrderId: order.id },
                    })
                  }
                  className="bg-primary hover:bg-primary-dark"
                >
                  Tiến hành thanh toán
                </Button>
              )}
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thời gian
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạo:</span>
                <span>{formatRelativeTime(order.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cập nhật:</span>
                <span>{formatRelativeTime(order.updatedAt)}</span>
              </div>
              {order.expiresAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Hết hạn:</span>
                  <span
                    className={
                      new Date(order.expiresAt) < new Date()
                        ? 'text-red-600'
                        : ''
                    }
                  >
                    {formatRelativeTime(order.expiresAt)}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
