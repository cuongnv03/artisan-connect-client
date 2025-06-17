import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { ProductStats } from '../../types/product';

export interface UseProductStatsReturn {
  stats: ProductStats; // Remove null, always return stats
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultStats: ProductStats = {
  totalProducts: 0,
  publishedProducts: 0,
  draftProducts: 0,
  outOfStockProducts: 0,
  totalViews: 0,
  totalSales: 0,
  avgRating: undefined,
};

export const useProductStats = (): UseProductStatsReturn => {
  const [stats, setStats] = useState<ProductStats>(defaultStats); // Default stats instead of null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const statsData = await productService.getMyProductStats();
      setStats(statsData || defaultStats); // Fallback to defaultStats if null
    } catch (err: any) {
      setError(err.message || 'Không thể tải thống kê');
      setStats(defaultStats); // Set default on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};
