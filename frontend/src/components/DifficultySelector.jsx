import React from 'react';
import { Brain, Zap, Flame, Skull } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DifficultySelector({ value, onChange }) {
  const levels = [
    {
      id: 'beginner',
      name: 'Beginner',
      desc: 'Fundamental concepts, slow speech pace, detailed tips.',
      icon: Brain,
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      activeBorder: 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-emerald-950/10 text-emerald-400',
      textColor: 'text-slate-400',
      iconColor: 'text-emerald-400'
    },
    {
      id: 'intermediate',
      name: 'Intermediate',
      desc: 'Standard interview questions, scenario tasks, normal pace.',
      icon: Zap,
      border: 'border-blue-500/20 hover:border-blue-500/40',
      activeBorder: 'border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] bg-blue-950/10 text-blue-400',
      textColor: 'text-slate-400',
      iconColor: 'text-blue-400'
    },
    {
      id: 'advanced',
      name: 'Advanced',
      desc: 'System architecture, trade-offs, strict evaluation criteria.',
      icon: Flame,
      border: 'border-amber-500/20 hover:border-amber-500/40',
      activeBorder: 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] bg-amber-950/10 text-amber-400',
      textColor: 'text-slate-400',
      iconColor: 'text-amber-400'
    },
    {
      id: 'expert',
      name: 'Expert',
      desc: 'Complex design, edge cases, rapid fire follow-up rounds.',
      icon: Skull,
      border: 'border-rose-500/20 hover:border-rose-500/40',
      activeBorder: 'border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.2)] bg-rose-950/10 text-rose-400',
      textColor: 'text-slate-400',
      iconColor: 'text-rose-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {levels.map((lvl) => {
        const Icon = lvl.icon;
        const isActive = value === lvl.id;
        return (
          <button
            key={lvl.id}
            type="button"
            onClick={() => onChange?.(lvl.id)}
            className={`glass p-5 rounded-xl border flex flex-col items-start gap-4 text-left transition-all duration-300 ${
              isActive ? lvl.activeBorder : `${lvl.border} text-slate-300 hover:bg-white/5`
            }`}
          >
            <div className={`p-2.5 rounded-lg bg-white/2 border border-white/5 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${lvl.iconColor}`} />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">{lvl.name}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{lvl.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
export { DifficultySelector };
