import React from 'react';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../ui/Card';
import { ArtisanBusinessAnalytics } from '../../../types/analytics';

interface BusinessMetricsProps {
  analytics: ArtisanBusinessAnalytics;
}

export const BusinessMetrics: React.FC<BusinessMetricsProps> = ({
  analytics,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const businessStats = [
    {
      title: 'Doanh thu',
      value: formatCurrency(analytics.salesMetrics.totalRevenue),
      icon: CurrencyDollarIcon,
      color: 'green',
      change: '+12%',
    },
    {
      title: 'Đơn hàng',
      value: analytics.salesMetrics.totalOrders.toLocaleString(),
      icon: ShoppingCartIcon,
      color: 'blue',
      change: '+8%',
    },
    {
      title: 'Khách hàng',
      value: analytics.customerMetrics.totalCustomers.toLocaleString(),
      icon: UsersIcon,
      color: 'purple',
      change: '+15%',
    },
    {
      title: 'Tỉ lệ chuyển đổi',
      value: `${analytics.salesMetrics.conversionRate.toFixed(1)}%`,
      icon: ChartBarIcon,
      color: 'orange',
      change: '+5%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {businessStats.map((stat, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {stat.value}
              </p>
              <span className="text-sm text-green-600 font-medium">
                {stat.change}
              </span>
            </div>
            <div className={`p-3 rounded-lg bg-${stat.color}-100`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
