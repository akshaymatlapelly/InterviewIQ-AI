import React from 'react';
import { cn } from '../../lib/utils';

export const Switch = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      ref={ref}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "peer inline-flex h-5.5 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-gradient-to-r from-violet-600 to-blue-600" : "bg-white/10",
        className
      )}
      {...props}
    >
      <span
        className={cn(
          "pointer-events-none block h-4.5 w-4.5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
          checked ? "translate-x-4.5" : "translate-x-0"
        )}
      />
    </button>
  );
});

Switch.displayName = "Switch";
