import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { orderService } from '../../services/order.service';
import { OrderSummary, GetOrdersQuery } from '../../types/order';
import { PaginatedResponse } from '../../types/common';

export const useOrders = (type: 'buy' | 'sell' = 'buy') => {
  const { state } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    loadOrders();
  }, [type, statusFilter, searchQuery, currentPage]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const query: GetOrdersQuery = {
        page: currentPage,
        limit: 10,
        status: statusFilter || undefined,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      };

      let result: PaginatedResponse<OrderSummary>;
      if (type === 'buy') {
        result = await orderService.getMyOrders(query);
      } else {
        result = await orderService.getMyArtisanOrders(query);
      }

      setOrders(result.data);
      setTotalPages(result.meta.totalPages);
      setTotalItems(result.meta.total);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    setCurrentPage(1);
    loadOrders();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return {
    orders,
    loading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalItems,
    refreshOrders,
    formatPrice,
    formatDate,
    userRole: state.user?.role,
  };
};
