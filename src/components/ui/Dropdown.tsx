import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent) => void; // Changed to accept optional event parameter
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  placement = 'bottom-start',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1',
  };

  return (
    <div
      className={`relative inline-block text-left ${className}`}
      ref={dropdownRef}
    >
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={`absolute z-10 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none ${placementClasses[placement]}`}
        >
          <div className="py-1">
            {items.map((item) => (
              <button
                key={item.value}
                className={`group flex w-full items-center px-4 py-2 text-sm text-left hover:bg-gray-100 ${
                  item.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700'
                }`}
                disabled={item.disabled}
                onClick={(e) => {
                  // Pass the event to the onClick handler
                  if (!item.disabled) {
                    item.onClick?.(e);
                    setIsOpen(false);
                  }
                }}
              >
                {item.icon && (
                  <span className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface SelectProps {
  value?: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string; // Add label prop
  required?: boolean; // Add required prop
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  className = '',
  disabled = false,
  label,
  required = false,
}) => {
  const selectedOption = options.find((option) => option.value === value);

  const trigger = (
    <button
      type="button"
      className={`relative w-full cursor-default rounded-md bg-white py-2 pl-3 pr-10 text-left border border-gray-300 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary ${
        disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled}
    >
      <span className="block truncate">
        {selectedOption ? selectedOption.label : placeholder}
      </span>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
        <ChevronDownIcon className="h-5 w-5 text-gray-400" />
      </span>
    </button>
  );

  const items = options.map((option) => ({
    label: option.label,
    value: option.value,
    onClick: () => onChange(option.value),
  }));

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Dropdown trigger={trigger} items={items} className="w-full" />
    </div>
  );
};
