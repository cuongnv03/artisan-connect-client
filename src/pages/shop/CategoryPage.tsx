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
  const [allCategoryIds, setAllCategoryIds] = useState<string[]>([]);
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

  useEffect(() => {
    if (allCategoryIds.length > 0) {
      loadProducts();
    }
  }, [allCategoryIds, filters, currentPage]);

  const loadCategoryData = async () => {
    if (!categorySlug) return;

    setLoading(true);
    try {
      const [categoryData, categoryTree] = await Promise.all([
        productService.getCategoryBySlug(categorySlug),
        productService.getCategoryTree(),
      ]);

      setCategory(categoryData);

      // Tìm subcategories và tất cả category IDs liên quan
      const { subcategories: subs, allIds } = findCategoryAndSubcategories(
        categoryTree,
        categoryData.id,
      );

      setSubcategories(subs);
      setAllCategoryIds(allIds);
    } catch (error) {
      console.error('Error loading category data:', error);
    }
  };

  // Hàm đệ quy để tìm tất cả subcategories
  const findCategoryAndSubcategories = (
    tree: Category[],
    targetId: string,
  ): { subcategories: Category[]; allIds: string[] } => {
    const findInTree = (
      categories: Category[],
    ): { subcategories: Category[]; allIds: string[] } => {
      for (const cat of categories) {
        if (cat.id === targetId) {
          // Tìm thấy category, lấy tất cả subcategories
          const allIds = getAllCategoryIds([cat]);
          return {
            subcategories: cat.children || [],
            allIds,
          };
        }
        if (cat.children && cat.children.length > 0) {
          const result = findInTree(cat.children);
          if (result.allIds.length > 0) {
            return result;
          }
        }
      }
      return { subcategories: [], allIds: [] };
    };

    return findInTree(tree);
  };

  // Hàm đệ quy để lấy tất cả category IDs (bao gồm cả category hiện tại và subcategories)
  const getAllCategoryIds = (categories: Category[]): string[] => {
    let ids: string[] = [];
    for (const cat of categories) {
      ids.push(cat.id);
      if (cat.children && cat.children.length > 0) {
        ids = ids.concat(getAllCategoryIds(cat.children));
      }
    }
    return ids;
  };

  const loadProducts = async () => {
    if (allCategoryIds.length === 0) {
      setLoading(false);
      return;
    }

    try {
      // Load products từ tất cả categories liên quan
      const results = await Promise.all(
        allCategoryIds.map((categoryId) =>
          productService.getProducts({
            categoryId,
            page: currentPage,
            limit: pagination.limit,
            ...filters,
          }),
        ),
      );

      // Gộp tất cả products và loại bỏ duplicate
      const allProducts: Product[] = [];
      const seenIds = new Set<string>();
      let totalCount = 0;

      results.forEach((result) => {
        totalCount += result.meta.total;
        result.data.forEach((product) => {
          if (!seenIds.has(product.id)) {
            seenIds.add(product.id);
            allProducts.push(product);
          }
        });
      });

      // Sort products theo filter
      const sortedProducts = sortProducts(
        allProducts,
        filters.sortBy,
        filters.sortOrder,
      );

      // Pagination cho merged results
      const startIndex = (currentPage - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

      setProducts(paginatedProducts);
      setPagination({
        total: sortedProducts.length,
        totalPages: Math.ceil(sortedProducts.length / pagination.limit),
        limit: pagination.limit,
      });
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Hàm sort products
  const sortProducts = (
    products: Product[],
    sortBy: string,
    sortOrder: string,
  ) => {
    return [...products].sort((a, b) => {
      let aVal: any = a[sortBy as keyof Product];
      let bVal: any = b[sortBy as keyof Product];

      // Handle special cases
      if (sortBy === 'price_asc') {
        aVal = a.discountPrice || a.price;
        bVal = b.discountPrice || b.price;
        return aVal - bVal;
      }
      if (sortBy === 'price_desc') {
        aVal = a.discountPrice || a.price;
        bVal = b.discountPrice || b.price;
        return bVal - aVal;
      }

      // Default sorting
      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });
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
        {category.imageUrl ? (
          <img
            src={category.imageUrl}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary to-primary-dark"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4 text-primary-200">
              {category.name}
            </h1>
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
                {subcategory.productCount !== undefined && (
                  <p className="text-sm text-gray-500 mt-1">
                    {subcategory.productCount} sản phẩm
                  </p>
                )}
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
