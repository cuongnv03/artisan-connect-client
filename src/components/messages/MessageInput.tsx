import React, { useState, useRef } from 'react';
import {
  PaperAirplaneIcon,
  PhotoIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Dropdown } from '../ui/Dropdown';
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
    e.target.value = ''; // Reset input
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onSendMedia(file, 'file');
    }
    e.target.value = ''; // Reset input
  };

  const attachmentOptions = [
    {
      label: 'Hình ảnh',
      value: 'image',
      icon: <PhotoIcon className="w-4 h-4" />,
      onClick: () => imageInputRef.current?.click(),
    },
    {
      label: 'Tài liệu',
      value: 'file',
      icon: <DocumentIcon className="w-4 h-4" />,
      onClick: () => fileInputRef.current?.click(),
    },
  ];

  return (
    <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex space-x-2">
          {/* Photo Upload */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploadingMedia}
            title="Gửi hình ảnh"
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
          >
            <WrenchScrewdriverIcon className="w-5 h-5" />
          </Button>

          {/* More Attachments */}
          <Dropdown
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={uploadingMedia}
                title="Thêm tệp đính kèm"
              >
                <PlusIcon className="w-5 h-5" />
              </Button>
            }
            items={attachmentOptions}
            placement="top-start"
          />
        </div>

        <div className="flex-1">
          <textarea
            name="content"
            rows={1}
            className="block w-full rounded-lg border-gray-300 resize-none focus:border-primary focus:ring-primary"
            placeholder="Nhập tin nhắn..."
            value={values.content}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={uploadingMedia}
            style={{
              minHeight: '40px',
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

        <Button
          type="submit"
          disabled={!values.content.trim() || sending || uploadingMedia}
          loading={sending}
          leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
        >
          {uploadingMedia ? 'Đang tải...' : 'Gửi'}
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
          accept=".pdf,.doc,.docx,.txt,.zip,.rar"
          onChange={handleFileUpload}
          className="hidden"
        />
      </form>
    </div>
  );
};
