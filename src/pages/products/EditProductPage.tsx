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
} from '@heroicons/react/24/outline';
import { useForm } from '../../hooks/common/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileUpload } from '../../components/common/FileUpload';
import { Toggle } from '../../components/ui/Toggle';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
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

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [variants, setVariants] = useState<any[]>([]);
  const [productAttributes, setProductAttributes] = useState<
    Record<string, any>
  >({});

  const initialValues: UpdateProductRequest = {
    name: '',
    description: '',
    price: 0,
    discountPrice: 0,
    quantity: 0,
    minOrderQty: 1,
    maxOrderQty: 0,
    sku: '',
    weight: 0,
    isCustomizable: false,
    allowNegotiation: true,
    categoryIds: [],
    tags: [],
    attributes: {},
    specifications: {},
  };

  const validate = (values: UpdateProductRequest) => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) {
      errors.name = 'Tên sản phẩm là bắt buộc';
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
      setFieldValue('weight', product.weight || 0);
      setFieldValue('isCustomizable', product.isCustomizable || false);
      setFieldValue('allowNegotiation', product.allowNegotiation ?? true);
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

  const handleCategoryToggle = (categoryId: string) => {
    const currentCategories = values.categoryIds || [];
    let newCategories;

    if (currentCategories.includes(categoryId)) {
      newCategories = currentCategories.filter((id) => id !== categoryId);
    } else {
      newCategories = [...currentCategories, categoryId];
    }

    setFieldValue('categoryIds', newCategories);
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setExistingImages(existingImages.filter((url) => url !== imageUrl));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
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

  return (
    <>
      <Helmet>
        <title>Chỉnh sửa: {product.name} - Artisan Connect</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <PencilIcon className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Chỉnh sửa sản phẩm
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                Cập nhật thông tin cho "{product.name}"
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <button
              onClick={() => navigate('/products')}
              className="hover:text-primary"
            >
              Sản phẩm của tôi
            </button>
            <span>/</span>
            <button
              onClick={() => navigate(`/products/${productId}`)}
              className="hover:text-primary"
            >
              {product.name}
            </button>
            <span>/</span>
            <span className="text-gray-900">Chỉnh sửa</span>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <InformationCircleIcon className="w-6 h-6 mr-2 text-primary" />
                  Thông tin cơ bản
                </h2>

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
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mô tả sản phẩm
                    </label>
                    <textarea
                      name="description"
                      rows={4}
                      value={values.description || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Mô tả chi tiết về sản phẩm..."
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      name="sku"
                      label="Mã SKU"
                      value={values.sku || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Mã sản phẩm"
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
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <PhotoIcon className="w-6 h-6 mr-2 text-primary" />
                  Hình ảnh sản phẩm
                </h2>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Hình ảnh hiện tại ({existingImages.length})
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {existingImages.map((imageUrl, index) => (
                        <div
                          key={index}
                          className="relative group aspect-square"
                        >
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
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
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
                  <p className="mt-2 text-sm text-red-600">{errors.images}</p>
                )}
              </Card>

              {/* Product Attributes */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <SwatchIcon className="w-6 h-6 mr-2 text-primary" />
                  Thuộc tính sản phẩm
                </h2>

                <ProductAttributesForm
                  categoryIds={values.categoryIds || []}
                  attributes={productAttributes}
                  onAttributesChange={setProductAttributes}
                />
              </Card>

              {/* Product Variants */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <Cog6ToothIcon className="w-6 h-6 mr-2 text-primary" />
                  Biến thể sản phẩm
                </h2>

                <ProductVariantManager
                  variants={variants}
                  onVariantsChange={setVariants}
                  basePrice={values.price || 0}
                  categoryIds={values.categoryIds || []}
                />
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Pricing */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <CurrencyDollarIcon className="w-5 h-5 mr-2 text-primary" />
                  Giá và số lượng
                </h3>

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
                    placeholder="0"
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
                    placeholder="Để trống nếu không có"
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

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      name="minOrderQty"
                      label="Tối thiểu"
                      type="number"
                      value={values.minOrderQty || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="1"
                      size="sm"
                    />

                    <Input
                      name="maxOrderQty"
                      label="Tối đa"
                      type="number"
                      value={values.maxOrderQty || ''}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Không giới hạn"
                      size="sm"
                    />
                  </div>
                </div>
              </Card>

              {/* Categories */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TagIcon className="w-5 h-5 mr-2 text-primary" />
                  Danh mục
                </h3>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={(values.categoryIds || []).includes(
                          category.id,
                        )}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="mr-3"
                      />
                      <span className="text-sm">{category.name}</span>
                    </label>
                  ))}
                </div>

                {touched.categoryIds && errors.categoryIds && (
                  <p className="mt-2 text-sm text-red-600">
                    {errors.categoryIds}
                  </p>
                )}
              </Card>

              {/* Tags */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thẻ sản phẩm
                </h3>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === 'Enter' &&
                        (e.preventDefault(), handleAddTag())
                      }
                      placeholder="Thêm thẻ..."
                      className="flex-1"
                      size="sm"
                    />
                    <Button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                      size="sm"
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
              </Card>

              {/* Settings */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Cài đặt
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Cho phép tùy chỉnh
                      </label>
                      <p className="text-xs text-gray-500">
                        Khách hàng có thể yêu cầu tùy chỉnh
                      </p>
                    </div>
                    <Toggle
                      checked={values.isCustomizable || false}
                      onChange={(checked) =>
                        setFieldValue('isCustomizable', checked)
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900">
                        Cho phép thương lượng
                      </label>
                      <p className="text-xs text-gray-500">
                        Khách hàng có thể thương lượng giá
                      </p>
                    </div>
                    <Toggle
                      checked={values.allowNegotiation ?? true}
                      onChange={(checked) =>
                        setFieldValue('allowNegotiation', checked)
                      }
                    />
                  </div>
                </div>
              </Card>

              {/* Actions */}
              <Card className="p-6">
                <div className="space-y-3">
                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={uploading}
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
              </Card>
            </div>
          </div>
        </form>

        {uploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg text-center">
              <LoadingSpinner size="lg" />
              <p className="mt-4">Đang tải ảnh lên...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
