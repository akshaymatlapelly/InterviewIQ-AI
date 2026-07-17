import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Zap, Video, FileText, Database, MessageSquare } from 'lucide-react';
import { Button } from '../ui/Button';

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden min-h-screen flex items-center bg-[#0b0c16]">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[90px] pointer-events-none" />

      {/* Cyber vertical lines background (1st image vertical stripes) */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none flex justify-between px-10">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="w-[1px] h-full bg-white" />
        ))}
      </div>

      {/* Premium Floating Cards (Left/Right margins) */}
      <motion.div
        animate={{ 
          y: [0, -12, 0],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ 
          duration: 6, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute left-[3%] top-[25%] lg:left-[6%] lg:top-[28%] hidden md:flex items-center gap-3 glass p-4 rounded-xl border border-violet-500/30 bg-violet-950/30 backdrop-blur-xl shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-violet-400/50 hover:scale-110 hover:shadow-[0_0_45px_rgba(139,92,246,0.35)] transition-all duration-500 pointer-events-auto z-20 cursor-default"
      >
        <div className="w-9 h-9 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-400 animate-pulse">
          <Video className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-white tracking-wide">Interactive AI Avatar</div>
          <div className="text-[10px] text-slate-300 font-medium">Voice-to-voice sessions</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, -15, 0],
          rotate: [0, -2, 2, 0]
        }}
        transition={{ 
          duration: 7, 
          repeat: Infinity, 
          ease: "easeInOut", 
          delay: 0.5 
        }}
        className="absolute right-[3%] top-[25%] lg:right-[6%] lg:top-[28%] hidden md:flex items-center gap-3 glass p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/30 backdrop-blur-xl shadow-[0_0_30px_rgba(6,182,212,0.15)] hover:border-cyan-400/50 hover:scale-110 hover:shadow-[0_0_45px_rgba(6,182,212,0.35)] transition-all duration-500 pointer-events-auto z-20 cursor-default"
      >
        <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 animate-pulse">
          <FileText className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-white tracking-wide">ATS Resume Scorer</div>
          <div className="text-[10px] text-slate-300 font-medium">Dynamic keyword matcher</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 1.5, -1.5, 0]
        }}
        transition={{ 
          duration: 5.5, 
          repeat: Infinity, 
          ease: "easeInOut", 
          delay: 1 
        }}
        className="absolute left-[5%] bottom-[16%] lg:left-[10%] lg:bottom-[20%] hidden lg:flex items-center gap-3 glass p-4 rounded-xl border border-pink-500/30 bg-pink-950/30 backdrop-blur-xl shadow-[0_0_30px_rgba(236,72,153,0.15)] hover:border-pink-400/50 hover:scale-110 hover:shadow-[0_0_45px_rgba(236,72,153,0.35)] transition-all duration-500 pointer-events-auto z-20 cursor-default"
      >
        <div className="w-9 h-9 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 animate-pulse">
          <Database className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-white tracking-wide">AI Memory Engine</div>
          <div className="text-[10px] text-slate-300 font-medium">Tracks long-term growth</div>
        </div>
      </motion.div>

      <motion.div
        animate={{ 
          y: [0, -14, 0],
          rotate: [0, -1.5, 1.5, 0]
        }}
        transition={{ 
          duration: 6.5, 
          repeat: Infinity, 
          ease: "easeInOut", 
          delay: 1.5 
        }}
        className="absolute right-[5%] bottom-[16%] lg:right-[10%] lg:bottom-[20%] hidden lg:flex items-center gap-3 glass p-4 rounded-xl border border-amber-500/30 bg-amber-950/30 backdrop-blur-xl shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:border-amber-400/50 hover:scale-110 hover:shadow-[0_0_45px_rgba(245,158,11,0.35)] transition-all duration-500 pointer-events-auto z-20 cursor-default"
      >
        <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 animate-pulse">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="text-left">
          <div className="text-xs font-bold text-white tracking-wide">AI Career Coach</div>
          <div className="text-[10px] text-slate-300 font-medium">Personalized placement tips</div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Tagline Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-950/20 text-xs font-semibold text-violet-300 shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:bg-violet-950/40 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin-slow" />
            AI-Powered Interview Preparation
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight leading-[1.1] text-white drop-shadow-[0_0_15px_rgba(139,92,246,0.15)]"
          >
            Ace Every Interview with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 font-extrabold animate-pulse-glow">
              AI Intelligence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed backdrop-blur-[2px]"
          >
            Practice with our AI interviewer, get instant feedback, analyze your resume, and land your dream job with confidence.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-12 px-8 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:scale-105 active:scale-[0.98] transition-all duration-300">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-12 px-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:scale-105 active:scale-[0.98] transition-all duration-300 backdrop-blur-md">
                See How It Works
              </button>
            </a>
          </motion.div>

          {/* Bottom Features Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-12 max-w-3xl mx-auto text-slate-300 text-xs font-semibold"
          >
            <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:border-violet-500/35 transition-colors cursor-default">
              <Zap className="w-4 h-4 text-violet-400" />
              <span>Real-time AI Feedback</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:border-cyan-500/35 transition-colors cursor-default">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Resume ATS Analysis</span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:border-pink-500/35 transition-colors cursor-default">
              <Sparkles className="w-4 h-4 text-pink-400" />
              <span>Smart Interview Questions</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
export default HeroSection;
