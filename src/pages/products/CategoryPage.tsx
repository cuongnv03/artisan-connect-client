import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../../hooks/products/useProducts';
import { productService } from '../../services/product.service';
import { Category } from '../../types/product';
import { ProductGrid } from '../../components/products/customer/ProductGrid';
import { ProductFilters } from '../../components/products/customer/ProductFilters';
import { CategoryBreadcrumb } from '../../components/products/common/CategoryBreadcrumb';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ArrowLeftIcon, FunnelIcon } from '@heroicons/react/24/outline';

export const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const navigate = useNavigate();
  const [category, setCategory] = useState<Category | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const {
    products,
    loading: productsLoading,
    error,
    hasMore,
    loadMore,
    refetch,
  } = useProducts({
    isMyProducts: false, // Public products
    categoryIds: category?.id ? [category.id] : undefined, // Pass as array
    ...filters,
    limit: 20,
    enabled: !!category,
  });

  // Load category data
  useEffect(() => {
    const loadCategory = async () => {
      if (!categorySlug) return;

      try {
        setLoading(true);
        const categoryData = await productService.getCategoryBySlug(
          categorySlug,
        );
        setCategory(categoryData);
      } catch (err) {
        console.error('Error loading category:', err);
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    loadCategory();
  }, [categorySlug, navigate]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Không tìm thấy danh mục
        </h1>
        <Button onClick={() => navigate('/products')}>Quay về cửa hàng</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <CategoryBreadcrumb category={category} className="mb-6" />

      {/* Category Header */}
      <div className="mb-8">
        {category.imageUrl && (
          <div
            className="h-48 bg-gray-200 rounded-lg mb-6 bg-cover bg-center"
            style={{ backgroundImage: `url(${category.imageUrl})` }}
          />
        )}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-gray-600 mb-4">
                {category.description}
              </p>
            )}
            {category.productCount !== undefined && (
              <Badge variant="secondary">
                {category.productCount} sản phẩm
              </Badge>
            )}
          </div>
        </div>

        {/* Subcategories */}
        {category.children && category.children.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Danh mục con
            </h3>
            <div className="flex flex-wrap gap-2">
              {category.children.map((child) => (
                <Button
                  key={child.id}
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/products/category/${child.slug}`)}
                >
                  {child.name}
                  {child.productCount !== undefined && (
                    <span className="ml-2 text-gray-500">
                      ({child.productCount})
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toolbar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<FunnelIcon className="w-4 h-4" />}
          >
            Bộ lọc
          </Button>
          <span className="text-sm text-gray-500">
            {products.length} sản phẩm
          </span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6">
          <ProductFilters filters={filters} onFilterChange={setFilters} />
        </div>
      )}

      {/* Products */}
      <ProductGrid
        products={products}
        loading={productsLoading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRetry={refetch}
        emptyMessage={`Chưa có sản phẩm nào trong danh mục "${category.name}"`}
        emptyDescription="Các nghệ nhân sẽ sớm bổ sung sản phẩm mới"
      />
    </div>
  );
};
