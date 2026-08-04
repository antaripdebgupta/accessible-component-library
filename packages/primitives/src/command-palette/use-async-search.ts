import { useEffect, useRef, useState } from 'react';

export interface UseAsyncSearchOptions<T> {
  query: string;
  search: (query: string) => Promise<T[]>;
  debounceMs?: number;
  minQueryLength?: number;
}

export interface UseAsyncSearchReturn<T> {
  results: T[];
  loading: boolean;
  error: unknown;
}

export function useAsyncSearch<T>({
  query,
  search,
  debounceMs = 200,
  minQueryLength = 0,
}: UseAsyncSearchOptions<T>): UseAsyncSearchReturn<T> {
  const [results, setResults] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (query.length < minQueryLength) {
      requestIdRef.current++;
      setResults([]);
      setLoading(false);
      setError(null);
      return;
    }

    const thisRequestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    const debounceTimer = setTimeout(() => {
      search(query)
        .then((data) => {
          // Stale-response guard: only the most recently issued
          // request is allowed to write to state.
          if (thisRequestId !== requestIdRef.current) return;
          setResults(data);
          setLoading(false);
        })
        .catch((err) => {
          if (thisRequestId !== requestIdRef.current) return;
          setError(err);
          setLoading(false);
        });
    }, debounceMs);

    return () => clearTimeout(debounceTimer);
  }, [query, search, debounceMs, minQueryLength]);

  return { results, loading, error };
}
