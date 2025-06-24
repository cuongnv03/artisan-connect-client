import React, { useState, useEffect } from 'react';
import {
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  DocumentDuplicateIcon,
  SwatchIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Toggle } from '../ui/Toggle';
import { FileUpload } from '../common/FileUpload';
import { useToastContext } from '../../contexts/ToastContext';
import { uploadService } from '../../services/upload.service';
import { productService } from '../../services/product.service';
import { CategoryAttributeTemplate } from '../../types/product';

interface ProductVariantManagerProps {
  variants: any[];
  onVariantsChange: (variants: any[]) => void;
  basePrice: number;
  baseDiscountPrice?: number; // NEW: Add base discount price
  baseWeight?: number; // NEW: Add base weight
  categoryIds: string[];
  currentAttributes?: Record<string, any>;
}

interface VariantFormData {
  id?: string;
  name: string;
  price: number;
  discountPrice?: number; // Make optional
  quantity: number;
  attributes: Record<string, any>;
  images: string[];
  isActive: boolean;
  isDefault: boolean;
  weight?: number; // Make optional
}

export const ProductVariantManager: React.FC<ProductVariantManagerProps> = ({
  variants,
  onVariantsChange,
  basePrice,
  baseDiscountPrice, // NEW
  baseWeight, // NEW
  categoryIds,
  currentAttributes = {},
}) => {
  const { success, error } = useToastContext();
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);
  const [uploading, setUploading] = useState<Record<number, boolean>>({});
  const [attributeTemplates, setAttributeTemplates] = useState<
    CategoryAttributeTemplate[]
  >([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  // NEW: Load attribute templates from categories
  useEffect(() => {
    const loadAttributeTemplates = async () => {
      if (categoryIds.length === 0) {
        setAttributeTemplates([]);
        return;
      }

      setLoadingTemplates(true);
      try {
        const templatePromises = categoryIds.map((categoryId) =>
          productService.getCategoryAttributeTemplates(categoryId),
        );
        const allTemplates = await Promise.all(templatePromises);

        const templateMap = new Map<string, CategoryAttributeTemplate>();
        allTemplates.flat().forEach((template) => {
          if (template.isVariant && !templateMap.has(template.key)) {
            templateMap.set(template.key, template);
          }
        });

        setAttributeTemplates(Array.from(templateMap.values()));
      } catch (err: any) {
        console.error('Error loading attribute templates:', err);
        setAttributeTemplates([]);
      } finally {
        setLoadingTemplates(false);
      }
    };

    loadAttributeTemplates();
  }, [categoryIds]);

  // Calculate total quantity
  const totalQuantity = variants.reduce(
    (sum, variant) => sum + (variant.quantity || 0),
    0,
  );

  const addVariant = () => {
    const isFirstVariant = variants.length === 0;

    const newVariant: VariantFormData = {
      name: isFirstVariant
        ? 'Biến thể mặc định'
        : `Biến thể ${variants.length + 1}`,
      price: basePrice,
      discountPrice: baseDiscountPrice || undefined,
      quantity: 0,
      attributes: isFirstVariant ? { ...currentAttributes } : {},
      images: [],
      isActive: true,
      isDefault: isFirstVariant, // Biến thể đầu tiên là mặc định
      weight: isFirstVariant ? baseWeight || undefined : undefined,
    };

    onVariantsChange([...variants, newVariant]);
    setExpandedVariant(variants.length);

    if (isFirstVariant) {
      success(
        'Đã tạo biến thể mặc định. Hãy điều chỉnh thông tin và phân bổ số lượng.',
      );
    }
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const updatedVariants = variants.map((variant, i) => {
      if (i === index) {
        const updatedVariant = { ...variant, [field]: value };

        // Ensure only one default variant
        if (field === 'isDefault' && value) {
          return updatedVariant;
        }

        return updatedVariant;
      } else if (field === 'isDefault' && value) {
        // Unset other defaults
        return { ...variant, isDefault: false };
      }

      return variant;
    });

    onVariantsChange(updatedVariants);
  };

  const removeVariant = (index: number) => {
    const updatedVariants = variants.filter((_, i) => i !== index);

    // Ensure we have a default if variants exist
    if (
      updatedVariants.length > 0 &&
      !updatedVariants.some((v) => v.isDefault)
    ) {
      updatedVariants[0].isDefault = true;
    }

    onVariantsChange(updatedVariants);
    setExpandedVariant(null);
  };

  const duplicateVariant = (index: number) => {
    const variantToDuplicate = { ...variants[index] };
    variantToDuplicate.name = `${variantToDuplicate.name} (Copy)`;
    variantToDuplicate.isDefault = false;
    variantToDuplicate.quantity = 0;
    delete variantToDuplicate.id;

    onVariantsChange([...variants, variantToDuplicate]);
  };

  const handleImageUpload = async (variantIndex: number, files: File[]) => {
    if (files.length === 0) return;

    setUploading((prev) => ({ ...prev, [variantIndex]: true }));

    try {
      const uploads = await Promise.all(
        files.map((file) =>
          uploadService.uploadImage(file, { folder: 'variants' }),
        ),
      );

      const newImageUrls = uploads.map((upload) => upload.url);
      const currentImages = variants[variantIndex].images || [];

      updateVariant(variantIndex, 'images', [
        ...currentImages,
        ...newImageUrls,
      ]);
      success('Tải ảnh thành công');
    } catch (err: any) {
      error(err.message || 'Không thể tải ảnh');
    } finally {
      setUploading((prev) => ({ ...prev, [variantIndex]: false }));
    }
  };

  const removeImage = (variantIndex: number, imageIndex: number) => {
    const currentImages = variants[variantIndex].images || [];
    const updatedImages = currentImages.filter((_, i) => i !== imageIndex);
    updateVariant(variantIndex, 'images', updatedImages);
  };

  const updateVariantAttribute = (
    variantIndex: number,
    attributeKey: string,
    value: any,
  ) => {
    const variant = variants[variantIndex];
    const newAttributes = { ...variant.attributes, [attributeKey]: value };
    updateVariant(variantIndex, 'attributes', newAttributes);
  };

  const renderAttributeInput = (
    template: CategoryAttributeTemplate,
    variantIndex: number,
  ) => {
    const value = variants[variantIndex]?.attributes?.[template.key] || '';

    switch (template.type) {
      case 'TEXT':
        return (
          <Input
            label={template.name}
            value={value}
            onChange={(e) =>
              updateVariantAttribute(variantIndex, template.key, e.target.value)
            }
            placeholder={
              template.description || `Nhập ${template.name.toLowerCase()}`
            }
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
            value={value}
            onChange={(e) =>
              updateVariantAttribute(
                variantIndex,
                template.key,
                Number(e.target.value),
              )
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
              value={value}
              onChange={(e) =>
                updateVariantAttribute(
                  variantIndex,
                  template.key,
                  e.target.value,
                )
              }
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
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-2">
              {template.options?.map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateVariantAttribute(variantIndex, template.key, [
                          ...selectedValues,
                          option,
                        ]);
                      } else {
                        updateVariantAttribute(
                          variantIndex,
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
              onChange={(checked) =>
                updateVariantAttribute(variantIndex, template.key, checked)
              }
            />
          </div>
        );

      default:
        return (
          <Input
            label={template.name}
            value={value}
            onChange={(e) =>
              updateVariantAttribute(variantIndex, template.key, e.target.value)
            }
            placeholder={template.description}
            required={template.isRequired}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Tạo các biến thể khác nhau cho sản phẩm (màu sắc, kích thước, v.v.)
          </p>
          {variants.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-amber-700">
                Tổng số lượng biến thể: <strong>{totalQuantity}</strong> sản
                phẩm
              </span>
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={addVariant}
          leftIcon={<PlusIcon className="w-4 h-4" />}
          size="sm"
        >
          Thêm biến thể
        </Button>
      </div>

      {/* Loading Templates */}
      {loadingTemplates && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-600">
            Đang tải thuộc tính từ danh mục...
          </p>
        </div>
      )}

      {/* Available Attributes Info */}
      {attributeTemplates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-blue-900 mb-2">
            Thuộc tính có thể sử dụng cho biến thể:
          </h5>
          <div className="flex flex-wrap gap-2">
            {attributeTemplates.map((template) => (
              <Badge key={template.key} variant="info" size="sm">
                {template.name}
                {template.isRequired && <span className="ml-1">*</span>}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Variants List */}
      {variants.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <SwatchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Chưa có biến thể nào</p>
          <Button
            type="button"
            onClick={addVariant}
            leftIcon={<PlusIcon className="w-4 h-4" />}
          >
            Tạo biến thể đầu tiên
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {variants.map((variant, index) => (
            <Card key={index} className="p-4">
              {/* Variant Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedVariant(
                        expandedVariant === index ? null : index,
                      )
                    }
                    className="text-left"
                  >
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      {variant.name || `Biến thể ${index + 1}`}
                      {variant.isDefault && (
                        <Badge variant="primary" size="sm" className="ml-2">
                          Mặc định
                        </Badge>
                      )}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Giá: {variant.price?.toLocaleString() || 0}₫
                      {variant.discountPrice && (
                        <span className="text-green-600 ml-1">
                          (Giảm: {variant.discountPrice.toLocaleString()}₫)
                        </span>
                      )}
                      • Kho: {variant.quantity || 0}
                      {variant.attributes &&
                        Object.keys(variant.attributes).length > 0 && (
                          <span className="ml-2">
                            •{' '}
                            {Object.entries(variant.attributes)
                              .filter(([_, value]) => value)
                              .map(([key, value]) => `${key}: ${value}`)
                              .join(', ')}
                          </span>
                        )}
                    </p>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Toggle
                    checked={variant.isActive ?? true}
                    onChange={(checked) =>
                      updateVariant(index, 'isActive', checked)
                    }
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => duplicateVariant(index)}
                    title="Nhân bản"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(index)}
                    className="text-red-600 hover:text-red-700"
                    title="Xóa"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Expanded Form */}
              {expandedVariant === index && (
                <div className="space-y-6 pt-4 border-t">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Tên biến thể"
                      value={variant.name || ''}
                      onChange={(e) =>
                        updateVariant(index, 'name', e.target.value)
                      }
                      placeholder="VD: Màu đỏ - Size M"
                    />

                    <div className="flex items-center gap-2 pt-6">
                      <Toggle
                        checked={variant.isDefault || false}
                        onChange={(checked) =>
                          updateVariant(index, 'isDefault', checked)
                        }
                      />
                      <label className="text-sm font-medium text-gray-700">
                        Đặt làm biến thể mặc định
                      </label>
                    </div>
                  </div>

                  {/* Pricing & Inventory */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      label="Giá bán (₫)"
                      type="number"
                      value={variant.price || ''}
                      onChange={(e) =>
                        updateVariant(index, 'price', Number(e.target.value))
                      }
                      placeholder="0"
                      required
                    />

                    <Input
                      label="Giá khuyến mãi (₫)"
                      type="number"
                      value={variant.discountPrice || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateVariant(
                          index,
                          'discountPrice',
                          value ? Number(value) : undefined, // NEW: Allow undefined for optional field
                        );
                      }}
                      placeholder="Tùy chọn"
                      helperText="Để trống nếu không có giảm giá"
                    />

                    <Input
                      label="Số lượng"
                      type="number"
                      value={variant.quantity || ''}
                      onChange={(e) =>
                        updateVariant(index, 'quantity', Number(e.target.value))
                      }
                      placeholder="0"
                      helperText="Số lượng riêng của biến thể này"
                      required
                    />

                    <Input
                      label="Trọng lượng (kg)"
                      type="number"
                      step="0.1"
                      value={variant.weight || ''}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateVariant(
                          index,
                          'weight',
                          value ? Number(value) : undefined, // NEW: Allow undefined for optional field
                        );
                      }}
                      placeholder="Tùy chọn"
                      helperText="Để trống để dùng trọng lượng sản phẩm gốc"
                    />
                  </div>

                  {/* Variant Attributes from Templates */}
                  {attributeTemplates.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Thuộc tính biến thể
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {attributeTemplates.map((template) => (
                          <div key={template.key}>
                            {renderAttributeInput(template, index)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Hình ảnh biến thể
                    </label>

                    {/* Current Images */}
                    {variant.images && variant.images.length > 0 && (
                      <div className="grid grid-cols-4 gap-3 mb-4">
                        {variant.images.map(
                          (imageUrl: string, imageIndex: number) => (
                            <div
                              key={imageIndex}
                              className="relative group aspect-square"
                            >
                              <img
                                src={imageUrl}
                                alt={`Biến thể ${index + 1} - ${
                                  imageIndex + 1
                                }`}
                                className="w-full h-full object-cover rounded border"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index, imageIndex)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {/* Upload New Images */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                      <FileUpload
                        files={[]}
                        onFilesChange={(files) =>
                          handleImageUpload(index, files)
                        }
                        accept="image"
                        multiple
                        maxFiles={5}
                        maxSize={5}
                      />
                      {uploading[index] && (
                        <div className="mt-2 text-center">
                          <span className="text-sm text-gray-600">
                            Đang tải ảnh...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}

          {/* Total Quantity Summary */}
          <Card className="p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Tổng số lượng tất cả biến thể:
              </span>
              <span className="text-lg font-bold text-primary">
                {totalQuantity} sản phẩm
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Đây sẽ là tổng số lượng tồn kho của sản phẩm
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
