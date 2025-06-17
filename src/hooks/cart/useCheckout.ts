import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';
import { useCart } from '../../contexts/CartContext';
import { cartService } from '../../services/cart.service';
import { orderService } from '../../services/order.service';
import { userService } from '../../services/user.service';
import { Address } from '../../types/user';
import { PaymentMethodType } from '../../types/order';

interface CheckoutData {
  addressId: string;
  paymentMethod: PaymentMethodType;
  notes: string;
}

export const useCheckout = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const { state: cartState, clearCart } = useCart();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      // Check if cart has items
      if (!cartState.summary || cartState.summary.totalItems === 0) {
        navigate('/cart');
        return;
      }

      // Load addresses
      const addressList = await userService.getAddresses();
      setAddresses(addressList);

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
      console.error('Error loading checkout data:', err);
      error('Có lỗi xảy ra khi tải dữ liệu');
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const processOrder = async (data: CheckoutData) => {
    setProcessing(true);
    try {
      // Validate cart one more time
      const validation = await cartService.validateForCheckout();
      if (!validation.isValid) {
        error(`Có lỗi với giỏ hàng: ${validation.errors.join(', ')}`);
        return null;
      }

      // Create order
      const order = await orderService.createOrderFromCart({
        addressId: data.addressId,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
      });

      // Process payment if needed
      if (data.paymentMethod !== PaymentMethod.CASH_ON_DELIVERY) {
        // Handle online payment flow
        // This would be implemented based on payment gateway
        await orderService.processPayment(order.id, {
          paymentReference: `PAY_${Date.now()}`,
          externalReference: 'demo_payment',
        });
      }

      // Clear cart after successful order
      await clearCart();
      success('Đặt hàng thành công!');

      return order;
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi đặt hàng');
      return null;
    } finally {
      setProcessing(false);
    }
  };

  const getDefaultAddress = () => {
    return addresses.find((addr) => addr.isDefault) || addresses[0] || null;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return {
    // State
    addresses,
    loading,
    processing,
    cartSummary: cartState.summary,

    // Actions
    processOrder,
    loadCheckoutData,

    // Helpers
    getDefaultAddress,
    formatPrice,

    // Validation
    canCheckout:
      !loading &&
      addresses.length > 0 &&
      cartState.summary &&
      cartState.summary.totalItems > 0,
  };
};
