import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  TruckIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CreditCardIcon,
  PhoneIcon,
  PrinterIcon,
} from '@heroicons/react/24/outline';
import { useToastContext } from '../../contexts/ToastContext';
import { orderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../types/order';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ConfirmModal } from '../../components/ui/Modal';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { success, error } = useToastContext();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    if (!orderId) return;

    try {
      const orderData = await orderService.getOrder(orderId);
      setOrder(orderData);
    } catch (err) {
      console.error('Error loading order:', err);
      error('Không thể tải thông tin đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    setUpdating(true);
    try {
      await orderService.cancelOrder(order.id, {
        reason: 'Khách hàng yêu cầu hủy đơn',
      });

      success('Đã hủy đơn hàng thành công');
      setShowCancelModal(false);
      loadOrder();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi hủy đơn hàng');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      [OrderStatus.PENDING]: {
        variant: 'warning' as const,
        text: 'Chờ xác nhận',
        icon: ClockIcon,
      },
      [OrderStatus.CONFIRMED]: {
        variant: 'info' as const,
        text: 'Đã xác nhận',
        icon: CheckCircleIcon,
      },
      [OrderStatus.PAID]: {
        variant: 'success' as const,
        text: 'Đã thanh toán',
        icon: CheckCircleIcon,
      },
      [OrderStatus.PROCESSING]: {
        variant: 'info' as const,
        text: 'Đang xử lý',
        icon: ClockIcon,
      },
      [OrderStatus.SHIPPED]: {
        variant: 'info' as const,
        text: 'Đã gửi hàng',
        icon: TruckIcon,
      },
      [OrderStatus.DELIVERED]: {
        variant: 'success' as const,
        text: 'Đã giao hàng',
        icon: CheckCircleIcon,
      },
      [OrderStatus.CANCELLED]: {
        variant: 'danger' as const,
        text: 'Đã hủy',
        icon: XCircleIcon,
      },
      [OrderStatus.REFUNDED]: {
        variant: 'secondary' as const,
        text: 'Đã hoàn tiền',
        icon: CheckCircleIcon,
      },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <Badge variant={config.variant} className="inline-flex items-center">
        <IconComponent className="w-4 h-4 mr-1" />
        {config.text}
      </Badge>
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelOrder =
    order &&
    [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thông tin đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy đơn hàng
        </h3>
        <p className="text-gray-500 mb-6">
          Đơn hàng này không tồn tại hoặc bạn không có quyền xem
        </p>
        <Link to="/orders">
          <Button>Quay lại danh sách đơn hàng</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link to="/orders">
            <Button
              variant="ghost"
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
              className="mr-4"
            >
              Quay lại
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Đơn hàng #{order.orderNumber}
            </h1>
            <p className="text-gray-500">
              Đặt lúc {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {getStatusBadge(order.status)}

          <Button
            variant="ghost"
            leftIcon={<PrinterIcon className="w-4 h-4" />}
            onClick={() => window.print()}
          >
            In
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Sản phẩm đã đặt
            </h2>

            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center space-x-4 pb-4 border-b border-gray-100 last:border-b-0"
                >
                  <img
                    src={
                      item.product.images[0] || 'https://via.placeholder.com/80'
                    }
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <Link
                      to={`/products/${item.product.slug || item.product.id}`}
                      className="font-medium text-gray-900 hover:text-primary"
                    >
                      {item.product.name}
                    </Link>

                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>SL: {item.quantity}</span>
                      <span>Đơn giá: {formatPrice(item.price)}</span>
                      <span>
                        Người bán: {item.seller.firstName}{' '}
                        {item.seller.lastName}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Shipping Address */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Địa chỉ giao hàng
            </h2>

            {order.shippingAddress ? (
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  {order.shippingAddress.fullName}
                </p>

                {order.shippingAddress.phone && (
                  <p className="text-gray-600 mb-1 flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    {order.shippingAddress.phone}
                  </p>
                )}

                <p className="text-gray-600">
                  {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} {order.shippingAddress.zipCode},{' '}
                  {order.shippingAddress.country}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">Chưa có thông tin địa chỉ</p>
            )}
          </Card>

          {/* Order Notes */}
          {order.notes && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Ghi chú đơn hàng
              </h2>
              <p className="text-gray-700">{order.notes}</p>
            </Card>
          )}

          {/* Tracking */}
          {order.trackingNumber && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TruckIcon className="w-5 h-5 mr-2" />
                Theo dõi đơn hàng
              </h2>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium mb-2">
                  Mã vận đơn: {order.trackingNumber}
                </p>

                <Link to={`/orders/tracking/${order.trackingNumber}`}>
                  <Button variant="outline" size="sm">
                    Theo dõi chi tiết
                  </Button>
                </Link>
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Order Summary */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">
                  {formatPrice(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-medium">
                  {order.shippingCost > 0
                    ? formatPrice(order.shippingCost)
                    : 'Miễn phí'}
                </span>
              </div>

              <hr />

              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng</span>
                <span className="text-primary">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </Card>

          {/* Payment Info */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Thanh toán
            </h2>

            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-600">Phương thức:</span>
                <p className="font-medium">
                  {order.paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'Thanh toán khi nhận hàng'
                    : 'Thanh toán online'}
                </p>
              </div>

              <div>
                <span className="text-sm text-gray-600">
                  Trạng thái thanh toán:
                </span>
                <p className="font-medium">
                  {order.paymentStatus === 'COMPLETED'
                    ? 'Đã thanh toán'
                    : order.paymentStatus === 'PENDING'
                    ? 'Chờ thanh toán'
                    : 'Chưa thanh toán'}
                </p>
              </div>

              {order.paymentReference && (
                <div>
                  <span className="text-sm text-gray-600">Mã giao dịch:</span>
                  <p className="font-medium font-mono text-sm">
                    {order.paymentReference}
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Actions */}
          {canCancelOrder && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thao tác
              </h2>

              <Button
                variant="danger"
                fullWidth
                onClick={() => setShowCancelModal(true)}
                leftIcon={<XCircleIcon className="w-4 h-4" />}
              >
                Hủy đơn hàng
              </Button>
            </Card>
          )}

          {/* Delivery Info */}
          {order.estimatedDelivery && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin giao hàng
              </h2>

              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-gray-600">Dự kiến giao:</span>
                </div>
                <p className="font-medium">
                  {formatDate(order.estimatedDelivery)}
                </p>

                {order.deliveredAt && (
                  <>
                    <div className="flex items-center text-sm mt-3">
                      <CheckCircleIcon className="w-4 h-4 mr-2 text-green-500" />
                      <span className="text-gray-600">Đã giao:</span>
                    </div>
                    <p className="font-medium">
                      {formatDate(order.deliveredAt)}
                    </p>
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Cancel Order Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelOrder}
        title="Xác nhận hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác."
        confirmText="Hủy đơn hàng"
        cancelText="Giữ đơn hàng"
        type="danger"
        loading={updating}
      />
    </div>
  );
};
