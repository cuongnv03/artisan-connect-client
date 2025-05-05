import React, { useState, KeyboardEvent } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  max?: number;
  className?: string;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  onChange,
  placeholder = 'Add a tag',
  max = 10,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    if (!trimmedTag || tags.includes(trimmedTag) || tags.length >= max) {
      return;
    }

    onChange([...tags, trimmedTag]);
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter or comma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    }

    // Remove last tag on Backspace if input is empty
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const handleBlur = () => {
    if (inputValue) {
      addTag(inputValue);
    }
  };

  return (
    <div
      className={`border border-gray-300 rounded-md px-3 py-2 flex flex-wrap items-center gap-2 focus-within:ring-1 focus-within:ring-accent focus-within:border-accent ${className}`}
    >
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full flex items-center"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="ml-1 text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </span>
      ))}

      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        placeholder={tags.length === 0 ? placeholder : undefined}
        className="flex-grow outline-none border-none bg-transparent p-1 text-sm"
        disabled={tags.length >= max}
      />

      {tags.length >= max && (
        <span className="text-xs text-gray-500 ml-2">
          Maximum {max} tags reached
        </span>
      )}
    </div>
  );
};
