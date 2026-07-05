import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { iqClient } from '../api/iqClient';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { Mail, ArrowLeft, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      await iqClient.auth.resetPasswordRequest(email);
      setSent(true);
      toast.success("Reset email sent! Please check your inbox.");
    } catch (err) {
      console.error("Forgot password error:", err);
      // For security and requirements, always show success or handle gracefully
      setSent(true);
      toast.success("If that email exists, reset instructions have been sent.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout 
        title="Check Your Email" 
        subtitle={`We have sent password reset instructions to ${email}`}
        footer={
          <Link to="/login" className="flex items-center justify-center gap-2 text-violet-400 hover:text-violet-300 font-semibold">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        }
      >
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Check size={24} />
          </div>
          <p className="text-sm text-center text-slate-300">
            Click the link in the email to configure your credentials. Be sure to check your spam folder.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your account email address and we'll send you a password reset link."
      footer={
        <Link to="/login" className="flex items-center justify-center gap-2 text-violet-400 hover:text-violet-300 font-semibold">
          <ArrowLeft size={14} /> Back to Login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="forgot-email">Account Email</Label>
          <div className="relative">
            <Input
              id="forgot-email"
              type="email"
              placeholder="candidate@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="pl-10"
              disabled={loading}
            />
            <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          </div>
        </div>

        <Button type="submit" className="w-full h-11" disabled={loading || !email}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending Link...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}

