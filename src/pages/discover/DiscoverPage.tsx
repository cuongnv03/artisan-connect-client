import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import {
  DiscoverProvider,
  useDiscoverContext,
} from '../../contexts/DiscoverContext';
import { DiscoverHero } from '../../components/discover/DiscoverHero';
import { QuickCategories } from '../../components/discover/QuickCategories';
import { SearchTabs } from '../../components/discover/SearchTabs';
import { FeaturedSections } from '../../components/discover/FeaturedSections';
import { SearchResults } from '../../components/discover/SearchResults';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { FilterPanel } from '../../components/common/FilterPanel';
import { useFeaturedContent } from '../../hooks/discover/useFeaturedContent';
import { useDiscoverSearch } from '../../hooks/discover/useDiscoverSearch';
import { useDebounce } from '../../hooks/common/useDebounce';

const DiscoverPageContent: React.FC = () => {
  const { state, setSearchQuery, setActiveTab, setFilters, setCurrentPage } =
    useDiscoverContext();
  const { content: featuredContent, loading: featuredLoading } =
    useFeaturedContent();
  const { performSearch } = useDiscoverSearch();
  const navigate = useNavigate();

  const debouncedQuery = useDebounce(state.searchQuery, 500);

  React.useEffect(() => {
    if (debouncedQuery) {
      performSearch();
    }
  }, [debouncedQuery, state.activeTab, state.filters, state.currentPage]);

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

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/discover/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleCategoryClick = (category: string) => {
    handleSearch(category);
  };

  const handleViewMore = (type: string) => {
    setActiveTab(type as any);
  };

  const hasResults = Object.values(state.results).some((arr) => arr.length > 0);
  const showPagination =
    state.activeTab !== 'all' && state.pagination.totalPages > 1;

  return (
    <div className="max-w-7xl mx-auto">
      <DiscoverHero
        searchQuery={state.searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
      />

      {!state.searchQuery && (
        <QuickCategories
          categories={quickCategories}
          onCategoryClick={handleCategoryClick}
        />
      )}

      {state.searchQuery && (
        <>
          <SearchTabs
            activeTab={state.activeTab}
            onTabChange={setActiveTab}
            totals={state.totals}
          />

          {state.activeTab !== 'all' && (
            <div className="mb-6">
              <FilterPanel
                filters={state.filters}
                onFilterChange={setFilters}
                categoryOptions={[
                  { label: 'Gốm sứ', value: 'gom-su' },
                  { label: 'Thêu thùa', value: 'theu-thua' },
                  { label: 'Đồ gỗ', value: 'do-go' },
                ]}
              />
            </div>
          )}
        </>
      )}

      {state.loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
        </div>
      ) : (
        <>
          {state.searchQuery ? (
            hasResults ? (
              <>
                <SearchResults
                  activeTab={state.activeTab}
                  results={state.results}
                  totals={state.totals}
                  onViewMore={handleViewMore}
                />
                {showPagination && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={state.currentPage}
                      totalPages={state.pagination.totalPages}
                      totalItems={state.pagination.total}
                      itemsPerPage={state.pagination.limit}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            ) : (
              <EmptyState
                icon={<MagnifyingGlassIcon className="w-16 h-16" />}
                title="Không tìm thấy kết quả"
                description="Thử tìm kiếm với từ khóa khác hoặc duyệt qua các danh mục phổ biến"
                action={{
                  label: 'Khám phá nội dung nổi bật',
                  onClick: () => setSearchQuery(''),
                }}
              />
            )
          ) : featuredLoading ? (
            <div className="text-center py-12">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-gray-600">Đang tải nội dung nổi bật...</p>
            </div>
          ) : (
            <FeaturedSections
              content={featuredContent}
              onViewMore={handleViewMore}
            />
          )}
        </>
      )}
    </div>
  );
};

export const DiscoverPage: React.FC = () => {
  return (
    <DiscoverProvider>
      <DiscoverPageContent />
    </DiscoverProvider>
  );
};
