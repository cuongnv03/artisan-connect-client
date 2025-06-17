import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import { analyticsService } from '../../services/analytics.service';

export const useArtisanDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [productStats, recentProducts, recentOrders, businessAnalytics] =
        await Promise.all([
          productService.getMyProductStats(),
          productService.getMyProducts({
            limit: 6,
            sortBy: 'salesCount',
            sortOrder: 'desc',
          }),
          orderService.getMyArtisanOrders({
            limit: 5,
            sortBy: 'createdAt',
            sortOrder: 'desc',
          }),
          analyticsService.getArtisanDashboard('30d'),
        ]);

      setDashboardData({
        productStats,
        recentOrders: recentOrders.data,
        topProducts: recentProducts.data,
      });

      setAnalyticsData(businessAnalytics);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboardData,
    analyticsData,
    loading,
    refreshDashboard: loadDashboardData,
  };
};
