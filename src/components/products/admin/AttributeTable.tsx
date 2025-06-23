import React, { useState } from 'react';
import { CategoryAttributeTemplate } from '../../../types/product';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { ConfirmModal } from '../../ui/Modal';
import { useToastContext } from '../../../contexts/ToastContext';
import {
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  ArrowsUpDownIcon,
} from '@heroicons/react/24/outline';

interface AttributeTableProps {
  attributes: CategoryAttributeTemplate[];
  loading?: boolean;
  onEdit?: (attribute: CategoryAttributeTemplate) => void;
  onDelete?: (attributeId: string) => Promise<void>;
  onReorder?: (attributes: CategoryAttributeTemplate[]) => Promise<void>;
}

export const AttributeTable: React.FC<AttributeTableProps> = ({
  attributes,
  loading = false,
  onEdit,
  onDelete,
  onReorder,
}) => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [attributeToDelete, setAttributeToDelete] = useState<string | null>(
    null,
  );
  const { success, error } = useToastContext();

  const getTypeLabel = (type: string) => {
    const typeMap = {
      TEXT: 'Văn bản',
      NUMBER: 'Số',
      SELECT: 'Lựa chọn đơn',
      MULTI_SELECT: 'Lựa chọn nhiều',
      BOOLEAN: 'Đúng/Sai',
      DATE: 'Ngày tháng',
      URL: 'URL',
      EMAIL: 'Email',
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  const getTypeBadge = (type: string) => {
    const colorMap = {
      TEXT: 'secondary',
      NUMBER: 'info',
      SELECT: 'primary',
      MULTI_SELECT: 'primary',
      BOOLEAN: 'success',
      DATE: 'warning',
      URL: 'info',
      EMAIL: 'info',
    };

    return (
      <Badge
        variant={
          (colorMap[type as keyof typeof colorMap] as any) || 'secondary'
        }
      >
        {getTypeLabel(type)}
      </Badge>
    );
  };

  const handleDeleteClick = (attributeId: string) => {
    setAttributeToDelete(attributeId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (attributeToDelete && onDelete) {
      try {
        await onDelete(attributeToDelete);
        success('Xóa thuộc tính thành công');
      } catch (err: any) {
        error(err.message);
      }
    }
    setDeleteModalOpen(false);
    setAttributeToDelete(null);
  };

  const moveAttribute = (fromIndex: number, toIndex: number) => {
    if (!onReorder) return;

    const newAttributes = [...attributes];
    const [removed] = newAttributes.splice(fromIndex, 1);
    newAttributes.splice(toIndex, 0, removed);

    // Update sort orders
    const updatedAttributes = newAttributes.map((attr, index) => ({
      ...attr,
      sortOrder: index,
    }));

    onReorder(updatedAttributes);
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const sortedAttributes = [...attributes].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên thuộc tính
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Key
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tùy chọn
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cài đặt
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
            {sortedAttributes.map((attribute, index) => (
              <tr key={attribute.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {attribute.name}
                    </div>
                    {attribute.description && (
                      <div className="text-sm text-gray-500">
                        {attribute.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {attribute.key}
                  </code>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTypeBadge(attribute.type)}
                </td>
                <td className="px-6 py-4">
                  {attribute.options && attribute.options.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {attribute.options.slice(0, 3).map((option, idx) => (
                        <Badge key={idx} variant="secondary" size="sm">
                          {option}
                        </Badge>
                      ))}
                      {attribute.options.length > 3 && (
                        <Badge variant="secondary" size="sm">
                          +{attribute.options.length - 3}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    {attribute.isRequired && (
                      <Badge variant="warning" size="sm">
                        Bắt buộc
                      </Badge>
                    )}
                    {attribute.isVariant && (
                      <Badge variant="info" size="sm">
                        Biến thể
                      </Badge>
                    )}
                    {attribute.unit && (
                      <Badge variant="secondary" size="sm">
                        {attribute.unit}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-900">
                      {attribute.sortOrder}
                    </span>
                    {onReorder && (
                      <div className="flex flex-col">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            moveAttribute(index, Math.max(0, index - 1))
                          }
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            moveAttribute(
                              index,
                              Math.min(sortedAttributes.length - 1, index + 1),
                            )
                          }
                          disabled={index === sortedAttributes.length - 1}
                        >
                          ↓
                        </Button>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(attribute)}
                        title="Chỉnh sửa"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(attribute.id)}
                      title="Xóa thuộc tính"
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

      {attributes.length === 0 && (
        <div className="text-center py-12">
          <Cog6ToothIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            Chưa có thuộc tính nào
          </p>
          <p className="text-gray-500">
            Tạo thuộc tính đầu tiên để mô tả đặc điểm sản phẩm
          </p>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa thuộc tính"
        message="Bạn có chắc chắn muốn xóa thuộc tính này? Các sản phẩm đã sử dụng thuộc tính này có thể bị ảnh hưởng."
        type="danger"
      />
    </>
  );
};
