import { useState, useEffect } from 'react';
import { useToastContext } from '../../contexts/ToastContext';
import { orderService } from '../../services/order.service';
import {
  OrderReturnWithDetails,
  CreateReturnRequest,
  UpdateReturnRequest,
  GetReturnsQuery,
} from '../../types/order';
import { PaginatedResponse } from '../../types/common';

export const useOrderReturns = () => {
  const { success, error } = useToastContext();
  const [returns, setReturns] = useState<OrderReturnWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadReturns = async (query: GetReturnsQuery = {}) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<OrderReturnWithDetails> =
        await orderService.getMyReturns(query);

      setReturns(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
      setCurrentPage(result.meta.page);
    } catch (err) {
      console.error('Error loading returns:', err);
      error('Không thể tải danh sách yêu cầu trả hàng');
    } finally {
      setLoading(false);
    }
  };

  const createReturn = async (data: CreateReturnRequest) => {
    try {
      const returnRequest = await orderService.createReturn(data);
      success('Yêu cầu trả hàng đã được tạo thành công');
      loadReturns(); // Refresh list
      return returnRequest;
    } catch (err: any) {
      error(err.message || 'Không thể tạo yêu cầu trả hàng');
      throw err;
    }
  };

  const updateReturn = async (id: string, data: UpdateReturnRequest) => {
    try {
      const returnRequest = await orderService.updateReturn(id, data);
      success('Yêu cầu trả hàng đã được cập nhật');
      loadReturns(); // Refresh list
      return returnRequest;
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật yêu cầu trả hàng');
      throw err;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    loadReturns();
  }, []);

  return {
    returns,
    loading,
    currentPage,
    totalPages,
    totalItems,
    loadReturns,
    createReturn,
    updateReturn,
    formatPrice,
    formatDate,
  };
};

export const useOrderReturnDetail = (returnId: string) => {
  const { success, error } = useToastContext();
  const [returnRequest, setReturnRequest] =
    useState<OrderReturnWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (returnId) {
      loadReturn();
    }
  }, [returnId]);

  const loadReturn = async () => {
    try {
      const returnData = await orderService.getReturn(returnId);
      setReturnRequest(returnData);
    } catch (err) {
      console.error('Error loading return:', err);
      error('Không thể tải thông tin yêu cầu trả hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateReturn = async (data: UpdateReturnRequest) => {
    if (!returnRequest) return;

    setUpdating(true);
    try {
      await orderService.updateReturn(returnRequest.id, data);
      success('Yêu cầu trả hàng đã được cập nhật');
      loadReturn();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi cập nhật yêu cầu trả hàng');
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    returnRequest,
    loading,
    updating,
    loadReturn,
    updateReturn,
    formatPrice,
    formatDate,
  };
};
