import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { base44 } from '../api/base44Client';

import { 
  Github, 
  Linkedin, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  Download, 
  ExternalLink, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Code, 
  Heart, 
  Globe, 
  FileText, 
  Terminal,
  Grid,
  CheckCircle,
  Eye,
  Info,
  Calendar,
  Sparkles,
  Layers,
  Wrench,
  Youtube,
  Cpu,
  BookOpen
} from 'lucide-react';

// Seeding empty structure to adhere strictly to the Real Data Policy
const DEFAULT_PORTFOLIO_DATA = {
  personalInfo: {
    fullName: "",
    professionalTitle: "",
    email: "",
    phone: "",
    location: "",
    tagline: "",
    bio: "",
    currentStatus: "",
    college: "",
    collaboration: "",
    joinedDate: "",
    profilePic: "",
    resumeUrl: ""
  },
  socialLinks: {
    github: "",
    linkedin: "",
    youtube: "",
    portfolio: "",
    twitter: "",
    leetcode: "",
    codechef: "",
    codeforces: "",
    hackerrank: "",
    kaggle: "",
    medium: ""
  },
  education: [],
  skills: {},
  projects: [],
  certificates: [],
  languages: [],
  interests: [],
  softSkills: []
};

// URL absolute assurance helper
const ensureAbsoluteUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
};

// Background animation component for Constellation / Starfield
function ConstellationBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const particles = [];
    const particleCount = 70;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        radius: Math.random() * 1.5 + 0.5
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 255, 204, 0.45)';
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.055)';

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        for (let j = idx + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist < 115) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-80" />;
}

// Icon mapper helper
const renderIcon = (iconName, size = 18, colorClass = "text-[#00ffcc]") => {
  switch (iconName) {
    case 'code':
    case 'puzzle':
      return <Code size={size} className={colorClass} />;
    case 'cpu':
    case 'lightbulb':
      return <Cpu size={size} className={colorClass} />;
    case 'layout':
    case 'users':
      return <Layers size={size} className={colorClass} />;
    case 'smartphone':
    case 'message':
      return <Mail size={size} className={colorClass} />;
    case 'wrench':
    case 'refresh':
      return <Wrench size={size} className={colorClass} />;
    case 'sparkles':
    case 'zap':
      return <Sparkles size={size} className={colorClass} />;
    case 'globe':
    default:
      return <Globe size={size} className={colorClass} />;
  }
};

