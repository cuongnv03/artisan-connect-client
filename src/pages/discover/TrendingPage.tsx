import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FireIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleOvalLeftIcon,
} from '@heroicons/react/24/outline';
import { analyticsService } from '../../services/analytics.service';
import { postService } from '../../services/post.service';
import { productService } from '../../services/product.service';
import { artisanService } from '../../services/artisan.service';
import { PostCard } from '../../components/common/PostCard';
import { ProductCard } from '../../components/common/ProductCard';
import { ArtisanCard } from '../../components/common/ArtisanCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Tabs } from '../../components/ui/Tabs';

interface TrendingData {
  posts: any[];
  products: any[];
  artisans: any[];
  hashtags: Array<{ tag: string; count: number; growth: number }>;
  keywords: Array<{
    keyword: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export const TrendingPage: React.FC = () => {
  const [trendingData, setTrendingData] = useState<TrendingData>({
    posts: [],
    products: [],
    artisans: [],
    hashtags: [],
    keywords: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [timePeriod, setTimePeriod] = useState<'day' | 'week' | 'month'>(
    'week',
  );

  useEffect(() => {
    loadTrendingData();
  }, [timePeriod]);

  const loadTrendingData = async () => {
    setLoading(true);
    try {
      const [trendingPosts, topProducts, featuredArtisans] =
        await Promise.allSettled([
          analyticsService.getTrendingPosts({ period: timePeriod, limit: 10 }),
          productService.getProducts({
            sortBy: 'viewCount',
            sortOrder: 'desc',
            limit: 8,
          }),
          artisanService.getTopArtisans(6),
        ]);

      // Mock trending hashtags and keywords data
      const mockHashtags = [
        { tag: 'gốm-sứ', count: 1250, growth: 15.2 },
        { tag: 'thêu-tay', count: 980, growth: 8.7 },
        { tag: 'đồ-gỗ', count: 850, growth: 12.4 },
        { tag: 'tranh-vẽ', count: 720, growth: -2.1 },
        { tag: 'trang-sức', count: 680, growth: 25.8 },
        { tag: 'đan-lát', count: 450, growth: 5.9 },
      ];

      const mockKeywords = [
        { keyword: 'handmade', count: 2340, trend: 'up' as const },
        { keyword: 'truyền thống', count: 1890, trend: 'up' as const },
        { keyword: 'sáng tạo', count: 1560, trend: 'stable' as const },
        { keyword: 'văn hóa Việt', count: 1340, trend: 'up' as const },
        { keyword: 'thủ công', count: 1120, trend: 'down' as const },
      ];

      setTrendingData({
        posts: trendingPosts.status === 'fulfilled' ? trendingPosts.value : [],
        products:
          topProducts.status === 'fulfilled' ? topProducts.value.data : [],
        artisans:
          featuredArtisans.status === 'fulfilled'
            ? featuredArtisans.value.data
            : [],
        hashtags: mockHashtags,
        keywords: mockKeywords,
      });
    } catch (error) {
      console.error('Error loading trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodDisplay = (period: string) => {
    const periods = {
      day: 'Hôm nay',
      week: 'Tuần này',
      month: 'Tháng này',
    };
    return periods[period as keyof typeof periods] || period;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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
              <div className="absolute -left-6 top-4 w-8 h-8 bg-accent text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
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
      icon: <ArrowTrendingUpIcon className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {trendingData.products.map((product, index) => (
            <div key={product.id} className="relative">
              <div className="absolute top-2 left-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
                {index + 1}
              </div>
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ),
    },
    {
      key: 'artisans',
      label: 'Nghệ nhân',
      icon: <ArrowTrendingUpIcon className="w-4 h-4" />,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingData.artisans.map((artisan, index) => (
            <div key={artisan.id} className="relative">
              <div className="absolute top-2 left-2 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center text-xs font-bold z-10">
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
          <FireIcon className="w-8 h-8 text-accent" />
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
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Hashtags */}
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-accent" />
                Hashtags xu hướng
              </h3>
              <div className="space-y-3">
                {trendingData.hashtags.map((hashtag, index) => (
                  <div
                    key={hashtag.tag}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">#{index + 1}</span>
                      <Link
                        to={`/discover?q=%23${hashtag.tag}`}
                        className="text-accent hover:text-accent-dark font-medium"
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
                <FireIcon className="w-5 h-5 mr-2 text-accent" />
                Từ khóa hot
              </h3>
              <div className="space-y-3">
                {trendingData.keywords.map((keyword, index) => (
                  <div
                    key={keyword.keyword}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">#{index + 1}</span>
                      <Link
                        to={`/discover?q=${keyword.keyword}`}
                        className="text-gray-700 hover:text-accent font-medium"
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
            <Card className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Thống kê nhanh
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <EyeIcon className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">
                      Lượt xem {getPeriodDisplay(timePeriod).toLowerCase()}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">2.5M</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HeartIcon className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Lượt thích</span>
                  </div>
                  <span className="font-semibold text-gray-900">180K</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChatBubbleOvalLeftIcon className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-600">Bình luận</span>
                  </div>
                  <span className="font-semibold text-gray-900">45K</span>
                </div>
              </div>
            </Card>

            {/* Call to Action */}
            <Card className="p-6 bg-gradient-vietnamese text-white">
              <h3 className="font-semibold mb-2">Tham gia xu hướng!</h3>
              <p className="text-sm text-gray-100 mb-4">
                Chia sẻ tác phẩm của bạn để trở thành xu hướng tiếp theo
              </p>
              <Link to="/create-post">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white text-white hover:bg-white hover:text-accent"
                >
                  Tạo bài viết
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
