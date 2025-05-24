import React from 'react';
import { UserIcon } from '@heroicons/react/24/outline';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  fallback?: React.ReactNode;
  online?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
  '2xl': 'w-20 h-20',
};

const iconSizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
  '2xl': 'w-10 h-10',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  className = '',
  fallback,
  online,
}) => {
  const [hasError, setHasError] = React.useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const showFallback = !src || hasError;

  return (
    <div className={`relative inline-block ${sizeClasses[size]} ${className}`}>
      {showFallback ? (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gray-300 flex items-center justify-center text-gray-500`}
        >
          {fallback || <UserIcon className={iconSizeClasses[size]} />}
        </div>
      ) : (
        <img
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-white shadow-sm`}
          src={src}
          alt={alt}
          onError={handleError}
        />
      )}

      {/* Online indicator */}
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white ${
            online ? 'bg-green-400' : 'bg-gray-400'
          } ${
            size === 'xs' || size === 'sm'
              ? 'w-2 h-2'
              : size === 'md'
              ? 'w-2.5 h-2.5'
              : 'w-3 h-3'
          }`}
        />
      )}
    </div>
  );
};
