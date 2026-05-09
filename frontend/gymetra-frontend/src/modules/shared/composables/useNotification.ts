import { reactive } from 'vue';
import { checkmarkCircle, alertCircle, warningOutline, informationCircle } from 'ionicons/icons';

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
  const notification = reactive<NotificationState>({
    show: false,
    type: 'info',
    title: '',
    message: '',
    icon: informationCircle,
    progress: 0,
    duration: 5000,
  });

  let notificationTimer: NodeJS.Timeout | null = null;
  let notificationProgressTimer: NodeJS.Timeout | null = null;

  const dismissNotification = () => {
    if (notificationTimer) clearTimeout(notificationTimer);
    if (notificationProgressTimer) clearInterval(notificationProgressTimer);
    notification.show = false;
    notification.progress = 0;
  };

  const showNotification = (
    type: NotificationState['type'],
    title: string,
    message: string,
    duration: number = 5000
  ) => {
    if (notificationTimer) clearTimeout(notificationTimer);
    if (notificationProgressTimer) clearInterval(notificationProgressTimer);

    const icons = {
      success: checkmarkCircle,
      error: alertCircle,
      warning: warningOutline,
      info: informationCircle,
    };

    notification.type = type;
    notification.title = title;
    notification.message = message;
    notification.icon = icons[type];
    notification.duration = duration;
    notification.progress = 0;
    notification.show = true;

    const progressInterval = 50;
    const progressStep = (progressInterval / duration) * 100;

    notificationProgressTimer = setInterval(() => {
      notification.progress += progressStep;
      if (notification.progress >= 100) {
        dismissNotification();
      }
    }, progressInterval);

    notificationTimer = setTimeout(dismissNotification, duration);
  };

  return {
    notification,
    showNotification,
    dismissNotification
  };
};
