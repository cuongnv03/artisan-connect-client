import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { CategoryAttributeTemplate } from '../../types/product';
import { productService } from '../../services/product.service';

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTemplates = async () => {
      if (categoryIds.length === 0) {
        setAllTemplates([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Load attribute templates from all selected categories
        const templatePromises = categoryIds.map((categoryId) =>
          productService.getCategoryAttributeTemplates(categoryId),
        );

        const allCategoryTemplates = await Promise.all(templatePromises);

        // Flatten and deduplicate templates by key
        const templateMap = new Map<string, CategoryAttributeTemplate>();

        allCategoryTemplates.flat().forEach((template) => {
          if (!templateMap.has(template.key)) {
            templateMap.set(template.key, template);
          }
        });

        setAllTemplates(Array.from(templateMap.values()));
      } catch (err: any) {
        console.error('Error loading attribute templates:', err);
        setError(err.message || 'Không thể tải thuộc tính');
        setAllTemplates([]);
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
                    className="mr-2 rounded text-primary focus:ring-primary"
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
      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
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

  if (error) {
    return (
      <div className="text-center py-8 text-red-600 border-2 border-dashed border-red-300 rounded-lg bg-red-50">
        <p>Lỗi: {error}</p>
      </div>
    );
  }

  if (allTemplates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
        <p>Không có thuộc tính nào cho danh mục đã chọn</p>
      </div>
    );
  }

  // Separate required and optional attributes
  const requiredTemplates = allTemplates.filter((t) => t.isRequired);
  const optionalTemplates = allTemplates.filter((t) => !t.isRequired);
  const variantTemplates = allTemplates.filter((t) => t.isVariant);

  return (
    <div className="space-y-6">
      {/* Required Attributes */}
      {requiredTemplates.length > 0 && (
        <Card className="p-6 border-l-4 border-l-red-500">
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
        </Card>
      )}

      {/* Optional Attributes */}
      {optionalTemplates.length > 0 && (
        <Card className="p-6">
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
        </Card>
      )}

      {/* Variant Attributes Info */}
      {variantTemplates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">💡</span>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Thuộc tính biến thể
              </h4>
              <p className="text-sm text-blue-800">
                Các thuộc tính sau có thể được sử dụng để tạo biến thể sản phẩm:{' '}
                <strong>
                  {variantTemplates.map((t) => t.name).join(', ')}
                </strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
