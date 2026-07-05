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
      color: "text-violet-400 border-violet-500/10 hover:border-violet-500/25"
    },
    {
      title: "Strict Proctor Guard",
      desc: "Experience real test environments. Active tab monitoring, window bounding, and full-screen proctoring modes reduce cheating actions.",
      icon: EyeOff,
      color: "text-rose-400 border-rose-500/10 hover:border-rose-500/25"
    },
    {
      title: "Multi-Dimension Scoring",
      desc: "Get deep visual reports on technical competency, grammatical structure, vocabulary, fluency, HR suitability, and overall scores.",
      icon: BarChart4,
      color: "text-cyan-400 border-cyan-500/10 hover:border-cyan-500/25"
    },
    {
      title: "Analytical Replay & Timeline",
      desc: "Trace your speech per-question. Analyze speech rate speeds, counts, filler words ('um', 'like', 'ah'), and review question replays.",
      icon: RefreshCcw,
      color: "text-emerald-400 border-emerald-500/10 hover:border-emerald-500/25"
    },
    {
      title: "ATS Resume Analysis",
      desc: "Scan and cache your CV uploads. Receive ATS compatibility warnings, missing skills checklist, and custom suggested mock questions.",
      icon: FileSearch,
      color: "text-amber-400 border-amber-500/10 hover:border-amber-500/25"
    },
    {
      title: "Career Roadmap Progress",
      desc: "Receive customized educational roadmaps detailing missing skills, suggested study materials, duration weeks, and core timelines.",
      icon: Map,
      color: "text-indigo-400 border-indigo-500/10 hover:border-indigo-500/25"
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
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`glass p-6 rounded-xl border flex flex-col gap-4 hover:shadow-lg transition-all duration-300 ${f.color}`}
              >
                <div className="w-12 h-12 rounded-lg bg-white/3 flex items-center justify-center border border-white/10">
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
