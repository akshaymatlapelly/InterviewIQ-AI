import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Zap } from 'lucide-react';
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          
          {/* Tagline Pill */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs font-semibold text-slate-300"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            AI-Powered Interview Preparation
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-display font-bold tracking-tight leading-[1.1] text-white"
          >
            Ace Every Interview with <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 font-extrabold">
              AI Intelligence
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-lg text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Practice with our AI interviewer, get instant feedback, analyze your resume, and land your dream job with confidence.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link to="/register" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-12 px-8 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] active:scale-[0.98] transition-all">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto h-12 px-8 rounded-lg bg-white/2 hover:bg-white/5 border border-white/10 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                See How It Works
              </button>
            </a>
          </motion.div>

          {/* Bottom Features Row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 pt-12 max-w-3xl mx-auto text-slate-400 text-xs font-semibold"
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-violet-400" />
              <span>Real-time AI Feedback</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Resume ATS Analysis</span>
            </div>
            <div className="flex items-center gap-2">
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
