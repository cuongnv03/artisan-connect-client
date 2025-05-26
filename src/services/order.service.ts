import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Order,
  OrderWithDetails,
  OrderStatus,
  PaymentMethod,
  CreateOrderFromCartRequest,
  CreateOrderFromQuoteRequest,
  UpdateOrderStatusRequest,
  ProcessPaymentRequest,
} from '../types/order';
import { PaginatedResponse } from '../types/common';

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
  async createOrderFromCart(
    data: CreateOrderFromCartRequest,
  ): Promise<OrderWithDetails> {
    return await apiClient.post<OrderWithDetails>(
      API_ENDPOINTS.ORDERS.FROM_CART,
      data,
    );
  },

  async createOrderFromQuote(
    data: CreateOrderFromQuoteRequest,
  ): Promise<OrderWithDetails> {
    return await apiClient.post<OrderWithDetails>(
      API_ENDPOINTS.ORDERS.FROM_QUOTE,
      data,
    );
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

  async getOrder(id: string): Promise<OrderWithDetails> {
    return await apiClient.get<OrderWithDetails>(
      API_ENDPOINTS.ORDERS.BY_ID(id),
    );
  },

  async getOrderByNumber(orderNumber: string): Promise<OrderWithDetails> {
    return await apiClient.get<OrderWithDetails>(
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
  ): Promise<OrderWithDetails> {
    return await apiClient.patch<OrderWithDetails>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
      data,
    );
  },

  async cancelOrder(id: string, reason?: string): Promise<OrderWithDetails> {
    return await apiClient.post<OrderWithDetails>(
      API_ENDPOINTS.ORDERS.CANCEL(id),
      {
        reason,
      },
    );
  },

  async processPayment(
    id: string,
    data: ProcessPaymentRequest,
  ): Promise<OrderWithDetails> {
    return await apiClient.post<OrderWithDetails>(
      API_ENDPOINTS.ORDERS.PAYMENT(id),
      data,
    );
  },
};
