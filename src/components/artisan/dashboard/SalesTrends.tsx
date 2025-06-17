import React from 'react';
import { Card } from '../../ui/Card';
import { ArtisanBusinessAnalytics } from '../../../types/analytics';

interface SalesTrendsProps {
  analytics: ArtisanBusinessAnalytics;
}

export const SalesTrends: React.FC<SalesTrendsProps> = ({ analytics }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
    }).format(amount);
  };

  const maxRevenue = Math.max(...analytics.salesTrends.map((t) => t.revenue));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Xu hướng doanh thu (30 ngày)
      </h3>

      <div className="space-y-3">
        {analytics.salesTrends.slice(-7).map((trend, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {new Date(trend.period).toLocaleDateString('vi-VN')}
            </span>
            <div className="flex items-center space-x-3 flex-1 ml-4">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{
                    width: `${(trend.revenue / maxRevenue) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900 w-16 text-right">
                {formatCurrency(trend.revenue)}
              </span>
              <span className="text-xs text-gray-500 w-12 text-right">
                {trend.orders} đơn
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
