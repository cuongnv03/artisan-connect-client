import React from 'react';
import { ProductStats as ProductStatsType } from '../../../../types/product';
import { Card } from '../../../ui/Card';
import {
  ChartBarIcon,
  EyeIcon,
  ShoppingCartIcon,
  StarIcon,
  CubeIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface ProductStatsProps {
  stats: ProductStatsType; // Remove null - now always has value
  loading?: boolean;
  className?: string;
}

export const ProductStats: React.FC<ProductStatsProps> = ({
  stats,
  loading = false,
  className = '',
}) => {
  const statItems = [
    {
      label: 'Tổng sản phẩm',
      value: stats.totalProducts,
      icon: CubeIcon,
      color: 'blue',
    },
    {
      label: 'Đã xuất bản',
      value: stats.publishedProducts,
      icon: ChartBarIcon,
      color: 'green',
    },
    {
      label: 'Bản nháp',
      value: stats.draftProducts,
      icon: ClockIcon,
      color: 'yellow',
    },
    {
      label: 'Hết hàng',
      value: stats.outOfStockProducts,
      icon: CubeIcon,
      color: 'red',
    },
    {
      label: 'Lượt xem',
      value: stats.totalViews.toLocaleString(),
      icon: EyeIcon,
      color: 'purple',
    },
    {
      label: 'Đã bán',
      value: stats.totalSales.toLocaleString(),
      icon: ShoppingCartIcon,
      color: 'indigo',
    },
  ];

  if (stats.avgRating) {
    statItems.push({
      label: 'Đánh giá TB',
      value: stats.avgRating.toFixed(1),
      icon: StarIcon,
      color: 'yellow',
    });
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      yellow: 'bg-yellow-100 text-yellow-600',
      red: 'bg-red-100 text-red-600',
      purple: 'bg-purple-100 text-purple-600',
      indigo: 'bg-indigo-100 text-indigo-600',
    };
    return (
      colorMap[color as keyof typeof colorMap] || 'bg-gray-100 text-gray-600'
    );
  };

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
      >
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center">
              <div className="p-2 bg-gray-200 rounded-lg w-10 h-10"></div>
              <div className="ml-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}
    >
      {statItems.map((item, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${getColorClasses(item.color)}`}>
              <item.icon className="w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{item.label}</p>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
