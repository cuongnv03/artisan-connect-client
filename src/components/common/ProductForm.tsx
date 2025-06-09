import React, { useState, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Tabs } from '../ui/Tabs';
import { Select } from '../ui/Dropdown';
import {
  CreateProductRequest,
  CreateProductAttributeRequest,
  CreateProductVariantRequest,
  Category,
  CategoryAttributeTemplate,
  CustomAttributeTemplate,
  AttributeType,
} from '../../types/product';
import { productService } from '../../services/product.service';
import { PlusIcon, XMarkIcon, SwatchIcon } from '@heroicons/react/24/outline';

interface ProductFormProps {
  initialData?: Partial<CreateProductRequest>;
  onSubmit: (data: CreateProductRequest) => Promise<void>;
  isLoading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  isLoading = false,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [attributeTemplates, setAttributeTemplates] = useState<
    CategoryAttributeTemplate[]
  >([]);
  const [customTemplates, setCustomTemplates] = useState<
    CustomAttributeTemplate[]
  >([]);
  const [showAttributeModal, setShowAttributeModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');

  const {
    values,
    errors,
    touched,
    handleChange,
    handleSubmit,
    setFieldValue,
    isSubmitting,
  } = useForm<CreateProductRequest>({
    initialValues: {
      name: '',
      description: '',
      price: 0,
      discountPrice: undefined,
      quantity: 0,
      categories: [],
      images: [],
      tags: [],
      isCustomizable: false,
      specifications: {},
      customFields: {},
      weight: undefined,
      dimensions: {
        length: undefined,
        width: undefined,
        height: undefined,
        unit: 'cm',
      },
      attributes: [],
      variants: [],
      ...initialData,
    },
    onSubmit,
  });

  useEffect(() => {
    loadCategories();
    loadCustomTemplates();
  }, []);

  useEffect(() => {
    if (values.categories.length > 0) {
      loadAttributeTemplates();
    }
  }, [values.categories]);

  const loadCategories = async () => {
    try {
      const categoriesData = await productService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadAttributeTemplates = async () => {
    try {
      const templates: CategoryAttributeTemplate[] = [];
      for (const categoryId of values.categories) {
        const categoryTemplates =
          await productService.getCategoryAttributeTemplates(categoryId);
        templates.push(...categoryTemplates);
      }
      setAttributeTemplates(templates);
    } catch (error) {
      console.error('Error loading attribute templates:', error);
    }
  };

  const loadCustomTemplates = async () => {
    try {
      const templates = await productService.getCustomAttributeTemplates();
      setCustomTemplates(templates);
    } catch (error) {
      console.error('Error loading custom templates:', error);
    }
  };

  const addAttribute = (
    template: CategoryAttributeTemplate | CustomAttributeTemplate,
    value: string,
  ) => {
    const newAttribute: CreateProductAttributeRequest = {
      key: template.key,
      value,
      unit: template.unit,
    };

    const existingIndex =
      values.attributes?.findIndex((attr) => attr.key === template.key) ?? -1;
    const newAttributes = [...(values.attributes || [])];

    if (existingIndex >= 0) {
      newAttributes[existingIndex] = newAttribute;
    } else {
      newAttributes.push(newAttribute);
    }

    setFieldValue('attributes', newAttributes);
    setShowAttributeModal(false);
  };

  const removeAttribute = (key: string) => {
    const newAttributes =
      values.attributes?.filter((attr) => attr.key !== key) || [];
    setFieldValue('attributes', newAttributes);
  };

  const addVariant = (variantData: CreateProductVariantRequest) => {
    const newVariants = [...(values.variants || []), variantData];
    setFieldValue('variants', newVariants);
    setShowVariantModal(false);
  };

  const removeVariant = (index: number) => {
    const newVariants = values.variants?.filter((_, i) => i !== index) || [];
    setFieldValue('variants', newVariants);
  };

  const generateVariants = () => {
    // Logic to generate variants from attributes
    const variantAttributes = attributeTemplates.filter(
      (template) => template.isVariant,
    );
    // Implementation for generating variants combinations
  };

  const tabItems = [
    {
      key: 'basic',
      label: 'Thông tin cơ bản',
      content: (
        <div className="space-y-6">
          <Input
            label="Tên sản phẩm"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={touched.name ? errors.name : undefined}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả sản phẩm
            </label>
            <textarea
              name="description"
              rows={4}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              value={values.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về sản phẩm..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Giá bán (VND)"
              name="price"
              type="number"
              min="0"
              step="1000"
              value={values.price}
              onChange={handleChange}
              error={touched.price ? errors.price : undefined}
              required
            />

            <Input
              label="Giá khuyến mãi (VND)"
              name="discountPrice"
              type="number"
              min="0"
              step="1000"
              value={values.discountPrice || ''}
              onChange={handleChange}
              error={touched.discountPrice ? errors.discountPrice : undefined}
            />
          </div>

          <Input
            label="Số lượng"
            name="quantity"
            type="number"
            min="0"
            value={values.quantity}
            onChange={handleChange}
            error={touched.quantity ? errors.quantity : undefined}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Danh mục
            </label>
            <Select
              value={values.categories[0] || ''}
              onChange={(value) =>
                setFieldValue('categories', value ? [value] : [])
              }
              options={categories.map((cat) => ({
                label: cat.name,
                value: cat.id,
              }))}
              placeholder="Chọn danh mục sản phẩm"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCustomizable"
              name="isCustomizable"
              checked={values.isCustomizable}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label
              htmlFor="isCustomizable"
              className="ml-2 text-sm text-gray-900"
            >
              Sản phẩm có thể tùy chỉnh
            </label>
          </div>
        </div>
      ),
    },
    {
      key: 'media',
      label: 'Hình ảnh',
      content: (
        <div className="space-y-6">
          {/* Image upload component */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh sản phẩm
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {values.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = values.images.filter(
                        (_, i) => i !== index,
                      );
                      setFieldValue('images', newImages);
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Add image button */}
              <button
                type="button"
                className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-primary transition-colors"
                onClick={() => {
                  // Handle image upload
                }}
              >
                <PlusIcon className="w-8 h-8 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {values.tags.map((tag, index) => (
                <Badge key={index} variant="secondary">
                  #{tag}
                  <button
                    type="button"
                    onClick={() => {
                      const newTags = values.tags.filter((_, i) => i !== index);
                      setFieldValue('tags', newTags);
                    }}
                    className="ml-1"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Thêm tag..."
                className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    const tag = input.value.trim();
                    if (tag && !values.tags.includes(tag)) {
                      setFieldValue('tags', [...values.tags, tag]);
                      input.value = '';
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'attributes',
      label: 'Thuộc tính',
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Thuộc tính sản phẩm
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAttributeModal(true)}
              leftIcon={<PlusIcon className="w-4 h-4" />}
            >
              Thêm thuộc tính
            </Button>
          </div>

          {values.attributes && values.attributes.length > 0 ? (
            <div className="space-y-3">
              {values.attributes.map((attr, index) => {
                const template = [
                  ...attributeTemplates,
                  ...customTemplates,
                ].find((t) => t.key === attr.key);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="font-medium">
                        {template?.name || attr.key}
                      </span>
                      <span className="text-gray-600 ml-2">
                        {attr.value}{' '}
                        {attr.unit && (
                          <span className="text-gray-500">{attr.unit}</span>
                        )}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttribute(attr.key)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Chưa có thuộc tính nào. Thêm thuộc tính để mô tả chi tiết sản
              phẩm.
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'variants',
      label: 'Biến thể',
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Biến thể sản phẩm
            </h3>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateVariants}
                leftIcon={<SwatchIcon className="w-4 h-4" />}
              >
                Tự động tạo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowVariantModal(true)}
                leftIcon={<PlusIcon className="w-4 h-4" />}
              >
                Thêm biến thể
              </Button>
            </div>
          </div>

          {values.variants && values.variants.length > 0 ? (
            <div className="space-y-4">
              {values.variants.map((variant, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {variant.name || `Biến thể ${index + 1}`}
                          </h4>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {variant.attributes.map((attr) => (
                              <Badge
                                key={attr.key}
                                variant="secondary"
                                size="sm"
                              >
                                {attr.key}: {attr.value}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Giá: {variant.price?.toLocaleString()} VND
                          </p>
                          <p className="text-sm text-gray-600">
                            Số lượng: {variant.quantity}
                          </p>
                        </div>
                        <div>
                          {variant.images && variant.images.length > 0 && (
                            <img
                              src={variant.images[0]}
                              alt="Variant"
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Chưa có biến thể nào. Thêm biến thể để tạo nhiều lựa chọn cho
              khách hàng.
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'specifications',
      label: 'Thông số',
      content: (
        <div className="space-y-6">
          {/* Weight & Dimensions */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">
              Kích thước & Trọng lượng
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Trọng lượng (kg)"
                name="weight"
                type="number"
                min="0"
                step="0.1"
                value={values.weight || ''}
                onChange={handleChange}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đơn vị đo
                </label>
                <Select
                  value={values.dimensions?.unit || 'cm'}
                  onChange={(value) => setFieldValue('dimensions.unit', value)}
                  options={[
                    { label: 'Centimet (cm)', value: 'cm' },
                    { label: 'Milimet (mm)', value: 'mm' },
                    { label: 'Inch', value: 'inch' },
                    { label: 'Feet', value: 'ft' },
                  ]}
                />
              </div>

              <Input
                label={`Chiều dài (${values.dimensions?.unit || 'cm'})`}
                name="dimensions.length"
                type="number"
                min="0"
                step="0.1"
                value={values.dimensions?.length || ''}
                onChange={handleChange}
              />

              <Input
                label={`Chiều rộng (${values.dimensions?.unit || 'cm'})`}
                name="dimensions.width"
                type="number"
                min="0"
                step="0.1"
                value={values.dimensions?.width || ''}
                onChange={handleChange}
              />

              <Input
                label={`Chiều cao (${values.dimensions?.unit || 'cm'})`}
                name="dimensions.height"
                type="number"
                min="0"
                step="0.1"
                value={values.dimensions?.height || ''}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Custom Specifications */}
          <div>
            <h4 className="font-medium text-gray-900 mb-4">
              Thông số kỹ thuật
            </h4>
            <div className="space-y-3">
              {Object.entries(values.specifications || {}).map(
                ([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => {
                        const newSpecs = { ...values.specifications };
                        delete newSpecs[key];
                        newSpecs[e.target.value] = value;
                        setFieldValue('specifications', newSpecs);
                      }}
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="Tên thông số"
                    />
                    <input
                      type="text"
                      value={String(value)}
                      onChange={(e) => {
                        const newSpecs = { ...values.specifications };
                        newSpecs[key] = e.target.value;
                        setFieldValue('specifications', newSpecs);
                      }}
                      className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                      placeholder="Giá trị"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const newSpecs = { ...values.specifications };
                        delete newSpecs[key];
                        setFieldValue('specifications', newSpecs);
                      }}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={() => {
                  const newSpecs = { ...values.specifications, '': '' };
                  setFieldValue('specifications', newSpecs);
                }}
                className="flex items-center text-primary hover:text-primary-dark"
              >
                <PlusIcon className="w-4 h-4 mr-1" />
                Thêm thông số
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Tabs items={tabItems} defaultActiveKey="basic" />

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Hủy
        </Button>
        <Button type="submit" loading={isSubmitting || isLoading}>
          {initialData ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
        </Button>
      </div>

      {/* Attribute Modal */}
      <AttributeModal
        isOpen={showAttributeModal}
        onClose={() => setShowAttributeModal(false)}
        templates={[...attributeTemplates, ...customTemplates]}
        onAdd={addAttribute}
      />

      {/* Variant Modal */}
      <VariantModal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        attributeTemplates={attributeTemplates.filter((t) => t.isVariant)}
        onAdd={addVariant}
      />
    </form>
  );
};

// Helper Components
const AttributeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  templates: (CategoryAttributeTemplate | CustomAttributeTemplate)[];
  onAdd: (
    template: CategoryAttributeTemplate | CustomAttributeTemplate,
    value: string,
  ) => void;
}> = ({ isOpen, onClose, templates, onAdd }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<
    CategoryAttributeTemplate | CustomAttributeTemplate | null
  >(null);
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTemplate && value.trim()) {
      onAdd(selectedTemplate, value.trim());
      setSelectedTemplate(null);
      setValue('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm thuộc tính" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn thuộc tính
          </label>
          <Select
            value={selectedTemplate?.id || ''}
            onChange={(value) => {
              const template = templates.find((t) => t.id === value);
              setSelectedTemplate(template || null);
            }}
            options={templates.map((template) => ({
              label: template.name,
              value: template.id,
            }))}
            placeholder="Chọn thuộc tính"
          />
        </div>

        {selectedTemplate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giá trị
            </label>
            {selectedTemplate.type === AttributeType.SELECT &&
            selectedTemplate.options ? (
              <Select
                value={value}
                onChange={setValue}
                options={selectedTemplate.options.map((option) => ({
                  label: option,
                  value: option,
                }))}
                placeholder="Chọn giá trị"
              />
            ) : selectedTemplate.type === AttributeType.BOOLEAN ? (
              <Select
                value={value}
                onChange={setValue}
                options={[
                  { label: 'Có', value: 'true' },
                  { label: 'Không', value: 'false' },
                ]}
              />
            ) : (
              <div className="flex gap-2">
                <input
                  type={
                    selectedTemplate.type === AttributeType.NUMBER
                      ? 'number'
                      : 'text'
                  }
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="Nhập giá trị"
                />
                {selectedTemplate.unit && (
                  <span className="flex items-center px-3 text-gray-500 bg-gray-50 border border-gray-300 rounded-lg">
                    {selectedTemplate.unit}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={!selectedTemplate || !value.trim()}>
            Thêm
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const VariantModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  attributeTemplates: CategoryAttributeTemplate[];
  onAdd: (variant: CreateProductVariantRequest) => void;
}> = ({ isOpen, onClose, attributeTemplates, onAdd }) => {
  const { values, handleChange, handleSubmit, resetForm, setFieldValue } =
    useForm<CreateProductVariantRequest>({
      initialValues: {
        name: '',
        price: 0,
        quantity: 0,
        attributes: [],
        images: [],
      },
      onSubmit: (data) => {
        onAdd(data);
        resetForm();
        onClose();
      },
    });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm biến thể" size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Tên biến thể"
          name="name"
          value={values.name || ''}
          onChange={handleChange}
          placeholder="VD: Áo sơ mi đỏ size M"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Giá (VND)"
            name="price"
            type="number"
            min="0"
            step="1000"
            value={values.price || 0}
            onChange={handleChange}
          />
          <Input
            label="Số lượng"
            name="quantity"
            type="number"
            min="0"
            value={values.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thuộc tính biến thể
          </label>
          <div className="space-y-3">
            {attributeTemplates.map((template) => (
              <div key={template.id}>
                <label className="block text-sm text-gray-600 mb-1">
                  {template.name}
                </label>
                {template.options ? (
                  <Select
                    value={
                      values.attributes.find(
                        (attr) => attr.key === template.key,
                      )?.value || ''
                    }
                    onChange={(value) => {
                      const newAttributes = values.attributes.filter(
                        (attr) => attr.key !== template.key,
                      );
                      if (value) {
                        newAttributes.push({ key: template.key, value });
                      }
                      setFieldValue('attributes', newAttributes);
                    }}
                    options={template.options.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    placeholder={`Chọn ${template.name.toLowerCase()}`}
                  />
                ) : (
                  <input
                    type="text"
                    value={
                      values.attributes.find(
                        (attr) => attr.key === template.key,
                      )?.value || ''
                    }
                    onChange={(e) => {
                      const newAttributes = values.attributes.filter(
                        (attr) => attr.key !== template.key,
                      );
                      if (e.target.value) {
                        newAttributes.push({
                          key: template.key,
                          value: e.target.value,
                        });
                      }
                      setFieldValue('attributes', newAttributes);
                    }}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    placeholder={`Nhập ${template.name.toLowerCase()}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit">Thêm biến thể</Button>
        </div>
      </form>
    </Modal>
  );
};
