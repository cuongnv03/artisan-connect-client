import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CreditCardIcon,
  TruckIcon,
  MapPinIcon,
  ShoppingBagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
  UserIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useToastContext } from '../../contexts/ToastContext';
import { useCart } from '../../contexts/CartContext';
import { cartService } from '../../services/cart.service';
import { orderService } from '../../services/order.service';
import { userService } from '../../services/user.service';
import { CartSummary, CartItem } from '../../types/cart';
import {
  PaymentMethodType,
  CreateOrderFromCartRequest,
} from '../../types/order';
import { Address, CreateAddressRequest } from '../../types/user';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { AddressForm } from '../../components/profile/AddressForm';
import { useForm } from '../../hooks/common/useForm';

interface CheckoutFormData {
  addressId: string;
  paymentMethod: PaymentMethodType;
  notes: string;
}

interface CustomOrderCheckoutData {
  type: 'custom_order';
  customOrderId: string;
  artisanId: string;
  customerId: string;
  title: string;
  description: string;
  finalPrice?: number;
  estimatedPrice?: number;
  timeline?: string;
  specifications?: any;
  attachmentUrls?: string[];
  referenceProduct?: {
    id: string;
    name: string;
    images: string[];
    price: number;
  };
  artisanInfo: {
    name: string;
    shopName?: string;
    isVerified?: boolean;
  };
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardHolder: string;
}

// ===== NEW: Constants and helper functions =====
const TAX_RATE = 0.08; // 8% tax rate

// Helper function to get the correct price for an item
const getItemPrice = (item: CartItem): number => {
  // Priority: negotiated price > variant price > product price
  if (item.negotiationId && item.negotiation?.finalPrice) {
    return item.negotiation.finalPrice;
  }

  if (item.variant) {
    return item.variant.discountPrice || item.variant.price;
  }

  return item.product?.discountPrice || item.product?.price || item.price;
};

// Helper function to get item display info
const getItemDisplayInfo = (item: CartItem) => {
  const price = getItemPrice(item);
  const isNegotiated = !!(item.negotiationId && item.negotiation?.finalPrice);
  const isVariant = !!item.variant;

  return {
    price,
    isNegotiated,
    isVariant,
    displayName: item.product?.name || 'Unknown Product',
    variantInfo: isVariant
      ? {
          name: item.variant?.name,
        }
      : null,
  };
};

