import React from 'react';
import { Spinner } from './Spinner';
import { cn } from '../../lib/cn';

interface LoadingStateProps {
  /** Defaults to the app-wide «جاري التحميل...» copy. */
  message?: string;
  /** Optional second line explaining what is being fetched. */
  hint?: string;
  className?: string;
}

/** The single loading placeholder used by every page while data is fetched. */
export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'جاري التحميل...',
  hint,
  className,
}) => (
  <div
    role="status"
    aria-live="polite"
    className={cn(
      'flex flex-col items-center justify-center gap-4 py-16 px-6 text-center',
      'bg-white border border-line rounded-xl shadow-sm',
      className,
    )}
  >
    <Spinner size={40} className="text-accent" />
    <div className="space-y-1">
      <p className="font-bold text-primary">{message}</p>
      {hint && <p className="text-xs text-secondary font-medium">{hint}</p>}
    </div>
  </div>
);
