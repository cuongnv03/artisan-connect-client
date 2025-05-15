import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/form/Input';
import { Button } from '../../../components/form/Button';
import { Dropdown } from '../../../components/form/Dropdown';
import { TagInput } from '../../../components/form/TagInput';
import { Loader } from '../../../components/feedback/Loader';
import { Alert } from '../../../components/feedback/Alert';
import { ProductService } from '../../../services/product.service';
import { CategoryService } from '../../../services/category.service';
import { ProductStatus, ProductFormData } from '../../../types/product.types';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useToast } from '../../../hooks/useToast';

// Form validation schema using zod
const productSchema = z.object({
  name: z.string().min(3, 'Product name must be at least 3 characters'),
  description: z.string().optional(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  discountPrice: z.number().optional().nullable(),
  quantity: z.number().min(0, 'Quantity cannot be negative'),
  sku: z.string().optional(),
  weight: z.number().optional().nullable(),
  dimensions: z
    .object({
      length: z.number().optional().nullable(),
      width: z.number().optional().nullable(),
      height: z.number().optional().nullable(),
    })
    .optional()
    .nullable(),
  status: z.nativeEnum(ProductStatus),
  isCustomizable: z.boolean(),
  tags: z.array(z.string()),
  categoryIds: z.array(z.string()).optional(),
  attributes: z.record(z.string(), z.any()).optional(),
});

type FormData = z.infer<typeof productSchema>;

const ProductCreate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isEditMode = !!id;

  // State for file uploads
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Custom attributes
  const [attributes, setAttributes] = useState<
    { key: string; value: string }[]
  >([]);
  const [newAttrKey, setNewAttrKey] = useState('');
  const [newAttrValue, setNewAttrValue] = useState('');

  // Form setup with react-hook-form and zod validation
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      discountPrice: null,
      quantity: 1,
      status: ProductStatus.DRAFT,
      isCustomizable: false,
      tags: [],
      categoryIds: [],
    },
  });

  // Fetch categories for dropdown
  const { data: categories, isLoading: isCategoriesLoading } = useQuery(
    'categories',
    () => CategoryService.getCategories(),
  );

  // If in edit mode, fetch the product data
  const { data: productData, isLoading: isProductLoading } = useQuery(
    ['product', id],
    () => ProductService.getProductById(id!),
    {
      enabled: isEditMode,
      onSuccess: (data) => {
        // Transform product data to form data
        const formData: Partial<FormData> = {
          name: data.name,
          description: data.description || '',
          price: data.price,
          discountPrice: data.discountPrice || null,
          quantity: data.quantity,
          sku: data.sku || '',
          status: data.status,
          isCustomizable: data.isCustomizable,
          tags: data.tags || [],
          categoryIds: data.categories?.map((cat) => cat.id) || [],
        };

        if (data.dimensions) {
          formData.dimensions = data.dimensions;
        }

        if (data.weight) {
          formData.weight = data.weight;
        }

        if (data.attributes) {
          formData.attributes = data.attributes;
          // Convert attributes to the format used by our UI
          const attributesList = Object.entries(data.attributes).map(
            ([key, value]) => ({
              key,
              value: value.toString(),
            }),
          );
          setAttributes(attributesList);
        }

        // Set image previews from existing product images
        if (data.images && data.images.length > 0) {
          setImagePreviewUrls(data.images);
        }

        // Update form with product data
        reset(formData as FormData);
      },
    },
  );

  // Create new product mutation
  const createMutation = useMutation(
    (data: FormData & { imageFiles?: File[] }) => {
      // In a real implementation, you would handle file uploads here
      // For now, we'll just call the service method
      const formData = new FormData();

      // Append JSON data
      formData.append(
        'data',
        JSON.stringify({
          name: data.name,
          description: data.description,
          price: data.price,
          discountPrice: data.discountPrice,
          quantity: data.quantity,
          sku: data.sku,
          weight: data.weight,
          dimensions: data.dimensions,
          status: data.status,
          isCustomizable: data.isCustomizable,
          tags: data.tags,
          categoryIds: data.categoryIds,
          attributes: data.attributes,
        }),
      );

      // Append images
      if (images.length > 0) {
        images.forEach((file) => {
          formData.append('images', file);
        });
      }

      return isEditMode
        ? ProductService.updateProduct(id!, formData)
        : ProductService.createProduct(formData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myProducts');
        toast.success(
          isEditMode
            ? 'Product updated successfully!'
            : 'Product created successfully!',
        );
        navigate('/products/manage');
      },
      onError: (error: any) => {
        toast.error(
          error.message || 'Failed to save product. Please try again.',
        );
      },
    },
  );

  // Handle form submission
  const onSubmit = async (data: FormData) => {
    // Create a normalized attributes object from our UI state
    const attributesObj: Record<string, string> = {};
    attributes.forEach((attr) => {
      if (attr.key.trim() && attr.value.trim()) {
        attributesObj[attr.key.trim()] = attr.value.trim();
      }
    });

    await createMutation.mutate({
      ...data,
      attributes: attributesObj,
      imageFiles: images,
    });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);

      // Limit to 5 images
      const newImages = [...images, ...filesArray].slice(0, 5);
      setImages(newImages);

      // Generate preview URLs
      const newPreviewUrls = newImages.map((file) => URL.createObjectURL(file));
      setImagePreviewUrls(newPreviewUrls);
    }
  };

  // Remove image
  const handleRemoveImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...imagePreviewUrls];
    newPreviews.splice(index, 1);
    setImagePreviewUrls(newPreviews);
  };

  // Add attribute
  const handleAddAttribute = () => {
    if (newAttrKey.trim() && newAttrValue.trim()) {
      setAttributes([
        ...attributes,
        { key: newAttrKey.trim(), value: newAttrValue.trim() },
      ]);
      setNewAttrKey('');
      setNewAttrValue('');
    }
  };

  // Remove attribute
  const handleRemoveAttribute = (index: number) => {
    const newAttributes = [...attributes];
    newAttributes.splice(index, 1);
    setAttributes(newAttributes);
  };

  // Transform categories data for dropdown
  const categoryOptions =
    categories?.data?.map((category) => ({
      label: category.name,
      value: category.id,
    })) || [];

  // Status options for dropdown
  const statusOptions = Object.values(ProductStatus).map((status) => ({
    label: status
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    value: status,
  }));

  // Loading state
  if ((isEditMode && isProductLoading) || isCategoriesLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader
          size="lg"
          text={isEditMode ? 'Loading product...' : 'Loading...'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditMode ? 'Edit Product' : 'Create New Product'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Basic Information */}
          <Card className="overflow-visible">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>

            <div className="space-y-4">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Product Name"
                    placeholder="Enter product name"
                    error={errors.name?.message}
                    {...field}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      rows={4}
                      placeholder="Enter product description"
                      {...field}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.description.message}
                      </p>
                    )}
                  </div>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="price"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      label="Price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      leftAddon={<span className="text-gray-500">$</span>}
                      error={errors.price?.message}
                      value={value.toString()}
                      onChange={(e) =>
                        onChange(parseFloat(e.target.value) || 0)
                      }
                      {...rest}
                    />
                  )}
                />

                <Controller
                  name="discountPrice"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      label="Discount Price (Optional)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      leftAddon={<span className="text-gray-500">$</span>}
                      error={errors.discountPrice?.message}
                      value={value?.toString() || ''}
                      onChange={(e) => {
                        const val = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        onChange(val);
                      }}
                      {...rest}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="quantity"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      label="Quantity"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="0"
                      error={errors.quantity?.message}
                      value={value.toString()}
                      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
                      {...rest}
                    />
                  )}
                />

                <Controller
                  name="sku"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="SKU (Optional)"
                      placeholder="Enter product SKU"
                      error={errors.sku?.message}
                      {...field}
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Controller
                  name="status"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Dropdown
                      label="Status"
                      options={statusOptions}
                      value={value}
                      onChange={onChange}
                      error={errors.status?.message}
                    />
                  )}
                />

                <Controller
                  name="isCustomizable"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <div className="flex items-start pt-8">
                      <div className="flex items-center h-5">
                        <input
                          id="isCustomizable"
                          name="isCustomizable"
                          type="checkbox"
                          checked={value}
                          onChange={(e) => onChange(e.target.checked)}
                          className="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="isCustomizable"
                          className="font-medium text-gray-700"
                        >
                          Customizable Product
                        </label>
                        <p className="text-gray-500">
                          Allow customers to request custom specifications
                        </p>
                      </div>
                    </div>
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Categories & Tags */}
          <Card className="overflow-visible">
            <h2 className="text-xl font-semibold mb-4">Categories & Tags</h2>

            <div className="space-y-4">
              <Controller
                name="categoryIds"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categories
                    </label>
                    <select
                      multiple
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent"
                      value={value}
                      onChange={(e) => {
                        const options = Array.from(e.target.selectedOptions);
                        onChange(options.map((option) => option.value));
                      }}
                    >
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Hold Ctrl (Windows) or Command (Mac) to select multiple
                      categories
                    </p>
                  </div>
                )}
              />

              <Controller
                name="tags"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags
                    </label>
                    <TagInput
                      tags={value}
                      onChange={onChange}
                      placeholder="Add tags..."
                      max={10}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Press Enter or comma to add a tag
                    </p>
                  </div>
                )}
              />
            </div>
          </Card>

          {/* Specifications */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Specifications</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Controller
                  name="weight"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      label="Weight (kg)"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      error={errors.weight?.message}
                      value={value?.toString() || ''}
                      onChange={(e) => {
                        const val = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        onChange(val);
                      }}
                      {...rest}
                    />
                  )}
                />

                <Controller
                  name="dimensions.length"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      label="Length (cm)"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      value={value?.toString() || ''}
                      onChange={(e) => {
                        const val = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        onChange(val);
                      }}
                      {...rest}
                    />
                  )}
                />

                <Controller
                  name="dimensions.width"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      label="Width (cm)"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      value={value?.toString() || ''}
                      onChange={(e) => {
                        const val = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        onChange(val);
                      }}
                      {...rest}
                    />
                  )}
                />

                <Controller
                  name="dimensions.height"
                  control={control}
                  render={({ field: { onChange, value, ...rest } }) => (
                    <Input
                      label="Height (cm)"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="0.0"
                      value={value?.toString() || ''}
                      onChange={(e) => {
                        const val = e.target.value
                          ? parseFloat(e.target.value)
                          : null;
                        onChange(val);
                      }}
                      {...rest}
                    />
                  )}
                />
              </div>

              {/* Custom attributes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Attributes
                </label>

                {attributes.length > 0 && (
                  <div className="mb-4 border rounded-md divide-y">
                    {attributes.map((attr, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <span className="font-medium">{attr.key}:</span>{' '}
                          {attr.value}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttribute(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <Input
                    placeholder="Attribute name"
                    value={newAttrKey}
                    onChange={(e) => setNewAttrKey(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Attribute value"
                    value={newAttrValue}
                    onChange={(e) => setNewAttrValue(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddAttribute}
                    disabled={!newAttrKey.trim() || !newAttrValue.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Product Images */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Product Images</h2>

            <div className="space-y-4">
              {imagePreviewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                  {imagePreviewUrls.map((url, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={url}
                          alt={`Product image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        className="absolute top-1 right-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-full p-1"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {imagePreviewUrls.length < 5 && (
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-accent hover:text-accent-dark focus-within:outline-none"
                      >
                        <span>Upload images</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB (max 5 images)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Submit buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/products/manage')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting || createMutation.isLoading}
            >
              {isEditMode ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductCreate;
