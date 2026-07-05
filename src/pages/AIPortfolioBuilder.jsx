import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../lib/AuthContext';
import { base44 } from '../api/base44Client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import {
  Sparkles, Download, Globe, ExternalLink, Trash2, Plus, Loader2,
  Copy, Check, FolderGit2, FileText, Share2, Upload, ArrowLeft,
  FileCheck, History, Clock, Eye, X, ChevronRight, Mail, Link2,
  Edit3, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── SUGGESTION DATA ─────────────────────────────────────────────────────── */
const INTEREST_SUGGESTIONS = [
  'Artificial Intelligence', 'Machine Learning', 'Web Development', 'App Development',
  'Cloud Computing', 'Data Science', 'UI/UX Design', 'Cybersecurity', 'Blockchain',
  'Open Source', 'DevOps & CI/CD', 'Robotics', 'Computer Vision', 'NLP',
  'Game Development', 'IoT', 'AR/VR', 'Quantum Computing', 'Deep Learning',
  'Frontend Development', 'Backend Development', 'Full Stack Development',
  'Software Architecture', 'API Design', 'Database Systems'
];

const SOFT_SKILL_SUGGESTIONS = [
  'Problem Solving', 'Critical Thinking', 'Creativity', 'Leadership',
  'Teamwork & Collaboration', 'Communication', 'Time Management', 'Adaptability',
  'Emotional Intelligence', 'Attention to Detail', 'Fast Learner', 'Work Ethic',
  'Decision Making', 'Conflict Resolution', 'Public Speaking', 'Active Listening',
  'Mentoring', 'Project Management', 'Analytical Thinking', 'Self-Motivation'
];

const INTEREST_ICONS = {
  'AI': 'cpu', 'Machine Learning': 'cpu', 'Web Development': 'globe',
  'App Development': 'smartphone', 'Data Science': 'sparkles', 'default': 'code'
};

/* ─── EMPTY FORM ──────────────────────────────────────────────────────────── */
const EMPTY_FORM = {
  personalInfo: {
    fullName: '', professionalTitle: '', email: '', phone: '',
    location: '', tagline: '', bio: '', currentStatus: '',
    college: '', collaboration: '', joinedDate: '', profilePic: '', resumeUrl: ''
  },
  socialLinks: {
    github: '', linkedin: '', youtube: '', twitter: '',
    leetcode: '', codechef: '', codeforces: '', hackerrank: '', kaggle: '', medium: ''
  },
  education: [],
  skills: { 'Programming Languages': [], 'Frontend Technologies': [], 'Tools & Technologies': [] },
  projects: [],
  certificates: [],
  languages: [],
  interests: [],
  softSkills: []
};

/* ─── VALIDATION ──────────────────────────────────────────────────────────── */
const REQUIRED_FIELDS = [
  { path: ['personalInfo', 'fullName'],          label: 'Full Name' },
  { path: ['personalInfo', 'professionalTitle'], label: 'Professional Title' },
  { path: ['personalInfo', 'email'],             label: 'Email' },
  { path: ['personalInfo', 'bio'],               label: 'About Me Bio' },
];
const validateForm = (data) => {
  for (const f of REQUIRED_FIELDS) {
    const val = f.path.reduce((acc, k) => acc?.[k], data);
    if (!val?.trim()) return `"${f.label}" is required before generating.`;
  }
  return null;
};

/* ─── HISTORY STORAGE ─────────────────────────────────────────────────────── */
const HISTORY_KEY = 'portfolio_history_v2';
const loadHistory = () => { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); } catch { return []; } };
const saveHistory = list => localStorage.setItem(HISTORY_KEY, JSON.stringify(list));

