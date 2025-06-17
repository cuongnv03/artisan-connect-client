import { useState, useCallback } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (message: string, title?: string) => {
      return addToast({ type: 'success', message, title });
    },
    [addToast],
  );

  const error = useCallback(
    (message: string, title?: string) => {
      return addToast({ type: 'error', message, title });
    },
    [addToast],
  );

  const warning = useCallback(
    (message: string, title?: string) => {
      return addToast({ type: 'warning', message, title });
    },
    [addToast],
  );

  const info = useCallback(
    (message: string, title?: string) => {
      return addToast({ type: 'info', message, title });
    },
    [addToast],
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
};
