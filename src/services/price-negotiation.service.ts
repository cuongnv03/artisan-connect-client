import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  PriceNegotiationWithDetails,
  NegotiationSummary,
  CreateNegotiationRequest,
  RespondToNegotiationRequest,
  NegotiationStats,
  NegotiationStatus,
} from '../types/price-negotiation';
import { PaginatedResponse } from '../types/common';

export interface GetNegotiationsQuery {
  page?: number;
  limit?: number;
  status?: NegotiationStatus | NegotiationStatus[];
  productId?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'status' | 'proposedPrice' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
}

export interface GetNegotiationStatsQuery {
  userId?: string;
  userRole?: 'CUSTOMER' | 'ARTISAN';
  dateFrom?: string;
  dateTo?: string;
}

export const priceNegotiationService = {
  // Negotiation creation & management
  async createNegotiation(
    data: CreateNegotiationRequest,
  ): Promise<PriceNegotiationWithDetails> {
    return await apiClient.post<PriceNegotiationWithDetails>(
      API_ENDPOINTS.PRICE_NEGOTIATION.BASE,
      data,
    );
  },

  async respondToNegotiation(
    id: string,
    data: RespondToNegotiationRequest,
  ): Promise<PriceNegotiationWithDetails> {
    return await apiClient.post<PriceNegotiationWithDetails>(
      API_ENDPOINTS.PRICE_NEGOTIATION.RESPOND(id),
      data,
    );
  },

  // Negotiation retrieval
  async getNegotiation(id: string): Promise<PriceNegotiationWithDetails> {
    return await apiClient.get<PriceNegotiationWithDetails>(
      API_ENDPOINTS.PRICE_NEGOTIATION.BY_ID(id),
    );
  },

  async getMyNegotiations(
    query: GetNegotiationsQuery = {},
  ): Promise<PaginatedResponse<NegotiationSummary>> {
    return await apiClient.get<PaginatedResponse<NegotiationSummary>>(
      API_ENDPOINTS.PRICE_NEGOTIATION.MY_NEGOTIATIONS,
      query,
    );
  },

  async getNegotiationStats(
    query: GetNegotiationStatsQuery = {},
  ): Promise<NegotiationStats> {
    return await apiClient.get<NegotiationStats>(
      API_ENDPOINTS.PRICE_NEGOTIATION.STATS,
      query,
    );
  },

  // Negotiation management
  async cancelNegotiation(
    id: string,
    reason?: string,
  ): Promise<PriceNegotiationWithDetails> {
    return await apiClient.post<PriceNegotiationWithDetails>(
      API_ENDPOINTS.PRICE_NEGOTIATION.CANCEL(id),
      { reason },
    );
  },

  // Utility methods
  async validateNegotiationAccess(id: string): Promise<boolean> {
    try {
      await apiClient.get(
        `${API_ENDPOINTS.PRICE_NEGOTIATION.BY_ID(id)}/validate-access`,
      );
      return true;
    } catch {
      return false;
    }
  },
};
