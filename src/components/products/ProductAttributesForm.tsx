import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useCategoryAttributes } from '../../hooks/products/useCategoryAttributes';
import { CategoryAttributeTemplate } from '../../types/product';

interface ProductAttributesFormProps {
  categoryIds: string[];
  attributes: Record<string, any>;
  onAttributesChange: (attributes: Record<string, any>) => void;
}

export const ProductAttributesForm: React.FC<ProductAttributesFormProps> = ({
  categoryIds,
  attributes,
  onAttributesChange,
}) => {
  const [allTemplates, setAllTemplates] = useState<CategoryAttributeTemplate[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  // Load attribute templates for all selected categories
  useEffect(() => {
    const loadTemplates = async () => {
      if (categoryIds.length === 0) {
        setAllTemplates([]);
        return;
      }

      setLoading(true);
      try {
        // This is a simplified approach - in real app, you'd load from each category
        // For now, we'll create some common templates
        const commonTemplates: CategoryAttributeTemplate[] = [
          {
            id: '1',
            categoryId: '',
            name: 'Chất liệu',
            key: 'material',
            type: 'TEXT',
            isRequired: false,
            isVariant: true,
            sortOrder: 0,
            description: 'Chất liệu chính của sản phẩm',
            isCustom: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            categoryId: '',
            name: 'Xuất xứ',
            key: 'origin',
            type: 'SELECT',
            isRequired: false,
            isVariant: false,
            options: [
              'Việt Nam',
              'Thái Lan',
              'Trung Quốc',
              'Nhật Bản',
              'Hàn Quốc',
            ],
            sortOrder: 1,
            description: 'Nơi sản xuất sản phẩm',
            isCustom: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '3',
            categoryId: '',
            name: 'Độ bền',
            key: 'durability',
            type: 'SELECT',
            isRequired: false,
            isVariant: false,
            options: ['Thấp', 'Trung bình', 'Cao', 'Rất cao'],
            sortOrder: 2,
            description: 'Mức độ bền của sản phẩm',
            isCustom: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '4',
            categoryId: '',
            name: 'Thời gian bảo hành',
            key: 'warranty',
            type: 'NUMBER',
            isRequired: false,
            isVariant: false,
            unit: 'tháng',
            sortOrder: 3,
            description: 'Thời gian bảo hành (tháng)',
            isCustom: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '5',
            categoryId: '',
            name: 'Thân thiện môi trường',
            key: 'eco_friendly',
            type: 'BOOLEAN',
            isRequired: false,
            isVariant: false,
            sortOrder: 4,
            description: 'Sản phẩm có thân thiện với môi trường không',
            isCustom: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        setAllTemplates(commonTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [categoryIds]);

  const updateAttribute = (key: string, value: any) => {
    onAttributesChange({
      ...attributes,
      [key]: value,
    });
  };

  const renderAttributeInput = (template: CategoryAttributeTemplate) => {
    const value = attributes[template.key];

    switch (template.type) {
      case 'TEXT':
        return (
          <Input
            label={template.name}
            value={value || ''}
            onChange={(e) => updateAttribute(template.key, e.target.value)}
            placeholder={template.description}
            required={template.isRequired}
          />
        );

      case 'NUMBER':
        return (
          <Input
            label={`${template.name}${
              template.unit ? ` (${template.unit})` : ''
            }`}
            type="number"
            value={value || ''}
            onChange={(e) =>
              updateAttribute(template.key, Number(e.target.value))
            }
            placeholder={template.description}
            required={template.isRequired}
          />
        );

      case 'SELECT':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {template.name}
              {template.isRequired && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <select
              value={value || ''}
              onChange={(e) => updateAttribute(template.key, e.target.value)}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required={template.isRequired}
            >
              <option value="">Chọn {template.name.toLowerCase()}</option>
              {template.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {template.description && (
              <p className="mt-1 text-xs text-gray-500">
                {template.description}
              </p>
            )}
          </div>
        );

      case 'MULTI_SELECT':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {template.name}
              {template.isRequired && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="space-y-2">
              {template.options?.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateAttribute(template.key, [
                          ...selectedValues,
                          option,
                        ]);
                      } else {
                        updateAttribute(
                          template.key,
                          selectedValues.filter((v: string) => v !== option),
                        );
                      }
                    }}
                    className="mr-2"
                  />
                  <span className="text-sm">{option}</span>
                </label>
              ))}
            </div>
            {template.description && (
              <p className="mt-1 text-xs text-gray-500">
                {template.description}
              </p>
            )}
          </div>
        );

      case 'BOOLEAN':
        return (
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900">
                {template.name}
                {template.isRequired && (
                  <span className="text-red-500 ml-1">*</span>
                )}
              </label>
              {template.description && (
                <p className="text-xs text-gray-500">{template.description}</p>
              )}
            </div>
            <Toggle
              checked={value || false}
              onChange={(checked) => updateAttribute(template.key, checked)}
            />
          </div>
        );

      case 'DATE':
        return (
          <Input
            label={template.name}
            type="date"
            value={value || ''}
            onChange={(e) => updateAttribute(template.key, e.target.value)}
            required={template.isRequired}
          />
        );

      case 'URL':
        return (
          <Input
            label={template.name}
            type="url"
            value={value || ''}
            onChange={(e) => updateAttribute(template.key, e.target.value)}
            placeholder="https://"
            required={template.isRequired}
          />
        );

      case 'EMAIL':
        return (
          <Input
            label={template.name}
            type="email"
            value={value || ''}
            onChange={(e) => updateAttribute(template.key, e.target.value)}
            placeholder="example@email.com"
            required={template.isRequired}
          />
        );

      default:
        return null;
    }
  };

  if (categoryIds.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Chọn danh mục để hiển thị thuộc tính sản phẩm</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <LoadingSpinner size="md" />
        <p className="mt-2 text-gray-600">Đang tải thuộc tính...</p>
      </div>
    );
  }

  if (allTemplates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Không có thuộc tính nào cho danh mục đã chọn</p>
      </div>
    );
  }

  // Separate required and optional attributes
  const requiredTemplates = allTemplates.filter((t) => t.isRequired);
  const optionalTemplates = allTemplates.filter((t) => !t.isRequired);

  return (
    <div className="space-y-6">
      {/* Required Attributes */}
      {requiredTemplates.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            Thuộc tính bắt buộc
            <Badge variant="danger" size="sm" className="ml-2">
              {requiredTemplates.length}
            </Badge>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredTemplates.map((template) => (
              <div key={template.id}>{renderAttributeInput(template)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Attributes */}
      {optionalTemplates.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
            Thuộc tính tùy chọn
            <Badge variant="secondary" size="sm" className="ml-2">
              {optionalTemplates.length}
            </Badge>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {optionalTemplates.map((template) => (
              <div key={template.id}>{renderAttributeInput(template)}</div>
            ))}
          </div>
        </div>
      )}

      {/* Variant Attributes Note */}
      {allTemplates.some((t) => t.isVariant) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            💡 <strong>Ghi chú:</strong> Các thuộc tính được đánh dấu là "biến
            thể" có thể được sử dụng để tạo các phiên bản khác nhau của sản phẩm
            trong phần quản lý biến thể.
          </p>
        </div>
      )}
    </div>
  );
};
