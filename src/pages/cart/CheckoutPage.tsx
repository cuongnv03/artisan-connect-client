import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCardIcon,
  TruckIcon,
  MapPinIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useToastContext } from '../../contexts/ToastContext';
import { cartService } from '../../services/cart.service';
import { orderService } from '../../services/order.service';
import { userService } from '../../services/user.service';
import { CartSummary, PaymentMethod } from '../../types/order';
import { Address } from '../../types/user';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { useForm } from '../../hooks/useForm';

interface CheckoutFormData {
  addressId: string;
  paymentMethod: PaymentMethod;
  notes: string;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const [cartSummary, setCartSummary] = useState<CartSummary | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  const { values, handleChange, handleSubmit, setFieldValue, errors } =
    useForm<CheckoutFormData>({
      initialValues: {
        addressId: '',
        paymentMethod: PaymentMethod.CASH_ON_DELIVERY,
        notes: '',
      },
      validate: (values) => {
        const errors: Record<string, string> = {};

        if (!values.addressId) {
          errors.addressId = 'Vui lòng chọn địa chỉ giao hàng';
        }

        if (!values.paymentMethod) {
          errors.paymentMethod = 'Vui lòng chọn phương thức thanh toán';
        }

        return errors;
      },
      onSubmit: handlePlaceOrder,
    });

  const paymentForm = useForm<PaymentData>({
    initialValues: {
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardHolder: '',
    },
    validate: (values) => {
      const errors: Record<string, string> = {};

      if (!values.cardNumber) {
        errors.cardNumber = 'Số thẻ là bắt buộc';
      } else if (!/^\d{16}$/.test(values.cardNumber.replace(/\s/g, ''))) {
        errors.cardNumber = 'Số thẻ không hợp lệ';
      }

      if (!values.expiryDate) {
        errors.expiryDate = 'Ngày hết hạn là bắt buộc';
      } else if (!/^\d{2}\/\d{2}$/.test(values.expiryDate)) {
        errors.expiryDate = 'Định dạng MM/YY';
      }

      if (!values.cvv) {
        errors.cvv = 'CVV là bắt buộc';
      } else if (!/^\d{3,4}$/.test(values.cvv)) {
        errors.cvv = 'CVV không hợp lệ';
      }

      if (!values.cardHolder) {
        errors.cardHolder = 'Tên chủ thẻ là bắt buộc';
      }

      return errors;
    },
    onSubmit: handlePayment,
  });

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      const [cart, addressList] = await Promise.all([
        cartService.getCartSummary(),
        userService.getAddresses(),
      ]);

      if (cart.totalItems === 0) {
        error('Giỏ hàng trống');
        navigate('/cart');
        return;
      }

      setCartSummary(cart);
      setAddresses(addressList);

