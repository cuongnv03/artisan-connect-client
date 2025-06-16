import React, { useState, useEffect } from 'react';
import { useProductForm } from '../../../../hooks/products/useProductForm';
import { productService, uploadService } from '../../../../services';
import { CreateProductRequest, Category } from '../../../../types/product';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card } from '../../../ui/Card';
import { Badge } from '../../../ui/Badge';
import { Select } from '../../../ui/Dropdown';
import { PhotoIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';

interface ProductFormProps {
  initialData?: Partial<CreateProductRequest>;
  productId?: string;
  onSuccess?: (product: any) => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  productId,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>(
    initialData?.images || [],
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
  };

  const categoryOptions = categories.map((cat) => ({
    label: cat.name,
    value: cat.id,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin cơ bản
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              name="name"
              label="Tên sản phẩm"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name ? errors.name : undefined}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả sản phẩm
            </label>
            <textarea
              name="description"
              rows={4}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.description && errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <Input
            name="price"
            label="Giá gốc"
            type="number"
            value={values.price}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.price ? errors.price : undefined}
            required
          />

          <Input
            name="discountPrice"
            label="Giá khuyến mãi"
            type="number"
            value={values.discountPrice || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.discountPrice ? errors.discountPrice : undefined}
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
            name="sku"
            label="Mã SKU"
            value={values.sku || ''}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </div>
      </Card>

      {/* Categories */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Danh mục sản phẩm
        </h3>

        <div className="space-y-4">
          <Select
            value=""
            onChange={(categoryId) => {
              if (categoryId && !values.categoryIds.includes(categoryId)) {
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
            <div className="flex flex-wrap gap-2">
              {values.categoryIds.map((categoryId) => {
                const category = categories.find((c) => c.id === categoryId);
                return (
                  <Badge
                    key={categoryId}
                    variant="secondary"
                    className="cursor-pointer hover:bg-gray-300"
                    onClick={() => {
                      setFieldValue(
                        'categoryIds',
                        values.categoryIds.filter((id) => id !== categoryId),
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
            <p className="text-sm text-red-600">{errors.categoryIds}</p>
          )}
        </div>
      </Card>

      {/* Images */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hình ảnh sản phẩm
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
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

            <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
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
                  <PlusIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Thêm ảnh</span>
                </>
              )}
            </label>
          </div>

          {touched.images && errors.images && (
            <p className="text-sm text-red-600">{errors.images}</p>
          )}
        </div>
      </Card>

      {/* Settings */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cài đặt bán hàng
        </h3>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isCustomizable"
              checked={values.isCustomizable}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Cho phép tùy chỉnh sản phẩm
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="allowNegotiation"
              checked={values.allowNegotiation}
              onChange={handleChange}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Cho phép thương lượng giá
            </label>
          </div>
        </div>
      </Card>

      {/* Submit */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => window.history.back()}
        >
          Hủy
        </Button>
        <Button type="submit" loading={submitting} disabled={isSubmitting}>
          {isEditing ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
        </Button>
      </div>
    </form>
  );
};
