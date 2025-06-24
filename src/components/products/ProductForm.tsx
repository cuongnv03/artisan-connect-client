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

const QUICK_CATEGORIES = [
  'Đồ gốm sứ',
  'Trang sức handmade',
  'Đồ gỗ thủ công',
  'Thêu ren',
  'Tranh vẽ',
  'Đồ da thủ công',
];

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
    dimensions: product?.dimensions || {},
    isCustomizable: product?.isCustomizable || false,
    allowNegotiation: product?.allowNegotiation ?? true,
    categoryIds: product?.categories?.map((cat) => cat.id) || [],
    seoTitle: product?.seoTitle || '',
    seoDescription: product?.seoDescription || '',
    specifications: product?.specifications || {},
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

        const productData = {
          ...data,
          images: allImages,
          featuredImage: allImages[0],
          tags,
          attributes: productAttributes,
          variants: variants.length > 0 ? variants : undefined,
          status:
            mode === 'create'
              ? saveAsPublished
                ? ProductStatus.PUBLISHED
                : ProductStatus.DRAFT
              : undefined,
        };

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
    }
  }, [product, mode]);

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = values.categoryIds || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];
    setFieldValue('categoryIds', newCategories);
  };

  const handleQuickCategoryAdd = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName);
    if (category && !values.categoryIds?.includes(category.id)) {
      setFieldValue('categoryIds', [
        ...(values.categoryIds || []),
        category.id,
      ]);
    }
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <InformationCircleIcon className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
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
            placeholder="VD: Bình gốm sứ Bát Tràng thủ công..."
            className="text-lg"
          />

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
                {values.description?.length || 0}/2000 ký tự
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="sku"
              label="Mã SKU"
              value={values.sku}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tự động tạo nếu để trống"
            />

            <Input
              name="barcode"
              label="Mã vạch"
              value={values.barcode}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Tùy chọn"
            />

            <Input
              name="weight"
              label="Trọng lượng (kg)"
              type="number"
              step="0.1"
              value={values.weight || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="0.0"
            />
          </div>
        </div>
      </Card>

      {/* Images */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <PhotoIcon className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Hình ảnh sản phẩm
          </h3>
        </div>

        <div className="space-y-6">
          {/* Existing Images (Edit mode) */}
          {mode === 'edit' && existingImages.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Hình ảnh hiện tại ({existingImages.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {existingImages.map((imageUrl, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={imageUrl}
                      alt={`Sản phẩm ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(imageUrl)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                        Ảnh chính
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload new images */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
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
          </div>

          {touched.images && errors.images && (
            <p className="text-sm text-red-600">{errors.images}</p>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              💡 Mẹo chụp ảnh sản phẩm:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Sử dụng ánh sáng tự nhiên hoặc đèn LED trắng</li>
              <li>• Chụp từ nhiều góc độ khác nhau</li>
              <li>• Hiển thị chi tiết và kết cấu sản phẩm</li>
              <li>• Bao gồm ảnh sản phẩm trong môi trường sử dụng</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Pricing & Inventory */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <CurrencyDollarIcon className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Giá & Kho hàng
          </h3>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              name="price"
              label="Giá bán (₫)"
              type="number"
              value={values.price || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.price ? errors.price : undefined}
              required
              placeholder="0"
              leftIcon={<span className="text-gray-500">₫</span>}
            />

            <Input
              name="discountPrice"
              label="Giá khuyến mãi (₫)"
              type="number"
              value={values.discountPrice || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.discountPrice ? errors.discountPrice : undefined}
              placeholder="Để trống nếu không có"
              leftIcon={<span className="text-gray-500">₫</span>}
            />

            <Input
              name="quantity"
              label="Số lượng trong kho"
              type="number"
              value={values.quantity || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.quantity ? errors.quantity : undefined}
              required
              placeholder="0"
            />

            <Input
              name="minOrderQty"
              label="Số lượng đặt hàng tối thiểu"
              type="number"
              value={values.minOrderQty || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="1"
            />
          </div>

          {values.discountPrice &&
            values.discountPrice > 0 &&
            values.price > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800">
                  <p className="font-medium">Thông tin khuyến mãi:</p>
                  <p className="text-sm">
                    Giảm {discountPercent}% - Tiết kiệm{' '}
                    {(values.price - values.discountPrice).toLocaleString()}₫
                  </p>
                </div>
              </div>
            )}
        </div>
      </Card>

      {/* Categories */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <TagIcon className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Danh mục sản phẩm
          </h3>
        </div>

        <div className="space-y-6">
          {/* Quick Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Danh mục phổ biến
            </h4>
            <div className="flex flex-wrap gap-2">
              {QUICK_CATEGORIES.map((categoryName) => (
                <button
                  key={categoryName}
                  type="button"
                  onClick={() => handleQuickCategoryAdd(categoryName)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                  {categoryName}
                </button>
              ))}
            </div>
          </div>

          {/* All Categories */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Tất cả danh mục
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={(values.categoryIds || []).includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="mr-3 text-primary focus:ring-primary"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          {touched.categoryIds && errors.categoryIds && (
            <p className="text-sm text-red-600">{errors.categoryIds}</p>
          )}

          {/* Selected Categories */}
          {values.categoryIds && values.categoryIds.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Đã chọn:
              </h4>
              <div className="flex flex-wrap gap-2">
                {values.categoryIds.map((categoryId) => {
                  const category = categories.find(
                    (cat) => cat.id === categoryId,
                  );
                  return category ? (
                    <Badge
                      key={categoryId}
                      variant="primary"
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
        </div>
      </Card>

      {/* Attributes */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <SwatchIcon className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Thuộc tính sản phẩm
          </h3>
        </div>

        <ProductAttributesForm
          categoryIds={values.categoryIds || []}
          attributes={productAttributes}
          onAttributesChange={setProductAttributes}
        />
      </Card>

      {/* Variants */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <Cog6ToothIcon className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
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

      {/* Tags & SEO */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <DocumentTextIcon className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">Thẻ & SEO</h3>
        </div>

        <div className="space-y-6">
          {/* Tags */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-900">
                Thẻ sản phẩm
              </h4>
              <p className="text-xs text-gray-500">{tags.length}/10 thẻ</p>
            </div>

            {/* Suggested Tags */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Thẻ gợi ý:</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddTag(tag)}
                    disabled={tags.includes(tag)}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2 mb-4">
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
              >
                Thêm
              </Button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
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
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">Tối ưu SEO</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateSEO}
                disabled={!values.name || !values.description}
              >
                Tự động tạo
              </Button>
            </div>

            <div className="space-y-4">
              <Input
                name="seoTitle"
                label="Tiêu đề SEO"
                value={values.seoTitle}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tiêu đề hiển thị trên Google..."
                helperText={`${values.seoTitle?.length || 0}/60 ký tự`}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả SEO
                </label>
                <textarea
                  name="seoDescription"
                  rows={3}
                  value={values.seoDescription}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Mô tả ngắn gọn hiển thị trên kết quả tìm kiếm..."
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

      {/* Settings */}
      <Card className="p-6">
        <div className="flex items-center mb-6">
          <SparklesIcon className="w-6 h-6 text-primary mr-3" />
          <h3 className="text-lg font-semibold text-gray-900">
            Cài đặt nâng cao
          </h3>
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Cho phép tùy chỉnh sản phẩm
                </h3>
                <p className="text-sm text-gray-500">
                  Khách hàng có thể yêu cầu tùy chỉnh sản phẩm theo ý muốn
                </p>
              </div>
              <Toggle
                checked={values.isCustomizable}
                onChange={(checked) => setFieldValue('isCustomizable', checked)}
              />
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Cho phép thương lượng giá
                </h3>
                <p className="text-sm text-gray-500">
                  Khách hàng có thể gửi yêu cầu thương lượng giá sản phẩm
                </p>
              </div>
              <Toggle
                checked={values.allowNegotiation}
                onChange={(checked) =>
                  setFieldValue('allowNegotiation', checked)
                }
              />
            </div>
          </div>

          {/* Publishing Options (Create mode only) */}
          {mode === 'create' && (
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Tùy chọn xuất bản
              </h4>

              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="publishOption"
                    checked={!saveAsPublished}
                    onChange={() => setSaveAsPublished(false)}
                    className="mr-3 text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-medium text-sm">Lưu làm bản nháp</div>
                    <div className="text-xs text-gray-500">
                      Sản phẩm sẽ được lưu nhưng chưa hiển thị với khách hàng
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="publishOption"
                    checked={saveAsPublished}
                    onChange={() => setSaveAsPublished(true)}
                    className="mr-3 text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-medium text-sm">Đăng bán ngay</div>
                    <div className="text-xs text-gray-500">
                      Sản phẩm sẽ hiển thị công khai và có thể mua
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-4 justify-end">
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
          <div className="bg-white p-8 rounded-lg text-center max-w-sm w-full mx-4">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-lg font-medium">Đang tải ảnh lên...</p>
            <p className="text-sm text-gray-600 mt-2">
              Vui lòng không đóng trang
            </p>
          </div>
        </div>
      )}
    </form>
  );
};
