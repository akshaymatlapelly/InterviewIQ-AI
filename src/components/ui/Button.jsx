import React from 'react';
import { cn } from '../../lib/utils';

export const Button = React.forwardRef(({ className, variant = 'default', size = 'default', children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
        variant === 'default' && "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg hover:shadow-violet-500/25 hover:from-violet-500 hover:to-blue-500 border border-violet-500/20",
        variant === 'glass' && "glass hover:bg-white/10 text-white border-white/10 hover:border-white/20",
        variant === 'destructive' && "bg-red-950/60 border border-red-500/30 text-red-200 hover:bg-red-900/60",
        variant === 'outline' && "border border-white/10 bg-transparent hover:bg-white/5 text-white",
        variant === 'ghost' && "hover:bg-white/5 text-white",
        size === 'default' && "h-10 px-4 py-2",
        size === 'sm' && "h-8 rounded-md px-3 text-xs",
        size === 'lg' && "h-12 rounded-lg px-8 text-base",
        size === 'icon' && "h-10 w-10",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";
