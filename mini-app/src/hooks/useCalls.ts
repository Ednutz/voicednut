import { useState, useEffect, useCallback } from 'react';
import { CallData } from '../types/bot';
import { botApi } from '../services/botApi';
import { useApi } from './useApi';

export const useCalls = () => {
  const [calls, setCalls] = useState<CallData[]>([]);
  const { execute, isLoading, error } = useApi<CallData[]>();

  const fetchCalls = useCallback(
    async (limit = 10) => {
      try {
        const data = await execute(() => botApi.getCalls(limit));
        setCalls(data || []);
        return data;
      } catch (error) {
        console.error('Failed to fetch calls:', error);
        return [];
      }
    },
    [execute]
  );

  const initiateCall = useCallback(
    async (phone: string, prompt: string, firstMessage: string) => {
      return execute(() => botApi.initiateCall(phone, prompt, firstMessage));
    },
    [execute]
  );

  const getTranscript = useCallback(
    async (callSid: string) => {
      return execute(() => botApi.getTranscript(callSid));
    },
    [execute]
  );

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  return {
    calls,
    isLoading,
    error,
    fetchCalls,
    initiateCall,
    getTranscript,
    refreshCalls: () => fetchCalls()
  };
};
