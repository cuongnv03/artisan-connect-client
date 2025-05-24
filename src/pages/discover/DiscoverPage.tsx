import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  StarIcon,
  UserGroupIcon,
  FireIcon,
} from '@heroicons/react/24/outline';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ArtisanCard } from '../../components/common/ArtisanCard';
import { PostCard } from '../../components/common/PostCard';
import { ProductCard } from '../../components/common/ProductCard';
import { useDebounce } from '../../hooks/useDebounce';
import { artisanService } from '../../services/artisan.service';
import { postService } from '../../services/post.service';
import { productService } from '../../services/product.service';

type SearchType = 'all' | 'artisans' | 'posts' | 'products';

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<SearchType>('all');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any>({
    artisans: [],
    posts: [],
    products: [],
  });

  const debouncedQuery = useDebounce(searchQuery, 500);

  const tabs = [
    { key: 'all', label: 'Tất cả', icon: MagnifyingGlassIcon },
    { key: 'artisans', label: 'Nghệ nhân', icon: UserGroupIcon },
    { key: 'posts', label: 'Bài viết', icon: FireIcon },
    { key: 'products', label: 'Sản phẩm', icon: StarIcon },
  ];

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
      setSearchParams({ q: debouncedQuery });
    } else {
      loadFeaturedContent();
      setSearchParams({});
    }
  }, [debouncedQuery]);

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const [artisansResult, postsResult, productsResult] = await Promise.all([
        artisanService.searchArtisans({ q: query, limit: 6 }),
        postService.getPosts({ q: query, limit: 6 } as any),
        productService.searchProducts({ q: query, limit: 6 }),
      ]);

      setResults({
        artisans: artisansResult.data,
        posts: postsResult.data,
        products: productsResult.data,
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedContent = async () => {
    setLoading(true);
    try {
      const [featuredArtisans, topPosts, featuredProducts] = await Promise.all([
        artisanService.getFeaturedArtisans(),
        postService.getPosts({
          sortBy: 'viewCount',
          sortOrder: 'desc',
          limit: 6,
        }),
        productService.getProducts({
          sortBy: 'salesCount',
          sortOrder: 'desc',
          limit: 6,
        }),
      ]);

      setResults({
        artisans: featuredArtisans,
        posts: topPosts.data,
        products: featuredProducts.data,
      });
    } catch (error) {
      console.error('Load featured content error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  };

  const filteredResults =
    activeTab === 'all' ? results : { [activeTab]: results[activeTab] };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Khám phá thế giới nghệ thuật
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Tìm kiếm nghệ nhân, sản phẩm và câu chuyện thú vị từ cộng đồng thủ
          công Việt Nam
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm kiếm nghệ nhân, sản phẩm, bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              }
              rightIcon={
                <Button type="submit" size="sm" className="mr-2">
                  Tìm
                </Button>
              }
              className="pr-20"
            />
          </div>
        </form>
      </div>

      {/* Quick Categories */}
      {!searchQuery && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Danh mục phổ biến
          </h2>
          <div className="flex flex-wrap gap-3">
            {[
              'Gốm sứ',
              'Thêu thùa',
              'Đồ gỗ',
              'Tranh vẽ',
              'Đồ da',
              'Trang sức',
            ].map((category) => (
              <Badge
                key={category}
                variant="outline"
                className="cursor-pointer hover:bg-accent hover:text-white transition-colors"
                onClick={() => setSearchQuery(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg max-w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as SearchType)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-accent shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {results[tab.key]?.length > 0 && (
                <Badge variant="secondary" size="sm" className="ml-2">
                  {results[tab.key].length}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Artisans */}
          {(activeTab === 'all' || activeTab === 'artisans') &&
            filteredResults.artisans?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {searchQuery ? 'Nghệ nhân' : 'Nghệ nhân nổi bật'}
                  </h2>
                  {activeTab === 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('artisans')}
                    >
                      Xem tất cả
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResults.artisans
                    .slice(0, activeTab === 'all' ? 6 : undefined)
                    .map((artisan: any) => (
                      <ArtisanCard key={artisan.id} artisan={artisan} />
                    ))}
                </div>
              </section>
            )}

          {/* Posts */}
          {(activeTab === 'all' || activeTab === 'posts') &&
            filteredResults.posts?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {searchQuery ? 'Bài viết' : 'Bài viết nổi bật'}
                  </h2>
                  {activeTab === 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('posts')}
                    >
                      Xem tất cả
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredResults.posts
                    .slice(0, activeTab === 'all' ? 4 : undefined)
                    .map((post: any) => (
                      <PostCard key={post.id} post={post} compact />
                    ))}
                </div>
              </section>
            )}

          {/* Products */}
          {(activeTab === 'all' || activeTab === 'products') &&
            filteredResults.products?.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {searchQuery ? 'Sản phẩm' : 'Sản phẩm bán chạy'}
                  </h2>
                  {activeTab === 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveTab('products')}
                    >
                      Xem tất cả
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredResults.products
                    .slice(0, activeTab === 'all' ? 8 : undefined)
                    .map((product: any) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
              </section>
            )}

          {/* No Results */}
          {searchQuery &&
            Object.values(filteredResults).every(
              (arr: any) => arr.length === 0,
            ) && (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không tìm thấy kết quả
                </h3>
                <p className="text-gray-500 mb-6">
                  Thử tìm kiếm với từ khóa khác hoặc duyệt qua các danh mục
                </p>
                <Button onClick={() => setSearchQuery('')}>
                  Khám phá nội dung nổi bật
                </Button>
              </div>
            )}
        </div>
      )}
    </div>
  );
};
