import React, { useState } from 'react';
import { useForm } from '../../../../hooks/common/useForm';
import {
  CreateCategoryAttributeTemplateRequest,
  AttributeType,
} from '../../../../types/product';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Select } from '../../../ui/Dropdown';
import { Toggle } from '../../../ui/Toggle';
import { Card } from '../../../ui/Card';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface AttributeFormProps {
  initialData?: Partial<CreateCategoryAttributeTemplateRequest>;
  onSubmit: (data: CreateCategoryAttributeTemplateRequest) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const AttributeForm: React.FC<AttributeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const [options, setOptions] = useState<string[]>(initialData?.options || []);
  const [newOption, setNewOption] = useState('');

  const validate = (values: CreateCategoryAttributeTemplateRequest) => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) {
      errors.name = 'Tên thuộc tính là bắt buộc';
    }

    if (!values.key?.trim()) {
      errors.key = 'Key thuộc tính là bắt buộc';
    } else if (!/^[a-z_][a-z0-9_]*$/.test(values.key)) {
      errors.key =
        'Key chỉ được chứa chữ thường, số và dấu gạch dưới, bắt đầu bằng chữ cái';
    }

    if (!values.type) {
      errors.type = 'Loại thuộc tính là bắt buộc';
    }

    if (
      ['SELECT', 'MULTI_SELECT'].includes(values.type) &&
      options.length === 0
    ) {
      errors.options = 'Phải có ít nhất một tùy chọn cho loại SELECT';
    }

    return errors;
  };

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useForm<CreateCategoryAttributeTemplateRequest>({
    initialValues: {
      name: '',
      key: '',
      type: 'TEXT' as AttributeType,
      isRequired: false,
      isVariant: false,
      options: [],
      unit: '',
      sortOrder: 0,
      description: '',
      ...initialData,
    },
    validate,
    onSubmit: async (data) => {
      await onSubmit({
        ...data,
        options: ['SELECT', 'MULTI_SELECT'].includes(data.type)
          ? options
          : undefined,
      });
    },
  });

  const typeOptions = [
    { label: 'Văn bản', value: 'TEXT' },
    { label: 'Số', value: 'NUMBER' },
    { label: 'Lựa chọn đơn', value: 'SELECT' },
    { label: 'Lựa chọn nhiều', value: 'MULTI_SELECT' },
    { label: 'Đúng/Sai', value: 'BOOLEAN' },
    { label: 'Ngày tháng', value: 'DATE' },
    { label: 'URL', value: 'URL' },
    { label: 'Email', value: 'EMAIL' },
  ];

  const generateKey = (name: string) => {
    const key = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars except spaces
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .replace(/^[0-9]/, '_$&'); // Prefix with underscore if starts with number

    setFieldValue('key', key);
  };

  const addOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const showOptionsField = ['SELECT', 'MULTI_SELECT'].includes(values.type);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin thuộc tính
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              name="name"
              label="Tên thuộc tính"
              value={values.name}
              onChange={(e) => {
                handleChange(e);
                if (!isEditing && !values.key) {
                  generateKey(e.target.value);
                }
              }}
              onBlur={handleBlur}
              error={touched.name ? errors.name : undefined}
              required
              placeholder="VD: Màu sắc, Kích thước"
            />
          </div>

          <div>
            <Input
              name="key"
              label="Key (định danh)"
              value={values.key}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.key ? errors.key : undefined}
              required
              placeholder="VD: color, size"
              disabled={isEditing}
            />
          </div>

          <div>
            <Select
              label="Loại thuộc tính"
              value={values.type}
              onChange={(value) =>
                setFieldValue('type', value as AttributeType)
              }
              options={typeOptions}
              error={touched.type ? errors.type : undefined}
              required
            />
          </div>

          <div>
            <Input
              name="unit"
              label="Đơn vị"
              value={values.unit}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="VD: cm, kg, ml"
            />
          </div>

          <div>
            <Input
              name="sortOrder"
              label="Thứ tự sắp xếp"
              type="number"
              value={values.sortOrder}
              onChange={handleChange}
              onBlur={handleBlur}
              min={0}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả
            </label>
            <textarea
              name="description"
              rows={3}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Mô tả về thuộc tính này..."
            />
          </div>
        </div>
      </Card>

      {/* Options for SELECT and MULTI_SELECT */}
      {showOptionsField && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tùy chọn</h3>

          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Nhập tùy chọn mới..."
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addOption())
                }
              />
              <Button
                type="button"
                onClick={addOption}
                disabled={!newOption.trim()}
                leftIcon={<PlusIcon className="w-4 h-4" />}
              >
                Thêm
              </Button>
            </div>

            {options.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Danh sách tùy chọn:
                </label>
                <div className="space-y-2">
                  {options.map((option, index) => (
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
              </div>
            )}

            {touched.options && errors.options && (
              <p className="text-sm text-red-600">{errors.options}</p>
            )}
          </div>
        </Card>
      )}

      {/* Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cài đặt</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Bắt buộc
              </label>
              <p className="text-sm text-gray-500">
                Thuộc tính này bắt buộc phải có giá trị
              </p>
            </div>
            <Toggle
              checked={values.isRequired}
              onChange={(checked) => setFieldValue('isRequired', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                Dùng cho biến thể
              </label>
              <p className="text-sm text-gray-500">
                Thuộc tính này sẽ tạo ra các biến thể sản phẩm khác nhau
              </p>
            </div>
            <Toggle
              checked={values.isVariant}
              onChange={(checked) => setFieldValue('isVariant', checked)}
            />
          </div>
        </div>
      </Card>

      {/* Submit Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {isEditing ? 'Cập nhật thuộc tính' : 'Tạo thuộc tính'}
        </Button>
      </div>
    </form>
  );
};
