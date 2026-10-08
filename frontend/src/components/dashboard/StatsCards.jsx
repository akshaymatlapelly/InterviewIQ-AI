import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  MessageSquare, 
  Terminal, 
  TrendingUp, 
  Sparkles, 
  Calendar 
} from 'lucide-react';

export default function StatsCards({ interviews = [], profile }) {
  const completed = interviews.filter(i => i.status === 'completed');
  
  // Calculations
  const totalCount = completed.length;
  const bestScore = totalCount > 0 ? Math.max(...completed.map(i => i.overall_score || 0)) : 0;
  
  const getAverage = (key) => {
    if (totalCount === 0) return 0;
    const sum = completed.reduce((acc, curr) => acc + (curr[key] || 0), 0);
    return Math.round(sum / totalCount);
  };

  const avgComm = getAverage('communication_score');
  const avgTech = getAverage('technical_score');
  const avgConf = getAverage('confidence_score');

  // Daily limit
  const dailyInterviews = profile?.daily_interviews_count || 0;
  const todayDateString = new Date().toISOString().split('T')[0];
  const isDateSame = profile?.last_interview_date === todayDateString;
  const limitRemaining = isDateSame ? Math.max(0, 10 - dailyInterviews) : 10;

  const cards = [
    {
      title: "Completed Rounds",
      value: totalCount,
      desc: "All-time mock sessions",
      icon: TrendingUp,
      color: "dark:text-violet-400 text-violet-700 border-violet-500/20 dark:border-violet-500/10",
      glow: "dark:bg-violet-500/5 bg-violet-500/10",
      hoverGlow: "hover:border-violet-500/50 hover:shadow-[0_8px_25px_rgba(139,92,246,0.18)]"
    },
    {
      title: "Best Score",
      value: `${bestScore}%`,
      desc: "Your highest rating",
      icon: Trophy,
      color: "dark:text-amber-400 text-amber-700 border-amber-500/20 dark:border-amber-500/10",
      glow: "dark:bg-amber-500/5 bg-amber-500/10",
      hoverGlow: "hover:border-amber-500/50 hover:shadow-[0_8px_25px_rgba(245,158,11,0.18)]"
    },
    {
      title: "Technical Average",
      value: `${avgTech}%`,
      desc: "Coding & problem solving",
      icon: Terminal,
      color: "dark:text-cyan-400 text-cyan-700 border-cyan-500/20 dark:border-cyan-500/10",
      glow: "dark:bg-cyan-500/5 bg-cyan-500/10",
      hoverGlow: "hover:border-cyan-500/50 hover:shadow-[0_8px_25px_rgba(6,182,212,0.18)]"
    },
    {
      title: "Communication Avg",
      value: `${avgComm}%`,
      desc: "Clarity & pace",
      icon: MessageSquare,
      color: "dark:text-emerald-400 text-emerald-700 border-emerald-500/20 dark:border-emerald-500/10",
      glow: "dark:bg-emerald-500/5 bg-emerald-500/10",
      hoverGlow: "hover:border-emerald-500/50 hover:shadow-[0_8px_25px_rgba(16,185,129,0.18)]"
    },
    {
      title: "Confidence Average",
      value: `${avgConf}%`,
      desc: "Volume & conviction",
      icon: Sparkles,
      color: "dark:text-pink-400 text-pink-700 border-pink-500/20 dark:border-pink-500/10",
      glow: "dark:bg-pink-500/5 bg-pink-500/10",
      hoverGlow: "hover:border-pink-500/50 hover:shadow-[0_8px_25px_rgba(236,72,153,0.18)]"
    },
    {
      title: "Quota Remaining",
      value: limitRemaining,
      desc: "Interviews left today",
      icon: Calendar,
      color: "dark:text-indigo-400 text-indigo-700 border-indigo-500/20 dark:border-indigo-500/10",
      glow: "dark:bg-indigo-500/5 bg-indigo-500/10",
      hoverGlow: "hover:border-indigo-500/50 hover:shadow-[0_8px_25px_rgba(99,102,241,0.18)]"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <motion.div
            key={c.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            whileHover={{ scale: 1.04, y: -2 }}
            className={`glass p-4 rounded-2xl border flex flex-col justify-between gap-3 ${c.color} ${c.glow} transition-all duration-300 ${c.hoverGlow}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-600 dark:text-slate-400 leading-none">
                {c.title}
              </span>
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-display font-bold text-slate-950 dark:text-white leading-none">
                {c.value}
              </h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-tight font-medium">
                {c.desc}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
export { StatsCards };
