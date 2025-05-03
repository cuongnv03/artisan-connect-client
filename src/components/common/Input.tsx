import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputContainerClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperTextClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftAddon,
      rightAddon,
      containerClassName = '',
      labelClassName = '',
      inputContainerClassName = '',
      inputClassName = '',
      errorClassName = '',
      helperTextClassName = '',
      id,
      className = '',
      ...rest
    },
    ref,
  ) => {
    // Generate a unique ID if not provided
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

    return (
      <div className={clsx('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'block text-sm font-medium text-gray-700 mb-1',
              error && 'text-red-500',
              labelClassName,
            )}
          >
            {label}
          </label>
        )}

        <div
          className={clsx(
            'relative rounded-md shadow-sm',
            inputContainerClassName,
          )}
        >
          {leftAddon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {leftAddon}
            </div>
          )}

          <input
            id={inputId}
            ref={ref}
            className={clsx(
              'block w-full rounded-md sm:text-sm border-gray-300 shadow-sm focus:ring-accent focus:border-accent',
              error &&
                'border-red-300 text-red-900 placeholder-red-300 focus:outline-none focus:ring-red-500 focus:border-red-500',
              leftAddon && 'pl-10',
              rightAddon && 'pr-10',
              inputClassName,
              className,
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...rest}
          />

          {rightAddon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightAddon}
            </div>
          )}
        </div>

        {error && (
          <p
            id={`${inputId}-error`}
            className={clsx('mt-1 text-sm text-red-600', errorClassName)}
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            id={`${inputId}-helper`}
            className={clsx('mt-1 text-sm text-gray-500', helperTextClassName)}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
