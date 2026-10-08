import React from 'react';
import { Quote } from 'lucide-react';
import { motion } from 'framer-motion';

export function TestimonialsSection() {
  const reviews = [
    {
      name: "Akash Sharma",
      role: "Software Engineer @ TechCorp",
      feedback: "The AI interviewer's follow-up questions were surprisingly deep. The analytics replay pointed out that I say 'like' too much when answering technical questions. Fixed that and landed my dream job!",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Akash"
    },
    {
      name: "Sarah Jenkins",
      role: "Career Switcher",
      feedback: "The ATS resume scanner matched my past projects with suggested questions. Generating a career roadmap kept me on track with which skills to study before starting my interviews.",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Sarah"
    },
    {
      name: "Daniel Kim",
      role: "Recent CS Graduate",
      feedback: "As a student preparing for HR rounds, the voice-activated mock rounds felt so realistic. The 7-dimension scoring helped me focus on building my confidence and speed metrics.",
      avatar: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Daniel"
    }
  ];

  return (
    <section id="testimonials" className="py-20 bg-[#0b0c16]/10 border-t border-white/5 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white">
            Trusted by Candidates Worldwide
          </h2>
          <p className="text-slate-400">
            Hear from professionals who used InterviewIQ AI to refine their speaking, grammar, and tech rounds.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ 
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="glass p-6 rounded-xl border border-white/5 flex flex-col justify-between gap-6 hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.12)] transition-all duration-300 group cursor-pointer"
            >
              <div className="space-y-4">
                <Quote className="w-8 h-8 text-violet-500/40 group-hover:text-violet-400 group-hover:scale-110 transition-all duration-300" />
                <p className="text-slate-300 text-sm leading-relaxed italic">
                  "{r.feedback}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 border-t border-white/5 pt-4">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="w-10 h-10 rounded-full border border-white/10 bg-slate-800"
                />
                <div>
                  <h4 className="text-sm font-bold text-white leading-tight">{r.name}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
