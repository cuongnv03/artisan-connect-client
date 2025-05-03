import React, { useState, useRef } from 'react';
import { useOutsideClick } from '../../hooks/useOutsideClick';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';

interface DropdownOption {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  optionClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className = '',
  buttonClassName = '',
  menuClassName = '',
  optionClassName = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useOutsideClick(dropdownRef, () => setIsOpen(false));

  // Find selected option
  const selectedOption = options.find((option) => option.value === value);

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (option: DropdownOption) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={clsx('relative w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          className={clsx(
            'w-full bg-white border border-gray-300 rounded-md shadow-sm px-4 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm',
            disabled && 'bg-gray-100 text-gray-500 cursor-not-allowed',
            error && 'border-red-300 focus:ring-red-500 focus:border-red-500',
            buttonClassName,
          )}
          onClick={toggleDropdown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {selectedOption?.icon && (
                <span className="mr-2">{selectedOption.icon}</span>
              )}
              <span className={!selectedOption ? 'text-gray-400' : ''}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
            </div>
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        {isOpen && (
          <div
            className={clsx(
              'absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm',
              menuClassName,
            )}
            role="listbox"
          >
            {options.map((option) => (
              <div
                key={option.value}
                className={clsx(
                  'cursor-pointer select-none relative py-2 pl-3 pr-9',
                  value === option.value
                    ? 'text-white bg-accent'
                    : 'text-gray-900 hover:bg-gray-100',
                  option.disabled && 'opacity-50 cursor-not-allowed',
                  optionClassName,
                )}
                onClick={() => handleOptionClick(option)}
                role="option"
                aria-selected={value === option.value}
              >
                <div className="flex items-center">
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  <span
                    className={
                      value === option.value ? 'font-medium' : 'font-normal'
                    }
                  >
                    {option.label}
                  </span>
                </div>

                {value === option.value && (
                  <span
                    className={clsx(
                      'absolute inset-y-0 right-0 flex items-center pr-4',
                      value === option.value ? 'text-white' : 'text-accent',
                    )}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
