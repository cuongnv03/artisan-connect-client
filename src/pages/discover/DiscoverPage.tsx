import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  FireIcon,
  ShoppingBagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { SearchBox } from '../../components/common/SearchBox';
import { FilterPanel } from '../../components/common/FilterPanel';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ArtisanCard } from '../../components/common/ArtisanCard';
import { UserCard } from '../../components/common/UserCard';
import { PostCard } from '../../components/common/PostCard';
import { ProductCard } from '../../components/common/ProductCard';
import { Pagination } from '../../components/ui/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { useApi } from '../../hooks/useApi';
import { artisanService } from '../../services/artisan.service';
import { postService } from '../../services/post.service';
import { productService } from '../../services/product.service';
import { userService } from '../../services/user.service';

type SearchType = 'all' | 'artisans' | 'users' | 'posts' | 'products';

interface SearchResults {
  artisans: any[];
  users: any[];
  posts: any[];
  products: any[];
}

export const DiscoverPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<SearchType>('all');
  const [filters, setFilters] = useState<any>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    artisans: [],
    users: [],
    posts: [],
    products: [],
  });
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 12,
  });

  const debouncedQuery = useDebounce(searchQuery, 500);
  const navigate = useNavigate();

  const tabs = [
    { key: 'all', label: 'Tất cả', icon: SparklesIcon },
    { key: 'artisans', label: 'Nghệ nhân', icon: UserGroupIcon },
    { key: 'users', label: 'Người dùng', icon: UserGroupIcon },
    { key: 'posts', label: 'Bài viết', icon: FireIcon },
    { key: 'products', label: 'Sản phẩm', icon: ShoppingBagIcon },
  ];

  const quickCategories = [
    'Gốm sứ',
    'Thêu thùa',
    'Đồ gỗ',
    'Tranh vẽ',
    'Đồ da',
    'Trang sức',
    'Đan lát',
    'Điêu khắc',
  ];

  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
      setSearchParams({ q: debouncedQuery });
    } else {
      loadFeaturedContent();
      setSearchParams({});
    }
  }, [debouncedQuery, activeTab, filters, currentPage]);

  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const searchParams = {
        q: query,
        page: currentPage,
        limit: pagination.limit,
        ...filters,
      };

      if (activeTab === 'all') {
        // Search all types
        const [artisansResult, usersResult, postsResult, productsResult] =
          await Promise.allSettled([
            artisanService.searchArtisans({ ...searchParams, limit: 6 }),
            userService.searchUsers({ ...searchParams, limit: 6 }),
            postService.getPosts({ ...searchParams, limit: 6 } as any),
            productService.searchProducts({ ...searchParams, limit: 6 }),
          ]);

        setResults({
          artisans:
            artisansResult.status === 'fulfilled'
              ? artisansResult.value.data
              : [],
          users:
            usersResult.status === 'fulfilled' ? usersResult.value.data : [],
          posts:
            postsResult.status === 'fulfilled' ? postsResult.value.data : [],
          products:
            productsResult.status === 'fulfilled'
              ? productsResult.value.data
              : [],
        });
      } else {
        // Search specific type
        let result;
        switch (activeTab) {
          case 'artisans':
            result = await artisanService.searchArtisans(searchParams);
            setResults({
              artisans: result.data,
              users: [],
              posts: [],
              products: [],
            });
            setPagination({
              total: result.meta.total,
              totalPages: result.meta.totalPages,
              limit: result.meta.limit,
            });
            break;
          case 'users':
            result = await userService.searchUsers(searchParams);
            setResults({
              artisans: [],
              users: result.data,
              posts: [],
              products: [],
            });
            setPagination({
              total: result.meta.total,
              totalPages: result.meta.totalPages,
              limit: result.meta.limit,
            });
            break;
          case 'posts':
            result = await postService.getPosts(searchParams as any);
            setResults({
              artisans: [],
              users: [],
              posts: result.data,
              products: [],
            });
            setPagination({
              total: result.meta.total,
              totalPages: result.meta.totalPages,
              limit: result.meta.limit,
            });
            break;
          case 'products':
            result = await productService.searchProducts(searchParams);
            setResults({
              artisans: [],
              users: [],
              posts: [],
              products: result.data,
            });
            setPagination({
              total: result.meta.total,
              totalPages: result.meta.totalPages,
              limit: result.meta.limit,
            });
            break;
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFeaturedContent = async () => {
    setLoading(true);
    try {
      const [featuredArtisans, topPosts, featuredProducts] =
        await Promise.allSettled([
          artisanService.getFeaturedArtisans(),
          postService.getPosts({
            sortBy: 'viewCount',
            sortOrder: 'desc',
            limit: 6,
          }),
          productService.getProducts({
            sortBy: 'salesCount',
            sortOrder: 'desc',
            limit: 8,
          }),
        ]);

      setResults({
        artisans:
          featuredArtisans.status === 'fulfilled' ? featuredArtisans.value : [],
        users: [],
        posts: topPosts.status === 'fulfilled' ? topPosts.value.data : [],
        products:
          featuredProducts.status === 'fulfilled'
            ? featuredProducts.value.data
            : [],
      });
    } catch (error) {
      console.error('Load featured content error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Navigate to search results page
      navigate(`/discover/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleTabChange = (tab: SearchType) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const hasResults = Object.values(results).some((arr) => arr.length > 0);
  const showPagination = activeTab !== 'all' && pagination.totalPages > 1;

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
        <div className="max-w-2xl mx-auto mb-6">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Tìm kiếm nghệ nhân, sản phẩm, bài viết..."
          />
        </div>

        {/* Quick Access Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/discover/trending')}
            leftIcon={<FireIcon className="w-4 h-4" />}
          >
            Xu hướng
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/shop')}
            leftIcon={<ShoppingBagIcon className="w-4 h-4" />}
          >
            Cửa hàng
          </Button>
        </div>
      </div>

      {/* Quick Categories */}
      {!searchQuery && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Danh mục phổ biến
          </h2>
          <div className="flex flex-wrap gap-3">
            {quickCategories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="cursor-pointer hover:bg-accent hover:text-white transition-colors px-4 py-2"
                onClick={() => handleSearch(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg max-w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key as SearchType)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-accent shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
              {results[tab.key as keyof SearchResults]?.length > 0 && (
                <Badge variant="secondary" size="sm" className="ml-2">
                  {results[tab.key as keyof SearchResults].length}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Panel */}
      {searchQuery && (
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            categoryOptions={[
              { label: 'Gốm sứ', value: 'gom-su' },
              { label: 'Thêu thùa', value: 'theu-thua' },
              { label: 'Đồ gỗ', value: 'do-go' },
              { label: 'Tranh vẽ', value: 'tranh-ve' },
              { label: 'Đồ da', value: 'do-da' },
            ]}
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <div className="space-y-8">
          {/* Artisans */}
          {(activeTab === 'all' || activeTab === 'artisans') &&
            results.artisans.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {searchQuery ? 'Nghệ nhân' : 'Nghệ nhân nổi bật'}
                  </h2>
                  {activeTab === 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange('artisans')}
                    >
                      Xem tất cả
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.artisans
                    .slice(0, activeTab === 'all' ? 6 : undefined)
                    .map((artisan: any) => (
                      <ArtisanCard key={artisan.id} artisan={artisan} />
                    ))}
                </div>
              </section>
            )}

          {/* Users */}
          {(activeTab === 'all' || activeTab === 'users') &&
            results.users.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Người dùng
                  </h2>
                  {activeTab === 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange('users')}
                    >
                      Xem tất cả
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.users
                    .slice(0, activeTab === 'all' ? 6 : undefined)
                    .map((user: any) => (
                      <UserCard key={user.id} user={user} />
                    ))}
                </div>
              </section>
            )}

          {/* Posts */}
          {(activeTab === 'all' || activeTab === 'posts') &&
            results.posts.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {searchQuery ? 'Bài viết' : 'Bài viết nổi bật'}
                  </h2>
                  {activeTab === 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange('posts')}
                    >
                      Xem tất cả
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {results.posts
                    .slice(0, activeTab === 'all' ? 4 : undefined)
                    .map((post: any) => (
                      <PostCard key={post.id} post={post} compact />
                    ))}
                </div>
              </section>
            )}

          {/* Products */}
          {(activeTab === 'all' || activeTab === 'products') &&
            results.products.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {searchQuery ? 'Sản phẩm' : 'Sản phẩm bán chạy'}
                  </h2>
                  {activeTab === 'all' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange('products')}
                    >
                      Xem tất cả
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {results.products
                    .slice(0, activeTab === 'all' ? 8 : undefined)
                    .map((product: any) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
              </section>
            )}

          {/* Empty State */}
          {!hasResults && searchQuery && (
            <EmptyState
              icon={<MagnifyingGlassIcon className="w-16 h-16" />}
              title="Không tìm thấy kết quả"
              description="Thử tìm kiếm với từ khóa khác hoặc duyệt qua các danh mục phổ biến"
              action={{
                label: 'Khám phá nội dung nổi bật',
                onClick: () => setSearchQuery(''),
              }}
            />
          )}

          {/* Pagination */}
          {showPagination && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
