import React, { useState } from 'react';
import {
  CategoryAttributeTemplate,
  CreateCategoryAttributeTemplateRequest,
} from '../../../types/product';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Dropdown';
import { Badge } from '../../ui/Badge';
import { Card } from '../../ui/Card';
import { Modal } from '../../ui/Modal';
import { Toggle } from '../../ui/Toggle';
import { useToastContext } from '../../../contexts/ToastContext';
import { PlusIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface SimpleAttributeManagerProps {
  categoryId: string;
  categoryName: string;
  attributes: CategoryAttributeTemplate[];
  onCreateAttribute: (
    data: CreateCategoryAttributeTemplateRequest,
  ) => Promise<void>;
  onDeleteAttribute: (templateId: string) => Promise<void>;
}

export const SimpleAttributeManager: React.FC<SimpleAttributeManagerProps> = ({
  categoryId,
  categoryName,
  attributes,
  onCreateAttribute,
  onDeleteAttribute,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
    type: 'TEXT' as any,
    isRequired: false,
    isVariant: false,
    options: [] as string[],
    unit: '',
    description: '',
  });
  const [newOption, setNewOption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { success, error } = useToastContext();

  const attributeTypes = [
    { label: 'Văn bản', value: 'TEXT' },
    { label: 'Số', value: 'NUMBER' },
    { label: 'Lựa chọn đơn', value: 'SELECT' },
    { label: 'Lựa chọn nhiều', value: 'MULTI_SELECT' },
    { label: 'Đúng/Sai', value: 'BOOLEAN' },
    { label: 'Ngày tháng', value: 'DATE' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.key.trim()) {
      error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateAttribute({
        ...formData,
        options: ['SELECT', 'MULTI_SELECT'].includes(formData.type)
          ? formData.options
          : undefined,
      });

      // Reset form
      setFormData({
        name: '',
        key: '',
        type: 'TEXT',
        isRequired: false,
        isVariant: false,
        options: [],
        unit: '',
        description: '',
      });
      setNewOption('');
      setShowForm(false);
      success('Tạo thuộc tính thành công');
    } catch (err: any) {
      error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const generateKey = (name: string) => {
    const key = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
      .replace(/^[0-9]/, '_$&');

    setFormData((prev) => ({ ...prev, key }));
  };

  const addOption = () => {
    if (newOption.trim() && !formData.options.includes(newOption.trim())) {
      setFormData((prev) => ({
        ...prev,
        options: [...prev.options, newOption.trim()],
      }));
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thuộc tính này?')) {
      try {
        await onDeleteAttribute(templateId);
        success('Xóa thuộc tính thành công');
      } catch (err: any) {
        error(err.message);
      }
    }
  };

  const showOptionsField = ['SELECT', 'MULTI_SELECT'].includes(formData.type);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Thuộc tính cho "{categoryName}"
          </h3>
          <p className="text-gray-600">
            Quản lý các thuộc tính sẽ hiển thị khi nghệ nhân tạo sản phẩm
          </p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Thêm thuộc tính
        </Button>
      </div>

      {/* Attributes List */}
      <div className="space-y-3">
        {attributes.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">Chưa có thuộc tính nào</p>
          </Card>
        ) : (
          attributes.map((attr) => (
            <Card key={attr.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{attr.name}</h4>
                    <Badge variant="secondary">{attr.type}</Badge>
                    {attr.isRequired && (
                      <Badge variant="warning" size="sm">
                        Bắt buộc
                      </Badge>
                    )}
                    {attr.isVariant && (
                      <Badge variant="info" size="sm">
                        Biến thể
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Key: {attr.key}</p>
                  {attr.description && (
                    <p className="text-sm text-gray-500 mb-2">
                      {attr.description}
                    </p>
                  )}
                  {attr.options && attr.options.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {attr.options.map((option, idx) => (
                        <Badge key={idx} variant="secondary" size="sm">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(attr.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Tạo thuộc tính mới"
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Tên thuộc tính"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData((prev) => ({ ...prev, name }));
                if (!formData.key) {
                  generateKey(name);
                }
              }}
              placeholder="VD: Màu sắc, Kích thước"
              required
            />
            <Input
              label="Key (định danh)"
              value={formData.key}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, key: e.target.value }))
              }
              placeholder="VD: color, size"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Loại thuộc tính"
              value={formData.type}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, type: value as any }))
              }
              options={attributeTypes}
              required
            />
            <Input
              label="Đơn vị (tùy chọn)"
              value={formData.unit}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, unit: e.target.value }))
              }
              placeholder="VD: cm, kg, ml"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả (tùy chọn)
            </label>
            <textarea
              rows={2}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Mô tả về thuộc tính này..."
            />
          </div>

          {/* Options for SELECT types */}
          {showOptionsField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tùy chọn
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder="Nhập tùy chọn..."
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addOption())
                  }
                />
                <Button
                  type="button"
                  onClick={addOption}
                  disabled={!newOption.trim()}
                >
                  Thêm
                </Button>
              </div>
              {formData.options.length > 0 && (
                <div className="space-y-1">
                  {formData.options.map((option, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <span>{option}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(index)}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Bắt buộc
              </span>
              <Toggle
                checked={formData.isRequired}
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isRequired: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Dùng cho biến thể
              </span>
              <Toggle
                checked={formData.isVariant}
                onChange={(checked) =>
                  setFormData((prev) => ({ ...prev, isVariant: checked }))
                }
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowForm(false)}
            >
              Hủy
            </Button>
            <Button type="submit" loading={submitting}>
              Tạo thuộc tính
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
