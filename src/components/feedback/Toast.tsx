import React, { useEffect } from 'react';
import { Transition } from '@headlessui/react';
import clsx from 'clsx';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  id: string;
  type?: ToastType;
  title?: string;
  message: string;
  duration?: number;
  isVisible?: boolean;
  onClose: (id: string) => void;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  action?: React.ReactNode;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  isVisible = true,
  onClose,
  position = 'bottom-right',
  action,
}) => {
  // Auto close after duration
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose, id]);

  // Icon mapping
  const icons = {
    success: (
      <CheckCircleIcon className="h-5 w-5 text-green-500" aria-hidden="true" />
    ),
    error: <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />,
    warning: (
      <ExclamationCircleIcon
        className="h-5 w-5 text-yellow-500"
        aria-hidden="true"
      />
    ),
    info: (
      <InformationCircleIcon
        className="h-5 w-5 text-blue-500"
        aria-hidden="true"
      />
    ),
  };

  // Position classes
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2',
  };

  // Border color classes
  const borderClasses = {
    success: 'border-l-4 border-green-500',
    error: 'border-l-4 border-red-500',
    warning: 'border-l-4 border-yellow-500',
    info: 'border-l-4 border-blue-500',
  };

  return (
    <Transition
      show={isVisible}
      enter="transform ease-out duration-300 transition"
      enterFrom={
        position.includes('bottom')
          ? 'translate-y-2 opacity-0'
          : '-translate-y-2 opacity-0'
      }
      enterTo="translate-y-0 opacity-100"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={clsx(
          'p-4 bg-white rounded-lg shadow-lg max-w-sm w-full',
          borderClasses[type],
          position && `m-4`,
        )}
        role="alert"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">{icons[type]}</div>

          <div className="ml-3 w-0 flex-1">
            {title && (
              <p className="text-sm font-medium text-gray-900">{title}</p>
            )}
            <p className={clsx('text-sm text-gray-500', title && 'mt-1')}>
              {message}
            </p>

            {action && <div className="mt-3">{action}</div>}
          </div>

          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => onClose(id)}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
};

// Toast container for positioning
interface ToastContainerProps {
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  children: React.ReactNode;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  position = 'bottom-right',
  children,
}) => {
  const positionClasses = {
    'top-right': 'top-0 right-0',
    'top-left': 'top-0 left-0',
    'bottom-right': 'bottom-0 right-0',
    'bottom-left': 'bottom-0 left-0',
    'top-center': 'top-0 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-0 left-1/2 transform -translate-x-1/2',
  };

  return (
    <div
      className={clsx(
        'fixed z-50 p-4 flex flex-col space-y-4 overflow-hidden',
        positionClasses[position],
      )}
    >
      {children}
    </div>
  );
};
