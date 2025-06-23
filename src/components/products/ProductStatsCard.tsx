import React from 'react';
import {
  EyeIcon,
  StarIcon,
  ShoppingCartIcon,
  HeartIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';

interface ProductStatsCardProps {
  viewCount: number;
  avgRating?: number;
  reviewCount: number;
  salesCount: number;
  wishlistCount?: number;
  className?: string;
}

export const ProductStatsCard: React.FC<ProductStatsCardProps> = ({
  viewCount,
  avgRating,
  reviewCount,
  salesCount,
  wishlistCount,
  className = '',
}) => {
  const stats = [
    {
      icon: EyeIcon,
      label: 'Lượt xem',
      value: viewCount.toLocaleString(),
      color: 'text-blue-600',
    },
    {
      icon: StarIcon,
      label: 'Đánh giá',
      value: avgRating
        ? `${avgRating.toFixed(1)} (${reviewCount})`
        : `${reviewCount} đánh giá`,
      color: 'text-yellow-600',
    },
    {
      icon: ShoppingCartIcon,
      label: 'Đã bán',
      value: salesCount.toLocaleString(),
      color: 'text-green-600',
    },
  ];

  if (wishlistCount !== undefined) {
    stats.push({
      icon: HeartIcon,
      label: 'Yêu thích',
      value: wishlistCount.toLocaleString(),
      color: 'text-red-600',
    });
  }

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="font-medium text-gray-900 mb-4 flex items-center">
        <ChatBubbleLeftEllipsisIcon className="w-5 h-5 mr-2" />
        Thống kê sản phẩm
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`flex justify-center mb-2 ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};
