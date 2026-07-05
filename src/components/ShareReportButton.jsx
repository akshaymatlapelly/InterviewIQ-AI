import React, { useState } from 'react';
import { base44 } from '../api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/Dialog';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Send, Share2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ShareReportButton({ interview, feedback }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSending(true);
    try {
      // Build high-quality email HTML containing the scorecard details
      const scoreRows = [
        { name: 'Overall Score', score: interview.overall_score },
        { name: 'Technical Skills', score: interview.technical_score },
        { name: 'Communication', score: interview.communication_score },
        { name: 'Fluency', score: interview.fluency_score },
        { name: 'Confidence', score: interview.confidence_score },
        { name: 'Grammar', score: interview.grammar_score },
        { name: 'HR/Behavioral', score: interview.hr_score }
      ].map(r => `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 10px; font-weight: 500; color: #cbd5e1;">${r.name}</td>
          <td style="padding: 10px; text-align: right; color: #8b5cf6; font-weight: bold; font-size: 16px;">${r.score}%</td>
        </tr>
      `).join('');

      const strengthsList = (feedback?.strengths || []).map(s => `
        <li style="margin-bottom: 6px; color: #cbd5e1;"><strong>${s.title || 'Strength'}:</strong> ${s.description || s}</li>
      `).join('');

      const weaknessesList = (feedback?.weaknesses || []).map(w => `
        <li style="margin-bottom: 6px; color: #cbd5e1;"><strong>${w.title || 'Focus Area'}:</strong> ${w.description || w}</li>
      `).join('');

      const emailHtml = `
        <div style="background-color: #0b0c16; color: #f1f3f9; padding: 32px; font-family: sans-serif; max-width: 600px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); margin: 0 auto;">
          <h2 style="color: #8b5cf6; font-size: 26px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; text-align: center;">🧠 InterviewIQ AI</h2>
          <h3 style="color: #ffffff; text-align: center; margin-top: 16px; font-size: 18px;">Mock Interview Performance Report</h3>
          <p style="color: #64748b; text-align: center; margin-top: 4px; font-size: 14px;">Role: <strong>${interview.job_role || 'General candidate'}</strong></p>
          
          <!-- Score summary -->
          <div style="margin: 24px 0; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                  <th style="padding: 10px; text-align: left; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Evaluation Area</th>
                  <th style="padding: 10px; text-align: right; color: #94a3b8; font-size: 12px; text-transform: uppercase;">Score</th>
                </tr>
              </thead>
              <tbody>
                ${scoreRows}
              </tbody>
            </table>
          </div>

          <!-- Strengths -->
          ${strengthsList ? `
            <div style="margin-bottom: 24px;">
              <h4 style="color: #10b981; font-size: 16px; border-bottom: 1px solid rgba(16,185,129,0.2); padding-bottom: 6px; margin-bottom: 10px;">🌟 Core Strengths</h4>
              <ul style="padding-left: 20px; margin: 0;">${strengthsList}</ul>
            </div>
          ` : ''}

          <!-- Weaknesses -->
          ${weaknessesList ? `
            <div style="margin-bottom: 24px;">
              <h4 style="color: #f43f5e; font-size: 16px; border-bottom: 1px solid rgba(244,63,94,0.2); padding-bottom: 6px; margin-bottom: 10px;">⚠️ Key Areas for Improvement</h4>
              <ul style="padding-left: 20px; margin: 0;">${weaknessesList}</ul>
            </div>
          ` : ''}

          <!-- CTA link -->
          <div style="margin: 32px 0; text-align: center;">
            <a href="${window.location.origin}/history" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Replay & Practice History</a>
          </div>

          <p style="font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; margin-top: 32px;">
            Sent automatically by InterviewIQ AI. Customize alerts in settings dashboard.
          </p>
        </div>
      `;

      await base44.integrations.Core.SendEmail({
        to: email,
        subject: `InterviewIQ AI Performance Report - ${interview.overall_score}% Overall Score 🧠`,
        html: emailHtml
      });

      setSent(true);
      toast.success("Interview report emailed to " + email);
      setTimeout(() => {
        setOpen(false);
        setSent(false);
        setEmail('');
      }, 1500);
    } catch (err) {
      console.error("Error sharing report:", err);
      toast.error("Failed to email report. " + (err.message || ''));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="glass">
        <Share2 className="w-4 h-4 mr-2" />
        Share Report
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Share Performance Report</DialogTitle>
          <DialogDescription>
            Enter an email address to send a structured HTML copy of this mock interview report.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleShare}>
          <DialogContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-email">Recipient Email Address</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="colleague@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={sending || sent}
              />
            </div>
          </DialogContent>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={sending || sent}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={sending || sent || !email}
              className={sent ? "bg-emerald-600 hover:bg-emerald-600" : ""}
            >
              {sent ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Emailed!
                </>
              ) : sending ? (
                "Sending Report..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}
export { ShareReportButton };
