import React from 'react';
import { WishlistWithDetails, WishlistItemType } from '../../types/wishlist';
import { WishlistItem } from './WishlistItem';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { HeartIcon } from '@heroicons/react/24/outline';

interface WishlistGridProps {
  items: WishlistWithDetails[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onRemove?: (itemType: WishlistItemType, itemId: string) => void;
  onAddToCart?: (productId: string) => void;
  onLoadMore?: () => void;
  className?: string;
}

export const WishlistGrid: React.FC<WishlistGridProps> = ({
  items,
  loading = false,
  error = null,
  hasMore = false,
  onRemove,
  onAddToCart,
  onLoadMore,
  className = '',
}) => {
  if (loading && items.length === 0) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Đang tải danh sách yêu thích...</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Danh sách yêu thích trống"
        description="Bạn chưa thêm sản phẩm hoặc bài viết nào vào danh sách yêu thích"
        icon={<HeartIcon className="w-16 h-16" />}
        action={{
          label: 'Khám phá ngay',
          onClick: () => (window.location.href = '/discover'),
        }}
        className={className}
      />
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {items.map((item) => (
          <WishlistItem
            key={item.id}
            item={item}
            onRemove={onRemove}
            onAddToCart={onAddToCart}
          />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="text-center mt-8">
          <Button
            onClick={onLoadMore}
            loading={loading}
            variant="outline"
            disabled={loading}
          >
            {loading ? 'Đang tải...' : 'Xem thêm'}
          </Button>
        </div>
      )}
    </div>
  );
};
