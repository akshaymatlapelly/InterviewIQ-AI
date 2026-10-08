import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { iqClient } from '../api/iqClient';
import { Button } from '../components/ui/Button';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Loader2, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle,
  Video
} from 'lucide-react';

function analyzeAnswer(answer = '') {
  const clean = answer.trim();
  if (!clean || clean === '(No response recorded)') {
    return { words: 0, fillerCount: 0, confidence: 0, speed: 0 };
  }
  const words = clean.split(/\s+/).filter(Boolean).length;
  // Match filler words
  const fillers = (clean.match(/\b(um|like|ah|uh|you\s+know)\b/gi) || []);
  const fillerCount = fillers.length;
  
  // Calculate confidence heuristic
  let confidence = 90 - (fillerCount * 8);
  if (words < 15) confidence -= 25;
  confidence = Math.max(15, Math.min(95, confidence));

  // Speed heuristic (estimated words per minute)
  const speed = Math.round(words * 2.5); // scaling factor

  return { words, fillerCount, confidence, speed };
}

function getAnswerQuality(words) {
  if (words === 0) return { label: 'No Answer', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
  if (words < 15) return { label: 'Too Brief', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  if (words > 40) return { label: 'Strong Answer', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
  return { label: 'Needs Detail', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
}

export default function InterviewReplay() {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  // Replay timeline control
  const [activeQ, setActiveQ] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchReplay = async () => {
      try {
        const data = await iqClient.entities.Interview.get(interviewId);
        setInterview(data);
        if (data) {
          if (data.transcript) {
            setTranscript(JSON.parse(data.transcript));
          }
          if (data.feedback_json) {
            setFeedback(JSON.parse(data.feedback_json));
          }
        }
      } catch (err) {
        console.error("Error fetching replay data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReplay();
  }, [interviewId]);

  // Autoplay mock timeline
  useEffect(() => {
    let playInterval;
    if (isPlaying && transcript.length > 0) {
      playInterval = setInterval(() => {
        setActiveQ(prev => {
          if (prev + 1 < transcript.length) {
            return prev + 1;
          } else {
            setIsPlaying(false);
            return 0;
          }
        });
      }, 5000); // changes questions every 5 seconds
    }
    return () => clearInterval(playInterval);
  }, [isPlaying, transcript]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-sm text-slate-400 font-display">Assembling replay dashboard...</p>
      </div>
    );
  }

  if (!interview || transcript.length === 0) {
    return (
      <div className="text-center py-12 max-w-md mx-auto space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
        <h3 className="text-xl font-bold text-white">No Replay Available</h3>
        <p className="text-slate-400 text-sm">
          No transcript content was recorded for this mock interview session.
        </p>
        <Link to="/history">
          <Button variant="outline">Back to History</Button>
        </Link>
      </div>
    );
  }

  // Compile per-question analysis
  const questionAnalyses = transcript.map((item, idx) => {
    const analysis = analyzeAnswer(item.a);
    return {
      index: idx + 1,
      question: item.q,
      answer: item.a,
      ...analysis
    };
  });

  const activeAnalysis = questionAnalyses[activeQ];
  const activeQuality = getAnswerQuality(activeAnalysis.words);

  // Radar Metrics
  const radarData = [
    { subject: 'Technical', value: interview.technical_score || 0 },
    { subject: 'Communication', value: interview.communication_score || 0 },
    { subject: 'Confidence', value: interview.confidence_score || 0 },
    { subject: 'Fluency', value: interview.fluency_score || 0 },
    { subject: 'Grammar', value: interview.grammar_score || 0 },
    { subject: 'HR/Behavioral', value: interview.hr_score || 0 }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top action row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
        <Link to="/history" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft size={16} />
          Back to History
        </Link>

        <Link to="/interview">
          <Button size="sm">
            <Video className="w-4 h-4 mr-2" />
            Practice Again
          </Button>
        </Link>
      </div>

      {/* Main Title Banner */}
      <div className="glass p-6 rounded-xl border border-white/5 bg-gradient-to-r from-violet-600/10 to-indigo-600/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Speech Timeline & Replay</span>
          <h2 className="text-xl font-bold text-white">{interview.job_role || 'Mock Practice'} - Session Replay</h2>
          <p className="text-xs text-slate-400">Trace verbal delivery rates, word counts, and confidence parameters per question.</p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/40 p-2.5 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveQ(prev => Math.max(0, prev - 1))}
            className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-30"
            disabled={activeQ === 0}
          >
            <SkipBack size={16} />
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors flex items-center justify-center"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={() => setActiveQ(prev => Math.min(transcript.length - 1, prev + 1))}
            className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-white disabled:opacity-30"
            disabled={activeQ === transcript.length - 1}
          >
            <SkipForward size={16} />
          </button>
          <span className="text-xs font-semibold text-slate-400 px-1 border-l border-white/10">
            Q{activeQ + 1}/9
          </span>
        </div>
      </div>

      {/* Grid: Question Player & Stats Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Player Card */}
        <div className="lg:col-span-2 glass border border-white/5 p-6 rounded-2xl flex flex-col justify-between gap-6 min-h-[380px]">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <span className="text-xs font-semibold text-violet-400">Question {activeAnalysis.index} text</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${activeQuality.color}`}>
                {activeQuality.label}
              </span>
            </div>

            <h3 className="text-base font-bold text-white">{activeAnalysis.question}</h3>

            <div className="p-4 rounded-xl border border-white/5 bg-[#0d0e1c] space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Verbatim Transcription</span>
              <p className="text-xs text-slate-300 leading-relaxed italic">
                "{activeAnalysis.answer}"
              </p>
            </div>
          </div>

          {/* Quick Stats Panel */}
          <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4 text-center">
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Word Count</span>
              <p className="text-lg font-bold text-white">{activeAnalysis.words}</p>
            </div>
            <div className="space-y-1 border-x border-white/5">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Filler Count</span>
              <p className="text-lg font-bold text-violet-400">{activeAnalysis.fillerCount}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Speaking Pace</span>
              <p className="text-lg font-bold text-cyan-400">{activeAnalysis.speed} WPM</p>
            </div>
          </div>
        </div>

        {/* Sidebar Mini Radar Chart */}
        <div className="glass border border-white/5 p-6 rounded-2xl flex flex-col justify-between min-h-[380px]">
          <div>
            <h3 className="text-sm font-bold text-white">Latest Competency</h3>
            <p className="text-xs text-slate-400">Dimension ratings evaluated for this session.</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" r="65%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.05)" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} tick={false} />
                <Radar name="Scoring" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <Link to={`/feedback/${interview.id}`} className="w-full">
            <Button variant="outline" className="w-full text-xs">
              Go to Full Evaluation Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Timeline Charts: Area and Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Area Chart: Confidence & Fluency curves */}
        <div className="glass border border-white/5 p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Delivery Fluency & Confidence Curve</h3>
            <p className="text-xs text-slate-400">Fluctuations in speaking pacing metrics across 9 answers.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={questionAnalyses} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="index" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d0e1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Area type="monotone" dataKey="confidence" name="Confidence Rate" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorConf)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="speed" name="Estimated Pace (WPM)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorSpeed)" strokeWidth={1.5} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart: Word counts per answer */}
        <div className="glass border border-white/5 p-6 rounded-2xl space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white">Answer Depth (Word Count Distribution)</h3>
            <p className="text-xs text-slate-400">Total vocabulary count generated per answer round.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={questionAnalyses} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis dataKey="index" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0d0e1c', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="words" name="Word Count" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
export { InterviewReplay };

