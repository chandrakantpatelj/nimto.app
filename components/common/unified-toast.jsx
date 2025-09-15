'use client';

import { toast } from 'sonner';

/**
 * Unified toast utility for consistent alert/notification display
 * All toasts will appear at bottom-right position
 */
export const showToast = {
  /**
   * Show success toast
   * @param {string} message - The message to display
   * @param {object} options - Additional options
   */
  success: (message, options = {}) => {
    return toast.success(message, {
      position: 'bottom-right',
      duration: 5000,
      ...options,
    });
  },

  /**
   * Show error toast
   * @param {string} message - The message to display
   * @param {object} options - Additional options
   */
  error: (message, options = {}) => {
    return toast.error(message, {
      position: 'bottom-right',
      duration: 7000, // Error toasts stay longer
      ...options,
    });
  },

  /**
   * Show warning toast
   * @param {string} message - The message to display
   * @param {object} options - Additional options
   */
  warning: (message, options = {}) => {
    return toast.warning(message, {
      position: 'bottom-right',
      duration: 6000,
      ...options,
    });
  },

  /**
   * Show info toast
   * @param {string} message - The message to display
   * @param {object} options - Additional options
   */
  info: (message, options = {}) => {
    return toast.info(message, {
      position: 'bottom-right',
      duration: 5000,
      ...options,
    });
  },

  /**
   * Show loading toast
   * @param {string} message - The message to display
   * @param {object} options - Additional options
   */
  loading: (message, options = {}) => {
    return toast.loading(message, {
      position: 'bottom-right',
      ...options,
    });
  },

  /**
   * Show custom toast
   * @param {string} message - The message to display
   * @param {object} options - Additional options
   */
  custom: (message, options = {}) => {
    return toast(message, {
      position: 'bottom-right',
      duration: 5000,
      ...options,
    });
  },

  /**
   * Dismiss a specific toast
   * @param {string|number} toastId - The toast ID to dismiss
   */
  dismiss: (toastId) => {
    return toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    return toast.dismiss();
  },
};

// Legacy compatibility - keep the old showCustomToast function
export const showCustomToast = (message, type = 'info') => {
  const toastData = {
    id: Date.now().toString(),
    title: message,
    type,
    duration: type === 'error' ? 7000 : 5000,
  };

  return showToast.custom(message, {
    description: type,
  });
};
