import React, { useMemo } from 'react';
import { useHomeFeed } from '../../hooks/home/useHomeFeed';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import {
  WelcomeSection,
  QuickActions,
  FeedIndicator,
  HomeFeed,
  ArtisanSuggestions,
} from '../../components/home';

export const HomePage: React.FC = () => {
  const {
    posts,
    loading,
    loadingMore,
    refreshing,
    hasMore,
    showFallback,
    error,
    loadMore,
    refresh,
  } = useHomeFeed();

  // Memoize key để force re-render khi cần
  const suggestionsKey = useMemo(() => `suggestions-${Date.now()}`, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải bảng tin...</p>
        </div>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={refresh}
            className="text-primary hover:text-primary-dark"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <WelcomeSection
          showFallback={showFallback}
          onRefresh={refresh}
          refreshing={refreshing}
        />

        <FeedIndicator showFallback={showFallback} />

        <QuickActions showFallback={showFallback} />
      </div>

      {/* Main Content */}
      <div className="flex gap-8">
        {/* Feed Section - 2/3 */}
        <div className="flex-1 lg:w-2/3">
          <HomeFeed
            posts={posts}
            hasMore={hasMore}
            loadingMore={loadingMore}
            showFallback={showFallback}
            onLoadMore={loadMore}
          />
        </div>

        {/* Suggestions Section - 1/3 */}
        <aside className="hidden lg:block lg:w-1/3">
          <ArtisanSuggestions key={suggestionsKey} />
        </aside>
      </div>
    </div>
  );
};
