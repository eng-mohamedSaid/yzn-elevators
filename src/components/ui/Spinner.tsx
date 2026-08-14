import React from 'react';
import { cn } from '../../lib/cn';

interface SpinnerProps {
  size?: number;
  className?: string;
}

/** Ring spinner that inherits `currentColor`, so it matches any button it sits in. */
export const Spinner: React.FC<SpinnerProps> = ({ size = 20, className }) => (
  <span
    role="status"
    aria-label="جاري التحميل"
    style={{ width: size, height: size, borderWidth: Math.max(2, Math.round(size / 10)) }}
    className={cn(
      'inline-block flex-shrink-0 rounded-full border-current border-t-transparent animate-spin',
      className,
    )}
  />
);
