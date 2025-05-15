import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useOrders } from '../../../hooks/useOrders';
import {
  OrderStatus,
  UpdateOrderStatusDto,
  UpdateShippingInfoDto,
  CancelOrderDto,
} from '../../../types/order.types';
import { formatDate, formatPrice } from '../../../helpers/formatters';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/form/Button';
import { Badge } from '../../../components/common/Badge';
import { Loader } from '../../../components/feedback/Loader';
import { Alert } from '../../../components/feedback/Alert';
import { Modal } from '../../../components/feedback/Modal';
import { Input } from '../../../components/form/Input';
import { Dropdown } from '../../../components/form/Dropdown';
import { useAuth } from '../../../context/AuthContext';
import { UserRole } from '../../../types/user.types';
import { OrderStatusBadge } from '../OrderStatusBadge';
import { OrderTimeline } from '../OrderTimeline';
import { useForm } from '../../../hooks/useForm';

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useAuth();
  const { user } = state;
  const isArtisan = user?.role === UserRole.ARTISAN;

  // State for modals
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isShippingModalOpen, setIsShippingModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Get order data
  const {
    useOrder,
    useOrderHistory,
    useUpdateOrderStatus,
    useUpdateShippingInfo,
    useCancelOrder,
  } = useOrders();
  const { data: order, isLoading, isError } = useOrder(id!);
  const { data: orderHistory, isLoading: isHistoryLoading } = useOrderHistory(
    id!,
  );

  // Mutations
  const updateStatusMutation = useUpdateOrderStatus(id!);
  const updateShippingMutation = useUpdateShippingInfo(id!);
  const cancelOrderMutation = useCancelOrder(id!);

  // Form for update status
  const statusForm = useForm<UpdateOrderStatusDto>({
    initialValues: {
      status: OrderStatus.PROCESSING,
      note: '',
    },
    onSubmit: async (values) => {
      await updateStatusMutation.mutateAsync(values);
      setIsUpdateStatusModalOpen(false);
    },
  });

  // Form for shipping info
  const shippingForm = useForm<UpdateShippingInfoDto>({
    initialValues: {
      trackingNumber: order?.trackingNumber || '',
      trackingUrl: order?.trackingUrl || '',
      estimatedDelivery: order?.estimatedDelivery
        ? new Date(order.estimatedDelivery).toISOString().split('T')[0]
        : '',
    },
    onSubmit: async (values) => {
      await updateShippingMutation.mutateAsync(values);
      setIsShippingModalOpen(false);
    },
  });

  // Form for cancel order
  const cancelForm = useForm<CancelOrderDto>({
    initialValues: {
      reason: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (!values.reason) {
        errors.reason = 'Please provide a reason for cancellation';
      }
      return errors;
    },
    onSubmit: async (values) => {
      await cancelOrderMutation.mutateAsync(values);
      setIsCancelModalOpen(false);
    },
  });

  // Status options for artisan
  const statusOptions = [
    { value: OrderStatus.PROCESSING, label: 'Processing' },
    { value: OrderStatus.SHIPPED, label: 'Shipped' },
    { value: OrderStatus.DELIVERED, label: 'Delivered' },
  ];

  // Helper to determine if status can be updated
  const canUpdateStatus = (currentStatus: OrderStatus): boolean => {
    if (!isArtisan) return false;
    return ![
      OrderStatus.CANCELLED,
      OrderStatus.REFUNDED,
      OrderStatus.DELIVERED,
    ].includes(currentStatus);
  };

  // Helper to determine if order can be cancelled
  const canCancelOrder = (currentStatus: OrderStatus): boolean => {
    return [
      OrderStatus.PENDING,
      OrderStatus.PAID,
      OrderStatus.PROCESSING,
    ].includes(currentStatus);
  };

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
      <div className="flex flex-col md:flex-row justify-between items-start mb-6">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Link to="/orders" className="text-accent hover:text-accent-dark">
              &larr; Back to Orders
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Order #{order.orderNumber}
          </h1>
          <p className="text-gray-500">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
          {/* Actions for Artisans */}
          {isArtisan && canUpdateStatus(order.status) && (
            <>
              <Button
                variant="primary"
                onClick={() => setIsUpdateStatusModalOpen(true)}
              >
                Update Status
              </Button>

              {order.status === OrderStatus.PROCESSING && (
                <Button
                  variant="outline"
                  onClick={() => setIsShippingModalOpen(true)}
                >
                  Add Shipping Info
                </Button>
              )}
            </>
          )}

          {/* Cancel action for both roles */}
          {canCancelOrder(order.status) && (
            <Button variant="danger" onClick={() => setIsCancelModalOpen(true)}>
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Order Status Card */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Order Status
            </h2>
            <div className="flex items-center space-x-2">
              <OrderStatusBadge status={order.status} />
              <span className="text-sm text-gray-500">
                Last updated: {formatDate(order.updatedAt)}
              </span>
            </div>
          </div>
          {order.paymentMethod && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">
                Payment
              </h3>
              <div className="flex items-center">
                <Badge variant={order.paymentStatus ? 'success' : 'warning'}>
                  {order.paymentStatus ? 'Paid' : 'Pending'}
                </Badge>
                <span className="ml-2 text-sm text-gray-700">
                  {order.paymentMethod.replace('_', ' ')}
                </span>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Order Items Card */}
        <div className="md:col-span-2">
          <Card>
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center py-4 border-b border-gray-100 last:border-0"
                >
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.product?.images?.[0] || '/placeholder.jpg'}
                      alt={item.product?.name || 'Product image'}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-base font-medium text-gray-900">
                      {item.product?.name ||
                        item.productData?.name ||
                        'Product'}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      {item.seller?.firstName &&
                        `Seller: ${item.seller.firstName} ${item.seller.lastName}`}
                    </p>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">
                      {formatPrice(item.price)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Subtotal: {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Order Summary Card */}
        <div className="md:col-span-1">
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
                <span className="text-base font-medium text-gray-900">
                  Total
                </span>
                <span className="text-base font-medium text-gray-900">
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Customer Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Shipping Address */}
        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Shipping Address
          </h2>
          {order.shippingAddress ? (
            <div className="text-sm text-gray-700">
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No shipping address provided
            </p>
          )}

          {/* Shipping Information */}
          {(order.trackingNumber || order.estimatedDelivery) && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-base font-medium text-gray-900 mb-2">
                Shipping Information
              </h3>
              {order.trackingNumber && (
                <div className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Tracking Number: </span>
                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:text-accent-dark"
                    >
                      {order.trackingNumber}
                    </a>
                  ) : (
                    order.trackingNumber
                  )}
                </div>
              )}
              {order.estimatedDelivery && (
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Estimated Delivery: </span>
                  {formatDate(order.estimatedDelivery)}
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Customer Information */}
        <Card>
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {isArtisan ? 'Customer Information' : 'Seller Information'}
          </h2>
          {isArtisan && order.customer ? (
            <div className="text-sm text-gray-700">
              <p className="font-medium">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              <p>Email: {order.customer.email}</p>
              <p>Username: {order.customer.username}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-700">
              <p className="font-medium">
                {order.items[0]?.seller?.firstName
                  ? `${order.items[0].seller.firstName} ${order.items[0].seller.lastName}`
                  : 'Multiple sellers'}
              </p>
            </div>
          )}

          {/* Additional Order Information */}
          {order.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-base font-medium text-gray-900 mb-2">
                Order Notes
              </h3>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Order Timeline */}
      <Card>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          Order Timeline
        </h2>
        {isHistoryLoading ? (
          <Loader size="sm" text="Loading history..." />
        ) : (
          <OrderTimeline
            history={orderHistory || []}
            createdAt={order.createdAt}
          />
        )}
      </Card>

      {/* Update Status Modal */}
      <Modal
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setIsUpdateStatusModalOpen(false)}
        title="Update Order Status"
        size="md"
      >
        <form onSubmit={statusForm.handleSubmit}>
          <div className="mb-4">
            <Dropdown
              label="New Status"
              options={statusOptions}
              value={statusForm.values.status}
              onChange={(value) => statusForm.setFieldValue('status', value)}
              placeholder="Select status"
            />
          </div>

          <div className="mb-6">
            <Input
              label="Note (optional)"
              name="note"
              value={statusForm.values.note}
              onChange={statusForm.handleChange}
              onBlur={statusForm.handleBlur}
              placeholder="Add a note about this status change"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setIsUpdateStatusModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={updateStatusMutation.isLoading}
            >
              Update Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* Shipping Info Modal */}
      <Modal
        isOpen={isShippingModalOpen}
        onClose={() => setIsShippingModalOpen(false)}
        title="Update Shipping Information"
        size="md"
      >
        <form onSubmit={shippingForm.handleSubmit}>
          <div className="mb-4">
            <Input
              label="Tracking Number"
              name="trackingNumber"
              value={shippingForm.values.trackingNumber}
              onChange={shippingForm.handleChange}
              onBlur={shippingForm.handleBlur}
              placeholder="Enter tracking number"
            />
          </div>

          <div className="mb-4">
            <Input
              label="Tracking URL"
              name="trackingUrl"
              value={shippingForm.values.trackingUrl}
              onChange={shippingForm.handleChange}
              onBlur={shippingForm.handleBlur}
              placeholder="Enter tracking URL"
            />
          </div>

          <div className="mb-6">
            <Input
              label="Estimated Delivery Date"
              name="estimatedDelivery"
              type="date"
              value={shippingForm.values.estimatedDelivery}
              onChange={shippingForm.handleChange}
              onBlur={shippingForm.handleBlur}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={() => setIsShippingModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={updateShippingMutation.isLoading}
            >
              Update Shipping
            </Button>
          </div>
        </form>
      </Modal>

      {/* Cancel Order Modal */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Order"
        size="md"
      >
        <form onSubmit={cancelForm.handleSubmit}>
          <div className="mb-6">
            <Input
              label="Cancellation Reason"
              name="reason"
              value={cancelForm.values.reason}
              onChange={cancelForm.handleChange}
              onBlur={cancelForm.handleBlur}
              error={cancelForm.errors.reason}
              placeholder="Please provide a reason for cancellation"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)}>
              Go Back
            </Button>
            <Button
              variant="danger"
              type="submit"
              isLoading={cancelOrderMutation.isLoading}
            >
              Cancel Order
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrderDetail;
