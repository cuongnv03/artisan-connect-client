import React from 'react';
import clsx from 'clsx';
import { UserCircleIcon } from '@heroicons/react/24/solid';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  firstName?: string;
  lastName?: string;
  className?: string;
  onClick?: () => void;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  status,
  firstName,
  lastName,
  className = '',
  onClick,
}) => {
  // Size mapping
  const sizeClasses: Record<AvatarSize, string> = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl',
  };

  // Status mapping
  const statusClasses: Record<AvatarStatus, string> = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  // Get initials if no image is provided
  const getInitials = (): string => {
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`;
    }
    if (firstName) {
      return firstName.charAt(0);
    }
    if (lastName) {
      return lastName.charAt(0);
    }
    return '';
  };

  const hasImage = !!src;
  const hasInitials = !hasImage && (!!firstName || !!lastName);

  return (
    <div
      className={clsx(
        'relative inline-flex rounded-full',
        onClick && 'cursor-pointer',
        sizeClasses[size],
        className,
      )}
      onClick={onClick}
    >
      {hasImage ? (
        <img
          src={src}
          alt={alt}
          className={clsx(
            'object-cover rounded-full border border-gray-200',
            sizeClasses[size],
          )}
        />
      ) : hasInitials ? (
        <div
          className={clsx(
            'flex items-center justify-center bg-accent text-white rounded-full font-medium uppercase',
            sizeClasses[size],
          )}
        >
          {getInitials()}
        </div>
      ) : (
        <UserCircleIcon className={clsx('text-gray-400', sizeClasses[size])} />
      )}

      {status && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full ring-2 ring-white',
            statusClasses[status],
            {
              'h-1.5 w-1.5': size === 'xs',
              'h-2 w-2': size === 'sm',
              'h-2.5 w-2.5': size === 'md',
              'h-3 w-3': size === 'lg',
              'h-4 w-4': size === 'xl',
            },
          )}
        />
      )}
    </div>
  );
};
