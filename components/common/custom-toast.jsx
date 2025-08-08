// utils/showCustomToast.jsx
import { toast } from 'sonner';
import CustomToast from '../ui/toast';

// import CustomToast from '@/components/CustomToast';

export const showCustomToast = (message, type = 'info') => {
  toast.custom(() => <CustomToast message={message} type={type} />, {
    position: 'top-center',
  });
};
