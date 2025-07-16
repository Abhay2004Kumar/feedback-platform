import { toast } from 'react-hot-toast';

type ToastType = 'success' | 'error';

export const showToast = (message: string, type: ToastType = 'success') => {
  const toastOptions = {
    duration: type === 'success' ? 3000 : 4000,
    position: 'bottom-right' as const,
    style: {
      background: type === 'success' ? '#10B981' : '#EF4444',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: 500,
    },
  };

  if (type === 'success') {
    toast.success(message, toastOptions);
  } else {
    toast.error(message, toastOptions);
  }
};

export const showSuccess = (message: string) => showToast(message, 'success');
export const showError = (message: string) => showToast(message, 'error');
