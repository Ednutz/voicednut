import { useEffect } from 'react';
import { useTelegram as useSDKTelegram } from '@telegram-apps/sdk-react';

const useTelegram = () => {
  const { init, onEvent, sendData } = useSDKTelegram();

  useEffect(() => {
    init();

    onEvent('someEvent', (data) => {
      console.log('Received event data:', data);
    });

    return () => {
      // Clean up event listeners if necessary
    };
  }, [init, onEvent]);

  const sendMessage = (message) => {
    sendData('sendMessage', { message });
  };

  return { sendMessage };
};

export default useTelegram;