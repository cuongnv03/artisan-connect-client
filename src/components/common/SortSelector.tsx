import React from 'react';
import { ChevronUpDownIcon } from '@heroicons/react/24/outline';
import { Select } from '../ui/Dropdown';

export interface SortOption {
  label: string;
  value: string;
  field: string;
  order: 'asc' | 'desc';
}

interface SortSelectorProps {
  value: string;
  onChange: (value: string, option: SortOption) => void;
  options: SortOption[];
  className?: string;
}

export const SortSelector: React.FC<SortSelectorProps> = ({
  value,
  onChange,
  options,
  className = '',
}) => {
  const handleChange = (selectedValue: string) => {
    const selectedOption = options.find((opt) => opt.value === selectedValue);
    if (selectedOption) {
      onChange(selectedValue, selectedOption);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <ChevronUpDownIcon className="w-4 h-4 text-gray-500" />
      <span className="text-sm text-gray-700">Sắp xếp:</span>
      <Select
        value={value}
        onChange={handleChange}
        options={options.map((opt) => ({
          label: opt.label,
          value: opt.value,
        }))}
        className="min-w-[150px]"
      />
    </div>
  );
};
