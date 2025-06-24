import { useState, useEffect } from 'react';
import { priceNegotiationService } from '../../services/price-negotiation.service';
import {
  PriceNegotiationWithDetails,
  NegotiationStatus,
  CheckExistingNegotiationQuery,
} from '../../types/price-negotiation';

export interface UseExistingNegotiationReturn {
  existingNegotiation: PriceNegotiationWithDetails | null;
  loading: boolean;
  error: string | null;
  hasActiveNegotiation: boolean;
  refetch: () => Promise<void>;
  cancelNegotiation: (reason?: string) => Promise<void>;
  canceling: boolean;
}

export const useExistingNegotiation = (
  query: CheckExistingNegotiationQuery,
  enabled: boolean = true,
): UseExistingNegotiationReturn => {
  const [existingNegotiation, setExistingNegotiation] =
    useState<PriceNegotiationWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExistingNegotiation = async () => {
    if (!enabled || !query.productId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await priceNegotiationService.checkExistingNegotiation(
        query,
      );

      if (result.hasActive && result.negotiation) {
        setExistingNegotiation(result.negotiation);
      } else {
        setExistingNegotiation(null);
      }
    } catch (err: any) {
      setError(err.message || 'Không thể kiểm tra thương lượng hiện tại');
      setExistingNegotiation(null);
    } finally {
      setLoading(false);
    }
  };

  const cancelNegotiation = async (reason?: string) => {
    if (!existingNegotiation) return;

    setCanceling(true);
    try {
      await priceNegotiationService.cancelNegotiation(
        existingNegotiation.id,
        reason,
      );
      setExistingNegotiation(null); // Clear after cancel
    } catch (err: any) {
      setError(err.message || 'Không thể hủy thương lượng');
      throw err;
    } finally {
      setCanceling(false);
    }
  };

  useEffect(() => {
    fetchExistingNegotiation();
  }, [query.productId, query.variantId, enabled]);

  const hasActiveNegotiation =
    existingNegotiation &&
    [NegotiationStatus.PENDING, NegotiationStatus.COUNTER_OFFERED].includes(
      existingNegotiation.status,
    );

  return {
    existingNegotiation,
    loading,
    error,
    hasActiveNegotiation: !!hasActiveNegotiation,
    refetch: fetchExistingNegotiation,
    cancelNegotiation,
    canceling,
  };
};
