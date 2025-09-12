'use client';

import { createContext, useCallback, useContext, useState } from 'react';
import { ToastContainer } from '@/components/ui/toast';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      type: 'info',
      duration: 5000,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const toast = useCallback(
    (message, options = {}) => {
      return addToast({
        title: message,
        ...options,
      });
    },
    [addToast],
  );

  const toastSuccess = useCallback(
    (message, options = {}) => {
      return addToast({
        title: message,
        type: 'success',
        ...options,
      });
    },
    [addToast],
  );

  const toastError = useCallback(
    (message, options = {}) => {
      return addToast({
        title: message,
        type: 'error',
        duration: 7000, // Error toasts stay longer
        ...options,
      });
    },
    [addToast],
  );

  const toastWarning = useCallback(
    (message, options = {}) => {
      return addToast({
        title: message,
        type: 'warning',
        ...options,
      });
    },
    [addToast],
  );

  const toastInfo = useCallback(
    (message, options = {}) => {
      return addToast({
        title: message,
        type: 'info',
        ...options,
      });
    },
    [addToast],
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    toast,
    toastSuccess,
    toastError,
    toastWarning,
    toastInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
