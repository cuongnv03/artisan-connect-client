import React from 'react';
import clsx from 'clsx';

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type LoaderVariant = 'circle' | 'dots' | 'spinner';

interface LoaderProps {
  size?: LoaderSize;
  variant?: LoaderVariant;
  color?: string;
  className?: string;
  fullScreen?: boolean;
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  size = 'md',
  variant = 'circle',
  color = 'accent',
  className = '',
  fullScreen = false,
  text,
}) => {
  // Size mapping
  const sizeMap: Record<LoaderSize, string> = {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };

  // Color mapping
  const colorMap: Record<string, string> = {
    accent: 'text-accent',
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-500',
    black: 'text-black',
  };

  const colorClass = colorMap[color] || colorMap.accent;

  // Render appropriate loader based on variant
  const renderLoader = () => {
    switch (variant) {
      case 'circle':
        return (
          <svg
            className={clsx(
              'animate-spin',
              sizeMap[size],
              colorClass,
              className,
            )}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        );

      case 'dots':
        return (
          <div className={clsx('flex space-x-1', className)}>
            <div
              className={clsx(
                'animate-pulse rounded-full',
                sizeMap[size].split(' ')[0],
                colorClass,
              )}
              style={{ width: '25%' }}
            ></div>
            <div
              className={clsx(
                'animate-pulse rounded-full animation-delay-200',
                sizeMap[size].split(' ')[0],
                colorClass,
              )}
              style={{ width: '25%' }}
            ></div>
            <div
              className={clsx(
                'animate-pulse rounded-full animation-delay-500',
                sizeMap[size].split(' ')[0],
                colorClass,
              )}
              style={{ width: '25%' }}
            ></div>
          </div>
        );

      case 'spinner':
        return (
          <div
            className={clsx(
              'border-t-transparent border-solid animate-spin rounded-full',
              sizeMap[size],
              colorClass,
              className,
            )}
            style={{
              borderWidth:
                size === 'xs' ? '2px' : size === 'sm' ? '3px' : '4px',
              borderStyle: 'solid',
              borderColor: 'currentColor',
              borderTopColor: 'transparent',
            }}
          ></div>
        );

      default:
        return null;
    }
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white bg-opacity-75 z-50">
        {renderLoader()}
        {text && <p className="mt-4 text-gray-700">{text}</p>}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center',
        fullScreen && 'w-full h-full',
      )}
    >
      {renderLoader()}
      {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
    </div>
  );
};
