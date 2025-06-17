import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../../../types/product';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';

interface CategoryBreadcrumbProps {
  category: Category | null;
  showHome?: boolean;
  className?: string;
}

export const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({
  category,
  showHome = true,
  className = '',
}) => {
  const buildBreadcrumbPath = (cat: Category): Category[] => {
    const path: Category[] = [cat];
    let current = cat.parent;

    while (current) {
      path.unshift(current);
      current = current.parent;
    }

    return path;
  };

  if (!category) return null;

  const breadcrumbPath = buildBreadcrumbPath(category);

  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {showHome && (
        <>
          <Link
            to="/products"
            className="flex items-center text-gray-500 hover:text-primary transition-colors"
          >
            <HomeIcon className="w-4 h-4 mr-1" />
            Cửa hàng
          </Link>
          <ChevronRightIcon className="w-4 h-4 text-gray-400" />
        </>
      )}

      {breadcrumbPath.map((cat, index) => {
        const isLast = index === breadcrumbPath.length - 1;

        return (
          <React.Fragment key={cat.id}>
            {isLast ? (
              <span className="text-gray-900 font-medium">{cat.name}</span>
            ) : (
              <Link
                to={`/products/category/${cat.slug}`}
                className="text-gray-500 hover:text-primary transition-colors"
              >
                {cat.name}
              </Link>
            )}
            {!isLast && <ChevronRightIcon className="w-4 h-4 text-gray-400" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
