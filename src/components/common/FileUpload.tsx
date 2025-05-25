import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  PhotoIcon,
  DocumentIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept?: 'image' | 'document' | 'all';
  multiple?: boolean;
  maxSize?: number; // in MB
  maxFiles?: number;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  files,
  onFilesChange,
  accept = 'image',
  multiple = true,
  maxSize = 5,
  maxFiles = 10,
  className = '',
}) => {
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
    (acceptedFiles: File[]) => {
      const newFiles = multiple
        ? [...files, ...acceptedFiles].slice(0, maxFiles)
        : acceptedFiles.slice(0, 1);
      onFilesChange(newFiles);
    },
    [files, multiple, maxFiles, onFilesChange],
  );

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
    onFilesChange(newFiles);
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
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${
            isDragActive
              ? 'border-primary bg-primary/5'
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

          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 truncate max-w-xs">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
