import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../../../types/product';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { ConfirmModal } from '../../../ui/Modal';
import { useToastContext } from '../../../../contexts/ToastContext';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FolderIcon,
  FolderOpenIcon,
  Cog6ToothIcon,
  PhotoIcon,
  ChevronRightIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

interface AdminCategoryTableProps {
  categories: Category[];
  loading?: boolean;
  onDelete?: (categoryId: string) => Promise<void>;
  showHierarchy?: boolean;
}

interface CategoryRowProps {
  category: Category;
  onDelete?: (categoryId: string) => Promise<void>;
  level?: number;
  isExpanded?: boolean;
  onToggleExpand?: (categoryId: string) => void;
}

const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  onDelete,
  level = 0,
  isExpanded = false,
  onToggleExpand,
}) => {
  const { success, error } = useToastContext();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (onDelete) {
      try {
        await onDelete(category.id);
        success('Xóa danh mục thành công');
      } catch (err: any) {
        error(err.message);
      }
    }
    setDeleteModalOpen(false);
  };

  const hasChildren = category.children && category.children.length > 0;
  const indent = level * 20;

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className="px-6 py-4 whitespace-nowrap">
          <div
            className="flex items-center"
            style={{ paddingLeft: `${indent}px` }}
          >
            {hasChildren && onToggleExpand && (
              <button
                onClick={() => onToggleExpand(category.id)}
                className="mr-2 p-1 hover:bg-gray-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
            )}

            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                {category.imageUrl ? (
                  <img
                    className="h-10 w-10 rounded-lg object-cover"
                    src={category.imageUrl}
                    alt={category.name}
                  />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    {hasChildren ? (
                      <FolderIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <PhotoIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                )}
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {category.name}
                </div>
                <div className="text-sm text-gray-500">{category.slug}</div>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">Level {category.level}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">
            {category.productCount || 0} sản phẩm
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <Badge variant={category.isActive ? 'success' : 'secondary'}>
            {category.isActive ? 'Hoạt động' : 'Tạm dừng'}
          </Badge>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900">{category.sortOrder}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <Link to={`/products/category/${category.slug}`}>
              <Button variant="ghost" size="sm" title="Xem danh mục">
                <EyeIcon className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={`/admin/categories/${category.id}/edit`}>
              <Button variant="ghost" size="sm" title="Chỉnh sửa">
                <PencilIcon className="h-4 w-4" />
              </Button>
            </Link>
            <Link to={`/admin/categories/${category.id}/attributes`}>
              <Button variant="ghost" size="sm" title="Quản lý thuộc tính">
                <Cog6ToothIcon className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              title="Xóa danh mục"
              disabled={category.productCount && category.productCount > 0}
            >
              <TrashIcon className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </td>
      </tr>

      {/* Render children if expanded */}
      {hasChildren &&
        isExpanded &&
        category.children?.map((child) => (
          <CategoryRow
            key={child.id}
            category={child}
            onDelete={onDelete}
            level={level + 1}
            isExpanded={false}
            onToggleExpand={onToggleExpand}
          />
        ))}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${category.name}"? ${
          category.productCount && category.productCount > 0
            ? `Danh mục này có ${category.productCount} sản phẩm.`
            : ''
        }`}
        type="danger"
      />
    </>
  );
};

export const AdminCategoryTable: React.FC<AdminCategoryTableProps> = ({
  categories,
  loading = false,
  onDelete,
  showHierarchy = true,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  const handleToggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filter to show only root categories if showing hierarchy
  const categoriesToShow = showHierarchy
    ? categories.filter((cat) => !cat.parentId)
    : categories;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Danh mục
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cấp độ
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Sản phẩm
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thứ tự
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categoriesToShow.map((category) => (
            <CategoryRow
              key={category.id}
              category={category}
              onDelete={onDelete}
              level={0}
              isExpanded={expandedCategories.has(category.id)}
              onToggleExpand={showHierarchy ? handleToggleExpand : undefined}
            />
          ))}
        </tbody>
      </table>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Chưa có danh mục nào
          </p>
          <p className="text-gray-500 mb-6">
            Tạo danh mục đầu tiên để tổ chức sản phẩm
          </p>
          <Link to="/admin/categories/create">
            <Button>Tạo danh mục mới</Button>
          </Link>
        </div>
      )}
    </div>
  );
};
