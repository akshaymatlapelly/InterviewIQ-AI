import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { iqClient } from '../api/iqClient';
import { StatsCards } from '../components/dashboard/StatsCards';
import { PerformanceCharts } from '../components/dashboard/PerformanceCharts';
import { Button } from '../components/ui/Button';
import { computeMemoryInsights } from '../utils/memoryEngine';
import {
  Video,
  Sparkles,
  Loader2,
  FileText,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Award,
  Flame,
  Zap,
  Activity
} from 'lucide-react';
import moment from 'moment';

export default function Dashboard() {
  const { user, profile, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [atsAnalysis, setAtsAnalysis] = useState(null);

  useEffect(() => {
    // Redirect if onboarding not completed
    if (!authLoading && !profile) {
      navigate('/onboarding');
      return;
    }

    if (profile) {
      // Parse cached resume ATS analysis
      try {
        if (profile.resume_analysis) {
          setAtsAnalysis(JSON.parse(profile.resume_analysis));
        }
      } catch (e) {
        console.error("Error parsing resume analysis JSON:", e);
      }

      // Fetch interviews
      const fetchInterviews = async () => {
        try {
          // List interviews; filter locally or by created_by if available
          const list = await iqClient.entities.Interview.list();
          const sorted = (list || [])
            .filter(i => i.created_by === user?.email)
            .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
          setInterviews(sorted);
        } catch (err) {
          console.error("Error fetching interviews:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchInterviews();
    }
  }, [profile, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-sm text-slate-400 font-display">Assembling dashboard...</p>
      </div>
    );
  }

  // Quota calculation
  const dailyInterviews = profile?.daily_interviews_count || 0;
  const todayDateString = new Date().toISOString().split('T')[0];
  const isDateSame = profile?.last_interview_date === todayDateString;
  const limitRemaining = isDateSame ? Math.max(0, 10 - dailyInterviews) : 10;
  const isLimitReached = limitRemaining === 0;

  const recentRounds = interviews.filter(i => i.status === 'completed').slice(0, 3);
  const isNewUser = localStorage.getItem('iq_is_new_user') === 'true';

  const insights = computeMemoryInsights(interviews);

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Banner */}
      <div className="glass p-6 sm:p-8 rounded-2xl border border-violet-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-blue-950/40 shadow-[0_8px_32px_0_rgba(139,92,246,0.08)] transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/40 hover:shadow-[0_0_35px_rgba(139,92,246,0.15)]">
        {/* Card internal glows */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-violet-500/15 blur-[60px] pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-blue-500/15 blur-[50px] pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white flex items-center gap-2">
            Accelerate Your Preparation <Sparkles className="text-amber-400 w-6 h-6 animate-pulse" />
          </h2>
          <p className="text-sm text-slate-300 max-w-xl">
            {isNewUser ? 'Welcome' : 'Welcome back'}, <span className="font-bold text-white">{profile?.full_name || user?.full_name || 'Candidate'}</span>. Practice structured interviews, improve your fluency, and score technical categories.
          </p>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          <Link to="/interview">
            <Button size="lg" className="w-full md:w-auto h-12" disabled={isLimitReached}>
              <Video className="w-4 h-4 mr-2" />
              {isLimitReached ? 'Daily Quota Reached' : 'Start Mock Interview'}
            </Button>
          </Link>
          {isLimitReached && (
            <div className="text-[10px] text-rose-400 flex items-center gap-1">
              <AlertTriangle size={10} />
              <span>You have completed 10 interviews today. Quota resets tomorrow.</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Panel */}
      <StatsCards interviews={interviews} profile={profile} />

      {/* Charts Panel */}
      <PerformanceCharts interviews={interviews} />

      {/* Split layout: Resume ATS, AI Memory Insights & Recent Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ATS Resume Scan */}
        <div className="glass border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-6 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)]">
          <div className="space-y-4">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <FileText className="text-violet-500 w-5 h-5" />
              <h3 className="text-base font-bold text-white">Resume Center (ATS Analysis)</h3>
            </div>

            {atsAnalysis ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-lg bg-white/2 border border-white/5">
                  <span className="text-sm text-slate-300 font-medium">ATS Match Score</span>
                  <span className={`text-xl font-bold font-display ${atsAnalysis.ats_score >= 80 ? 'text-emerald-400' : atsAnalysis.ats_score >= 60 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                    {atsAnalysis.ats_score}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-emerald-400">Core Strengths</span>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                      {(atsAnalysis.strengths || []).slice(0, 3).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing Skills */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-rose-400">Missing/Gap Skills</span>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc pl-4">
                      {(atsAnalysis.missing_skills || []).slice(0, 3).map((ms, i) => (
                        <li key={i}>{ms}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No resume analysis found. Upload a resume in Onboarding or Resume Center to unlock ATS scoring.
              </p>
            )}
          </div>

          <Link to="/resume" className="w-full">
            <Button variant="outline" className="w-full text-xs">
              Go to Resume Center
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* AI Memory Insights */}
        <div className="glass border border-violet-500/10 p-6 rounded-2xl flex flex-col justify-between gap-6 bg-[#0e0f1e]/40 relative overflow-hidden shadow-[0_8px_32px_0_rgba(139,92,246,0.05)] transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.08)]">
          {/* Internal Glow */}
          <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-violet-500/10 blur-[40px] pointer-events-none" />

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <Award className="text-violet-400 w-5 h-5 animate-pulse" />
                <h3 className="text-base font-bold text-white">AI Memory Insights</h3>
              </div>
              <Link to="/history" className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center">
                Growth Page
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300">
              <div className="flex justify-between items-center bg-white/2 border border-white/5 p-2 rounded-lg">
                <span className="text-slate-400">Total Practice Rounds</span>
                <span className="font-bold text-white text-sm">{insights.totalInterviews}</span>
              </div>
              <div className="flex justify-between items-center bg-white/2 border border-white/5 p-2 rounded-lg">
                <span className="text-slate-400">Current Daily Streak</span>
                <span className="font-bold text-amber-400 text-sm flex items-center gap-1">
                  <Flame size={12} className="fill-amber-400/10 text-amber-400" />
                  {insights.streak} Days
                </span>
              </div>
              <div className="flex justify-between items-center bg-white/2 border border-white/5 p-2 rounded-lg">
                <span className="text-slate-400">Most Improved Dimension</span>
                <span className="font-bold text-emerald-400 text-sm">{insights.mostImprovedSkill}</span>
              </div>
              <div className="flex justify-between items-center bg-white/2 border border-white/5 p-2 rounded-lg">
                <span className="text-slate-400">Primary Core Weakness</span>
                <span className="font-bold text-rose-400 text-sm">{insights.biggestWeakness}</span>
              </div>
              <div className="flex justify-between items-center bg-white/2 border border-white/5 p-2 rounded-lg">
                <span className="text-slate-400">Latest Unlocked Badge</span>
                <span className="font-bold text-violet-400 font-display text-sm">{insights.latestAchievement.name}</span>
              </div>
              <div className="flex justify-between items-center bg-white/2 border border-white/5 p-2 rounded-lg">
                <span className="text-slate-400">Next Action Focus Area</span>
                <span className="font-bold text-blue-400 truncate text-[11px] max-w-[150px]">{insights.nextFocusArea}</span>
              </div>
            </div>
          </div>

          <Link to="/history" className="w-full">
            <Button variant="outline" className="w-full text-xs">
              Go to Growth Journey
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Recent Interviews list */}
        <div className="glass border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-6 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/20 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)]">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="text-violet-500 w-5 h-5" />
                <h3 className="text-base font-bold text-white">Recent Completed Rounds</h3>
              </div>
              <Link to="/history" className="text-xs text-violet-400 hover:text-violet-300 font-semibold flex items-center">
                View All
                <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
              </Link>
            </div>

            {recentRounds.length > 0 ? (
              <div className="space-y-2.5">
                {recentRounds.map((round) => (
                  <div key={round.id} className="p-3 bg-white/2 border border-white/5 hover:border-white/10 rounded-xl flex items-center justify-between transition-colors">
                    <div>
                      <h4 className="text-xs font-bold text-white leading-tight">{round.job_role || 'General Mock Round'}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {moment(round.created_date).format('MMM Do, YYYY')} &bull; {round.questions_asked || 0} questions
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-violet-400">{round.overall_score}%</span>
                      <Link to={`/feedback/${round.id}`}>
                        <Button size="sm" variant="glass" className="h-7 text-[10px] px-2.5">Report</Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-500">
                You haven't completed any mock interviews yet. Click "Start Mock Interview" to begin your first round.
              </div>
            )}
          </div>

          <Link to="/history" className="w-full">
            <Button variant="outline" className="w-full text-xs">
              Go to History
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
export { Dashboard };
