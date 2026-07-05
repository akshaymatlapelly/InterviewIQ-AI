import { base44 } from '../api/base44Client';

/**
 * Strips HTML tags for text fallback parameter.
 */
function stripHtml(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '\n')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

/**
 * Dynamically resolves job role based on resume analysis or preferred job role fallback.
 */
export function getActiveRole(profile) {
  if (profile?.resume_analysis) {
    try {
      const ra = JSON.parse(profile.resume_analysis);
      if (ra.job_suitability) return ra.job_suitability;
    } catch (e) {}
  }
  return 'Software Developer';
}

/**
 * Automatically emails the report to the registered candidate's email.
 */
export async function sendAutoReportEmail(profile, interview, feedback) {
  if (!profile?.email) return;

  const jobRole = interview.job_role || getActiveRole(profile);

  const scoreRows = [
    { name: 'Overall Score', score: interview.overall_score || 0 },
    { name: 'Technical Skills', score: interview.technical_score || 0 },
    { name: 'Communication', score: interview.communication_score || 0 },
    { name: 'Fluency', score: interview.fluency_score || 0 },
    { name: 'Confidence', score: interview.confidence_score || 0 },
    { name: 'Grammar', score: interview.grammar_score || 0 },
    { name: 'HR/Behavioral', score: interview.hr_score || 0 }
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
      <p style="color: #64748b; text-align: center; margin-top: 4px; font-size: 14px;">Role: <strong>${jobRole}</strong></p>
      
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

      ${strengthsList ? `
        <div style="margin-bottom: 24px;">
          <h4 style="color: #10b981; font-size: 16px; border-bottom: 1px solid rgba(16,185,129,0.2); padding-bottom: 6px; margin-bottom: 10px;">🌟 Core Strengths</h4>
          <ul style="padding-left: 20px; margin: 0;">${strengthsList}</ul>
        </div>
      ` : ''}

      ${weaknessesList ? `
        <div style="margin-bottom: 24px;">
          <h4 style="color: #f43f5e; font-size: 16px; border-bottom: 1px solid rgba(244,63,94,0.2); padding-bottom: 6px; margin-bottom: 10px;">⚠️ Key Areas for Improvement</h4>
          <ul style="padding-left: 20px; margin: 0;">${weaknessesList}</ul>
        </div>
      ` : ''}

      <div style="margin: 32px 0; text-align: center;">
        <a href="${window.location.origin}/history" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Replay & Practice History</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; margin-top: 32px;">
        Sent automatically by InterviewIQ AI. Customize alerts in settings dashboard.
      </p>
    </div>
  `;

  await base44.integrations.Core.SendEmail({
    to: profile.email,
    subject: `InterviewIQ AI Performance Report - ${interview.overall_score || 0}% Overall Score 🧠`,
    html: emailHtml
  });
}

/**
 * Sends a daily missed reminder if the user didn't complete any interviews today.
 */
export async function sendDailyMissedReminder(profile) {
  if (!profile?.email) return;

  const emailHtml = `
    <div style="background-color: #0b0c16; color: #f1f3f9; padding: 32px; font-family: sans-serif; max-width: 600px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); margin: 0 auto;">
      <h2 style="color: #8b5cf6; font-size: 26px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; text-align: center;">🧠 InterviewIQ AI</h2>
      <h3 style="color: #ffffff; text-align: center; margin-top: 16px; font-size: 18px;">You missed your practice session today!</h3>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; margin-top: 16px; text-align: center;">
        Hello ${profile.full_name || 'Candidate'},
      </p>
      <p style="color: #cbd5e1; font-size: 15px; line-height: 1.6; text-align: center;">
        Consistency is key to mastering technical terms, grammar, and pacing. Take a quick 10-minute mock interview now to maintain your streak!
      </p>
      
      <div style="margin: 32px 0; text-align: center;">
        <a href="${window.location.origin}/mock-interview" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Start Practice Round</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; margin-top: 32px;">
        Sent automatically by InterviewIQ AI. You can toggle reminders in Settings.
      </p>
    </div>
  `;

  await base44.integrations.Core.SendEmail({
    to: profile.email,
    subject: "Time to practice! Don't lose your streak today 🧠 | InterviewIQ AI",
    html: emailHtml
  });
}

/**
 * Sends a weekly performance report summarizing all rounds taken during the past week.
 */
export async function sendWeeklyReportEmail(profile, weeklyInterviews) {
  if (!profile?.email) return;

  const totalInterviews = weeklyInterviews.length;
  const avgScore = totalInterviews > 0 
    ? Math.round(weeklyInterviews.reduce((acc, curr) => acc + (curr.overall_score || 0), 0) / totalInterviews)
    : 0;

  const interviewRows = weeklyInterviews.map((item, idx) => {
    const dateStr = new Date(item.created_date || '').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 10px; color: #cbd5e1;">Round #${totalInterviews - idx} (${dateStr})</td>
        <td style="padding: 10px; color: #cbd5e1;">${item.job_role || 'General'}</td>
        <td style="padding: 10px; text-align: right; color: #8b5cf6; font-weight: bold;">${item.overall_score}%</td>
      </tr>
    `;
  }).join('');

  const emailHtml = `
    <div style="background-color: #0b0c16; color: #f1f3f9; padding: 32px; font-family: sans-serif; max-width: 600px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); margin: 0 auto;">
      <h2 style="color: #8b5cf6; font-size: 26px; font-weight: bold; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; text-align: center;">🧠 InterviewIQ AI</h2>
      <h3 style="color: #ffffff; text-align: center; margin-top: 16px; font-size: 18px;">Your Weekly Performance Summary</h3>
      
      <div style="margin: 24px 0; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; text-align: center;">
        <p style="margin: 0; font-size: 13px; color: #94a3b8; uppercase tracking-widest;">Weekly Average Score</p>
        <h2 style="margin: 8px 0; font-size: 48px; color: #8b5cf6; font-weight: 900;">${avgScore}%</h2>
        <p style="margin: 0; font-size: 13px; color: #64748b;">${totalInterviews} mock rounds completed this week</p>
      </div>

      ${totalInterviews > 0 ? `
        <div style="margin-bottom: 24px;">
          <h4 style="color: #ffffff; font-size: 15px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 6px; margin-bottom: 10px;">Practice Log</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                <th style="padding: 10px; text-align: left; color: #94a3b8;">Attempt</th>
                <th style="padding: 10px; text-align: left; color: #94a3b8;">Target Role</th>
                <th style="padding: 10px; text-align: right; color: #94a3b8;">Score</th>
              </tr>
            </thead>
            <tbody>
              ${interviewRows}
            </tbody>
          </table>
        </div>
      ` : `
        <p style="color: #64748b; text-align: center; font-style: italic; margin: 24px 0;">No mock rounds completed this week. Try to complete at least 2 rounds next week to trace your performance metrics!</p>
      `}

      <div style="margin: 32px 0; text-align: center;">
        <a href="${window.location.origin}/dashboard" style="background-color: #8b5cf6; color: #ffffff; padding: 12px 28px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block;">Go to Settings & Charts</a>
      </div>

      <p style="font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; margin-top: 32px;">
        Sent automatically by InterviewIQ AI. You can configure alerts in Settings.
      </p>
    </div>
  `;

  await base44.integrations.Core.SendEmail({
    to: profile.email,
    subject: `Your Weekly InterviewIQ AI Practice Summary - ${avgScore}% Avg Score 📊`,
    html: emailHtml
  });
}
