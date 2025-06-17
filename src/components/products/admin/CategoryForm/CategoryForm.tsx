import React from 'react';
import { useForm } from '../../../../hooks/useForm';
import {
  CreateCategoryRequest,
  UpdateCategoryRequest,
  Category,
} from '../../../../types/product';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { Card } from '../../../ui/Card';
import { Select } from '../../../ui/Dropdown';
import { uploadService } from '../../../../services/upload.service';
import { useToastContext } from '../../../../contexts/ToastContext';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface CategoryFormProps {
  initialData?: Partial<CreateCategoryRequest>;
  categoryId?: string;
  categories?: Category[]; // For parent selection
  onSubmit: (
    data: CreateCategoryRequest | UpdateCategoryRequest,
  ) => Promise<void>;
  onCancel?: () => void;
  isEditing?: boolean;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  initialData,
  categoryId,
  categories = [],
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const { success, error: showError } = useToastContext();
  const [uploading, setUploading] = React.useState(false);
  const [imageUrl, setImageUrl] = React.useState(initialData?.imageUrl || '');

  const validate = (values: CreateCategoryRequest) => {
    const errors: Record<string, string> = {};

    if (!values.name?.trim()) {
      errors.name = 'Tên danh mục là bắt buộc';
    } else if (values.name.length < 2) {
      errors.name = 'Tên danh mục phải có ít nhất 2 ký tự';
    } else if (values.name.length > 100) {
      errors.name = 'Tên danh mục không được quá 100 ký tự';
    }

    if (values.description && values.description.length > 500) {
      errors.description = 'Mô tả không được quá 500 ký tự';
    }

    if (values.sortOrder !== undefined && values.sortOrder < 0) {
      errors.sortOrder = 'Thứ tự sắp xếp phải là số không âm';
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
  } = useForm<CreateCategoryRequest>({
    initialValues: {
      name: '',
      description: '',
      imageUrl: '',
      parentId: '',
      sortOrder: 0,
      ...initialData,
    },
    validate,
    onSubmit: async (data) => {
      await onSubmit({
        ...data,
        imageUrl: imageUrl || undefined,
        parentId: data.parentId || undefined,
      });
    },
  });

  const handleImageUpload = async (files: FileList) => {
    if (!files.length) return;

    const file = files[0];
    const validation = uploadService.validateImageFile(file);

    if (!validation.valid) {
      showError(validation.error!);
      return;
    }

    setUploading(true);
    try {
      const result = await uploadService.uploadImage(file, {
        folder: 'categories',
        width: 300,
        height: 200,
      });
      setImageUrl(result.url);
      setFieldValue('imageUrl', result.url);
      success('Tải ảnh thành công');
    } catch (err: any) {
      showError(err.message || 'Không thể tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    setImageUrl('');
    setFieldValue('imageUrl', '');
  };

  // Filter categories to exclude current category and its descendants for parent selection
  const availableParentCategories = categories.filter(
    (cat) => cat.id !== categoryId && !cat.parentId, // Only show root categories for simplicity
  );

  const parentOptions = [
    { label: 'Không có danh mục cha', value: '' },
    ...availableParentCategories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    })),
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin cơ bản
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              name="name"
              label="Tên danh mục"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name ? errors.name : undefined}
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả danh mục
            </label>
            <textarea
              name="description"
              rows={3}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Mô tả ngắn về danh mục này..."
            />
            {touched.description && errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <Select
              label="Danh mục cha"
              value={values.parentId || ''}
              onChange={(value) => setFieldValue('parentId', value)}
              options={parentOptions}
            />
          </div>

          <div>
            <Input
              name="sortOrder"
              label="Thứ tự sắp xếp"
              type="number"
              value={values.sortOrder}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.sortOrder ? errors.sortOrder : undefined}
              min={0}
            />
          </div>
        </div>
      </Card>

      {/* Image Upload */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hình ảnh danh mục
        </h3>

        <div className="space-y-4">
          {imageUrl ? (
            <div className="relative inline-block">
              <img
                src={imageUrl}
                alt="Category preview"
                className="w-48 h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-gray-400">
              <input
                type="file"
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
                  <PhotoIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Tải ảnh lên</span>
                </>
              )}
            </label>
          )}

          <p className="text-sm text-gray-500">
            Khuyến nghị: Ảnh có tỷ lệ 3:2, kích thước tối thiểu 300x200px
          </p>
        </div>
      </Card>

      {/* Submit Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
          {isEditing ? 'Cập nhật danh mục' : 'Tạo danh mục'}
        </Button>
      </div>
    </form>
  );
};
