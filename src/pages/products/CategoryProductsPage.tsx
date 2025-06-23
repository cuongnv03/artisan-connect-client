import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FolderIcon } from '@heroicons/react/24/outline';
import { ProductCard } from '../../components/products/ProductCard';
import { ProductFilters } from '../../components/products/ProductFilters';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/common/EmptyState';
import { useProducts } from '../../hooks/products/useProducts';
import { useCategories } from '../../hooks/products/useCategories';
import { productService } from '../../services/product.service';
import { Category } from '../../types/product';

export const CategoryProductsPage: React.FC = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(true);

  // Load category data
  useEffect(() => {
    if (categorySlug) {
      loadCategory();
    }
  }, [categorySlug]);

  const loadCategory = async () => {
    if (!categorySlug) return;

    setCategoryLoading(true);
    try {
      const categoryData = await productService.getCategoryBySlug(categorySlug);
      setCategory(categoryData);
    } catch (error) {
      console.error('Error loading category:', error);
      setCategory(null);
    } finally {
      setCategoryLoading(false);
    }
  };

  // Get filters from URL
  const filters = {
    search: searchParams.get('search') || undefined,
    categoryIds: category ? [category.id] : [],
    minPrice: searchParams.get('minPrice')
      ? Number(searchParams.get('minPrice'))
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? Number(searchParams.get('maxPrice'))
      : undefined,
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    inStock: searchParams.get('inStock')
      ? searchParams.get('inStock') === 'true'
      : undefined,
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
  };

  const { products, loading, error, meta, refetch } = useProducts({
    ...filters,
    publicOnly: true,
  });

  const { categories } = useCategories();

  const handleFilterChange = (newFilters: any) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      if (
        value !== undefined &&
        value !== '' &&
        value !== null &&
        key !== 'categoryIds'
      ) {
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, String(value));
        }
      }
    });

    params.set('page', '1');
    setSearchParams(params);
  };

  if (categoryLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Không tìm thấy danh mục</p>
          <Button onClick={() => window.history.back()}>Quay lại</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{category.name} - Cửa hàng - Artisan Connect</title>
        <meta
          name="description"
          content={
            category.description || `Sản phẩm thuộc danh mục ${category.name}`
          }
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FolderIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">
              {category.name}
            </h1>
          </div>
          {category.description && (
            <p className="text-lg text-gray-600">{category.description}</p>
          )}
        </div>

        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-4">
            <li>
              <a href="/shop" className="text-gray-500 hover:text-gray-700">
                Cửa hàng
              </a>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            {category.parent && (
              <>
                <li>
                  <span className="text-gray-500">{category.parent.name}</span>
                </li>
                <li>
                  <span className="text-gray-400">/</span>
                </li>
              </>
            )}
            <li>
              <span className="text-gray-900">{category.name}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProductFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
            />
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Results Info */}
            {meta && (
              <div className="mb-6">
                <p className="text-gray-600">
                  Hiển thị {products.length} / {meta.total} sản phẩm trong danh
                  mục "{category.name}"
                </p>
              </div>
            )}

            {loading && products.length === 0 ? (
              <div className="text-center py-12">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-gray-600">Đang tải sản phẩm...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600 mb-4">{error}</p>
                <Button onClick={refetch}>Thử lại</Button>
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="Chưa có sản phẩm nào"
                description={`Danh mục "${category.name}" chưa có sản phẩm nào`}
                icon={<FolderIcon className="w-12 h-12" />}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    isManagementView={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
