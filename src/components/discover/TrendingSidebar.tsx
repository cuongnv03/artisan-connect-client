import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowTrendingUpIcon, FireIcon } from '@heroicons/react/24/outline';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface TrendingSidebarProps {
  hashtags: Array<{ tag: string; count: number; growth: number }>;
  keywords: Array<{
    keyword: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  stats?: {
    views: string;
    likes: string;
    comments: string;
  };
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  hashtags,
  keywords,
  stats,
}) => {
  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Trending Hashtags */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-primary" />
          Hashtags xu hướng
        </h3>
        <div className="space-y-3">
          {hashtags.map((hashtag, index) => (
            <div
              key={hashtag.tag}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">#{index + 1}</span>
                <Link
                  to={`/discover?q=%23${hashtag.tag}`}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  #{hashtag.tag}
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {formatNumber(hashtag.count)}
                </span>
                <Badge
                  variant={
                    hashtag.growth > 0
                      ? 'success'
                      : hashtag.growth < 0
                      ? 'danger'
                      : 'secondary'
                  }
                  size="sm"
                >
                  {hashtag.growth > 0 ? '+' : ''}
                  {hashtag.growth.toFixed(1)}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Trending Keywords */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <FireIcon className="w-5 h-5 mr-2 text-primary" />
          Từ khóa hot
        </h3>
        <div className="space-y-3">
          {keywords.map((keyword, index) => (
            <div
              key={keyword.keyword}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <span className="text-gray-500 mr-2">#{index + 1}</span>
                <Link
                  to={`/discover?q=${keyword.keyword}`}
                  className="text-gray-700 hover:text-primary font-medium"
                >
                  {keyword.keyword}
                </Link>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {formatNumber(keyword.count)}
                </span>
                <div
                  className={`w-3 h-3 rounded-full ${
                    keyword.trend === 'up'
                      ? 'bg-green-500'
                      : keyword.trend === 'down'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Stats */}
      {stats && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Thống kê nhanh</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lượt xem tuần này</span>
              <span className="font-semibold text-gray-900">{stats.views}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Lượt thích</span>
              <span className="font-semibold text-gray-900">{stats.likes}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Bình luận</span>
              <span className="font-semibold text-gray-900">
                {stats.comments}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="p-6 bg-gradient-to-r from-primary to-primary-dark text-white">
        <h3 className="font-semibold mb-2">Tham gia xu hướng!</h3>
        <p className="text-sm text-gray-100 mb-4">
          Chia sẻ tác phẩm của bạn để trở thành xu hướng tiếp theo
        </p>
        <Link to="/create-post">
          <Button
            variant="outline"
            size="sm"
            className="border-white text-white hover:bg-white hover:text-primary"
          >
            Tạo bài viết
          </Button>
        </Link>
      </Card>
    </div>
  );
};
