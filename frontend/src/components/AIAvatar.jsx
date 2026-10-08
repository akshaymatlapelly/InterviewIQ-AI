import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

export function AIAvatar({ isSpeaking, isThinking, isListening, gender = 'female', onGenderChange }) {
  const [blink, setBlink] = useState(false);

  // Periodic blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const avatarUrl = gender === 'female'
    ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
    : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300';

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Holographic Glowing Ring Container */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* Holographic outer spinning border */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className={`absolute inset-0 rounded-full border-2 border-dashed ${
            isListening ? 'border-cyan-400' : isSpeaking ? 'border-violet-500' : isThinking ? 'border-pink-500' : 'border-slate-700'
          }`}
        />

        {/* Outer glowing pulsing orb */}
        <motion.div
          animate={{
            scale: isSpeaking ? [1, 1.05, 1] : isListening ? [1, 1.02, 1] : 1,
            opacity: isListening ? [0.2, 0.4, 0.2] : 0.2,
          }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className={`absolute -inset-2 rounded-full blur-xl transition-colors duration-300 ${
            isListening ? 'bg-cyan-500/20' : isSpeaking ? 'bg-violet-500/20' : isThinking ? 'bg-pink-500/20' : 'bg-transparent'
          }`}
        />

        {/* Listening visual pulse */}
        {isListening && (
          <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30 animate-ping pointer-events-none" />
        )}

        {/* Thinking visual particle ring */}
        {isThinking && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2 + i,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                className="absolute w-36 h-36 rounded-full border border-pink-400/20"
                style={{ rotate: `${i * 60}deg` }}
              />
            ))}
          </div>
        )}

        {/* Avatar Image Shell */}
        <motion.div
          animate={isListening ? { y: [0, -3, 0] } : {}}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
          className={`w-32 h-32 rounded-full bg-slate-900 border-2 overflow-hidden relative shadow-inner z-10 transition-colors duration-300 ${
            isListening ? 'border-cyan-400' : isSpeaking ? 'border-violet-500' : isThinking ? 'border-pink-500' : 'border-white/10'
          }`}
        >
          {/* Avatar graphic */}
          <img
            src={avatarUrl}
            alt="AI Interviewer"
            className={`w-full h-full object-cover transition-all duration-300 ${
              blink ? 'scale-y-[0.05] opacity-50' : 'scale-y-100 opacity-90'
            } ${isThinking ? 'brightness-75' : ''}`}
          />
        </motion.div>
      </div>

      {/* Avatar Identity & State Badges */}
      <div className="flex flex-col items-center gap-2 z-10 text-center">
        <div className="flex items-center justify-center gap-2">
          <span className="text-base font-bold text-white">
            {gender === 'female' ? 'Sophia' : 'Alex'}
          </span>
          <button
            onClick={() => onGenderChange?.(gender === 'female' ? 'male' : 'female')}
            className="p-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/5"
            title="Toggle Voice Gender"
          >
            <RefreshCw size={10} />
          </button>
        </div>
        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
          Senior Technical Interviewer
        </span>

        {/* Status indicator badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-600/10 border border-violet-500/20 text-violet-400 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
          {isSpeaking ? 'Speaking' : isListening ? 'Listening' : isThinking ? 'Thinking' : 'Idle'}
        </div>

        {/* Real-time speaking waves */}
        <div className="flex items-end justify-center gap-1 h-6 mt-3">
          {[1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1].map((bar, i) => (
            <motion.div
              key={i}
              animate={isSpeaking ? { height: [4, 20, 4] } : { height: 4 }}
              transition={{ duration: 0.4 + (i * 0.04), repeat: Infinity, ease: 'easeInOut' }}
              className={`w-0.75 rounded-full ${isSpeaking ? 'bg-violet-400' : isListening ? 'bg-cyan-400' : 'bg-slate-700'}`}
              style={{ width: '3px' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
