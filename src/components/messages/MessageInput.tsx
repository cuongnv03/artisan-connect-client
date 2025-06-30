import React, { useState, useRef, useCallback } from 'react';
import {
  PaperAirplaneIcon,
  PhotoIcon,
  DocumentIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { useForm } from '../../hooks/common/useForm';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onSendMedia: (file: File, type: 'image' | 'file') => Promise<void>;
  onShowCustomOrderForm: () => void;
  onTyping: (content: string) => void;
  sending: boolean;
  uploadingMedia?: boolean;
}

interface MessageFormData {
  content: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onSendMedia,
  onShowCustomOrderForm,
  onTyping,
  sending,
  uploadingMedia = false,
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const { values, handleChange, handleSubmit, resetForm } =
    useForm<MessageFormData>({
      initialValues: { content: '' },
      validate: (values) => {
        const errors: Record<string, string> = {};
        if (!values.content.trim()) {
          errors.content = 'Tin nhắn không được để trống';
        }
        return errors;
      },
      onSubmit: async (data) => {
        await onSendMessage(data.content);
        resetForm();
      },
    });

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e);
    onTyping(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // ENHANCED: Handle file uploads with validation
  const handleFileUpload = useCallback(
    async (files: FileList | null, forceType?: 'image' | 'file') => {
      if (!files || files.length === 0) return;

      const file = files[0];

      // Determine file type
      let fileType: 'image' | 'file' = forceType || 'file';
      if (!forceType) {
        if (file.type.startsWith('image/')) {
          fileType = 'image';
        }
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File không được vượt quá 10MB');
        return;
      }

      // Validate file type for images
      if (fileType === 'image') {
        const allowedImageTypes = [
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/gif',
        ];
        if (!allowedImageTypes.includes(file.type)) {
          alert('Chỉ chấp nhận file ảnh: JPEG, PNG, WebP, GIF');
          return;
        }
      }

      try {
        await onSendMedia(file, fileType);
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    },
    [onSendMedia],
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files, 'image');
    e.target.value = '';
  };

  const handleDocumentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files, 'file');
    e.target.value = '';
  };

  // ENHANCED: Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const files = e.dataTransfer.files;
      handleFileUpload(files);
    },
    [handleFileUpload],
  );

  const isDisabled = sending || uploadingMedia;

  return (
    <div
      className={`bg-white border-t border-gray-200 p-4 flex-shrink-0 transition-colors ${
        dragOver ? 'bg-blue-50 border-blue-300' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div className="absolute inset-0 bg-blue-100 bg-opacity-75 flex items-center justify-center z-10">
          <div className="text-center">
            <PhotoIcon className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-700 font-medium">Thả file để gửi</p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex items-end space-x-3 relative"
      >
        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* Photo Upload */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            disabled={isDisabled}
            title="Gửi hình ảnh"
            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
          >
            <PhotoIcon className="w-5 h-5" />
          </Button>

          {/* Document Upload */}
          {/* <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isDisabled}
            title="Gửi tài liệu"
            className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <DocumentIcon className="w-5 h-5" />
          </Button> */}

          {/* Custom Order Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onShowCustomOrderForm}
            disabled={isDisabled}
            title="Tạo đề xuất custom order"
            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
          >
            <WrenchScrewdriverIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            name="content"
            rows={1}
            className="block w-full rounded-lg border-gray-300 resize-none focus:border-primary focus:ring-primary placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={
              uploadingMedia
                ? 'Đang tải file...'
                : sending
                ? 'Đang gửi...'
                : 'Nhập tin nhắn...'
            }
            value={values.content}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isDisabled}
            style={{
              minHeight: '44px',
              maxHeight: '120px',
              resize: 'none',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 120) + 'px';
            }}
          />
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          disabled={!values.content.trim() || isDisabled}
          className="rounded-full p-3 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          title="Gửi tin nhắn"
        >
          {sending ? (
            <LoadingSpinner size="sm" className="text-white" />
          ) : (
            <PaperAirplaneIcon className="w-5 h-5 text-white" />
          )}
        </Button>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.rtf"
          onChange={handleDocumentUpload}
          className="hidden"
        />
      </form>

      {/* Upload Status */}
      {uploadingMedia && (
        <div className="mt-2 text-sm text-blue-600 flex items-center">
          <LoadingSpinner size="sm" className="mr-2" />
          Đang tải file...
        </div>
      )}
    </div>
  );
};
