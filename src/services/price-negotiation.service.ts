import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import {
  PriceNegotiationWithDetails,
  NegotiationSummary,
  CreateNegotiationRequest,
  RespondToNegotiationRequest,
  NegotiationStats,
  NegotiationStatus,
  CheckExistingNegotiationQuery,
} from '../types/price-negotiation';
import { PaginatedResponse } from '../types/common';

export interface GetNegotiationsQuery {
  page?: number;
  limit?: number;
  status?: NegotiationStatus | NegotiationStatus[];
  productId?: string;
  variantId?: string; // NEW
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

  // NEW: Get negotiations sent by current user (where they are customer)
  async getMySentNegotiations(
    query: GetNegotiationsQuery = {},
  ): Promise<PaginatedResponse<NegotiationSummary>> {
    return await apiClient.get<PaginatedResponse<NegotiationSummary>>(
      API_ENDPOINTS.PRICE_NEGOTIATION.MY_NEGOTIATIONS,
      { ...query, type: 'sent' },
    );
  },

  // NEW: Get negotiations received by current user (where they are artisan)
  async getMyReceivedNegotiations(
    query: GetNegotiationsQuery = {},
  ): Promise<PaginatedResponse<NegotiationSummary>> {
    return await apiClient.get<PaginatedResponse<NegotiationSummary>>(
      API_ENDPOINTS.PRICE_NEGOTIATION.MY_NEGOTIATIONS,
      { ...query, type: 'received' },
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

  // UPDATED: Check existing negotiation with variant support
  async checkExistingNegotiation(
    query: CheckExistingNegotiationQuery,
  ): Promise<{
    hasActive: boolean;
    negotiation?: PriceNegotiationWithDetails;
  }> {
    try {
      const response = await apiClient.get<
        PaginatedResponse<NegotiationSummary>
      >(API_ENDPOINTS.PRICE_NEGOTIATION.MY_NEGOTIATIONS, {
        page: 1,
        limit: 1,
        productId: query.productId,
        variantId: query.variantId,
        status: [NegotiationStatus.PENDING, NegotiationStatus.COUNTER_OFFERED],
      });

      if (response.data.length > 0) {
        // Get full details of the negotiation
        const fullNegotiation = await this.getNegotiation(response.data[0].id);
        return {
          hasActive: true,
          negotiation: fullNegotiation,
        };
      }

      return { hasActive: false };
    } catch (error) {
      console.error('Error checking existing negotiation:', error);
      return { hasActive: false };
    }
  },

  // Cancel negotiation
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
