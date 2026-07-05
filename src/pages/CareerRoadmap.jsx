import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { iqClient } from '../api/iqClient';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { 
  Loader2, 
  Map, 
  CheckCircle2, 
  Star, 
  Clock, 
  BookOpen, 
  Search, 
  Circle,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

import { getActiveRole } from '../utils/emailService';

export default function CareerRoadmap() {
  const { profile } = useAuth();
  const [role, setRole] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [checkedSkills, setCheckedSkills] = useState(new Set());



  const handleGenerate = async (targetRole) => {
    const queryRole = targetRole || role;
    if (!queryRole.trim()) {
      toast.error("Please enter a target job role.");
      return;
    }

    setLoading(true);
    setRoadmap(null);
    setCheckedSkills(new Set());
    try {
      // Gather interview history gaps
      let historyContext = "";
      try {
        const list = await iqClient.entities.Interview.list();
        const completed = (list || [])
          .filter(i => i.status === 'completed' && i.created_by === profile?.email)
          .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
          .slice(0, 5);

        if (completed.length > 0) {
          const weakGaps = [];
          completed.forEach(i => {
            if (i.feedback_json) {
              try {
                const fb = JSON.parse(i.feedback_json);
                const weaknesses = fb.weaknesses || fb.weakPoints || [];
                weaknesses.forEach(w => {
                  if (typeof w === 'string') weakGaps.push(w);
                  else if (w.title) weakGaps.push(w.title);
                });
              } catch {}
            }
          });
          if (weakGaps.length > 0) {
            historyContext = `User's weak skills/gap areas noted in recent interviews: ${Array.from(new Set(weakGaps)).join(', ')}. Please target improving these areas.`;
          }
        }
      } catch (err) {
        console.warn("Failed retrieving history for roadmap context:", err);
      }

      // Gather resume information
      const resumeAnalysis = profile?.resume_analysis ? JSON.parse(profile.resume_analysis) : null;
      const resumeContext = resumeAnalysis 
        ? `Candidate resume profile: ${resumeAnalysis.candidate_summary || 'N/A'}. Identified skills: ${resumeAnalysis.meta?.found_skills?.join(', ') || 'N/A'}.`
        : '';

      const prompt = `You are a Senior Career Coach and Technical Director.
      Generate a structured study roadmap for a candidate targeting this job role: ${queryRole}

      Candidate profile context:
      - Preferred job role: ${queryRole}
      - Declared skills list: ${profile?.skills || 'N/A'}
      - Experience level: ${profile?.experience_level || '0-1 years'}
      - Education background: ${profile?.degree || 'N/A'}
      ${resumeContext}
      ${historyContext}

      Requirements:
      - Customize the roadmap specifically to improve the candidate's skill gaps and weaknesses while building a path towards the target role.
      - Breakdown the roadmap into exactly 4 categories (foundation, core, advanced, mastery).
      - For each category specify: title, duration in weeks (number), estimated resources (string), and a skills array (list of 3-4 specific skill names).
      - Maintain strict technical relevance and practical resources.

      Return ONLY a JSON object matching this structure:
      {
        "role": "${queryRole}",
        "timeline": [
          {
            "category": "foundation",
            "title": "HTML, CSS & JS Basics",
            "weeks": 4,
            "skills": ["Semantic HTML", "Flexbox & Grid", "DOM Manipulation"],
            "resources": "MDN Web Docs, freeCodeCamp"
          },
          {
            "category": "core",
            "title": "React Architecture",
            "weeks": 6,
            "skills": ["State management (Zustand)", "Effect lifecycle hooks", "Reconciliation API"],
            "resources": "Official React Docs, Epic React"
          },
          {
            "category": "advanced",
            "title": "Testing & Build Tools",
            "weeks": 4,
            "skills": ["Jest & React Testing Library", "Vite build setups", "Webpack configs"],
            "resources": "TestingJavaScript, Vite Docs"
          },
          {
            "category": "mastery",
            "title": "Deployments & Performance",
            "weeks": 4,
            "skills": ["Next.js SSR optimization", "Web Vitals parameters", "CI/CD actions"],
            "resources": "Vercel Guides, web.dev metrics"
          }
        ]
      }
      Return ONLY raw JSON. Do not include markdown code block characters (\`\`\`) or conversational text.`;

      const res = await iqClient.integrations.Core.InvokeLLM({ prompt });
      const cleanText = (res.text || res || "{}")
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsed = JSON.parse(cleanText);
      setRoadmap(parsed);
      toast.success("AI roadmap generated for: " + queryRole);
    } catch (err) {
      console.error("Roadmap generation error:", err);
      toast.error("Failed to generate career roadmap.");
    } finally {
      setLoading(false);
    }
  };

  // Reset role input and roadmap
  const handleReset = () => {
    setRole('');
    setRoadmap(null);
    setCheckedSkills(new Set());
  };

  // Toggle skills checkbox
  const toggleSkill = (skill) => {
    const next = new Set(checkedSkills);
    if (next.has(skill)) {
      next.delete(skill);
    } else {
      next.add(skill);
    }
    setCheckedSkills(next);
  };

  // Calculate progress
  const allSkills = roadmap?.timeline ? roadmap.timeline.flatMap(t => t.skills || []) : [];
  const totalSkills = allSkills.length;
  const completedSkills = checkedSkills.size;
  const progressPercent = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4 pb-10">
      
      {/* Title Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          Career Roadmap
        </h2>
      </div>

      {/* Main Discover Path configuration card */}
      <div className="glass border border-white/5 p-6 rounded-2xl bg-[#0e0f1d]/50 space-y-6 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_25px_rgba(139,92,246,0.05)]">
        <div className="flex items-center gap-3">
          <Map className="text-violet-500 w-5 h-5 animate-pulse-glow" />
          <h3 className="text-lg font-bold text-white">Discover Your Learning Path</h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed -mt-3">
          Enter your target role to generate a step-by-step learning roadmap with progress tracking.
        </p>

        <form onSubmit={(e) => { e.preventDefault(); handleGenerate(); }} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer, Data Scientist..."
              className="bg-[#0e0f1e] border border-white/8 rounded-lg pl-3 pr-3 py-2 text-xs text-white"
              disabled={loading}
            />
          </div>
          {/* Refresh button before generate */}
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            title="Reset role and roadmap"
            className="flex items-center justify-center p-2.5 rounded-lg border border-white/10 bg-[#121324] hover:bg-[#1a1b33] text-slate-400 hover:text-white transition-all disabled:opacity-40"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={loading || !role.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg p-2.5 flex items-center justify-center transition-all active:scale-[0.97] shrink-0 w-11 h-11 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {[
            'Frontend Developer',
            'Backend Developer',
            'Full Stack Developer',
            'AI Engineer',
            'Data Scientist',
            'DevOps Engineer',
            'Mobile Developer',
            'UI/UX Designer',
            'Product Manager',
            'Cybersecurity Analyst',
            'Cloud Architect',
            'Blockchain Developer'
          ].map((sRole) => (
            <button
              key={sRole}
              type="button"
              onClick={() => {
                setRole(sRole);
                handleGenerate(sRole);
              }}
              className="px-3.5 py-1.5 rounded-full border border-white/5 bg-[#141526]/80 hover:bg-white/5 text-[11px] font-medium text-slate-400 hover:text-white transition-all active:scale-95"
            >
              {sRole}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
          <p className="text-sm text-slate-400">Mapping career progression parameters...</p>
        </div>
      )}

      {!roadmap && !loading && (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-[#0e0f1d]/40 flex flex-col items-center justify-center gap-4">
          <BookOpen className="w-14 h-14 text-slate-700" />
          <p className="text-slate-500 text-sm font-medium">Enter a role above to generate your personalized career roadmap</p>
        </div>
      )}

      {roadmap && (
        <div className="space-y-8 animate-slide-up">
          {/* Progress Tracker Banner */}
          <div className="glass p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-violet-600/10 via-transparent to-transparent flex flex-col sm:flex-row justify-between items-center gap-6 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_25px_rgba(139,92,246,0.05)]">
            <div className="space-y-1 text-center sm:text-left w-full sm:w-auto">
              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">Skill Progression</span>
              <h3 className="text-lg font-bold text-white">{roadmap.role} Guide</h3>
              <p className="text-xs text-slate-400">{completedSkills} of {totalSkills} core milestones achieved.</p>
            </div>

            {/* Progress bar */}
            <div className="w-full sm:w-64 space-y-2 text-right">
              <span className="text-xs font-bold text-white">{progressPercent}% Completed</span>
              <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden border border-white/10">
                <div 
                  className="h-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all duration-500" 
                  style={{ width: `${progressPercent}%` }} 
                />
              </div>
            </div>
          </div>

          {/* Timeline Milestones list */}
          <div className="space-y-6 relative border-l-2 border-white/5 pl-6 ml-4">
            {roadmap.timeline.map((milestone, idx) => {
              // category badge styling
              const categoryStyles = 
                milestone.category === 'foundation' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                milestone.category === 'core' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                milestone.category === 'advanced' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-pink-500/10 text-pink-400 border-pink-500/20';

              return (
                <div key={idx} className="relative space-y-3">
                  {/* Timeline bullet dot */}
                  <span className="absolute -left-[31px] top-1.5 w-4.5 h-4.5 rounded-full bg-[#0b0c16] border-2 border-violet-500 flex items-center justify-center z-10 shadow-inner">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                  </span>

                  {/* Header Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${categoryStyles}`}>
                      {milestone.category}
                    </span>
                    <h4 className="text-base font-bold text-white">{milestone.title}</h4>
                    <span className="text-xs text-slate-500 flex items-center gap-1.5 ml-auto">
                      <Clock size={12} />
                      {milestone.weeks} weeks
                    </span>
                  </div>

                  {/* Body Content Card */}
                  <div className="glass p-5 rounded-xl border border-white/5 space-y-4 bg-[#0d0e1c]/40 transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.05)]">
                    {/* Skills Checklist */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Milestone Skills Checklist</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {milestone.skills.map((skill) => {
                          const isChecked = checkedSkills.has(skill);
                          return (
                            <button
                              key={skill}
                              type="button"
                              onClick={() => toggleSkill(skill)}
                              className={`p-3 rounded-lg border text-left text-xs font-medium transition-all duration-250 flex items-center justify-between group active:scale-[0.98] ${
                                isChecked 
                                  ? 'bg-violet-950/20 border-violet-500/30 text-white shadow-[0_0_15px_rgba(139,92,246,0.06)]' 
                                  : 'bg-white/1 border-white/5 text-slate-400 hover:text-white hover:border-white/15'
                              }`}
                            >
                              <span>{skill}</span>
                              {isChecked ? (
                                <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-600 group-hover:text-slate-400 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="flex items-center gap-2 border-t border-white/5 pt-3 text-xs text-slate-400">
                      <BookOpen size={14} className="text-slate-500" />
                      <span>Recommended Resources: <strong className="text-slate-300">{milestone.resources}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export { CareerRoadmap };

