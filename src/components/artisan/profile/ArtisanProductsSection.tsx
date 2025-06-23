import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useArtisanProducts } from '../../../hooks/artisan/useArtisanProducts';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../common/EmptyState';
import { LoadingSpinner } from '../../ui/LoadingSpinner';
import { ProductCard } from '../../products/customer/ProductCard';
import { UserProfileDto } from '../../../types/user';

interface ArtisanProductsSectionProps {
  artisan: UserProfileDto;
  isOwnProfile: boolean;
}

export const ArtisanProductsSection: React.FC<ArtisanProductsSectionProps> = ({
  artisan,
  isOwnProfile,
}) => {
  const { products, loading, hasMore, loadProducts, loadMoreProducts } =
    useArtisanProducts(artisan.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Sản phẩm của {artisan.firstName}
          </h3>
          <p className="text-sm text-gray-500">{products.length} sản phẩm</p>
        </div>

        {isOwnProfile && (
          <Link to="/products/manage/create">
            <Button leftIcon={<PlusIcon className="w-4 h-4" />}>
              Thêm sản phẩm
            </Button>
          </Link>
        )}
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showSellerInfo={false}
              />
            ))}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center py-8">
              {loading ? (
                <div className="text-center">
                  <LoadingSpinner size="md" />
                  <p className="mt-2 text-sm text-gray-600">
                    Đang tải thêm sản phẩm...
                  </p>
                </div>
              ) : (
                <Button variant="outline" onClick={loadMoreProducts}>
                  Tải thêm sản phẩm
                </Button>
              )}
            </div>
          )}

          {/* Show more products link if many products */}
          {products.length >= 8 && (
            <div className="text-center mt-8">
              <Link to={`/products?seller=${artisan.id}`}>
                <Button variant="outline">Xem tất cả sản phẩm</Button>
              </Link>
            </div>
          )}
        </>
      ) : (
        <EmptyState
          title="Chưa có sản phẩm nào"
          description={
            isOwnProfile
              ? 'Hãy thêm sản phẩm đầu tiên của bạn!'
              : 'Nghệ nhân này chưa có sản phẩm nào.'
          }
          action={
            isOwnProfile
              ? {
                  label: 'Thêm sản phẩm',
                  onClick: () =>
                    (window.location.href = '/products/manage/create'),
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
