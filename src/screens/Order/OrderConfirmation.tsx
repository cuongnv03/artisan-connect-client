import React, { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useOrders } from '../../hooks/useOrders';
import { formatDate, formatPrice } from '../../helpers/formatters';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/form/Button';
import { Loader } from '../../components/feedback/Loader';
import { Alert } from '../../components/feedback/Alert';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { OrderStatusBadge } from './OrderStatusBadge';

const OrderConfirmation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isNewOrder = new URLSearchParams(location.search).get('new') === 'true';

  // Get order data
  const { useOrder } = useOrders();
  const { data: order, isLoading, isError } = useOrder(id!);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader text="Loading order details..." />
      </div>
    );
  }

  if (isError || !order) {
    return (
      <Alert type="error" title="Error Loading Order">
        We couldn't load the order details. Please try again or contact support.
      </Alert>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {isNewOrder && (
        <div className="mb-8 text-center py-6 bg-green-50 rounded-xl border border-green-100">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-gray-900">
            Thank You for Your Order!
          </h1>
          <p className="text-gray-600 mt-2">
            Order #{order.orderNumber} has been placed successfully
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
        <div>
          <h1
            className={`text-2xl font-bold text-gray-900 ${
              isNewOrder ? 'hidden' : ''
            }`}
          >
            Order Confirmation
          </h1>
          <p className="text-gray-500">
            Order #{order.orderNumber} - Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="mt-4 sm:mt-0">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Order Items */}
      <Card className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Items</h2>
        <div className="divide-y divide-gray-200">
          {order.items.map((item) => (
            <div key={item.id} className="py-4 flex">
              <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                <img
                  src={item.product?.images?.[0] || '/placeholder.jpg'}
                  alt={item.product?.name || 'Product image'}
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div className="ml-4 flex flex-1 flex-col">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <h3>
                    {item.product?.name || item.productData?.name || 'Product'}
                  </h3>
                  <p className="ml-4">{formatPrice(item.price)}</p>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Quantity: {item.quantity}
                </p>
                <div className="flex flex-1 items-end justify-between text-sm">
                  <p className="text-gray-500">
                    Subtotal: {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Order Details (Summary, Shipping, Payment) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900 font-medium">
                {formatPrice(order.subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Shipping</span>
              <span className="text-gray-900 font-medium">
                {formatPrice(order.shippingCost)}
              </span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-900 font-medium">
                  {formatPrice(order.tax)}
                </span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span className="text-green-600 font-medium">
                  -{formatPrice(order.discount)}
                </span>
              </div>
            )}
            <div className="pt-3 border-t border-gray-200 flex justify-between">
              <span className="text-base font-medium text-gray-900">Total</span>
              <span className="text-base font-medium text-gray-900">
                {formatPrice(order.totalAmount)}
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-6">
            {/* Shipping Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Shipping Information
              </h2>
              {order.shippingAddress ? (
                <div className="text-sm text-gray-700">
                  <p className="font-medium">
                    {order.shippingAddress.fullName}
                  </p>
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zipCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  {order.shippingAddress.phone && (
                    <p className="mt-1">Phone: {order.shippingAddress.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No shipping address provided
                </p>
              )}
            </div>

            {/* Payment Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Payment Information
              </h2>
              <div className="flex items-center">
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    order.paymentStatus
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {order.paymentStatus ? 'Paid' : 'Pending'}
                </span>

                <span className="ml-2 text-sm text-gray-700">
                  {order.paymentMethod?.replace('_', ' ') || 'Not specified'}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <Button variant="primary" as={Link} to="/orders">
          View My Orders
        </Button>

        <Button variant="outline" as={Link} to="/">
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
