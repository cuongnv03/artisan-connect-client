import React, { useState } from 'react';
import { Category } from '../../../types/product';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { ConfirmModal } from '../../ui/Modal';
import { useToastContext } from '../../../contexts/ToastContext';
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  FolderIcon,
  PhotoIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface AdminCategoryTableProps {
  categories: Category[];
  loading?: boolean;
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: string) => Promise<void>;
  onManageAttributes?: (category: Category) => void; // NEW
}

export const AdminCategoryTable: React.FC<AdminCategoryTableProps> = ({
  categories,
  loading = false,
  onEdit,
  onDelete,
  onManageAttributes, // NEW
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(
    null,
  );
  const { success, error } = useToastContext();

  const handleDeleteClick = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (categoryToDelete && onDelete) {
      try {
        await onDelete(categoryToDelete.id);
        success('Xóa danh mục thành công');
      } catch (err: any) {
        error(err.message);
      }
    }
    setDeleteModalOpen(false);
    setCategoryToDelete(null);
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

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Danh mục
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mô tả
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sản phẩm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      {category.imageUrl ? (
                        <img
                          className="h-12 w-12 rounded-lg object-cover"
                          src={category.imageUrl}
                          alt={category.name}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                          <FolderIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {category.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {category.slug}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {category.description || 'Không có mô tả'}
                  </div>
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `/shop/categories/${category.slug}`,
                          '_blank',
                        )
                      }
                      title="Xem danh mục"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(category)}
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {/* NEW: Manage Attributes button */}
                    {onManageAttributes && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onManageAttributes(category)}
                        title="Quản lý thuộc tính"
                      >
                        <Cog6ToothIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(category)}
                      title="Xóa danh mục"
                      disabled={
                        category.productCount && category.productCount > 0
                      }
                    >
                      <TrashIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <FolderIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Chưa có danh mục nào
          </p>
          <p className="text-gray-500 mb-6">
            Tạo danh mục đầu tiên để tổ chức sản phẩm
          </p>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa danh mục"
        message={`Bạn có chắc chắn muốn xóa danh mục "${
          categoryToDelete?.name
        }"? ${
          categoryToDelete?.productCount && categoryToDelete.productCount > 0
            ? `Danh mục này có ${categoryToDelete.productCount} sản phẩm.`
            : ''
        }`}
        type="danger"
      />
    </>
  );
};