// Helper function to calculate order totals
const calculateOrderTotals = (summary: CartSummary) => {
  // Calculate subtotal using correct item prices
  const subtotal = summary.items.reduce((total, item) => {
    const itemPrice = getItemPrice(item);
    return total + itemPrice * item.quantity;
  }, 0);

  // Calculate tax
  const taxAmount = subtotal * TAX_RATE;

  // Calculate shipping (free for now, but can be customized)
  const shippingCost = 0;

  // Calculate total
  const total = subtotal + taxAmount + shippingCost;

  return {
    subtotal,
    taxAmount,
    shippingCost,
    total,
  };
};

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error } = useToastContext();
  const { state: cartState, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [orderData, setOrderData] = useState<CheckoutFormData | null>(null);
  const [customOrderData, setCustomOrderData] = useState<any>(null);

  // Check if this is custom order checkout
  const isCustomOrderCheckout = searchParams.get('type') === 'custom-order';

  const { values, handleChange, handleSubmit, setFieldValue, errors } =
    useForm<CheckoutFormData>({
      initialValues: {
        addressId: '',
        paymentMethod: PaymentMethodType.CASH_ON_DELIVERY,
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

  // Load checkout data on mount
  useEffect(() => {
    if (isCustomOrderCheckout) {
      loadCustomOrderCheckoutData();
    } else {
      loadCartCheckoutData();
    }
  }, [isCustomOrderCheckout]);

  // Load custom order checkout data
  const loadCustomOrderCheckoutData = async () => {
    try {
      // Get custom order data from session storage
      const savedData = sessionStorage.getItem('checkoutData');
      if (!savedData) {
        error('Không tìm thấy thông tin custom order');
        navigate('/custom-orders');
        return;
      }

      const checkoutData: CustomOrderCheckoutData = JSON.parse(savedData);

      // Validate custom order data
      if (!checkoutData.customOrderId || !checkoutData.finalPrice) {
        error('Thông tin custom order không hợp lệ');
        navigate('/custom-orders');
        return;
      }

      setCustomOrderData(checkoutData);

      // Load addresses
      const addressList = await userService.getAddresses();
      setAddresses(addressList);

      // Set default address
      const defaultAddress = addressList.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setFieldValue('addressId', defaultAddress.id);
      } else if (addressList.length > 0) {
        setFieldValue('addressId', addressList[0].id);
      }

      // Clear session storage after loading
      sessionStorage.removeItem('checkoutData');
    } catch (err: any) {
      console.error('Error loading custom order checkout data:', err);
      error('Có lỗi xảy ra khi tải thông tin checkout');
      navigate('/custom-orders');
    } finally {
      setLoading(false);
    }
  };

  // Load cart checkout data (existing logic)
  const loadCartCheckoutData = async () => {
    try {
      // Check if cart has items
      if (!cartState.summary || cartState.summary.totalItems === 0) {
        navigate('/cart');
        return;
      }

      // Load addresses
      const addressList = await userService.getAddresses();
      setAddresses(addressList);

      // Set default address
      const defaultAddress = addressList.find((addr) => addr.isDefault);
      if (defaultAddress) {
        setFieldValue('addressId', defaultAddress.id);
      } else if (addressList.length > 0) {
        setFieldValue('addressId', addressList[0].id);
      }

      // Validate cart for checkout
      const validation = await cartService.validateForCheckout();
      if (!validation.isValid) {
        error(`Có vấn đề với giỏ hàng: ${validation.errors.join(', ')}`);
        navigate('/cart');
        return;
      }

      if (validation.warnings.length > 0) {
        validation.warnings.forEach((warning) => {
          console.warn(warning);
        });
      }
    } catch (err: any) {
      console.error('Error loading cart checkout data:', err);
      error('Có lỗi xảy ra khi tải dữ liệu');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAddress = async (data: CreateAddressRequest) => {
    try {
      const newAddress = await userService.createAddress(data);

      // Update addresses list
      const updatedAddresses = [...addresses, newAddress];
      setAddresses(updatedAddresses);

      // Set the new address as selected
      setFieldValue('addressId', newAddress.id);

      // Close the form
      setShowAddressForm(false);

      success('Địa chỉ đã được thêm thành công');
    } catch (err: any) {
      error(err.message || 'Không thể thêm địa chỉ');
      throw err;
    }
  };

  async function handlePlaceOrder(data: CheckoutFormData) {
    setProcessing(true);
    try {
      let order;

      if (customOrderData) {
        // Create order from custom order (quote)
        order = await orderService.createOrderFromQuote({
          quoteRequestId: customOrderData.customOrderId,
          addressId: data.addressId,
          paymentMethod: data.paymentMethod,
          notes: data.notes || `Custom order: ${customOrderData.title}`,
        });

        // Clear custom order data
        setCustomOrderData(null);
      } else {
        // Regular cart order
        if (data.paymentMethod === PaymentMethodType.CASH_ON_DELIVERY) {
          order = await orderService.createOrderFromCart({
            addressId: data.addressId,
            paymentMethod: data.paymentMethod,
            notes: data.notes,
          });

          // Clear cart after successful order
          await clearCart();
        } else {
          // Show payment modal for card payment
          setOrderData(data);
          setShowPaymentModal(true);
          setProcessing(false);
          return;
        }
      }

      success('Đặt hàng thành công!');
      navigate(`/orders/${order.id}`);
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
      let order;

      if (customOrderData) {
        // Create order from custom order with payment
        order = await orderService.createOrderFromQuote({
          quoteRequestId: customOrderData.customOrderId,
          addressId: orderData.addressId,
          paymentMethod: orderData.paymentMethod,
          notes: orderData.notes || `Custom order: ${customOrderData.title}`,
        });

        // Process payment
        await orderService.processPayment(order.id, {
          paymentReference: `CARD_${Date.now()}`,
          externalReference: paymentData.cardNumber.slice(-4),
        });
      } else {
        // Create order from cart with payment
        order = await orderService.createOrderFromCart({
          addressId: orderData.addressId,
          paymentMethod: orderData.paymentMethod,
          notes: orderData.notes,
        });

        // Process payment
        await orderService.processPayment(order.id, {
          paymentReference: `CARD_${Date.now()}`,
          externalReference: paymentData.cardNumber.slice(-4),
        });

        // Clear cart after successful order
        await clearCart();
      }

      success('Thanh toán thành công!');
      setShowPaymentModal(false);
      navigate(`/orders/${order.id}`);
    } catch (err: any) {
      error(err.message || 'Thanh toán thất bại');
    } finally {
      setProcessing(false);
    }
  }

  // Utility functions
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getPaymentMethodText = (method: PaymentMethodType) => {
    const methods = {
      [PaymentMethodType.CREDIT_CARD]: 'Thẻ tín dụng',
      [PaymentMethodType.CASH_ON_DELIVERY]: 'Thanh toán khi nhận hàng',
    };
    return methods[method];
  };

  const selectedAddress = addresses.find(
    (addr) => addr.id === values.addressId,
  );

  // Render custom order summary
  const renderCustomOrderSummary = () => {
    if (!customOrderData) return null;

    const finalPrice =
      customOrderData.finalPrice || customOrderData.estimatedPrice || 0;
    const taxAmount = finalPrice * 0.08; // 8% tax
    const shippingCost = 0; // Free shipping for custom orders
    const totalAmount = finalPrice + taxAmount + shippingCost;

    return (
      <Card className="p-6 sticky top-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <WrenchScrewdriverIcon className="w-5 h-5 mr-2 text-orange-500" />
          Tóm tắt Custom Order
        </h2>

        {/* Custom Order Details */}
        <div className="space-y-4 mb-6">
          <div className="border-b pb-4">
            <h4 className="font-medium text-gray-900 mb-2">
              {customOrderData.title}
            </h4>
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {customOrderData.description}
            </p>

            {/* Artisan Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <UserIcon className="w-4 h-4" />
              <span>Nghệ nhân: {customOrderData.artisanInfo.name}</span>
              {customOrderData.artisanInfo.isVerified && (
                <Badge variant="success" size="sm">
                  ✓
                </Badge>
              )}
            </div>

            {customOrderData.artisanInfo.shopName && (
              <p className="text-sm text-gray-500 mt-1">
                Shop: {customOrderData.artisanInfo.shopName}
              </p>
            )}

            {/* Timeline */}
            {customOrderData.timeline && (
              <div className="flex items-center space-x-2 text-sm text-gray-600 mt-2">
                <ClockIcon className="w-4 h-4" />
                <span>Thời gian: {customOrderData.timeline}</span>
              </div>
            )}
          </div>

          {/* Reference Product */}
          {customOrderData.referenceProduct && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <h5 className="text-sm font-medium text-blue-900 mb-2">
                Sản phẩm tham khảo:
              </h5>
              <div className="flex items-center space-x-3">
                <img
                  src={customOrderData.referenceProduct.images[0]}
                  alt={customOrderData.referenceProduct.name}
                  className="w-12 h-12 object-cover rounded"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    {customOrderData.referenceProduct.name}
                  </p>
                  <p className="text-sm text-blue-700">
                    {formatPrice(customOrderData.referenceProduct.price)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Specifications Preview */}
          {customOrderData.specifications &&
            Object.keys(customOrderData.specifications).length > 0 && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h5 className="text-sm font-medium text-purple-900 mb-2">
                  Thông số kỹ thuật:
                </h5>
                <div className="text-sm text-purple-800">
                  {Object.keys(customOrderData.specifications).length} thông số
                </div>
              </div>
            )}

          {/* Attachments */}
          {customOrderData.attachmentUrls &&
            customOrderData.attachmentUrls.length > 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="text-sm font-medium text-green-900 mb-2">
                  Hình ảnh tham khảo:
                </h5>
                <div className="text-sm text-green-800">
                  {customOrderData.attachmentUrls.length} hình ảnh
                </div>
              </div>
            )}
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between">
            <span className="text-gray-600">Giá custom order:</span>
            <span className="font-medium">{formatPrice(finalPrice)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Thuế (8%):</span>
            <span className="font-medium">{formatPrice(taxAmount)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Phí vận chuyển:</span>
            <span className="font-medium text-green-600">Miễn phí</span>
          </div>

          <hr />

          <div className="flex justify-between text-lg font-semibold">
            <span>Tổng cộng:</span>
            <span className="text-primary">{formatPrice(totalAmount)}</span>
          </div>
        </div>

        {/* Place Order Button */}
        <form onSubmit={handleSubmit}>
          <Button
            type="submit"
            fullWidth
            loading={processing}
            disabled={addresses.length === 0 && !showAddressForm}
            leftIcon={<ShoppingBagIcon className="w-4 h-4" />}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
          >
            {values.paymentMethod === PaymentMethodType.CASH_ON_DELIVERY
              ? `Đặt Custom Order • ${formatPrice(totalAmount)}`
              : `Thanh toán Custom Order • ${formatPrice(totalAmount)}`}
          </Button>
        </form>

        {/* Delivery Info */}
        {selectedAddress && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center text-sm text-gray-600">
              <TruckIcon className="w-4 h-4 mr-2" />
              <span>Giao hàng đến: {selectedAddress.city}</span>
            </div>
          </div>
        )}
      </Card>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {isCustomOrderCheckout
              ? 'Đang tải thông tin custom order...'
              : 'Đang tải thông tin đặt hàng...'}
          </p>
        </div>
      </div>
    );
  }

  // Empty state for custom order
  if (isCustomOrderCheckout && !customOrderData) {
    return (
      <div className="text-center py-12">
        <WrenchScrewdriverIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không tìm thấy thông tin custom order
        </h3>
        <p className="text-gray-500 mb-6">
          Vui lòng thử lại từ trang chi tiết custom order
        </p>
        <Button onClick={() => navigate('/custom-orders/requests')}>
          Về trang Custom Orders
        </Button>
      </div>
    );
  }

  // Empty cart state
  if (
    !isCustomOrderCheckout &&
    (!cartState.summary || cartState.summary.totalItems === 0)
  ) {
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

  const { summary } = cartState;

  // ===== UPDATED: Calculate correct totals =====
  const orderTotals = calculateOrderTotals(summary);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">
        {isCustomOrderCheckout ? 'Thanh toán Custom Order' : 'Thanh toán'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Address */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPinIcon className="w-5 h-5 mr-2" />
              Địa chỉ giao hàng
            </h2>

            {showAddressForm ? (
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-4">
                  Thêm địa chỉ mới
                </h3>
                <AddressForm
                  onSubmit={handleCreateAddress}
                  onCancel={() => setShowAddressForm(false)}
                />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-8">
                <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">
                  Bạn chưa có địa chỉ giao hàng
                </p>
                <Button
                  onClick={() => setShowAddressForm(true)}
                  leftIcon={<PlusIcon className="w-4 h-4" />}
                >
                  Thêm địa chỉ giao hàng
                </Button>
              </div>
            ) : (
              <div>
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

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddressForm(true)}
                    leftIcon={<PlusIcon className="w-4 h-4" />}
                  >
                    Thêm địa chỉ mới
                  </Button>
                </div>
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
              {Object.values(PaymentMethodType).map((method) => (
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
              placeholder={
                isCustomOrderCheckout
                  ? 'Ghi chú cho nghệ nhân (tùy chọn)'
                  : 'Ghi chú cho người bán (tùy chọn)'
              }
              value={values.notes}
              onChange={handleChange}
            />
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          {isCustomOrderCheckout ? (
            renderCustomOrderSummary()
          ) : (
            <Card className="p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Tóm tắt đơn hàng
              </h2>

              {/* ===== UPDATED: Order items with correct pricing ===== */}
              <div className="space-y-4 mb-6">
                {summary.groupedBySeller.map((sellerGroup) => (
                  <div
                    key={sellerGroup.sellerId}
                    className="border-b pb-4 last:border-b-0"
                  >
                    <h4 className="font-medium text-sm text-gray-700 mb-2">
                      {sellerGroup.sellerInfo.shopName ||
                        sellerGroup.sellerInfo.name}
                    </h4>
                    {sellerGroup.items.map((item) => {
                      const displayInfo = getItemDisplayInfo(item);

                      return (
                        <div
                          key={item.id}
                          className="flex items-start space-x-3 mb-3"
                        >
                          <img
                            src={
                              // ===== UPDATED: Prioritize variant images =====
                              item.variant?.images?.[0] ||
                              item.product?.images?.[0] ||
                              'https://via.placeholder.com/60'
                            }
                            alt={displayInfo.displayName}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {displayInfo.displayName}
                            </p>

                            {/* ===== NEW: Display variant info ===== */}
                            {displayInfo.variantInfo && (
                              <div className="text-xs text-gray-500 mt-1">
                                {displayInfo.variantInfo.name && (
                                  <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-1">
                                    {displayInfo.variantInfo.name}
                                  </span>
                                )}
                                {displayInfo.variantInfo.attributes &&
                                  Object.entries(
                                    displayInfo.variantInfo.attributes,
                                  ).map(([key, value]) => (
                                    <span key={key} className="mr-2">
                                      {key}: {String(value)}
                                    </span>
                                  ))}
                              </div>
                            )}

                            {/* ===== NEW: Negotiated price indicator ===== */}
                            {displayInfo.isNegotiated && (
                              <div className="flex items-center text-xs text-blue-600 mt-1">
                                <span className="mr-1">💰</span>
                                <span>Giá thương lượng</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-1">
                              <p className="text-sm text-gray-500">
                                SL: {item.quantity} x{' '}
                                {formatPrice(displayInfo.price)}
                              </p>
                              <p className="text-sm font-medium text-gray-900">
                                {formatPrice(displayInfo.price * item.quantity)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* ===== UPDATED: Order totals with tax ===== */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tạm tính</span>
                  <span className="font-medium">
                    {formatPrice(orderTotals.subtotal)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Thuế (8%)</span>
                  <span className="font-medium">
                    {formatPrice(orderTotals.taxAmount)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Phí vận chuyển</span>
                  <span className="font-medium">
                    {orderTotals.shippingCost > 0
                      ? formatPrice(orderTotals.shippingCost)
                      : 'Miễn phí'}
                  </span>
                </div>

                <hr />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Tổng cộng</span>
                  <span className="text-primary">
                    {formatPrice(orderTotals.total)}
                  </span>
                </div>
              </div>

              {/* ===== NEW: Special pricing notices ===== */}
              {summary.hasNegotiatedItems && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-sm text-blue-800">
                    <span className="mr-2">💰</span>
                    <span>Đơn hàng có sản phẩm với giá đã thương lượng</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <Button
                  type="submit"
                  fullWidth
                  loading={processing}
                  disabled={addresses.length === 0 && !showAddressForm}
                  leftIcon={<ShoppingBagIcon className="w-4 h-4" />}
                >
                  {values.paymentMethod === PaymentMethodType.CASH_ON_DELIVERY
                    ? `Đặt hàng • ${formatPrice(orderTotals.total)}`
                    : `Thanh toán • ${formatPrice(orderTotals.total)}`}
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
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => !processing && setShowPaymentModal(false)}
        title={`Thanh toán ${isCustomOrderCheckout ? 'Custom Order' : ''}`}
        size="md"
        closeOnEscape={false}
        closeOnOverlayClick={false}
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
              {customOrderData
                ? formatPrice((customOrderData.finalPrice || 0) * 1.08)
                : ''}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
