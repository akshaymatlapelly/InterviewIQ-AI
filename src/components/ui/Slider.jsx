import React from 'react';
import { cn } from '../../lib/utils';

export const Slider = React.forwardRef(({ className, min = 0, max = 100, step = 1, value, onChange, ...props }, ref) => {
  const val = Array.isArray(value) ? value[0] : value;
  
  const handleInput = (e) => {
    const newVal = parseFloat(e.target.value);
    if (onChange) {
      onChange(Array.isArray(value) ? [newVal] : newVal);
    }
  };

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={val}
      onInput={handleInput}
      ref={ref}
      className={cn(
        "w-full h-1.5 rounded-lg bg-white/10 appearance-none cursor-pointer accent-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50",
        className
      )}
      {...props}
    />
  );
});

Slider.displayName = "Slider";
