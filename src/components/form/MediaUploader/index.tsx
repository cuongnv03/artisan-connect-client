import React, { useState, useRef } from 'react';
import { Button } from '../Button';
import { Loader } from '../../feedback/Loader';
import { Alert } from '../../feedback/Alert';
import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { MediaService } from '../../../services/media.service';

interface MediaUploaderProps {
  type: 'image' | 'video';
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
  maxSize?: number; // in bytes
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  type,
  value,
  onChange,
  placeholder = 'Upload media',
  maxSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedTypes = {
    image: 'image/*',
    video: 'video/*',
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      setError(
        `File is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`,
      );
      return;
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    try {
      setIsUploading(true);
      setError(null);

      // Upload file
      const url = await MediaService.uploadMedia(
        file,
        type === 'image' ? 'images' : 'videos',
      );
      onChange(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div>
      {error && (
        <Alert
          type="error"
          variant="subtle"
          dismissible
          onDismiss={() => setError(null)}
          className="mb-3"
        >
          {error}
        </Alert>
      )}

      {value ? (
        <div className="relative">
          {type === 'image' ? (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
              <img
                src={value}
                alt="Uploaded media"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 rounded-full bg-gray-800/50 p-1 text-white hover:bg-gray-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
              <video
                src={value}
                controls
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 rounded-full bg-gray-800/50 p-1 text-white hover:bg-gray-800"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center rounded-lg border border-dashed border-gray-300 px-6 py-10">
          <div className="text-center">
            {isUploading ? (
              <Loader size="md" />
            ) : (
              <>
                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-medium text-accent hover:text-accent-dark focus-within:outline-none focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept={acceptedTypes[type]}
                      onChange={handleFileSelect}
                      ref={fileInputRef}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs leading-5 text-gray-600">
                  {type === 'image'
                    ? 'PNG, JPG, GIF up to 5MB'
                    : 'MP4, WebM up to 20MB'}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
