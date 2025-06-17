import { useState } from 'react';
import { priceNegotiationService } from '../../services/price-negotiation.service';
import {
  PriceNegotiationWithDetails,
  CreateNegotiationRequest,
  RespondToNegotiationRequest,
} from '../../types/price-negotiation';
import { useToastContext } from '../../contexts/ToastContext';

export interface UsePriceNegotiationReturn {
  negotiation: PriceNegotiationWithDetails | null;
  loading: boolean;
  error: string | null;
  createNegotiation: (
    data: CreateNegotiationRequest,
  ) => Promise<PriceNegotiationWithDetails>;
  respondToNegotiation: (
    id: string,
    data: RespondToNegotiationRequest,
  ) => Promise<PriceNegotiationWithDetails>;
  cancelNegotiation: (
    id: string,
    reason?: string,
  ) => Promise<PriceNegotiationWithDetails>;
  getNegotiation: (id: string) => Promise<void>;
  validateAccess: (id: string) => Promise<boolean>;
}

export const usePriceNegotiation = (): UsePriceNegotiationReturn => {
  const [negotiation, setNegotiation] =
    useState<PriceNegotiationWithDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToastContext();

  const createNegotiation = async (
    data: CreateNegotiationRequest,
  ): Promise<PriceNegotiationWithDetails> => {
    try {
      setLoading(true);
      setError(null);
      const result = await priceNegotiationService.createNegotiation(data);
      setNegotiation(result);
      success('Gửi yêu cầu thương lượng giá thành công');
      return result;
    } catch (err: any) {
      setError(err.message);
      showError(err.message || 'Không thể tạo yêu cầu thương lượng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const respondToNegotiation = async (
    id: string,
    data: RespondToNegotiationRequest,
  ): Promise<PriceNegotiationWithDetails> => {
    try {
      setLoading(true);
      setError(null);
      const result = await priceNegotiationService.respondToNegotiation(
        id,
        data,
      );
      setNegotiation(result);

      const messages = {
        ACCEPT: 'Chấp nhận thương lượng thành công',
        REJECT: 'Từ chối thương lượng thành công',
        COUNTER: 'Gửi đề nghị mới thành công',
      };
      success(messages[data.action] || 'Phản hồi thương lượng thành công');
      return result;
    } catch (err: any) {
      setError(err.message);
      showError(err.message || 'Không thể phản hồi thương lượng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const cancelNegotiation = async (
    id: string,
    reason?: string,
  ): Promise<PriceNegotiationWithDetails> => {
    try {
      setLoading(true);
      setError(null);
      const result = await priceNegotiationService.cancelNegotiation(
        id,
        reason,
      );
      setNegotiation(result);
      success('Hủy thương lượng thành công');
      return result;
    } catch (err: any) {
      setError(err.message);
      showError(err.message || 'Không thể hủy thương lượng');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getNegotiation = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const result = await priceNegotiationService.getNegotiation(id);
      setNegotiation(result);
    } catch (err: any) {
      setError(err.message);
      setNegotiation(null);
    } finally {
      setLoading(false);
    }
  };

  const validateAccess = async (id: string): Promise<boolean> => {
    try {
      return await priceNegotiationService.validateNegotiationAccess(id);
    } catch {
      return false;
    }
  };

  return {
    negotiation,
    loading,
    error,
    createNegotiation,
    respondToNegotiation,
    cancelNegotiation,
    getNegotiation,
    validateAccess,
  };
};
