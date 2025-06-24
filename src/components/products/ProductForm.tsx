import React, { useState, useEffect } from 'react';
import {
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  SwatchIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  SparklesIcon,
  TruckIcon,
  ScaleIcon,
  CubeIcon,
  ArrowsRightLeftIcon,
} from '@heroicons/react/24/outline';
import { useForm } from '../../hooks/common/useForm';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FileUpload } from '../common/FileUpload';
import { Toggle } from '../ui/Toggle';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { ProductVariantManager } from './ProductVariantManager';
import { ProductAttributesForm } from './ProductAttributesForm';
import { DynamicFieldsEditor } from './DynamicFieldsEditor';
import { useCategories } from '../../hooks/products/useCategories';
import { useToastContext } from '../../contexts/ToastContext';
import { uploadService } from '../../services/upload.service';
import {
  CreateProductRequest,
  UpdateProductRequest,
  Product,
  ProductStatus,
} from '../../types/product';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (
    data: CreateProductRequest | UpdateProductRequest,
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  mode: 'create' | 'edit';
}

const SUGGESTED_TAGS = [
  'handmade',
  'thủ công',
  'độc đáo',
  'truyền thống',
  'việt nam',
  'nghệ thuật',
  'tự nhiên',
  'eco-friendly',
];

const SPECIFICATION_SUGGESTIONS = [
  { key: 'Chất liệu', value: '' },
  { key: 'Xuất xứ', value: 'Việt Nam' },
  { key: 'Bảo hành', value: '12 tháng' },
  { key: 'Hướng dẫn bảo quản', value: '' },
  { key: 'Màu sắc', value: '' },
  { key: 'Kích thước', value: '' },
];

