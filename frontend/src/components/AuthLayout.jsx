import React from 'react';
import { BrainCircuit } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AuthLayout({ icon: Icon = BrainCircuit, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen bg-[#0b0c16] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[200px] h-[200px] rounded-full bg-cyan-600/5 blur-[80px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <Icon className="text-violet-500 w-10 h-10 animate-pulse-glow" />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 max-w-sm">{subtitle}</p>}
        </div>

        {/* Card Body */}
        <div className="glass p-6 sm:p-8 rounded-2xl border border-white/5 shadow-xl space-y-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="text-center text-xs text-slate-400">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
export { AuthLayout };
