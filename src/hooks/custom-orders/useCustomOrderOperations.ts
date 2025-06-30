import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import { customOrderService } from '../../services/custom-order.service';
import { CreateCustomOrderRequest } from '../../types/custom-order';

export const useCustomOrderOperations = () => {
  const navigate = useNavigate();
  const { state } = useAuth();
  const { success, error } = useToastContext();
  const [loading, setLoading] = useState(false);

  const createCustomOrder = async (data: CreateCustomOrderRequest) => {
    if (state.user?.role !== 'CUSTOMER') {
      error('Chỉ khách hàng mới có thể tạo custom order');
      return;
    }

    setLoading(true);
    try {
      const order = await customOrderService.createCustomOrder(data);
      success('Đã tạo yêu cầu custom order thành công');
      navigate(`/custom-orders/${order.id}`);
      return order;
    } catch (err: any) {
      error(err.message || 'Không thể tạo custom order');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateAndProceedToCheckout = async (orderId: string) => {
    try {
      // Logic chuyển custom order sang checkout
      const orderData = {
        type: 'custom_order',
        orderId,
      };

      sessionStorage.setItem('checkoutData', JSON.stringify(orderData));
      navigate('/checkout');
    } catch (err: any) {
      error(err.message || 'Không thể tiến hành thanh toán');
    }
  };

  const exportOrders = async (filters = {}, mode?: 'sent' | 'received') => {
    setLoading(true);
    try {
      const exportFilters = mode ? { ...filters, mode } : filters;
      const blob = await customOrderService.exportCustomOrders(exportFilters);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const modeText = mode ? `-${mode}` : '';
      link.setAttribute(
        'download',
        `custom-orders${modeText}-${Date.now()}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      success('Đã tải xuống danh sách custom orders');
    } catch (err: any) {
      error(err.message || 'Không thể tải xuống');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    createCustomOrder,
    validateAndProceedToCheckout,
    exportOrders,
  };
};
