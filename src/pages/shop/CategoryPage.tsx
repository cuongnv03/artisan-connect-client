import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';
import { productService } from '../../services/product.service';
import { Product, Category } from '../../types/product';
import { PaginatedResponse } from '../../types/common';
import { ProductCard } from '../../components/common/ProductCard';
import { FilterPanel } from '../../components/common/FilterPanel';
import { EmptyState } from '../../components/common/EmptyState';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Pagination } from '../../components/ui/Pagination';

type ViewMode = 'grid' | 'list';

export const CategoryPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
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

  useEffect(() => {
    if (categorySlug) {
      loadCategoryData();
    }
  }, [categorySlug]);

  const loadCategoryData = async () => {
    if (!categorySlug) return;

    setLoading(true);
    try {
      // Sử dụng API thay vì hardcode
      const [categoryData, categoryTree] = await Promise.all([
        productService.getCategoryBySlug(categorySlug),
        productService.getCategoryTree(),
      ]);

      setCategory(categoryData);

      // Tìm subcategories từ tree
      const findSubcategories = (
        tree: Category[],
        parentSlug: string,
      ): Category[] => {
        for (const cat of tree) {
          if (cat.slug === parentSlug) {
            return cat.children || [];
          }
          if (cat.children) {
            const found = findSubcategories(cat.children, parentSlug);
            if (found.length > 0) return found;
          }
        }
        return [];
      };

      setSubcategories(findSubcategories(categoryTree, categorySlug));

      // Load products với categoryId thật
      const params: any = {
        categoryId: categoryData.id,
        page: currentPage,
        limit: pagination.limit,
        ...filters,
      };

      const result = await productService.getProducts(params);
      setProducts(result.data);
      setPagination({
        total: result.meta.total,
        totalPages: result.meta.totalPages,
        limit: result.meta.limit,
      });
    } catch (error) {
      console.error('Error loading category data:', error);
    } finally {
      setLoading(false);
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

  if (!category) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Không tìm thấy danh mục
        </h2>
        <p className="text-gray-600 mb-4">Danh mục này không tồn tại.</p>
        <Link to="/shop">
          <Button>Quay lại cửa hàng</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
        <Link to="/shop" className="hover:text-primary">
          Cửa hàng
        </Link>
        <ChevronLeftIcon className="w-4 h-4 rotate-180" />
        <span className="text-gray-900">{category.name}</span>
      </div>

      {/* Category Header */}
      <div className="relative h-64 rounded-xl overflow-hidden mb-8">
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
            {category.description && (
              <p className="text-lg text-gray-200 max-w-2xl">
                {category.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Danh mục con
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                to={`/shop/category/${subcategory.slug}`}
                className="group p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 group-hover:text-primary">
                  {subcategory.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

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

          <span className="text-sm text-gray-500">
            {pagination.total} sản phẩm
          </span>
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
          title="Không có sản phẩm nào"
          description="Danh mục này hiện chưa có sản phẩm nào."
          action={{
            label: 'Xem danh mục khác',
            onClick: () => (window.location.href = '/shop'),
          }}
        />
      )}
    </div>
  );
};
