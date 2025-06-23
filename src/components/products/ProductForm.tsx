import React, { useState, useEffect } from 'react';
import { useForm } from '../../hooks/common/useForm';
import { useProductCategories } from '../../hooks/products/useProductCategories';
import { productService } from '../../services/product.service';
import { uploadService } from '../../services/upload.service';
import {
  CreateProductRequest,
  UpdateProductRequest,
  Product,
  ProductVariant,
} from '../../types/product';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Dropdown';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { FileUpload } from '../common/FileUpload';
import { ProductVariants } from './ProductVariants';
import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (
    data: CreateProductRequest | UpdateProductRequest,
  ) => Promise<Product | null>;
  onCancel?: () => void;
  loading?: boolean;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadedImages, setUploadedImages] = useState<string[]>(
    product?.images || [],
  );
  const [uploading, setUploading] = useState(false);
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>(
    product?.variants || [],
  );
  const [activeSection, setActiveSection] = useState('basic');

  const { categories, loading: categoriesLoading } = useProductCategories();

  const validate = (values: CreateProductRequest | UpdateProductRequest) => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) {
      errors.name = 'Tên sản phẩm là bắt buộc';
    } else if (values.name.length < 3) {
      errors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự';
    }

    if (!values.price || values.price <= 0) {
      errors.price = 'Giá sản phẩm phải lớn hơn 0';
    }

    if (values.discountPrice && values.discountPrice >= values.price) {
      errors.discountPrice = 'Giá khuyến mãi phải thấp hơn giá gốc';
    }

    if (!values.quantity || values.quantity < 0) {
      errors.quantity = 'Số lượng không được âm';
    }

    if (!values.categoryIds || values.categoryIds.length === 0) {
      errors.categoryIds = 'Vui lòng chọn ít nhất một danh mục';
    }

    if (uploadedImages.length === 0) {
      errors.images = 'Vui lòng thêm ít nhất một hình ảnh';
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
    resetForm,
  } = useForm<CreateProductRequest | UpdateProductRequest>({
    initialValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      discountPrice: product?.discountPrice || undefined,
      quantity: product?.quantity || 0,
      minOrderQty: product?.minOrderQty || 1,
      maxOrderQty: product?.maxOrderQty || undefined,
      sku: product?.sku || '',
      barcode: product?.barcode || '',
      weight: product?.weight || undefined,
      isCustomizable: product?.isCustomizable || false,
      allowNegotiation: product?.allowNegotiation ?? true,
      status: product?.status || 'DRAFT',
      tags: product?.tags || [],
      images: product?.images || [],
      featuredImage: product?.featuredImage || '',
      seoTitle: product?.seoTitle || '',
      seoDescription: product?.seoDescription || '',
      categoryIds: product?.categories?.map((c) => c.id) || [],
      variants: product?.variants || [],
    },
    validate,
    onSubmit: async (data) => {
      // Upload new images first
      if (imageFiles.length > 0) {
        setUploading(true);
        try {
          const uploadResults = await uploadService.uploadMultiple(imageFiles, {
            folder: 'products',
          });
          const newImageUrls = uploadResults.map((result) => result.url);
          setUploadedImages((prev) => [...prev, ...newImageUrls]);
          setImageFiles([]);
        } catch (error) {
          console.error('Image upload failed:', error);
          return;
        } finally {
          setUploading(false);
        }
      }

      // Submit form with all images
      const finalData = {
        ...data,
        images: uploadedImages,
        featuredImage: uploadedImages[0] || '',
        variants: variants.length > 0 ? variants : undefined,
      };

      await onSubmit(finalData);
    },
  });

  // Handle image upload
  const handleImageUpload = async () => {
    if (imageFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadResults = await uploadService.uploadMultiple(imageFiles, {
        folder: 'products',
      });
      const newImageUrls = uploadResults.map((result) => result.url);
      setUploadedImages((prev) => [...prev, ...newImageUrls]);
      setImageFiles([]);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTagAdd = (tagInput: string) => {
    const newTag = tagInput.trim();
    if (newTag && !values.tags?.includes(newTag)) {
      setFieldValue('tags', [...(values.tags || []), newTag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFieldValue(
      'tags',
      values.tags?.filter((tag) => tag !== tagToRemove) || [],
    );
  };

  const sections = [
    {
      id: 'basic',
      title: 'Thông tin cơ bản',
      icon: <InformationCircleIcon className="w-5 h-5" />,
    },
    {
      id: 'pricing',
      title: 'Giá & Kho',
      icon: <span className="text-lg">💰</span>,
    },
    {
      id: 'media',
      title: 'Hình ảnh',
      icon: <PhotoIcon className="w-5 h-5" />,
    },
    {
      id: 'variants',
      title: 'Biến thể',
      icon: <span className="text-lg">🔄</span>,
    },
    {
      id: 'seo',
      title: 'SEO & Khác',
      icon: <span className="text-lg">🔍</span>,
    },
  ];

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {product ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới'}
          </h1>
          <div className="flex items-center space-x-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Hủy
              </Button>
            )}
            <Button
              type="submit"
              loading={isSubmitting || uploading}
              disabled={isSubmitting || uploading}
            >
              {product ? 'Cập nhật' : 'Tạo sản phẩm'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Section Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-4 sticky top-4">
              <nav className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {section.icon}
                    <span className="ml-3">{section.title}</span>
                  </button>
                ))}
              </nav>

              {/* Quick Actions */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trạng thái:</span>
                    <Badge
                      variant={
                        values.status === 'PUBLISHED' ? 'success' : 'warning'
                      }
                    >
                      {values.status === 'PUBLISHED'
                        ? 'Đã xuất bản'
                        : 'Bản nháp'}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hình ảnh:</span>
                    <span>{uploadedImages.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Danh mục:</span>
                    <span>{values.categoryIds?.length || 0}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Form Content */}
          <div className="lg:col-span-3">
            {/* Basic Information */}
            {activeSection === 'basic' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Thông tin cơ bản</h2>

                <div className="space-y-6">
                  {/* Product Name */}
                  <Input
                    name="name"
                    label="Tên sản phẩm"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.name ? errors.name : undefined}
                    required
                    placeholder="Nhập tên sản phẩm..."
                  />

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      name="description"
                      rows={6}
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
                      Danh mục sản phẩm <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                      {categories.map((category) => (
                        <label key={category.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              values.categoryIds?.includes(category.id) || false
                            }
                            onChange={(e) => {
                              const currentCategories =
                                values.categoryIds || [];
                              const newCategories = e.target.checked
                                ? [...currentCategories, category.id]
                                : currentCategories.filter(
                                    (id) => id !== category.id,
                                  );
                              setFieldValue('categoryIds', newCategories);
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {category.name}
                          </span>
                        </label>
                      ))}
                    </div>
                    {touched.categoryIds && errors.categoryIds && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.categoryIds}
                      </p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thẻ sản phẩm
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {values.tags?.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-gray-300"
                          onClick={() => removeTag(tag)}
                        >
                          {tag} ×
                        </Badge>
                      ))}
                    </div>
                    <Input
                      placeholder="Nhập thẻ và nhấn Enter..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleTagAdd(e.currentTarget.value);
                          e.currentTarget.value = '';
                        }
                      }}
                    />
                  </div>
                </div>
              </Card>
            )}

            {/* Pricing & Inventory */}
            {activeSection === 'pricing' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Giá & Kho hàng</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    name="price"
                    label="Giá bán"
                    type="number"
                    value={values.price}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.price ? errors.price : undefined}
                    required
                    min={0}
                    step={1000}
                  />

                  <Input
                    name="discountPrice"
                    label="Giá khuyến mãi"
                    type="number"
                    value={values.discountPrice || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.discountPrice ? errors.discountPrice : undefined
                    }
                    min={0}
                    step={1000}
                    helperText="Để trống nếu không có khuyến mãi"
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
                    min={0}
                  />

                  <Input
                    name="minOrderQty"
                    label="Số lượng đặt hàng tối thiểu"
                    type="number"
                    value={values.minOrderQty}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={1}
                    helperText="Mặc định là 1"
                  />

                  <Input
                    name="maxOrderQty"
                    label="Số lượng đặt hàng tối đa"
                    type="number"
                    value={values.maxOrderQty || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={1}
                    helperText="Để trống nếu không giới hạn"
                  />

                  <Input
                    name="sku"
                    label="Mã SKU"
                    value={values.sku}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Mã sản phẩm"
                    helperText="Để trống để tự động tạo"
                  />

                  <Input
                    name="barcode"
                    label="Mã vạch"
                    value={values.barcode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Mã vạch sản phẩm"
                  />

                  <Input
                    name="weight"
                    label="Khối lượng (gram)"
                    type="number"
                    value={values.weight || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    min={0}
                    placeholder="Khối lượng tính bằng gram"
                  />
                </div>

                {/* Options */}
                <div className="mt-6 space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isCustomizable"
                      checked={values.isCustomizable}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Cho phép tùy chỉnh sản phẩm
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allowNegotiation"
                      checked={values.allowNegotiation}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Cho phép thương lượng giá
                    </span>
                  </label>
                </div>
              </Card>
            )}

            {/* Media Section */}
            {activeSection === 'media' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Hình ảnh sản phẩm
                </h2>

                {/* Uploaded Images */}
                {uploadedImages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">
                      Hình ảnh hiện tại
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                          {index === 0 && (
                            <Badge
                              variant="primary"
                              className="absolute bottom-2 left-2"
                              size="sm"
                            >
                              Ảnh chính
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload New Images */}
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Thêm hình ảnh mới
                  </h3>
                  <FileUpload
                    files={imageFiles}
                    onFilesChange={setImageFiles}
                    accept="image"
                    multiple={true}
                    maxFiles={10 - uploadedImages.length}
                    maxSize={5}
                  />

                  {imageFiles.length > 0 && (
                    <div className="mt-4">
                      <Button
                        type="button"
                        onClick={handleImageUpload}
                        loading={uploading}
                        disabled={uploading}
                        leftIcon={<PlusIcon className="w-4 h-4" />}
                      >
                        {uploading ? 'Đang tải lên...' : 'Tải lên hình ảnh'}
                      </Button>
                    </div>
                  )}
                </div>

                {touched.images && errors.images && (
                  <p className="mt-2 text-sm text-red-600">{errors.images}</p>
                )}
              </Card>
            )}

            {/* Variants Section */}
            {activeSection === 'variants' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Biến thể sản phẩm
                </h2>

                <div className="mb-4">
                  <p className="text-gray-600 text-sm">
                    Tạo biến thể cho sản phẩm có nhiều phiên bản khác nhau như
                    màu sắc, kích thước, v.v.
                  </p>
                </div>

                <ProductVariants
                  variants={variants}
                  onVariantsChange={setVariants}
                  categories={categories}
                  basePrice={values.price}
                />
              </Card>
            )}

            {/* SEO & Others */}
            {activeSection === 'seo' && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">SEO & Khác</h2>

                <div className="space-y-6">
                  {/* SEO */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Tối ưu SEO</h3>

                    <div className="space-y-4">
                      <Input
                        name="seoTitle"
                        label="Tiêu đề SEO"
                        value={values.seoTitle}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        maxLength={60}
                        helperText={`${values.seoTitle?.length || 0}/60 ký tự`}
                        placeholder="Tiêu đề hiển thị trên Google..."
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
                          onBlur={handleBlur}
                          maxLength={160}
                          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                          placeholder="Mô tả ngắn hiển thị trên Google..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {values.seoDescription?.length || 0}/160 ký tự
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Trạng thái</h3>

                    <Select
                      value={values.status}
                      onChange={(value) => setFieldValue('status', value)}
                      options={[
                        { label: 'Bản nháp', value: 'DRAFT' },
                        { label: 'Xuất bản', value: 'PUBLISHED' },
                      ]}
                    />

                    <p className="text-sm text-gray-600 mt-2">
                      {values.status === 'DRAFT'
                        ? 'Sản phẩm chưa được xuất bản, chỉ bạn có thể xem'
                        : 'Sản phẩm đã được xuất bản và có thể được mua'}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Sticky Bottom Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 mt-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {Object.keys(errors).length > 0 && (
                <span className="text-red-600">
                  Có {Object.keys(errors).length} lỗi cần sửa
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Hủy
                </Button>
              )}
              <Button
                type="submit"
                loading={isSubmitting || uploading}
                disabled={isSubmitting || uploading}
                size="lg"
              >
                {product ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
