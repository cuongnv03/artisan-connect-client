import { useState, useEffect } from 'react';
import { useToastContext } from '../../contexts/ToastContext';
import { orderService } from '../../services/order.service';
import {
  OrderDisputeWithDetails,
  CreateDisputeRequest,
  UpdateDisputeRequest,
  GetDisputesQuery,
} from '../../types/order';
import { PaginatedResponse } from '../../types/common';

export const useOrderDisputes = () => {
  const { success, error } = useToastContext();
  const [disputes, setDisputes] = useState<OrderDisputeWithDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const loadDisputes = async (query: GetDisputesQuery = {}) => {
    setLoading(true);
    try {
      const result: PaginatedResponse<OrderDisputeWithDetails> =
        await orderService.getMyDisputes(query);

      setDisputes(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
      setCurrentPage(result.meta.page);
    } catch (err) {
      console.error('Error loading disputes:', err);
      error('Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const createDispute = async (data: CreateDisputeRequest) => {
    try {
      const dispute = await orderService.createDispute(data);
      success('Khiếu nại đã được tạo thành công');
      loadDisputes(); // Refresh list
      return dispute;
    } catch (err: any) {
      error(err.message || 'Không thể tạo khiếu nại');
      throw err;
    }
  };

  const updateDispute = async (id: string, data: UpdateDisputeRequest) => {
    try {
      const dispute = await orderService.updateDispute(id, data);
      success('Khiếu nại đã được cập nhật');
      loadDisputes(); // Refresh list
      return dispute;
    } catch (err: any) {
      error(err.message || 'Không thể cập nhật khiếu nại');
      throw err;
    }
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
    loadDisputes();
  }, []);

  return {
    disputes,
    loading,
    currentPage,
    totalPages,
    totalItems,
    loadDisputes,
    createDispute,
    updateDispute,
    formatDate,
  };
};

export const useOrderDisputeDetail = (disputeId: string) => {
  const { success, error } = useToastContext();
  const [dispute, setDispute] = useState<OrderDisputeWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (disputeId) {
      loadDispute();
    }
  }, [disputeId]);

  const loadDispute = async () => {
    try {
      const disputeData = await orderService.getDispute(disputeId);
      setDispute(disputeData);
    } catch (err) {
      console.error('Error loading dispute:', err);
      error('Không thể tải thông tin khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  const updateDispute = async (data: UpdateDisputeRequest) => {
    if (!dispute) return;

    setUpdating(true);
    try {
      await orderService.updateDispute(dispute.id, data);
      success('Khiếu nại đã được cập nhật');
      loadDispute();
    } catch (err: any) {
      error(err.message || 'Có lỗi xảy ra khi cập nhật khiếu nại');
    } finally {
      setUpdating(false);
    }
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
    dispute,
    loading,
    updating,
    loadDispute,
    updateDispute,
    formatDate,
  };
};
