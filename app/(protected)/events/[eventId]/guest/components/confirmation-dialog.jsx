'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'danger', 'info'
}) {
  const getTypeStyles = () => {
    const styles = {
      danger: {
        iconColor: 'text-red-500',
        iconBg: 'bg-red-100',
        confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
      },
      warning: {
        iconColor: 'text-yellow-500',
        iconBg: 'bg-yellow-100',
        confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      },
      info: {
        iconColor: 'text-blue-500',
        iconBg: 'bg-blue-100',
        confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
      },
    };
    return styles[type] || styles.warning;
  };

  const styles = getTypeStyles();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div
              className={`w-10 h-10 ${styles.iconBg} rounded-full flex items-center justify-center`}
            >
              <AlertTriangle className={`w-5 h-5 ${styles.iconColor}`} />
            </div>
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-6"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className={`px-6 ${styles.confirmButton}`}
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
