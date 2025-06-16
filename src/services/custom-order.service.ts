import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  CustomOrderWithDetails,
  CreateCustomOrderRequest,
  ArtisanResponseRequest,
  UpdateCustomOrderRequest,
  CustomOrderStats,
  QuoteStatus,
} from '../types/custom-order';
import { PaginatedResponse } from '../types/common';

export interface GetCustomOrdersQuery {
  page?: number;
  limit?: number;
  status?: QuoteStatus | QuoteStatus[];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'title' | 'finalPrice';
  sortOrder?: 'asc' | 'desc';
}

export interface GetCustomOrderStatsQuery {
  userId?: string;
  role?: 'CUSTOMER' | 'ARTISAN';
  dateFrom?: string;
  dateTo?: string;
}

export const customOrderService = {
  // Custom order creation & management
  async createCustomOrder(
    data: CreateCustomOrderRequest,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.BASE,
      data,
    );
  },

  async updateCustomOrder(
    id: string,
    data: UpdateCustomOrderRequest,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.patch<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.BY_ID(id),
      data,
    );
  },

  async respondToCustomOrder(
    id: string,
    data: ArtisanResponseRequest,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.RESPOND(id),
      data,
    );
  },

  // Custom order retrieval
  async getCustomOrder(id: string): Promise<CustomOrderWithDetails> {
    return await apiClient.get<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.BY_ID(id),
    );
  },

  async getMyCustomOrders(
    query: GetCustomOrdersQuery = {},
  ): Promise<PaginatedResponse<CustomOrderWithDetails>> {
    return await apiClient.get<PaginatedResponse<CustomOrderWithDetails>>(
      API_ENDPOINTS.CUSTOM_ORDER.MY_ORDERS,
      query,
    );
  },

  async getCustomOrderStats(
    query: GetCustomOrderStatsQuery = {},
  ): Promise<CustomOrderStats> {
    return await apiClient.get<CustomOrderStats>(
      API_ENDPOINTS.CUSTOM_ORDER.STATS,
      query,
    );
  },

  // Negotiation & communication
  async getNegotiationHistory(id: string): Promise<any[]> {
    return await apiClient.get<any[]>(API_ENDPOINTS.CUSTOM_ORDER.HISTORY(id));
  },

  async acceptCounterOffer(id: string): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.ACCEPT_COUNTER(id),
    );
  },

  // Custom order management
  async cancelCustomOrder(
    id: string,
    reason?: string,
  ): Promise<CustomOrderWithDetails> {
    return await apiClient.post<CustomOrderWithDetails>(
      API_ENDPOINTS.CUSTOM_ORDER.CANCEL(id),
      { reason },
    );
  },

  // Utility methods
  async validateCustomOrderAccess(id: string): Promise<boolean> {
    try {
      await apiClient.get(
        `${API_ENDPOINTS.CUSTOM_ORDER.BY_ID(id)}/validate-access`,
      );
      return true;
    } catch {
      return false;
    }
  },
};
