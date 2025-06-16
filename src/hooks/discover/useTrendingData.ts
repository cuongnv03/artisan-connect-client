import { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analytics.service';
import { postService } from '../../services/post.service';
import { productService } from '../../services/product.service';
import { artisanService } from '../../services/artisan.service';

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

export const useTrendingData = (
  timePeriod: 'day' | 'week' | 'month' = 'week',
) => {
  const [trendingData, setTrendingData] = useState<TrendingData>({
    posts: [],
    products: [],
    artisans: [],
    hashtags: [],
    keywords: [],
  });
  const [loading, setLoading] = useState(true);

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

  return { trendingData, loading, reload: loadTrendingData };
};
