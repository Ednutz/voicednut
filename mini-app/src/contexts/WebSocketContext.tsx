import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketMessage } from '../types/websocket';
import { createWebSocketConnection } from '../services/webSocketService';

interface WebSocketContextType {
  isConnected: boolean;
  isReconnecting: boolean;
  sendMessage: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{
  url: string;
  children: React.ReactNode;
}> = ({ url, children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_INTERVAL = 3000;

  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
      setIsReconnecting(true);
      reconnectTimeout.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        connect();
      }, RECONNECT_INTERVAL);
    } else {
      setError(new Error('Maximum reconnection attempts reached'));
      setIsReconnecting(false);
    }
  }, [setIsReconnecting, setError]);

  const connect = useCallback(() => {
    try {
      ws.current = createWebSocketConnection(
        url,
        () => {
          setIsConnected(true);
          setIsReconnecting(false);
          setError(null);
          reconnectAttempts.current = 0;
        },
        (message) => {
          setLastMessage(message);
        },
        () => {
          setIsConnected(false);
          handleReconnect();
        },
        (error) => {
          setError(error);
        }
      );
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      setError(err instanceof Error ? err : new Error('Failed to create WebSocket'));
    }
  }, [url, setIsConnected, setIsReconnecting, setError, setLastMessage, handleReconnect]);

  const sendMessage = (message: WebSocketMessage) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
      setError(new Error('WebSocket is not connected'));
    }
  };

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
    };
  }, [url, connect]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        isReconnecting,
        sendMessage,
        lastMessage,
        error,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// Loading component with glassmorphism effect
export const WebSocketLoadingOverlay: React.FC = () => (
  <div className="loading-overlay glass">
    <div className="loading-spinner" />
    <p className="mt-4 text-theme-text">Connecting to server...</p>
  </div>
);

// Error component with gradient effect
export const WebSocketError: React.FC<{ error: Error }> = ({ error }) => (
  <div className="card glass animate-in" style={{ borderLeft: '4px solid #ef4444' }}>
    <h3 className="gradient-text">Connection Error</h3>
    <p className="text-theme-text">{error.message}</p>
    <button
      className="button mt-4"
      onClick={() => window.location.reload()}
    >
      Retry Connection
    </button>
  </div>
);