import React, { useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { base44 } from '../api/base44Client';
import { Switch } from './ui/Switch';
import { Button } from './ui/Button';
import { Label } from './ui/Label';
import { Mail, Bell } from 'lucide-react';
import { toast } from 'sonner';

export function loadReminderSettings() {
  const defaults = {
    daily: true,
    weekly: false
  };
  try {
    const saved = localStorage.getItem('iq_reminder_settings');
    return saved ? JSON.parse(saved) : defaults;
  } catch (e) {
    return defaults;
  }
}

export function saveReminderSettings(settings) {
  try {
    localStorage.setItem('iq_reminder_settings', JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save reminder settings:", e);
  }
}

export default function ReminderSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState(loadReminderSettings());
  const [sending, setSending] = useState(false);

  const handleToggle = (key, val) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    saveReminderSettings(updated);
    toast.success(`${key === 'daily' ? 'Daily' : 'Weekly'} reminders ${val ? 'enabled' : 'disabled'}.`);
  };

  const triggerTestEmail = async () => {
    if (!user || !user.email) {
      toast.error("User session email not resolved.");
      return;
    }
    setSending(true);
    try {
      const emailHtml = `
        <div style="background-color: #0b0c16; color: #f1f3f9; padding: 24px; font-family: sans-serif; max-width: 600px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <h2 style="color: #8b5cf6; font-size: 24px; margin-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px;">🧠 InterviewIQ AI Reminder</h2>
          <p style="font-size: 16px; line-height: 1.5; color: #cbd5e1;">Hello ${user.full_name || 'Candidate'},</p>
          <p style="font-size: 15px; line-height: 1.5; color: #cbd5e1;">This is your scheduled practice reminder from InterviewIQ AI. Regular mock interviews build fluency, grammar, and technical vocabulary.</p>
          <div style="margin: 24px 0; text-align: center;">
            <a href="${window.location.origin}/dashboard" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Start Daily Mock Interview</a>
          </div>
          <p style="font-size: 13px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; margin-top: 24px;">To opt out of these alerts, update your settings dashboard.</p>
        </div>
      `;

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Time for your Daily Interview Practice! 🧠 | InterviewIQ AI",
        html: emailHtml
      });
      toast.success("Practice test reminder email sent to: " + user.email);
    } catch (err) {
      console.error("Error sending reminder email:", err);
      toast.error("Failed to send reminder email.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="glass border border-white/5 p-6 rounded-xl space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="text-violet-500 w-5 h-5" />
        <h3 className="text-lg font-bold text-white">Email Reminders</h3>
      </div>

      <div className="space-y-4">
        {/* Daily reminders */}
        <div className="flex items-center justify-between py-2 border-b border-white/5">
          <div className="space-y-0.5">
            <Label className="normal-case text-sm text-white">Daily Practice Reminder</Label>
            <p className="text-xs text-slate-400">Receive an email every morning to complete your mock interview session.</p>
          </div>
          <Switch
            checked={settings.daily}
            onCheckedChange={(val) => handleToggle('daily', val)}
          />
        </div>

        {/* Weekly reminders */}
        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label className="normal-case text-sm text-white">Weekly Performance Summary</Label>
            <p className="text-xs text-slate-400">Get a weekend review of your scoring charts, strengths, and roadmap updates.</p>
          </div>
          <Switch
            checked={settings.weekly}
            onCheckedChange={(val) => handleToggle('weekly', val)}
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="text-xs text-slate-400">
          Emails will be sent to <span className="text-slate-300 font-medium">{user?.email}</span>
        </div>
        <Button onClick={triggerTestEmail} disabled={sending} variant="glass">
          <Mail className="w-4 h-4 mr-2" />
          {sending ? 'Sending Alert...' : 'Send Test Alert'}
        </Button>
      </div>
    </div>
  );
}
export { ReminderSettings };
