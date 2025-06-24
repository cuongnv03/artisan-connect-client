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
  ChatBubbleLeftRightIcon,
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
  'vintage',
  'hiện đại',
];

const SPECIFICATION_SUGGESTIONS = [
  { key: 'Chất liệu', value: '' },
  { key: 'Xuất xứ', value: 'Việt Nam' },
  { key: 'Bảo hành', value: '12 tháng' },
  { key: 'Hướng dẫn bảo quản', value: '' },
  { key: 'Màu sắc', value: '' },
  { key: 'Kích thước', value: '' },
  { key: 'Độ bền', value: '' },
  { key: 'Khối lượng', value: '' },
];

const CUSTOM_FIELD_SUGGESTIONS = [
  { key: 'Thời gian thủ công', value: '' },
  { key: 'Độ khó chế tác', value: 'Trung bình' },
  { key: 'Dịp sử dụng', value: '' },
  { key: 'Phong cách', value: '' },
  { key: 'Đối tượng', value: '' },
  { key: 'Công dụng', value: '' },
  { key: 'Nguồn cảm hứng', value: '' },
  { key: 'Kỹ thuật chế tác', value: '' },
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
  const [hasVariants, setHasVariants] = useState(false);

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
    // Fix dimensions handling
    dimensionLength: product?.dimensions?.length || 0,
    dimensionWidth: product?.dimensions?.width || 0,
    dimensionHeight: product?.dimensions?.height || 0,
    dimensionUnit: product?.dimensions?.unit || 'cm',
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
    } else if (values.name.length > 200) {
      errors.name = 'Tên sản phẩm không được vượt quá 200 ký tự';
    }

    if (!values.description?.trim()) {
      errors.description = 'Mô tả sản phẩm là bắt buộc';
    } else if (values.description.length < 20) {
      errors.description =
        'Mô tả phải có ít nhất 20 ký tự để khách hàng hiểu rõ sản phẩm';
    } else if (values.description.length > 2000) {
      errors.description = 'Mô tả không được vượt quá 2000 ký tự';
    }

    if (!values.price || values.price <= 0) {
      errors.price = 'Giá sản phẩm phải lớn hơn 0';
    }

    if (values.discountPrice && values.discountPrice >= values.price) {
      errors.discountPrice = 'Giá khuyến mãi phải nhỏ hơn giá gốc';
    }

    // NEW: Validate quantity vs variants
    if (hasVariants) {
      const totalVariantQuantity = variants.reduce(
        (sum, variant) => sum + (variant.quantity || 0),
        0,
      );
      if (totalVariantQuantity !== values.quantity) {
        errors.quantity = `Tổng số lượng biến thể (${totalVariantQuantity}) phải bằng số lượng tồn kho (${values.quantity})`;
      }
    } else {
      if (values.quantity !== undefined && values.quantity < 0) {
        errors.quantity = 'Số lượng không được âm';
      }
    }

    if (!values.categoryIds?.length) {
      errors.categoryIds =
        'Phải chọn ít nhất một danh mục để khách hàng dễ tìm kiếm';
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
          allowNegotiation: data.allowNegotiation ?? true,
          images: allImages,
          featuredImage: allImages[0],
          tags,
          categoryIds: data.categoryIds,
          seoTitle: data.seoTitle || undefined,
          seoDescription: data.seoDescription || undefined,
          // NEW: Only include product-level attributes if no variants
          attributes: hasVariants ? null : productAttributes,
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
      setHasVariants(product.hasVariants || false); // NEW: Set hasVariants from product
    }
  }, [product, mode]);

  // NEW: Update hasVariants when variants change
  useEffect(() => {
    setHasVariants(variants.length > 0);
  }, [variants]);

  // NEW: Validate total quantity when variants change
  useEffect(() => {
    if (hasVariants && variants.length > 0) {
      const totalVariantQuantity = variants.reduce(
        (sum, variant) => sum + (variant.quantity || 0),
        0,
      );
      if (totalVariantQuantity !== values.quantity) {
        // Auto-update total quantity to match variants
        setFieldValue('quantity', totalVariantQuantity);
      }
    }
  }, [variants, hasVariants]);

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = values.categoryIds || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];
    setFieldValue('categoryIds', newCategories);
  };

  const handleAddTag = (tag?: string) => {
    const tagToAdd = tag || newTag.trim();
    if (tagToAdd && !tags.includes(tagToAdd) && tags.length < 10) {
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

  // NEW: Handle creating first variant from current attributes
  const handleCreateFirstVariant = () => {
    if (Object.keys(productAttributes).length === 0) {
      showError('Vui lòng nhập thuộc tính sản phẩm trước khi tạo biến thể');
      return;
    }

    const firstVariant = {
      name: 'Biến thể mặc định',
      price: values.price,
      discountPrice: values.discountPrice || 0,
      quantity: values.quantity,
      images: [],
      weight: values.weight || 0,
      attributes: { ...productAttributes }, // Copy current attributes
      isActive: true,
      isDefault: true,
      sortOrder: 0,
    };

    setVariants([firstVariant]);
    setHasVariants(true);
  };

  const discountPercent =
    values.discountPrice && values.price
      ? Math.round(((values.price - values.discountPrice) / values.price) * 100)
      : 0;

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Section */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <InformationCircleIcon className="w-6 h-6 text-primary mr-3" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {mode === 'create'
                    ? 'Tạo sản phẩm mới'
                    : 'Chỉnh sửa sản phẩm'}
                </h3>
                <p className="text-sm text-gray-600">
                  {mode === 'create'
                    ? 'Tạo sản phẩm thủ công độc đáo và bắt mắt để thu hút khách hàng'
                    : 'Cập nhật thông tin sản phẩm để tăng hiệu quả bán hàng'}
                </p>
              </div>
            </div>
            {mode === 'create' && (
              <div className="flex items-center gap-3">
                <Toggle
                  checked={saveAsPublished}
                  onChange={setSaveAsPublished}
                />
                <span className="text-sm font-medium text-gray-700">
                  {saveAsPublished ? 'Đăng bán ngay' : 'Lưu nháp'}
                </span>
              </div>
            )}
          </div>
        </Card>

        {/* Main Content - Improved 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <CubeIcon className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Thông tin cơ bản
                </h3>
              </div>

              <div className="space-y-6">
                <Input
                  name="name"
                  label="Tên sản phẩm"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name ? errors.name : undefined}
                  required
                  placeholder="VD: Bình gốm sứ Bát Tràng thủ công cao cấp"
                  helperText="Tên ngắn gọn, mô tả chính xác sản phẩm. Tối đa 200 ký tự."
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    name="sku"
                    label="Mã SKU (tùy chọn)"
                    value={values.sku}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Để trống sẽ tự động tạo"
                    helperText="Mã định danh sản phẩm duy nhất"
                  />

                  <Input
                    name="barcode"
                    label="Mã vạch (tùy chọn)"
                    value={values.barcode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="VD: 1234567890123"
                    helperText="Mã vạch nếu có"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả sản phẩm <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    rows={6}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Mô tả chi tiết về sản phẩm: chất liệu, kích thước, cách sử dụng, điểm đặc biệt, câu chuyện đằng sau sản phẩm..."
                    className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary resize-none ${
                      touched.description && errors.description
                        ? 'border-red-300'
                        : ''
                    }`}
                  />
                  <div className="flex justify-between mt-2">
                    {touched.description && errors.description && (
                      <p className="text-sm text-red-600">
                        {errors.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 ml-auto">
                      {values.description?.length || 0}/2000 ký tự
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Mô tả càng chi tiết càng thu hút khách hàng. Nên có ít
                    nhất 20 ký tự.
                  </p>
                </div>
              </div>
            </Card>

            {/* Images */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <PhotoIcon className="w-5 h-5 text-primary mr-2" />
                  <h3 className="font-semibold text-gray-900">
                    Hình ảnh sản phẩm
                  </h3>
                </div>
                <Badge variant="secondary" size="sm">
                  {existingImages.length + imageFiles.length}/10
                </Badge>
              </div>

              <div className="space-y-4">
                {/* Existing Images */}
                {mode === 'edit' && existingImages.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Hình ảnh hiện tại
                    </h4>
                    <div className="grid grid-cols-4 gap-3">
                      {existingImages.map((imageUrl, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square"
                        >
                          <img
                            src={imageUrl}
                            alt={`${index + 1}`}
                            className="w-full h-full object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(imageUrl)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs">
                              Ảnh chính
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {mode === 'edit' ? 'Thêm hình ảnh mới' : 'Tải lên hình ảnh'}
                  </h4>
                  <FileUpload
                    files={imageFiles}
                    onFilesChange={setImageFiles}
                    accept="image"
                    multiple
                    maxFiles={10}
                    maxSize={5}
                  />
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-xs font-medium text-blue-900 mb-1">
                      💡 Mẹo chụp ảnh sản phẩm đẹp:
                    </h5>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>
                        • Chụp trong ánh sáng tự nhiên, tránh ánh sáng vàng
                      </li>
                      <li>
                        • Chụp từ nhiều góc độ: mặt trước, sau, bên, chi tiết
                      </li>
                      <li>
                        • Ảnh đầu tiên sẽ là ảnh chính hiển thị trong danh sách
                      </li>
                      <li>• Độ phân giải cao, rõ nét, không bị mờ</li>
                    </ul>
                  </div>
                </div>

                {touched.images && errors.images && (
                  <p className="text-sm text-red-600">{errors.images}</p>
                )}
              </div>
            </Card>

            {/* Attributes - Only show if no variants */}
            {!hasVariants && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <SwatchIcon className="w-5 h-5 text-primary mr-2" />
                    <h3 className="font-semibold text-gray-900">
                      Thuộc tính sản phẩm
                    </h3>
                  </div>
                  {/* NEW: Button to create variants */}
                  {Object.keys(productAttributes).length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCreateFirstVariant}
                    >
                      Tạo biến thể từ thuộc tính
                    </Button>
                  )}
                </div>

                <ProductAttributesForm
                  categoryIds={values.categoryIds || []}
                  attributes={productAttributes}
                  onAttributesChange={setProductAttributes}
                />
              </Card>
            )}

            {/* Specifications */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Thông số kỹ thuật
                </h3>
              </div>

              <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600">
                  Thêm các thông số kỹ thuật chi tiết giúp khách hàng hiểu rõ
                  hơn về sản phẩm (chất liệu, kích thước, xuất xứ, bảo hành...)
                </p>
              </div>

              <DynamicFieldsEditor
                title="Thông số kỹ thuật"
                fields={specifications}
                onFieldsChange={setSpecifications}
                placeholder={{ key: 'Tên thông số', value: 'Giá trị' }}
                suggestions={SPECIFICATION_SUGGESTIONS}
              />
            </Card>

            {/* Custom Fields */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <SparklesIcon className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Thông tin đặc biệt
                </h3>
              </div>

              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-xs text-amber-800">
                  Thêm những thông tin đặc biệt làm nổi bật sản phẩm của bạn
                  (câu chuyện, cảm hứng, kỹ thuật đặc biệt...)
                </p>
              </div>

              <DynamicFieldsEditor
                title="Thông tin đặc biệt"
                fields={customFields}
                onFieldsChange={setCustomFields}
                placeholder={{ key: 'Tên trường', value: 'Nội dung' }}
                suggestions={CUSTOM_FIELD_SUGGESTIONS}
              />
            </Card>

            {/* Variants - Only show if enabled */}
            {(hasVariants || values.categoryIds?.length > 0) && (
              <Card className="p-6">
                <div className="flex items-center mb-6">
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

                <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-xs text-purple-800">
                    Tạo các phiên bản khác nhau của sản phẩm (màu sắc, kích
                    thước, chất liệu...) để khách hàng có nhiều lựa chọn.
                    {hasVariants && (
                      <span className="block mt-1 font-medium">
                        ⚠️ Khi có biến thể, thuộc tính sẽ được quản lý ở từng
                        biến thể riêng biệt.
                      </span>
                    )}
                  </p>
                </div>

                <ProductVariantManager
                  variants={variants}
                  onVariantsChange={setVariants}
                  basePrice={values.price || 0}
                  baseDiscountPrice={values.discountPrice || undefined} // NEW: Pass base discount price
                  baseWeight={values.weight || undefined} // NEW: Pass base weight
                  categoryIds={values.categoryIds || []}
                  currentAttributes={productAttributes}
                />
              </Card>
            )}
          </div>

          {/* Right Column - Pricing & Settings (1/3 width) */}
          <div className="lg:col-span-1 space-y-8">
            {/* Pricing */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <CurrencyDollarIcon className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-900">Giá & Kho hàng</h3>
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
                  placeholder="100000"
                  helperText="Giá bán cho khách hàng"
                />

                <Input
                  name="discountPrice"
                  label="Giá khuyến mãi (₫)"
                  type="number"
                  value={values.discountPrice || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.discountPrice ? errors.discountPrice : undefined
                  }
                  placeholder="80000"
                  helperText="Giá sau khi giảm (nếu có)"
                />

                {discountPercent > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm font-medium">
                      💰 Khách hàng tiết kiệm {discountPercent}%
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    name="quantity"
                    label={hasVariants ? 'Tổng tồn kho' : 'Số lượng tồn kho'}
                    type="number"
                    value={values.quantity || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.quantity ? errors.quantity : undefined}
                    required
                    placeholder="10"
                    helperText={
                      hasVariants
                        ? 'Sẽ được phân bổ cho các biến thể'
                        : 'Số lượng hiện có'
                    }
                    disabled={hasVariants} // NEW: Disable when has variants
                  />

                  <Input
                    name="minOrderQty"
                    label="Đặt hàng tối thiểu"
                    type="number"
                    value={values.minOrderQty || ''}
                    onChange={handleChange}
                    placeholder="1"
                    helperText="Số lượng tối thiểu mỗi đơn"
                  />
                </div>

                <Input
                  name="maxOrderQty"
                  label="Đặt hàng tối đa (tùy chọn)"
                  type="number"
                  value={values.maxOrderQty || ''}
                  onChange={handleChange}
                  placeholder="Để trống = không giới hạn"
                  helperText="Số lượng tối đa mỗi đơn"
                />

                {/* NEW: Show variant quantity breakdown */}
                {hasVariants && variants.length > 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <h5 className="text-xs font-medium text-blue-900 mb-2">
                      Phân bổ tồn kho theo biến thể:
                    </h5>
                    <div className="space-y-1">
                      {variants.map((variant, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-xs text-blue-800"
                        >
                          <span>{variant.name || `Biến thể ${index + 1}`}</span>
                          <span>{variant.quantity || 0} sp</span>
                        </div>
                      ))}
                      <div className="border-t border-blue-300 pt-1 flex justify-between text-xs font-medium text-blue-900">
                        <span>Tổng:</span>
                        <span>
                          {variants.reduce(
                            (sum, v) => sum + (v.quantity || 0),
                            0,
                          )}{' '}
                          sp
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Categories */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <TagIcon className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Danh mục sản phẩm
                </h3>
              </div>

              <div className="space-y-4">
                {values.categoryIds && values.categoryIds.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Đã chọn:</p>
                    <div className="flex flex-wrap gap-2">
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
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Chọn danh mục (tối đa 5):
                  </p>
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    <div className="p-3 space-y-2">
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center p-2 rounded cursor-pointer hover:bg-gray-50 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={(values.categoryIds || []).includes(
                              category.id,
                            )}
                            onChange={() => handleCategoryToggle(category.id)}
                            disabled={
                              (values.categoryIds || []).length >= 5 &&
                              !(values.categoryIds || []).includes(category.id)
                            }
                            className="mr-3 text-primary focus:ring-primary rounded"
                          />
                          {category.name}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {touched.categoryIds && errors.categoryIds && (
                  <p className="text-sm text-red-600">{errors.categoryIds}</p>
                )}
              </div>
            </Card>

            {/* Physical Properties */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <ScaleIcon className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-900">
                  Thông tin vật lý
                </h3>
              </div>

              <div className="space-y-4">
                <Input
                  name="weight"
                  label="Trọng lượng (kg)"
                  type="number"
                  step="0.1"
                  value={values.weight || ''}
                  onChange={handleChange}
                  placeholder="0.5"
                  helperText="Giúp tính phí vận chuyển"
                />

                {/* Dimensions Section */}
                <div>
                  <div className="flex items-center mb-3">
                    <ArrowsRightLeftIcon className="w-4 h-4 text-gray-500 mr-2" />
                    <label className="text-sm font-medium text-gray-700">
                      Kích thước (để tính phí ship)
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

                {/* Business Settings */}
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">
                        Cho phép thương lượng giá
                      </span>
                      <p className="text-xs text-gray-500">
                        Khách hàng có thể gửi yêu cầu thương lượng
                      </p>
                    </div>
                    <Toggle
                      checked={values.allowNegotiation}
                      onChange={(checked) =>
                        setFieldValue('allowNegotiation', checked)
                      }
                    />
                  </div>

                  {values.allowNegotiation && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center text-green-800">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 mr-2" />
                        <span className="text-xs">
                          Sản phẩm sẽ hiển thị "Có thể thương lượng" và có tab
                          thương lượng
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Shipping */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <TruckIcon className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-900">Vận chuyển</h3>
              </div>

              <div className="space-y-4">
                <Input
                  name="shippingTime"
                  label="Thời gian giao hàng"
                  value={values.shippingTime}
                  onChange={handleChange}
                  placeholder="VD: 3-5 ngày"
                  helperText="Thời gian dự kiến giao hàng"
                />

                <Input
                  name="shippingCost"
                  label="Phí vận chuyển (₫)"
                  type="number"
                  value={values.shippingCost || ''}
                  onChange={handleChange}
                  placeholder="30000"
                  helperText="Phí ship cố định"
                />

                <Input
                  name="freeShippingThreshold"
                  label="Miễn phí ship từ (₫)"
                  type="number"
                  value={values.freeShippingThreshold || ''}
                  onChange={handleChange}
                  placeholder="500000"
                  helperText="Giá trị đơn hàng để miễn phí ship"
                />
              </div>
            </Card>

            {/* Tags & SEO */}
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <DocumentTextIcon className="w-5 h-5 text-primary mr-2" />
                <h3 className="font-semibold text-gray-900">Thẻ & SEO</h3>
              </div>

              <div className="space-y-6">
                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Thẻ sản phẩm</h4>
                    <Badge variant="secondary" size="sm">
                      {tags.length}/10
                    </Badge>
                  </div>

                  <div className="mb-3">
                    <p className="text-xs text-gray-600 mb-2">
                      Gợi ý phổ biến:
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {SUGGESTED_TAGS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleAddTag(tag)}
                          disabled={tags.includes(tag) || tags.length >= 10}
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
                        e.key === 'Enter' &&
                        (e.preventDefault(), handleAddTag())
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
                      helperText={`${values.seoTitle?.length || 0}/60 ký tự`}
                      placeholder="Tiêu đề hiển thị trên Google"
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
                        placeholder="Mô tả ngắn hiển thị trên Google"
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {values.seoDescription?.length || 0}/160 ký tự
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 justify-end bg-gray-50 p-6 rounded-lg sticky bottom-0 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || uploading}
          >
            Hủy bỏ
          </Button>

          <Button
            type="submit"
            loading={isSubmitting || uploading}
            className="min-w-[160px]"
          >
            {submitLabel ||
              (mode === 'create'
                ? saveAsPublished
                  ? 'Tạo và đăng bán'
                  : 'Lưu nháp'
                : 'Cập nhật sản phẩm')}
          </Button>
        </div>

        {/* Loading Overlay */}
        {uploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg text-center max-w-sm mx-4">
              <LoadingSpinner size="lg" />
              <p className="mt-4 font-medium">Đang tải ảnh...</p>
              <p className="text-sm text-gray-600">Vui lòng đợi...</p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
