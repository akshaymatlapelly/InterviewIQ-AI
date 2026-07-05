import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { base44 } from '../api/base44Client';
import { ShareReportButton } from '../components/ShareReportButton';
import { Button } from '../components/ui/Button';
import { 
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';
import { 
  ArrowLeft, 
  Download, 
  Trophy, 
  Terminal, 
  MessageSquare, 
  Sparkles, 
  Flame, 
  Skull, 
  CheckCircle, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight,
  Loader2 
} from 'lucide-react';
import moment from 'moment';

export default function FeedbackReport() {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await base44.entities.Interview.get(interviewId);
        setInterview(data);
        if (data && data.feedback_json) {
          setFeedback(JSON.parse(data.feedback_json));
        }
      } catch (err) {
        console.error("Error fetching report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [interviewId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-sm text-slate-400 font-display">Generating performance report...</p>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="text-center py-12 max-w-md mx-auto space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">Report Not Found</h3>
        <p className="text-slate-400 text-sm">We could not resolve the requested interview session identifier.</p>
        <Link to="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // Radar Data
  const radarData = [
    { subject: 'Technical', value: interview.technical_score || 0 },
    { subject: 'Communication', value: interview.communication_score || 0 },
    { subject: 'Confidence', value: interview.confidence_score || 0 },
    { subject: 'Fluency', value: interview.fluency_score || 0 },
    { subject: 'Grammar', value: interview.grammar_score || 0 },
    { subject: 'HR/Behavioral', value: interview.hr_score || 0 }
  ];

  const scoreCards = [
    { name: 'Technical', val: interview.technical_score, icon: Terminal, color: 'text-cyan-400 bg-cyan-950/10 border-cyan-500/10' },
    { name: 'Communication', val: interview.communication_score, icon: MessageSquare, color: 'text-emerald-400 bg-emerald-950/10 border-emerald-500/10' },
    { name: 'Confidence', val: interview.confidence_score, icon: Sparkles, color: 'text-pink-400 bg-pink-950/10 border-pink-500/10' },
    { name: 'Fluency', val: interview.fluency_score, icon: Flame, color: 'text-amber-400 bg-amber-950/10 border-amber-500/10' },
    { name: 'Grammar', val: interview.grammar_score, icon: CheckCircle, color: 'text-indigo-400 bg-indigo-950/10 border-indigo-500/10' },
    { name: 'HR/Behavioral', val: interview.hr_score, icon: Skull, color: 'text-violet-400 bg-violet-950/10 border-violet-500/10' }
  ];

  const speechMetrics = [
    { name: 'Pronunciation', val: interview.pronunciation_score, suffix: '%', label: 'Sound Articulation' },
    { name: 'Problem Solving', val: interview.problem_solving_score, suffix: '%', label: 'Logical Tracing' },
    { name: 'Leadership & Conflict', val: interview.leadership_score, suffix: '%', label: 'Ownership Mindset' },
    { name: 'Behavioral STAR', val: interview.behavioral_score, suffix: '%', label: 'STAR Framework' },
    { name: 'Eye Gaze Stability', val: interview.eye_contact_score, suffix: '%', label: 'Camera Alignment' },
    { name: 'Vocabulary', val: interview.vocabulary_score, suffix: '%', label: 'Industry Terminology' },
    { name: 'Speaking Speed', val: interview.speaking_speed, suffix: ' WPM', label: 'Target: 130-150 WPM' },
    { name: 'Filler Words Used', val: interview.filler_word_count, suffix: ' words', label: 'Target: < 5' },
    { name: 'Long Pauses', val: interview.long_pause_count, suffix: ' pauses', label: 'Target: < 3' }
  ];

  return (
    <div className="space-y-8 pb-16 print:bg-white print:text-black">
      {/* Top Bar Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 print:hidden">
        <Link to="/history" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Back to History
        </Link>

        <div className="flex gap-3 w-full sm:w-auto">
          <ShareReportButton interview={interview} feedback={feedback} />
          <Button onClick={() => window.print()} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Print PDF
          </Button>
        </div>
      </div>

      {/* Main score banner */}
      <div className="glass p-6 sm:p-8 rounded-2xl border border-white/5 bg-gradient-to-r from-violet-600/10 to-cyan-500/5 flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/25 hover:shadow-[0_0_30px_rgba(139,92,246,0.06)]">
        <div className="space-y-3 text-center md:text-left">
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">Mock Interview Scorecard</span>
          <h2 className="text-3xl font-display font-bold text-white">{interview.job_role || 'General Interview'}</h2>
          <p className="text-xs text-slate-400">
            Completed on {moment(interview.created_date).format('MMMM Do YYYY, h:mm a')} &bull; Duration: {Math.round(interview.duration_seconds / 60)} minutes
          </p>
        </div>

        {/* Circular score display */}
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 rounded-full bg-[#0d0e1c] border border-white/10 flex items-center justify-center shadow-inner">
            <div className="text-center z-10">
              <span className="text-3xl font-display font-black text-white">{interview.overall_score}%</span>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">Overall</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Mentor Insights Banner */}
      {feedback && (feedback.coaching_summary || feedback.strong_answers?.length > 0) && (
        <div className="glass p-6 rounded-2xl border border-violet-500/20 bg-[#0e0f1e]/80 relative overflow-hidden space-y-4 shadow-[0_8px_32px_0_rgba(139,92,246,0.05)] transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/30 hover:shadow-[0_0_35px_rgba(139,92,246,0.08)]">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-violet-500/10 blur-[50px] pointer-events-none" />
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Sparkles className="text-violet-400 w-5 h-5 animate-pulse" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Mentor Memory Insights</h3>
          </div>
          
          {feedback.coaching_summary && (
            <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
              &ldquo; {feedback.coaching_summary} &rdquo;
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Strong Answers */}
            {feedback.strong_answers && feedback.strong_answers.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Strong Delivery Points</span>
                <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                  {feedback.strong_answers.map((ans, idx) => <li key={idx} className="leading-relaxed">{ans}</li>)}
                </ul>
              </div>
            )}
            {/* Mistakes Detected */}
            {feedback.mistakes && feedback.mistakes.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">Mistakes / Gaps Detected</span>
                <ul className="text-xs text-slate-400 list-disc pl-4 space-y-1">
                  {feedback.mistakes.map((mis, idx) => <li key={idx} className="leading-relaxed">{mis}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grid: 6 Scores + Radar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dimension score cards */}
        <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
          {scoreCards.map((sc) => {
            const Icon = sc.icon;
            return (
              <div key={sc.name} className={`glass p-5 rounded-xl border flex flex-col justify-between gap-4 ${sc.color} transition-all duration-300 hover:scale-[1.03] hover:border-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.03)]`}>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{sc.name}</span>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-2xl font-display font-black text-white leading-none">{sc.val}%</h4>
                  <div className="w-full bg-white/5 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="h-full bg-violet-500" style={{ width: `${sc.val}%` }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Radar Visualizer */}
        <div className="glass border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[280px] transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_25px_rgba(139,92,246,0.05)]">
          <div className="w-full text-left mb-4">
            <h3 className="text-sm font-bold text-white">Dimension Breakdown</h3>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="65%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} tick={false} />
                <Radar name="Scoring" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Speech & Behavior Metrics */}
      {interview.pronunciation_score !== undefined && (
        <div className="glass p-6 rounded-2xl border border-white/5 space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_25px_rgba(139,92,246,0.05)]">
          <div className="border-b border-white/5 pb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Speech & Behavior Analysis</h3>
            <p className="text-[10px] text-slate-500">Fine-grained metrics tracked silently by the AI Memory Engine</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {speechMetrics.map((sm, idx) => (
              <div key={idx} className="bg-white/2 border border-white/5 p-4 rounded-xl flex flex-col justify-between h-24">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">{sm.name}</span>
                <div>
                  <h4 className="text-xl font-display font-black text-white">{sm.val || 0}{sm.suffix}</h4>
                  <p className="text-[9px] text-slate-500 font-semibold mt-1">{sm.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Split Feedback details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths Card */}
        <div className="glass border border-white/5 p-6 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-emerald-500/15 hover:shadow-[0_0_25px_rgba(16,185,129,0.04)]">
          <h3 className="text-base font-bold text-emerald-400 border-b border-white/5 pb-2 flex items-center gap-2">
            <Trophy className="w-5 h-5" /> Core Strengths
          </h3>
          {feedback?.strengths && feedback.strengths.length > 0 ? (
            <div className="space-y-4">
              {feedback.strengths.map((str, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{str.title || str}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{str.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No strengths logged for this session.</p>
          )}
        </div>

        {/* Weaknesses / Focus Areas Card */}
        <div className="glass border border-white/5 p-6 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-rose-500/15 hover:shadow-[0_0_25px_rgba(244,63,94,0.04)]">
          <h3 className="text-base font-bold text-rose-400 border-b border-white/5 pb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Areas for Improvement
          </h3>
          {feedback?.weaknesses && feedback.weaknesses.length > 0 ? (
            <div className="space-y-4">
              {feedback.weaknesses.map((wk, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="text-sm font-bold text-white">{wk.title || wk}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{wk.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No focus areas identified.</p>
          )}
        </div>
      </div>

      {/* Tips and study resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Practical Improvement Tips */}
        <div className="glass border border-white/5 p-6 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_25px_rgba(139,92,246,0.05)]">
          <h3 className="text-base font-bold text-violet-400 border-b border-white/5 pb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5" /> Coaching Action Items
          </h3>
          {feedback?.improvements && feedback.improvements.length > 0 ? (
            <ul className="text-xs text-slate-300 space-y-2.5 list-disc pl-5 leading-relaxed">
              {feedback.improvements.map((imp, idx) => (
                <li key={idx}>{imp}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-400">No action items suggested.</p>
          )}
        </div>

        {/* Study resources links */}
        <div className="glass border border-white/5 p-6 rounded-2xl space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-indigo-500/20 hover:shadow-[0_0_25px_rgba(99,102,241,0.05)]">
          <h3 className="text-base font-bold text-indigo-400 border-b border-white/5 pb-2 flex items-center gap-2">
            <BookOpen className="w-5 h-5" /> Recommended Study Material
          </h3>
          {feedback?.resources && feedback.resources.length > 0 ? (
            <div className="space-y-3">
              {feedback.resources.map((res, idx) => (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-white/2 border border-white/5 hover:border-violet-500/30 rounded-xl flex items-center justify-between text-xs text-slate-300 hover:text-white transition-all group"
                >
                  <span className="font-semibold">{res.title || 'Learning Resource'}</span>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-violet-400 transition-colors" />
                </a>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No specific learning materials matching your score profile.</p>
          )}
        </div>
      </div>
    </div>
  );
}
export { FeedbackReport };
