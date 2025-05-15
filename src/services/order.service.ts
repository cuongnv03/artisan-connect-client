import api from './api';
import {
  Order,
  OrderQueryOptions,
  CreateOrderFromCartDto,
  CreateOrderFromQuoteDto,
  UpdateOrderStatusDto,
  UpdateShippingInfoDto,
  CancelOrderDto,
  OrderStatusHistory,
} from '../types/order.types';
import { PaginatedResponse } from '../types/api.types';

export const OrderService = {
  // Create order from cart
  createFromCart: async (data: CreateOrderFromCartDto): Promise<Order> => {
    const response = await api.post('/orders/from-cart', data);
    return response.data.data;
  },

  // Create order from quote
  createFromQuote: async (data: CreateOrderFromQuoteDto): Promise<Order> => {
    const response = await api.post('/orders/from-quote', data);
    return response.data.data;
  },

  // Get my orders (as customer)
  getMyOrders: async (
    options: OrderQueryOptions = {},
  ): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders/my-orders', { params: options });
    return response.data.data;
  },

  // Get my artisan orders (as seller)
  getMyArtisanOrders: async (
    options: OrderQueryOptions = {},
  ): Promise<PaginatedResponse<Order>> => {
    const response = await api.get('/orders/my-artisan-orders', {
      params: options,
    });
    return response.data.data;
  },

  // Get order details by ID
  getOrderById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data.data;
  },

  // Get order by order number
  getOrderByNumber: async (orderNumber: string): Promise<Order> => {
    const response = await api.get(`/orders/number/${orderNumber}`);
    return response.data.data;
  },

  // Update order status
  updateStatus: async (
    id: string,
    data: UpdateOrderStatusDto,
  ): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, data);
    return response.data.data;
  },

  // Update shipping info
  updateShippingInfo: async (
    id: string,
    data: UpdateShippingInfoDto,
  ): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/shipping`, data);
    return response.data.data;
  },

  // Cancel order
  cancelOrder: async (id: string, data: CancelOrderDto): Promise<Order> => {
    const response = await api.post(`/orders/${id}/cancel`, data);
    return response.data.data;
  },

  // Get order status history
  getOrderHistory: async (id: string): Promise<OrderStatusHistory[]> => {
    const response = await api.get(`/orders/${id}/history`);
    return response.data.data;
  },
};
