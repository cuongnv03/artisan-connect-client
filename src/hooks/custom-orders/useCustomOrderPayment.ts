import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToastContext } from '../../contexts/ToastContext';
import { customOrderService } from '../../services/custom-order.service';
import { orderService } from '../../services/order.service';
import { CustomOrderWithDetails } from '../../types/custom-order';
import { PaymentMethodType } from '../../types/order';

export const useCustomOrderPayment = () => {
  const navigate = useNavigate();
  const { success, error } = useToastContext();
  const [loading, setLoading] = useState(false);

  // Validate custom order for payment
  const validateForPayment = async (orderId: string): Promise<boolean> => {
    try {
      const validation = await customOrderService.validateForPayment(orderId);

      if (!validation.isValid) {
        error(`Không thể thanh toán: ${validation.errors.join(', ')}`);
        return false;
      }

      return true;
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi kiểm tra custom order');
      return false;
    }
  };

  // Prepare checkout data and navigate
  const proceedToPayment = async (order: CustomOrderWithDetails) => {
    setLoading(true);
    try {
      // Validate first
      const isValid = await validateForPayment(order.id);
      if (!isValid) {
        return;
      }

      // Prepare checkout data
      const checkoutData = {
        type: 'custom_order',
        customOrderId: order.id,
        artisanId: order.artisan.id,
        customerId: order.customer.id,
        title: order.title,
        description: order.description,
        finalPrice: order.finalPrice,
        estimatedPrice: order.estimatedPrice,
        timeline: order.timeline,
        specifications: order.specifications,
        attachmentUrls: order.attachmentUrls,
        referenceProduct: order.referenceProduct,
        artisanInfo: {
          name: `${order.artisan.firstName} ${order.artisan.lastName}`,
          shopName: order.artisan.artisanProfile?.shopName,
          isVerified: order.artisan.artisanProfile?.isVerified,
        },
      };

      // Store in session for checkout page
      sessionStorage.setItem('checkoutData', JSON.stringify(checkoutData));

      // Navigate to checkout
      navigate('/checkout?type=custom-order');
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi chuẩn bị thanh toán');
    } finally {
      setLoading(false);
    }
  };

  // Quick checkout for accepted custom orders
  const quickCheckout = async (
    orderId: string,
    addressId: string,
    paymentMethod: PaymentMethodType = PaymentMethodType.CASH_ON_DELIVERY,
    notes?: string,
  ) => {
    setLoading(true);
    try {
      // Validate first
      const isValid = await validateForPayment(orderId);
      if (!isValid) {
        return null;
      }

      // Create order directly
      const order = await orderService.createOrderFromQuote({
        quoteRequestId: orderId,
        addressId,
        paymentMethod,
        notes,
      });

      success('Đặt hàng thành công!');
      navigate(`/orders/${order.id}`);
      return order;
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi đặt hàng');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    validateForPayment,
    proceedToPayment,
    quickCheckout,
  };
};
