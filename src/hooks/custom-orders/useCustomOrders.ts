import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import {
  customOrderService,
  GetCustomOrdersQuery,
} from '../../services/custom-order.service';
import { CustomOrderWithDetails, QuoteStatus } from '../../types/custom-order';
import { PaginatedResponse } from '../../types/common';

export const useCustomOrders = (mode: 'sent' | 'received' = 'sent') => {
  const { state } = useAuth();
  const { error } = useToastContext();

  const [orders, setOrders] = useState<CustomOrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState<{
    status?: QuoteStatus | QuoteStatus[];
    dateFrom?: Date;
    dateTo?: Date;
  }>({});

  const loadOrders = async () => {
    try {
      setLoading(true);

      const query: GetCustomOrdersQuery = {
        page: currentPage,
        limit: 10,
        mode, // NEW: Pass mode to API
        sortBy: 'createdAt',
        sortOrder: 'desc',
        ...filters,
      };

      const result: PaginatedResponse<CustomOrderWithDetails> =
        await customOrderService.getMyCustomOrders(query);

      setOrders(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
    } catch (err: any) {
      error(err.message || 'Không thể tải danh sách custom orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.isAuthenticated) {
      loadOrders();
    }
  }, [currentPage, filters, state.isAuthenticated, mode]);

  const refreshOrders = () => {
    setCurrentPage(1);
    loadOrders();
  };

  const updateFilters = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return {
    orders,
    loading,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    filters,
    updateFilters,
    refreshOrders,
    userRole: state.user?.role,
    mode, // Return mode for components to use
  };
};
