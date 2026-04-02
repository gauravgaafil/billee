import { useState, useEffect, useCallback } from 'react';

export function useFetch<T>(fetchFn: () => Promise<{ data: T }>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchFn()
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || 'Something went wrong'))
      .finally(() => setLoading(false));
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
