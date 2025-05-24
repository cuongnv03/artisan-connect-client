import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { Order, OrderStatus, PaymentMethod } from '../types/order';
import { PaginatedResponse } from '../types/common';

export interface CreateOrderFromCartRequest {
  addressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface CreateOrderFromQuoteRequest {
  quoteId: string;
  addressId: string;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface ProcessPaymentRequest {
  paymentMethod: PaymentMethod;
  paymentData?: Record<string, any>;
}

export interface GetOrdersQuery {
  status?: OrderStatus;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface GetOrderStatsQuery {
  period?: 'day' | 'week' | 'month' | 'year';
  dateFrom?: string;
  dateTo?: string;
}

export const orderService = {
  // Order creation
  async createOrderFromCart(data: CreateOrderFromCartRequest): Promise<Order> {
    return await apiClient.post<Order>(API_ENDPOINTS.ORDERS.FROM_CART, data);
  },

  async createOrderFromQuote(
    data: CreateOrderFromQuoteRequest,
  ): Promise<Order> {
    return await apiClient.post<Order>(API_ENDPOINTS.ORDERS.FROM_QUOTE, data);
  },

  // Order retrieval
  async getMyOrders(
    query: GetOrdersQuery = {},
  ): Promise<PaginatedResponse<Order>> {
    return await apiClient.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.ORDERS.MY_ORDERS,
      query,
    );
  },

  async getSellerOrders(
    query: GetOrdersQuery = {},
  ): Promise<PaginatedResponse<Order>> {
    return await apiClient.get<PaginatedResponse<Order>>(
      API_ENDPOINTS.ORDERS.SELLER_ORDERS,
      query,
    );
  },

  async getOrder(id: string): Promise<Order> {
    return await apiClient.get<Order>(API_ENDPOINTS.ORDERS.BY_ID(id));
  },

  async getOrderByNumber(orderNumber: string): Promise<Order> {
    return await apiClient.get<Order>(
      API_ENDPOINTS.ORDERS.BY_NUMBER(orderNumber),
    );
  },

  async getOrderStatusHistory(id: string): Promise<any[]> {
    return await apiClient.get<any[]>(API_ENDPOINTS.ORDERS.HISTORY(id));
  },

  async getOrderStats(query: GetOrderStatsQuery = {}): Promise<any> {
    return await apiClient.get<any>(API_ENDPOINTS.ORDERS.STATS, query);
  },

  // Order management
  async updateOrderStatus(
    id: string,
    data: UpdateOrderStatusRequest,
  ): Promise<Order> {
    return await apiClient.patch<Order>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
      data,
    );
  },

  async cancelOrder(id: string, data: CancelOrderRequest): Promise<Order> {
    return await apiClient.post<Order>(API_ENDPOINTS.ORDERS.CANCEL(id), data);
  },

  async processPayment(
    id: string,
    data: ProcessPaymentRequest,
  ): Promise<Order> {
    return await apiClient.post<Order>(API_ENDPOINTS.ORDERS.PAYMENT(id), data);
  },
};
