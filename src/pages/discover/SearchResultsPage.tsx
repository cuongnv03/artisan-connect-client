import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { SearchBox } from '../../components/common/SearchBox';
import { FilterPanel } from '../../components/common/FilterPanel';
import { EmptyState } from '../../components/common/EmptyState';
import { ArtisanCard } from '../../components/common/ArtisanCard';
import { UserCard } from '../../components/common/UserCard';
import { PostCard } from '../../components/common/PostCard';
import { ProductCard } from '../../components/common/ProductCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { Tabs } from '../../components/ui/Tabs';
import { useDebounce } from '../../hooks/useDebounce';
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
  totals: {
    artisans: number;
    users: number;
    posts: number;
    products: number;
  };
}

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState<SearchType>(
    (searchParams.get('type') as SearchType) || 'all',
  );
  const [results, setResults] = useState<SearchResults>({
    artisans: [],
    users: [],
    posts: [],
    products: [],
    totals: { artisans: 0, users: 0, posts: 0, products: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 20,
  });
  const [filters, setFilters] = useState<any>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const debouncedQuery = useDebounce(searchQuery, 300);

  // Advanced filters for different content types
  const getFilterOptions = () => {
    const commonSorts = [
      { label: 'Mới nhất', value: 'createdAt' },
      { label: 'Phổ biến nhất', value: 'viewCount' },
      { label: 'Liên quan nhất', value: 'relevance' },
    ];

    switch (activeTab) {
      case 'products':
        return {
          categories: [
            { label: 'Gốm sứ', value: 'gom-su' },
            { label: 'Thêu thùa', value: 'theu-thua' },
            { label: 'Đồ gỗ', value: 'do-go' },
            { label: 'Tranh vẽ', value: 'tranh-ve' },
            { label: 'Đồ da', value: 'do-da' },
            { label: 'Trang sức', value: 'trang-suc' },
          ],
          sorts: [
            ...commonSorts,
            { label: 'Giá thấp đến cao', value: 'price_asc' },
            { label: 'Giá cao đến thấp', value: 'price_desc' },
            { label: 'Bán chạy nhất', value: 'salesCount' },
            { label: 'Đánh giá cao', value: 'avgRating' },
          ],
        };
      case 'posts':
        return {
          categories: [
            { label: 'Câu chuyện', value: 'STORY' },
            { label: 'Hướng dẫn', value: 'TUTORIAL' },
            { label: 'Sản phẩm', value: 'PRODUCT_SHOWCASE' },
            { label: 'Hậu trường', value: 'BEHIND_THE_SCENES' },
            { label: 'Sự kiện', value: 'EVENT' },
          ],
          sorts: [
            ...commonSorts,
            { label: 'Nhiều thích nhất', value: 'likeCount' },
            { label: 'Nhiều bình luận', value: 'commentCount' },
          ],
        };
      case 'artisans':
        return {
          categories: [
            { label: 'Đã xác minh', value: 'verified' },
            { label: 'Gốm sứ', value: 'gom-su' },
            { label: 'Thêu thùa', value: 'theu-thua' },
            { label: 'Đồ gỗ', value: 'do-go' },
          ],
          sorts: [
            ...commonSorts,
            { label: 'Đánh giá cao', value: 'rating' },
            { label: 'Bán chạy nhất', value: 'totalSales' },
            { label: 'Nhiều theo dõi', value: 'followerCount' },
          ],
        };
      default:
        return {
          categories: [],
          sorts: commonSorts,
        };
    }
  };

  useEffect(() => {
    if (debouncedQuery) {
      performSearch();
      updateURL();
    } else {
      // Redirect back to discover if no search query
      navigate('/discover');
    }
  }, [debouncedQuery, activeTab, filters, currentPage]);

  const updateURL = () => {
    const params: any = { q: debouncedQuery };
    if (activeTab !== 'all') {
      params.type = activeTab;
    }
    if (currentPage > 1) {
      params.page = currentPage.toString();
    }
    setSearchParams(params);
  };

  const performSearch = async () => {
    if (!debouncedQuery) return;

    setLoading(true);
    try {
      const searchParams = {
        q: debouncedQuery,
        page: currentPage,
        limit: pagination.limit,
        ...filters,
      };

      if (activeTab === 'all') {
        // Search all types for totals and limited results
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
          totals: {
            artisans:
              artisansResult.status === 'fulfilled'
                ? artisansResult.value.meta.total
                : 0,
            users:
              usersResult.status === 'fulfilled'
                ? usersResult.value.meta.total
                : 0,
            posts:
              postsResult.status === 'fulfilled'
                ? postsResult.value.meta.total
                : 0,
            products:
              productsResult.status === 'fulfilled'
                ? productsResult.value.meta.total
                : 0,
          },
        });

        // Calculate total for pagination
        const totalResults = Object.values({
          artisans:
            artisansResult.status === 'fulfilled'
              ? artisansResult.value.meta.total
              : 0,
          users:
            usersResult.status === 'fulfilled'
              ? usersResult.value.meta.total
              : 0,
          posts:
            postsResult.status === 'fulfilled'
              ? postsResult.value.meta.total
              : 0,
          products:
            productsResult.status === 'fulfilled'
              ? productsResult.value.meta.total
              : 0,
        }).reduce((sum, count) => sum + count, 0);

        setPagination((prev) => ({
          ...prev,
          total: totalResults,
          totalPages: 1,
        }));
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
              totals: {
                artisans: result.meta.total,
                users: 0,
                posts: 0,
                products: 0,
              },
            });
            break;
          case 'users':
            result = await userService.searchUsers(searchParams);
            setResults({
              artisans: [],
              users: result.data,
              posts: [],
              products: [],
              totals: {
                artisans: 0,
                users: result.meta.total,
                posts: 0,
                products: 0,
              },
            });
            break;
          case 'posts':
            result = await postService.getPosts(searchParams as any);
            setResults({
              artisans: [],
              users: [],
              posts: result.data,
              products: [],
              totals: {
                artisans: 0,
                users: 0,
                posts: result.meta.total,
                products: 0,
              },
            });
            break;
          case 'products':
            result = await productService.searchProducts(searchParams);
            setResults({
              artisans: [],
              users: [],
              posts: [],
              products: result.data,
              totals: {
                artisans: 0,
                users: 0,
                posts: 0,
                products: result.meta.total,
              },
            });
            break;
        }

        if (result) {
          setPagination({
            total: result.meta.total,
            totalPages: result.meta.totalPages,
            limit: result.meta.limit,
          });
        }
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: SearchType) => {
    setActiveTab(tab);
    setCurrentPage(1);
    setFilters({ sortBy: 'createdAt', sortOrder: 'desc' });
  };

  const clearSearch = () => {
    navigate('/discover');
  };

  const filterOptions = getFilterOptions();

  const tabItems = [
    {
      key: 'all',
      label: 'Tất cả',
      badge: Object.values(results.totals).reduce(
        (sum, count) => sum + count,
        0,
      ),
      content: (
        <div className="space-y-8">
          {/* Artisans Section */}
          {results.artisans.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Nghệ nhân ({results.totals.artisans})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTabChange('artisans')}
                >
                  Xem tất cả
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.artisans.map((artisan: any) => (
                  <ArtisanCard key={artisan.id} artisan={artisan} />
                ))}
              </div>
            </section>
          )}

          {/* Users Section */}
          {results.users.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Người dùng ({results.totals.users})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTabChange('users')}
                >
                  Xem tất cả
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.users.map((user: any) => (
                  <UserCard key={user.id} user={user} />
                ))}
              </div>
            </section>
          )}

          {/* Posts Section */}
          {results.posts.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Bài viết ({results.totals.posts})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTabChange('posts')}
                >
                  Xem tất cả
                </Button>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {results.posts.map((post: any) => (
                  <PostCard key={post.id} post={post} compact />
                ))}
              </div>
            </section>
          )}

          {/* Products Section */}
          {results.products.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Sản phẩm ({results.totals.products})
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleTabChange('products')}
                >
                  Xem tất cả
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {results.products.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          )}
        </div>
      ),
    },
    {
      key: 'artisans',
      label: 'Nghệ nhân',
      badge: results.totals.artisans,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.artisans.map((artisan: any) => (
            <ArtisanCard key={artisan.id} artisan={artisan} />
          ))}
        </div>
      ),
    },
    {
      key: 'users',
      label: 'Người dùng',
      badge: results.totals.users,
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.users.map((user: any) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ),
    },
    {
      key: 'posts',
      label: 'Bài viết',
      badge: results.totals.posts,
      content: (
        <div className="space-y-6">
          {results.posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ),
    },
    {
      key: 'products',
      label: 'Sản phẩm',
      badge: results.totals.products,
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {results.products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ),
    },
  ];

  const hasResults = Object.values(results.totals).some((count) => count > 0);
  const totalResults = Object.values(results.totals).reduce(
    (sum, count) => sum + count,
    0,
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={clearSearch}
            leftIcon={<XMarkIcon className="w-4 h-4" />}
          >
            Quay lại khám phá
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Kết quả tìm kiếm
        </h1>

        {searchQuery && (
          <div className="mb-4">
            <p className="text-gray-600">
              Tìm kiếm cho "<span className="font-medium">{searchQuery}</span>"
              - {totalResults} kết quả
            </p>
          </div>
        )}

        {/* Search Bar */}
        <div className="max-w-2xl">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Tìm kiếm nghệ nhân, sản phẩm, bài viết..."
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          {activeTab !== 'all' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<AdjustmentsHorizontalIcon className="w-4 h-4" />}
            >
              Bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && activeTab !== 'all' && (
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            onFilterChange={setFilters}
            categoryOptions={filterOptions.categories}
            sortOptions={filterOptions.sorts}
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
        <>
          {hasResults ? (
            <>
              <Tabs
                items={tabItems}
                activeKey={activeTab}
                onChange={handleTabChange}
                variant="line"
              />

              {/* Pagination for specific tabs */}
              {activeTab !== 'all' && pagination.totalPages > 1 && (
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
            </>
          ) : (
            <EmptyState
              icon={<MagnifyingGlassIcon className="w-16 h-16" />}
              title="Không tìm thấy kết quả"
              description={`Không có kết quả nào cho "${searchQuery}". Thử tìm kiếm với từ khóa khác.`}
              action={{
                label: 'Quay lại khám phá',
                onClick: clearSearch,
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
