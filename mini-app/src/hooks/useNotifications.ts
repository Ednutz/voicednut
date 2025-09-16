import { useCallback } from 'react';
import { useTelegram } from './useTelegram';

interface NotificationOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  haptic?: boolean;
}

export const useNotifications = () => {
  const { hapticFeedback } = useTelegram();

  const notify = useCallback(
    (message: string, options: NotificationOptions = {}) => {
      const { type = 'info', haptic = true } = options;

      // Trigger haptic feedback
      if (haptic) {
        if (type === 'success') {
          hapticFeedback('success');
        } else if (type === 'error') {
          hapticFeedback('error');
        } else if (type === 'warning') {
          hapticFeedback('warning');
        } else {
          hapticFeedback('impact');
        }
      }

      // You can integrate with a toast library here
      console.log(`[${type.toUpperCase()}] ${message}`);

      // For now, we'll just log, but you'd typically show a toast notification
    },
    [hapticFeedback]
  );

  return {
    success: (message: string, options?: NotificationOptions) =>
      notify(message, { ...options, type: 'success' }),
    error: (message: string, options?: NotificationOptions) =>
      notify(message, { ...options, type: 'error' }),
    warning: (message: string, options?: NotificationOptions) =>
      notify(message, { ...options, type: 'warning' }),
    info: (message: string, options?: NotificationOptions) =>
      notify(message, { ...options, type: 'info' })
  };
};
