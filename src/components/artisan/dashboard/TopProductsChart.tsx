import React from 'react';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { ArtisanBusinessAnalytics } from '../../../types/analytics';

interface TopProductsChartProps {
  analytics: ArtisanBusinessAnalytics;
}

export const TopProductsChart: React.FC<TopProductsChartProps> = ({
  analytics,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      notation: 'compact',
    }).format(amount);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Sản phẩm bán chạy nhất
      </h3>

      <div className="space-y-4">
        {analytics.topProducts.map((product, index) => (
          <div key={product.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" size="sm">
                #{index + 1}
              </Badge>
              <div>
                <h4 className="font-medium text-gray-900 text-sm">
                  {product.name}
                </h4>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {product.orderCount} đơn
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className="text-xs text-yellow-600">
                    ⭐ {product.averageRating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 text-sm">
                {formatCurrency(product.revenue)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
