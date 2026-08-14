import React from 'react';
import { Inbox, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
  message: string;
  hint?: string;
  icon?: LucideIcon;
  className?: string;
}

/** Shown when a request succeeds but comes back with no rows. */
export const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  hint,
  icon: Icon = Inbox,
  className,
}) => (
  <div className={cn('flex flex-col items-center justify-center gap-3 py-14 px-6 text-center bg-white border border-line rounded-xl shadow-sm', className)}>
    <div className="w-14 h-14 bg-bg text-secondary/50 rounded-full flex items-center justify-center">
      <Icon size={26} />
    </div>
    <div className="space-y-1">
      <p className="font-bold text-primary text-sm">{message}</p>
      {hint && <p className="text-xs text-secondary font-medium">{hint}</p>}
    </div>
  </div>
);
