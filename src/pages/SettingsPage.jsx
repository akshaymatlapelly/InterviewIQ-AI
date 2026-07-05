import React, { useState } from 'react';
import { VoiceSettings } from '../components/VoiceSettings';
import { ReminderSettings } from '../components/ReminderSettings';
import { useAuth } from '../lib/AuthContext';
import { Button } from '../components/ui/Button';
import { LogOut, ShieldAlert, Settings, User, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { logout, user } = useAuth();
  const [web3Key, setWeb3Key] = useState(localStorage.getItem('iq_web3forms_key') || '');

  const saveWeb3Key = () => {
    localStorage.setItem('iq_web3forms_key', web3Key.trim());
    toast.success("Web3Forms Email access key updated successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pt-4 pb-10">
      <div className="space-y-1.5">
        <h2 className="text-3xl font-display font-bold text-white flex items-center gap-2">
          Settings <Settings className="text-slate-400 w-6 h-6" />
        </h2>
        <p className="text-sm text-slate-400">Configure speech synthesis parameters, reminder frequencies, and account credentials.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Voice and Speech */}
        <VoiceSettings />

        {/* Reminders Toggle */}
        <ReminderSettings />

        {/* Email Delivery Setup */}
        <div className="glass border border-white/5 p-6 rounded-xl space-y-6">
          <div className="flex items-center gap-3">
            <Mail className="text-violet-500 w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Email Server Settings</h3>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              To send real email notifications (mock reports and practice reminders) from this browser application, route them securely via Web3Forms.
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                Web3Forms Access Key
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={web3Key}
                  onChange={(e) => setWeb3Key(e.target.value)}
                  placeholder="Paste your access_key here..."
                  className="flex-1 bg-[#0e0f1e] border border-white/8 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:outline-none focus:ring-1 focus:ring-violet-500/50"
                />
                <Button onClick={saveWeb3Key} className="text-xs h-9 px-4 shrink-0">
                  Save Token
                </Button>
              </div>
              <span className="text-[10px] text-slate-500 block mt-1">
                Don't have a key? Get a free access key instantly at{' '}
                <a
                  href="https://web3forms.com/#start"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 hover:underline"
                >
                  web3forms.com
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* Account and Security Section */}
        <div className="glass border border-white/5 p-6 rounded-xl space-y-6">
          <div className="flex items-center gap-3">
            <User className="text-violet-500 w-5 h-5" />
            <h3 className="text-lg font-bold text-white">Account Details</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-white/5 text-xs">
              <span className="text-slate-400">Authorized Name</span>
              <span className="text-white font-semibold text-right">{user?.full_name || 'User'}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 border-b border-white/5 text-xs">
              <span className="text-slate-400">Authorized Email</span>
              <span className="text-white font-semibold text-right">{user?.email}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 py-2 text-xs">
              <span className="text-slate-400">Credentials Security</span>
              <span className="text-emerald-400 font-semibold text-right">Google OAuth Protected</span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/5">
            <div className="text-xs text-slate-500">
              Session is secured via cookies and JWT authorization tokens.
            </div>
            <Button onClick={logout} variant="destructive" className="h-10 text-xs">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out of Account
            </Button>
          </div>
        </div>

        {/* Data & Privacy notice */}
        <div className="glass border border-red-500/10 p-5 rounded-xl bg-red-950/5 flex items-start gap-4">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white leading-none">Data Retention & Privacy Notice</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              InterviewIQ AI stores text transcripts, evaluations, and mock scores securely inside your Base44 client collection database. Audio recording is transcribed locally in-browser via Web Speech and is not cached on remote servers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
export { SettingsPage };
