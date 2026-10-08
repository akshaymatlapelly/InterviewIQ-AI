import React from 'react';
import { 
  Bot, 
  EyeOff, 
  BarChart4, 
  RefreshCcw, 
  FileSearch, 
  Map 
} from 'lucide-react';
import { motion } from 'framer-motion';

export function FeaturesSection() {
  const features = [
    {
      title: "Interactive AI Avatar",
      desc: "Practice interviews with Sophia or Alex, our realistic AI interviewers. Experience voice synthesis and adaptive follow-up questioning.",
      icon: Bot,
      color: "text-violet-400 border-violet-500/10 hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)]"
    },
    {
      title: "Strict Proctor Guard",
      desc: "Experience real test environments. Active tab monitoring, window bounding, and full-screen proctoring modes reduce cheating actions.",
      icon: EyeOff,
      color: "text-rose-400 border-rose-500/10 hover:border-rose-500/40 hover:shadow-[0_0_30px_rgba(244,63,94,0.15)]"
    },
    {
      title: "Multi-Dimension Scoring",
      desc: "Get deep visual reports on technical competency, grammatical structure, vocabulary, fluency, HR suitability, and overall scores.",
      icon: BarChart4,
      color: "text-cyan-400 border-cyan-500/10 hover:border-cyan-500/40 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
    },
    {
      title: "Analytical Replay & Timeline",
      desc: "Trace your speech per-question. Analyze speech rate speeds, counts, filler words ('um', 'like', 'ah'), and review question replays.",
      icon: RefreshCcw,
      color: "text-emerald-400 border-emerald-500/10 hover:border-emerald-500/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
    },
    {
      title: "ATS Resume Analysis",
      desc: "Scan and cache your CV uploads. Receive ATS compatibility warnings, missing skills checklist, and custom suggested mock questions.",
      icon: FileSearch,
      color: "text-amber-400 border-amber-500/10 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]"
    },
    {
      title: "Career Roadmap Progress",
      desc: "Receive customized educational roadmaps detailing missing skills, suggested study materials, duration weeks, and core timelines.",
      icon: Map,
      color: "text-indigo-400 border-indigo-500/10 hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.15)]"
    }
  ];

  return (
    <section id="features" className="py-20 bg-[#0b0c16]/30 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            Equipped with Premium Prep Features
          </h2>
          <p className="text-slate-400">
            A comprehensive SaaS proctoring suite built to simulate actual HR and technical rounds.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                  delay: i * 0.05
                }}
                className={`glass p-6 rounded-xl border flex flex-col gap-4 transition-all duration-300 group cursor-pointer ${f.color}`}
              >
                <div className="w-12 h-12 rounded-lg bg-white/3 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:bg-white/5 group-hover:border-white/20 transition-all duration-300">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
