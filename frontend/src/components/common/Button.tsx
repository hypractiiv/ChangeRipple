import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  ...props
}) => {
  const variants = {
    primary:
<<<<<<< HEAD
      'bg-gradient-to-r from-[#FBC02D] to-[#FF8F00] hover:from-[#FDD835] hover:to-[#FFA000] text-slate-950 font-bold shadow-md shadow-orange-950/40 border border-amber-300/50',
    secondary:
      'bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700/80 hover:border-amber-500/40 hover:text-amber-200',
    danger:
      'bg-[#C62828] hover:bg-[#D32F2F] text-white shadow-sm shadow-red-950/50 border border-red-500/40',
    ghost:
      'hover:bg-slate-800/80 text-slate-300 hover:text-amber-200',
    outline:
      'bg-transparent hover:bg-slate-800/80 text-slate-300 hover:text-amber-200 border border-slate-700 hover:border-amber-500/50',
=======
      'bg-brand-600 hover:bg-brand-500 text-white shadow-sm shadow-brand-900/40 border border-brand-500/40',
    secondary:
      'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80',
    danger:
      'bg-red-600 hover:bg-red-500 text-white shadow-sm shadow-red-900/40 border border-red-500/40',
    ghost:
      'hover:bg-slate-800/80 text-slate-300 hover:text-white',
    outline:
      'bg-transparent hover:bg-slate-800 text-slate-300 border border-slate-700',
>>>>>>> d26229447ca75383cba0b12e543832c98380e13c
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-1.5 rounded',
    md: 'text-sm px-3.5 py-2 rounded-lg',
    lg: 'text-base px-5 py-2.5 rounded-lg',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
      {children}
    </button>
  );
};
