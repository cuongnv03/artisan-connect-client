import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const { state: authState } = useAuth();
  const cancelTokenRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    // Cancel previous request
    if (cancelTokenRef.current) {
      cancelTokenRef.current.abort();
    }

    // Don't fetch if not authenticated
    if (!authState.isAuthenticated) {
      setState({
        data: null,
        loading: false,
        error: null,
      });
      return;
    }

    // Create new cancel token
    cancelTokenRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const result = await apiCall();

      // Check if request was cancelled
      if (!cancelTokenRef.current?.signal.aborted) {
        setState({
          data: result,
          loading: false,
          error: null,
        });
      }
    } catch (error: any) {
      // Don't update state if request was cancelled
      if (!cancelTokenRef.current?.signal.aborted) {
        setState({
          data: null,
          loading: false,
          error:
            error.response?.data?.message || error.message || 'Có lỗi xảy ra',
        });
      }
    }
  };

  useEffect(() => {
    if (authState.isInitialized) {
      fetchData();
    }

    return () => {
      // Cancel request on cleanup
      if (cancelTokenRef.current) {
        cancelTokenRef.current.abort();
      }
    };
  }, [authState.isInitialized, authState.isAuthenticated, ...dependencies]);

  return {
    ...state,
    refetch: fetchData,
  };
}
