import React from 'react';
import { Badge } from '../ui/Badge';

interface QuickCategoriesProps {
  categories: string[];
  onCategoryClick: (category: string) => void;
}

export const QuickCategories: React.FC<QuickCategoriesProps> = ({
  categories,
  onCategoryClick,
}) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Danh mục phổ biến
      </h2>
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Badge
            key={category}
            variant="secondary"
            className="cursor-pointer hover:bg-primary hover:text-white transition-colors px-4 py-2"
            onClick={() => onCategoryClick(category)}
          >
            {category}
          </Badge>
        ))}
      </div>
    </div>
  );
};
