import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useOrderTracking } from '../../hooks/orders/useOrderTracking';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const TrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { order, loading, trackingEvents, formatDate } = useOrderTracking(
    orderNumber!,
  );

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
      <div className="max-w-2xl mx-auto text-center py-12">
        <TruckIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy đơn hàng
        </h3>
        <p className="text-gray-500 mb-6">
          Mã đơn hàng không hợp lệ hoặc không tồn tại
        </p>
        <Link to="/orders">
          <Button>Quay lại đơn hàng</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link to={`/orders/${order.id}`}>
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
            Theo dõi đơn hàng
          </h1>
          <p className="text-gray-500">
            Mã đơn hàng: <span className="font-mono">{orderNumber}</span>
          </p>
        </div>
      </div>

      {/* Order Info Card */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">
              Đơn hàng #{order.orderNumber}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {order.items.length} sản phẩm •{' '}
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(order.totalAmount)}
            </p>
          </div>

          {order.expectedDelivery && (
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Dự kiến giao hàng
              </div>
              <p className="font-medium">
                {formatDate(order.expectedDelivery)}
              </p>
            </div>
          )}
        </div>

        {order.shippingAddress && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start">
              <MapPinIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.fullName}
                </p>
                <p className="text-gray-600 text-sm">
                  {order.shippingAddress.street}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Tracking Timeline */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Lịch trình đơn hàng
        </h2>

        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          <div className="space-y-6">
            {trackingEvents.map((event, index) => (
              <div key={index} className="relative flex items-start">
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 ${
                    event.completed
                      ? 'bg-green-100 border-green-200'
                      : 'bg-gray-100 border-gray-200'
                  }`}
                >
                  {event.completed ? (
                    <CheckCircleIcon className="w-6 h-6 text-green-600" />
                  ) : (
                    <ClockIcon className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h3
                      className={`font-medium ${
                        event.completed ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {event.status}
                    </h3>

                    {event.date && (
                      <span className="text-sm text-gray-500">
                        {formatDate(event.date)}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm mt-1 ${
                      event.completed ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {event.description}
                  </p>

                  {event.location && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {event.location}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Help Section */}
      <Card className="p-6 mt-6 bg-blue-50 border-blue-200">
        <h3 className="font-medium text-blue-900 mb-2">Cần hỗ trợ?</h3>
        <p className="text-blue-800 text-sm mb-4">
          Nếu bạn có thắc mắc về đơn hàng hoặc cần hỗ trợ thêm, hãy liên hệ với
          chúng tôi.
        </p>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            Liên hệ người bán
          </Button>
          <Button variant="outline" size="sm">
            Hỗ trợ khách hàng
          </Button>
        </div>
      </Card>
    </div>
  );
};
