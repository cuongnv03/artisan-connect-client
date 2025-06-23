import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FolderIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { Category } from '../../types/product';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategoryId?: string;
  onCategorySelect?: (categoryId: string) => void;
  isManagementView?: boolean;
  showProductCount?: boolean;
  className?: string;
}

export const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  selectedCategoryId,
  onCategorySelect,
  isManagementView = false,
  showProductCount = false,
  className = '',
}) => {
  const renderCategoryTree = (cats: Category[], level = 0) => {
    return cats.map((category) => {
      const isSelected = selectedCategoryId === category.id;
      const hasChildren = category.children && category.children.length > 0;

      return (
        <div key={category.id}>
          <div
            className={`
              flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
              ${isSelected ? 'bg-primary text-white' : 'hover:bg-gray-100'}
              ${level > 0 ? `ml-${level * 4}` : ''}
            `}
            onClick={() => onCategorySelect?.(category.id)}
          >
            <div className="flex items-center">
              <FolderIcon className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{category.name}</span>
              {showProductCount && category.productCount !== undefined && (
                <Badge variant="secondary" size="sm" className="ml-2">
                  {category.productCount}
                </Badge>
              )}
            </div>
            {hasChildren && <ChevronRightIcon className="w-4 h-4" />}
          </div>

          {hasChildren && (
            <div className="ml-4 mt-1 space-y-1">
              {renderCategoryTree(category.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <FolderIcon className="w-5 h-5 mr-2" />
          Danh mục sản phẩm
        </h3>

        <div className="space-y-1">
          {/* All products option */}
          <div
            className={`
              flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors
              ${
                !selectedCategoryId
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }
            `}
            onClick={() => onCategorySelect?.('')}
          >
            <div className="flex items-center">
              <span className="text-sm font-medium">Tất cả sản phẩm</span>
            </div>
          </div>

          {/* Category tree */}
          {renderCategoryTree(categories)}
        </div>
      </div>
    </Card>
  );
};