const CUSTOM_FIELD_SUGGESTIONS = [
  { key: 'Thời gian thủ công', value: '' },
  { key: 'Độ khó', value: 'Trung bình' },
  { key: 'Dịp sử dụng', value: '' },
  { key: 'Phong cách', value: '' },
  { key: 'Đối tượng', value: '' },
  { key: 'Công dụng', value: '' },
];

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel,
  mode,
}) => {
  const { success, error: showError } = useToastContext();
  const { categories } = useCategories();

  // Form states
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [variants, setVariants] = useState<any[]>([]);
  const [productAttributes, setProductAttributes] = useState<
    Record<string, any>
  >({});
  const [specifications, setSpecifications] = useState<Record<string, any>>({});
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [saveAsPublished, setSaveAsPublished] = useState(false);

  const initialValues = {
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    discountPrice: product?.discountPrice || 0,
    quantity: product?.quantity || 0,
    minOrderQty: product?.minOrderQty || 1,
    maxOrderQty: product?.maxOrderQty || 0,
    sku: product?.sku || '',
    barcode: product?.barcode || '',
    weight: product?.weight || 0,
    // Fix dimensions - should be object, not number
    dimensionLength: product?.dimensions?.length || 0,
    dimensionWidth: product?.dimensions?.width || 0,
    dimensionHeight: product?.dimensions?.height || 0,
    dimensionUnit: product?.dimensions?.unit || 'cm',
    isCustomizable: product?.isCustomizable || false,
    allowNegotiation: product?.allowNegotiation ?? true,
    categoryIds: product?.categories?.map((cat) => cat.id) || [],
    seoTitle: product?.seoTitle || '',
    seoDescription: product?.seoDescription || '',

    // Shipping fields
    shippingTime: product?.shippingInfo?.estimatedDays || '',
    shippingCost: product?.shippingInfo?.cost || 0,
    freeShippingThreshold: product?.shippingInfo?.freeThreshold || 0,
  };

  const validate = (values: any) => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) {
      errors.name = 'Tên sản phẩm là bắt buộc';
    } else if (values.name.length < 3) {
      errors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự';
    }

    if (!values.description?.trim()) {
      errors.description = 'Mô tả sản phẩm là bắt buộc';
    } else if (values.description.length < 20) {
      errors.description = 'Mô tả phải có ít nhất 20 ký tự';
    }

    if (!values.price || values.price <= 0) {
      errors.price = 'Giá sản phẩm phải lớn hơn 0';
    }

    if (values.discountPrice && values.discountPrice >= values.price) {
      errors.discountPrice = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
    }

    if (values.quantity !== undefined && values.quantity < 0) {
      errors.quantity = 'Số lượng không được âm';
    }

    if (!values.categoryIds?.length) {
      errors.categoryIds = 'Phải chọn ít nhất một danh mục';
    }

    if (mode === 'create' && imageFiles.length === 0) {
      errors.images = 'Phải có ít nhất một hình ảnh sản phẩm';
    }

    if (
      mode === 'edit' &&
      existingImages.length === 0 &&
      imageFiles.length === 0
    ) {
      errors.images = 'Phải có ít nhất một hình ảnh';
    }

    return errors;
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useForm({
    initialValues,
    validate,
    onSubmit: async (data) => {
      try {
        setUploading(true);

        // Upload new images
        let newImageUrls: string[] = [];
        if (imageFiles.length > 0) {
          const uploads = await Promise.all(
            imageFiles.map((file) =>
              uploadService.uploadImage(file, { folder: 'products' }),
            ),
          );
          newImageUrls = uploads.map((upload) => upload.url);
        }

        const allImages = [...existingImages, ...newImageUrls];

        // Prepare dimensions object
        const dimensionsData = {
          length: data.dimensionLength || null,
          width: data.dimensionWidth || null,
          height: data.dimensionHeight || null,
          unit: data.dimensionUnit || 'cm',
        };

        // Only include dimensions if at least one value is provided
        const hasDimensions =
          dimensionsData.length ||
          dimensionsData.width ||
          dimensionsData.height;

        // Prepare shipping info
        const shippingData: any = {};
        if (data.shippingTime) shippingData.estimatedDays = data.shippingTime;
        if (data.shippingCost) shippingData.cost = data.shippingCost;
        if (data.freeShippingThreshold)
          shippingData.freeThreshold = data.freeShippingThreshold;

        const productData: CreateProductRequest | UpdateProductRequest = {
          name: data.name,
          description: data.description,
          price: Number(data.price),
          discountPrice: data.discountPrice ? Number(data.discountPrice) : null,
          quantity: Number(data.quantity),
          minOrderQty: Number(data.minOrderQty) || 1,
          maxOrderQty: data.maxOrderQty ? Number(data.maxOrderQty) : null,
          sku: data.sku || undefined,
          barcode: data.barcode || undefined,
          weight: data.weight ? Number(data.weight) : null,
          dimensions: hasDimensions ? dimensionsData : null,
          isCustomizable: data.isCustomizable || false,
          allowNegotiation: data.allowNegotiation ?? true,
          images: allImages,
          featuredImage: allImages[0],
          tags,
          categoryIds: data.categoryIds,
          seoTitle: data.seoTitle || undefined,
          seoDescription: data.seoDescription || undefined,
          attributes: productAttributes,
          specifications:
            Object.keys(specifications).length > 0 ? specifications : null,
          customFields:
            Object.keys(customFields).length > 0 ? customFields : null,
          shippingInfo:
            Object.keys(shippingData).length > 0 ? shippingData : null,
          variants: variants.length > 0 ? variants : undefined,
        };

        // Add status for create mode
        if (mode === 'create') {
          (productData as CreateProductRequest).status = saveAsPublished
            ? ProductStatus.PUBLISHED
            : ProductStatus.DRAFT;
        }

        await onSubmit(productData);
      } catch (err: any) {
        showError(
          err.message ||
            `Không thể ${mode === 'create' ? 'tạo' : 'cập nhật'} sản phẩm`,
        );
      } finally {
        setUploading(false);
      }
    },
  });

  // Initialize form when product loads (edit mode)
  useEffect(() => {
    if (product && mode === 'edit') {
      setExistingImages(product.images || []);
      setTags(product.tags || []);
      setVariants(product.variants || []);
      setProductAttributes(product.attributes || {});
      setSpecifications(product.specifications || {});
      setCustomFields(product.customFields || {});
    }
  }, [product, mode]);

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = values.categoryIds || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];
    setFieldValue('categoryIds', newCategories);
  };

  const handleAddTag = (tag?: string) => {
    const tagToAdd = tag || newTag.trim();
    if (tagToAdd && !tags.includes(tagToAdd)) {
      setTags([...tags, tagToAdd]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter((url) => url !== imageUrl));
  };

  const generateSEO = () => {
    if (values.name && values.description) {
      setFieldValue('seoTitle', values.name);
      setFieldValue('seoDescription', values.description.substring(0, 160));
      success('Đã tự động tạo thông tin SEO');
    }
  };

  const discountPercent =
    values.discountPrice && values.price
      ? Math.round(((values.price - values.discountPrice) / values.price) * 100)
      : 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header Section */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <InformationCircleIcon className="w-6 h-6 text-primary mr-3" />
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Thông tin sản phẩm
              </h3>
              <p className="text-sm text-gray-600">
                Tạo sản phẩm thủ công độc đáo của bạn
              </p>
            </div>
          </div>
          {mode === 'create' && (
            <div className="flex items-center gap-3">
              <Toggle checked={saveAsPublished} onChange={setSaveAsPublished} />
              <span className="text-sm font-medium text-gray-700">
                {saveAsPublished ? 'Đăng bán ngay' : 'Lưu nháp'}
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Main Content - Improved Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left Column - Basic Info & Images */}
        <div className="xl:col-span-3 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <CubeIcon className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">Thông tin cơ bản</h3>
            </div>

            <div className="space-y-4">
              <Input
                name="name"
                label="Tên sản phẩm"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name ? errors.name : undefined}
                required
                placeholder="VD: Bình gốm sứ Bát Tràng thủ công..."
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="sku"
                  label="Mã SKU"
                  value={values.sku}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tự động tạo"
                />

                <Input
                  name="barcode"
                  label="Mã vạch"
                  value={values.barcode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tùy chọn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả sản phẩm <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={5}
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Mô tả chi tiết về sản phẩm, chất liệu, kích thước, cách sử dụng..."
                  className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary resize-none ${
                    touched.description && errors.description
                      ? 'border-red-300'
                      : ''
                  }`}
                />
                <div className="flex justify-between mt-1">
                  {touched.description && errors.description && (
                    <p className="text-sm text-red-600">{errors.description}</p>
                  )}
                  <p className="text-xs text-gray-500 ml-auto">
                    {values.description?.length || 0}/2000
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <PhotoIcon className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-900">Hình ảnh</h3>
              </div>
              <Badge variant="secondary" size="sm">
                {existingImages.length + imageFiles.length}/10
              </Badge>
            </div>

            <div className="space-y-4">
              {/* Existing Images */}
              {mode === 'edit' && existingImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative group aspect-square">
                      <img
                        src={imageUrl}
                        alt={`${index + 1}`}
                        className="w-full h-full object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(imageUrl)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                      {index === 0 && (
                        <div className="absolute top-1 left-1 bg-primary text-white px-1 py-0.5 rounded text-xs">
                          Chính
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <FileUpload
                files={imageFiles}
                onFilesChange={setImageFiles}
                accept="image"
                multiple
                maxFiles={10}
                maxSize={5}
              />

              {touched.images && errors.images && (
                <p className="text-sm text-red-600">{errors.images}</p>
              )}
            </div>
          </Card>

          {/* Attributes */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <SwatchIcon className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">
                Thuộc tính sản phẩm
              </h3>
            </div>

            <ProductAttributesForm
              categoryIds={values.categoryIds || []}
              attributes={productAttributes}
              onAttributesChange={setProductAttributes}
            />
          </Card>
        </div>

        {/* Right Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Pricing */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <CurrencyDollarIcon className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">Giá & Kho</h3>
            </div>

            <div className="space-y-4">
              <Input
                name="price"
                label="Giá bán (₫)"
                type="number"
                value={values.price || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.price ? errors.price : undefined}
                required
              />

              <Input
                name="discountPrice"
                label="Giá khuyến mãi"
                type="number"
                value={values.discountPrice || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.discountPrice ? errors.discountPrice : undefined}
              />

              {discountPercent > 0 && (
                <div className="bg-green-50 border border-green-200 rounded p-2">
                  <p className="text-green-800 text-sm">
                    💰 Giảm {discountPercent}%
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Input
                  name="quantity"
                  label="Số lượng"
                  type="number"
                  value={values.quantity || ''}
                  onChange={handleChange}
                  required
                />

                <Input
                  name="minOrderQty"
                  label="Đặt tối thiểu"
                  type="number"
                  value={values.minOrderQty || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </Card>

          {/* Categories */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <TagIcon className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">Danh mục</h3>
            </div>

            <div className="space-y-3">
              {values.categoryIds && values.categoryIds.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {values.categoryIds.map((categoryId) => {
                    const category = categories.find(
                      (cat) => cat.id === categoryId,
                    );
                    return category ? (
                      <Badge
                        key={categoryId}
                        variant="primary"
                        size="sm"
                        className="cursor-pointer"
                        onClick={() => handleCategoryToggle(categoryId)}
                      >
                        {category.name} ×
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              <div className="max-h-40 overflow-y-auto border rounded">
                <div className="p-2 space-y-1">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center p-1 rounded cursor-pointer hover:bg-gray-50 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={(values.categoryIds || []).includes(
                          category.id,
                        )}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="mr-2 text-primary focus:ring-primary rounded"
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>

              {touched.categoryIds && errors.categoryIds && (
                <p className="text-sm text-red-600">{errors.categoryIds}</p>
              )}
            </div>
          </Card>

          {/* Physical Properties */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <ScaleIcon className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">Thuộc tính vật lý</h3>
            </div>

            <div className="space-y-4">
              <Input
                name="weight"
                label="Trọng lượng (kg)"
                type="number"
                step="0.1"
                value={values.weight || ''}
                onChange={handleChange}
              />

              {/* Dimensions Section */}
              <div>
                <div className="flex items-center mb-3">
                  <ArrowsRightLeftIcon className="w-4 h-4 text-gray-500 mr-2" />
                  <label className="text-sm font-medium text-gray-700">
                    Kích thước
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input
                    name="dimensionLength"
                    label="Dài"
                    type="number"
                    step="0.1"
                    value={values.dimensionLength || ''}
                    onChange={handleChange}
                    placeholder="0"
                  />
                  <Input
                    name="dimensionWidth"
                    label="Rộng"
                    type="number"
                    step="0.1"
                    value={values.dimensionWidth || ''}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="dimensionHeight"
                    label="Cao"
                    type="number"
                    step="0.1"
                    value={values.dimensionHeight || ''}
                    onChange={handleChange}
                    placeholder="0"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Đơn vị
                    </label>
                    <select
                      name="dimensionUnit"
                      value={values.dimensionUnit}
                      onChange={handleChange}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    >
                      <option value="cm">cm</option>
                      <option value="m">m</option>
                      <option value="mm">mm</option>
                      <option value="inch">inch</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Cho phép tùy chỉnh
                  </span>
                  <Toggle
                    checked={values.isCustomizable}
                    onChange={(checked) =>
                      setFieldValue('isCustomizable', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Cho phép thương lượng
                  </span>
                  <Toggle
                    checked={values.allowNegotiation}
                    onChange={(checked) =>
                      setFieldValue('allowNegotiation', checked)
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Shipping */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <TruckIcon className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">Vận chuyển</h3>
            </div>

            <div className="space-y-4">
              <Input
                name="shippingTime"
                label="Thời gian giao (ngày)"
                value={values.shippingTime}
                onChange={handleChange}
                placeholder="VD: 3-5"
              />

              <Input
                name="shippingCost"
                label="Phí ship (₫)"
                type="number"
                value={values.shippingCost || ''}
                onChange={handleChange}
              />

              <Input
                name="freeShippingThreshold"
                label="Miễn phí ship từ (₫)"
                type="number"
                value={values.freeShippingThreshold || ''}
                onChange={handleChange}
              />
            </div>
          </Card>
        </div>
      </div>

      {/* Full Width Sections */}
      <div className="space-y-6">
        {/* Dynamic Specifications */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-semibold text-gray-900">Thông số kỹ thuật</h3>
          </div>

          <DynamicFieldsEditor
            title="Thông số kỹ thuật"
            fields={specifications}
            onFieldsChange={setSpecifications}
            placeholder={{ key: 'Tên thông số', value: 'Giá trị' }}
            suggestions={SPECIFICATION_SUGGESTIONS}
          />
        </Card>

        {/* Dynamic Custom Fields */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <SparklesIcon className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-semibold text-gray-900">Thông tin bổ sung</h3>
          </div>

          <DynamicFieldsEditor
            title="Thông tin bổ sung"
            fields={customFields}
            onFieldsChange={setCustomFields}
            placeholder={{ key: 'Tên trường', value: 'Nội dung' }}
            suggestions={CUSTOM_FIELD_SUGGESTIONS}
          />
        </Card>

        {/* Variants */}
        {values.categoryIds && values.categoryIds.length > 0 && (
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Cog6ToothIcon className="w-5 h-5 text-primary mr-2" />
              <h3 className="font-semibold text-gray-900">
                Biến thể sản phẩm
                {variants.length > 0 && (
                  <Badge variant="primary" size="sm" className="ml-2">
                    {variants.length}
                  </Badge>
                )}
              </h3>
            </div>

            <ProductVariantManager
              variants={variants}
              onVariantsChange={setVariants}
              basePrice={values.price || 0}
              categoryIds={values.categoryIds || []}
            />
          </Card>
        )}

        {/* Tags & SEO */}
        <Card className="p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="w-5 h-5 text-primary mr-2" />
            <h3 className="font-semibold text-gray-900">Thẻ & SEO</h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">Thẻ sản phẩm</h4>
                <Badge variant="secondary" size="sm">
                  {tags.length}/10
                </Badge>
              </div>

              <div className="mb-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  {SUGGESTED_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      disabled={tags.includes(tag)}
                      className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mb-3">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), handleAddTag())
                  }
                  placeholder="Thêm thẻ..."
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => handleAddTag()}
                  disabled={!newTag.trim() || tags.length >= 10}
                  size="sm"
                >
                  +
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      size="sm"
                      className="cursor-pointer hover:bg-gray-300"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* SEO */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">SEO</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateSEO}
                  disabled={!values.name || !values.description}
                >
                  Tự động
                </Button>
              </div>

              <div className="space-y-3">
                <Input
                  name="seoTitle"
                  label="Tiêu đề SEO"
                  value={values.seoTitle}
                  onChange={handleChange}
                  helperText={`${values.seoTitle?.length || 0}/60`}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả SEO
                  </label>
                  <textarea
                    name="seoDescription"
                    rows={3}
                    value={values.seoDescription}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {values.seoDescription?.length || 0}/160
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end bg-gray-50 p-6 rounded-lg">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || uploading}
        >
          Hủy
        </Button>

        <Button
          type="submit"
          loading={isSubmitting || uploading}
          className="min-w-[120px]"
        >
          {submitLabel ||
            (mode === 'create'
              ? saveAsPublished
                ? 'Tạo và đăng bán'
                : 'Lưu nháp'
              : 'Cập nhật')}
        </Button>
      </div>

      {/* Loading Overlay */}
      {uploading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg text-center max-w-sm mx-4">
            <LoadingSpinner size="lg" />
            <p className="mt-3 font-medium">Đang tải ảnh...</p>
          </div>
        </div>
      )}
    </form>
  );
};
