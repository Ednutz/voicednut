import { useEffect, useState, useCallback } from 'react';
import { TelegramWebApp } from '../types/telegram';

export const useTelegram = () => {
  const [tg, setTg] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const telegram = window.Telegram.WebApp;
      setTg(telegram);
      setUser(telegram.initDataUnsafe?.user || null);

      telegram.ready();
      telegram.expand();
      setIsReady(true);
    }
  }, []);

  const showMainButton = useCallback(
    (text: string, onClick: () => void) => {
      if (tg?.MainButton) {
        tg.MainButton.setText(text);
        tg.MainButton.show();
        tg.MainButton.onClick(onClick);
      }
    },
    [tg]
  );

  const hideMainButton = useCallback(() => {
    if (tg?.MainButton) {
      tg.MainButton.hide();
    }
  }, [tg]);

  const showBackButton = useCallback(
    (onClick: () => void) => {
      if (tg?.BackButton) {
        tg.BackButton.show();
        tg.BackButton.onClick(onClick);
      }
    },
    [tg]
  );

  const hideBackButton = useCallback(() => {
    if (tg?.BackButton) {
      tg.BackButton.hide();
    }
  }, [tg]);

  const sendData = useCallback(
    (data: any) => {
      if (tg) {
        tg.sendData(JSON.stringify(data));
      }
    },
    [tg]
  );

  const hapticFeedback = useCallback(
    (type: 'success' | 'error' | 'warning' | 'impact') => {
      if (tg?.HapticFeedback) {
        if (type === 'impact') {
          tg.HapticFeedback.impactOccurred('medium');
        } else {
          tg.HapticFeedback.notificationOccurred(type as 'success' | 'error' | 'warning');
        }
      }
    },
    [tg]
  );

  return {
    tg,
    user,
    isReady,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    sendData,
    hapticFeedback,
    colorScheme: tg?.colorScheme || 'light',
    themeParams: tg?.themeParams || {}
  };
};
