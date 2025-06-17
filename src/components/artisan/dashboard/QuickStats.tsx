import React from 'react';
import {
  CubeIcon,
  EyeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../../ui/Card';

interface QuickStatsProps {
  stats: any;
  loading: boolean;
}

export const QuickStats: React.FC<QuickStatsProps> = ({ stats, loading }) => {
  const quickStats = [
    {
      title: 'Tổng sản phẩm',
      value: stats?.productStats?.totalProducts || 0,
      icon: CubeIcon,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Đã xuất bản',
      value: stats?.productStats?.publishedProducts || 0,
      icon: EyeIcon,
      color: 'green',
      change: '+8%',
    },
    {
      title: 'Tổng lượt xem',
      value: stats?.productStats?.totalViews?.toLocaleString() || '0',
      icon: ChartBarIcon,
      color: 'purple',
      change: '+25%',
    },
    {
      title: 'Đã bán',
      value: stats?.productStats?.totalSales || 0,
      icon: ShoppingBagIcon,
      color: 'orange',
      change: '+15%',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {quickStats.map((stat, index) => (
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
