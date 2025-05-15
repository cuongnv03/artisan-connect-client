import React, { useState, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import clsx from 'clsx';
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type AlertType = 'success' | 'error' | 'warning' | 'info';
type AlertVariant = 'filled' | 'outlined' | 'subtle';

interface AlertProps {
  type?: AlertType;
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
  action?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  variant = 'subtle',
  title,
  children,
  className = '',
  icon,
  dismissible = false,
  onDismiss,
  autoClose = false,
  autoCloseDelay = 5000,
  action,
}) => {
  const [show, setShow] = useState(true);

  // Auto close functionality
  useEffect(() => {
    if (autoClose && show) {
      const timer = setTimeout(() => {
        setShow(false);
        if (onDismiss) onDismiss();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onDismiss, show]);

  // Handle manual dismiss
  const handleDismiss = () => {
    setShow(false);
    if (onDismiss) onDismiss();
  };

  // Type-based styling
  const typeStyles: Record<
    AlertType,
    {
      icon: React.ReactNode;
      filledClasses: string;
      outlinedClasses: string;
      subtleClasses: string;
    }
  > = {
    success: {
      icon: <CheckCircleIcon className="h-5 w-5" />,
      filledClasses: 'bg-green-600 text-white',
      outlinedClasses: 'border-green-500 text-green-700',
      subtleClasses: 'bg-green-50 text-green-800',
    },
    error: {
      icon: <XCircleIcon className="h-5 w-5" />,
      filledClasses: 'bg-red-600 text-white',
      outlinedClasses: 'border-red-500 text-red-700',
      subtleClasses: 'bg-red-50 text-red-800',
    },
    warning: {
      icon: <ExclamationCircleIcon className="h-5 w-5" />,
      filledClasses: 'bg-yellow-500 text-white',
      outlinedClasses: 'border-yellow-400 text-yellow-700',
      subtleClasses: 'bg-yellow-50 text-yellow-800',
    },
    info: {
      icon: <InformationCircleIcon className="h-5 w-5" />,
      filledClasses: 'bg-blue-600 text-white',
      outlinedClasses: 'border-blue-500 text-blue-700',
      subtleClasses: 'bg-blue-50 text-blue-800',
    },
  };

  // Variant-based styling
  const getVariantClasses = () => {
    switch (variant) {
      case 'filled':
        return typeStyles[type].filledClasses;
      case 'outlined':
        return `border ${typeStyles[type].outlinedClasses}`;
      case 'subtle':
      default:
        return typeStyles[type].subtleClasses;
    }
  };

  if (!show) return null;

  return (
    <Transition
      show={show}
      enter="transition ease-out duration-300"
      enterFrom="opacity-0 transform -translate-y-2"
      enterTo="opacity-100 transform translate-y-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={clsx(
          'rounded-lg p-4',
          getVariantClasses(),
          variant === 'outlined' ? 'border' : '',
          className,
        )}
        role="alert"
      >
        <div className="flex items-start">
          {/* Icon */}
          {(icon || typeStyles[type].icon) && (
            <div className="flex-shrink-0">{icon || typeStyles[type].icon}</div>
          )}

          {/* Content */}
          <div
            className={clsx(
              'flex-1',
              icon || typeStyles[type].icon ? 'ml-3' : '',
            )}
          >
            {title && <h3 className="text-sm font-medium">{title}</h3>}
            <div className={clsx('text-sm', title ? 'mt-1' : '')}>
              {children}
            </div>

            {/* Action */}
            {action && <div className="mt-2">{action}</div>}
          </div>

          {/* Dismiss button */}
          {dismissible && (
            <div className="flex-shrink-0 ml-4">
              <button
                type="button"
                className={clsx(
                  'inline-flex rounded-md focus:outline-none',
                  variant === 'filled'
                    ? 'text-white hover:text-gray-200'
                    : 'text-gray-400 hover:text-gray-500',
                )}
                onClick={handleDismiss}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Transition>
  );
};
