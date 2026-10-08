import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { VoiceNav } from './VoiceNav';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../lib/ThemeContext';
import { iqClient } from '../api/iqClient';
import { sendDailyMissedReminder, sendWeeklyReportEmail } from '../utils/emailService';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  Video, 
  History, 
  FileText, 
  Lightbulb, 
  Trophy, 
  User, 
  Settings, 
  Briefcase, 
  LogOut, 
  Menu, 
  X,
  BrainCircuit,
  Globe,
  Star,
  MessageCircle,
  Heart,
  Loader2
} from 'lucide-react';

export function DashboardLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { logout, user, profile } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // â”€â”€ Feedback Widget States â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackName, setFeedbackName] = useState('');
  const [likedFeatures, setLikedFeatures] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [sendingFeedback, setSendingFeedback] = useState(false);

  // Auto-set name when profile is available
  useEffect(() => {
    if (profile?.full_name) {
      setFeedbackName(profile.full_name);
    }
  }, [profile]);

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackName.trim() || !remarks.trim()) {
      toast.error('Please enter your Name and Remarks.');
      return;
    }

    setSendingFeedback(true);
    try {
      const emailHtml = `
        <div style="background-color: #0b0c16; color: #f1f3f9; padding: 32px; font-family: sans-serif; max-width: 600px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); margin: 0 auto;">
          <h2 style="color: #8b5cf6; font-size: 24px; font-weight: 900; margin-bottom: 6px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; text-align: center;">ðŸ’¬ New Application Feedback</h2>
          <p style="color: #cbd5e1; font-size: 14px; margin-top: 16px;">Hello Owner, you have received new feedback about your application features and project:</p>
          
          <div style="margin: 24px 0; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 12px;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 10px; font-weight: bold; color: #94a3b8; width: 140px;">User's Name</td>
                <td style="padding: 10px; color: #ffffff;">${feedbackName}</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 10px; font-weight: bold; color: #94a3b8;">Rating</td>
                <td style="padding: 10px; color: #ffb800; font-weight: bold; font-size: 16px;">${'â˜…'.repeat(rating)}${'â˜†'.repeat(5 - rating)} (${rating}/5 Stars)</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                <td style="padding: 10px; font-weight: bold; color: #94a3b8;">Liked Features</td>
                <td style="padding: 10px; color: #ffffff;">${likedFeatures || '-'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; font-weight: bold; color: #94a3b8; vertical-align: top;">Remarks / Comments</td>
                <td style="padding: 10px; color: #cbd5e1; line-height: 1.6;">${remarks}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 11px; color: #475569; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; margin-top: 32px;">
            Sent automatically via InterviewIQ AI feedback portal.
          </p>
        </div>
      `;

      await iqClient.integrations.Core.SendEmail({
        to: 'akvibes.official143@gmail.com',
        subject: `â­ï¸ Feedback Received from ${feedbackName} (${rating}/5 Stars) | InterviewIQ AI`,
        html: emailHtml
      });

      toast.success('Thank you! Feedback sent successfully.', { icon: 'â¤ï¸' });
      setShowFeedback(false);
      setRemarks('');
      setLikedFeatures('');
    } catch (err) {
      console.error('Feedback send error:', err);
      toast.error('Failed to send feedback. Please try again.');
    } finally {
      setSendingFeedback(false);
    }
  };

  // Background email alert task runner
  useEffect(() => {
    if (!profile || !profile.email) return;

    const checkAndSendAutomatedEmails = async () => {
      try {
        const settingsKey = 'iq_reminder_settings';
        let reminderSettings = { daily: true, weekly: false };
        try {
          const saved = localStorage.getItem(settingsKey);
          if (saved) reminderSettings = JSON.parse(saved);
        } catch {}

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const currentHour = now.getHours();

        // 1. Missed Daily Practice Reminder (6:00 pm / 18:00)
        if (reminderSettings.daily && currentHour >= 18) {
          const lastSentKey = `iq_last_missed_reminder_sent_${profile.id}`;
          const lastSentDate = localStorage.getItem(lastSentKey);

          if (lastSentDate !== todayStr) {
            // Check if user completed any interviews today
            const interviews = await iqClient.entities.Interview.list();
            const completedToday = (interviews || []).some(
              i => i.status === 'completed' && i.created_by === profile.email && i.created_date?.startsWith(todayStr)
            );

            if (!completedToday) {
              await sendDailyMissedReminder(profile);
              console.log("Automatically sent daily missed practice reminder.");
            }
            // Mark as checked/sent for today
            localStorage.setItem(lastSentKey, todayStr);
          }
        }

        // 2. Weekly Performance Summary Report
        if (reminderSettings.weekly) {
          const weeklyReportKey = `iq_last_weekly_report_sent_${profile.id}`;
          const lastWeeklySent = localStorage.getItem(weeklyReportKey); // timestamp
          const lastSentTime = lastWeeklySent ? parseInt(lastWeeklySent, 10) : 0;
          const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

          if (now.getTime() - lastSentTime >= ONE_WEEK_MS) {
            // Fetch interviews from the past 7 days
            const interviews = await iqClient.entities.Interview.list();
            const sevenDaysAgo = new Date(now.getTime() - ONE_WEEK_MS);
            const weeklyAttempts = (interviews || [])
              .filter(
                i => i.status === 'completed' &&
                     i.created_by === profile.email &&
                     new Date(i.created_date) >= sevenDaysAgo
              )
              .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));

            await sendWeeklyReportEmail(profile, weeklyAttempts);
            console.log("Automatically sent weekly summary report.");
            // Update last sent timestamp
            localStorage.setItem(weeklyReportKey, now.getTime().toString());
          }
        }
      } catch (err) {
        console.error("Error executing background email scheduling tasks:", err);
      }
    };

    // Run check immediately on mount
    checkAndSendAutomatedEmails();

    // Check periodically every 5 minutes
    const interval = setInterval(checkAndSendAutomatedEmails, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [profile]);

  const isInterviewPage = pathname === '/interview';

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Mock Interview', path: '/interview', icon: Video },
    { name: 'History', path: '/history', icon: History },
    { name: 'Resume Center', path: '/resume', icon: FileText },
    { name: 'AI Knowledge Center', path: '/knowledge', icon: BrainCircuit },
    { name: 'AI Career Coach', path: '/tips', icon: Lightbulb },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Job Matching', path: '/jobs', icon: Briefcase },
    { name: 'AI Portfolio Builder', path: '/portfolio', icon: Globe },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  // Distraction-free interview mode
  if (isInterviewPage) {
    return (
      <div className="min-h-screen bg-[#0b0c16] text-[#f1f3f9]">
        <Outlet />
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex transition-colors duration-300 ${isDark ? 'bg-[#0b0c16] text-[#f1f3f9]' : 'bg-[#F4F5F0] text-slate-900'}`}>
      {/* Sidebar - Desktop */}
      <aside className={`hidden lg:flex flex-col w-64 border-r sticky top-0 h-screen shrink-0 backdrop-blur-md transition-colors ${
        isDark ? 'border-white/5 bg-[#0b0c16]/80' : 'border-slate-200/80 bg-white/90 shadow-xs'
      }`}>
        {/* Logo */}
        <div className={`h-16 flex items-center gap-2 px-6 border-b ${isDark ? 'border-white/5' : 'border-slate-200/80'}`}>
          <BrainCircuit className={`w-8 h-8 ${isDark ? 'text-violet-500 avatar-glow animate-pulse-glow' : 'text-slate-950'}`} />
          <span className={`font-display font-bold text-lg tracking-tight ${
            isDark ? 'bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400' : 'text-slate-950 font-black'
          }`}>InterviewIQ AI</span>
        </div>

        {/* Links */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                  isActive 
                    ? (isDark 
                        ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/10 text-white border-l-2 border-violet-500 shadow-md shadow-violet-500/5 font-semibold' 
                        : 'bg-slate-950 text-white border-l-4 border-lime-400 shadow-md font-bold')
                    : (isDark 
                        ? 'text-slate-400 hover:text-white hover:bg-white/5 hover:scale-[1.02] hover:translate-x-0.5' 
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/90 hover:scale-[1.02] hover:translate-x-0.5')
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                  isActive 
                    ? (isDark ? 'text-violet-400' : 'text-lime-400') 
                    : (isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-950')
                }`} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info / Logout */}
        <div className={`p-4 border-t ${isDark ? 'border-white/5 bg-white/1' : 'border-slate-200/80 bg-slate-50/60'}`}>
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold uppercase shadow-inner ${
              isDark ? 'bg-violet-600 text-white' : 'bg-slate-950 text-lime-400'
            }`}>
              {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className={`text-sm font-semibold truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{user?.full_name || 'User'}</p>
              <p className="text-xs text-slate-500 truncate leading-none mt-1">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isDark 
                ? 'text-red-400 hover:text-red-300 hover:bg-red-950/20 border border-transparent hover:border-red-900/30' 
                : 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200'
            }`}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        {/* Floating Light Mode Ambient Mesh Orbs */}
        {!isDark && (
          <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-lime-400/25 blur-[90px] animate-float-mesh" />
            <div className="absolute top-1/3 right-10 w-96 h-96 rounded-full bg-violet-400/20 blur-[100px] animate-float-mesh" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-10 left-1/3 w-96 h-96 rounded-full bg-cyan-400/20 blur-[95px] animate-float-mesh" style={{ animationDelay: '4s' }} />
            <div className="absolute top-2/3 right-1/4 w-80 h-80 rounded-full bg-rose-400/15 blur-[90px] animate-float-mesh" style={{ animationDelay: '6s' }} />
          </div>
        )}

        {/* Header */}
        <header className={`h-16 border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40 backdrop-blur-md transition-colors ${
          isDark ? 'border-white/5 bg-[#0b0c16]/30' : 'border-slate-200/80 bg-white/80 shadow-xs'
        }`}>
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/5 text-slate-300 hover:text-white' : 'hover:bg-slate-100 text-slate-700'}`}
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <BrainCircuit className={`w-6 h-6 ${isDark ? 'text-violet-500 animate-pulse-glow' : 'text-slate-950'}`} />
              <span className={`font-display font-bold text-md ${isDark ? 'bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400' : 'text-slate-950 font-black'}`}>InterviewIQ</span>
            </div>
          </div>

          <div className={`hidden lg:block text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            Welcome back, <span className={`font-semibold ${isDark ? 'text-white' : 'text-slate-950'}`}>{user?.full_name || 'User'}</span>
          </div>

          {/* Voice Navigation Integration & Theme Toggle */}
          <div className="flex items-center gap-3">
            <VoiceNav />
            <ThemeToggle showLabel />
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto relative z-10">
          <div className="max-w-7xl mx-auto space-y-8 animate-slide-up">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Content */}
          <aside className="relative flex flex-col w-64 max-w-xs bg-[#0b0c16] border-r border-white/10 h-full p-4 text-white z-10 glass-strong">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-white/5 text-slate-400"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 px-2 py-4 mb-4">
              <BrainCircuit className="text-violet-500 w-8 h-8 animate-pulse-glow" />
              <span className="font-display font-bold text-lg">InterviewIQ AI</span>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                      isActive 
                        ? 'bg-gradient-to-r from-violet-600/20 to-blue-600/10 text-white border-l-2 border-violet-500 shadow-md shadow-violet-500/5'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 hover:scale-[1.02] hover:translate-x-0.5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${isActive ? 'text-violet-400' : 'text-slate-400'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto border-t border-white/5 pt-4 bg-white/1 p-2 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white uppercase text-sm">
                  {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold truncate text-white">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 w-full px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-950/20 transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </aside>
        </div>
      )}
      {/* â”€â”€ FLOATING FEEDBACK BUTTON â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="fixed bottom-6 right-6 z-[100]">
        <button
          onClick={() => setShowFeedback(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all group relative"
        >
          <MessageCircle size={22} className="group-hover:rotate-6 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500"></span>
          </span>
        </button>
      </div>

      {/* â”€â”€ FLOATING FEEDBACK FORM â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className="fixed bottom-24 right-6 z-[100] w-full max-w-sm bg-[#0e0f1d] border border-white/8 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.2)] overflow-hidden text-left"
          >
            {/* Form Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-gradient-to-r from-violet-500/5 to-blue-500/5">
              <div className="flex items-center gap-2">
                <Heart size={16} className="text-violet-400 fill-violet-400/20" />
                <h3 className="font-black text-white text-xs uppercase tracking-wider">Share Feedback</h3>
              </div>
              <button 
                onClick={() => setShowFeedback(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
              >
                <X size={14} />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSendFeedback} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase block">Your Name</label>
                <input 
                  value={feedbackName} 
                  onChange={(e) => setFeedbackName(e.target.value)} 
                  placeholder="e.g. Akshay Matlapelly"
                  className="w-full bg-[#070812] border border-white/8 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50 transition-colors h-9"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase block">Rating</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Star 
                        size={20} 
                        className={`transition-colors ${
                          star <= (hoverRating || rating) 
                            ? 'fill-amber-400 text-amber-400' 
                            : 'text-slate-600 fill-transparent'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase block">Liked Features</label>
                <input 
                  value={likedFeatures} 
                  onChange={(e) => setLikedFeatures(e.target.value)} 
                  placeholder="e.g. AI Portfolio, Interview Mock"
                  className="w-full bg-[#070812] border border-white/8 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/50 transition-colors h-9"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase block">Remarks & Comments</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Tell us what you think or suggest improvements..."
                  rows={3}
                  className="w-full bg-[#070812] border border-white/8 rounded-lg px-3 py-2 text-xs text-white resize-none focus:outline-none focus:border-violet-500/50 transition-colors min-h-[70px]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sendingFeedback}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:opacity-90 text-white font-black text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
              >
                {sendingFeedback ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <span>Send Feedback</span>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

