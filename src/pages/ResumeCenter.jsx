import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/AuthContext';
import { iqClient } from '../api/iqClient';
import { extractResumeText } from '../utils/resumeParser';
import { analyzeResumeText } from '../utils/resumeAnalyzer';
import {
  Upload,
  Trash2,
  Sparkles,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
  TrendingUp,
  User,
  BrainCircuit,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

// â”€â”€â”€ Small pill tag â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Tag = ({ text }) => (
  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-medium border border-white/10 bg-[#1a1b2e] text-slate-300 leading-snug">
    {text}
  </span>
);

// â”€â”€â”€ Section box â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const Section = ({ title, icon, children }) => (
  <div className="border border-white/8 rounded-2xl p-5 space-y-3 bg-[#0f1020] transition-all duration-300 hover:scale-[1.01] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)]">
    <h3 className="text-sm font-bold text-white flex items-center gap-2">
      {icon && <span className="text-violet-400">{icon}</span>}
      {title}
    </h3>
    {children}
  </div>
);

// â”€â”€â”€ Numbered question list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const QList = ({ questions }) => (
  <ol className="space-y-2">
    {(questions || []).map((q, i) => (
      <li key={i} className="flex gap-2 text-xs text-slate-300 leading-relaxed">
        <span className="text-slate-500 shrink-0 font-semibold mt-0.5">{i + 1}.</span>
        <span>{q}</span>
      </li>
    ))}
  </ol>
);

