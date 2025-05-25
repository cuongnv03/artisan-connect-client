import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { SearchBox } from '../../components/common/SearchBox';
import { FilterPanel } from '../../components/common/FilterPanel';
import { ProductCard } from '../../components/common/ProductCard';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';
import { useDebounce } from '../../hooks/useDebounce';
import { productService } from '../../services/product.service';
import { Category, Product } from '../../types/product';
import { PaginatedResponse } from '../../types/common';

type ViewMode = 'grid' | 'list';

const CATEGORY_ICONS: Record<string, string> = {
  'gom-su': '🏺',
  'theu-thua': '🧵',
  'do-go': '🪵',
  'tranh-ve': '🎨',
  'do-da': '👜',
  'trang-suc': '💍',
  'dan-lat': '🧺',
  'dieu-khac': '🗿',
};

export const ShopPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    limit: 20,
  });
  const [filters, setFilters] = useState<any>({
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);

  const debouncedQuery = useDebounce(searchQuery, 500);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [debouncedQuery, filters, currentPage]);

  const loadCategories = async () => {
    try {
      const [categoriesData, treeData] = await Promise.all([
        productService.getCategories(),
        productService.getCategoryTree(),
      ]);
      setCategories(categoriesData);
      setCategoryTree(treeData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: pagination.limit,
        ...filters,
      };

      if (debouncedQuery) {
        params.q = debouncedQuery;
        setSearchParams({ q: debouncedQuery });
      } else {
        setSearchParams({});
      }

      // Handle special sort cases
      if (filters.sortBy === 'price_asc') {
        params.sortBy = 'price';
        params.sortOrder = 'asc';
      } else if (filters.sortBy === 'price_desc') {
        params.sortBy = 'price';
        params.sortOrder = 'desc';
      }

      let result: PaginatedResponse<Product>;

      if (debouncedQuery) {
        result = await productService.searchProducts(params);
      } else {
        result = await productService.getProducts(params);
      }

      setProducts(result.data);
      setPagination({
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        limit: result.meta.limit,
      });
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categoryLinks = categoryTree.slice(0, 6).map((category) => ({
    name: category.name,
    slug: category.slug,
    icon: CATEGORY_ICONS[category.slug] || '🎨',
    productCount: category.productCount || 0,
  }));

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/shop/search?q=${encodeURIComponent(query)}`);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const sortOptions = [
    { label: 'Mới nhất', value: 'createdAt' },
    { label: 'Bán chạy nhất', value: 'salesCount' },
    { label: 'Đánh giá cao', value: 'avgRating' },
    { label: 'Giá thấp đến cao', value: 'price_asc' },
    { label: 'Giá cao đến thấp', value: 'price_desc' },
    { label: 'Xem nhiều nhất', value: 'viewCount' },
  ];

  const quickFilters = [
    { label: 'Giảm giá', key: 'onSale', value: true },
    { label: 'Có thể tùy chỉnh', key: 'isCustomizable', value: true },
    { label: 'Miễn phí vận chuyển', key: 'freeShipping', value: true },
    { label: 'Sản phẩm mới', key: 'isNew', value: true },
  ];

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
        <div className="max-w-2xl">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            onSubmit={handleSearch}
            placeholder="Tìm kiếm sản phẩm..."
          />
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Danh mục sản phẩm
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categoryLinks.map((category) => (
            <Link
              key={category.slug}
              to={`/shop/category/${category.slug}`}
              className="group p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow text-center"
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-medium text-gray-900 group-hover:text-primary">
                {category.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          {quickFilters.map((filter) => (
            <Badge
              key={filter.key}
              variant={
                filters[filter.key] === filter.value ? 'primary' : 'secondary'
              }
              className="cursor-pointer hover:bg-primary hover:text-white transition-colors px-4 py-2"
              onClick={() =>
                handleFilterChange({
                  ...filters,
                  [filter.key]:
                    filters[filter.key] === filter.value
                      ? undefined
                      : filter.value,
                })
              }
            >
              {filter.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<FunnelIcon className="w-4 h-4" />}
          >
            Bộ lọc
          </Button>

          {Object.keys(filters).length > 0 && (
            <span className="text-sm text-gray-500">
              {pagination.total} sản phẩm
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* View Mode */}
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            categoryOptions={categoryOptions}
            sortOptions={sortOptions}
          />
        </div>
      )}

      {/* Products */}
      {loading ? (
        <div className="text-center py-12">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
        </div>
      ) : products.length > 0 ? (
        <>
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'space-y-4'
            }
          >
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showSellerInfo={true}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <EmptyState
          icon={<Squares2X2Icon className="w-16 h-16" />}
          title="Không tìm thấy sản phẩm nào"
          description={
            searchQuery
              ? 'Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc'
              : 'Hiện tại chưa có sản phẩm nào. Hãy quay lại sau!'
          }
          action={
            searchQuery
              ? {
                  label: 'Xóa tìm kiếm',
                  onClick: () => setSearchQuery(''),
                }
              : undefined
          }
        />
      )}
    </div>
  );
};
