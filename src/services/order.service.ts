import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  OrderWithDetails,
  OrderSummary,
  OrderStats,
  OrderStatusHistory,
  CreateOrderFromCartRequest,
  CreateOrderFromQuoteRequest,
  UpdateOrderStatusRequest,
  ProcessPaymentRequest,
  GetOrdersQuery,
  GetOrderStatsQuery,
  // Dispute types
  OrderDisputeWithDetails,
  CreateDisputeRequest,
  UpdateDisputeRequest,
  GetDisputesQuery,
  // Return types
  OrderReturnWithDetails,
  CreateReturnRequest,
  UpdateReturnRequest,
  GetReturnsQuery,
} from '../types/order';
import { PaginatedResponse } from '../types/common';
import { customOrderService } from './custom-order.service';

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
    try {
      // Validate quote request exists and is accepted
      const quote = await customOrderService.getCustomOrder(
        data.quoteRequestId,
      );

      if (!quote) {
        throw new Error('Custom order không tồn tại');
      }

      if (quote.status !== 'ACCEPTED') {
        throw new Error(
          'Chỉ có thể tạo đơn hàng từ custom order đã được chấp nhận',
        );
      }

      if (!quote.finalPrice) {
        throw new Error('Custom order chưa có giá cuối');
      }

      // Create order from quote
      const order = await apiClient.post<OrderWithDetails>(
        API_ENDPOINTS.ORDERS.FROM_QUOTE,
        data,
      );

      return order;
    } catch (error: any) {
      console.error('Error creating order from quote:', error);
      throw error;
    }
  },

  // === ORDER RETRIEVAL ===
  async getMyOrders(
    query: GetOrdersQuery = {},
  ): Promise<PaginatedResponse<OrderSummary>> {
    return await apiClient.get<PaginatedResponse<OrderSummary>>(
      API_ENDPOINTS.ORDERS.MY_ORDERS,
      query,
    );
  },

  async getMyArtisanOrders(
    query: GetOrdersQuery = {},
  ): Promise<PaginatedResponse<OrderSummary>> {
    return await apiClient.get<PaginatedResponse<OrderSummary>>(
      API_ENDPOINTS.ORDERS.MY_ARTISAN_ORDERS,
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
      { reason },
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

  // === DISPUTE MANAGEMENT===
  async createDispute(
    data: CreateDisputeRequest,
  ): Promise<OrderDisputeWithDetails> {
    return await apiClient.post<OrderDisputeWithDetails>(
      API_ENDPOINTS.ORDERS.DISPUTES.CREATE,
      data,
    );
  },

  async getMyDisputes(
    query: GetDisputesQuery = {},
  ): Promise<PaginatedResponse<OrderDisputeWithDetails>> {
    return await apiClient.get<PaginatedResponse<OrderDisputeWithDetails>>(
      API_ENDPOINTS.ORDERS.DISPUTES.MY,
      query,
    );
  },

  async getDispute(id: string): Promise<OrderDisputeWithDetails> {
    return await apiClient.get<OrderDisputeWithDetails>(
      API_ENDPOINTS.ORDERS.DISPUTES.BY_ID(id),
    );
  },

  async updateDispute(
    id: string,
    data: UpdateDisputeRequest,
  ): Promise<OrderDisputeWithDetails> {
    return await apiClient.patch<OrderDisputeWithDetails>(
      API_ENDPOINTS.ORDERS.DISPUTES.UPDATE(id),
      data,
    );
  },

  // Admin only
  async getAllDisputes(
    query: GetDisputesQuery = {},
  ): Promise<PaginatedResponse<OrderDisputeWithDetails>> {
    return await apiClient.get<PaginatedResponse<OrderDisputeWithDetails>>(
      API_ENDPOINTS.ORDERS.DISPUTES.ALL,
      query,
    );
  },

  // === RETURN MANAGEMENT===
  async createReturn(
    data: CreateReturnRequest,
  ): Promise<OrderReturnWithDetails> {
    return await apiClient.post<OrderReturnWithDetails>(
      API_ENDPOINTS.ORDERS.RETURNS.CREATE,
      data,
    );
  },

  async getMyReturns(
    query: GetReturnsQuery = {},
  ): Promise<PaginatedResponse<OrderReturnWithDetails>> {
    return await apiClient.get<PaginatedResponse<OrderReturnWithDetails>>(
      API_ENDPOINTS.ORDERS.RETURNS.MY,
      query,
    );
  },

  async getReturn(id: string): Promise<OrderReturnWithDetails> {
    return await apiClient.get<OrderReturnWithDetails>(
      API_ENDPOINTS.ORDERS.RETURNS.BY_ID(id),
    );
  },

  async updateReturn(
    id: string,
    data: UpdateReturnRequest,
  ): Promise<OrderReturnWithDetails> {
    return await apiClient.patch<OrderReturnWithDetails>(
      API_ENDPOINTS.ORDERS.RETURNS.UPDATE(id),
      data,
    );
  },

  // Admin only
  async getAllReturns(
    query: GetReturnsQuery = {},
  ): Promise<PaginatedResponse<OrderReturnWithDetails>> {
    return await apiClient.get<PaginatedResponse<OrderReturnWithDetails>>(
      API_ENDPOINTS.ORDERS.RETURNS.ALL,
      query,
    );
  },
};
