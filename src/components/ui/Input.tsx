import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  as?: 'input' | 'textarea';
  rows?: number;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      as: Tag = 'input',
      rows,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputClassName = `
      block w-full rounded-lg border-gray-300 shadow-sm
      focus:border-primary focus:ring-primary
      ${leftIcon ? 'pl-10' : 'pl-3'}
      ${rightIcon ? 'pr-10' : 'pr-3'}
      ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
      ${className}
    `;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftIcon}
            </div>
          )}

          {Tag === 'textarea' ? (
            <textarea
              id={inputId}
              rows={rows}
              className={inputClassName}
              onChange={props.onChange as any}
              value={props.value as any}
              placeholder={props.placeholder}
              disabled={props.disabled}
              required={props.required}
              name={props.name}
            />
          ) : (
            <input
              ref={ref}
              id={inputId}
              className={inputClassName}
              {...props}
            />
          )}

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