      // Set default address
      const defaultAddress = addressList.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setFieldValue('addressId', defaultAddress.id);
      }
    } catch (err) {
      console.error('Error loading checkout data:', err);
      error('Có lỗi xảy ra khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  async function handlePlaceOrder(data: CheckoutFormData) {
    setProcessing(true);
    try {
      if (data.paymentMethod === PaymentMethod.CASH_ON_DELIVERY) {
        // Direct order creation for COD
        const order = await orderService.createOrderFromCart({
          addressId: data.addressId,
          paymentMethod: data.paymentMethod,
          notes: data.notes,
        });

        success('Đặt hàng thành công!');
        navigate(`/orders/${order.id}`);
      } else {
        // Store order data and show payment modal
        setOrderData(data);
        setShowPaymentModal(true);
      }
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setProcessing(false);
    }
  }

  async function handlePayment(paymentData: PaymentData) {
    if (!orderData) return;

    setProcessing(true);
    try {
      // Create order first
      const order = await orderService.createOrderFromCart({
        addressId: orderData.addressId,
        paymentMethod: orderData.paymentMethod,
        notes: orderData.notes,
      });

      // Process payment (mock implementation)
      await orderService.processPayment(order.id, {
        paymentMethod: orderData.paymentMethod,
        paymentData: {
          cardNumber: paymentData.cardNumber,
          expiryDate: paymentData.expiryDate,
          cvv: paymentData.cvv,
          cardHolder: paymentData.cardHolder,
        },
      });

      success('Thanh toán thành công!');
      setShowPaymentModal(false);
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      error(err.message || 'Thanh toán thất bại');
    } finally {
      setProcessing(false);
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getPaymentMethodText = (method: PaymentMethod) => {
    const methods = {
      [PaymentMethod.CREDIT_CARD]: 'Thẻ tín dụng',
      [PaymentMethod.DEBIT_CARD]: 'Thẻ ghi nợ',
      [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
      [PaymentMethod.DIGITAL_WALLET]: 'Ví điện tử',
      [PaymentMethod.CASH_ON_DELIVERY]: 'Thanh toán khi nhận hàng',
    };
    return methods[method];
  };

  const selectedAddress = addresses.find(
    (addr) => addr.id === values.addressId,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thông tin đặt hàng...</p>
        </div>
      </div>
    );
  }

  if (!cartSummary || cartSummary.totalItems === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Giỏ hàng trống
        </h3>
        <p className="text-gray-500 mb-6">
          Bạn cần thêm sản phẩm vào giỏ hàng trước khi thanh toán
        </p>
        <Button onClick={() => navigate('/shop')}>Tiếp tục mua sắm</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Thanh toán</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Địa chỉ giao hàng
            </h2>

            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">
                  Bạn chưa có địa chỉ giao hàng
                </p>
                <Button onClick={() => navigate('/profile/addresses')}>
                  Thêm địa chỉ
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                      values.addressId === address.id
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressId"
                      value={address.id}
                      checked={values.addressId === address.id}
                      onChange={handleChange}
                      className="sr-only"
                    />

                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">
                            {address.fullName}
                          </span>
                          {address.isDefault && (
                            <Badge variant="primary" size="sm">
                              Mặc định
                            </Badge>
                          )}
                        </div>

                        {address.phone && (
                          <p className="text-sm text-gray-600 mb-1">
                            📞 {address.phone}
                          </p>
                        )}

                        <p className="text-gray-700 text-sm">
                          {address.street}, {address.city}, {address.state}{' '}
                          {address.zipCode}, {address.country}
                        </p>
                      </div>

                      {values.addressId === address.id && (
                        <CheckCircleIcon className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </label>
                ))}

                {errors.addressId && (
                  <p className="text-sm text-red-600">{errors.addressId}</p>
                )}
              </div>
            )}
          </Card>

          {/* Payment Method */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CreditCardIcon className="w-5 h-5 mr-2" />
              Phương thức thanh toán
            </h2>

            <div className="space-y-3">
              {Object.values(PaymentMethod).map((method) => (
                <label
                  key={method}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    values.paymentMethod === method
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method}
                    checked={values.paymentMethod === method}
                    onChange={handleChange}
                    className="sr-only"
                  />

                  <div className="flex items-center justify-between">
                    <span className="font-medium">
                      {getPaymentMethodText(method)}
                    </span>

                    {values.paymentMethod === method && (
                      <CheckCircleIcon className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </label>
              ))}

              {errors.paymentMethod && (
                <p className="text-sm text-red-600">{errors.paymentMethod}</p>
              )}
            </div>
          </Card>

          {/* Order Notes */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ghi chú đơn hàng
            </h2>

            <textarea
              name="notes"
              rows={3}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Ghi chú cho người bán (tùy chọn)"
              value={values.notes}
              onChange={handleChange}
            />
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tóm tắt đơn hàng
            </h2>

            <div className="space-y-4 mb-6">
              {cartSummary.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={
                      item.product.images[0] || 'https://via.placeholder.com/60'
                    }
                    alt={item.product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      SL: {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Tạm tính</span>
                <span className="font-medium">
                  {formatPrice(cartSummary.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Phí vận chuyển</span>
                <span className="font-medium">
                  {cartSummary.estimatedShipping > 0
                    ? formatPrice(cartSummary.estimatedShipping)
                    : 'Miễn phí'}
                </span>
              </div>

              <hr />

              <div className="flex justify-between text-lg font-semibold">
                <span>Tổng cộng</span>
                <span className="text-primary">
                  {formatPrice(cartSummary.estimatedTotal)}
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <Button
                type="submit"
                fullWidth
                loading={processing}
                disabled={addresses.length === 0}
                leftIcon={<ShoppingBagIcon className="w-4 h-4" />}
              >
                {values.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                  ? 'Đặt hàng'
                  : 'Thanh toán'}
              </Button>
            </form>

            {selectedAddress && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center text-sm text-gray-600">
                  <TruckIcon className="w-4 h-4 mr-2" />
                  <span>Giao hàng đến: {selectedAddress.city}</span>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => !processing && setShowPaymentModal(false)}
        title="Thanh toán"
        size="md"
      >
        <form onSubmit={paymentForm.handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Số thẻ
            </label>
            <input
              type="text"
              name="cardNumber"
              placeholder="1234 5678 9012 3456"
              value={paymentForm.values.cardNumber}
              onChange={paymentForm.handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              maxLength={19}
            />
            {paymentForm.errors.cardNumber && (
              <p className="mt-1 text-sm text-red-600">
                {paymentForm.errors.cardNumber}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                MM/YY
              </label>
              <input
                type="text"
                name="expiryDate"
                placeholder="12/25"
                value={paymentForm.values.expiryDate}
                onChange={paymentForm.handleChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                maxLength={5}
              />
              {paymentForm.errors.expiryDate && (
                <p className="mt-1 text-sm text-red-600">
                  {paymentForm.errors.expiryDate}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                CVV
              </label>
              <input
                type="text"
                name="cvv"
                placeholder="123"
                value={paymentForm.values.cvv}
                onChange={paymentForm.handleChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                maxLength={4}
              />
              {paymentForm.errors.cvv && (
                <p className="mt-1 text-sm text-red-600">
                  {paymentForm.errors.cvv}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên chủ thẻ
            </label>
            <input
              type="text"
              name="cardHolder"
              placeholder="NGUYEN VAN A"
              value={paymentForm.values.cardHolder}
              onChange={paymentForm.handleChange}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
            {paymentForm.errors.cardHolder && (
              <p className="mt-1 text-sm text-red-600">
                {paymentForm.errors.cardHolder}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              🔒 Đây là môi trường demo. Thông tin thẻ sẽ không được lưu trữ.
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowPaymentModal(false)}
              disabled={processing}
            >
              Hủy
            </Button>
            <Button type="submit" loading={processing} className="flex-1">
              Thanh toán{' '}
              {cartSummary && formatPrice(cartSummary.estimatedTotal)}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
