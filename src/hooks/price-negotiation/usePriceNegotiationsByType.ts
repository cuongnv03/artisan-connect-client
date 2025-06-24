import { useState, useEffect } from 'react';
import {
  priceNegotiationService,
  GetNegotiationsQuery,
} from '../../services/price-negotiation.service';
import { NegotiationSummary } from '../../types/price-negotiation';
import { PaginatedResponse } from '../../types/common';

export interface UsePriceNegotiationsByTypeOptions
  extends GetNegotiationsQuery {
  enabled?: boolean;
  type: 'sent' | 'received';
}

export interface UsePriceNegotiationsByTypeReturn {
  negotiations: NegotiationSummary[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export const usePriceNegotiationsByType = (
  options: UsePriceNegotiationsByTypeOptions,
): UsePriceNegotiationsByTypeReturn => {
  const { enabled = true, type, ...query } = options;
  const [negotiations, setNegotiations] = useState<NegotiationSummary[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: query.page || 1,
    limit: query.limit || 10,
  });

  const fetchNegotiations = async (reset = true) => {
    if (!enabled) return;

    try {
      setLoading(true);
      setError(null);

      let response: PaginatedResponse<NegotiationSummary>;

      const requestQuery = {
        ...query,
        page: reset ? 1 : pagination.currentPage + 1,
      };

      if (type === 'sent') {
        response = await priceNegotiationService.getMySentNegotiations(
          requestQuery,
        );
      } else {
        response = await priceNegotiationService.getMyReceivedNegotiations(
          requestQuery,
        );
      }

      if (reset) {
        setNegotiations(response.data);
        setPagination({
          total: response.meta.total,
          totalPages: response.meta.totalPages,
          currentPage: response.meta.page,
          limit: response.meta.limit,
        });
      } else {
        setNegotiations((prev) => [...prev, ...response.data]);
        setPagination((prev) => ({
          ...prev,
          currentPage: response.meta.page,
        }));
      }
    } catch (err: any) {
      setError(
        err.message ||
          `Không thể tải danh sách thương lượng ${
            type === 'sent' ? 'đã gửi' : 'nhận được'
          }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchNegotiations(true);
  const loadMore = () => fetchNegotiations(false);

  useEffect(() => {
    if (enabled) {
      fetchNegotiations(true);
    }
  }, [enabled, type, JSON.stringify(query)]);

  return {
    negotiations,
    loading,
    error,
    pagination,
    refetch,
    loadMore,
    hasMore: pagination.currentPage < pagination.totalPages,
  };
};
