import React, { useState } from 'react';
import { Button } from '../../../../components/form/Button';
import { PaperAirplaneIcon, PaperClipIcon } from '@heroicons/react/24/outline';

interface MessageInputProps {
  onSend: (content: string, attachments: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() && attachments.length === 0) return;

    onSend(content, attachments);
    setContent('');
    setAttachments([]);
  };

  // For simplicity, we're just using this as a placeholder for file upload functionality
  // In a real implementation, you would use a file upload service like AWS S3 or your backend
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Simulating file upload delay
    setTimeout(() => {
      // In a real implementation, this would be the URL returned from your upload service
      const newAttachments = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      );

      setAttachments([...attachments, ...newAttachments]);
      setIsUploading(false);
    }, 1000);
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((attachment, index) => (
            <div
              key={index}
              className="bg-gray-100 rounded-md p-2 text-xs flex items-center"
            >
              <span className="truncate max-w-[150px]">
                Attachment {index + 1}
              </span>
              <button
                type="button"
                className="ml-2 text-gray-500 hover:text-gray-700"
                onClick={() => removeAttachment(index)}
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isUploading}
            className="w-full border-gray-300 rounded-full px-4 py-2 pr-10 focus:border-accent focus:ring-accent"
          />

          <label className="absolute right-3 top-2.5 cursor-pointer">
            <PaperClipIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
            <input
              type="file"
              multiple
              className="sr-only"
              onChange={handleFileUpload}
              disabled={disabled || isUploading}
            />
          </label>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="sm"
          isLoading={isUploading}
          disabled={
            disabled ||
            isUploading ||
            (!content.trim() && attachments.length === 0)
          }
        >
          <PaperAirplaneIcon className="h-5 w-5" />
        </Button>
      </div>
    </form>
  );
};
