import React, { useState } from 'react';
import { Category } from '../../../../types/product';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { Modal } from '../../../ui/Modal';
import { Input } from '../../../ui/Input';
import {
  ChevronRightIcon,
  ChevronDownIcon,
  FolderIcon,
  FolderOpenIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';

interface CategorySelectorProps {
  categories: Category[];
  selectedIds: string[];
  onChange: (categoryIds: string[]) => void;
  error?: string;
  maxSelection?: number;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedIds,
  onChange,
  error,
  maxSelection = 5,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  const selectedCategories = categories.filter((cat) =>
    selectedIds.includes(cat.id),
  );

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedIds.includes(categoryId)) {
      onChange(selectedIds.filter((id) => id !== categoryId));
    } else if (selectedIds.length < maxSelection) {
      onChange([...selectedIds, categoryId]);
    }
  };

  const handleExpandToggle = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const buildCategoryTree = (parentId: string | null = null): Category[] => {
    return categories
      .filter((cat) => cat.parentId === parentId)
      .filter(
        (cat) =>
          !searchQuery ||
          cat.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
  };

  const renderCategoryNode = (category: Category, level = 0) => {
    const hasChildren = categories.some((cat) => cat.parentId === category.id);
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedIds.includes(category.id);

    return (
      <div key={category.id} className="space-y-1">
        <div
          className={`flex items-center p-2 rounded-lg hover:bg-gray-50 ${
            isSelected ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {hasChildren && (
            <button
              onClick={() => handleExpandToggle(category.id)}
              className="mr-2 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDownIcon className="w-4 h-4" />
              ) : (
                <ChevronRightIcon className="w-4 h-4" />
              )}
            </button>
          )}

          <div className="flex items-center flex-1">
            {hasChildren ? (
              <FolderIcon className="w-4 h-4 text-gray-500 mr-2" />
            ) : (
              <FolderOpenIcon className="w-4 h-4 text-gray-500 mr-2" />
            )}

            <label className="flex items-center cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCategoryToggle(category.id)}
                disabled={!isSelected && selectedIds.length >= maxSelection}
                className="mr-2"
              />
              <span
                className={`${
                  isSelected ? 'font-medium text-blue-900' : 'text-gray-700'
                }`}
              >
                {category.name}
              </span>
              {category.productCount !== undefined && (
                <span className="ml-auto text-xs text-gray-500">
                  ({category.productCount})
                </span>
              )}
            </label>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {buildCategoryTree(category.id).map((child) =>
              renderCategoryNode(child, level + 1),
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Danh mục sản phẩm *
      </label>

      {/* Selected Categories Display */}
      <div className="border border-gray-300 rounded-lg p-3 mb-2 min-h-[48px] bg-white">
        {selectedCategories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((category) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-300"
                onClick={() => handleCategoryToggle(category.id)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">Chọn danh mục sản phẩm...</span>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className="w-full"
      >
        {selectedCategories.length > 0
          ? `Đã chọn ${selectedCategories.length}/${maxSelection} danh mục`
          : 'Chọn danh mục'}
      </Button>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* Category Selection Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Chọn danh mục sản phẩm"
        size="lg"
      >
        <div className="space-y-4">
          {/* Search */}
          <Input
            placeholder="Tìm kiếm danh mục..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
          />

          {/* Selection Info */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Đã chọn: {selectedIds.length}/{maxSelection}
            </span>
            <Button variant="ghost" size="sm" onClick={() => onChange([])}>
              Bỏ chọn tất cả
            </Button>
          </div>

          {/* Category Tree */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-2">
            <div className="space-y-1">
              {buildCategoryTree().map((category) =>
                renderCategoryNode(category),
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Xong</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
