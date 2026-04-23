import { useState, useEffect } from 'react';
import { productService } from '../../services/product.service';
import { orderService } from '../../services/order.service';
import { analyticsService } from '../../services/analytics.service';
import { customOrderService } from '../../services/custom-order.service';
import { priceNegotiationService } from '../../services/price-negotiation.service';
import { QuoteStatus } from '../../types/custom-order';

export const useArtisanDashboard = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [needsAction, setNeedsAction] = useState({
    pendingOrderCount: 0,
    pendingCustomOrderCount: 0,
    pendingNegotiationCount: 0,
  });

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

      loadNeedsActionCounts(recentOrders.data || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNeedsActionCounts = async (recentOrders: any[]) => {
    const pendingOrderCount = recentOrders.filter(
      (o: any) => o.status === 'PENDING',
    ).length;

    let pendingCustomOrderCount = 0;
    let pendingNegotiationCount = 0;

    try {
      const result = await customOrderService.getMyCustomOrders({
        mode: 'received',
        status: QuoteStatus.PENDING,
        limit: 50,
      });
      pendingCustomOrderCount = result.data?.length ?? 0;
    } catch {
      // degrades gracefully
    }

    try {
      const result = await priceNegotiationService.getMyReceivedNegotiations({
        status: 'PENDING' as any,
        limit: 50,
      });
      pendingNegotiationCount = result.data?.length ?? 0;
    } catch {
      // degrades gracefully
    }

    setNeedsAction({
      pendingOrderCount,
      pendingCustomOrderCount,
      pendingNegotiationCount,
    });
  };

  return {
    dashboardData,
    analyticsData,
    loading,
    needsAction,
    refreshDashboard: loadDashboardData,
  };
};
