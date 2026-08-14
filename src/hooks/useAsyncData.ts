import { useCallback, useEffect, useRef, useState } from 'react';
import { AppError, toAppError } from '../services/errors';

/** `useState`'s setter shape, spelled out because React ships no types here. */
type SetState<T> = (value: T | ((prev: T) => T)) => void;

export interface AsyncData<T> {
  data: T | null;
  /** Replace the loaded data locally (e.g. after an optimistic edit). */
  setData: SetState<T | null>;
  /** First load — nothing to show on screen yet. */
  isLoading: boolean;
  /** Any request in flight, including a background refresh over existing data. */
  isFetching: boolean;
  error: AppError | null;
  /** Re-run the fetcher — this is what the «حاول مرة أخرى» button calls. */
  reload: () => Promise<void>;
}

/**
 * Runs an async fetcher and exposes the loading / error / retry triad every
 * page needs. Stale responses from superseded runs are discarded, so a fast
 * retry can never be overwritten by the slow request it replaced.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: readonly unknown[] = []): AsyncData<T> {
  const [data, setData]           = useState<T | null>(null);
  const [error, setError]         = useState<AppError | null>(null);
  const [isFetching, setFetching] = useState(true);

  // Keep the latest fetcher without making it a dependency of `reload` —
  // callers pass an inline arrow that changes identity on every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const runIdRef  = useRef(0);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const load = useCallback(async () => {
    const runId = ++runIdRef.current;
    setFetching(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (!mountedRef.current || runId !== runIdRef.current) return;
      setData(result);
    } catch (err) {
      if (!mountedRef.current || runId !== runIdRef.current) return;
      setError(toAppError(err));
    } finally {
      if (mountedRef.current && runId === runIdRef.current) setFetching(false);
    }
  }, []);

  useEffect(() => { load(); }, deps);

  return { data, setData, isLoading: isFetching && data === null, isFetching, error, reload: load };
}
