import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export const LoadingSpinner: React.FC<{ message?: string; className?: string }> = ({
  message = 'Loading data...',
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center p-12 text-slate-400 gap-3', className)}>
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/30">
      {icon && <div className="mb-4 text-slate-500 p-3 bg-slate-800/50 rounded-full">{icon}</div>}
      <h4 className="text-base font-semibold text-slate-200">{title}</h4>
      <p className="text-sm text-slate-400 max-w-sm mt-1 mb-5">{description}</p>
      {action}
    </div>
  );
};
