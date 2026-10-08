import React from 'react';
import { useTheme } from '../lib/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export function ThemeToggle({ showLabel = false, className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Theme"
      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 border ${
        isDark
          ? 'bg-slate-900/80 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800'
          : 'bg-white border-slate-300/80 text-slate-800 hover:bg-slate-100 shadow-sm'
      } ${className}`}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDark ? 0 : 180, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex items-center justify-center"
      >
        {isDark ? (
          <Moon className="w-4 h-4 text-violet-400" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500 fill-amber-400/20" />
        )}
      </motion.div>

      {showLabel && (
        <span className="text-xs font-semibold tracking-wide uppercase font-mono">
          {isDark ? 'Dark' : 'Light'}
        </span>
      )}
    </button>
  );
}
