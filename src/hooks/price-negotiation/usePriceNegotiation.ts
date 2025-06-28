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

      // FIXED: Handle server response structure
      let negotiationData: PriceNegotiationWithDetails;

      if (result && typeof result === 'object') {
        // Check if result has the nested structure from server
        if ('negotiation' in result && 'isNew' in result) {
          negotiationData = (result as any).negotiation;
          const isNew = (result as any).isNew;

          if (isNew) {
            success('Tạo yêu cầu thương lượng thành công');
          } else {
            success('Đã tìm thấy thương lượng hiện tại');
          }
        } else if ('id' in result) {
          // Direct negotiation object
          negotiationData = result as PriceNegotiationWithDetails;
          success('Tạo yêu cầu thương lượng thành công');
        } else {
          throw new Error('Invalid response structure from server');
        }
      } else {
        throw new Error('Invalid response from server');
      }

      if (negotiationData && negotiationData.id) {
        setNegotiation(negotiationData);
        return negotiationData;
      } else {
        throw new Error('Invalid negotiation data received');
      }
    } catch (err: any) {
      let errorMessage = 'Không thể tạo yêu cầu thương lượng';

      if (err.response?.status === 400) {
        const serverMessage = err.response?.data?.message || '';
        if (serverMessage.includes('already have an active')) {
          errorMessage =
            'Bạn đã có thương lượng đang chờ xử lý cho sản phẩm này';
        } else {
          errorMessage = serverMessage || errorMessage;
        }
      } else if (err.message && !err.message.includes('Invalid')) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showError(errorMessage);
      throw new Error(errorMessage);
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
