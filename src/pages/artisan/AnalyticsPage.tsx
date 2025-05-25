import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { analyticsService } from '../../services/analytics.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Dropdown';

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  followerGrowth: number;
  engagementRate: number;
  topPosts: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
  }>;
  viewsByDay: Array<{
    date: string;
    views: number;
  }>;
}

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const analyticsData = await analyticsService.getUserAnalyticsSummary();
      setData(analyticsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const periodOptions = [
    { label: '7 ngày qua', value: 'week' },
    { label: '30 ngày qua', value: 'month' },
    { label: '3 tháng qua', value: 'quarter' },
    { label: '1 năm qua', value: 'year' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải thống kê...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Không có dữ liệu
        </h3>
        <p className="text-gray-500">Chưa có đủ dữ liệu để hiển thị thống kê</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Thống kê chi tiết</h1>

        <div className="flex items-center space-x-3">
          <Select value={period} onChange={setPeriod} options={periodOptions} />

          <Button
            variant="outline"
            onClick={loadAnalytics}
            leftIcon={<CalendarIcon className="w-4 h-4" />}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeIcon className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">Lượt xem</p>
                <div className="flex items-center">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-green-500 ml-1">+12%</span>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">
                {data.totalViews.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <HeartIcon className="w-8 h-8 text-red-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-500">Lượt thích</p>
              <p className="text-2xl font-semibold text-gray-900">
                {data.totalLikes.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserGroupIcon className="w-8 h-8 text-purple-600" />
            </div>
            <div className="ml-3 flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-500">
                  Người theo dõi
                </p>
                <div className="flex items-center">
                  {data.followerGrowth >= 0 ? (
                    <ArrowTrendingUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4 text-red-500" />
                  )}
                  <span
                    className={`text-xs ml-1 ${
                      data.followerGrowth >= 0
                        ? 'text-green-500'
                        : 'text-red-500'
                    }`}
                  >
                    {data.followerGrowth > 0 ? '+' : ''}
                    {data.followerGrowth}%
                  </span>
                </div>
              </div>
              <p className="text-2xl font-semibold text-gray-900">1,234</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-500">Tương tác</p>
              <p className="text-2xl font-semibold text-gray-900">
                {(data.engagementRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Views Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Lượt xem theo ngày
          </h3>

          <div className="space-y-3">
            {data.viewsByDay.slice(-7).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {new Date(day.date).toLocaleDateString('vi-VN')}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{
                        width: `${
                          (day.views /
                            Math.max(...data.viewsByDay.map((d) => d.views))) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {day.views}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Posts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bài viết nổi bật
          </h3>

          <div className="space-y-4">
            {data.topPosts.map((post, index) => (
              <div key={post.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Badge variant="secondary" size="sm">
                    #{index + 1}
                  </Badge>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {post.title}
                  </h4>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-500 flex items-center">
                      <EyeIcon className="w-3 h-3 mr-1" />
                      {post.views}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <HeartIcon className="w-3 h-3 mr-1" />
                      {post.likes}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Chỉ số chi tiết
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {data.totalComments}
            </div>
            <p className="text-sm text-gray-500">Bình luận</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {data.totalShares}
            </div>
            <p className="text-sm text-gray-500">Chia sẻ</p>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {Math.round(data.totalViews / data.topPosts.length) || 0}
            </div>
            <p className="text-sm text-gray-500">Lượt xem TB/bài viết</p>
          </div>
        </div>
      </Card>

      {/* Performance Tips */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          💡 Gợi ý cải thiện hiệu suất
        </h3>

        <div className="space-y-3 text-sm text-blue-800">
          <p>• Đăng bài đều đặn để tăng tương tác với người theo dõi</p>
          <p>• Sử dụng hashtag phù hợp để tiếp cận đối tượng mới</p>
          <p>• Tương tác với bình luận để tăng engagement rate</p>
          <p>• Chia sẻ câu chuyện đằng sau sản phẩm để tạo kết nối</p>
        </div>
      </Card>
    </div>
  );
};
