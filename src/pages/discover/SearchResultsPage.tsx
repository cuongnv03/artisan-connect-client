import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import {
  DiscoverProvider,
  useDiscoverContext,
} from '../../contexts/DiscoverContext';
import { SearchBox } from '../../components/common/SearchBox';
import { SearchTabs } from '../../components/discover/SearchTabs';
import { SearchResults } from '../../components/discover/SearchResults';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { FilterPanel } from '../../components/common/FilterPanel';
import { PostModal } from '../../components/posts/customer/PostModal';
import { Button } from '../../components/ui/Button';
import { useDiscoverSearch } from '../../hooks/discover/useDiscoverSearch';
import { usePostModal } from '../../hooks/posts';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/common/useDebounce';
import { Post } from '../../types/post';

const SearchResultsPageContent: React.FC = () => {
  const { state, setSearchQuery, setActiveTab, setFilters, setCurrentPage } =
    useDiscoverContext();
  const { performSearch } = useDiscoverSearch();
  const { selectedPost, isOpen, openModal, closeModal } = usePostModal();
  const { state: authState } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = React.useState(false);

  const debouncedQuery = useDebounce(state.searchQuery, 300);

  React.useEffect(() => {
    if (debouncedQuery) {
      performSearch();
      updateURL();
    } else {
      navigate('/discover');
    }
  }, [debouncedQuery, state.activeTab, state.filters, state.currentPage]);

  const updateURL = () => {
    const params: any = { q: debouncedQuery };
    if (state.activeTab !== 'all') {
      params.type = state.activeTab;
    }
    if (state.currentPage > 1) {
      params.page = state.currentPage.toString();
    }
    setSearchParams(params);
  };

  const clearSearch = () => {
    navigate('/discover');
  };

  // LOGIC GIỐNG HOMEFEED - Handle post clicks
  const handlePostClick = (post: Post) => {
    console.log(
      'Post clicked in Search:',
      post.id,
      'User role:',
      authState.user?.role,
    );

    // CHỈ chuyển đến trang manage khi là bài viết của chính mình
    if (
      authState.user?.role === 'ARTISAN' &&
      post.user?.id === authState.user.id
    ) {
      console.log('Navigating to manage page for own post');
      navigate(`/posts/manage/${post.id}`);
    } else {
      // Tất cả trường hợp khác đều mở modal
      console.log('Opening modal for post');
      openModal(post);
    }
  };

  const handleCommentClick = (post: Post) => {
    console.log('Comment clicked, opening modal');
    // Luôn mở modal khi click comment, bất kể role
    openModal(post);
  };

  const hasResults = Object.values(state.totals).some((count) => count > 0);
  const totalResults = Object.values(state.totals).reduce(
    (sum, count) => sum + count,
    0,
  );

  const getFilterOptions = () => {
    const commonSorts = [
      { label: 'Mới nhất', value: 'createdAt' },
      { label: 'Phổ biến nhất', value: 'viewCount' },
      { label: 'Liên quan nhất', value: 'relevance' },
    ];

    switch (state.activeTab) {
      case 'products':
        return {
          categories: [
            { label: 'Gốm sứ', value: 'gom-su' },
            { label: 'Thêu thùa', value: 'theu-thua' },
            { label: 'Đồ gỗ', value: 'do-go' },
          ],
          sorts: [
            ...commonSorts,
            { label: 'Giá thấp đến cao', value: 'price_asc' },
            { label: 'Giá cao đến thấp', value: 'price_desc' },
          ],
        };
      default:
        return { categories: [], sorts: commonSorts };
    }
  };

  const filterOptions = getFilterOptions();

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

        {state.searchQuery && (
          <div className="mb-4">
            <p className="text-gray-600">
              Tìm kiếm cho "
              <span className="font-medium">{state.searchQuery}</span>" -{' '}
              {totalResults} kết quả
            </p>
          </div>
        )}

        <div className="max-w-2xl">
          <SearchBox
            value={state.searchQuery}
            onChange={setSearchQuery}
            onSubmit={() => {}} // Not needed since we use debounced effect
            placeholder="Tìm kiếm nghệ nhân, sản phẩm, bài viết..."
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <SearchTabs
          activeTab={state.activeTab}
          onTabChange={setActiveTab}
          totals={state.totals}
        />

        {state.activeTab !== 'all' && (
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

      {/* Filters */}
      {showFilters && state.activeTab !== 'all' && (
        <div className="mb-6">
          <FilterPanel
            filters={state.filters}
            onFilterChange={setFilters}
            categoryOptions={filterOptions.categories}
            sortOptions={filterOptions.sorts}
          />
        </div>
      )}

      {/* Loading State */}
      {state.loading && (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tìm kiếm...</p>
        </div>
      )}

      {/* Results */}
      {!state.loading && (
        <>
          {hasResults ? (
            <>
              <SearchResults
                activeTab={state.activeTab}
                results={state.results}
                totals={state.totals}
                onViewMore={setActiveTab}
                onPostClick={handlePostClick} // LOGIC GIỐNG HOMEFEED
                onCommentClick={handleCommentClick} // THÊM COMMENT HANDLER
              />

              {/* Pagination for specific tabs */}
              {state.activeTab !== 'all' && state.pagination.totalPages > 1 && (
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
              description={`Không có kết quả nào cho "${state.searchQuery}". Thử tìm kiếm với từ khóa khác.`}
              action={{
                label: 'Quay lại khám phá',
                onClick: clearSearch,
              }}
            />
          )}
        </>
      )}

      {/* PostModal - GIỐNG HOMEFEED */}
      <PostModal post={selectedPost} isOpen={isOpen} onClose={closeModal} />
    </div>
  );
};

export const SearchResultsPage: React.FC = () => {
  return (
    <DiscoverProvider>
      <SearchResultsPageContent />
    </DiscoverProvider>
  );
};
