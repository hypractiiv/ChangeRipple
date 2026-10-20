import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'default',
  size = 'md',
  ...props
}) => {
  const variants = {
    default: 'bg-slate-800 text-slate-200 border-slate-700/80',
    success: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/80',
    warning: 'bg-[#FBC02D]/15 text-[#FDD835] border-[#FBC02D]/40',
    danger: 'bg-[#C62828]/20 text-[#EF5350] border-[#C62828]/50',
    info: 'bg-sky-950/70 text-sky-300 border-sky-800/80',
    outline: 'bg-transparent text-slate-300 border-slate-700/80',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-medium px-2.5 py-1',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md border font-mono tracking-wide transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
