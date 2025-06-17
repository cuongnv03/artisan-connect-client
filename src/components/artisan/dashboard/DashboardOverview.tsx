import React from 'react';
import { QuickStats } from './QuickStats';
import { BusinessMetrics } from './BusinessMetrics';
// import { RecentOrders } from './RecentOrders';
import { SalesTrends } from './SalesTrends';
import { TopProductsChart } from './TopProductsChart';
import { EngagementOverview } from './EngagementOverview';
// import { QuickActions } from './QuickActions';

interface DashboardOverviewProps {
  dashboardData: any;
  analyticsData: any;
  loading: boolean;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  dashboardData,
  analyticsData,
  loading,
}) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Quick Product Stats */}
      <QuickStats stats={dashboardData} loading={loading} />

      {/* Business Analytics Metrics */}
      {analyticsData && (
        <>
          <BusinessMetrics analytics={analyticsData} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <SalesTrends analytics={analyticsData} />
            <TopProductsChart analytics={analyticsData} />
            <EngagementOverview analytics={analyticsData} />
          </div>
        </>
      )}

      {/* Traditional Dashboard Sections */}
      {/* <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentOrders orders={dashboardData?.recentOrders || []} />
      </div> */}

      {/* <QuickActions /> */}
    </div>
  );
};
