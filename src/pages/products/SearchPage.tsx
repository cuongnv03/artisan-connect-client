import React, { useState } from 'react';
import { useProductSearch } from '../../hooks/products/useProductSearch';
import { ProductGrid } from '../../components/products/customer/ProductGrid';
import { ProductFilters } from '../../components/products/customer/ProductFilters';
import { SearchBox } from '../../components/common/SearchBox';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export const SearchPage: React.FC = () => {
  const [showFilters, setShowFilters] = useState(false);
  const {
    products,
    loading,
    error,
    searchQuery,
    totalResults,
    hasMore,
    setSearchQuery,
    setFilters,
    search,
    loadMore,
  } = useProductSearch();

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
  });

  const handleSearch = (query: string) => {
    if (query.trim()) {
      search(query);

      // Add to search history
      const newHistory = [
        query,
        ...searchHistory.filter((q) => q !== query),
      ].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    }
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

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            leftIcon={<XMarkIcon className="w-4 h-4" />}
          >
            Quay lại
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

      {/* Search Suggestions - Show when no search query */}
      {!searchQuery && (
        <div className="mb-8">
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
                {totalResults} sản phẩm được tìm thấy
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              leftIcon={<FunnelIcon className="w-4 h-4" />}
            >
              Bộ lọc
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mb-6">
              <ProductFilters filters={{}} onFilterChange={setFilters} />
            </div>
          )}

          {/* Products */}
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            hasMore={hasMore}
            onLoadMore={loadMore}
            emptyMessage="Không tìm thấy sản phẩm nào"
            emptyDescription={`Không có sản phẩm nào khớp với từ khóa "${searchQuery}". Thử tìm kiếm với từ khóa khác.`}
          />
        </>
      )}
    </div>
  );
};
