import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  Order,
  OrderWithDetails,
  OrderSummary,
  OrderStatus,
  OrderStatusHistory,
  PaymentMethod,
  CreateOrderFromCartRequest,
  CreateOrderFromQuoteRequest,
  UpdateOrderStatusRequest,
  ProcessPaymentRequest,
  OrderStats,
} from '../types/order';
import { PaginatedResponse } from '../types/common';

export interface GetOrdersQuery {
  status?: OrderStatus | OrderStatus[];
  paymentStatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
}

export interface GetOrderStatsQuery {
  userId?: string;
  sellerId?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  dateFrom?: string;
  dateTo?: string;
}

export const orderService = {
  // === ORDER CREATION ===

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

  // === ORDER RETRIEVAL ===

  // Cập nhật để return OrderSummary thay vì Order
  async getMyOrders(
    query: GetOrdersQuery = {},
  ): Promise<PaginatedResponse<OrderSummary>> {
    return await apiClient.get<PaginatedResponse<OrderSummary>>(
      API_ENDPOINTS.ORDERS.MY_ORDERS,
      query,
    );
  },

  async getSellerOrders(
    query: GetOrdersQuery = {},
  ): Promise<PaginatedResponse<OrderSummary>> {
    return await apiClient.get<PaginatedResponse<OrderSummary>>(
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

  // Cập nhật return type cho OrderStatusHistory
  async getOrderStatusHistory(id: string): Promise<OrderStatusHistory[]> {
    return await apiClient.get<OrderStatusHistory[]>(
      API_ENDPOINTS.ORDERS.HISTORY(id),
    );
  },

  async getOrderStats(query: GetOrderStatsQuery = {}): Promise<OrderStats> {
    return await apiClient.get<OrderStats>(API_ENDPOINTS.ORDERS.STATS, query);
  },

  // === ORDER MANAGEMENT ===

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

  // === PAYMENT ===

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
