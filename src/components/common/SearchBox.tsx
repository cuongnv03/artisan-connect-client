import React, { useState } from 'react';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  placeholder?: string;
  className?: string;
  showClearButton?: boolean;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Tìm kiếm...',
  className = '',
  showClearButton = true,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(value);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          leftIcon={<MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />}
          rightIcon={
            <div className="flex items-center space-x-2">
              {showClearButton && value && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
              <Button type="submit" size="sm">
                Tìm
              </Button>
            </div>
          }
          className="pr-20"
        />
      </div>
    </form>
  );
};
