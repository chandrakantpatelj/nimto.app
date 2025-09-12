import { toast } from 'sonner';
import { Toast } from '../ui/toast';

export const showCustomToast = (message, type = 'info') => {
  const toastData = {
    id: Date.now().toString(),
    title: message,
    type,
    duration: type === 'error' ? 7000 : 5000,
  };

  toast.custom(
    (t) => <Toast toast={toastData} onRemove={() => toast.dismiss(t)} />,
    { position: 'top-center' },
  );
};
