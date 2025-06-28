import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';
import { API_ENDPOINTS } from '../../constants/api';
import { NegotiationStats } from '../../types/price-negotiation';

export interface UsePriceNegotiationStatsQuery {
  type: 'sent' | 'received';
  userId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UsePriceNegotiationStatsReturn {
  stats: NegotiationStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePriceNegotiationStats = (
  query: UsePriceNegotiationStatsQuery,
): UsePriceNegotiationStatsReturn => {
  const [stats, setStats] = useState<NegotiationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Determine which endpoint to call based on type
      const endpoint =
        query.type === 'sent'
          ? API_ENDPOINTS.PRICE_NEGOTIATION.STATS_SENT
          : API_ENDPOINTS.PRICE_NEGOTIATION.STATS_RECEIVED;

      // Prepare query params (exclude type as it's determined by endpoint)
      const queryParams = {
        ...(query.userId && { userId: query.userId }),
        ...(query.dateFrom && { dateFrom: query.dateFrom }),
        ...(query.dateTo && { dateTo: query.dateTo }),
      };

      const result = await apiClient.get<NegotiationStats>(
        endpoint,
        queryParams,
      );
      setStats(result);
    } catch (err: any) {
      const errorMessage =
        query.type === 'sent'
          ? 'Không thể tải thống kê thương lượng đã gửi'
          : 'Không thể tải thống kê thương lượng đã nhận';
      setError(err.message || errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [query.type, query.userId, query.dateFrom, query.dateTo]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
