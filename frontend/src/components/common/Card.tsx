import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className, hover = false, ...props }) => {
  return (
    <div
      className={cn(
        'bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm backdrop-blur-sm',
        hover && 'hover:border-slate-700/80 hover:bg-slate-900 transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
