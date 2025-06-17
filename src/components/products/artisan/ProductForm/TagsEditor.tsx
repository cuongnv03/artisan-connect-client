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

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onChange([...tags, trimmedTag]);
    }
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addTag(newTag);
      setNewTag('');
    }
  };

  const availableSuggestions = suggestions.filter(
    (suggestion) => !tags.includes(suggestion.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Tags sản phẩm
      </label>

      {/* Current Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="primary"
              className="cursor-pointer hover:bg-primary-600"
              onClick={() => removeTag(index)}
            >
              <TagIcon className="w-3 h-3 mr-1" />
              {tag}
              <XMarkIcon className="ml-1 w-3 h-3" />
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
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddTag();
            }
          }}
          maxLength={30}
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
          <p className="text-sm text-gray-600 mb-2">Gợi ý:</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 8).map((suggestion) => (
              <Badge
                key={suggestion}
                variant="secondary"
                className="cursor-pointer hover:bg-gray-300"
                onClick={() => addTag(suggestion)}
              >
                {suggestion}
                <PlusIcon className="ml-1 w-3 h-3" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500">
        {tags.length}/{maxTags} tags. Mỗi tag tối đa 30 ký tự.
      </p>
    </div>
  );
};
