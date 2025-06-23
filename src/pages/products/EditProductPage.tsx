import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  PencilIcon,
  PhotoIcon,
  TagIcon,
  CurrencyDollarIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useForm } from '../../hooks/common/useForm';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { FileUpload } from '../../components/common/FileUpload';
import { Toggle } from '../../components/ui/Toggle';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useProduct } from '../../hooks/products/useProduct';
import { useCategories } from '../../hooks/products/useCategories';
import { useToastContext } from '../../contexts/ToastContext';
import { uploadService } from '../../services/upload.service';
import { productService } from '../../services/product.service';
import { UpdateProductRequest } from '../../types/product';

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

  // Initialize form when product loads
  useEffect(() => {
    if (product) {
      setExistingImages(product.images);
      setTags(product.tags || []);

      // Set form values
      Object.keys(initialValues).forEach((key) => {
        const value = product[key as keyof typeof product];
        if (value !== undefined) {
          setFieldValue(key, value);
        }
      });

      // Set category IDs
      if (product.categories) {
        setFieldValue(
          'categoryIds',
          product.categories.map((cat) => cat.id),
        );
      }
    }
  }, [product]);

  const initialValues: UpdateProductRequest = {
    name: '',
    description: '',
    price: 0,
    discountPrice: undefined,
    quantity: 0,
    minOrderQty: 1,
    maxOrderQty: undefined,
    sku: '',
    weight: undefined,
    isCustomizable: false,
    allowNegotiation: true,
    categoryIds: [],
    tags: [],
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

        // Combine existing and new images
        const allImages = [...existingImages, ...newImageUrls];

        const productData = {
          ...data,
          images: allImages,
          featuredImage: allImages[0],
          tags,
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <PencilIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">
              Chỉnh sửa sản phẩm
            </h1>
          </div>
          <p className="text-lg text-gray-600">
            Cập nhật thông tin cho "{product.name}"
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <InformationCircleIcon className="w-6 h-6 mr-2" />
              Thông tin cơ bản
            </h2>

            <div className="grid grid-cols-1 gap-6">
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
                  rows={4}
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  name="sku"
                  label="Mã SKU"
                  value={values.sku}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />

                <Input
                  name="weight"
                  label="Trọng lượng (kg)"
                  type="number"
                  step="0.1"
                  value={values.weight || ''}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <PhotoIcon className="w-6 h-6 mr-2" />
              Hình ảnh sản phẩm
            </h2>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Hình ảnh hiện tại
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(imageUrl)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
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

          {/* Pricing */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CurrencyDollarIcon className="w-6 h-6 mr-2" />
              Giá và số lượng
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                name="price"
                label="Giá bán"
                type="number"
                value={values.price || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.price ? errors.price : undefined}
                required
                leftIcon={<span className="text-gray-500">₫</span>}
              />

              <Input
                name="discountPrice"
                label="Giá khuyến mãi"
                type="number"
                value={values.discountPrice || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.discountPrice ? errors.discountPrice : undefined}
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
              />

              <Input
                name="minOrderQty"
                label="Số lượng đặt hàng tối thiểu"
                type="number"
                value={values.minOrderQty || ''}
                onChange={handleChange}
                onBlur={handleBlur}
              />
            </div>
          </Card>

          {/* Categories */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <TagIcon className="w-6 h-6 mr-2" />
              Danh mục sản phẩm
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={(values.categoryIds || []).includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="mr-3"
                  />
                  <span className="text-sm">{category.name}</span>
                </label>
              ))}
            </div>

            {touched.categoryIds && errors.categoryIds && (
              <p className="mt-2 text-sm text-red-600">{errors.categoryIds}</p>
            )}
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Thẻ sản phẩm
            </h2>

            <div className="space-y-4">
              <div className="flex gap-2">
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
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
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
                      className="cursor-pointer"
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
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Cài đặt sản phẩm
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    Cho phép tùy chỉnh
                  </h3>
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
                  <h3 className="text-sm font-medium text-gray-900">
                    Cho phép thương lượng
                  </h3>
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
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/products/${productId}`)}
              disabled={isSubmitting || uploading}
            >
              Hủy
            </Button>

            <Button type="submit" loading={isSubmitting} disabled={uploading}>
              Cập nhật sản phẩm
            </Button>
          </div>
        </form>

        {uploading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-center">Đang tải ảnh lên...</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
