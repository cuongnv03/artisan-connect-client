import { useState, useEffect } from 'react';
import {
  priceNegotiationService,
  GetNegotiationStatsQuery,
} from '../../services/price-negotiation.service';
import { NegotiationStats } from '../../types/price-negotiation';

export interface UsePriceNegotiationStatsReturn {
  stats: NegotiationStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const usePriceNegotiationStats = (
  query: GetNegotiationStatsQuery = {},
): UsePriceNegotiationStatsReturn => {
  const [stats, setStats] = useState<NegotiationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await priceNegotiationService.getNegotiationStats(query);
      setStats(result);
    } catch (err: any) {
      setError(err.message || 'Không thể tải thống kê thương lượng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [JSON.stringify(query)]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