/* ─── SECTION TABS ────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: 'personal',     label: 'Personal'        },
  { id: 'socials',      label: 'Social Links'     },
  { id: 'skills',       label: 'Skills'           },
  { id: 'education',    label: 'Education'        },
  { id: 'projects',     label: 'Projects'         },
  { id: 'certificates', label: 'Certifications'   },
  { id: 'languages',    label: 'Languages'        },
  { id: 'interests',    label: 'Interests & Soft' },
];

/* ────────────────────────────────────────────────────────────────────────── */
export default function AIPortfolioBuilder() {
  const { profile, refetchProfile } = useAuth();

  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [activeSection, setActiveSection] = useState('personal');
  const [saving, setSaving]           = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generated, setGenerated]     = useState(false);
  const [copiedLink, setCopiedLink]   = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory]         = useState(loadHistory);
  const [historyEyeOpen, setHistoryEyeOpen] = useState(null); // id of entry whose panel is open
  const [validationErrors, setValidationErrors] = useState([]);

  // Skill add helpers
  const [newSkillCat, setNewSkillCat] = useState('Programming Languages');
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillPct, setNewSkillPct]   = useState('80');

  // Education GPA helpers
  const [newGpaLabel, setNewGpaLabel] = useState('');
  const [newGpaValue, setNewGpaValue] = useState('');

  // Language helpers
  const [newLangCode, setNewLangCode] = useState('');
  const [newLangName, setNewLangName] = useState('');

  // Interest / soft helpers
  const [newInterestName, setNewInterestName] = useState('');
  const [newSoftName, setNewSoftName]         = useState('');

  /* Load saved portfolio from profile ───────────────────────────────────── */
  useEffect(() => {
    if (profile?.portfolio_data) {
      try {
        const parsed = JSON.parse(profile.portfolio_data);
        setFormData({ ...EMPTY_FORM, ...parsed,
          personalInfo: { ...EMPTY_FORM.personalInfo, ...parsed.personalInfo },
          socialLinks:  { ...EMPTY_FORM.socialLinks,  ...parsed.socialLinks  }
        });
      } catch {}
    }
  }, [profile]);

  /* ── Handlers ─────────────────────────────────────────────────────────── */
  const handlePersonalChange = e =>
    setFormData(p => ({ ...p, personalInfo: { ...p.personalInfo, [e.target.name]: e.target.value } }));

  const handleSocialChange = e =>
    setFormData(p => ({ ...p, socialLinks: { ...p.socialLinks, [e.target.name]: e.target.value } }));

  const handleProfilePicUpload = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(p => ({ ...p, personalInfo: { ...p.personalInfo, profilePic: reader.result } }));
      toast.success('Profile picture uploaded!');
    };
    reader.readAsDataURL(file);
  };

  /* ── Education ──────────────────────────────────────────────────────── */
  const addEducation = () =>
    setFormData(p => ({ ...p, education: [...p.education, { degree:'', college:'', branch:'', university:'', startYear:'', endYear:'', gpaPoints:[] }] }));
  const deleteEducation = i =>
    setFormData(p => ({ ...p, education: p.education.filter((_,idx) => idx !== i) }));
  const handleEduChange = (i, field, val) =>
    setFormData(p => { const l=[...p.education]; l[i]={...l[i],[field]:val}; return {...p, education:l}; });
  const addGpaToEdu = i => {
    if (!newGpaLabel.trim() || !newGpaValue.trim()) return;
    setFormData(p => {
      const l=[...p.education];
      l[i]={...l[i], gpaPoints:[...(l[i].gpaPoints||[]), {label:newGpaLabel.trim(), value:newGpaValue.trim()}]};
      return {...p, education:l};
    });
    setNewGpaLabel(''); setNewGpaValue('');
  };
  const removeGpaFromEdu = (eduIdx, gIdx) =>
    setFormData(p => { const l=[...p.education]; l[eduIdx].gpaPoints.splice(gIdx,1); return {...p, education:l}; });

  /* ── Skills ─────────────────────────────────────────────────────────── */
  const addSkill = () => {
    if (!newSkillName.trim()) return;
    setFormData(p => {
      const cat = p.skills[newSkillCat] || [];
      if (cat.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) return p;
      return { ...p, skills: { ...p.skills, [newSkillCat]: [...cat, { name:newSkillName.trim(), percentage:newSkillPct }] } };
    });
    setNewSkillName('');
  };
  const deleteSkill = (cat, name) =>
    setFormData(p => ({ ...p, skills: { ...p.skills, [cat]: p.skills[cat].filter(s=>s.name!==name) } }));

  /* ── Projects ───────────────────────────────────────────────────────── */
  const addProject = () =>
    setFormData(p => ({ ...p, projects:[...p.projects,{title:'',description:'',technologies:[],github:'',liveUrl:'',role:'',duration:''}] }));
  const deleteProject = i =>
    setFormData(p => ({ ...p, projects: p.projects.filter((_,idx)=>idx!==i) }));
  const handleProjChange = (i, field, val) =>
    setFormData(p => { const l=[...p.projects]; l[i]={...l[i],[field]:val}; return {...p,projects:l}; });
  const handleProjTagsChange = (i, str) =>
    setFormData(p => { const l=[...p.projects]; l[i]={...l[i],technologies:str.split(',').map(s=>s.trim()).filter(Boolean)}; return {...p,projects:l}; });

  /* ── Certificates ───────────────────────────────────────────────────── */
  const addCertificate = () =>
    setFormData(p => ({ ...p, certificates:[...p.certificates,{title:'',issuedBy:'',credentialUrl:'',certificateImage:''}] }));
  const deleteCertificate = i =>
    setFormData(p => ({ ...p, certificates:p.certificates.filter((_,idx)=>idx!==i) }));
  const handleCertChange = (i, field, val) =>
    setFormData(p => { const l=[...p.certificates]; l[i]={...l[i],[field]:val}; return {...p,certificates:l}; });

  /* ── Languages ──────────────────────────────────────────────────────── */
  const addLanguage = () => {
    if (!newLangName.trim()) return;
    setFormData(p => ({ ...p, languages:[...p.languages,{code:newLangCode.toUpperCase()||'IN', name:newLangName.trim()}] }));
    setNewLangCode(''); setNewLangName('');
  };
  const deleteLanguage = i =>
    setFormData(p => ({ ...p, languages:p.languages.filter((_,idx)=>idx!==i) }));

  /* ── Interests ──────────────────────────────────────────────────────── */
  const addInterest = (name) => {
    const n = (name || newInterestName).trim();
    if (!n) return;
    setFormData(p => {
      if (p.interests.some(i=>i.name.toLowerCase()===n.toLowerCase())) return p;
      return { ...p, interests: [...p.interests, { name: n, icon: INTEREST_ICONS[n] || 'code' }] };
    });
    setNewInterestName('');
  };
  const deleteInterest = i =>
    setFormData(p => ({ ...p, interests:p.interests.filter((_,idx)=>idx!==i) }));

  /* ── Soft Skills ─────────────────────────────────────────────────────── */
  const addSoftSkill = (name) => {
    const n = (name || newSoftName).trim();
    if (!n) return;
    setFormData(p => {
      if (p.softSkills.some(s=>s.name.toLowerCase()===n.toLowerCase())) return p;
      return { ...p, softSkills: [...p.softSkills, { name: n, icon: 'puzzle' }] };
    });
    setNewSoftName('');
  };
  const deleteSoftSkill = i =>
    setFormData(p => ({ ...p, softSkills:p.softSkills.filter((_,idx)=>idx!==i) }));

  /* ── Save & Generate ─────────────────────────────────────────────────── */
  const handleSave = async () => {
    if (!profile) return;
    try {
      await base44.entities.UserProfile.update(profile.id, { portfolio_data: JSON.stringify(formData) });
      await refetchProfile();
    } catch { toast.error('Save failed.'); }
  };

  const handleAIGenerate = async () => {
    if (aiGenerating) return;
    setAiGenerating(true);
    try {
      const skills = Object.values(formData.skills).flat().map(s=>s.name).join(', ');
      const prompt = `Write a professional, compelling "About Me" bio for a developer portfolio.
Name: ${formData.personalInfo.fullName || 'the candidate'}
Title: ${formData.personalInfo.professionalTitle || 'Software Engineer'}
Skills: ${skills || 'software development'}
Keep it 3–4 sentences. Direct, punchy, recruiter-friendly. No fluff. Return only the bio text.`;
      const response = await base44.integrations.Core.InvokeLLM({ prompt });
      const text = (response.text || response || '').trim();
      setFormData(p => ({ ...p, personalInfo: { ...p.personalInfo, bio: text } }));
      toast.success('AI bio generated!');
    } catch { toast.error('AI generation failed.'); }
    finally { setAiGenerating(false); }
  };

  const handleGeneratePortfolio = async () => {
    // Validate
    const err = validateForm(formData);
    if (err) {
      toast.error(err, { icon: '⚠️' });
      // Highlight missing required fields
      const missing = REQUIRED_FIELDS.filter(f => !f.path.reduce((acc,k)=>acc?.[k], formData)?.trim());
      setValidationErrors(missing.map(f=>f.path[1]));
      setTimeout(() => setValidationErrors([]), 3500);
      return;
    }
    setSaving(true);
    try {
      await handleSave();
      // Save to history
      const shareLink = `${window.location.origin}/portfolio-preview?email=${encodeURIComponent(formData.personalInfo.email)}`;
      const entry = {
        id: Date.now(),
        name: formData.personalInfo.fullName,
        title: formData.personalInfo.professionalTitle,
        email: formData.personalInfo.email,
        generatedAt: new Date().toISOString(),
        shareLink,
        snapshot: formData
      };
      const updated = [entry, ...history].slice(0, 20);
      setHistory(updated);
      saveHistory(updated);

      // Send email to registered user
      await sendPortfolioEmail(formData, shareLink);

      setGenerated(true);
      toast.success('Portfolio generated & email sent! 🎉');
    } catch (e) {
      console.error(e);
      toast.error('Generation failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /* ── Email sender ─────────────────────────────────────────────────────── */
  const sendPortfolioEmail = async (data, shareLink) => {
    const recipientEmail = profile?.email || data.personalInfo.email;
    if (!recipientEmail) return;
    const p = data.personalInfo;
    const skillCount = Object.values(data.skills).flat().length;
    const html = `
    <div style="background:#0b0c16;color:#f1f3f9;padding:32px;font-family:sans-serif;max-width:600px;border-radius:16px;border:1px solid rgba(255,255,255,0.08);margin:0 auto;">
      <div style="text-align:center;margin-bottom:24px;">
        <h2 style="color:#8b5cf6;font-size:26px;font-weight:900;margin:0;">🌐 Portfolio Ready!</h2>
        <p style="color:#64748b;font-size:13px;margin:8px 0 0;">Generated by AI Portfolio Builder · InterviewIQ AI</p>
      </div>
      <p style="font-size:15px;color:#cbd5e1;line-height:1.6;">
        Hi <strong style="color:white;">${p.fullName}</strong>, your professional developer portfolio has been successfully generated!
      </p>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);padding:20px;border-radius:12px;margin:20px 0;">
        <p style="margin:0 0 8px;font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:.1em;">Portfolio Summary</p>
        <table style="width:100%;font-size:13px;border-collapse:collapse;">
          <tr><td style="padding:6px 0;color:#94a3b8;">Name</td><td style="color:white;font-weight:bold;">${p.fullName}</td></tr>
          <tr><td style="padding:6px 0;color:#94a3b8;">Title</td><td style="color:white;">${p.professionalTitle || '-'}</td></tr>
          <tr><td style="padding:6px 0;color:#94a3b8;">Skills Listed</td><td style="color:#00ffcc;font-weight:bold;">${skillCount}</td></tr>
          <tr><td style="padding:6px 0;color:#94a3b8;">Projects</td><td style="color:#00ffcc;font-weight:bold;">${(data.projects||[]).length}</td></tr>
          <tr><td style="padding:6px 0;color:#94a3b8;">Certifications</td><td style="color:#00ffcc;font-weight:bold;">${(data.certificates||[]).length}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:28px 0;">
        <a href="${shareLink}" style="background:linear-gradient(135deg,#8b5cf6,#3b82f6);color:#fff;padding:14px 30px;text-decoration:none;font-weight:bold;border-radius:8px;display:inline-block;font-size:14px;">
          🌐 View Live Portfolio
        </a>
      </div>
      <div style="background:rgba(0,255,204,0.05);border:1px solid rgba(0,255,204,0.15);border-radius:10px;padding:16px;margin:20px 0;">
        <p style="margin:0 0 6px;font-size:11px;color:#00ffcc;font-weight:bold;text-transform:uppercase;">Shareable Link</p>
        <p style="margin:0;font-size:12px;color:#94a3b8;word-break:break-all;">${shareLink}</p>
      </div>
      <p style="font-size:11px;color:#475569;text-align:center;border-top:1px solid rgba(255,255,255,0.05);padding-top:16px;margin-top:24px;">
        To download PDF: open the portfolio link and press Ctrl+P. · Sent automatically by InterviewIQ AI.
      </p>
    </div>`;

    await base44.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `🌐 Your Portfolio is Live! — ${p.fullName} | InterviewIQ AI`,
      html
    });
  };

  /* ── History actions ─────────────────────────────────────────────────── */
  const loadHistoryEntry = (entry) => {
    setFormData({ ...EMPTY_FORM, ...entry.snapshot,
      personalInfo: { ...EMPTY_FORM.personalInfo, ...entry.snapshot.personalInfo },
      socialLinks:  { ...EMPTY_FORM.socialLinks,  ...entry.snapshot.socialLinks  }
    });
    setShowHistory(false);
    setGenerated(false);
    setHistoryEyeOpen(null);
    toast.success(`Loaded: ${entry.name}`);
  };

  const deleteHistoryEntry = (id) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
    if (historyEyeOpen === id) setHistoryEyeOpen(null);
    toast.success('Removed from history.');
  };

  /* ── Download helpers ─────────────────────────────────────────────────── */
  const shareLink = formData.personalInfo.email
    ? `${window.location.origin}/portfolio-preview?email=${encodeURIComponent(formData.personalInfo.email)}`
    : `${window.location.origin}/portfolio-preview`;

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link || shareLink);
    setCopiedLink(true);
    toast.success('Link copied!');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadHTML = (data) => {
    const d = data || formData;
    const blob = new Blob([buildPortfolioHTML(d)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${(d.personalInfo.fullName||'portfolio').replace(/\s+/g,'_')}_portfolio.html`;
    a.click(); URL.revokeObjectURL(url);
    toast.success('Portfolio HTML downloaded!');
  };

  const handleDownloadZIP = async (data) => {
    setSaving(true);
    try {
      const d = data || formData;
      const getJSZip = () => new Promise((res, rej) => {
        if (window.JSZip) return res(window.JSZip);
        const s = document.createElement('script');
        s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        s.onload = () => res(window.JSZip); s.onerror = rej;
        document.head.appendChild(s);
      });
      const JSZip = await getJSZip();
      const zip = new JSZip();
      zip.file('index.html', buildPortfolioHTML(d));
      zip.file('README.md', `# ${d.personalInfo.fullName} Portfolio\n\nGenerated by AI Portfolio Builder.`);
      const blob = await zip.generateAsync({ type:'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${(d.personalInfo.fullName||'portfolio').replace(/\s+/g,'_')}_portfolio.zip`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('ZIP downloaded!');
    } catch { toast.error('Failed.'); }
    finally { setSaving(false); }
  };

  /* ── Computed completeness score for progress bar ────────────────────── */
  const completenessScore = (() => {
    let filled = 0, total = REQUIRED_FIELDS.length;
    REQUIRED_FIELDS.forEach(f => { if (f.path.reduce((a,k)=>a?.[k], formData)?.trim()) filled++; });
    return Math.round((filled / total) * 100);
  })();

  /* ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6 pt-4 pb-16 max-w-3xl mx-auto relative">

      {/* ── PAGE HEADER ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
        <div className="space-y-1">
          <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
            AI Portfolio Builder <Globe className="text-violet-400 w-6 h-6 animate-pulse" />
          </h2>
          <p className="text-sm text-slate-400">Fill in your details and generate a premium animated portfolio website.</p>
        </div>

        <button
          onClick={() => { setShowHistory(true); setHistoryEyeOpen(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-violet-500/25 bg-violet-500/8 text-xs font-bold text-violet-300 hover:bg-violet-500/15 hover:border-violet-500/40 transition-all"
        >
          <History size={14} /> History ({history.length})
        </button>
      </div>

      {/* ── HISTORY MODAL ─────────────────────────────────────────────────── */}
      {!generated && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold">
            <span className="text-slate-500 uppercase tracking-wider">Form Completeness</span>
            <span className={completenessScore >= 100 ? 'text-emerald-400' : 'text-violet-400'}>{completenessScore}% required fields</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${completenessScore >= 100 ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-600 to-blue-500'}`}
              animate={{ width: `${completenessScore}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>
      )}

      {/* ── HISTORY MODAL ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-start justify-center pt-16 sm:pt-24 p-4 overflow-y-auto"
          >
            <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={() => setShowHistory(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 24 }}
              transition={{ type: 'spring', damping: 22, stiffness: 280 }}
              className="relative z-10 w-full max-w-2xl bg-[#0a0b18] border border-white/8 rounded-3xl shadow-[0_0_60px_rgba(99,102,241,0.15)] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="relative px-6 py-5 border-b border-white/5 bg-gradient-to-r from-violet-500/5 to-blue-500/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-white text-base flex items-center gap-2">
                      <History size={16} className="text-violet-400" /> Portfolio History
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">{history.length} portfolios generated</p>
                  </div>
                  <button onClick={() => setShowHistory(false)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all">
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 max-h-[65vh] overflow-y-auto space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-white/4 flex items-center justify-center mx-auto">
                      <Clock size={28} className="text-slate-600" />
                    </div>
                    <p className="text-slate-500 text-sm font-semibold">No portfolios yet</p>
                    <p className="text-[10px] text-slate-600">Generate your first portfolio to see it here.</p>
                  </div>
                ) : history.map(entry => (
                  <div key={entry.id}>
                    {/* History Card */}
                    <div className={`relative rounded-2xl border transition-all duration-300 overflow-hidden hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(139,92,246,0.05)] ${historyEyeOpen === entry.id ? 'border-violet-500/50 bg-violet-500/5' : 'border-white/6 bg-white/2 hover:border-violet-500/20 hover:bg-white/4'}`}>
                      <div className="flex items-center gap-4 p-4">
                        {/* Avatar */}
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shrink-0">
                          {entry.name.charAt(0).toUpperCase()}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-white text-sm truncate">{entry.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{entry.title || 'Developer'}</p>
                          <p className="text-[9px] text-slate-600 mt-1 flex items-center gap-1">
                            <Clock size={8} />
                            {new Date(entry.generatedAt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setHistoryEyeOpen(historyEyeOpen === entry.id ? null : entry.id)}
                            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                              historyEyeOpen === entry.id
                                ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-500/30'
                                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:border-violet-500/30'
                            }`}
                            title="View options"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => deleteHistoryEntry(entry.id)}
                            className="w-9 h-9 rounded-xl border border-white/6 bg-white/3 flex items-center justify-center text-slate-500 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* ── Eye Dropdown Panel ─────────────────────────────── */}
                      <AnimatePresence>
                        {historyEyeOpen === entry.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-4 pt-1 border-t border-white/5 bg-black/20">
                              <div className="grid grid-cols-4 gap-2">
                                {/* Download PDF */}
                                <button
                                  onClick={() => { window.open(entry.shareLink, '_blank'); setTimeout(()=>window.print(), 800); }}
                                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-emerald-500/8 hover:border-emerald-500/20 transition-all text-center group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                    <FileText size={14} className="text-emerald-400" />
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-400 transition-colors leading-tight">Download PDF</span>
                                </button>

                                {/* Copy URL */}
                                <button
                                  onClick={() => { navigator.clipboard.writeText(entry.shareLink); toast.success('URL copied!'); }}
                                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-blue-500/8 hover:border-blue-500/20 transition-all text-center group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                    <Link2 size={14} className="text-blue-400" />
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-blue-400 transition-colors leading-tight">Copy URL</span>
                                </button>

                                {/* Live View */}
                                <button
                                  onClick={() => window.open(entry.shareLink, '_blank')}
                                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-violet-500/8 hover:border-violet-500/20 transition-all text-center group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                                    <ExternalLink size={14} className="text-violet-400" />
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-violet-400 transition-colors leading-tight">Live View</span>
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => loadHistoryEntry(entry)}
                                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/8 bg-white/3 hover:bg-amber-500/8 hover:border-amber-500/20 transition-all text-center group"
                                >
                                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                                    <Edit3 size={14} className="text-amber-400" />
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-400 group-hover:text-amber-400 transition-colors leading-tight">Edit</span>
                                </button>
                              </div>

                              {/* URL display */}
                              <div className="mt-2 flex items-center gap-2 bg-black/30 border border-white/5 rounded-lg px-3 py-1.5">
                                <Globe size={10} className="text-slate-600 shrink-0" />
                                <span className="text-[9px] text-slate-500 truncate flex-1">{entry.shareLink}</span>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {!generated ? (

          /* ── FORM ────────────────────────────────────────────────────────── */
          <motion.div key="form" initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} className="space-y-5">

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-1.5 bg-slate-950/50 p-1.5 border border-white/5 rounded-xl">
              {SECTIONS.map(s => (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wide transition-all ${
                    activeSection === s.id
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >{s.label}</button>
              ))}
            </div>

            {/* Form Panel */}
            <div className="bg-[#0e0f1d]/90 border border-white/5 rounded-2xl p-6 shadow-2xl">

              {/* ── PERSONAL ─────────────────────────────────────────────── */}
              {activeSection === 'personal' && (
                <div className="space-y-4">
                  <SectionTitle>Personal Details</SectionTitle>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldWrap error={validationErrors.includes('fullName')}><Label>Full Name *</Label>
                      <Input name="fullName" value={formData.personalInfo.fullName} onChange={handlePersonalChange} placeholder="Your full name" />
                    </FieldWrap>
                    <FieldWrap error={validationErrors.includes('professionalTitle')}><Label>Professional Title *</Label>
                      <Input name="professionalTitle" value={formData.personalInfo.professionalTitle} onChange={handlePersonalChange} placeholder="e.g. AI Engineer" />
                    </FieldWrap>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldWrap error={validationErrors.includes('email')}><Label>Email *</Label>
                      <Input name="email" value={formData.personalInfo.email} onChange={handlePersonalChange} placeholder="you@email.com" />
                    </FieldWrap>
                    <div><Label>Phone</Label><Input name="phone" value={formData.personalInfo.phone} onChange={handlePersonalChange} placeholder="e.g. 9876543210" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Location</Label><Input name="location" value={formData.personalInfo.location} onChange={handlePersonalChange} placeholder="City, State, Country" /></div>
                    <div><Label>Current Status</Label><Input name="currentStatus" value={formData.personalInfo.currentStatus} onChange={handlePersonalChange} placeholder="e.g. B.Tech 2nd Year" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>College / University</Label><Input name="college" value={formData.personalInfo.college} onChange={handlePersonalChange} placeholder="Your institution" /></div>
                    <div><Label>Collaboration / Program</Label><Input name="collaboration" value={formData.personalInfo.collaboration} onChange={handlePersonalChange} placeholder="e.g. NIAT" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Joined Date</Label><Input name="joinedDate" value={formData.personalInfo.joinedDate} onChange={handlePersonalChange} placeholder="e.g. September 10, 2025" /></div>
                    <div><Label>Resume Link (PDF URL)</Label><Input name="resumeUrl" value={formData.personalInfo.resumeUrl} onChange={handlePersonalChange} placeholder="Link to your resume" /></div>
                  </div>
                  {/* Profile Pic */}
                  <div className="bg-[#0a0b18] border border-white/8 rounded-xl p-4 space-y-3">
                    <Label className="text-violet-400 font-bold">Profile Photo</Label>
                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div className="relative border border-dashed border-violet-500/30 rounded-xl p-4 cursor-pointer hover:border-violet-500/60 bg-violet-500/3 flex flex-col items-center justify-center gap-2 transition-colors">
                        <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <Upload size={18} className="text-violet-400" />
                        <span className="text-[10px] text-slate-400 font-semibold text-center">Click to upload photo</span>
                        {formData.personalInfo.profilePic && <span className="text-[9px] text-emerald-400 font-bold">✓ Photo ready</span>}
                      </div>
                      <div><Label>Or image URL</Label><Input name="profilePic" value={formData.personalInfo.profilePic?.startsWith('data:') ? '(local file)' : formData.personalInfo.profilePic} onChange={handlePersonalChange} placeholder="https://..." /></div>
                    </div>
                  </div>
                  <div><Label>One-line Tagline</Label><Input name="tagline" value={formData.personalInfo.tagline} onChange={handlePersonalChange} placeholder="e.g. CSE Student | AI Developer | Innovator" /></div>
                  <FieldWrap error={validationErrors.includes('bio')}>
                    <div className="flex justify-between items-center mb-1.5">
                      <Label>About Me Bio *</Label>
                      <button type="button" onClick={handleAIGenerate} disabled={aiGenerating} className="flex items-center gap-1 text-[10px] text-violet-400 font-bold hover:text-violet-300 disabled:opacity-50">
                        {aiGenerating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />} ✨ AI Generate
                      </button>
                    </div>
                    <textarea name="bio" rows={4} value={formData.personalInfo.bio} onChange={handlePersonalChange}
                      placeholder="Write a compelling summary about yourself..."
                      className="w-full bg-[#0a0b18] border border-white/8 rounded-lg px-3 py-2.5 text-xs text-white resize-none placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 transition-colors min-h-[80px]"
                    />
                  </FieldWrap>
                </div>
              )}

              {/* ── SOCIALS ───────────────────────────────────────────────── */}
              {activeSection === 'socials' && (
                <div className="space-y-4">
                  <SectionTitle>Social & Professional Links</SectionTitle>
                  <p className="text-[10px] text-slate-500">These links will be clickable in your portfolio. Include full https:// URLs.</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>GitHub Profile URL</Label><Input name="github" value={formData.socialLinks.github} onChange={handleSocialChange} placeholder="https://github.com/username" /></div>
                    <div><Label>LinkedIn Profile URL</Label><Input name="linkedin" value={formData.socialLinks.linkedin} onChange={handleSocialChange} placeholder="https://linkedin.com/in/username" /></div>
                    <div><Label>YouTube Channel</Label><Input name="youtube" value={formData.socialLinks.youtube} onChange={handleSocialChange} placeholder="https://youtube.com/@channel" /></div>
                    <div><Label>Twitter / X Profile</Label><Input name="twitter" value={formData.socialLinks.twitter} onChange={handleSocialChange} placeholder="https://x.com/username" /></div>
                    <div><Label>LeetCode</Label><Input name="leetcode" value={formData.socialLinks.leetcode} onChange={handleSocialChange} placeholder="https://leetcode.com/username" /></div>
                    <div><Label>Kaggle</Label><Input name="kaggle" value={formData.socialLinks.kaggle} onChange={handleSocialChange} placeholder="https://kaggle.com/username" /></div>
                  </div>
                </div>
              )}

              {/* ── SKILLS ───────────────────────────────────────────────── */}
              {activeSection === 'skills' && (
                <div className="space-y-4">
                  <SectionTitle>Technical Skills & Proficiency</SectionTitle>
                  <div className="grid grid-cols-3 gap-3 items-end">
                    <div><Label>Category</Label>
                      <Select value={newSkillCat} onChange={e=>setNewSkillCat(e.target.value)}>
                        <option>Programming Languages</option>
                        <option>Frontend Technologies</option>
                        <option>Tools & Technologies</option>
                      </Select>
                    </div>
                    <div><Label>Skill Name</Label><Input value={newSkillName} onChange={e=>setNewSkillName(e.target.value)} placeholder="e.g. Python" onKeyDown={e=>e.key==='Enter'&&addSkill()} /></div>
                    <div><Label>Proficiency %</Label><Input type="number" min="1" max="100" value={newSkillPct} onChange={e=>setNewSkillPct(e.target.value)} /></div>
                  </div>
                  <Button onClick={addSkill} className="w-full text-xs h-9"><Plus size={13} className="mr-1.5"/>Add Skill</Button>
                  <div className="space-y-3">
                    {Object.entries(formData.skills).map(([cat, list]) => list.length > 0 && (
                      <div key={cat} className="bg-black/30 border border-white/5 p-3 rounded-xl">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{cat}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {list.map(s => (
                            <span key={s.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-[10px] text-white font-semibold">
                              {s.name} <span className="text-[#00ffcc] font-black">{s.percentage}%</span>
                              <button onClick={()=>deleteSkill(cat,s.name)} className="text-slate-500 hover:text-red-400 ml-0.5">×</button>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                    {Object.values(formData.skills).every(l=>l.length===0) && <EmptyState text="No skills added yet. Add your first skill above." />}
                  </div>
                </div>
              )}

              {/* ── EDUCATION ─────────────────────────────────────────────── */}
              {activeSection === 'education' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <SectionTitle>Academic Journey</SectionTitle>
                    <button onClick={addEducation} className="text-[10px] font-bold text-violet-400 hover:text-white flex items-center gap-1"><Plus size={12}/>Add</button>
                  </div>
                  {formData.education.length === 0 && <EmptyState text="No education added. Click Add to begin." />}
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {formData.education.map((edu, i) => (
                      <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-3 relative">
                        <button onClick={()=>deleteEducation(i)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400"><Trash2 size={12}/></button>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Degree / Program</Label><Input value={edu.degree} onChange={e=>handleEduChange(i,'degree',e.target.value)} placeholder="e.g. B.Tech CSE" /></div>
                          <div><Label>Institution Name</Label><Input value={edu.college} onChange={e=>handleEduChange(i,'college',e.target.value)} placeholder="College name" /></div>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div><Label>Start Year</Label><Input value={edu.startYear} onChange={e=>handleEduChange(i,'startYear',e.target.value)} placeholder="2025" /></div>
                          <div><Label>End Year</Label><Input value={edu.endYear} onChange={e=>handleEduChange(i,'endYear',e.target.value)} placeholder="Present" /></div>
                          <div><Label>Branch</Label><Input value={edu.branch} onChange={e=>handleEduChange(i,'branch',e.target.value)} placeholder="AI/ML" /></div>
                        </div>
                        <div><Label>Collaboration / University</Label><Input value={edu.university} onChange={e=>handleEduChange(i,'university',e.target.value)} placeholder="e.g. In collaboration with NIAT" /></div>
                        <div className="border-t border-white/5 pt-3 space-y-2">
                          <Label>GPA / Score Points</Label>
                          <div className="flex gap-2">
                            <Input value={newGpaLabel} onChange={e=>setNewGpaLabel(e.target.value)} placeholder="e.g. Term-I TGPA" />
                            <Input value={newGpaValue} onChange={e=>setNewGpaValue(e.target.value)} placeholder="3.8" className="w-20" />
                            <Button onClick={()=>addGpaToEdu(i)} className="h-9 shrink-0">Add</Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(edu.gpaPoints||[]).map((gp,gi)=>(
                              <span key={gi} className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#00ffcc]/10 text-[#00ffcc] text-[9px] font-bold">
                                {gp.label}: {gp.value} <button onClick={()=>removeGpaFromEdu(i,gi)}>×</button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── PROJECTS ──────────────────────────────────────────────── */}
              {activeSection === 'projects' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <SectionTitle>Projects Showcase</SectionTitle>
                    <button onClick={addProject} className="text-[10px] font-bold text-violet-400 hover:text-white flex items-center gap-1"><Plus size={12}/>Add Project</button>
                  </div>
                  {formData.projects.length === 0 && <EmptyState text="No projects added yet." />}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {formData.projects.map((proj, i) => (
                      <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-3 relative">
                        <button onClick={()=>deleteProject(i)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400"><Trash2 size={12}/></button>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Project Title</Label><Input value={proj.title} onChange={e=>handleProjChange(i,'title',e.target.value)} placeholder="e.g. StudentOS AI" /></div>
                          <div><Label>Duration</Label><Input value={proj.duration} onChange={e=>handleProjChange(i,'duration',e.target.value)} placeholder="e.g. 3 Months" /></div>
                        </div>
                        <div><Label>Short Description</Label><Input value={proj.description} onChange={e=>handleProjChange(i,'description',e.target.value)} placeholder="What does this project do?" /></div>
                        <div><Label>Technologies (comma separated)</Label><Input value={proj.technologies?.join(', ')} onChange={e=>handleProjTagsChange(i,e.target.value)} placeholder="React JS, Python, TailwindCSS" /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Live Demo URL</Label><Input value={proj.liveUrl} onChange={e=>handleProjChange(i,'liveUrl',e.target.value)} placeholder="https://..." /></div>
                          <div><Label>GitHub URL</Label><Input value={proj.github} onChange={e=>handleProjChange(i,'github',e.target.value)} placeholder="https://github.com/..." /></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── CERTIFICATES ──────────────────────────────────────────── */}
              {activeSection === 'certificates' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <SectionTitle>Certifications</SectionTitle>
                    <button onClick={addCertificate} className="text-[10px] font-bold text-violet-400 hover:text-white flex items-center gap-1"><Plus size={12}/>Add</button>
                  </div>
                  {formData.certificates.length === 0 && <EmptyState text="No certifications added yet." />}
                  <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                    {formData.certificates.map((cert, i) => (
                      <div key={i} className="p-4 bg-white/2 border border-white/5 rounded-xl space-y-3 relative">
                        <button onClick={()=>deleteCertificate(i)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400"><Trash2 size={12}/></button>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Certificate Title</Label><Input value={cert.title} onChange={e=>handleCertChange(i,'title',e.target.value)} placeholder="Certificate name" /></div>
                          <div><Label>Issued By</Label><Input value={cert.issuedBy} onChange={e=>handleCertChange(i,'issuedBy',e.target.value)} placeholder="Organization" /></div>
                        </div>
                        <div><Label>Certificate Image URL</Label><Input value={cert.certificateImage} onChange={e=>handleCertChange(i,'certificateImage',e.target.value)} placeholder="https://..." /></div>
                        <div><Label>Credential URL (optional)</Label><Input value={cert.credentialUrl} onChange={e=>handleCertChange(i,'credentialUrl',e.target.value)} placeholder="Verification link" /></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── LANGUAGES ─────────────────────────────────────────────── */}
              {activeSection === 'languages' && (
                <div className="space-y-4">
                  <SectionTitle>Languages You Speak</SectionTitle>
                  <div className="flex gap-2 items-end">
                    <div className="w-20"><Label>Code</Label><Input value={newLangCode} onChange={e=>setNewLangCode(e.target.value)} placeholder="IN" /></div>
                    <div className="flex-1"><Label>Language Name</Label><Input value={newLangName} onChange={e=>setNewLangName(e.target.value)} placeholder="e.g. Telugu" onKeyDown={e=>e.key==='Enter'&&addLanguage()} /></div>
                    <Button onClick={addLanguage} className="h-10 shrink-0">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.languages.map((l, i) => (
                      <span key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/8 bg-white/3 text-xs font-semibold text-white">
                        <span className="px-1.5 py-0.5 rounded bg-white/8 text-[#00ffcc] text-[9px] font-black">{l.code}</span>
                        {l.name}
                        <button onClick={()=>deleteLanguage(i)} className="text-slate-500 hover:text-red-400 ml-1">×</button>
                      </span>
                    ))}
                    {formData.languages.length === 0 && <EmptyState text="No languages added yet." />}
                  </div>
                </div>
              )}

              {/* ── INTERESTS & SOFT SKILLS ───────────────────────────────── */}
              {activeSection === 'interests' && (
                <div className="space-y-6">

                  {/* ─ Interests ─ */}
                  <div className="space-y-3">
                    <SectionTitle>Interests</SectionTitle>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1"><Label>Custom Interest Name</Label>
                        <Input value={newInterestName} onChange={e=>setNewInterestName(e.target.value)} placeholder="Type or click a suggestion below" onKeyDown={e=>e.key==='Enter'&&addInterest()} />
                      </div>
                      <Button onClick={()=>addInterest()} className="h-10 shrink-0">Add</Button>
                    </div>

                    {/* Suggestions */}
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Suggestions — click to add instantly</p>
                      <div className="flex flex-wrap gap-1.5">
                        {INTEREST_SUGGESTIONS.map(s => {
                          const added = formData.interests.some(i=>i.name.toLowerCase()===s.toLowerCase());
                          return (
                            <button key={s} onClick={()=>!added && addInterest(s)}
                              className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold border transition-all ${
                                added
                                  ? 'bg-[#00ffcc]/15 border-[#00ffcc]/30 text-[#00ffcc] cursor-default'
                                  : 'bg-white/3 border-white/8 text-slate-400 hover:bg-violet-500/10 hover:border-violet-500/25 hover:text-violet-300 cursor-pointer'
                              }`}
                            >
                              {added ? '✓ ' : '+ '}{s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Added interests */}
                    {formData.interests.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                        <span className="w-full text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Added ({formData.interests.length})</span>
                        {formData.interests.map((int, i) => (
                          <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#00ffcc]/8 border border-[#00ffcc]/15 text-[10px] text-white font-semibold">
                            {int.name} <button onClick={()=>deleteInterest(i)} className="text-slate-500 hover:text-red-400">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ─ Soft Skills ─ */}
                  <div className="space-y-3 border-t border-white/5 pt-5">
                    <SectionTitle>Soft Skills</SectionTitle>
                    <div className="flex gap-2 items-end">
                      <div className="flex-1"><Label>Custom Soft Skill</Label>
                        <Input value={newSoftName} onChange={e=>setNewSoftName(e.target.value)} placeholder="Type or click a suggestion below" onKeyDown={e=>e.key==='Enter'&&addSoftSkill()} />
                      </div>
                      <Button onClick={()=>addSoftSkill()} className="h-10 shrink-0">Add</Button>
                    </div>

                    {/* Suggestions */}
                    <div>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2">Suggestions — click to add instantly</p>
                      <div className="flex flex-wrap gap-1.5">
                        {SOFT_SKILL_SUGGESTIONS.map(s => {
                          const added = formData.softSkills.some(sk=>sk.name.toLowerCase()===s.toLowerCase());
                          return (
                            <button key={s} onClick={()=>!added && addSoftSkill(s)}
                              className={`px-2.5 py-1 rounded-lg text-[9.5px] font-bold border transition-all ${
                                added
                                  ? 'bg-violet-500/15 border-violet-500/30 text-violet-400 cursor-default'
                                  : 'bg-white/3 border-white/8 text-slate-400 hover:bg-blue-500/10 hover:border-blue-500/25 hover:text-blue-300 cursor-pointer'
                              }`}
                            >
                              {added ? '✓ ' : '+ '}{s}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Added soft skills */}
                    {formData.softSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
                        <span className="w-full text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Added ({formData.softSkills.length})</span>
                        {formData.softSkills.map((sk, i) => (
                          <span key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/8 border border-violet-500/15 text-[10px] text-white font-semibold">
                            {sk.name} <button onClick={()=>deleteSoftSkill(i)} className="text-slate-500 hover:text-red-400">×</button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>{/* /form panel */}

            {/* Validation hint */}
            {validationErrors.length > 0 && (
              <motion.div initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} className="flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-red-400 font-semibold">
                <AlertCircle size={14} />
                Please fill in all required fields marked with * before generating.
              </motion.div>
            )}

            {/* ── GENERATE BUTTON ─────────────────────────────────────────── */}
            <motion.button
              onClick={handleGeneratePortfolio}
              disabled={saving}
              whileHover={{ scale: saving ? 1 : 1.01, boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}
              whileTap={{ scale: saving ? 1 : 0.99 }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 text-white font-black text-sm tracking-wide uppercase flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(99,102,241,0.25)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate My Portfolio <ChevronRight size={16} /></>}
            </motion.button>

            {/* Email note */}
            <p className="text-center text-[9.5px] text-slate-600 flex items-center justify-center gap-1.5">
              <Mail size={10} /> Portfolio link will be automatically emailed to your registered email after generation.
            </p>

          </motion.div>

        ) : (

          /* ── SUCCESS OUTPUT ───────────────────────────────────────────────── */
          <motion.div key="output" initial={{opacity:0,scale:0.96}} animate={{opacity:1,scale:1}} exit={{opacity:0}} className="space-y-5">
            <div className="bg-[#0e0f1d]/90 border border-white/8 rounded-2xl p-8 shadow-2xl text-center space-y-8">
              <div className="flex flex-col items-center gap-3">
                <motion.div initial={{scale:0,rotate:-10}} animate={{scale:1,rotate:0}} transition={{type:'spring',damping:12,stiffness:200}}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <FileCheck size={30} className="text-white" />
                </motion.div>
                <h3 className="text-2xl font-black text-white">Portfolio Generated! 🎉</h3>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <Mail size={11} className="text-emerald-400" />
                  <span className="text-[10px] font-bold text-emerald-400">Portfolio link emailed to {profile?.email || formData.personalInfo.email}</span>
                </div>
              </div>

              {/* Share URL */}
              <div className="bg-black/40 border border-white/5 rounded-2xl p-5 max-w-md mx-auto space-y-3">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-white flex items-center gap-1.5"><Share2 size={12} className="text-violet-400"/>Shareable Link</p>
                  <button onClick={()=>handleCopyLink(shareLink)} className="flex items-center gap-1 text-[10px] font-bold text-violet-400 hover:text-white">
                    {copiedLink ? <><Check size={10}/>Copied!</> : <><Copy size={10}/>Copy</>}
                  </button>
                </div>
                <p className="text-[9.5px] text-slate-500 bg-black/40 p-2.5 rounded-lg border border-white/5 text-left truncate">{shareLink}</p>
              </div>

              {/* QR */}
              <div className="flex flex-col items-center gap-2">
                <div className="bg-white p-2 rounded-xl border border-white/10">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=6&data=${encodeURIComponent(shareLink)}`} alt="QR" className="w-24 h-24"/>
                </div>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Scan to Open Portfolio</p>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
                <Button onClick={()=>window.print()} variant="outline" className="h-10 text-[11px] border-white/10 hover:bg-white/5"><FileText size={12} className="mr-1"/>PDF</Button>
                <Button onClick={()=>handleDownloadHTML()} className="h-10 text-[11px]"><Download size={12} className="mr-1"/>HTML</Button>
                <Button onClick={()=>handleDownloadZIP()} variant="outline" className="h-10 text-[11px] border-white/10 hover:bg-white/5"><FolderGit2 size={12} className="mr-1"/>ZIP</Button>
              </div>

              <div className="flex justify-center gap-3 pt-2 border-t border-white/5">
                <Button variant="ghost" onClick={()=>setGenerated(false)} className="text-xs gap-1.5"><ArrowLeft size={13}/>Edit Details</Button>
                <Button onClick={()=>window.open(`/portfolio-preview?email=${encodeURIComponent(formData.personalInfo.email||'')}`, '_blank')}
                  className="text-xs gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600">
                  <ExternalLink size={13}/>View Live Portfolio
                </Button>
              </div>
            </div>
          </motion.div>

        )}
      </AnimatePresence>

    </div>
  );
}

/* ── Sub-components ────────────────────────────────────────────────────────── */
function SectionTitle({ children }) {
  return <h3 className="text-xs font-black text-white uppercase tracking-widest pb-2">{children}</h3>;
}
function FieldWrap({ children, error }) {
  return (
    <div className={`space-y-1 ${error ? 'ring-1 ring-red-500/40 rounded-xl p-2 -m-2 bg-red-500/3' : ''}`}>
      {children}
      {error && <p className="text-[9px] text-red-400 font-bold flex items-center gap-1"><AlertCircle size={9}/>This field is required</p>}
    </div>
  );
}
function EmptyState({ text }) {
  return <p className="text-center text-[10px] text-slate-600 py-6">{text}</p>;
}

/* ── HTML Portfolio builder (same as before) ──────────────────────────────── */
function buildPortfolioHTML(data) {
  const p = data.personalInfo;
  const s = data.socialLinks;
  const name = p.fullName || 'My Portfolio';
  const initials = name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase();

  const val = v => v?.trim() || '-';

  const skillsHTML = Object.entries(data.skills||{}).map(([cat,list]) => list.length ? `
    <div class="skill-col">
      <h4>${cat}</h4>
      ${list.map(sk=>`
        <div class="skill-row">
          <div class="skill-info"><span>${sk.name}</span><span>${sk.percentage}%</span></div>
          <div class="progress"><div class="bar" style="width:0" data-w="${sk.percentage}"></div></div>
        </div>`).join('')}
    </div>` : '').join('');

  const eduHTML = (data.education||[]).map(e=>`
    <div class="card edu-card reveal">
      <div class="edu-header">
        <div><h4>${val(e.degree)}</h4><p class="sub">${val(e.college)}</p><p class="sub2">${e.university||''}</p></div>
        <span class="badge">${val(e.startYear)}–${val(e.endYear)}</span>
      </div>
      ${(e.gpaPoints||[]).length?`<div class="gpa-grid">${e.gpaPoints.map(g=>`<div class="gpa-item"><span>${g.label}</span><strong>${g.value}</strong></div>`).join('')}</div>`:''}
    </div>`).join('');

  const projectsHTML = (data.projects||[]).map(pr=>`
    <div class="card proj-card reveal">
      <div class="proj-preview"><span class="terminal-icon">&gt;_</span></div>
      <div class="proj-body">
        <h4>${val(pr.title)}</h4><p>${val(pr.description)}</p>
        <div class="tags">${(pr.technologies||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div class="proj-links">
          ${pr.liveUrl?`<a href="${pr.liveUrl}" target="_blank">Live Demo ↗</a>`:''}
          ${pr.github?`<a href="${pr.github}" target="_blank" class="ghost">GitHub ↗</a>`:''}
        </div>
      </div>
    </div>`).join('');

  const certsHTML = (data.certificates||[]).map(c=>`
    <div class="cert-card reveal">
      <div class="cert-img">${c.certificateImage?`<img src="${c.certificateImage}" alt="${c.title}"/>`:'<div class="cert-placeholder">🏆</div>'}</div>
      <div class="cert-info"><p class="cert-title">${val(c.title)}</p><p class="cert-by">${val(c.issuedBy)}</p></div>
    </div>`).join('');

  const langsHTML = (data.languages||[]).map(l=>`<div class="lang-chip"><span class="code">${l.code}</span>${l.name}</div>`).join('');
  const interestsHTML = (data.interests||[]).map(i=>`<div class="icon-chip"><div class="chip-icon">★</div><span>${i.name}</span></div>`).join('');
  const softHTML = (data.softSkills||[]).map(sk=>`<div class="icon-chip"><div class="chip-icon">✦</div><span>${sk.name}</span></div>`).join('');

  const socialIcons = [
    {key:'github', label:'GitHub', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.54-1.38-1.33-1.75-1.33-1.75-1.09-.74.08-.73.08-.73 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.81 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.04.13 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.21.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/></svg>'},
    {key:'linkedin', label:'LinkedIn', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.44-2.13 2.93v5.68H9.37V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.27V1.73C24 .77 23.2 0 22.22 0z"/></svg>'},
    {key:'twitter', label:'X', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.63 7.58H.48l8.6-9.83L0 1.15h7.6l5.24 6.93 6.06-6.93z"/></svg>'},
    {key:'youtube', label:'YouTube', svg:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 0 0-2.12-2.14C19.54 3.6 12 3.6 12 3.6s-7.54 0-9.38.46A3.02 3.02 0 0 0 .5 6.19C.04 8.04 0 12 0 12s.04 3.96.5 5.81a3.02 3.02 0 0 0 2.12 2.14C4.46 20.4 12 20.4 12 20.4s7.54 0 9.38-.45a3.02 3.02 0 0 0 2.12-2.14C23.96 15.96 24 12 24 12s-.04-3.96-.5-5.81zM9.6 15.6V8.4l6.27 3.6-6.27 3.6z"/></svg>'},
  ].filter(ic=>s[ic.key]).map(ic=>`<a href="${s[ic.key]}" target="_blank" class="soc-btn" title="${ic.label}">${ic.svg}</a>`).join('');

  return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name} | Portfolio</title>
<style>
:root{--bg:#030408;--surface:#0b0c18;--border:rgba(255,255,255,0.06);--text:#cbd5e1;--muted:#64748b;--white:#ffffff;--cyan:#00ffcc;--purple:#a855f7;--blue:#3b82f6;--grad:linear-gradient(135deg,#00ffcc,#3b82f6,#a855f7)}
[data-theme="light"]{--bg:#f1f5f9;--surface:#ffffff;--border:rgba(0,0,0,0.08);--text:#475569;--muted:#94a3b8;--white:#1e293b}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;overflow-x:hidden}
canvas#bg{position:fixed;inset:0;z-index:0;pointer-events:none;opacity:.7}
.wrap{max-width:960px;margin:0 auto;padding:0 20px;position:relative;z-index:1}
nav{position:fixed;top:0;left:0;right:0;z-index:100;background:rgba(3,4,8,.7);backdrop-filter:blur(16px);border-bottom:1px solid var(--border);transition:.3s}
[data-theme="light"] nav{background:rgba(241,245,249,.85)}
.nav-in{max-width:960px;margin:0 auto;padding:0 20px;height:60px;display:flex;align-items:center;justify-content:space-between}
.logo{font-weight:900;font-size:18px;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.nav-links{display:flex;gap:4px}.nav-links a{padding:6px 12px;border-radius:8px;font-size:11px;font-weight:700;color:var(--muted);text-decoration:none;transition:.2s}
.nav-links a:hover{color:var(--white);background:rgba(255,255,255,.06)}
.nav-right{display:flex;align-items:center;gap:8px}
.theme-btn{background:rgba(255,255,255,.06);border:1px solid var(--border);color:var(--text);padding:6px 12px;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;transition:.2s}
.theme-btn:hover{background:rgba(255,255,255,.1);color:var(--white)}
section{padding:80px 0;border-bottom:1px solid var(--border)}
.sec-head{text-align:center;margin-bottom:48px}
.sec-title{font-size:clamp(24px,4vw,36px);font-weight:900;background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px}
.sec-sub{font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.12em}
.divider{width:60px;height:2px;background:var(--grad);margin:12px auto 0;border-radius:4px}
#home{min-height:100vh;display:flex;align-items:center;padding-top:80px;border:none}
.hero-in{display:flex;align-items:center;justify-content:space-between;gap:40px;flex-wrap:wrap-reverse;padding:40px 0}
.hero-text{max-width:520px}
.greet{font-size:10px;font-weight:800;color:var(--cyan);text-transform:uppercase;letter-spacing:.2em;margin-bottom:12px;display:block}
h1{font-size:clamp(32px,6vw,56px);font-weight:900;color:var(--white);line-height:1.1;margin-bottom:12px}
h1 span{background:var(--grad);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.typing{font-size:clamp(16px,3vw,22px);font-weight:800;color:var(--cyan);margin-bottom:14px}
.cursor{display:inline-block;width:2px;height:1.2em;background:var(--cyan);animation:blink 1s infinite;vertical-align:middle;margin-left:2px}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.tagline{font-size:12px;color:var(--text);margin-bottom:28px;opacity:.8}
.hero-btns{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:22px}
.btn-prim{display:inline-flex;align-items:center;gap:8px;padding:13px 22px;border-radius:50px;background:var(--grad);color:#000;font-size:11px;font-weight:800;text-decoration:none;transition:.2s;border:none;cursor:pointer}
.btn-prim:hover{opacity:.9;transform:translateY(-2px);box-shadow:0 0 20px rgba(0,255,204,.3)}
.btn-ghost{display:inline-flex;align-items:center;gap:8px;padding:12px 22px;border-radius:50px;background:transparent;color:var(--white);font-size:11px;font-weight:700;text-decoration:none;border:1px solid var(--border);transition:.2s}
.btn-ghost:hover{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.15)}
.avatar-wrap{position:relative;flex-shrink:0}
.avatar-ring{width:clamp(180px,25vw,260px);height:clamp(180px,25vw,260px);border-radius:50%;padding:3px;background:var(--grad);box-shadow:0 0 40px rgba(0,255,204,.2);animation:float 5s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
.avatar-inner{width:100%;height:100%;border-radius:50%;background:#000;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:52px;font-weight:900;color:var(--white)}
.avatar-inner img{width:100%;height:100%;object-fit:cover}
.status-badge{position:absolute;bottom:-10px;left:50%;transform:translateX(-50%);white-space:nowrap;padding:5px 14px;border-radius:50px;border:1px solid rgba(0,255,204,.3);background:var(--bg);color:var(--cyan);font-size:9px;font-weight:800;letter-spacing:.08em;box-shadow:0 0 10px rgba(0,255,204,.15)}
.soc-row{display:flex;gap:8px;flex-wrap:wrap}.soc-btn{width:40px;height:40px;border-radius:10px;background:var(--surface);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;color:var(--muted);transition:.2s;text-decoration:none}
.soc-btn:hover{color:var(--white);border-color:rgba(0,255,204,.3);box-shadow:0 0 12px rgba(0,255,204,.15)}.soc-btn svg{width:16px;height:16px}
.bio-card{background:var(--surface);border:1px solid var(--border);border-radius:20px;padding:32px;margin-bottom:24px;font-size:13px;line-height:1.8}
.detail-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:14px}
.detail-card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px;display:flex;align-items:flex-start;gap:12px}
.detail-icon{width:36px;height:36px;border-radius:10px;background:rgba(0,255,204,.08);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:16px}
.detail-label{font-size:9px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:.1em}.detail-val{font-size:11px;color:var(--white);font-weight:600;margin-top:3px}
.skills-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
.skill-col{background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:22px}
.skill-col h4{font-size:10px;font-weight:800;color:var(--white);text-transform:uppercase;letter-spacing:.1em;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.skill-col h4::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--cyan)}
.skill-row{margin-bottom:14px}.skill-info{display:flex;justify-content:space-between;font-size:10px;font-weight:700;color:var(--text);margin-bottom:5px}
.progress{height:5px;background:rgba(255,255,255,.05);border-radius:10px;overflow:hidden}.bar{height:100%;border-radius:10px;background:var(--grad);transition:width 1.5s cubic-bezier(.4,0,.2,1)}
.card{background:var(--surface);border:1px solid var(--border);border-radius:18px;overflow:hidden;transition:.25s}.card:hover{border-color:rgba(0,255,204,.2);box-shadow:0 0 30px rgba(0,255,204,.07)}
.timeline{border-left:1px solid var(--border);padding-left:24px;margin-left:12px}
.edu-card{padding:22px;position:relative;margin-bottom:20px}.edu-card::before{content:'';position:absolute;left:-31px;top:24px;width:12px;height:12px;border-radius:50%;background:#000;border:2px solid var(--cyan);box-shadow:0 0 10px var(--cyan)}
.edu-header{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
.edu-header h4{font-size:13px;font-weight:800;color:var(--white)}.sub{font-size:11px;color:var(--text);font-weight:600;margin-top:3px}.sub2{font-size:10px;color:var(--muted);margin-top:2px}
.badge{padding:4px 10px;border-radius:50px;background:rgba(0,255,204,.08);border:1px solid rgba(0,255,204,.2);color:var(--cyan);font-size:9px;font-weight:800;white-space:nowrap}
.gpa-grid{display:flex;gap:10px;margin-top:14px;flex-wrap:wrap}.gpa-item{flex:1;min-width:100px;background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:10px;padding:10px;display:flex;justify-content:space-between;align-items:center;font-size:10px}
.gpa-item span{color:var(--muted)}.gpa-item strong{color:var(--white);font-size:13px}
.proj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:22px}
.proj-card{display:flex;flex-direction:column}.proj-preview{aspect-ratio:16/9;background:linear-gradient(135deg,#0f1528,#1a1a2e);display:flex;align-items:center;justify-content:center;border-bottom:1px solid var(--border)}
.terminal-icon{font-size:28px;color:rgba(0,255,204,.35);font-family:monospace}
.proj-body{padding:20px;flex:1;display:flex;flex-direction:column;gap:10px}.proj-body h4{font-size:13px;font-weight:800;color:var(--white)}.proj-body p{font-size:11px;color:var(--text);line-height:1.6;flex:1}
.tags{display:flex;flex-wrap:wrap;gap:6px}.tag{padding:3px 8px;border-radius:50px;background:rgba(0,255,204,.05);border:1px solid rgba(0,255,204,.12);color:var(--cyan);font-size:9px;font-weight:700}
.proj-links{display:flex;gap:12px;margin-top:4px}.proj-links a{font-size:10px;font-weight:700;color:var(--cyan);text-decoration:none;transition:.2s}.proj-links a:hover{opacity:.8}.proj-links a.ghost{color:var(--muted)}
.cert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}
.cert-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;overflow:hidden;transition:.25s}.cert-card:hover{border-color:rgba(168,85,247,.2);transform:translateY(-3px)}
.cert-img{aspect-ratio:4/3;overflow:hidden;background:#0f172a;display:flex;align-items:center;justify-content:center}.cert-img img{width:100%;height:100%;object-fit:cover}.cert-placeholder{font-size:40px}
.cert-info{padding:14px;border-top:1px solid var(--border);background:rgba(0,0,0,.4)}.cert-title{font-size:10px;font-weight:800;color:var(--white)}.cert-by{font-size:9px;color:var(--muted);text-transform:uppercase;margin-top:3px}
.chip-row{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.lang-chip{display:inline-flex;align-items:center;gap:8px;padding:10px 16px;background:var(--surface);border:1px solid var(--border);border-radius:12px;font-size:12px;font-weight:700;color:var(--white)}
.lang-chip .code{padding:2px 6px;border-radius:5px;background:rgba(0,255,204,.08);border:1px solid rgba(0,255,204,.15);color:var(--cyan);font-size:9px;font-weight:800}
.icon-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:14px;max-width:700px;margin:0 auto}
.icon-chip{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:18px;display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center;font-size:11px;font-weight:700;color:var(--white);transition:.2s}
.icon-chip:hover{border-color:rgba(0,255,204,.2);transform:translateY(-2px)}.chip-icon{width:36px;height:36px;border-radius:50%;background:rgba(0,255,204,.1);color:var(--cyan);display:flex;align-items:center;justify-content:center;font-size:16px}
.contact-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:600px;margin:0 auto 28px}
.contact-card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:22px;text-align:center}
.contact-card .c-icon{font-size:20px;margin-bottom:8px}.contact-card .c-label{font-size:9px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.1em}
.contact-card a,.contact-card p{font-size:11px;color:var(--white);font-weight:600;margin-top:5px;display:block;text-decoration:none}.contact-card a:hover{color:var(--cyan)}
footer{padding:32px 0;text-align:center;font-size:10px;color:var(--muted);border-top:1px solid var(--border)}
.reveal{opacity:0;transform:translateY(28px);transition:opacity .65s ease,transform .65s ease}.reveal.visible{opacity:1;transform:none}
@media(max-width:640px){.hero-in{flex-direction:column-reverse;text-align:center}.hero-btns,.soc-row{justify-content:center}.contact-grid{grid-template-columns:1fr}.nav-links{display:none}}
@media print{canvas#bg,nav,.theme-btn{display:none}body{background:#fff;color:#000}section{padding:30px 0}}
</style>
</head>
<body>
<canvas id="bg"></canvas>
<nav id="navbar">
  <div class="nav-in">
    <div class="logo">${initials}.</div>
    <div class="nav-links">
      <a href="#home">Home</a><a href="#about">About</a>
      ${Object.values(data.skills||{}).some(l=>l.length)?'<a href="#skills">Skills</a>':''}
      ${(data.education||[]).length?'<a href="#education">Education</a>':''}
      ${(data.projects||[]).length?'<a href="#projects">Projects</a>':''}
      ${(data.certificates||[]).length?'<a href="#certs">Certs</a>':''}
      <a href="#contact">Contact</a>
    </div>
    <div class="nav-right">
      <button class="theme-btn" onclick="toggleTheme()" id="themeBtn">☀️ Light</button>
    </div>
  </div>
</nav>

<section id="home">
<div class="wrap">
  <div class="hero-in">
    <div class="hero-text">
      <span class="greet">✦ Welcome to my portfolio</span>
      <h1>Hi, I'm <span>${val(p.fullName)}</span></h1>
      <div class="typing"><span id="typed"></span><span class="cursor"></span></div>
      <p class="tagline">${val(p.tagline)}</p>
      <div class="hero-btns">
        <a href="#projects" class="btn-prim">View Projects ↓</a>
        <a href="#contact" class="btn-ghost">Contact Me</a>
        ${p.resumeUrl?`<a href="${p.resumeUrl}" target="_blank" class="btn-ghost">Download Resume ↓</a>`:''}
      </div>
      <div class="soc-row">${socialIcons}</div>
    </div>
    <div class="avatar-wrap">
      <div class="avatar-ring"><div class="avatar-inner">
        ${p.profilePic?`<img src="${p.profilePic}" alt="${p.fullName}"/>`:`<span>${initials}</span>`}
      </div></div>
      ${p.currentStatus?`<div class="status-badge">${p.currentStatus}</div>`:''}
    </div>
  </div>
</div>
</section>

<section id="about"><div class="wrap">
  <div class="sec-head"><h2 class="sec-title">About Me</h2><p class="sec-sub">Passionate about building intelligent solutions</p><div class="divider"></div></div>
  <div class="bio-card reveal">${val(p.bio)}</div>
  <div class="detail-grid">
    <div class="detail-card reveal"><div class="detail-icon">📍</div><div><div class="detail-label">Location</div><div class="detail-val">${val(p.location)}</div></div></div>
    <div class="detail-card reveal"><div class="detail-icon">🎓</div><div><div class="detail-label">College</div><div class="detail-val">${val(p.college)}</div></div></div>
    ${p.collaboration?`<div class="detail-card reveal"><div class="detail-icon">🤝</div><div><div class="detail-label">Collaboration</div><div class="detail-val">${p.collaboration}</div></div></div>`:''}
    ${p.joinedDate?`<div class="detail-card reveal"><div class="detail-icon">📅</div><div><div class="detail-label">Joined</div><div class="detail-val">${p.joinedDate}</div></div></div>`:''}
  </div>
</div></section>

${Object.values(data.skills||{}).some(l=>l.length)?`
<section id="skills"><div class="wrap">
  <div class="sec-head"><h2 class="sec-title">Skills</h2><p class="sec-sub">Technologies & tools I work with</p><div class="divider"></div></div>
  <div class="skills-grid">${skillsHTML}</div>
</div></section>`:''}

${(data.education||[]).length?`
<section id="education"><div class="wrap">
  <div class="sec-head"><h2 class="sec-title">Education</h2><p class="sec-sub">My academic journey</p><div class="divider"></div></div>
  <div class="timeline">${eduHTML}</div>
</div></section>`:''}

${(data.projects||[]).length?`
<section id="projects"><div class="wrap">
  <div class="sec-head"><h2 class="sec-title">Projects</h2><p class="sec-sub">Showcasing my work</p><div class="divider"></div></div>
  <div class="proj-grid">${projectsHTML}</div>
</div></section>`:''}

${(data.certificates||[]).length?`
<section id="certs"><div class="wrap">
  <div class="sec-head"><h2 class="sec-title">Certifications</h2><p class="sec-sub">Validated achievements</p><div class="divider"></div></div>
  <div class="cert-grid">${certsHTML}</div>
</div></section>`:''}

${(data.languages||[]).length?`
<section><div class="wrap">
  <div class="sec-head"><h2 class="sec-title">Languages</h2><p class="sec-sub">Languages I speak</p><div class="divider"></div></div>
  <div class="chip-row">${langsHTML}</div>
</div></section>`:''}

${(data.interests||[]).length?`
<section><div class="wrap">
  <div class="sec-head"><h2 class="sec-title">Interests</h2><p class="sec-sub">What drives my passion</p><div class="divider"></div></div>
  <div class="icon-grid">${interestsHTML}</div>
</div></section>`:''}

${(data.softSkills||[]).length?`
<section><div class="wrap">
  <div class="sec-head"><h2 class="sec-title">Soft Skills</h2><p class="sec-sub">Beyond technical expertise</p><div class="divider"></div></div>
  <div class="icon-grid">${softHTML}</div>
</div></section>`:''}

<section id="contact"><div class="wrap">
  <div class="sec-head"><h2 class="sec-title">Get In Touch</h2><p class="sec-sub">Let's build something amazing</p><div class="divider"></div></div>
  <div class="contact-grid">
    ${p.email?`<div class="contact-card reveal"><div class="c-icon">✉️</div><div class="c-label">Email</div><a href="mailto:${p.email}">${p.email}</a></div>`:''}
    ${p.phone?`<div class="contact-card reveal"><div class="c-icon">📞</div><div class="c-label">Phone</div><a href="tel:${p.phone}">${p.phone}</a></div>`:''}
    ${p.location?`<div class="contact-card reveal"><div class="c-icon">📍</div><div class="c-label">Location</div><p>${p.location}</p></div>`:''}
  </div>
  <div class="chip-row">${socialIcons}</div>
</div></section>

<footer><div class="wrap"><p>© ${new Date().getFullYear()} ${name}. All rights reserved. · Built with ❤️ using InterviewIQ AI</p></div></footer>

<script>
const cv=document.getElementById('bg'),ctx=cv.getContext('2d');
let W,H,pts=[];
const resize=()=>{W=cv.width=innerWidth;H=cv.height=innerHeight;};
window.addEventListener('resize',resize);resize();
for(let i=0;i<70;i++)pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.5+.5});
function drawBg(){
  ctx.clearRect(0,0,W,H);
  const dark=document.documentElement.dataset.theme!=='light';
  ctx.fillStyle=dark?'rgba(0,255,204,.5)':'rgba(99,102,241,.4)';
  ctx.strokeStyle=dark?'rgba(0,255,204,.05)':'rgba(99,102,241,.06)';
  pts.forEach((p,i)=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
    for(let j=i+1;j<pts.length;j++){const d=Math.hypot(p.x-pts[j].x,p.y-pts[j].y);if(d<110){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(pts[j].x,pts[j].y);ctx.stroke();}}
  });
  requestAnimationFrame(drawBg);
}
drawBg();

const words=['${val(p.professionalTitle)}','Problem Solver','Innovator','Creator'];
let wi=0,ci=0,del=false;
const el=document.getElementById('typed');
function type(){
  const w=words[wi];
  el.textContent=del?w.slice(0,ci--):w.slice(0,ci++);
  if(!del&&ci>w.length){del=true;setTimeout(type,2000);return;}
  if(del&&ci<0){del=false;wi=(wi+1)%words.length;ci=0;}
  setTimeout(type,del?55:105);
}
type();

const obs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');obs.unobserve(e.target);}}),{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

const barObs=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.style.width=e.target.dataset.w+'%';barObs.unobserve(e.target);}}),{threshold:.3});
document.querySelectorAll('.bar').forEach(b=>barObs.observe(b));

function toggleTheme(){
  const isDark=document.documentElement.dataset.theme==='dark';
  document.documentElement.dataset.theme=isDark?'light':'dark';
  document.getElementById('themeBtn').textContent=isDark?'🌙 Dark':'☀️ Light';
}

window.addEventListener('scroll',()=>{
  const nav=document.getElementById('navbar');
  const dark=document.documentElement.dataset.theme==='dark';
  nav.style.background=scrollY>50?(dark?'rgba(3,4,8,.92)':'rgba(241,245,249,.96)'):'';
});

document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'});}
  });
});
</script>
</body></html>`;
}
