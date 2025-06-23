import React from 'react';
import { Product } from '../../types/product';
import { ProductCard } from './ProductCard';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../ui/Button';
import { PaginatedResponse } from '../../types/common';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  meta?: PaginatedResponse<Product>['meta'] | null;
  viewMode: 'shop' | 'management';
  onLoadMore?: () => void;
  onProductEdit?: (product: Product) => void;
  onProductStatusChange?: (product: Product, newStatus: string) => void;
  onProductDelete?: (product: Product) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export const ProductList: React.FC<ProductListProps> = ({
  products,
  loading = false,
  error = null,
  meta = null,
  viewMode,
  onLoadMore,
  onProductEdit,
  onProductStatusChange,
  onProductDelete,
  emptyTitle = 'Không có sản phẩm nào',
  emptyDescription = 'Chưa có sản phẩm nào được tạo',
  className = '',
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
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        className="py-12"
      />
    );
  }

  const hasMore = meta ? meta.page < meta.totalPages : false;

  return (
    <div className={className}>
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            viewMode={viewMode}
            onEdit={() => onProductEdit?.(product)}
            onStatusChange={(status) =>
              onProductStatusChange?.(product, status)
            }
            onDelete={() => onProductDelete?.(product)}
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
            {loading ? 'Đang tải...' : 'Xem thêm sản phẩm'}
          </Button>
        </div>
      )}
    </div>
  );
};
