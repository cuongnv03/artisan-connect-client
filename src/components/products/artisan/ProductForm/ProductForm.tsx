import React, { useState, useEffect } from 'react';
import { useProductForm } from '../../../../hooks/products/useProductForm';
import { productService, uploadService } from '../../../../services';
import {
  CreateProductRequest,
  Category,
  ProductStatus,
} from '../../../../types/product';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Select } from '../../../ui/Dropdown';
import { Toggle } from '../../../ui/Toggle';
import { Tabs } from '../../../ui/Tabs';
import { VariantManager } from './VariantManager';
import { ProductActions } from './ProductActions';
import { ProductPreview } from './ProductPreview';
import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  EyeIcon,
  CloudArrowUpIcon,
  TagIcon,
  CubeIcon,
  TruckIcon,
  StarIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';

interface EnhancedProductFormProps {
  initialData?: Partial<CreateProductRequest>;
  productId?: string;
  onSuccess?: (product: any) => void;
}

export const ProductForm: React.FC<EnhancedProductFormProps> = ({
  initialData,
  productId,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>(
    initialData?.images || [],
  );
  const [featuredImageIndex, setFeaturedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('basic');
  const [showPreview, setShowPreview] = useState(false);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    submitting,
    isEditing,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
  } = useProductForm({
    initialData,
    productId,
    onSuccess,
  });

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await productService.getCategories();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleFormSubmit = async (
    status: ProductStatus,
    e?: React.FormEvent,
  ) => {
    if (e) {
      e.preventDefault();
    }
    const formData = { ...values, status };
    try {
      await handleSubmit(formData as any);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) =>
        uploadService.uploadImage(file, { folder: 'products' }),
      );

      const uploadResults = await Promise.all(uploadPromises);
      const newImages = uploadResults.map((result) => result.url);

      const updatedImages = [...selectedImages, ...newImages];
      setSelectedImages(updatedImages);
      setFieldValue('images', updatedImages);

      // Set first image as featured if no featured image set
      if (!values.featuredImage && updatedImages.length > 0) {
        setFieldValue('featuredImage', updatedImages[0]);
      }
    } catch (err) {
      console.error('Error uploading images:', err);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
    setFieldValue('images', updatedImages);

    // Reset featured image if removed
    if (index === featuredImageIndex && updatedImages.length > 0) {
      setFeaturedImageIndex(0);
      setFieldValue('featuredImage', updatedImages[0]);
    }
  };

  const setFeaturedImage = (index: number) => {
    setFeaturedImageIndex(index);
    setFieldValue('featuredImage', selectedImages[index]);
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !values.tags.includes(tag.trim())) {
      setFieldValue('tags', [...values.tags, tag.trim()]);
    }
  };

  const removeTag = (index: number) => {
    setFieldValue(
      'tags',
      values.tags.filter((_, i) => i !== index),
    );
  };

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  const tabItems = [
    {
      key: 'basic',
      label: 'Thông tin cơ bản',
      icon: <DocumentTextIcon className="w-4 h-4" />,
      content: null,
    },
    {
      key: 'pricing',
      label: 'Giá & Kho',
      icon: <CurrencyDollarIcon className="w-4 h-4" />,
      content: null,
    },
    {
      key: 'media',
      label: 'Hình ảnh',
      icon: <PhotoIcon className="w-4 h-4" />,
      content: null,
    },
    {
      key: 'variants',
      label: 'Biến thể',
      icon: <CubeIcon className="w-4 h-4" />,
      content: null,
    },
    {
      key: 'shipping',
      label: 'Vận chuyển',
      icon: <TruckIcon className="w-4 h-4" />,
      content: null,
    },
    {
      key: 'seo',
      label: 'SEO & Marketing',
      icon: <StarIcon className="w-4 h-4" />,
      content: null,
    },
    {
      key: 'advanced',
      label: 'Nâng cao',
      icon: <Cog6ToothIcon className="w-4 h-4" />,
      content: null,
    },
  ];

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
          </h2>
          <p className="text-gray-600">
            {isEditing
              ? 'Cập nhật thông tin sản phẩm'
              : 'Điền thông tin để tạo sản phẩm mới'}
          </p>
        </div>

        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            leftIcon={<EyeIcon className="w-4 h-4" />}
          >
            Xem trước
          </Button>

          {isEditing && (
            <ProductActions
              productId={productId!}
              currentStatus={values.status}
              onStatusChange={(status) => setFieldValue('status', status)}
            />
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Quick Info */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Tổng quan</h3>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Trạng thái</label>
                <div className="mt-1">
                  {values.status === ProductStatus.PUBLISHED && (
                    <Badge variant="success">Đã xuất bản</Badge>
                  )}
                  {values.status === ProductStatus.DRAFT && (
                    <Badge variant="secondary">Bản nháp</Badge>
                  )}
                  {values.status === ProductStatus.OUT_OF_STOCK && (
                    <Badge variant="warning">Hết hàng</Badge>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-600">Hình ảnh</label>
                <p className="text-sm font-medium">
                  {selectedImages.length} ảnh
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Danh mục</label>
                <p className="text-sm font-medium">
                  {values.categoryIds.length} danh mục
                </p>
              </div>

              <div>
                <label className="text-sm text-gray-600">Tags</label>
                <p className="text-sm font-medium">{values.tags.length} tags</p>
              </div>

              {values.variants && values.variants.length > 0 && (
                <div>
                  <label className="text-sm text-gray-600">Biến thể</label>
                  <p className="text-sm font-medium">
                    {values.variants.length} biến thể
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Main Form */}
        <div className="lg:col-span-3">
          <Tabs
            items={tabItems}
            activeKey={activeTab}
            onChange={setActiveTab}
            className="mb-6"
          />

          {/* Basic Information */}
          {activeTab === 'basic' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin cơ bản
              </h3>

              <div className="space-y-6">
                <Input
                  name="name"
                  label="Tên sản phẩm"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name ? errors.name : undefined}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả sản phẩm
                  </label>
                  <textarea
                    name="description"
                    rows={6}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Mô tả chi tiết về sản phẩm..."
                  />
                  {touched.description && errors.description && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Categories */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Danh mục sản phẩm
                  </label>
                  <Select
                    value=""
                    onChange={(categoryId) => {
                      if (
                        categoryId &&
                        !values.categoryIds.includes(categoryId)
                      ) {
                        setFieldValue('categoryIds', [
                          ...values.categoryIds,
                          categoryId,
                        ]);
                      }
                    }}
                    options={[
                      { label: 'Chọn danh mục...', value: '' },
                      ...categoryOptions.filter(
                        (opt) => !values.categoryIds.includes(opt.value),
                      ),
                    ]}
                    placeholder="Thêm danh mục"
                  />

                  {values.categoryIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {values.categoryIds.map((categoryId) => {
                        const category = categories.find(
                          (c) => c.id === categoryId,
                        );
                        return (
                          <Badge
                            key={categoryId}
                            variant="secondary"
                            className="cursor-pointer hover:bg-gray-300"
                            onClick={() => {
                              setFieldValue(
                                'categoryIds',
                                values.categoryIds.filter(
                                  (id) => id !== categoryId,
                                ),
                              );
                            }}
                          >
                            {category?.name}
                            <XMarkIcon className="ml-1 w-3 h-3" />
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {touched.categoryIds && errors.categoryIds && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.categoryIds}
                    </p>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Nhập tag..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      leftIcon={<TagIcon className="w-4 h-4" />}
                      onClick={(e) => {
                        const input =
                          e.currentTarget.parentElement?.querySelector('input');
                        if (input) {
                          addTag(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      Thêm
                    </Button>
                  </div>

                  {values.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {values.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="primary"
                          className="cursor-pointer hover:bg-primary-600"
                          onClick={() => removeTag(index)}
                        >
                          {tag}
                          <XMarkIcon className="ml-1 w-3 h-3" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Pricing & Inventory */}
          {activeTab === 'pricing' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Giá cả & Kho hàng
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="price"
                  label="Giá gốc (VNĐ)"
                  type="number"
                  value={values.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.price ? errors.price : undefined}
                  required
                />

                <Input
                  name="discountPrice"
                  label="Giá khuyến mãi (VNĐ)"
                  type="number"
                  value={values.discountPrice || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.discountPrice ? errors.discountPrice : undefined
                  }
                />

                <Input
                  name="quantity"
                  label="Số lượng trong kho"
                  type="number"
                  value={values.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.quantity ? errors.quantity : undefined}
                  required
                />

                <Input
                  name="minOrderQty"
                  label="Số lượng tối thiểu"
                  type="number"
                  value={values.minOrderQty}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={1}
                />

                <Input
                  name="maxOrderQty"
                  label="Số lượng tối đa"
                  type="number"
                  value={values.maxOrderQty || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <Input
                  name="sku"
                  label="Mã SKU"
                  value={values.sku || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tự động tạo nếu để trống"
                />

                <Input
                  name="barcode"
                  label="Mã vạch"
                  value={values.barcode || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            </Card>
          )}

          {/* Media */}
          {activeTab === 'media' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Hình ảnh sản phẩm
              </h3>

              <div className="space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Thêm hình ảnh
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        e.target.files && handleImageUpload(e.target.files)
                      }
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-600">
                          Kéo thả hoặc click để chọn ảnh
                        </span>
                        <span className="text-xs text-gray-500">
                          PNG, JPG, WEBP đến 10MB
                        </span>
                      </>
                    )}
                  </label>
                </div>

                {/* Image Grid */}
                {selectedImages.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Hình ảnh đã chọn
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full aspect-square object-cover rounded-lg"
                          />

                          {/* Featured Badge */}
                          {index === featuredImageIndex && (
                            <Badge
                              variant="primary"
                              className="absolute top-2 left-2"
                              size="sm"
                            >
                              Ảnh chính
                            </Badge>
                          )}

                          {/* Actions */}
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                            {index !== featuredImageIndex && (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => setFeaturedImage(index)}
                              >
                                Làm ảnh chính
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="danger"
                              size="sm"
                              onClick={() => removeImage(index)}
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {touched.images && errors.images && (
                  <p className="text-sm text-red-600">{errors.images}</p>
                )}
              </div>
            </Card>
          )}

          {/* Variants */}
          {activeTab === 'variants' && (
            <VariantManager
              variants={values.variants || []}
              onChange={(variants) => setFieldValue('variants', variants)}
              errors={errors.variants}
            />
          )}

          {/* Shipping */}
          {activeTab === 'shipping' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Thông tin vận chuyển
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="weight"
                  label="Trọng lượng (gram)"
                  type="number"
                  value={values.weight || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={0}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kích thước (cm)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Dài"
                      type="number"
                      value={values.dimensions?.length || ''}
                      onChange={(e) =>
                        setFieldValue('dimensions', {
                          ...values.dimensions,
                          length: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Rộng"
                      type="number"
                      value={values.dimensions?.width || ''}
                      onChange={(e) =>
                        setFieldValue('dimensions', {
                          ...values.dimensions,
                          width: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Cao"
                      type="number"
                      value={values.dimensions?.height || ''}
                      onChange={(e) =>
                        setFieldValue('dimensions', {
                          ...values.dimensions,
                          height: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Thông tin vận chuyển
                </label>
                <textarea
                  rows={4}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                  value={values.shippingInfo?.notes || ''}
                  onChange={(e) =>
                    setFieldValue('shippingInfo', {
                      ...values.shippingInfo,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Ghi chú về vận chuyển, đóng gói..."
                />
              </div>
            </Card>
          )}

          {/* SEO */}
          {activeTab === 'seo' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                SEO & Marketing
              </h3>

              <div className="space-y-6">
                <Input
                  name="seoTitle"
                  label="SEO Title"
                  value={values.seoTitle || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Tiêu đề cho SEO (60 ký tự)"
                  maxLength={60}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    name="seoDescription"
                    rows={3}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    value={values.seoDescription || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Mô tả cho SEO (160 ký tự)"
                    maxLength={160}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    {(values.seoDescription || '').length}/160 ký tự
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Advanced */}
          {activeTab === 'advanced' && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Cài đặt nâng cao
              </h3>

              <div className="space-y-6">
                {/* Product Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Cho phép tùy chỉnh sản phẩm
                      </label>
                      <p className="text-sm text-gray-500">
                        Khách hàng có thể yêu cầu tùy chỉnh sản phẩm
                      </p>
                    </div>
                    <Toggle
                      checked={values.isCustomizable}
                      onChange={(checked) =>
                        setFieldValue('isCustomizable', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Cho phép thương lượng giá
                      </label>
                      <p className="text-sm text-gray-500">
                        Khách hàng có thể thương lượng giá sản phẩm
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

                {/* Custom Attributes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thuộc tính tùy chỉnh
                  </label>
                  <textarea
                    rows={4}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    value={JSON.stringify(values.attributes || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setFieldValue('attributes', parsed);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    placeholder='{"key": "value", "material": "cotton"}'
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    JSON format cho các thuộc tính tùy chỉnh
                  </p>
                </div>

                {/* Specifications */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thông số kỹ thuật
                  </label>
                  <textarea
                    rows={4}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                    value={JSON.stringify(values.specifications || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setFieldValue('specifications', parsed);
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    placeholder='{"dimensions": "20x30cm", "material": "100% cotton"}'
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    JSON format cho thông số kỹ thuật
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Submit Actions */}
          <Card className="p-6">
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
              >
                Hủy
              </Button>

              {!isEditing && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => handleFormSubmit(ProductStatus.DRAFT, e)}
                  disabled={submitting}
                >
                  Lưu bản nháp
                </Button>
              )}

              <Button
                type="button"
                loading={submitting}
                disabled={isSubmitting}
                onClick={(e) => handleFormSubmit(ProductStatus.PUBLISHED, e)}
              >
                {isEditing ? 'Cập nhật sản phẩm' : 'Tạo & Xuất bản'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Product Preview Modal */}
      {showPreview && (
        <ProductPreview
          product={values}
          images={selectedImages}
          onClose={() => setShowPreview(false)}
        />
      )}
    </form>
  );
};
