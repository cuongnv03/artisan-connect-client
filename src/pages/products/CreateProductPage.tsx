import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  PlusIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  SwatchIcon,
  Cog6ToothIcon,
  EyeIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { useForm } from '../../hooks/common/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileUpload } from '../../components/common/FileUpload';
import { Toggle } from '../../components/ui/Toggle';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import { Tabs } from '../../components/ui/Tabs';
import { ProductVariantManager } from '../../components/products/ProductVariantManager';
import { ProductAttributesForm } from '../../components/products/ProductAttributesForm';
import { useCategories } from '../../hooks/products/useCategories';
import { useToastContext } from '../../contexts/ToastContext';
import { uploadService } from '../../services/upload.service';
import { productService } from '../../services/product.service';
import { CreateProductRequest, ProductStatus } from '../../types/product';

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

export const CreateProductPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToastContext();
  const { categories, categoryTree } = useCategories();

  // Form states
  const [activeTab, setActiveTab] = useState('basic');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [variants, setVariants] = useState<any[]>([]);
  const [productAttributes, setProductAttributes] = useState<
    Record<string, any>
  >({});
  const [showPreview, setShowPreview] = useState(false);
  const [saveAsDraft, setSaveAsDraft] = useState(true);

  const validate = (values: CreateProductRequest) => {
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

    if (!values.quantity || values.quantity < 0) {
      errors.quantity = 'Số lượng không được âm';
    }

    if (!values.categoryIds?.length) {
      errors.categoryIds = 'Phải chọn ít nhất một danh mục';
    }

    if (imageFiles.length === 0) {
      errors.images = 'Phải có ít nhất một hình ảnh sản phẩm';
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
  } = useForm<CreateProductRequest>({
    initialValues: {
      name: '',
      description: '',
      price: 0,
      discountPrice: undefined,
      quantity: 0,
      minOrderQty: 1,
      maxOrderQty: undefined,
      sku: '',
      barcode: '',
      weight: undefined,
      dimensions: {},
      isCustomizable: false,
      allowNegotiation: true,
      shippingInfo: {},
      status: ProductStatus.DRAFT,
      categoryIds: [],
      images: [],
      featuredImage: '',
      tags: [],
      seoTitle: '',
      seoDescription: '',
      attributes: {},
      specifications: {},
      customFields: {},
    },
    validate,
    onSubmit: async (data) => {
      try {
        setUploading(true);

        // Upload images
        const imageUrls = await Promise.all(
          imageFiles.map((file) =>
            uploadService.uploadImage(file, { folder: 'products' }),
          ),
        );

        const productData = {
          ...data,
          images: imageUrls.map((upload) => upload.url),
          featuredImage: imageUrls[0]?.url,
          tags,
          attributes: productAttributes,
          variants: variants.length > 0 ? variants : undefined,
          status: saveAsDraft ? ProductStatus.DRAFT : ProductStatus.PUBLISHED,
        };

        const product = await productService.createProduct(productData);
        success(
          `Tạo sản phẩm thành công! Trạng thái: ${
            saveAsDraft ? 'Nháp' : 'Đã đăng bán'
          }`,
        );
        navigate(`/products/${product.id}`);
      } catch (err: any) {
        showError(err.message || 'Không thể tạo sản phẩm');
      } finally {
        setUploading(false);
      }
    },
  });

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

  const generateSEO = () => {
    if (values.name && values.description) {
      setFieldValue('seoTitle', values.name);
      setFieldValue('seoDescription', values.description.substring(0, 160));
      success('Đã tự động tạo thông tin SEO');
    }
  };

  const formTabs = [
    {
      key: 'basic',
      label: 'Thông tin cơ bản',
      icon: <InformationCircleIcon className="w-4 h-4" />,
      content: (
        <div className="space-y-6">
          {/* Basic Info */}
          <Card className="p-6">
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
                  helperText="Mã định danh duy nhất cho sản phẩm"
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
        </div>
      ),
    },
    {
      key: 'media',
      label: 'Hình ảnh',
      icon: <PhotoIcon className="w-4 h-4" />,
      content: (
        <Card className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Hình ảnh sản phẩm
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Thêm ít nhất 3-5 hình ảnh chất lượng cao để thu hút khách hàng
              </p>
            </div>

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
      ),
    },
    {
      key: 'pricing',
      label: 'Giá & Kho',
      icon: <CurrencyDollarIcon className="w-4 h-4" />,
      content: (
        <Card className="p-6">
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
                      Giảm{' '}
                      {Math.round(
                        ((values.price - values.discountPrice) / values.price) *
                          100,
                      )}
                      % - Tiết kiệm{' '}
                      {(values.price - values.discountPrice).toLocaleString()}₫
                    </p>
                  </div>
                </div>
              )}
          </div>
        </Card>
      ),
    },
    {
      key: 'categories',
      label: 'Danh mục',
      icon: <TagIcon className="w-4 h-4" />,
      content: (
        <Card className="p-6">
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
      ),
    },
    {
      key: 'attributes',
      label: 'Thuộc tính',
      icon: <SwatchIcon className="w-4 h-4" />,
      content: (
        <Card className="p-6">
          <ProductAttributesForm
            categoryIds={values.categoryIds || []}
            attributes={productAttributes}
            onAttributesChange={setProductAttributes}
          />
        </Card>
      ),
    },
    {
      key: 'variants',
      label: 'Biến thể',
      icon: <Cog6ToothIcon className="w-4 h-4" />,
      badge: variants.length > 0 ? variants.length.toString() : undefined,
      content: (
        <Card className="p-6">
          <ProductVariantManager
            variants={variants}
            onVariantsChange={setVariants}
            basePrice={values.price || 0}
            categoryIds={values.categoryIds || []}
          />
        </Card>
      ),
    },
    {
      key: 'seo',
      label: 'SEO & Tags',
      icon: <DocumentTextIcon className="w-4 h-4" />,
      content: (
        <Card className="p-6">
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
                <h4 className="text-sm font-medium text-gray-900">
                  Tối ưu SEO
                </h4>
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
      ),
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <Cog6ToothIcon className="w-4 h-4" />,
      content: (
        <Card className="p-6">
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
                  onChange={(checked) =>
                    setFieldValue('isCustomizable', checked)
                  }
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

            {/* Publishing Options */}
            <div className="border-t pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">
                Tùy chọn xuất bản
              </h4>

              <div className="space-y-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer">
                  <input
                    type="radio"
                    name="publishOption"
                    checked={saveAsDraft}
                    onChange={() => setSaveAsDraft(true)}
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
                    checked={!saveAsDraft}
                    onChange={() => setSaveAsDraft(false)}
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
          </div>
        </Card>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Tạo sản phẩm mới - Artisan Connect</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/products')}
              leftIcon={<ArrowLeftIcon className="w-4 h-4" />}
            >
              Quay lại
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PlusIcon className="w-8 h-8 text-primary mr-3" />
                Tạo sản phẩm mới
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Thêm sản phẩm thủ công độc đáo vào cửa hàng của bạn
              </p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tiến độ hoàn thành</span>
              <span className="font-medium">
                {Math.round(
                  (Object.keys(touched).length / formTabs.length) * 100,
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round(
                    (Object.keys(touched).length / formTabs.length) * 100,
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <Tabs
                items={formTabs}
                activeKey={activeTab}
                onChange={setActiveTab}
                variant="card"
              />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Actions */}
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">
                  Thao tác nhanh
                </h3>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPreview(true)}
                    leftIcon={<EyeIcon className="w-4 h-4" />}
                    className="w-full justify-start"
                    disabled={!values.name || imageFiles.length === 0}
                  >
                    Xem trước
                  </Button>

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={uploading}
                    className="w-full"
                  >
                    {saveAsDraft ? 'Lưu nháp' : 'Tạo và đăng bán'}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/products')}
                    disabled={isSubmitting || uploading}
                    className="w-full"
                  >
                    Hủy bỏ
                  </Button>
                </div>
              </Card>

              {/* Form Summary */}
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Tóm tắt</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hình ảnh:</span>
                    <span className="font-medium">{imageFiles.length}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Danh mục:</span>
                    <span className="font-medium">
                      {values.categoryIds?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thẻ:</span>
                    <span className="font-medium">{tags.length}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Biến thể:</span>
                    <span className="font-medium">{variants.length}</span>
                  </div>
                  {values.price > 0 && (
                    <div className="pt-3 border-t">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá bán:</span>
                        <span className="font-medium text-primary">
                          {values.price.toLocaleString()}₫
                        </span>
                      </div>
                      {values.discountPrice && (
                        <div className="flex justify-between text-green-600">
                          <span>Giá KM:</span>
                          <span className="font-medium">
                            {values.discountPrice.toLocaleString()}₫
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* Tips */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  💡 Mẹo tạo sản phẩm
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sử dụng tên sản phẩm mô tả và hấp dẫn</li>
                  <li>• Thêm nhiều ảnh chất lượng từ nhiều góc độ</li>
                  <li>• Mô tả chi tiết chất liệu và cách sử dụng</li>
                  <li>• Chọn đúng danh mục để dễ tìm kiếm</li>
                  <li>• Thêm thẻ phù hợp với sản phẩm</li>
                </ul>
              </Card>
            </div>
          </div>
        </form>

        {/* Preview Modal */}
        <Modal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          title="Xem trước sản phẩm"
          size="lg"
        >
          <div className="space-y-6">
            {/* Product Preview would go here */}
            <div className="text-center text-gray-500">
              <p>Preview sản phẩm sẽ được hiển thị ở đây</p>
            </div>
          </div>
        </Modal>

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
      </div>
    </>
  );
};
