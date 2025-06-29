import React, { useState, useRef } from 'react';
import {
  PaperAirplaneIcon,
  PhotoIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMedia(file, 'image');
    }
    e.target.value = '';
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        {/* Action Buttons */}
        <div className="flex space-x-2">
          {/* Photo Upload */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingMedia}
            title="Gửi hình ảnh"
            className="p-2 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
          >
            <PhotoIcon className="w-5 h-5" />
          </Button>

          {/* Custom Order Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onShowCustomOrderForm}
            disabled={uploadingMedia}
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
            className="block w-full rounded-lg border-gray-300 resize-none focus:border-primary focus:ring-primary placeholder-gray-400"
            placeholder="Nhập tin nhắn..."
            value={values.content}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={uploadingMedia}
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
          disabled={!values.content.trim() || sending || uploadingMedia}
          loading={sending}
          className="rounded-full p-3 bg-primary hover:bg-primary-dark disabled:opacity-50"
          title="Gửi tin nhắn"
        >
          <PaperAirplaneIcon className="w-5 h-5 text-white" />
        </Button>

        {/* Hidden file input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
      </form>

      {uploadingMedia && (
        <div className="mt-2 text-sm text-gray-500 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
          Đang tải ảnh...
        </div>
      )}
    </div>
  );
};
