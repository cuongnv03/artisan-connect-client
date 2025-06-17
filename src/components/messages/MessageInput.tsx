import React, { useState } from 'react';
import {
  PaperAirplaneIcon,
  PhotoIcon,
  PlusIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { useForm } from '../../hooks/common/useForm';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  onShowCustomOrderForm: () => void;
  onTyping: (content: string) => void;
  sending: boolean;
}

interface MessageFormData {
  content: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onShowCustomOrderForm,
  onTyping,
  sending,
}) => {
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

  return (
    <div className="bg-white border-t border-gray-200 p-4 flex-shrink-0">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex space-x-2">
          <Button type="button" variant="ghost" size="sm" disabled>
            <PhotoIcon className="w-5 h-5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onShowCustomOrderForm}
            title="Tạo đề xuất custom order"
          >
            <WrenchScrewdriverIcon className="w-5 h-5" />
          </Button>

          <Button type="button" variant="ghost" size="sm" disabled>
            <PlusIcon className="w-5 h-5" />
          </Button>
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
          disabled={!values.content.trim() || sending}
          loading={sending}
          leftIcon={<PaperAirplaneIcon className="w-4 h-4" />}
        >
          Gửi
        </Button>
      </form>
    </div>
  );
};
