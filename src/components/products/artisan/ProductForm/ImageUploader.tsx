import React, { useState } from 'react';
import { uploadService } from '../../../../services';
import { Button } from '../../../ui/Button';
import { Badge } from '../../../ui/Badge';
import { useToastContext } from '../../../../contexts/ToastContext';
import {
  PhotoIcon,
  XMarkIcon,
  StarIcon,
  CloudArrowUpIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

interface ImageUploaderProps {
  images: string[];
  featuredImage?: string;
  onChange: (images: string[]) => void;
  onFeaturedChange: (featured: string) => void;
  error?: string;
  maxImages?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  featuredImage,
  onChange,
  onFeaturedChange,
  error,
  maxImages = 10,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { success, error: showError } = useToastContext();

  const handleImageUpload = async (files: FileList) => {
    if (!files.length || images.length >= maxImages) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files)
        .slice(0, maxImages - images.length)
        .map((file) => {
          const validation = uploadService.validateImageFile(file);
          if (!validation.valid) {
            throw new Error(validation.error);
          }
          return uploadService.uploadImage(file, { folder: 'products' });
        });

      const uploadResults = await Promise.all(uploadPromises);
      const newImages = uploadResults.map((result) => result.url);

      const updatedImages = [...images, ...newImages];
      onChange(updatedImages);

      // Set first image as featured if no featured image set
      if (!featuredImage && updatedImages.length > 0) {
        onFeaturedChange(updatedImages[0]);
      }

      success(`Tải lên ${newImages.length} ảnh thành công`);
    } catch (err: any) {
      showError(err.message || 'Không thể tải ảnh');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    const updatedImages = images.filter((_, i) => i !== index);
    onChange(updatedImages);

    // Reset featured image if removed
    if (imageToRemove === featuredImage) {
      onFeaturedChange(updatedImages.length > 0 ? updatedImages[0] : '');
    }
  };

  const setFeatured = (image: string) => {
    onFeaturedChange(image);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onChange(newImages);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Thêm hình ảnh *
        </label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 bg-gray-50 hover:bg-gray-100">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) =>
              e.target.files && handleImageUpload(e.target.files)
            }
            disabled={uploading || images.length >= maxImages}
          />
          {uploading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          ) : (
            <>
              <CloudArrowUpIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Kéo thả hoặc click để chọn ảnh
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG, WEBP tối đa 10MB ({images.length}/{maxImages})
              </span>
            </>
          )}
        </label>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>

      {/* Image Grid */}
      {images.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Hình ảnh đã chọn ({images.length})
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border">
                  <img
                    src={image}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Featured Badge */}
                {image === featuredImage && (
                  <Badge
                    variant="primary"
                    className="absolute top-2 left-2"
                    size="sm"
                  >
                    <StarIconSolid className="w-3 h-3 mr-1" />
                    Ảnh chính
                  </Badge>
                )}

                {/* Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="bg-white"
                    onClick={() => setPreviewImage(image)}
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                  {image !== featuredImage && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setFeatured(image)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <StarIcon className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => removeImage(index)}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </Button>
                </div>

                {/* Move buttons */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => moveImage(index, index - 1)}
                      className="bg-white shadow-sm"
                    >
                      ↑
                    </Button>
                  )}
                  {index < images.length - 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => moveImage(index, index + 1)}
                      className="bg-white shadow-sm"
                    >
                      ↓
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-full object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 hover:bg-opacity-75"
            >
              <XMarkIcon className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
