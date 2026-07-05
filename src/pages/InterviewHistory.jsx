import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { iqClient } from '../api/iqClient';
import { Button } from '../components/ui/Button';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { computeMemoryInsights } from '../utils/memoryEngine';
import { 
  History, 
  ChevronRight, 
  Clock, 
  Trophy, 
  Loader2, 
  Video, 
  Calendar,
  Sparkles,
  Lock,
  Award,
  Activity,
  Zap,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import moment from 'moment';

export default function InterviewHistory() {
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const list = await iqClient.entities.Interview.list();
        const completed = (list || [])
          .filter(i => i.status === 'completed' && i.created_by === user?.email)
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        setInterviews(completed);
      } catch (err) {
        console.error("Error fetching interview history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-sm text-slate-400 font-display">Fetching interview archives...</p>
      </div>
    );
  }

  const insights = computeMemoryInsights(interviews);

  return (
    <div className="space-y-8 pt-4 pb-10">
      {/* â”€â”€ MY GROWTH JOURNEY SECTION â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {interviews.length > 0 && (
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-xl font-display font-bold text-white flex items-center gap-2">
              My Growth Journey <Activity className="text-violet-500 w-5 h-5 animate-pulse" />
            </h3>
            <p className="text-xs text-slate-400">Silently calculated by the AI Memory Engine using historical metrics.</p>
          </div>

          {/* AI Motivation & Mentor coaching row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Motivation banner */}
            <div className="md:col-span-2 glass p-5 rounded-2xl border border-violet-500/10 flex gap-4 items-center bg-gradient-to-r from-violet-950/20 via-indigo-950/10 to-blue-950/20 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/25 hover:shadow-[0_0_25px_rgba(139,92,246,0.05)]">
              <div className="p-3 bg-violet-600/10 rounded-xl border border-violet-500/20 flex items-center justify-center shrink-0">
                <BrainCircuit className="w-6 h-6 text-violet-400 animate-pulse-glow" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Mentor Motivation</h4>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {insights.motivationMessage}
                </p>
              </div>
            </div>

            {/* Overall Growth Stat Card */}
            <div className="glass p-5 rounded-2xl border border-white/5 flex gap-4 items-center transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.05)]">
              <div className="p-3 bg-emerald-600/10 rounded-xl border border-emerald-500/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-none">Overall Score Growth</h4>
                <h3 className="text-2xl font-display font-black text-white">
                  {insights.overallGrowth >= 0 ? `+${insights.overallGrowth}%` : `${insights.overallGrowth}%`}
                </h3>
                <p className="text-[9px] text-slate-500 leading-none">Since first session</p>
              </div>
            </div>

          </div>

          {/* Chart & Coaching Summary Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Timeline Progress Line Chart */}
            <div className="lg:col-span-2 glass border border-white/5 p-6 rounded-2xl flex flex-col justify-between min-h-[320px] transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_25px_rgba(139,92,246,0.05)]">
              <div className="mb-4">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Session Progression Trend</h4>
                <p className="text-[9px] text-slate-500">Chronological score trends across core evaluated domains</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={insights.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0e0f1d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                      labelStyle={{ color: '#ffffff', fontWeight: 'bold', fontSize: '10px' }}
                      itemStyle={{ color: '#94a3b8', fontSize: '10px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="overall" name="Overall" stroke="#8b5cf6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="technical" name="Technical" stroke="#06b6d4" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="communication" name="Communication" stroke="#10b981" strokeWidth={1.5} />
                    <Line type="monotone" dataKey="confidence" name="Confidence" stroke="#ec4899" strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Mentoring Coach Panel */}
            <div className="glass border border-white/5 p-6 rounded-2xl flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.05)]">
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Trophy className="text-amber-400 w-4 h-4" />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Coaching Insights</h4>
                </div>

                <div className="space-y-4 pt-1">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Current Focus Area</span>
                    <span className="text-xs font-bold text-white">{insights.nextFocusArea}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Biggest Weakness</span>
                    <span className="text-xs font-bold text-rose-400">{insights.biggestWeakness}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Most Improved Skill</span>
                    <span className="text-xs font-bold text-emerald-400">{insights.mostImprovedSkill}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Active Streak</span>
                    <span className="text-xs font-bold text-amber-400">{insights.streak} days consecutive mock</span>
                  </div>
                </div>
              </div>

              {/* Memory statistics button link */}
              <div className="pt-2">
                <div className="text-[10px] text-slate-400 bg-white/2 border border-white/5 p-3 rounded-lg flex items-center justify-between">
                  <span>Latest badge unlocked:</span>
                  <span className="font-bold text-violet-400">{insights.latestAchievement.name}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Futuristic Achievements Badges Grid */}
          <div className="glass border border-white/5 p-6 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_25px_rgba(139,92,246,0.05)]">
            <div className="border-b border-white/5 pb-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Memory Engine Achievements</h4>
              <p className="text-[9px] text-slate-500">Premium unlocked badges representing your mock performance achievements</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {insights.achievementsList.map((badge) => (
                <div 
                  key={badge.id}
                  className={`p-4 rounded-xl border flex gap-3.5 items-center transition-all duration-300 ${
                    badge.unlocked 
                      ? `bg-gradient-to-r ${badge.color}/10 border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.02)]`
                      : 'bg-white/2 border-white/5'
                  }`}
                >
                  <div className={`p-2.5 rounded-lg flex items-center justify-center shrink-0 ${
                    badge.unlocked ? `bg-gradient-to-r ${badge.color} text-white` : 'bg-slate-800 text-slate-400'
                  }`}>
                    {badge.unlocked ? <Award size={18} /> : <Lock size={16} />}
                  </div>
                  <div className="space-y-0.5">
                    <h5 className={`text-xs font-bold ${badge.unlocked ? 'text-white' : 'text-slate-300'}`}>{badge.name}</h5>
                    <p className={`text-[10px] leading-tight ${badge.unlocked ? 'text-slate-300' : 'text-slate-400'}`}>{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section Divider */}
          <div className="border-t border-white/5 pt-4" />
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1.5">
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            Practice Archives <History className="text-slate-400 w-6 h-6" />
          </h2>
          <p className="text-sm text-slate-400">Review your past scores, replay conversations, and track progress.</p>
        </div>

        <Link to="/interview">
          <Button>
            <Video className="w-4 h-4 mr-2" /> Start New Interview
          </Button>
        </Link>
      </div>

      {interviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {interviews.map((item) => {
            const dateStr = moment(item.created_date).format('MMMM Do YYYY, h:mm a');
            const mins = Math.round(item.duration_seconds / 60) || 0;
            return (
              <div 
                key={item.id} 
                className="glass p-5 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)]"
              >
                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-600/10 text-violet-400 border border-violet-500/20">
                      {item.job_role || 'General Round'}
                    </span>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Calendar size={10} />
                      {dateStr}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-500" />
                      {mins} mins duration
                    </span>
                    <span>&bull;</span>
                    <span>{item.questions_asked || 9} questions asked</span>
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-4 md:pt-0">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <div>
                      <span className="text-xl font-display font-black text-white">{item.overall_score}%</span>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider leading-none">Rating</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/feedback/${item.id}`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Report Card
                      </Button>
                    </Link>
                    <Link to={`/replay/${item.id}`}>
                      <Button variant="glass" size="sm" className="text-xs text-violet-300 hover:text-white border-violet-500/20">
                        Replay Analytics
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass p-12 rounded-2xl border border-white/5 text-center max-w-xl mx-auto space-y-4 py-16">
          <History className="w-12 h-12 text-slate-600 mx-auto animate-pulse" />
          <h3 className="text-xl font-bold text-white">No Archive Sessions</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">
            You haven't completed any mock interviews. Your evaluations will appear here once you finish a round.
          </p>
          <Link to="/interview">
            <Button size="lg">
              <Video className="w-4 h-4 mr-2" /> Start First Round
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
export { InterviewHistory };

