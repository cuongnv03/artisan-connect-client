import React from 'react';
import { Card } from '../../ui/Card';
import { ArtisanBusinessAnalytics } from '../../../types/analytics';

interface EngagementOverviewProps {
  analytics: ArtisanBusinessAnalytics;
}

export const EngagementOverview: React.FC<EngagementOverviewProps> = ({
  analytics,
}) => {
  const { postPerformance } = analytics.engagementMetrics;
  const latestFollowerData =
    analytics.engagementMetrics.followerGrowth.slice(-1)[0];

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Tương tác & Engagement
      </h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {latestFollowerData?.count || 0}
          </div>
          <p className="text-sm text-gray-600">Người theo dõi</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {postPerformance.totalPosts}
          </div>
          <p className="text-sm text-gray-600">Bài viết</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(postPerformance.averageLikes)}
          </div>
          <p className="text-sm text-gray-600">Like TB/bài</p>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-900">
            {postPerformance.totalViews.toLocaleString()}
          </div>
          <p className="text-sm text-gray-600">Tổng lượt xem</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Khách hàng quay lại:</span>
          <span className="font-medium text-gray-900">
            {analytics.customerMetrics.customerRetentionRate.toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between text-sm mt-2">
          <span className="text-gray-600">Giá trị đơn hàng TB:</span>
          <span className="font-medium text-gray-900">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
              notation: 'compact',
            }).format(analytics.salesMetrics.averageOrderValue)}
          </span>
        </div>
      </div>
    </Card>
  );
};
