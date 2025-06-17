import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../../../hooks/products/useProducts';
import { productService } from '../../../services/product.service';
import { Category } from '../../../types/product';
import { ProductGrid } from '../../../components/products/customer/ProductGrid/ProductGrid';
import { ProductFilters } from '../../../components/products/customer/ProductFilters/ProductFilters';
import { SearchBox } from '../../../components/common/SearchBox';
import { Button } from '../../../components/ui/Button';
import { FunnelIcon } from '@heroicons/react/24/outline';

const CATEGORY_ICONS: Record<string, string> = {
  'gom-su': '🏺',
  'theu-thua': '🧵',
  'do-go': '🪵',
  'tranh-ve': '🎨',
  'do-da': '👜',
  'trang-suc': '💍',
};

export const ShopPage: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, any>>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const { products, loading, error, hasMore, loadMore, refetch } = useProducts({
    isMyProducts: false, // Explicitly set to false for public products
    ...filters,
    limit: 20,
  });

  // Load categories on mount
  React.useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await productService.getCategoryTree();
        setCategories(categoriesData.slice(0, 6));
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      window.location.href = `/products/search?q=${encodeURIComponent(query)}`;
    }
  };

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Cửa hàng thủ công
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Khám phá những sản phẩm thủ công độc đáo từ các nghệ nhân tài năng
        </p>

        {/* Search */}
        <div className="max-w-2xl mb-6">
          <SearchBox
            value=""
            onChange={() => {}}
            onSubmit={handleSearch}
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>

        {/* Categories */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Danh mục sản phẩm
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category) => (
              <Link
                key={category.slug}
                to={`/products/category/${category.slug}`}
                className="group p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
              >
                <div className="text-3xl mb-2">
                  {CATEGORY_ICONS[category.slug] || '🎨'}
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-primary">
                  {category.name}
                </h3>
                {category.productCount !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">
                    {category.productCount} sản phẩm
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
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
          <ProductFilters
            filters={filters}
            onFilterChange={setFilters}
            categoryOptions={categoryOptions}
          />
        </div>
      )}

      {/* Products */}
      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        hasMore={hasMore}
        onLoadMore={loadMore}
        onRetry={refetch}
      />
    </div>
  );
};
