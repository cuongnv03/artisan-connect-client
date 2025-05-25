import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { productService } from '../../services/product.service';
import { Product } from '../../types/product';
import { PaginatedResponse } from '../../types/common';
import { SearchBox } from '../../components/common/SearchBox';
import { FilterPanel } from '../../components/common/FilterPanel';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { useDebounce } from '../../hooks/useDebounce';

type ViewMode = 'grid' | 'list';
type SortBy =
  | 'relevance'
  | 'createdAt'
  | 'price'
  | 'salesCount'
  | 'avgRating'
  | 'viewCount';

interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  isCustomizable?: boolean;
  tags?: string[];
  sortBy: SortBy;
  sortOrder: 'asc' | 'desc';
}

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 20,
  });
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: 'relevance',
    sortOrder: 'desc',
  });
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);

  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    // Load search history from localStorage
    const history = localStorage.getItem('searchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  useEffect(() => {
    if (debouncedQuery) {
      performSearch();
      updateURL();
    } else {
      setProducts([]);
      setPagination({ total: 0, totalPages: 0, limit: 20 });
    }
  }, [debouncedQuery, filters, currentPage]);

  useEffect(() => {
    loadTrendingProducts();
  }, []);

  const loadTrendingProducts = async () => {
    try {
      // Load trending products
      const trending = await productService.getProducts({
        sortBy: 'viewCount',
        sortOrder: 'desc',
        limit: 6,
      });
      setTrendingProducts(trending.data);
    } catch (error) {
      console.error('Error loading trending products:', error);
    }
  };

  const updateURL = () => {
    const params: any = {};
    if (debouncedQuery) params.q = debouncedQuery;
    if (currentPage > 1) params.page = currentPage.toString();
    if (filters.category) params.category = filters.category;
    if (filters.minPrice) params.minPrice = filters.minPrice.toString();
    if (filters.maxPrice) params.maxPrice = filters.maxPrice.toString();
    if (filters.sortBy !== 'relevance') params.sortBy = filters.sortBy;

    setSearchParams(params);
  };

  const performSearch = async () => {
    if (!debouncedQuery.trim()) return;

    setLoading(true);
    try {
      const params: any = {
        q: debouncedQuery,
        page: currentPage,
        limit: pagination.limit,
        ...filters,
      };

      // Handle special sort cases
      if (filters.sortBy === 'price' && filters.sortOrder === 'asc') {
        params.sortBy = 'price_asc';
      } else if (filters.sortBy === 'price' && filters.sortOrder === 'desc') {
        params.sortBy = 'price_desc';
      }

      const result = await productService.searchProducts(params);
      setProducts(result.data);
      setPagination({
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        limit: result.meta.limit,
      });

      // Add to search history
      addToSearchHistory(debouncedQuery);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return;

    const newHistory = [
      query,
      ...searchHistory.filter((q) => q !== query),
    ].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters({ ...filters, ...newFilters });
    setCurrentPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    navigate('/shop');
  };

  const removeFromHistory = (query: string) => {
    const newHistory = searchHistory.filter((q) => q !== query);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const priceRanges = [
    { label: 'Dưới 100K', value: { max: 100000 } },
    { label: '100K - 500K', value: { min: 100000, max: 500000 } },
    { label: '500K - 1M', value: { min: 500000, max: 1000000 } },
    { label: '1M - 5M', value: { min: 1000000, max: 5000000 } },
    { label: 'Trên 5M', value: { min: 5000000 } },
  ];

  const categories = [
    { label: 'Gốm sứ', value: 'gom-su' },
    { label: 'Thêu thùa', value: 'theu-thua' },
    { label: 'Đồ gỗ', value: 'do-go' },
    { label: 'Tranh vẽ', value: 'tranh-ve' },
    { label: 'Đồ da', value: 'do-da' },
    { label: 'Trang sức', value: 'trang-suc' },
  ];

  const sortOptions = [
    { label: 'Liên quan nhất', value: 'relevance' },
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Bán chạy nhất', value: 'salesCount' },
    { label: 'Đánh giá cao', value: 'avgRating' },
    { label: 'Giá thấp đến cao', value: 'price_asc' },
    { label: 'Giá cao đến thấp', value: 'price_desc' },
    { label: 'Xem nhiều nhất', value: 'viewCount' },
  ];

  const hasActiveFilters = Object.keys(filters).some(
    (key) =>
      key !== 'sortBy' &&
      key !== 'sortOrder' &&
      filters[key as keyof SearchFilters],
  );

  // Show trending when no search
  const renderTrendingSection = () => (
    <div>
      <h3 className="font-semibold text-gray-900 mb-4">Sản phẩm thịnh hành</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showSellerInfo={true}
          />
        ))}
      </div>
    </div>
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
            Quay lại cửa hàng
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tìm kiếm sản phẩm
        </h1>

        {/* Search Bar */}
        <div className="max-w-2xl">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>
      </div>

      {/* Search Suggestions */}
      {!searchQuery && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Search History */}
          {searchHistory.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Tìm kiếm gần đây
                </h3>
                <Button variant="ghost" size="sm" onClick={clearHistory}>
                  Xóa tất cả
                </Button>
              </div>
              <div className="space-y-2">
                {searchHistory.map((query) => (
                  <div
                    key={query}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => handleSearch(query)}
                      className="flex-1 text-left text-gray-700 hover:text-primary"
                    >
                      <MagnifyingGlassIcon className="w-4 h-4 inline mr-2" />
                      {query}
                    </button>
                    <button
                      onClick={() => removeFromHistory(query)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popular Searches */}
          {renderTrendingSection()}
        </div>
      )}

      {/* Search Results */}
      {searchQuery && (
        <>
          {/* Results Info */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Kết quả cho "{searchQuery}"
              </h2>
              <p className="text-gray-600">
                {pagination.total} sản phẩm được tìm thấy
              </p>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3 mb-4">
              <h3 className="font-medium text-gray-900 mr-4">Khoảng giá:</h3>
              {priceRanges.map((range) => (
                <Badge
                  key={range.label}
                  variant={
                    filters.minPrice === range.value.min &&
                    filters.maxPrice === range.value.max
                      ? 'primary'
                      : 'secondary'
                  }
                  className="cursor-pointer hover:bg-primary hover:text-white transition-colors"
                  onClick={() =>
                    handleFilterChange({
                      minPrice: range.value.min,
                      maxPrice: range.value.max,
                    })
                  }
                >
                  {range.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<FunnelIcon className="w-4 h-4" />}
              >
                Bộ lọc {hasActiveFilters && '(đã áp dụng)'}
              </Button>
            </div>

            <div className="flex items-center gap-4">
              {/* View Mode */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Squares2X2Icon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-primary text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ListBulletIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-6">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                categoryOptions={categories}
                sortOptions={sortOptions}
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

          {/* Products Results */}
          {!loading && (
            <>
              {products.length > 0 ? (
                <>
                  <div
                    className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                        : 'space-y-4'
                    }
                  >
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        showSellerInfo={true}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
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
                  title="Không tìm thấy sản phẩm nào"
                  description={`Không có sản phẩm nào khớp với từ khóa "${searchQuery}". Thử tìm kiếm với từ khóa khác.`}
                  action={{
                    label: 'Xóa bộ lọc',
                    onClick: () =>
                      setFilters({ sortBy: 'relevance', sortOrder: 'desc' }),
                  }}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};
