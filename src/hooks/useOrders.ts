import { useQuery, useMutation, useQueryClient } from 'react-query';
import { OrderService } from '../services/order.service';
import {
  Order,
  OrderQueryOptions,
  CreateOrderFromCartDto,
  CreateOrderFromQuoteDto,
  UpdateOrderStatusDto,
  UpdateShippingInfoDto,
  CancelOrderDto,
} from '../types/order.types';
import { useToast } from './useToast';

export const useOrders = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // Get customer orders
  const useMyOrders = (options: OrderQueryOptions = {}) => {
    return useQuery(
      ['my-orders', options],
      () => OrderService.getMyOrders(options),
      {
        keepPreviousData: true,
      },
    );
  };

  // Get artisan orders (as seller)
  const useMyArtisanOrders = (options: OrderQueryOptions = {}) => {
    return useQuery(
      ['my-artisan-orders', options],
      () => OrderService.getMyArtisanOrders(options),
      {
        keepPreviousData: true,
      },
    );
  };

  // Get order details
  const useOrder = (id: string) => {
    return useQuery(['order', id], () => OrderService.getOrderById(id), {
      enabled: !!id,
    });
  };

  // Get order by number
  const useOrderByNumber = (orderNumber: string) => {
    return useQuery(
      ['order-by-number', orderNumber],
      () => OrderService.getOrderByNumber(orderNumber),
      {
        enabled: !!orderNumber,
      },
    );
  };

  // Create order from cart
  const useCreateOrderFromCart = () => {
    return useMutation(
      (data: CreateOrderFromCartDto) => OrderService.createFromCart(data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries('my-orders');
          toast.success('Order created successfully');
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || 'Failed to create order',
          );
        },
      },
    );
  };

  // Create order from quote
  const useCreateOrderFromQuote = () => {
    return useMutation(
      (data: CreateOrderFromQuoteDto) => OrderService.createFromQuote(data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries('my-orders');
          toast.success('Order created successfully');
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || 'Failed to create order',
          );
        },
      },
    );
  };

  // Update order status
  const useUpdateOrderStatus = (id: string) => {
    return useMutation(
      (data: UpdateOrderStatusDto) => OrderService.updateStatus(id, data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['order', id]);
          queryClient.invalidateQueries('my-artisan-orders');
          toast.success('Order status updated');
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || 'Failed to update order status',
          );
        },
      },
    );
  };

  // Update shipping info
  const useUpdateShippingInfo = (id: string) => {
    return useMutation(
      (data: UpdateShippingInfoDto) =>
        OrderService.updateShippingInfo(id, data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['order', id]);
          toast.success('Shipping information updated');
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || 'Failed to update shipping info',
          );
        },
      },
    );
  };

  // Cancel order
  const useCancelOrder = (id: string) => {
    return useMutation(
      (data: CancelOrderDto) => OrderService.cancelOrder(id, data),
      {
        onSuccess: () => {
          queryClient.invalidateQueries(['order', id]);
          queryClient.invalidateQueries('my-orders');
          toast.success('Order cancelled');
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || 'Failed to cancel order',
          );
        },
      },
    );
  };

  // Get order history
  const useOrderHistory = (id: string) => {
    return useQuery(
      ['order-history', id],
      () => OrderService.getOrderHistory(id),
      {
        enabled: !!id,
      },
    );
  };

  return {
    useMyOrders,
    useMyArtisanOrders,
    useOrder,
    useOrderByNumber,
    useCreateOrderFromCart,
    useCreateOrderFromQuote,
    useUpdateOrderStatus,
    useUpdateShippingInfo,
    useCancelOrder,
    useOrderHistory,
  };
};
