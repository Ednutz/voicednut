import { useState, useEffect, useCallback } from 'react';
import { UserData } from '../types/bot';
import { botApi } from '../services/botApi';

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    error: null
  });

  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await botApi.checkAuth();

      if (response.success && response.data) {
        setAuthState({
          user: response.data.user,
          isAuthenticated: response.data.authorized,
          isAdmin: response.data.isAdmin,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          error: response.error || 'Authentication failed'
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isAdmin: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication error'
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    refreshAuth: checkAuth
  };
};
