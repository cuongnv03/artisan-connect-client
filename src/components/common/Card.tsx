import React from 'react';
import clsx from 'clsx';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  footer?: React.ReactNode;
  footerClassName?: string;
  headerRight?: React.ReactNode;
  isHoverable?: boolean;
  isInteractive?: boolean;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className = '',
  contentClassName = '',
  headerClassName = '',
  footer,
  footerClassName = '',
  headerRight,
  isHoverable = false,
  isInteractive = false,
  onClick,
}) => {
  return (
    <div
      className={clsx(
        'bg-white rounded-xl border border-gray-200 shadow-soft overflow-hidden',
        isHoverable && 'transition hover:shadow-md',
        isInteractive && 'cursor-pointer transition hover:shadow-md',
        className,
      )}
      onClick={isInteractive ? onClick : undefined}
    >
      {(title || subtitle || headerRight) && (
        <div
          className={clsx(
            'px-6 py-4 flex justify-between items-center border-b border-gray-100',
            headerClassName,
          )}
        >
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>
          {headerRight && <div>{headerRight}</div>}
        </div>
      )}

      <div className={clsx('px-6 py-5', contentClassName)}>{children}</div>

      {footer && (
        <div
          className={clsx(
            'px-6 py-3 bg-gray-50 border-t border-gray-100',
            footerClassName,
          )}
        >
          {footer}
        </div>
      )}
    </div>
  );
};
