import React, { useState } from 'react';
import { Badge } from '../../../ui/Badge';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/Input';
import { PlusIcon, XMarkIcon, TagIcon } from '@heroicons/react/24/outline';

interface TagsEditorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  maxTags?: number;
  suggestions?: string[];
}

export const TagsEditor: React.FC<TagsEditorProps> = ({
  tags,
  onChange,
  maxTags = 10,
  suggestions = [
    'thủ công',
    'handmade',
    'truyền thống',
    'nghệ thuật',
    'độc đáo',
    'quà tặng',
    'trang trí',
    'vintage',
    'tự nhiên',
    'eco-friendly',
  ],
}) => {
  const [newTag, setNewTag] = useState('');

  // ✅ SỬA: Improved addTag function
  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      const updatedTags = [...tags, trimmedTag];
      onChange(updatedTags);
      return true;
    }
    return false;
  };

  // ✅ SỬA: Improved removeTag function
  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    onChange(updatedTags);
  };

  // ✅ SỬA: Handle manual tag input
  const handleAddTag = () => {
    if (newTag.trim() && addTag(newTag)) {
      setNewTag('');
    }
  };

  // ✅ SỬA: Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    if (addTag(suggestion)) {
      // Tag added successfully
    }
  };

  // ✅ SỬA: Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const availableSuggestions = suggestions.filter(
    (suggestion) => !tags.includes(suggestion.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Tags sản phẩm
        <span className="text-gray-500 ml-1">
          ({tags.length}/{maxTags})
        </span>
      </label>

      {/* Current Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border min-h-[48px]">
          {tags.map((tag, index) => (
            <Badge
              key={`${tag}-${index}`}
              variant="primary"
              className="group cursor-pointer hover:bg-red-500 transition-colors flex items-center"
              // ✅ SỬA: Proper onClick handler
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                removeTag(tag);
              }}
            >
              <TagIcon className="w-3 h-3 mr-1" />
              {tag}
              <XMarkIcon className="ml-1 w-3 h-3 group-hover:text-white" />
            </Badge>
          ))}
        </div>
      )}

      {/* Add New Tag */}
      <div className="flex space-x-2">
        <Input
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Nhập tag mới..."
          className="flex-1"
          onKeyPress={handleKeyPress}
          maxLength={30}
          disabled={tags.length >= maxTags}
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleAddTag}
          disabled={!newTag.trim() || tags.length >= maxTags}
          leftIcon={<PlusIcon className="w-4 h-4" />}
        >
          Thêm
        </Button>
      </div>

      {/* Tag Suggestions */}
      {availableSuggestions.length > 0 && tags.length < maxTags && (
        <div>
          <p className="text-sm text-gray-600 mb-2">Gợi ý tags phổ biến:</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 8).map((suggestion, index) => (
              <Badge
                key={`suggestion-${suggestion}-${index}`}
                variant="secondary"
                className="cursor-pointer hover:bg-blue-500 hover:text-white transition-colors flex items-center"
                // ✅ SỬA: Proper onClick handler for suggestions
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSuggestionClick(suggestion);
                }}
              >
                {suggestion}
                <PlusIcon className="ml-1 w-3 h-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500">
        💡 Mỗi tag tối đa 30 ký tự. Click vào tag để xóa, click gợi ý để thêm
        nhanh.
      </p>
    </div>
  );
};
