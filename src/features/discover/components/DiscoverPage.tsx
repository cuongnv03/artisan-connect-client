import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { ArtisanCard } from './ArtisanCard';
import { TrendingPosts } from './TrendingPosts';
import { CategorySelector } from './CategorySelector';
import { Loader } from '../../../components/ui/Loader';
import { Alert } from '../../../components/ui/Alert';
import { Button } from '../../../components/common/Button';
import { ArtisanService } from '../../../services/artisan.service';
import { CategoryService } from '../../../services/category.service';
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const DiscoverPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Fetch categories
  const { data: categories, isLoading: isLoadingCategories } = useQuery(
    ['categories'],
    () => CategoryService.getCategories(),
  );

  // Fetch artisans based on filters
  const {
    data: artisansData,
    isLoading: isLoadingArtisans,
    isError: isArtisansError,
    error: artisansError,
    refetch: refetchArtisans,
  } = useQuery(
    ['discover-artisans', selectedCategory, searchQuery, page],
    () =>
      ArtisanService.getArtisans({
        categoryId: selectedCategory || undefined,
        search: searchQuery || undefined,
        page,
        limit: 12,
      }),
    {
      keepPreviousData: true,
    },
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    refetchArtisans();
  };

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Discover Artisans</h1>
        <p className="mt-2 text-gray-600">
          Find talented artisans from around the world and explore their unique
          creations
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-accent focus:border-accent sm:text-sm"
              placeholder="Search for artisans by name, specialty, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary">
            Search
          </Button>
        </form>

        {/* Category Selector */}
        {isLoadingCategories ? (
          <div className="h-12 flex items-center">
            <Loader size="sm" />
          </div>
        ) : (
          <CategorySelector
            categories={categories?.data || []}
            selectedCategoryId={selectedCategory}
            onChange={handleCategoryChange}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Artisan Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : selectedCategory
              ? `${
                  categories?.data.find((c) => c.id === selectedCategory)
                    ?.name || 'Category'
                } Artisans`
              : 'Popular Artisans'}
          </h2>

          {isLoadingArtisans ? (
            <div className="py-12 flex justify-center">
              <Loader size="lg" />
            </div>
          ) : isArtisansError ? (
            <Alert
              type="error"
              variant="subtle"
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchArtisans()}
                  leftIcon={<ArrowPathIcon className="h-4 w-4" />}
                >
                  Retry
                </Button>
              }
            >
              {(artisansError as Error)?.message || 'Failed to load artisans'}
            </Alert>
          ) : artisansData?.data.length === 0 ? (
            <div className="py-12 text-center bg-gray-50 rounded-lg">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No artisans found
              </h3>
              <p className="mt-2 text-gray-500">
                Try adjusting your search or filters to find what you're looking
                for
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {artisansData?.data.map((artisan) => (
                  <ArtisanCard key={artisan.id} artisan={artisan} />
                ))}
              </div>

              {/* Pagination */}
              {artisansData && artisansData.meta.totalPages > 1 && (
                <div className="mt-8 flex justify-between items-center">
                  <Button
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-500">
                    Page {page} of {artisansData.meta.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={page >= artisansData.meta.totalPages}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar with Trending Content */}
        <div className="lg:col-span-1">
          <TrendingPosts />
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;
