import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  PencilIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
  SwatchIcon,
  ArrowLeftIcon,
  EyeIcon,
  DocumentTextIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useForm } from '../../hooks/common/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileUpload } from '../../components/common/FileUpload';
import { Toggle } from '../../components/ui/Toggle';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Tabs } from '../../components/ui/Tabs';
import { ProductVariantManager } from '../../components/products/ProductVariantManager';
import { ProductAttributesForm } from '../../components/products/ProductAttributesForm';
import { useProduct } from '../../hooks/products/useProduct';
import { useCategories } from '../../hooks/products/useCategories';
import { useToastContext } from '../../contexts/ToastContext';
import { uploadService } from '../../services/upload.service';
import { productService } from '../../services/product.service';
import { UpdateProductRequest, ProductStatus } from '../../types/product';

export const EditProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { success, error: showError } = useToastContext();
  const {
    product,
    loading: productLoading,
    error: productError,
  } = useProduct(productId!, true);
  const { categories } = useCategories();

  // Form states
  const [activeTab, setActiveTab] = useState('basic');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [variants, setVariants] = useState<any[]>([]);
  const [productAttributes, setProductAttributes] = useState<
    Record<string, any>
  >({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const initialValues: UpdateProductRequest = {
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    quantity: 0,
    minOrderQty: 1,
    maxOrderQty: 0,
    sku: '',
    barcode: '',
    weight: 0,
    dimensions: {},
    isCustomizable: false,
    allowNegotiation: true,
    categoryIds: [],
    tags: [],
    seoTitle: '',
    seoDescription: '',
    attributes: {},
    specifications: {},
  };

  const validate = (values: UpdateProductRequest) => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) {
      errors.name = 'Tên sản phẩm là bắt buộc';
    } else if (values.name.length < 3) {
      errors.name = 'Tên sản phẩm phải có ít nhất 3 ký tự';
    }

    if (!values.description?.trim()) {
      errors.description = 'Mô tả sản phẩm là bắt buộc';
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

    if (existingImages.length === 0 && imageFiles.length === 0) {
      errors.images = 'Phải có ít nhất một hình ảnh';
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
  } = useForm<UpdateProductRequest>({
    initialValues,
    validate,
    onSubmit: async (data) => {
      if (!productId) return;

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
        };

        await productService.updateProduct(productId, productData);
        success('Cập nhật sản phẩm thành công!');
        setHasUnsavedChanges(false);
        navigate(`/products/${productId}`);
      } catch (err: any) {
        showError(err.message || 'Không thể cập nhật sản phẩm');
      } finally {
        setUploading(false);
      }
    },
  });

  // Initialize form when product loads
  useEffect(() => {
    if (product) {
      setExistingImages(product.images || []);
      setTags(product.tags || []);
      setVariants(product.variants || []);
      setProductAttributes(product.attributes || {});

      // Reset form with product data
      resetForm();

      // Set form values safely
      setFieldValue('name', product.name || '');
      setFieldValue('description', product.description || '');
      setFieldValue('price', product.price || 0);
      setFieldValue('discountPrice', product.discountPrice || 0);
      setFieldValue('quantity', product.quantity || 0);
      setFieldValue('minOrderQty', product.minOrderQty || 1);
      setFieldValue('maxOrderQty', product.maxOrderQty || 0);
      setFieldValue('sku', product.sku || '');
      setFieldValue('barcode', product.barcode || '');
      setFieldValue('weight', product.weight || 0);
      setFieldValue('isCustomizable', product.isCustomizable || false);
      setFieldValue('allowNegotiation', product.allowNegotiation ?? true);
      setFieldValue('seoTitle', product.seoTitle || '');
      setFieldValue('seoDescription', product.seoDescription || '');
      setFieldValue('attributes', product.attributes || {});
      setFieldValue('specifications', product.specifications || {});

      // Set category IDs
      if (product.categories) {
        setFieldValue(
          'categoryIds',
          product.categories.map((cat) => cat.id),
        );
      }
    }
  }, [product, setFieldValue, resetForm]);

  // Track changes
  useEffect(() => {
    const checkChanges = () => {
      if (!product) return;

      const hasChanges =
        values.name !== product.name ||
        values.description !== product.description ||
        values.price !== product.price ||
        JSON.stringify(tags) !== JSON.stringify(product.tags || []) ||
        imageFiles.length > 0 ||
        existingImages.length !== (product.images?.length || 0);

      setHasUnsavedChanges(hasChanges);
    };

    checkChanges();
  }, [values, tags, imageFiles, existingImages, product]);

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = values.categoryIds || [];
    const newCategories = currentCategories.includes(categoryId)
      ? currentCategories.filter((id) => id !== categoryId)
      : [...currentCategories, categoryId];
    setFieldValue('categoryIds', newCategories);
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter((url) => url !== imageUrl));
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

  const handleQuickPublish = async () => {
    if (!productId) return;

    try {
      await productService.publishProduct(productId);
      success('Đã đăng bán sản phẩm');
      navigate(`/products/${productId}`);
    } catch (err: any) {
      showError(err.message || 'Không thể đăng bán sản phẩm');
    }
  };

  const handleQuickUnpublish = async () => {
    if (!productId) return;

    try {
      await productService.unpublishProduct(productId);
      success('Đã ẩn sản phẩm');
      navigate(`/products/${productId}`);
    } catch (err: any) {
      showError(err.message || 'Không thể ẩn sản phẩm');
    }
  };

  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (productError || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {productError || 'Không tìm thấy sản phẩm'}
          </p>
          <Button onClick={() => navigate('/products')}>
            Quay lại danh sách
          </Button>
        </div>
      </div>
    );
  }

  const formTabs = [
    {
      key: 'basic',
      label: 'Thông tin cơ bản',
      icon: <InformationCircleIcon className="w-4 h-4" />,
      content: (
        <Card className="p-6">
          <div className="space-y-6">
            <Input
              name="name"
              label="Tên sản phẩm"
              value={values.name || ''}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name ? errors.name : undefined}
              required
              placeholder="Nhập tên sản phẩm..."
              className="text-lg"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả sản phẩm <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows={6}
                value={values.description || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Mô tả chi tiết về sản phẩm..."
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
                value={values.sku || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Mã sản phẩm"
              />

              <Input
                name="barcode"
                label="Mã vạch"
                value={values.barcode || ''}
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
      ),
    },
    {
      key: 'media',
      label: 'Hình ảnh',
      icon: <PhotoIcon className="w-4 h-4" />,
      content: (
        <Card className="p-6">
          <div className="space-y-6">
            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Hình ảnh hiện tại ({existingImages.length})
                </h3>
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

            {/* New Images Upload */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Thêm hình ảnh mới
              </h3>
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
          </div>
        </Card>
      ),
    },
    // ... (các tab khác tương tự như CreateProductPage)
  ];

  return (
    <>
      <Helmet>
        <title>Chỉnh sửa: {product.name} - Artisan Connect</title>
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
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <PencilIcon className="w-8 h-8 text-primary mr-3" />
                Chỉnh sửa sản phẩm
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Cập nhật thông tin cho "{product.name}"
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => navigate(`/products/${productId}`)}
                leftIcon={<EyeIcon className="w-4 h-4" />}
              >
                Xem chi tiết
              </Button>

              {product.status === 'DRAFT' ? (
                <Button
                  variant="secondary"
                  onClick={handleQuickPublish}
                  leftIcon={<ClockIcon className="w-4 h-4" />}
                >
                  Đăng bán ngay
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleQuickUnpublish}
                  leftIcon={<ClockIcon className="w-4 h-4" />}
                >
                  Ẩn sản phẩm
                </Button>
              )}
            </div>
          </div>

          {/* Status & Changes Indicator */}
          <div className="flex items-center justify-between bg-white rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <Badge
                variant={
                  product.status === 'PUBLISHED'
                    ? 'success'
                    : product.status === 'DRAFT'
                    ? 'secondary'
                    : 'warning'
                }
              >
                {product.status === 'PUBLISHED'
                  ? 'Đang bán'
                  : product.status === 'DRAFT'
                  ? 'Nháp'
                  : 'Hết hàng'}
              </Badge>

              <span className="text-sm text-gray-600">
                Cập nhật lần cuối:{' '}
                {new Date(product.updatedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>

            {hasUnsavedChanges && (
              <Badge variant="warning" className="animate-pulse">
                Có thay đổi chưa lưu
              </Badge>
            )}
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
              {/* Save Actions */}
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">Lưu thay đổi</h3>
                <div className="space-y-3">
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={uploading || !hasUnsavedChanges}
                    className="w-full"
                  >
                    Cập nhật sản phẩm
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/products/${productId}`)}
                    disabled={isSubmitting || uploading}
                    className="w-full"
                  >
                    Hủy bỏ
                  </Button>
                </div>

                {hasUnsavedChanges && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ Bạn có thay đổi chưa được lưu
                    </p>
                  </div>
                )}
              </Card>

              {/* Product Summary */}
              <Card className="p-4">
                <h3 className="font-medium text-gray-900 mb-4">
                  Thông tin sản phẩm
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ID:</span>
                    <span className="font-mono text-xs">
                      {product.id.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lượt xem:</span>
                    <span className="font-medium">{product.viewCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Đã bán:</span>
                    <span className="font-medium">{product.salesCount}</span>
                  </div>
                  {product.avgRating && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đánh giá:</span>
                      <span className="font-medium">
                        ⭐ {product.avgRating.toFixed(1)} ({product.reviewCount}
                        )
                      </span>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Tips */}
              <Card className="p-4 bg-blue-50 border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">
                  💡 Mẹo tối ưu
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Cập nhật hình ảnh thường xuyên</li>
                  <li>• Theo dõi số lượng tồn kho</li>
                  <li>• Trả lời phản hồi khách hàng</li>
                  <li>• Cập nhật giá cạnh tranh</li>
                </ul>
              </Card>
            </div>
          </div>
        </form>

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
