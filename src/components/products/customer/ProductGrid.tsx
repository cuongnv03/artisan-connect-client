import React from 'react';
import { Product } from '../../../types/product';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../../common/EmptyState';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { Button } from '../../ui/Button';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  onRetry?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  error,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  emptyMessage = 'Không tìm thấy sản phẩm nào',
  emptyDescription = 'Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác',
  onRetry,
}) => {
  if (loading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Thử lại
          </Button>
        )}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyMessage}
        description={emptyDescription}
        action={onRetry ? { label: 'Thử lại', onClick: onRetry } : undefined}
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button
            onClick={onLoadMore}
            loading={loadingMore}
            variant="outline"
            disabled={loadingMore}
          >
            {loadingMore ? 'Đang tải...' : 'Xem thêm sản phẩm'}
          </Button>
        </div>
      )}
    </div>
  );
};
