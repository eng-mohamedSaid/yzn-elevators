import { useCallback, useEffect, useRef, useState } from 'react';
import { AppError, toAppError } from '../services/errors';

export interface AsyncAction<A extends unknown[]> {
  run: (...args: A) => Promise<void>;
  /** True while the action is in flight — bind it to the button's `isLoading`. */
  isPending: boolean;
  error: AppError | null;
  clearError: () => void;
}

/**
 * Wraps a save / update / delete handler so the triggering button can show a
 * spinner and, crucially, so a second click while the first request is still
 * in flight is dropped — no duplicate records from an impatient double-click.
 */
export function useAsyncAction<A extends unknown[]>(action: (...args: A) => Promise<void>): AsyncAction<A> {
  const [isPending, setPending] = useState(false);
  const [error, setError]       = useState<AppError | null>(null);

  const actionRef = useRef(action);
  actionRef.current = action;

  // A ref, not the state value: state updates are async, so two clicks in the
  // same tick would both read `isPending === false`.
  const inFlightRef = useRef(false);
  const mountedRef  = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const run = useCallback(async (...args: A) => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setPending(true);
    setError(null);
    try {
      await actionRef.current(...args);
    } catch (err) {
      if (mountedRef.current) setError(toAppError(err));
    } finally {
      inFlightRef.current = false;
      if (mountedRef.current) setPending(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { run, isPending, error, clearError };
}
