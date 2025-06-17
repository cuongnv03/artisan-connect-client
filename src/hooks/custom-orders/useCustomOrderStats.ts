import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToastContext } from '../../contexts/ToastContext';
import {
  customOrderService,
  GetCustomOrderStatsQuery,
} from '../../services/custom-order.service';
import { CustomOrderStats } from '../../types/custom-order';

export const useCustomOrderStats = () => {
  const { state } = useAuth();
  const { error } = useToastContext();

  const [stats, setStats] = useState<CustomOrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const loadStats = async () => {
    try {
      setLoading(true);

      const query: GetCustomOrderStatsQuery = {
        userId: state.user?.id,
        role: state.user?.role as 'CUSTOMER' | 'ARTISAN',
        ...dateRange,
      };

      const statsData = await customOrderService.getCustomOrderStats(query);
      setStats(statsData);
    } catch (err: any) {
      error(err.message || 'Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (state.isAuthenticated && state.user?.role === 'ARTISAN') {
      loadStats();
    }
  }, [dateRange, state.isAuthenticated, state.user?.role]);

  const updateDateRange = (newRange: typeof dateRange) => {
    setDateRange(newRange);
  };

  return {
    stats,
    loading,
    dateRange,
    updateDateRange,
    refreshStats: loadStats,
  };
};