export default function PortfolioPreview({ data: propsData, theme: propsTheme }) {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(propsData || DEFAULT_PORTFOLIO_DATA);
  const [loading, setLoading] = useState(!propsData);

  // Load from database if email parameters match
  useEffect(() => {
    if (propsData) {
      setData(propsData);
      return;
    }

    const loadProfilePortfolio = async () => {
      const emailParam = searchParams.get('email') || searchParams.get('id');
      let targetEmail = emailParam;
      
      if (!targetEmail) {
        const userStr = localStorage.getItem('iq_current_user');
        if (userStr) {
          try {
            targetEmail = JSON.parse(userStr).email;
          } catch {}
        }
      }

      if (targetEmail) {
        try {
          const profiles = await base44.entities.UserProfile.filter({ email: targetEmail });
          if (profiles && profiles.length > 0) {
            const profile = profiles[0];
            if (profile.portfolio_data) {
              const parsed = JSON.parse(profile.portfolio_data);
              // Merge defaults to handle unset fields
              setData({
                ...DEFAULT_PORTFOLIO_DATA,
                ...parsed,
                personalInfo: { ...DEFAULT_PORTFOLIO_DATA.personalInfo, ...parsed.personalInfo },
                socialLinks: { ...DEFAULT_PORTFOLIO_DATA.socialLinks, ...parsed.socialLinks }
              });
            } else {
              // Prepopulate from user onboard profile
              const populated = {
                ...DEFAULT_PORTFOLIO_DATA,
                personalInfo: {
                  ...DEFAULT_PORTFOLIO_DATA.personalInfo,
                  fullName: profile.full_name || DEFAULT_PORTFOLIO_DATA.personalInfo.fullName,
                  email: profile.email || DEFAULT_PORTFOLIO_DATA.personalInfo.email,
                  phone: profile.phone || DEFAULT_PORTFOLIO_DATA.personalInfo.phone,
                  location: profile.current_location || DEFAULT_PORTFOLIO_DATA.personalInfo.location,
                  bio: profile.bio || DEFAULT_PORTFOLIO_DATA.personalInfo.bio,
                }
              };
              setData(populated);
            }
          }
        } catch (err) {
          console.error("Error loading portfolio preview:", err);
        }
      }
      setLoading(false);
    };

    loadProfilePortfolio();
  }, [searchParams, propsData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030408] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 rounded-full border-4 border-[#00ffcc]/20 border-t-[#00ffcc] animate-spin mb-4" />
        <p className="text-slate-400 font-display text-sm">Rendering Portfolio Template...</p>
      </div>
    );
  }

  // Get user initials for navbar logo
  const getInitials = () => {
    if (!data.personalInfo?.fullName) return "AM.";
    const parts = data.personalInfo.fullName.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}.`.toUpperCase();
    }
    return `${parts[0][0]}.`.toUpperCase();
  };

  return (
    <div className="relative min-h-screen bg-[#030408] text-slate-300 font-sans select-none overflow-x-hidden pb-16">
      
      {/* Dynamic Starfield/Constellation background lines */}
      <ConstellationBackground />

      {/* 1. STICKY GLASSMORPHISM HEADER */}
      <header className="sticky top-0 z-[90] w-full border-b border-white/5 bg-[#030408]/60 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-lg tracking-wider text-white">
            {getInitials()}
          </span>
        </div>
        
        {/* Navigation items matching exactly */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
          <a href="#home" className="hover:text-white transition-colors py-1 px-3 bg-white/5 rounded-full text-white">Home</a>
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#skills" className="hover:text-white transition-colors">Skills</a>
          <a href="#education" className="hover:text-white transition-colors">Education</a>
          <a href="#projects" className="hover:text-white transition-colors">Projects</a>
          <a href="#certifications" className="hover:text-white transition-colors">Certifications</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
        </nav>

        {/* Small badge to print or exit */}
        {!propsData && (
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#00ffcc]/20 bg-[#00ffcc]/5 text-[10px] font-bold text-[#00ffcc] hover:bg-[#00ffcc]/10 transition-all print:hidden"
          >
            <Download size={11} /> Print PDF
          </button>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section id="home" className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-12 flex flex-col-reverse md:flex-row items-center justify-between gap-12 min-h-[70vh]">
        <div className="space-y-6 max-w-xl text-left">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#00ffcc]">
            Welcome to my portfolio
          </p>
          <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight tracking-tight">
            Hi, I'm <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#00ffcc] via-[#3b82f6] to-[#a855f7]">{data.personalInfo.fullName}</span>
          </h1>
          
          {/* Animated typing simulation */}
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-bold text-[#00ffcc] border-r-2 border-[#00ffcc] pr-1 animate-pulse">
              {data.personalInfo.professionalTitle}
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium tracking-wide">
            {data.personalInfo.tagline}
          </p>

          {/* 4 Action buttons exactly styled */}
          <div className="flex flex-wrap gap-3 pt-4">
            <a href="#projects" className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold bg-gradient-to-r from-[#00ffcc] to-[#3b82f6] text-black hover:opacity-90 shadow-[0_0_15px_rgba(0,255,204,0.2)] transition-all">
              <Code size={13} /> View Projects
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold border border-white/10 bg-white/1 hover:bg-white/5 text-white transition-all">
              <Mail size={13} /> Contact Me
            </a>
            <a href="#contact" className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold border border-white/10 bg-white/1 hover:bg-white/5 text-white transition-all">
              <Briefcase size={13} /> Hire Me
            </a>
            {data.personalInfo.resumeUrl && (
              <a href={ensureAbsoluteUrl(data.personalInfo.resumeUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold border border-white/10 bg-white/1 hover:bg-white/5 text-white transition-all">
                <Download size={13} /> Download Resume
              </a>
            )}
          </div>
        </div>

        {/* Circular Avatar Photo with dynamic neon glow border */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden p-1 bg-gradient-to-tr from-[#00ffcc] via-[#3b82f6] to-[#a855f7] shadow-[0_0_30px_rgba(0,255,204,0.25)] flex items-center justify-center">
            <div className="w-full h-full rounded-full overflow-hidden bg-black flex items-center justify-center">
              {data.personalInfo.profilePic ? (
                <img src={data.personalInfo.profilePic} alt={data.personalInfo.fullName} className="w-full h-full object-cover" />
              ) : (
                <span className="font-black text-white text-6xl uppercase">{data.personalInfo.fullName?.charAt(0)}</span>
              )}
            </div>
          </div>
          {/* Below Circle Current Status Badge */}
          {data.personalInfo.currentStatus && (
            <div className="absolute -bottom-3 px-4 py-1.5 rounded-full border border-[#00ffcc]/30 bg-black text-[#00ffcc] text-[10px] font-bold tracking-wider shadow-[0_0_10px_rgba(0,255,204,0.15)]">
              {data.personalInfo.currentStatus}
            </div>
          )}
        </div>
      </section>

      {/* 3. ABOUT ME SECTION */}
      <section id="about" className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center space-y-10">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#a855f7] tracking-tight">
            About Me
          </h2>
          <p className="text-xs text-slate-400 font-semibold tracking-wide">
            Passionate about building intelligent solutions and hands-on innovation
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#00ffcc] to-[#a855f7] mx-auto mt-2" />
        </div>

        {/* Bio text block */}
        <div className="bg-[#0b0c15]/60 border border-white/5 p-6 sm:p-8 rounded-2xl text-left text-xs leading-relaxed text-slate-300 shadow-inner">
          <p className="leading-7">{data.personalInfo.bio}</p>
        </div>

        {/* 2x2 grid of details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0b0c15]/40 border border-white/5 p-4 rounded-xl flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-lg bg-[#00ffcc]/10 text-[#00ffcc]"><MapPin size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Location</p>
              <p className="text-xs text-white font-semibold mt-0.5">{data.personalInfo.location}</p>
            </div>
          </div>

          <div className="bg-[#0b0c15]/40 border border-white/5 p-4 rounded-xl flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-lg bg-[#00ffcc]/10 text-[#00ffcc]"><GraduationCap size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">College</p>
              <p className="text-xs text-white font-semibold mt-0.5 truncate max-w-[300px]">{data.personalInfo.college || "Aurora Deemed to be University"}</p>
            </div>
          </div>

          <div className="bg-[#0b0c15]/40 border border-white/5 p-4 rounded-xl flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-lg bg-[#00ffcc]/10 text-[#00ffcc]"><Sparkles size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Collaboration</p>
              <p className="text-xs text-white font-semibold mt-0.5">{data.personalInfo.collaboration || "NIAT - NxtWave Institute"}</p>
            </div>
          </div>

          <div className="bg-[#0b0c15]/40 border border-white/5 p-4 rounded-xl flex items-center gap-3 text-left">
            <div className="p-2.5 rounded-lg bg-[#00ffcc]/10 text-[#00ffcc]"><Calendar size={16} /></div>
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Joined</p>
              <p className="text-xs text-white font-semibold mt-0.5">{data.personalInfo.joinedDate || "September 10, 2025"}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SKILLS SECTION */}
      {data.skills && Object.values(data.skills).some(list => list && list.length > 0) && (
        <section id="skills" className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#a855f7]">
              Skills
            </h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wide">
              Technologies and tools I work with
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#00ffcc] to-[#a855f7] mx-auto mt-2" />
          </div>

          {/* 3 column grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(data.skills || {}).map(([cat, list]) => list && list.length > 0 && (
              <div key={cat} className="bg-[#0b0c15]/60 border border-white/5 p-5 rounded-2xl text-left space-y-4 shadow-lg hover:border-[#00ffcc]/20 transition-all">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  {cat.includes("Languages") ? <Code size={13} className="text-[#00ffcc]" /> : cat.includes("Frontend") ? <Layers size={13} className="text-[#00ffcc]" /> : <Wrench size={13} className="text-[#00ffcc]" />}
                  {cat}
                </h3>
                
                <div className="space-y-3.5">
                  {list.map(s => (
                    <div key={s.name} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-300">
                        <span>{s.name}</span>
                        <span>{s.percentage}%</span>
                      </div>
                      {/* Glowing progress line */}
                      <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-gradient-to-r from-[#00ffcc] to-[#a855f7] shadow-[0_0_10px_rgba(0,255,204,0.4)]"
                          style={{ width: `${s.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. EDUCATION SECTION */}
      {data.education && data.education.length > 0 && (
        <section id="education" className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#a855f7]">
              Education
            </h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wide">
              My academic journey
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#00ffcc] to-[#a855f7] mx-auto mt-2" />
          </div>

          {/* Timeline container */}
          <div className="relative border-l border-white/5 text-left pl-6 ml-4 space-y-8">
            {(data.education || []).map((edu, i) => (
              <div key={i} className="relative space-y-3">
                {/* Timeline bullet */}
                <span className="absolute -left-[30px] top-1.5 w-3 h-3 rounded-full bg-black border-2 border-[#00ffcc] shadow-[0_0_10px_#00ffcc]" />
                
                <div className="bg-[#0b0c15]/60 border border-white/5 p-6 rounded-2xl shadow-lg hover:border-[#00ffcc]/10 transition-all max-w-2xl">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-extrabold text-white">{edu.degree}</h3>
                      <p className="text-xs text-slate-300 font-bold">{edu.college}</p>
                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{edu.university}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded bg-[#00ffcc]/10 border border-[#00ffcc]/20 text-[#00ffcc] text-[9px] font-bold shrink-0 flex items-center gap-1">
                      <Calendar size={10} /> {edu.startYear} - {edu.endYear}
                    </span>
                  </div>

                  {/* Sub cards for GPA */}
                  {edu.gpaPoints && edu.gpaPoints.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                      {edu.gpaPoints.map((gp, idx) => (
                        <div key={idx} className="bg-[#030408]/60 p-3 rounded-lg border border-white/5 flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-bold flex items-center gap-1">
                            <Award size={11} className={idx === 0 ? "text-[#00ffcc]" : "text-[#a855f7]"} />
                            {gp.label}
                          </span>
                          <span className="font-extrabold text-white text-xs">{gp.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. PROJECTS SECTION */}
      {data.projects && data.projects.length > 0 && (
        <section id="projects" className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#a855f7]">
              Projects
            </h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wide">
              Showcasing my work across software and hardware
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#00ffcc] to-[#a855f7] mx-auto mt-2" />
          </div>

          {/* 2 column layout cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.projects || []).map((proj, i) => (
              <div key={i} className="bg-[#0b0c15]/60 border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:border-[#00ffcc]/20 transition-all flex flex-col text-left">
                {/* Image Preview Mockup */}
                <div className="aspect-video w-full bg-slate-900/60 overflow-hidden border-b border-white/5 relative flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                  <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=60" alt="Code backdrop" className="w-full h-full object-cover opacity-30" />
                  <Terminal size={32} className="absolute z-20 text-[#00ffcc]/40 animate-pulse" />
                </div>

                {/* Project description body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-black text-white">{proj.title}</h3>
                    <p className="text-[10.5px] text-slate-400 leading-relaxed leading-6">{proj.description}</p>
                  </div>

                  <div className="space-y-3.5 pt-2 border-t border-white/5">
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies?.map(tech => (
                        <span key={tech} className="px-2 py-0.5 rounded-full bg-[#00ffcc]/5 text-[#00ffcc] text-[9px] font-bold border border-[#00ffcc]/10">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3">
                      {proj.liveUrl && (
                        <a href={ensureAbsoluteUrl(proj.liveUrl)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#00ffcc] hover:underline">
                          <ExternalLink size={10} /> Live Demo
                        </a>
                      )}
                      {proj.github && (
                        <a href={ensureAbsoluteUrl(proj.github)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-400 hover:text-white hover:underline">
                          <Github size={10} /> GitHub
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 7. CERTIFICATIONS SECTION */}
      {data.certificates && data.certificates.length > 0 && (
        <section id="certifications" className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#a855f7]">
              Certifications
            </h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wide">
              Validated skills and workshop completions
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#00ffcc] to-[#a855f7] mx-auto mt-2" />
          </div>

          {/* 2 column grid of certificates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.certificates || []).map((cert, i) => (
              <div key={i} className="bg-[#0b0c15]/60 border border-white/5 rounded-2xl overflow-hidden shadow-lg hover:border-[#00ffcc]/20 transition-all flex flex-col">
                <div className="aspect-[4/3] w-full bg-slate-900 overflow-hidden relative flex items-center justify-center">
                  {cert.certificateImage ? (
                    <img src={cert.certificateImage} alt={cert.title} className="w-full h-full object-cover" />
                  ) : (
                    <Award size={48} className="text-[#a855f7]/30" />
                  )}
                </div>
                
                {/* Bottom footer text */}
                <div className="p-4 bg-black/60 border-t border-white/5 flex items-center gap-2.5 text-left">
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400 shrink-0"><Award size={14} /></div>
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-black text-white truncate max-w-[280px]">{cert.title}</p>
                    <p className="text-[8px] text-slate-500 font-bold uppercase mt-0.5">{cert.issuedBy}</p>
                  </div>
                  {cert.credentialUrl && (
                    <a href={ensureAbsoluteUrl(cert.credentialUrl)} target="_blank" rel="noreferrer" className="ml-auto p-1.5 bg-white/5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 8. LANGUAGES SECTION */}
      {data.languages && data.languages.length > 0 && (
        <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#a855f7]">
              Languages
            </h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wide">
              Languages I speak
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#00ffcc] to-[#a855f7] mx-auto mt-2" />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            {(data.languages || []).map((lang, idx) => (
              <div key={idx} className="px-4 py-3 bg-[#0b0c15]/60 border border-white/5 rounded-xl flex items-center gap-2 text-xs font-bold text-slate-200">
                <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-[#00ffcc] uppercase tracking-wide shrink-0">
                  {lang.code || "EN"}
                </span>
                <span>{lang.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 9. INTERESTS SECTION */}
      {data.interests && data.interests.length > 0 && (
        <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#a855f7]">
              Interests
            </h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wide">
              What drives my passion
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#00ffcc] to-[#a855f7] mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {(data.interests || []).map((intr, idx) => (
              <div key={idx} className="bg-[#0b0c15]/60 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 text-center shadow-lg hover:border-[#00ffcc]/20 transition-all">
                <div className="p-3 rounded-full bg-[#00ffcc]/10 text-[#00ffcc]">
                  {renderIcon(intr.icon || 'globe', 18)}
                </div>
                <span className="text-[10px] font-bold text-slate-300 tracking-wide">{intr.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 10. SOFT SKILLS SECTION */}
      {data.softSkills && data.softSkills.length > 0 && (
        <section className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#a855f7]">
              Soft Skills
            </h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wide">
              Beyond technical expertise
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-[#00ffcc] to-[#a855f7] mx-auto mt-2" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {(data.softSkills || []).map((skill, idx) => (
              <div key={idx} className="bg-[#0b0c15]/60 border border-white/5 p-4 rounded-2xl flex flex-col items-center justify-center gap-2.5 text-center shadow-lg hover:border-[#00ffcc]/20 transition-all">
                <div className="p-3 rounded-full bg-[#00ffcc]/10 text-[#00ffcc]">
                  {renderIcon(skill.icon || 'sparkles', 18)}
                </div>
                <span className="text-[10px] font-bold text-slate-300 tracking-wide">{skill.name}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 11. CONTACT SECTION */}
      <section id="contact" className="relative z-10 max-w-4xl mx-auto px-6 py-16 text-center space-y-12 border-t border-white/5">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#00ffcc] to-[#a855f7]">
            Get In Touch
          </h2>
          <p className="text-xs text-slate-400 font-semibold tracking-wide">
            Let's connect and build something amazing
          </p>
          <div className="w-16 h-0.5 bg-gradient-to-r from-[#00ffcc] to-[#a855f7] mx-auto mt-2" />
        </div>

        {/* 3 cards row with links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="bg-[#0b0c15]/60 border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
            <Mail size={20} className="text-[#00ffcc] mb-2" />
            <p className="text-[10px] text-slate-500 font-bold uppercase">Email</p>
            <a href={`mailto:${data.personalInfo.email}`} className="text-xs text-white hover:text-[#00ffcc] font-semibold mt-1 truncate w-full px-2 block">
              {data.personalInfo.email}
            </a>
          </div>

          <div className="bg-[#0b0c15]/60 border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
            <Phone size={20} className="text-[#00ffcc] mb-2" />
            <p className="text-[10px] text-slate-500 font-bold uppercase">Phone</p>
            <a href={`tel:${data.personalInfo.phone}`} className="text-xs text-white hover:text-[#00ffcc] font-semibold mt-1 block">
              {data.personalInfo.phone}
            </a>
          </div>

          <div className="bg-[#0b0c15]/60 border border-white/5 p-5 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg">
            <MapPin size={20} className="text-[#00ffcc] mb-2" />
            <p className="text-[10px] text-slate-500 font-bold uppercase">Location</p>
            <p className="text-xs text-white font-semibold mt-1">{data.personalInfo.location}</p>
          </div>
        </div>

        {/* Social links boxes */}
        <div className="flex justify-center gap-3.5 pt-4">
          {data.socialLinks.github && (
            <a href={ensureAbsoluteUrl(data.socialLinks.github)} target="_blank" rel="noreferrer" className="p-3 bg-[#0b0c15]/60 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-[#00ffcc]/35 hover:shadow-[0_0_10px_rgba(0,255,204,0.15)] transition-all">
              <Github size={18} />
            </a>
          )}
          {data.socialLinks.linkedin && (
            <a href={ensureAbsoluteUrl(data.socialLinks.linkedin)} target="_blank" rel="noreferrer" className="p-3 bg-[#0b0c15]/60 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-[#00ffcc]/35 hover:shadow-[0_0_10px_rgba(0,255,204,0.15)] transition-all">
              <Linkedin size={18} />
            </a>
          )}
          {data.socialLinks.youtube && (
            <a href={ensureAbsoluteUrl(data.socialLinks.youtube)} target="_blank" rel="noreferrer" className="p-3 bg-[#0b0c15]/60 border border-white/5 rounded-xl text-slate-400 hover:text-white hover:border-[#00ffcc]/35 hover:shadow-[0_0_10px_rgba(0,255,204,0.15)] transition-all">
              <Youtube size={18} />
            </a>
          )}
        </div>

        {/* Footer block */}
        <div className="w-full border-t border-white/5 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 font-bold tracking-wide">
          <p>© {new Date().getFullYear()} {data.personalInfo.fullName}. All rights reserved.</p>
          
          <div className="flex gap-4">
            {data.socialLinks.github && <a href={ensureAbsoluteUrl(data.socialLinks.github)} target="_blank" rel="noreferrer" className="hover:text-slate-300"><Github size={12} /></a>}
            {data.socialLinks.linkedin && <a href={ensureAbsoluteUrl(data.socialLinks.linkedin)} target="_blank" rel="noreferrer" className="hover:text-slate-300"><Linkedin size={12} /></a>}
            {data.socialLinks.youtube && <a href={ensureAbsoluteUrl(data.socialLinks.youtube)} target="_blank" rel="noreferrer" className="hover:text-slate-300"><Youtube size={12} /></a>}
          </div>

          <p>Made with ❤️ and passion</p>
        </div>
      </section>

    </div>
  );
}

// Helper row component for hero
function SocialRow({ links, email }) {
  if (!links) return null;
  return (
    <div className="flex flex-wrap gap-3.5 text-slate-400">
      {links.github && <a href={ensureAbsoluteUrl(links.github)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Github size={18} /></a>}
      {links.linkedin && <a href={ensureAbsoluteUrl(links.linkedin)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Linkedin size={18} /></a>}
      {links.youtube && <a href={ensureAbsoluteUrl(links.youtube)} target="_blank" rel="noreferrer" className="hover:text-white transition-colors"><Youtube size={18} /></a>}
      {email && <a href={`mailto:${email}`} className="hover:text-white transition-colors"><Mail size={18} /></a>}
    </div>
  );
}
