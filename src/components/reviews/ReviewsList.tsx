import React, { useState } from 'react';
import { Review, ReviewFilterOptions } from '../../types/review';
import { ReviewCard } from './ReviewCard';
import { Button } from '../ui/Button';
import { Select } from '../ui/Dropdown';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { PaginatedResponse } from '../../types/common';

interface ReviewsListProps {
  reviews: Review[];
  loading?: boolean;
  error?: string | null;
  meta?: PaginatedResponse<Review>['meta'] | null;
  showActions?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onLoadMore?: () => void;
  onFilterChange?: (filters: Partial<ReviewFilterOptions>) => void;
  className?: string;
  showEmptyState?: boolean;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  loading = false,
  error = null,
  meta = null,
  showActions = false,
  onEdit,
  onDelete,
  onLoadMore,
  onFilterChange,
  className = '',
  showEmptyState = true,
}) => {
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [filterRating, setFilterRating] = useState<string>('');

  const handleSortChange = (value: string) => {
    setSortBy(value);
    onFilterChange?.({
      sortBy: value as ReviewFilterOptions['sortBy'],
      page: 1,
    });
  };

  const handleRatingFilterChange = (value: string) => {
    setFilterRating(value);
    onFilterChange?.({
      rating: value ? parseInt(value) : undefined,
      page: 1,
    });
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Đang tải đánh giá...</p>
      </div>
    );
  }

  if (error && reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // Chỉ show empty state nếu được enable
  if (reviews.length === 0 && showEmptyState) {
    return (
      <EmptyState
        title="Chưa có đánh giá nào"
        description="Hãy là người đầu tiên đánh giá sản phẩm này"
        className={className}
      />
    );
  }

  const hasMore = meta ? meta.page < meta.totalPages : false;

  return (
    <div className={className}>
      {/* Filters */}
      {onFilterChange && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">
                Sắp xếp:
              </label>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                options={[
                  { label: 'Mới nhất', value: 'createdAt' },
                  { label: 'Đánh giá cao', value: 'rating' },
                  { label: 'Hữu ích nhất', value: 'helpfulCount' },
                ]}
                className="min-w-[140px]"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">
                Lọc theo sao:
              </label>
              <Select
                value={filterRating}
                onChange={handleRatingFilterChange}
                options={[
                  { label: 'Tất cả', value: '' },
                  { label: '5 sao', value: '5' },
                  { label: '4 sao', value: '4' },
                  { label: '3 sao', value: '3' },
                  { label: '2 sao', value: '2' },
                  { label: '1 sao', value: '1' },
                ]}
                className="min-w-[100px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            showActions={showActions}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && onLoadMore && (
        <div className="text-center mt-8">
          <Button
            onClick={onLoadMore}
            loading={loading}
            variant="outline"
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
          </Button>
        </div>
      )}
    </div>
  );
};
