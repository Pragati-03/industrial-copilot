import { useCallback, useEffect, useRef, useState } from "react";

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = [],
  errorMessage = "Something went wrong. Is the backend running?"
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const load = useCallback(() => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    fetcher()
      .then((result) => {
        if (currentRequest !== requestId.current) return;
        setData(result);
        setError(null);
      })
      .catch(() => {
        if (currentRequest !== requestId.current) return;
        setError(errorMessage);
      })
      .finally(() => {
        if (currentRequest !== requestId.current) return;
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}