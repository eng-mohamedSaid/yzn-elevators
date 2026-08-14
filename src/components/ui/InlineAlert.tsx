import React from 'react';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { AppError } from '../../services/errors';
import { Spinner } from './Spinner';
import { cn } from '../../lib/cn';

interface InlineAlertProps {
  variant?: 'error' | 'success';
  /** Pass an `AppError` to also get the technical details disclosure. */
  error?: AppError | null;
  message?: string;
  /** Renders a compact «حاول مرة أخرى» button beside the message. */
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

const STYLES = {
  error:   'bg-red-50 border-red-200 text-red-700',
  success: 'bg-green-50 border-green-200 text-green-700',
} as const;

/** Compact banner for failures/confirmations that happen inside a form or card. */
export const InlineAlert: React.FC<InlineAlertProps> = ({
  variant = 'error',
  error,
  message,
  onRetry,
  isRetrying = false,
  className,
}) => {
  const text = message ?? error?.message;
  if (!text) return null;

  const Icon = variant === 'success' ? CheckCircle2 : AlertCircle;

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn('rounded-xl border px-4 py-3 text-sm font-bold space-y-2', STYLES[variant], className)}
    >
      <div className="flex items-start gap-2">
        <Icon size={18} className="mt-0.5 flex-shrink-0" />
        <span className="flex-1 leading-relaxed">{text}</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
            className="flex-shrink-0 flex items-center gap-1.5 bg-white/70 border border-black/10 rounded-lg px-3 py-1.5 text-xs hover:bg-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isRetrying ? <Spinner size={13} /> : <RefreshCw size={13} />}
            <span>{isRetrying ? 'جاري المحاولة...' : 'حاول مرة أخرى'}</span>
          </button>
        )}
      </div>

      {variant === 'error' && error?.technical && (
        <details className="pr-6">
          <summary className="cursor-pointer text-[11px] font-bold opacity-70 hover:opacity-100 select-none">
            التفاصيل التقنية
          </summary>
          <p dir="ltr" className="mt-1.5 bg-white/60 rounded-lg p-2 text-[11px] font-mono break-words text-left">
            {error.technical}
          </p>
        </details>
      )}
    </div>
  );
};
