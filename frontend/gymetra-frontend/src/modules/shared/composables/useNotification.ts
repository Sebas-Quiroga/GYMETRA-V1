import { reactive } from 'vue';
import { toast } from 'vue3-toastify';

interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  icon: string;
  progress: number;
  duration: number;
}

export const useNotification = () => {
  // Kept for backwards compatibility with template bindings, but never shown
  // since vue3-toastify handles the visual overlay globally.
  const notification = reactive<NotificationState>({
    show: false,
    type: 'info',
    title: '',
    message: '',
    icon: '',
    progress: 0,
    duration: 3500,
  });

  const dismissNotification = () => {
    toast.clearAll();
  };

  const showNotification = (
    type: NotificationState['type'],
    title: string,
    message: string,
    duration: number = 3500
  ) => {
    const content = title ? `${title}: ${message}` : message;
    toast(content, {
      type,
      autoClose: duration,
      theme: 'auto',
      position: 'top-right',
    });
  };

  return {
    notification,
    showNotification,
    dismissNotification
  };
};
