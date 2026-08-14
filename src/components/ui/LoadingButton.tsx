import React from 'react';
import { Spinner } from './Spinner';
import { cn } from '../../lib/cn';

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  /** Copy shown next to the spinner, e.g. «جاري الحفظ...». */
  loadingText?: string;
  spinnerSize?: number;
}

/**
 * A button that becomes disabled and shows a spinner while its action runs.
 * Every save / edit / delete / export button uses this so a record can never be
 * created twice by clicking again before the first request comes back.
 */
export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  loadingText = 'جاري الحفظ...',
  spinnerSize = 18,
  disabled,
  className,
  children,
  ...rest
}) => (
  <button
    {...rest}
    disabled={disabled || isLoading}
    aria-busy={isLoading}
    className={cn(
      'disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:opacity-60',
      className,
    )}
  >
    {isLoading ? (
      <span className="flex items-center justify-center gap-2">
        <Spinner size={spinnerSize} />
        <span>{loadingText}</span>
      </span>
    ) : (
      children
    )}
  </button>
);
