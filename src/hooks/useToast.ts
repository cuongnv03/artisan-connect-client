import { useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastOptions {
  type?: ToastType;
  title?: string;
  duration?: number;
  action?: React.ReactNode;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  title?: string;
  duration: number;
  isVisible: boolean;
  position:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  action?: React.ReactNode;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, options?: ToastOptions) => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newToast: Toast = {
      id,
      message,
      type: options?.type || 'info',
      title: options?.title,
      duration: options?.duration || 5000,
      isVisible: true,
      position: options?.position || 'bottom-right',
      action: options?.action,
    };

    setToasts((prevToasts) => [...prevToasts, newToast]);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) =>
        toast.id === id ? { ...toast, isVisible: false } : toast,
      ),
    );

    // Remove the toast from state after animation completes
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, 300);
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods for different toast types
  const success = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) => {
      return addToast(message, { ...options, type: 'success' });
    },
    [addToast],
  );

  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) => {
      return addToast(message, { ...options, type: 'error' });
    },
    [addToast],
  );

  const warning = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) => {
      return addToast(message, { ...options, type: 'warning' });
    },
    [addToast],
  );

  const info = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) => {
      return addToast(message, { ...options, type: 'info' });
    },
    [addToast],
  );

  return {
    toasts,
    addToast,
    removeToast,
    clearAllToasts,
    success,
    error,
    warning,
    info,
  };
};
