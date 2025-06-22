import '../../../../styles/components/product-form.css';
import React, { useState, useEffect } from 'react';
import { useProductForm } from '../../../../hooks/products/useProductForm';
import { productService } from '../../../../services';
import {
  CreateProductRequest,
  Category,
  ProductStatus,
} from '../../../../types/product';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Toggle } from '../../../ui/Toggle';
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
  EyeIcon,
  BookmarkIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  PhotoIcon,
  CubeIcon,
  TruckIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronUpIcon,
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
  const [showPreview, setShowPreview] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(),
  );

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
    submitWithStatus, // ✅ SỬA: Sử dụng submitWithStatus thay vì handleSubmit trực tiếp
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

  // ✅ SỬA: Sửa form submit handlers
  const handleFormSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    // Submit với status mặc định (DRAFT cho create, giữ nguyên cho edit)
    await handleSubmit(e);
  };

  const handleSaveAsDraft = async () => {
    try {
      await submitWithStatus(values, ProductStatus.DRAFT);
    } catch (error) {
      console.error('Save as draft error:', error);
    }
  };

  const handlePublish = async () => {
    try {
      await submitWithStatus(values, ProductStatus.PUBLISHED);
    } catch (error) {
      console.error('Publish error:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const SectionHeader = ({
    id,
    title,
    icon: Icon,
    description,
    isRequired = false,
  }: {
    id: string;
    title: string;
    icon: any;
    description?: string;
    isRequired?: boolean;
  }) => {
    const isCollapsed = collapsedSections.has(id);

    return (
      <button
        type="button"
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-t-lg hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center">
          <Icon className="w-4 h-4 text-gray-600 mr-2" />
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center">
              {title}
              {isRequired && <span className="text-red-500 ml-1">*</span>}
            </h3>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
        </div>
        {isCollapsed ? (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronUpIcon className="w-4 h-4 text-gray-400" />
        )}
      </button>
    );
  };

  return (
    <div className="h-full overflow-hidden">
      {/* ✅ SỬA: Sử dụng handleFormSubmit */}
      <form onSubmit={handleFormSubmit} className="h-full">
        <div className="flex h-full">
          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* 1. Basic Information */}
              <Card className="overflow-hidden">
                <SectionHeader
                  id="basic"
                  title="Thông tin cơ bản"
                  icon={DocumentTextIcon}
                  description="Tên và mô tả sản phẩm"
                  isRequired
                />
                {!collapsedSections.has('basic') && (
                  <div className="p-4 space-y-4">
                    <Input
                      name="name"
                      label="Tên sản phẩm"
                      value={values.name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.name ? errors.name : undefined}
                      required
                      placeholder="VD: Bình gốm men lam cổ điển"
                    />

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả sản phẩm
                      </label>
                      <textarea
                        name="description"
                        rows={3}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                        value={values.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Mô tả chi tiết về sản phẩm, kỹ thuật chế tác, nguồn gốc..."
                      />
                      {touched.description && errors.description && (
                        <p className="mt-1 text-xs text-red-600">
                          {errors.description}
                        </p>
                      )}
                    </div>

                    {/* Categories and Tags in same row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <CategorySelector
                          categories={categories}
                          selectedIds={values.categoryIds}
                          onChange={(categoryIds) =>
                            setFieldValue('categoryIds', categoryIds)
                          }
                          error={
                            touched.categoryIds ? errors.categoryIds : undefined
                          }
                        />
                      </div>
                      <div>
                        {/* ✅ SỬA: TagsEditor với proper handlers */}
                        <TagsEditor
                          tags={values.tags}
                          onChange={(tags) => setFieldValue('tags', tags)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Pricing & Inventory - Keep existing code */}
              <Card className="overflow-hidden">
                <SectionHeader
                  id="pricing"
                  title="Giá cả & Kho hàng"
                  icon={CurrencyDollarIcon}
                  description="Thiết lập giá bán và quản lý tồn kho"
                  isRequired
                />
                {!collapsedSections.has('pricing') && (
                  <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                          touched.discountPrice
                            ? errors.discountPrice
                            : undefined
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
                    </div>

                    {/* Product Settings */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        Cài đặt sản phẩm
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium text-gray-900">
                              Cho phép tùy chỉnh
                            </label>
                            <p className="text-xs text-gray-500">
                              Khách hàng có thể yêu cầu tùy chỉnh
                            </p>
                          </div>
                          <Toggle
                            checked={values.isCustomizable}
                            onChange={(checked) =>
                              setFieldValue('isCustomizable', checked)
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <label className="text-sm font-medium text-gray-900">
                              Cho phép thương lượng giá
                            </label>
                            <p className="text-xs text-gray-500">
                              Khách hàng có thể thương lượng giá
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
                    </div>
                  </div>
                )}
              </Card>

              {/* Images */}
              <Card className="overflow-hidden">
                <SectionHeader
                  id="media"
                  title="Hình ảnh sản phẩm"
                  icon={PhotoIcon}
                  description="Tải lên hình ảnh để khách hàng có thể xem sản phẩm"
                  isRequired
                />
                {!collapsedSections.has('media') && (
                  <div className="p-4">
                    <ImageUploader
                      images={values.images}
                      featuredImage={values.featuredImage}
                      onChange={(images) => setFieldValue('images', images)}
                      onFeaturedChange={(featured) =>
                        setFieldValue('featuredImage', featured)
                      }
                      error={touched.images ? errors.images : undefined}
                    />
                  </div>
                )}
              </Card>

              {/* Variants */}
              <Card className="overflow-hidden">
                <SectionHeader
                  id="variants"
                  title="Biến thể sản phẩm"
                  icon={CubeIcon}
                  description="Tạo các biến thể khác nhau (màu sắc, kích thước...)"
                />
                {!collapsedSections.has('variants') && (
                  <div className="p-4">
                    <EnhancedVariantManager
                      variants={values.variants || []}
                      onChange={(variants) =>
                        setFieldValue('variants', variants)
                      }
                      errors={errors.variants}
                    />
                  </div>
                )}
              </Card>

              {/* Shipping & Physical Info */}
              <Card className="overflow-hidden">
                <SectionHeader
                  id="shipping"
                  title="Vận chuyển & Kích thước"
                  icon={TruckIcon}
                  description="Thông tin về kích thước và vận chuyển"
                />
                {!collapsedSections.has('shipping') && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        name="weight"
                        label="Trọng lượng (gram)"
                        type="number"
                        value={values.weight || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        min={0}
                      />
                      <Input
                        name="barcode"
                        label="Mã vạch"
                        value={values.barcode || ''}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                    </div>

                    <DimensionsEditor
                      dimensions={values.dimensions}
                      onChange={(dimensions) =>
                        setFieldValue('dimensions', dimensions)
                      }
                    />

                    <ShippingInfoEditor
                      shippingInfo={values.shippingInfo}
                      onChange={(shippingInfo) =>
                        setFieldValue('shippingInfo', shippingInfo)
                      }
                    />
                  </div>
                )}
              </Card>

              {/* Advanced Settings */}
              <Card className="overflow-hidden">
                <SectionHeader
                  id="advanced"
                  title="Cài đặt nâng cao"
                  icon={Cog6ToothIcon}
                  description="SEO, thuộc tính tùy chỉnh và thông số kỹ thuật"
                />
                {!collapsedSections.has('advanced') && (
                  <div className="p-4 space-y-4">
                    {/* SEO Section */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-3">
                        SEO & Marketing
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            rows={2}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary text-sm"
                            value={values.seoDescription || ''}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            placeholder="Mô tả cho SEO (160 ký tự)"
                            maxLength={160}
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            {(values.seoDescription || '').length}/160 ký tự
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Custom Attributes */}
                    <div>
                      <KeyValueEditor
                        title="Thuộc tính tùy chỉnh"
                        description="Các thuộc tính bổ sung cho sản phẩm"
                        data={values.attributes || {}}
                        onChange={(attributes) =>
                          setFieldValue('attributes', attributes)
                        }
                        placeholder={{
                          key: 'Tên thuộc tính',
                          value: 'Giá trị',
                        }}
                      />
                    </div>

                    <div>
                      <KeyValueEditor
                        title="Thông số kỹ thuật"
                        description="Thông số chi tiết về sản phẩm"
                        data={values.specifications || {}}
                        onChange={(specifications) =>
                          setFieldValue('specifications', specifications)
                        }
                        placeholder={{ key: 'Tên thông số', value: 'Giá trị' }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Sidebar - Fixed width, scrollable */}
          <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="p-4 space-y-4">
              {/* Product Status & Actions */}
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Trạng thái sản phẩm
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">
                      Trạng thái hiện tại:
                    </span>
                    <Badge
                      variant={
                        values.status === ProductStatus.PUBLISHED
                          ? 'success'
                          : values.status === ProductStatus.DRAFT
                          ? 'secondary'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {values.status === ProductStatus.PUBLISHED &&
                        'Đã xuất bản'}
                      {values.status === ProductStatus.DRAFT && 'Bản nháp'}
                      {values.status === ProductStatus.OUT_OF_STOCK &&
                        'Hết hàng'}
                    </Badge>
                  </div>

                  {isEditing && (
                    <ProductActions
                      productId={productId!}
                      currentStatus={values.status}
                      onStatusChange={(status) =>
                        setFieldValue('status', status)
                      }
                    />
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Hình ảnh:</span>
                    <span className="text-xs font-medium">
                      {values.images.length} ảnh
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Danh mục:</span>
                    <span className="text-xs font-medium">
                      {values.categoryIds.length} danh mục
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-xs text-gray-600">Tags:</span>
                    <span className="text-xs font-medium">
                      {values.tags.length} tags
                    </span>
                  </div>

                  {values.variants && values.variants.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Biến thể:</span>
                      <span className="text-xs font-medium">
                        {values.variants.length} biến thể
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Preview */}
              {values.images.length > 0 && (
                <Card className="p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Xem nhanh
                  </h3>
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-2">
                    <img
                      src={values.images[0]}
                      alt="Product preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {values.name || 'Chưa có tên'}
                  </h4>
                  {values.price > 0 && (
                    <p className="text-sm font-bold text-primary">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(values.discountPrice || values.price)}
                    </p>
                  )}
                </Card>
              )}

              {/* Save Actions */}
              <Card className="p-4">
                <div className="space-y-2">
                  {/* ✅ SỬA: Buttons với proper handlers */}
                  {!isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSaveAsDraft}
                      disabled={submitting}
                      fullWidth
                      size="sm"
                      leftIcon={<BookmarkIcon className="w-4 h-4" />}
                    >
                      Lưu bản nháp
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={handlePublish}
                    disabled={submitting}
                    loading={submitting}
                    fullWidth
                    size="sm"
                    leftIcon={<CheckCircleIcon className="w-4 h-4" />}
                  >
                    {isEditing ? 'Cập nhật sản phẩm' : 'Tạo & Xuất bản'}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => window.history.back()}
                    fullWidth
                    size="sm"
                  >
                    Hủy
                  </Button>
                </div>
              </Card>
            </div>
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
    </div>
  );
};
