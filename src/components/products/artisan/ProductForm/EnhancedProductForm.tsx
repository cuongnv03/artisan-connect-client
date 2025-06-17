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
import { CategorySelector } from './CategorySelector';
import { ImageUploader } from './ImageUploader';
import { DimensionsEditor } from './DimensionsEditor';
import { ShippingInfoEditor } from './ShippingInfoEditor';
import { KeyValueEditor } from './KeyValueEditor';
import { EnhancedVariantManager } from './EnhancedVariantManager';
import { ProductActions } from './ProductActions';
import { ProductPreview } from './ProductPreview';
import { TagsEditor } from './TagsEditor';
import {
  PhotoIcon,
  EyeIcon,
  CubeIcon,
  TruckIcon,
  StarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

interface EnhancedProductFormProps {
  initialData?: Partial<CreateProductRequest>;
  productId?: string;
  onSuccess?: (product: any) => void;
}

export const EnhancedProductForm: React.FC<EnhancedProductFormProps> = ({
  initialData,
  productId,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
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

  const handleFormSubmit = async (status: ProductStatus) => {
    const formData = { ...values, status };
    try {
      await handleSubmit(formData as any);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const tabItems = [
    {
      key: 'basic',
      label: 'Thông tin cơ bản',
      icon: <DocumentTextIcon className="w-4 h-4" />,
    },
    {
      key: 'pricing',
      label: 'Giá & Kho',
      icon: <CurrencyDollarIcon className="w-4 h-4" />,
    },
    {
      key: 'media',
      label: 'Hình ảnh',
      icon: <PhotoIcon className="w-4 h-4" />,
    },
    {
      key: 'variants',
      label: 'Biến thể',
      icon: <CubeIcon className="w-4 h-4" />,
    },
    {
      key: 'shipping',
      label: 'Vận chuyển',
      icon: <TruckIcon className="w-4 h-4" />,
    },
    {
      key: 'seo',
      label: 'SEO & Marketing',
      icon: <StarIcon className="w-4 h-4" />,
    },
    {
      key: 'advanced',
      label: 'Nâng cao',
      icon: <Cog6ToothIcon className="w-4 h-4" />,
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
                  {values.images.length} ảnh
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
                <CategorySelector
                  categories={categories}
                  selectedIds={values.categoryIds}
                  onChange={(categoryIds) =>
                    setFieldValue('categoryIds', categoryIds)
                  }
                  error={touched.categoryIds ? errors.categoryIds : undefined}
                />

                {/* Tags */}
                <TagsEditor
                  tags={values.tags}
                  onChange={(tags) => setFieldValue('tags', tags)}
                />
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

              <ImageUploader
                images={values.images}
                featuredImage={values.featuredImage}
                onChange={(images) => setFieldValue('images', images)}
                onFeaturedChange={(featured) =>
                  setFieldValue('featuredImage', featured)
                }
                error={touched.images ? errors.images : undefined}
              />
            </Card>
          )}

          {/* Variants */}
          {activeTab === 'variants' && (
            <EnhancedVariantManager
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

              <div className="space-y-6">
                <Input
                  name="weight"
                  label="Trọng lượng (gram)"
                  type="number"
                  value={values.weight || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={0}
                />

                {/* Dimensions Editor */}
                <DimensionsEditor
                  dimensions={values.dimensions}
                  onChange={(dimensions) =>
                    setFieldValue('dimensions', dimensions)
                  }
                />

                {/* Shipping Info Editor */}
                <ShippingInfoEditor
                  shippingInfo={values.shippingInfo}
                  onChange={(shippingInfo) =>
                    setFieldValue('shippingInfo', shippingInfo)
                  }
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

                {/* Attributes */}
                <KeyValueEditor
                  title="Thuộc tính tùy chỉnh"
                  description="Các thuộc tính bổ sung cho sản phẩm"
                  data={values.attributes || {}}
                  onChange={(attributes) =>
                    setFieldValue('attributes', attributes)
                  }
                  placeholder={{ key: 'Tên thuộc tính', value: 'Giá trị' }}
                />

                {/* Specifications */}
                <KeyValueEditor
                  title="Thông số kỹ thuật"
                  description="Thông số chi tiết về sản phẩm"
                  data={values.specifications || {}}
                  onChange={(specifications) =>
                    setFieldValue('specifications', specifications)
                  }
                  placeholder={{ key: 'Tên thông số', value: 'Giá trị' }}
                />

                {/* Custom Fields */}
                <KeyValueEditor
                  title="Trường tùy chỉnh"
                  description="Các trường dữ liệu bổ sung"
                  data={values.customFields || {}}
                  onChange={(customFields) =>
                    setFieldValue('customFields', customFields)
                  }
                  placeholder={{ key: 'Tên trường', value: 'Giá trị' }}
                />
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
                  onClick={() => handleFormSubmit(ProductStatus.DRAFT)} // Bỏ (e) =>
                  disabled={submitting}
                >
                  Lưu bản nháp
                </Button>
              )}

              <Button
                type="button"
                loading={submitting}
                disabled={isSubmitting}
                onClick={() => handleFormSubmit(ProductStatus.PUBLISHED)} // Bỏ (e) =>
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
          images={values.images}
          onClose={() => setShowPreview(false)}
        />
      )}
    </form>
  );
};
