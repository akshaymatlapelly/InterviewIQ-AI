import React from 'react';
import { cn } from '../../lib/utils';

export const Label = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-slate-300 select-none",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
});

Label.displayName = "Label";
