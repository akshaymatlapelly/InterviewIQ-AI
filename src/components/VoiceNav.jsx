import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, Sparkles } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export function VoiceNav() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [popup, setPopup] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setListening(true);
      setTranscript('Listening for command...');
      setPopup(true);
    };

    rec.onresult = (event) => {
      const command = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(`Command heard: "${command}"`);
      handleCommand(command);
    };

    rec.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setTranscript(`Error: ${event.error}`);
      setListening(false);
      setTimeout(() => setPopup(false), 2000);
    };

    rec.onend = () => {
      setListening(false);
      setTimeout(() => setPopup(false), 3000);
    };

    recognitionRef.current = rec;
  }, []);

  const handleCommand = (cmd) => {
    let responseText = '';
    let targetRoute = '';

    if (cmd.includes('dashboard') || cmd.includes('home') || cmd === 'go to dashboard') {
      responseText = 'Navigating to Dashboard';
      targetRoute = '/dashboard';
    } else if (cmd.includes('interview') || cmd.includes('practice') || cmd.includes('start')) {
      responseText = 'Starting Mock Interview setup';
      targetRoute = '/interview';
    } else if (cmd.includes('history') || cmd.includes('past')) {
      responseText = 'Opening Interview History';
      targetRoute = '/history';
    } else if (cmd.includes('resume')) {
      responseText = 'Navigating to Resume Center';
      targetRoute = '/resume';
    } else if (cmd.includes('coach') || cmd.includes('tips')) {
      responseText = 'Opening AI Career Coach';
      targetRoute = '/tips';
    } else if (cmd.includes('leaderboard') || cmd.includes('rank')) {
      responseText = 'Navigating to Leaderboard';
      targetRoute = '/leaderboard';
    } else if (cmd.includes('roadmap') || cmd.includes('skills')) {
      responseText = 'Opening Career Roadmap';
      targetRoute = '/roadmap';
    } else if (cmd.includes('job') || cmd.includes('match')) {
      responseText = 'Navigating to AI Job Matching';
      targetRoute = '/jobs';
    } else if (cmd.includes('profile')) {
      responseText = 'Opening Profile settings';
      targetRoute = '/profile';
    } else if (cmd.includes('setting')) {
      responseText = 'Opening Application Settings';
      targetRoute = '/settings';
    } else if (cmd.includes('logout') || cmd.includes('sign out')) {
      responseText = 'Logging out';
      speakConfirm(responseText, () => logout());
      return;
    } else {
      setTranscript(`Unknown command: "${cmd}". Try saying "dashboard" or "settings".`);
      speakConfirm("Command not recognized.");
      return;
    }

    if (targetRoute) {
      speakConfirm(responseText, () => navigate(targetRoute));
    }
  };

  const speakConfirm = (text, callback) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => {
        callback?.();
      };
      window.speechSynthesis.speak(utterance);
    } else {
      callback?.();
    }
  };

  const toggleMic = () => {
    if (!supported) return;
    if (listening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
    }
  };

  if (!supported) return null;

  return (
    <div className="relative">
      <button
        onClick={toggleMic}
        className={`relative p-2.5 rounded-lg border transition-all flex items-center justify-center gap-2 ${
          listening
            ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
            : 'bg-white/3 border-white/10 text-slate-300 hover:text-white hover:bg-white/5'
        }`}
        title="Voice Navigation (Say 'go to profile', 'dashboard', etc.)"
      >
        {listening ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
        <span className="text-xs font-semibold hidden md:inline">Voice Command</span>
      </button>

      <AnimatePresence>
        {popup && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="absolute right-0 top-14 w-72 glass-strong border border-violet-500/20 shadow-2xl p-4 rounded-xl z-50 text-white flex flex-col gap-3"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <span className="text-xs font-bold text-violet-400 tracking-wider uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Voice Assistant
              </span>
              {listening && (
                <div className="flex items-end gap-0.5 h-4">
                  {[1, 2, 3, 4, 3, 2, 1].map((bar, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, 14, 4] }}
                      transition={{ duration: 0.4 + (i * 0.04), repeat: Infinity, ease: 'easeInOut' }}
                      className="w-0.5 bg-violet-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </div>
            <p className="text-sm font-medium text-slate-200">{transcript}</p>
            <div className="text-[10px] text-slate-400 border-t border-white/5 pt-2">
              Try saying: <span className="text-slate-300 italic">"Dashboard"</span>, <span className="text-slate-300 italic">"Resume"</span>, or <span className="text-slate-300 italic">"Settings"</span>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
