import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export const useApi = <T>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: false,
    error: null
  });

  const execute = useCallback(async (apiCall: () => Promise<any>) => {
    setState({ data: null, isLoading: true, error: null });

    try {
      const response = await apiCall();

      if (response.success) {
        setState({ data: response.data, isLoading: false, error: null });
        return response.data;
      } else {
        setState({ data: null, isLoading: false, error: response.error || 'API call failed' });
        throw new Error(response.error || 'API call failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setState({ data: null, isLoading: false, error: errorMessage });
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset
  };
};
