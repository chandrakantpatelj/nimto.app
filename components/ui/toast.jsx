'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const toastTypes = {
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-500',
    textColor: 'text-green-800',
    closeColor: 'text-green-400 hover:text-green-600',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-500',
    textColor: 'text-red-800',
    closeColor: 'text-red-400 hover:text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-500',
    textColor: 'text-yellow-800',
    closeColor: 'text-yellow-400 hover:text-yellow-600',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-800',
    closeColor: 'text-blue-400 hover:text-blue-600',
  },
};

export function Toast({ toast, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const typeConfig = toastTypes[toast.type] || toastTypes.info;
  const Icon = typeConfig.icon;

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ease-in-out transform',
        typeConfig.bgColor,
        typeConfig.borderColor,
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : 'translate-x-full opacity-0 scale-95',
        isLeaving && 'translate-x-full opacity-0 scale-95',
      )}
      style={{ minWidth: '320px', maxWidth: '400px' }}
    >
      {/* Icon */}
      <div className={cn('flex-shrink-0', typeConfig.iconColor)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', typeConfig.textColor)}>
          {toast.title}
        </p>
        {toast.description && (
          <p className={cn('text-sm mt-1', typeConfig.textColor)}>
            {toast.description}
          </p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        className={cn(
          'flex-shrink-0 p-1 rounded-full transition-colors duration-200',
          typeConfig.closeColor,
        )}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}
