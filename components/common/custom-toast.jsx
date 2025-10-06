import { showToast } from './unified-toast';

export const showCustomToast = (message, type = 'info') => {
  switch (type) {
    case 'success':
      return showToast.success(message);
    case 'error':
      return showToast.error(message);
    case 'warning':
      return showToast.warning(message);
    case 'info':
    default:
      return showToast.info(message);
  }
};
