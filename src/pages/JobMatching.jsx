import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { base44 } from '../api/base44Client';
import { 
  Briefcase, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  BookOpen, 
  Loader2,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { getActiveRole } from '../utils/emailService';

export default function JobMatching() {
  const { profile } = useAuth();
  const [matches, setMatches] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);

  const handleMatch = async () => {
    setLoading(true);
    setMatches(null);
    try {
      // Mock score summaries or profiles parsing
      let scoreSummary = [];
      try {
        const list = await base44.entities.Interview.list();
        const completed = (list || [])
          .filter(i => i.status === 'completed' && i.created_by === profile?.email)
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
          .slice(0, 5);
        scoreSummary = completed.map(i => ({
          role: i.job_role,
          score: i.overall_score,
          technical: i.technical_score,
          communication: i.communication_score
        }));
      } catch (err) {
        console.warn("Failed loading score history:", err);
      }

      const activeRole = getActiveRole(profile);
      const resumeAnalysis = profile?.resume_analysis ? JSON.parse(profile.resume_analysis) : null;
      const historyContext = scoreSummary.length > 0 
        ? `Recent completed mock interviews details: ${JSON.stringify(scoreSummary)}`
        : '';
      const resumeContext = resumeAnalysis 
        ? `Resume analysis: ${resumeAnalysis.candidate_summary || 'N/A'}. Extracted skills: ${resumeAnalysis.meta?.found_skills?.join(', ') || 'N/A'}.`
        : '';

      const prompt = `You are an Expert Career Recruiter. Suggest matching job roles for candidate targetting: ${activeRole}.
      Candidate context:
      - Preferred job role: ${activeRole}
      - Declared skills list: ${profile?.skills || 'N/A'}
      - Experience level: ${profile?.experience_level || '0-1 years'}
      - Education background: ${profile?.degree || 'N/A'}
      ${resumeContext}
      ${historyContext}

      Suggest exactly 3 suitable job roles for this candidate. For each role, calculate a realistic matching percentage (out of 100) based strictly on their skills, strengths, missing skills, and interview history. Do not inflate scores.

      Return ONLY a raw JSON array matching this structure:
      [
        {
          "title": "Frontend Engineer",
          "description": "Develop and optimize client-side applications using React and JavaScript.",
          "match_percentage": 78,
          "missing_skills": ["TypeScript", "Next.js"],
          "learn_next": ["TypeScript", "Next.js"],
          "actionable_advice": "Focus on learning TypeScript and Next.js routing to align with mid-level requirements."
        }
      ]
      Do not include markdown code block characters (\`\`\`) or extra conversational remarks.`;

      const res = await base44.integrations.Core.InvokeLLM({ prompt });
      const cleanText = (res.text || res || "[]")
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanText);
      setMatches(parsed);
      setIsAnalyzed(true);
      toast.success("Profile compatibility analysis complete!");
    } catch (err) {
      console.error("Job matching error:", err);
      toast.error("Failed to analyze profile.");
    } finally {
      setLoading(false);
    }
  };

  // Truncate skills list for the profile card summary
  const getTruncatedSkills = (skillsString) => {
    if (!skillsString) return '—';
    const list = skillsString.split(',').map(s => s.trim());
    if (list.length <= 4) return skillsString;
    return list.slice(0, 4).join(', ') + ', ...';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4 pb-10">
      
      {/* Title Header with Analyze Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          AI Job Matching
        </h2>
        <button 
          onClick={handleMatch}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg px-4 py-2.5 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-[0.98] disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Analyze My Profile
            </>
          )}
        </button>
      </div>

      {/* Your Profile summary card */}
      <div className="glass border border-white/5 p-5 rounded-2xl bg-[#0e0f1d]/50 space-y-4 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)]">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
          <Target className="text-blue-500 w-4 h-4" />
          <span className="text-xs font-bold text-white tracking-tight">Your Profile</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold block">Role:</span>
            <span className="text-slate-200 font-bold">{getActiveRole(profile)}</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold block">Experience:</span>
            <span className="text-slate-200 font-bold">{profile?.experience_level || '0-1 years'}</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold block">Education:</span>
            <span className="text-slate-200 font-bold">{profile?.degree || '—'}</span>
          </div>
          <div className="space-y-1">
            <span className="text-slate-500 font-semibold block">Skills:</span>
            <span className="text-slate-200 font-bold truncate block" title={profile?.skills}>
              {getTruncatedSkills(profile?.skills)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Results or Placeholder Panel */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 glass rounded-2xl border border-white/5 bg-[#0e0f1d]/30">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm text-slate-400">Matching job roles compatibility profiles...</p>
        </div>
      )}

      {!isAnalyzed && !loading && (
        <div className="flex flex-col items-center justify-center py-24 px-6 text-center border border-white/5 bg-[#0e0f1d]/20 rounded-2xl shadow-xl space-y-4">
          <BookOpen className="w-16 h-16 text-slate-600 stroke-[1.2]" />
          <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
            Click "Analyze My Profile" to get AI-powered job role recommendations
          </p>
        </div>
      )}

      {isAnalyzed && !loading && matches && (
        <div className="space-y-6 animate-slide-up">
          
          {/* Summary Banner */}
          <div className="glass p-4 rounded-xl border border-white/5 bg-[#0f1122]/30 text-xs text-slate-300 leading-relaxed transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)]">
            Based on <strong className="text-white">{profile?.full_name || 'your'}</strong>'s skills, experience, and education, the following job roles align well with their current qualifications and are realistic entries into the tech field.
          </div>

          {/* Matches List */}
          {/* Matches List */}
          {matches.map((match, idx) => (
            <div 
              key={idx}
              className="glass border border-white/5 p-6 rounded-2xl bg-[#0e0f1d]/40 space-y-5 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.06)] group"
            >
              {/* Header Row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  {/* Purple briefcase icon wrapper */}
                  <div className="w-10 h-10 rounded-lg bg-violet-600/10 flex items-center justify-center border border-violet-500/20 shrink-0 group-hover:border-violet-500/40 transition-colors">
                    <Briefcase className="text-violet-400 w-5 h-5 transition-transform duration-300 group-hover:rotate-6" />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-sm font-bold text-white tracking-tight">{match.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{match.description}</p>
                  </div>
                </div>

                <span className="text-xs font-black text-amber-500 shrink-0 uppercase tracking-wide">
                  {match.match_percentage}% Match
                </span>
              </div>

              {/* Progress bar matching score */}
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${match.match_percentage}%` }}
                />
              </div>

              {/* Inner Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Missing Skills box */}
                <div className="bg-[#121324]/40 border border-white/5 p-4 rounded-xl space-y-2.5 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.03)]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                    <AlertTriangle size={14} />
                    <span>Missing Skills</span>
                  </div>
                  {match.missing_skills && match.missing_skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {match.missing_skills.map((skill, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[9px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 block">None</span>
                  )}
                </div>

                {/* Learn Next box */}
                <div className="bg-[#121324]/40 border border-white/5 p-4 rounded-xl space-y-2.5 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/20 hover:shadow-[0_0_15px_rgba(139,92,246,0.03)]">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <TrendingUp size={14} />
                    <span>Learn Next</span>
                  </div>
                  {match.learn_next && match.learn_next.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {match.learn_next.map((skill, i) => (
                        <span 
                          key={i} 
                          className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[9px] font-semibold"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 block">None</span>
                  )}
                </div>
              </div>

              {/* Actionable Advice Line */}
              <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-semibold pt-1 border-t border-white/5">
                <Sparkles size={13} className="shrink-0" />
                <span>{match.actionable_advice || 'Focus on strengthening core concepts and adding related technical projects to your portfolio.'}</span>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}
export { JobMatching };
