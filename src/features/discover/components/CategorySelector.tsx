import React from 'react';
import clsx from 'clsx';
import { Category } from '../../../types/category.types';

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onChange: (categoryId: string | null) => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategoryId,
  onChange,
}) => {
  return (
    <div className="overflow-x-auto py-2">
      <div className="flex space-x-2 min-w-max">
        <button
          className={clsx(
            'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
            selectedCategoryId === null
              ? 'bg-accent text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          )}
          onClick={() => onChange(null)}
        >
          All Categories
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            className={clsx(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedCategoryId === category.id
                ? 'bg-accent text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            )}
            onClick={() => onChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};
