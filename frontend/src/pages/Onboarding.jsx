import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { iqClient } from '../api/iqClient';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Select } from '../components/ui/Select';
import { 
  ArrowRight, 
  ArrowLeft, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  BrainCircuit 
} from 'lucide-react';
import { toast } from 'sonner';
import { analyzeResumeText } from '../utils/resumeAnalyzer';

export default function Onboarding() {
  const { user, refetchProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    current_status: '',
    college_name: '',
    degree: '',
    branch: '',
    graduation_year: '',
    current_company: '',
    experience_level: '',
    skills: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: ''
  });

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        full_name: user.full_name || prev.full_name || '',
        email: user.email || prev.email || ''
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size exceeds 5MB limit.");
      return;
    }

    setResumeFile(file);
    setLoading(true);
    try {
      const uploadRes = await iqClient.integrations.Core.UploadFile({ file });
      if (uploadRes && uploadRes.url) {
        setResumeUrl(uploadRes.url);
        toast.success("Resume uploaded successfully!");
      } else {
        throw new Error("Invalid upload response.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Failed to upload resume.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!form.full_name || !form.email) {
        toast.error("Name and Email are required fields.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.skills) {
        toast.error("Core Skills are required.");
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    try {
      const rawTextForAnalyzer = `
      Name: ${form.full_name || ''}
      Email: ${form.email || ''}
      Phone: ${form.phone || ''}
      Skills: ${form.skills || ''}
      Degree: ${form.degree || ''}
      Graduation Year: ${form.graduation_year || ''}
      Current Company: ${form.current_company || ''}
      Experience Level: ${form.experience_level || '0-1 years'}
      `;
      
      const parsedAnalysis = analyzeResumeText(rawTextForAnalyzer, form.role || '');
      let analysisJsonString = JSON.stringify(parsedAnalysis);

      await iqClient.entities.UserProfile.create({
        ...form,
        resume_url: resumeUrl,
        resume_analysis: analysisJsonString,
        onboarding_complete: true,
        daily_interviews_count: 0,
        last_interview_date: new Date().toISOString().split('T')[0]
      });

      toast.success("Profile setup complete!");
      await refetchProfile();
      navigate('/dashboard');
    } catch (err) {
      console.error("Onboarding setup error:", err);
      toast.error("Failed to complete onboarding.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c16] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[90px] pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        
        {/* Onboarding Wizard Card */}
        <div className="glass bg-[#0e0f1d]/90 p-5 sm:p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden">
          
          {/* Card Header */}
          <div className="flex items-center gap-2.5 border-b border-white/5 pb-3 mb-5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <BrainCircuit className="text-white w-4.5 h-4.5" />
            </div>
            <h2 className="text-xs font-bold text-white tracking-tight">Complete Your Profile</h2>
          </div>

          {/* 3-segment progress bars */}
          <div className="grid grid-cols-3 gap-2.5 mb-5">
            <div className={`h-1 rounded-full transition-all duration-300 ${
              step >= 1 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-white/5'
            }`} />
            <div className={`h-1 rounded-full transition-all duration-300 ${
              step >= 2 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-white/5'
            }`} />
            <div className={`h-1 rounded-full transition-all duration-300 ${
              step >= 3 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-white/5'
            }`} />
          </div>

          {/* Step titles labels */}
          <div className="space-y-0.5 mb-5">
            <h3 className="text-lg font-bold text-white tracking-tight">
              {step === 1 ? 'Personal Info' : step === 2 ? 'Education & Career' : 'Links & Resume'}
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold tracking-wider">
              Step {step} of 3
            </p>
          </div>

          {analyzing && (
            <div className="absolute inset-0 bg-[#0d0e1c]/95 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-center p-6 space-y-4">
              <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
              <h3 className="text-lg font-bold text-white">Generating AI ATS Profiles</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Compiling technical roadmaps and mock practices files. This will take a second...
              </p>
            </div>
          )}

          {/* STEP 1: Personal Info */}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1">
                <Label htmlFor="onb-fullname">Full Name</Label>
                <Input id="onb-fullname" name="full_name" value={form.full_name} onChange={handleChange} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onb-email">Email</Label>
                <Input id="onb-email" name="email" type="email" value={form.email} onChange={handleChange} disabled required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onb-phone">Phone</Label>
                <Input id="onb-phone" name="phone" placeholder="e.g. +1 555-0199" value={form.phone} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onb-dob">Date of Birth</Label>
                <Input id="onb-dob" name="date_of_birth" type="date" value={form.date_of_birth} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onb-gender">Gender</Label>
                <Select id="onb-gender" name="gender" value={form.gender} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Male" className="bg-[#0b0c16]">Male</option>
                  <option value="Female" className="bg-[#0b0c16]">Female</option>
                  <option value="Non-binary" className="bg-[#0b0c16]">Non-binary</option>
                  <option value="Prefer not to say" className="bg-[#0b0c16]">Prefer not to say</option>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="onb-status">Current Status</Label>
                <Select id="onb-status" name="current_status" value={form.current_status} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Student" className="bg-[#0b0c16]">Student</option>
                  <option value="Passed Out" className="bg-[#0b0c16]">Passed Out</option>
                  <option value="Fresher" className="bg-[#0b0c16]">Fresher</option>
                  <option value="Experienced" className="bg-[#0b0c16]">Experienced</option>
                  <option value="Career Switcher" className="bg-[#0b0c16]">Career Switcher</option>
                </Select>
              </div>
            </div>
          )}

          {/* STEP 2: Education & Career */}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1">
                <Label htmlFor="onb-college">College Name</Label>
                <Input id="onb-college" name="college_name" value={form.college_name} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onb-degree">Degree</Label>
                <Input id="onb-degree" name="degree" value={form.degree} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onb-branch">Branch</Label>
                <Input id="onb-branch" name="branch" value={form.branch} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onb-gradyear">Graduation Year</Label>
                <Input id="onb-gradyear" name="graduation_year" placeholder="e.g. 2025" value={form.graduation_year} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onb-company">Current Company</Label>
                <Input id="onb-company" name="current_company" placeholder="e.g. Acme Corp" value={form.current_company} onChange={handleChange} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="onb-experience">Experience Level</Label>
                <Select id="onb-experience" name="experience_level" value={form.experience_level} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="0-1 years" className="bg-[#0b0c16]">0-1 years</option>
                  <option value="1-3 years" className="bg-[#0b0c16]">1-3 years</option>
                  <option value="3-5 years" className="bg-[#0b0c16]">3-5 years</option>
                  <option value="5-10 years" className="bg-[#0b0c16]">5-10 years</option>
                  <option value="10+ years" className="bg-[#0b0c16]">10+ years</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="onb-skills">Skills (comma separated)</Label>
                <Input id="onb-skills" name="skills" placeholder="React, Python, SQL..." value={form.skills} onChange={handleChange} required />
              </div>
            </div>
          )}

          {/* STEP 3: Links & Resume */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                <div className="space-y-1">
                  <Label htmlFor="onb-linkedin">LinkedIn URL</Label>
                  <Input id="onb-linkedin" name="linkedin_url" placeholder="https://linkedin.com/in/..." value={form.linkedin_url} onChange={handleChange} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="onb-github">GitHub URL</Label>
                  <Input id="onb-github" name="github_url" placeholder="https://github.com/..." value={form.github_url} onChange={handleChange} />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="onb-portfolio">Portfolio URL</Label>
                  <Input id="onb-portfolio" name="portfolio_url" placeholder="https://..." value={form.portfolio_url} onChange={handleChange} />
                </div>
              </div>

              <div className="space-y-1">
                <Label>Upload Resume (PDF/DOCX)</Label>
                <div className="border border-dashed border-white/10 hover:border-blue-500/50 bg-[#121324]/55 rounded-xl py-5 px-6 transition-colors flex flex-col items-center justify-center text-center relative cursor-pointer group">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    disabled={loading}
                  />
                  {loading ? (
                    <div className="space-y-1">
                      <Loader2 className="w-5 h-5 text-blue-500 animate-spin mx-auto" />
                      <p className="text-[10px] text-slate-400">Uploading resume...</p>
                    </div>
                  ) : resumeUrl ? (
                    <div className="space-y-1 text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 mx-auto" />
                      <p className="text-[11px] font-semibold text-white truncate max-w-xs">{resumeFile?.name || 'resume.pdf'}</p>
                      <p className="text-[9px] text-slate-500">Resume locked successfully.</p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Upload className="w-5 h-5 text-slate-550 group-hover:text-blue-400 transition-colors mx-auto" />
                      <p className="text-[11px] font-bold text-slate-300">Click to upload</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Buttons */}
          <div className="flex justify-between items-center mt-6 pt-5 border-t border-white/5">
            <button
              type="button"
              onClick={handleBack}
              disabled={step === 1 || loading}
              className={`bg-[#121324] hover:bg-[#1a1b33] text-slate-400 hover:text-white text-xs font-bold border border-white/10 rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none`}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-[0.98]"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg px-5 py-2.5 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-[0.98]"
              >
                Complete Setup
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
export { Onboarding };

