import React, { useState } from 'react';
import { FireIcon, ClockIcon } from '@heroicons/react/24/outline';
import { TrendingSidebar } from '../../components/discover/TrendingSidebar';
import { PostCard } from '../../components/posts/customer/PostCard';
import { ProductCard } from '../../components/products/ProductCard';
import { ArtisanCard } from '../../components/common/ArtisanCard';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Tabs } from '../../components/ui/Tabs';
import { useTrendingData } from '../../hooks/discover/useTrendingData';

export const TrendingPage: React.FC = () => {
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>(
    'week',
  );
  const [activeTab, setActiveTab] = useState('posts');
  const { trendingData, loading } = useTrendingData(timePeriod);

  const getPeriodDisplay = (period: string) => {
    const periods = {
      day: 'Hôm nay',
      week: 'Tuần này',
      month: 'Tháng này',
    };
    return periods[period as keyof typeof periods] || period;
  };

  const tabItems = [
    {
      key: 'posts',
      label: 'Bài viết',
      icon: <FireIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {trendingData.posts.map((post, index) => (
            <div key={post.id} className="relative">
              <div className="absolute -left-6 top-4 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                {index + 1}
              </div>
              <PostCard post={post} compact />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'products',
      label: 'Sản phẩm',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingData.products.map((product, index) => (
            <div key={product.id} className="relative">
              <div className="absolute top-2 left-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                {index + 1}
              </div>
              <ProductCard product={product} isManagementView={false} />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'artisans',
      label: 'Nghệ nhân',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingData.artisans.map((artisan, index) => (
            <div key={artisan.id} className="relative">
              <div className="absolute top-2 left-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                {index + 1}
              </div>
              <ArtisanCard artisan={artisan} />
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FireIcon className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-gray-900">Xu hướng</h1>
        </div>
        <p className="text-lg text-gray-600 mb-6">
          Khám phá những nội dung đang được quan tâm nhất trong cộng đồng nghệ
          thuật
        </p>

        {/* Time Period Selector */}
        <div className="flex items-center gap-2">
          {(['day', 'week', 'month'] as const).map((period) => (
            <Button
              key={period}
              variant={timePeriod === period ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setTimePeriod(period)}
              leftIcon={<ClockIcon className="w-4 h-4" />}
            >
              {getPeriodDisplay(period)}
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải dữ liệu xu hướng...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs
              items={tabItems}
              activeKey={activeTab}
              onChange={setActiveTab}
              variant="line"
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <TrendingSidebar
              hashtags={trendingData.hashtags}
              keywords={trendingData.keywords}
              stats={{
                views: '2.5M',
                likes: '180K',
                comments: '45K',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
