import { apiClient } from '../utils/api';
import { API_ENDPOINTS } from '../constants/api';
import { QuoteRequest, QuoteStatus, QuoteStats } from '../types/quote';
import { PaginatedResponse } from '../types/common';

export interface CreateQuoteRequestData {
  productId: string;
  requestedPrice?: number;
  specifications?: string;
  customerMessage?: string;
}

export interface RespondToQuoteData {
  status: QuoteStatus;
  counterOffer?: number;
  artisanMessage?: string;
  finalPrice?: number;
}

export interface AddQuoteMessageData {
  message: string;
  metadata?: Record<string, any>;
}

export interface CancelQuoteData {
  reason: string;
}

export interface GetQuoteRequestsQuery {
  status?: QuoteStatus;
  type?: 'sent' | 'received'; // sent = customer requests, received = artisan received
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetQuoteStatsQuery {
  period?: 'day' | 'week' | 'month' | 'year';
  dateFrom?: string;
  dateTo?: string;
}

export const quoteService = {
  // Quote creation & management
  async createQuoteRequest(
    data: CreateQuoteRequestData,
  ): Promise<QuoteRequest> {
    return await apiClient.post<QuoteRequest>(API_ENDPOINTS.QUOTES.BASE, data);
  },

  async getMyQuoteRequests(
    query: GetQuoteRequestsQuery = {},
  ): Promise<PaginatedResponse<QuoteRequest>> {
    return await apiClient.get<PaginatedResponse<QuoteRequest>>(
      API_ENDPOINTS.QUOTES.MY_QUOTES,
      query,
    );
  },

  async getQuoteRequest(id: string): Promise<QuoteRequest> {
    return await apiClient.get<QuoteRequest>(API_ENDPOINTS.QUOTES.BY_ID(id));
  },

  async getQuoteStats(query: GetQuoteStatsQuery = {}): Promise<QuoteStats> {
    return await apiClient.get<QuoteStats>(API_ENDPOINTS.QUOTES.STATS, query);
  },

  // Quote responses & negotiation
  async respondToQuote(
    id: string,
    data: RespondToQuoteData,
  ): Promise<QuoteRequest> {
    return await apiClient.post<QuoteRequest>(
      API_ENDPOINTS.QUOTES.RESPOND(id),
      data,
    );
  },

  async addQuoteMessage(id: string, data: AddQuoteMessageData): Promise<any> {
    return await apiClient.post<any>(API_ENDPOINTS.QUOTES.MESSAGES(id), data);
  },

  async getNegotiationHistory(id: string): Promise<any[]> {
    return await apiClient.get<any[]>(API_ENDPOINTS.QUOTES.HISTORY(id));
  },

  // Quote cancellation
  async cancelQuoteRequest(
    id: string,
    data: CancelQuoteData,
  ): Promise<QuoteRequest> {
    return await apiClient.post<QuoteRequest>(
      API_ENDPOINTS.QUOTES.CANCEL(id),
      data,
    );
  },

  async validateQuoteAccess(id: string): Promise<boolean> {
    try {
      await apiClient.get(`${API_ENDPOINTS.QUOTES.BY_ID(id)}/validate-access`);
      return true;
    } catch {
      return false;
    }
  },

  async expireOldQuotes(): Promise<{ expired: number }> {
    return await apiClient.post(`${API_ENDPOINTS.QUOTES.BASE}/expire`);
  },
};