// â”€â”€â”€ Main component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function ResumeCenter() {
  const { profile, refetchProfile } = useAuth();

  const [analysis, setAnalysis]   = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]   = useState(false);
  const [fileName, setFileName]   = useState('');
  const [fileDataUrl, setFileDataUrl] = useState(null); // base64 for local preview

  // Helper: get per-user localStorage key
  const getFileKey = () => {
    try {
      const u = JSON.parse(localStorage.getItem('iq_current_user') || 'null');
      return u ? `iq_resume_file_${u.id || u.email}` : 'iq_resume_file_guest';
    } catch { return 'iq_resume_file_guest'; }
  };

  // Helper: convert File to base64 data URL
  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Load saved analysis on mount / profile change
  useEffect(() => {
    if (profile?.resume_analysis) {
      try { setAnalysis(JSON.parse(profile.resume_analysis)); } catch {}
    } else {
      setAnalysis(null);
    }
    if (profile?.resume_url) {
      setFileName(profile.resume_url.split('/').pop() || 'resume.pdf');
      // Restore locally stored file data
      const saved = localStorage.getItem(getFileKey());
      if (saved) setFileDataUrl(saved);
    }
  }, [profile]);

  // â”€â”€ Upload handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File size exceeds 10 MB.'); return; }

    setUploading(true);
    setFileName(file.name);
    try {
      // 1. Convert file to base64 for local storage
      const dataUrl = await fileToDataUrl(file);
      localStorage.setItem(getFileKey(), dataUrl);
      setFileDataUrl(dataUrl);

      // 2. Extract text from the file (client-side, no network)
      const { text, error } = await extractResumeText(file);
      if (error) { toast.error(error); setUploading(false); return; }

      // 3. Analyse the extracted text
      const result = analyzeResumeText(text, '');

      // 4. Save filename + analysis JSON to profile (store local:// marker as URL)
      await iqClient.entities.UserProfile.update(profile.id, {
        resume_url: `local://${file.name}`,
        resume_analysis: JSON.stringify(result),
      });

      setAnalysis(result);
      toast.success('Resume analysed successfully!');
      await refetchProfile();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error('Failed to analyse the resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // â”€â”€ Delete handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDelete = async () => {
    if (!window.confirm('Delete your resume and clear all analysis data?')) return;
    setDeleting(true);
    try {
      await iqClient.entities.UserProfile.update(profile.id, {
        resume_url: '',
        resume_analysis: '',
      });
      // Remove local file data
      localStorage.removeItem(getFileKey());
      setAnalysis(null);
      setFileName('');
      setFileDataUrl(null);
      toast.success('Resume removed.');
      await refetchProfile();
    } catch {
      toast.error('Failed to delete resume.');
    } finally {
      setDeleting(false);
    }
  };

  // â”€â”€ Download handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleDownload = () => {
    if (!fileDataUrl) { toast.error('File not available locally. Please re-upload.'); return; }
    const a = document.createElement('a');
    a.href = fileDataUrl;
    a.download = fileName || 'resume.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleViewInTab = () => {
    if (!fileDataUrl) { toast.error('File not available locally. Please re-upload.'); return; }
    const win = window.open();
    if (win) {
      win.document.write(`<iframe src="${fileDataUrl}" style="width:100%;height:100vh;border:none;"></iframe>`);
    }
  };

  // â”€â”€ Score colour helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const scoreColour = (s) =>
    s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-amber-400' : 'text-rose-400';

  const barColour = (s) =>
    s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-amber-500' : 'bg-rose-500';

  // Detect if stored analysis is in the OLD format (missing new fields)
  const isLegacyAnalysis = analysis &&
    !analysis.job_suitability_desc &&
    !analysis.candidate_summary &&
    !analysis.technical_questions;

  // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="max-w-4xl mx-auto space-y-6 pt-4 pb-10">

      {/* Title */}
      <h2 className="text-3xl font-display font-bold text-white">Resume Center</h2>

      {/* Upload zone */}
      <div className="relative border-2 border-dashed border-violet-500/40 hover:border-violet-400/70 rounded-2xl p-10 text-center transition-colors bg-[#0f1020] cursor-pointer group">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleUpload}
          className="absolute inset-0 opacity-0 cursor-pointer w-full z-10"
          disabled={uploading || deleting}
        />
        <div className="flex flex-col items-center gap-3 pointer-events-none">
          {uploading ? (
            <>
              <Loader2 className="w-9 h-9 text-violet-400 animate-spin" />
              <p className="text-sm text-slate-300 font-semibold">Extracting & analysing resumeâ€¦</p>
              <p className="text-xs text-slate-500">This may take a few seconds</p>
            </>
          ) : (
            <>
              <Upload className="w-8 h-8 text-violet-400 group-hover:scale-110 transition-transform" />
              <p className="text-sm text-slate-300">
                {profile?.resume_url ? 'Upload new resume (PDF/DOCX)' : 'Upload your resume (PDF/DOCX)'}
              </p>
            </>
          )}
        </div>
      </div>

      {/* File row + Delete */}
      {profile?.resume_url && !uploading && (
        <div className="flex items-center justify-between px-4 py-3 border border-white/8 rounded-xl bg-[#0f1020]">
          <div className="flex items-center gap-3">
            <FileText className="text-violet-400 w-5 h-5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">{fileName || 'resume.pdf'}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <button
                  onClick={handleViewInTab}
                  className="text-[10px] text-violet-400 hover:underline"
                >
                  View â†’
                </button>
                <button
                  onClick={handleDownload}
                  className="text-[10px] text-violet-400 hover:underline"
                >
                  Download â†’
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting || uploading}
            className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
          >
            {deleting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      )}

      {/* Empty state or legacy analysis prompt */}
      {(!analysis || isLegacyAnalysis) && !uploading && (
        <div className="text-center py-20 border border-dashed border-white/8 rounded-2xl bg-[#0f1020] space-y-3">
          <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto" />
          {isLegacyAnalysis ? (
            <>
              <p className="text-white text-sm font-bold">Analysis format has been upgraded</p>
              <p className="text-slate-400 text-xs max-w-xs mx-auto">Please re-upload your resume to generate the new detailed analysis with summary, suitability, and question breakdowns.</p>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Upload your resume to see your personalised ATS analysis.</p>
          )}
        </div>
      )}

      {/* â”€â”€ Analysis Results â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {analysis && !isLegacyAnalysis && !uploading && (
        <div className="space-y-4">

          {/* Row 1: ATS score | Job Suitability | Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* ATS Score */}
            <div className="border border-white/8 rounded-2xl p-5 bg-[#0f1020] flex flex-col justify-between gap-3 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)]">
              <span className={`text-5xl font-display font-black ${scoreColour(analysis.ats_score)}`}>
                {analysis.ats_score}%
              </span>
              <div className="space-y-1.5">
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${barColour(analysis.ats_score)} transition-all duration-700`}
                    style={{ width: `${analysis.ats_score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 font-semibold">ATS Score</p>
              </div>
            </div>

            {/* Job Suitability */}
            <div className="border border-white/8 rounded-2xl p-5 bg-[#0f1020] space-y-2 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Job Suitability
              </p>
              <p className="text-xs font-bold text-white leading-snug">
                {analysis.job_suitability_desc}
              </p>
            </div>

            {/* Summary */}
            <div className="border border-white/8 rounded-2xl p-5 bg-[#0f1020] space-y-2 transition-all duration-300 hover:scale-[1.02] hover:border-violet-500/20 hover:shadow-[0_0_20px_rgba(139,92,246,0.04)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Summary
              </p>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-6">
                {analysis.candidate_summary}
              </p>
            </div>
          </div>

          {/* Strengths */}
          <Section title="Strengths" icon={<CheckCircle2 className="w-4 h-4" />}>
            <div className="flex flex-wrap gap-2">
              {(analysis.strengths || []).map((s, i) => <Tag key={i} text={s} />)}
            </div>
          </Section>

          {/* Weaknesses */}
          <Section title="Weaknesses" icon={<XCircle className="w-4 h-4" />}>
            <div className="flex flex-wrap gap-2">
              {(analysis.weaknesses || []).map((w, i) => <Tag key={i} text={w} />)}
            </div>
          </Section>

          {/* Missing Skills */}
          <Section title="Missing Skills" icon={<AlertTriangle className="w-4 h-4" />}>
            <div className="flex flex-wrap gap-2">
              {(analysis.missing_skills || []).map((s, i) => <Tag key={i} text={s} />)}
            </div>
          </Section>

          {/* Suggested Improvements */}
          <Section title="Suggested Improvements" icon={<TrendingUp className="w-4 h-4" />}>
            <div className="flex flex-wrap gap-2">
              {(analysis.improvements || []).map((imp, i) => <Tag key={i} text={imp} />)}
            </div>
          </Section>

          {/* Technical Questions */}
          <Section title="Technical Questions" icon={<Sparkles className="w-4 h-4" />}>
            <QList questions={analysis.technical_questions} />
          </Section>

          {/* HR Questions */}
          <Section title="Hr Questions" icon={<Sparkles className="w-4 h-4" />}>
            <QList questions={analysis.hr_questions} />
          </Section>

          {/* Behavioral Questions */}
          <Section title="Behavioral Questions" icon={<Sparkles className="w-4 h-4" />}>
            <QList questions={analysis.behavioral_questions} />
          </Section>

        </div>
      )}
    </div>
  );
}
export { ResumeCenter };

