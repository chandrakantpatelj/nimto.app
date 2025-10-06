'use client';

import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';

export function ToastDemo() {
  const { toastSuccess, toastError, toastWarning, toastInfo } = useToast();

  return (
    <div className="space-y-4 p-4">
      <h3 className="text-lg font-semibold">Toast Notification Demo</h3>
      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={() => toastSuccess('Operation completed successfully!')}
          className="bg-green-600 hover:bg-green-700"
        >
          Success Toast
        </Button>
        <Button
          onClick={() => toastError('Something went wrong!')}
          className="bg-red-600 hover:bg-red-700"
        >
          Error Toast
        </Button>
        <Button
          onClick={() => toastWarning('Please check your input')}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Warning Toast
        </Button>
        <Button
          onClick={() => toastInfo('Here is some information')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Info Toast
        </Button>
      </div>
    </div>
  );
}
