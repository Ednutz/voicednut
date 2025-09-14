import { type FC, useEffect, useState } from 'react';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { IndexPage } from '@/pages/IndexPage/IndexPage';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { ErrorBoundary, LoadingSpinner } from '@/components/common/AsyncContent/AsyncContent';
import '@/styles/enhanced-theme.css';
import '@/styles/global.css';
import '@/styles/mobile.css';

export const App: FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [wsUrl, setWsUrl] = useState<string>('');

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Check if we're in development mode
        if (import.meta.env.DEV) {
          console.log('Development mode: Using mock launch params');
          setWsUrl('ws://localhost:3000/ws');
          setTimeout(() => setIsLoading(false), 1000);
        } else {
          const launchParams = retrieveLaunchParams();
          console.log('Launch params:', launchParams);
          // Construct WebSocket URL from launch params or environment
          const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsHost = import.meta.env.VITE_WS_HOST || window.location.host;
          setWsUrl(`${wsProtocol}//${wsHost}/ws`);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to initialize app:', err);
        setError(new Error('Failed to initialize application. Please ensure you are running the app within Telegram or in development mode.'));
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);
  if (isLoading) {
    return (
      <div className="page-container animate-in flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container animate-in flex items-center justify-center">
        <div className="card glass animate-in" style={{ borderLeft: '4px solid #ef4444' }}>
          <h3 className="gradient-text">Error</h3>
          <p className="text-theme-text">{error.message}</p>
        </div>
      </div>
    );
  }

  const wsOptions: WebSocketOptions = {
    url: import.meta.env.VITE_WS_URL || 'ws://localhost:8080/ws',
    reconnectAttempts: 5,
    onMessage: (message) => {
      console.log('WebSocket message received:', message);
    }
  };

  return (
    <WebSocketProvider options={wsOptions}>
      <div style={{
        minHeight: '100vh',
        background: 'var(--tg-theme-bg-color)',
        color: 'var(--tg-theme-text-color)'
      }}>
        <IndexPage />
      </div>
    </WebSocketProvider>
  );
};