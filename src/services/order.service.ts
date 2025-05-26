import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  OrderSummary,
  OrderWithDetails,
  OrderStatus,
  PaymentMethod,
  OrderStatusHistory,
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

export const orderService = {
  // Lấy đơn hàng của khách
  async getMyOrders(
    query: GetOrdersQuery = {},
  ): Promise<PaginatedResponse<OrderSummary>> {
    return await apiClient.get<PaginatedResponse<OrderSummary>>(
      API_ENDPOINTS.ORDERS.MY_ORDERS,
      query,
    );
  },

  // Lấy đơn hàng bán
  async getSellerOrders(
    query: GetOrdersQuery = {},
  ): Promise<PaginatedResponse<OrderSummary>> {
    return await apiClient.get<PaginatedResponse<OrderSummary>>(
      API_ENDPOINTS.ORDERS.SELLER_ORDERS,
      query,
    );
  },

  // Lấy chi tiết đơn hàng
  async getOrder(id: string): Promise<OrderWithDetails> {
    return await apiClient.get<OrderWithDetails>(
      API_ENDPOINTS.ORDERS.BY_ID(id),
    );
  },

  // Lấy đơn hàng theo số
  async getOrderByNumber(orderNumber: string): Promise<OrderWithDetails> {
    return await apiClient.get<OrderWithDetails>(
      API_ENDPOINTS.ORDERS.BY_NUMBER(orderNumber),
    );
  },

  // Lấy lịch sử trạng thái
  async getOrderStatusHistory(id: string): Promise<OrderStatusHistory[]> {
    return await apiClient.get<OrderStatusHistory[]>(
      API_ENDPOINTS.ORDERS.HISTORY(id),
    );
  },

  // Cập nhật trạng thái đơn hàng
  async updateOrderStatus(
    id: string,
    data: {
      status: OrderStatus;
      note?: string;
      trackingNumber?: string;
      estimatedDelivery?: Date;
    },
  ): Promise<OrderWithDetails> {
    return await apiClient.patch<OrderWithDetails>(
      API_ENDPOINTS.ORDERS.UPDATE_STATUS(id),
      data,
    );
  },

  // Hủy đơn hàng
  async cancelOrder(
    id: string,
    data: { reason?: string },
  ): Promise<OrderWithDetails> {
    return await apiClient.post<OrderWithDetails>(
      API_ENDPOINTS.ORDERS.CANCEL(id),
      data,
    );
  },

  // Thống kê đơn hàng
  async getOrderStats(query: any = {}): Promise<any> {
    return await apiClient.get<any>(API_ENDPOINTS.ORDERS.STATS, query);
  },
};
