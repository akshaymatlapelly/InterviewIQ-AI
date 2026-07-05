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
      color: "text-violet-400 border-violet-500/10",
      glow: "bg-violet-500/5",
      hoverGlow: "hover:border-violet-500/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.18)]"
    },
    {
      title: "Best Score",
      value: `${bestScore}%`,
      desc: "Your highest rating",
      icon: Trophy,
      color: "text-amber-400 border-amber-500/10",
      glow: "bg-amber-500/5",
      hoverGlow: "hover:border-amber-500/40 hover:shadow-[0_0_25px_rgba(245,158,11,0.18)]"
    },
    {
      title: "Technical Average",
      value: `${avgTech}%`,
      desc: "Coding & problem solving",
      icon: Terminal,
      color: "text-cyan-400 border-cyan-500/10",
      glow: "bg-cyan-500/5",
      hoverGlow: "hover:border-cyan-500/40 hover:shadow-[0_0_25px_rgba(6,182,212,0.18)]"
    },
    {
      title: "Communication Avg",
      value: `${avgComm}%`,
      desc: "Clarity & pace",
      icon: MessageSquare,
      color: "text-emerald-400 border-emerald-500/10",
      glow: "bg-emerald-500/5",
      hoverGlow: "hover:border-emerald-500/40 hover:shadow-[0_0_25px_rgba(16,185,129,0.18)]"
    },
    {
      title: "Confidence Average",
      value: `${avgConf}%`,
      desc: "Volume & conviction",
      icon: Sparkles,
      color: "text-pink-400 border-pink-500/10",
      glow: "bg-pink-500/5",
      hoverGlow: "hover:border-pink-500/40 hover:shadow-[0_0_25px_rgba(236,72,153,0.18)]"
    },
    {
      title: "Quota Remaining",
      value: limitRemaining,
      desc: "Interviews left today",
      icon: Calendar,
      color: "text-indigo-400 border-indigo-500/10",
      glow: "bg-indigo-500/5",
      hoverGlow: "hover:border-indigo-500/40 hover:shadow-[0_0_25px_rgba(99,102,241,0.18)]"
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
            className={`glass p-4 rounded-xl border flex flex-col justify-between gap-3 ${c.color} ${c.glow} transition-all duration-300 hover:scale-[1.04] ${c.hoverGlow}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500 leading-none">
                {c.title}
              </span>
              <Icon className="w-4 h-4 shrink-0" />
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-display font-bold text-white leading-none">
                {c.value}
              </h4>
              <p className="text-[10px] text-slate-400 leading-tight">
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
