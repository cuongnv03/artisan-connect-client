import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/form/Input';
import { Button } from '../../../components/form/Button';
import { Loader } from '../../../components/feedback/Loader';
import { Alert } from '../../../components/feedback/Alert';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../types/category.types';
import {
  MagnifyingGlassIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const ProductCategories: React.FC = () => {
  const [search, setSearch] = useState('');

  // Fetch all categories
  const { data, isLoading, isError, error } = useQuery('categories', () =>
    CategoryService.getCategories(),
  );

  // Function to build a hierarchical category tree
  const buildCategoryTree = (categories: Category[] = []): Category[] => {
    // First, create a map of all categories by ID
    const categoriesMap = new Map<string, Category>();
    categories.forEach((category) => {
      categoriesMap.set(category.id, { ...category, children: [] });
    });

    // Then, build the tree
    const rootCategories: Category[] = [];
    categoriesMap.forEach((category) => {
      if (category.parentId && categoriesMap.has(category.parentId)) {
        // This is a child category, add it to its parent's children array
        const parent = categoriesMap.get(category.parentId);
        if (parent && parent.children) {
          parent.children.push(category);
        }
      } else {
        // This is a root category
        rootCategories.push(category);
      }
    });

    // Sort categories by sortOrder or name
    const sortCategories = (cats: Category[]) => {
      return cats.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return a.name.localeCompare(b.name);
      });
    };

    // Sort root categories and their children recursively
    const sortedRootCategories = sortCategories(rootCategories);
    const sortChildrenRecursively = (categories: Category[]) => {
      categories.forEach((category) => {
        if (category.children && category.children.length) {
          category.children = sortCategories(category.children);
          sortChildrenRecursively(category.children);
        }
      });
    };
    sortChildrenRecursively(sortedRootCategories);

    return sortedRootCategories;
  };

  // Filter categories based on search term
  const filterCategories = (
    categories: Category[],
    searchTerm: string,
  ): Category[] => {
    if (!searchTerm) return categories;

    const term = searchTerm.toLowerCase();

    return categories.filter((category) => {
      const nameMatch = category.name.toLowerCase().includes(term);
      const descMatch = category.description?.toLowerCase().includes(term);

      // Include if the category itself matches
      if (nameMatch || descMatch) return true;

      // Or if any of its children match
      if (category.children && category.children.length) {
        const matchingChildren = filterCategories(
          category.children,
          searchTerm,
        );
        if (matchingChildren.length > 0) {
          // If children match, create a new category with only matching children
          category.children = matchingChildren;
          return true;
        }
      }

      return false;
    });
  };

  // Process categories
  const categoriesTree = data ? buildCategoryTree(data.data) : [];

  const filteredCategories = search
    ? filterCategories(categoriesTree, search)
    : categoriesTree;

  // Render a category item with its children
  const renderCategory = (category: Category, level = 0) => {
    return (
      <div key={category.id} className="mb-2">
        <div
          className={`flex items-center py-2 px-4 rounded-md hover:bg-gray-50 ${
            level > 0 ? 'ml-' + level * 4 : ''
          }`}
        >
          {category.imageUrl && (
            <img
              src={category.imageUrl}
              alt={category.name}
              className="w-8 h-8 rounded-full object-cover mr-3"
            />
          )}
          <div className="flex-1">
            <div className="font-medium text-gray-900">{category.name}</div>
            {category.description && (
              <div className="text-sm text-gray-500">
                {category.description}
              </div>
            )}
          </div>
          <div className="flex items-center">
            <Link
              to={`/categories/${category.id}`}
              className="text-gray-400 hover:text-accent"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </Link>
          </div>
        </div>
        {category.children && category.children.length > 0 && (
          <div className="mt-1">
            {category.children.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Product Categories</h1>
        <Button variant="primary">View All Products</Button>
      </div>

      {/* Search box */}
      <Card className="mb-6">
        <div className="relative">
          <Input
            placeholder="Search categories..."
            leftAddon={
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Error state */}
      {isError && (
        <Alert type="error" title="Error loading categories">
          {(error as Error).message ||
            'Failed to load categories. Please try again.'}
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="py-10 flex justify-center">
          <Loader size="lg" text="Loading categories..." />
        </div>
      )}

      {/* No categories found */}
      {!isLoading && filteredCategories.length === 0 && (
        <Card className="py-12">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            {search ? (
              <p className="text-gray-500">
                No categories match your search criteria
              </p>
            ) : (
              <p className="text-gray-500">
                No product categories have been set up yet
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Categories list */}
      {!isLoading && filteredCategories.length > 0 && (
        <Card>
          <div className="divide-y">
            {filteredCategories.map((category) => renderCategory(category))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProductCategories;
