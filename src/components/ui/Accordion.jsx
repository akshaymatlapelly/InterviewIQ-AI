import React, { useState, createContext, useContext } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

const AccordionContext = createContext(null);

export function Accordion({ type = "single", collapsible = true, defaultValue, children, className }) {
  const [value, setValue] = useState(defaultValue);

  const toggleItem = (itemValue) => {
    if (type === "single") {
      setValue(prev => (prev === itemValue && collapsible ? undefined : itemValue));
    }
  };

  return (
    <AccordionContext.Provider value={{ value, toggleItem }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({ value, children, className }) {
  return (
    <div className={cn("border border-white/5 bg-white/2 rounded-lg overflow-hidden", className)}>
      <AccordionContext.Provider value={{ ...useContext(AccordionContext), itemValue: value }}>
        {children}
      </AccordionContext.Provider>
    </div>
  );
}

export function AccordionTrigger({ children, className }) {
  const { value, toggleItem, itemValue } = useContext(AccordionContext);
  const isOpen = value === itemValue;

  return (
    <button
      type="button"
      onClick={() => toggleItem(itemValue)}
      className={cn(
        "flex w-full items-center justify-between px-4 py-4 text-left font-medium text-white transition-all hover:bg-white/5",
        className
      )}
    >
      <span>{children}</span>
      <ChevronDown
        size={16}
        className={cn("text-slate-400 transition-transform duration-200", isOpen && "transform rotate-180")}
      />
    </button>
  );
}

export function AccordionContent({ children, className }) {
  const { value, itemValue } = useContext(AccordionContext);
  const isOpen = value === itemValue;

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <div className={cn("px-4 pb-4 pt-3 text-sm text-slate-300 border-t border-white/5 bg-white/1", className)}>
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
