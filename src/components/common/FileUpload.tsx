import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { uploadService } from '../../services/upload.service';

interface UploadedFile {
  file: File;
  url?: string;
  uploading?: boolean;
  error?: string;
}

interface FileUploadProps {
  files: File[];
  uploadedUrls: string[]; // ✅ THÊM: URLs đã upload
  onFilesChange: (files: File[]) => void;
  onUrlsChange: (urls: string[]) => void; // ✅ THÊM: Callback cho URLs
  accept?: 'image' | 'document' | 'all';
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  className?: string;
  autoUpload?: boolean; // ✅ THÊM: Tự động upload khi chọn file
  label?: string;
  description?: string;
  required?: boolean;
  error?: string; // ✅ THÊM: Validation error
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  uploadedUrls,
  onFilesChange,
  onUrlsChange,
  accept = 'image',
  multiple = true,
  maxSize = 5,
  maxFiles = 10,
  className = '',
  autoUpload = true,
  label,
  description,
  required = false,
  error,
}) => {
  const [uploadingFiles, setUploadingFiles] = useState<Set<number>>(new Set());

  const acceptedTypes = {
    image: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    document: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        ['.docx'],
    },
    all: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
    },
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles = multiple
        ? [...files, ...acceptedFiles].slice(0, maxFiles)
        : acceptedFiles.slice(0, 1);

      onFilesChange(newFiles);

      // ✅ THÊM: Auto upload nếu enabled
      if (autoUpload && acceptedFiles.length > 0) {
        await uploadFiles(acceptedFiles);
      }
    },
    [files, multiple, maxFiles, onFilesChange, autoUpload],
  );

  // ✅ THÊM: Upload function
  const uploadFiles = async (filesToUpload: File[]) => {
    try {
      const uploadPromises = filesToUpload.map(async (file, index) => {
        const fileIndex = files.length + index;
        setUploadingFiles((prev) => new Set(prev).add(fileIndex));

        try {
          const result = await uploadService.uploadImage(file);
          return result.url;
        } catch (error) {
          console.error(`Upload failed for ${file.name}:`, error);
          return null;
        } finally {
          setUploadingFiles((prev) => {
            const newSet = new Set(prev);
            newSet.delete(fileIndex);
            return newSet;
          });
        }
      });

      const uploadResults = await Promise.all(uploadPromises);
      const validUrls = uploadResults.filter((url) => url !== null) as string[];

      onUrlsChange([...uploadedUrls, ...validUrls]);
    } catch (error) {
      console.error('Upload error:', error);
    }
  };

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: acceptedTypes[accept],
      maxSize: maxSize * 1024 * 1024,
      multiple,
      maxFiles: multiple ? maxFiles : 1,
    });

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = uploadedUrls.filter((_, i) => i !== index);
    onFilesChange(newFiles);
    onUrlsChange(newUrls);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <PhotoIcon className="w-6 h-6 text-blue-500" />;
    }
    return <DocumentIcon className="w-6 h-6 text-gray-500" />;
  };

  return (
    <div className={className}>
      {/* ✅ THÊM: Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* ✅ THÊM: Description */}
      {description && (
        <p className="text-sm text-gray-500 mb-3">{description}</p>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : error
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center">
          <PhotoIcon className="w-12 h-12 text-gray-400 mb-3" />

          {isDragActive ? (
            <p className="text-primary font-medium">Thả files vào đây...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-1">
                <span className="font-medium text-primary">Nhấp để chọn</span>{' '}
                hoặc kéo thả files
              </p>
              <p className="text-sm text-gray-500">
                {accept === 'image' && 'PNG, JPG, GIF'}
                {accept === 'document' && 'PDF, DOC, DOCX'}
                {accept === 'all' && 'Hình ảnh và tài liệu'} (tối đa {maxSize}MB
                mỗi file)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ THÊM: Validation Error */}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

      {/* File Rejections */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Một số files không thể tải lên:
          </h4>
          <ul className="text-sm text-red-700 space-y-1">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}: {errors.map((e) => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Uploaded Files */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Files đã chọn ({files.length}/{maxFiles})
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {/* ✅ THÊM: Image Preview */}
                  {file.type.startsWith('image/') && uploadedUrls[index] ? (
                    <img
                      src={uploadedUrls[index]}
                      alt={file.name}
                      className="w-12 h-12 object-cover rounded border"
                    />
                  ) : (
                    getFileIcon(file)
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>

                    {/* ✅ THÊM: Upload Status */}
                    {uploadingFiles.has(index) && (
                      <div className="flex items-center mt-1">
                        <LoadingSpinner size="sm" />
                        <span className="text-xs text-blue-600 ml-1">
                          Đang tải...
                        </span>
                      </div>
                    )}

                    {uploadedUrls[index] && (
                      <span className="text-xs text-green-600">
                        ✓ Đã tải lên
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {/* ✅ THÊM: Preview Button */}
                  {uploadedUrls[index] && (
                    <button
                      onClick={() => window.open(uploadedUrls[index], '_blank')}
                      className="text-gray-400 hover:text-blue-500"
                      title="Xem"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500"
                    title="Xóa"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
