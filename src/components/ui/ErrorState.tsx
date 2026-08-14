import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { AppError } from '../../services/errors';
import { Spinner } from './Spinner';
import { cn } from '../../lib/cn';

interface ErrorStateProps {
  error: AppError | null;
  onRetry: () => void;
  /** Shows the spinner inside the retry button while the retry is running. */
  isRetrying?: boolean;
  title?: string;
  className?: string;
}

/**
 * The single failure placeholder used by every page: what went wrong, what to
 * do about it, and a «حاول مرة أخرى» button that re-runs the same request.
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  isRetrying = false,
  title = 'تعذّر تحميل البيانات',
  className,
}) => (
  <div
    role="alert"
    className={cn(
      'flex flex-col items-center justify-center gap-4 py-14 px-6 text-center',
      'bg-white border border-red-100 rounded-xl shadow-sm',
      className,
    )}
  >
    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
      <AlertTriangle size={32} />
    </div>

    <div className="space-y-2 max-w-md">
      <h3 className="text-lg font-bold text-primary">{title}</h3>
      <p className="text-sm text-secondary font-medium leading-relaxed">
        {error?.message ?? 'حدث خطأ غير متوقع. برجاء المحاولة مرة أخرى.'}
      </p>
    </div>

    <button
      onClick={onRetry}
      disabled={isRetrying}
      className="btn-primary px-6 py-3 rounded-xl shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
    >
      {isRetrying ? <Spinner size={18} /> : <RefreshCw size={18} />}
      <span>{isRetrying ? 'جاري إعادة المحاولة...' : 'حاول مرة أخرى'}</span>
    </button>

    {error?.technical && (
      <details className="w-full max-w-md text-right">
        <summary className="cursor-pointer text-[11px] font-bold text-secondary/70 hover:text-secondary select-none">
          التفاصيل التقنية
        </summary>
        <p dir="ltr" className="mt-2 bg-bg border border-line rounded-lg p-3 text-[11px] text-secondary font-mono break-words text-left">
          {error.technical}
        </p>
      </details>
    )}
  </div>
);
