import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { base44 } from '../api/base44Client';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Button } from '../components/ui/Button';
import { Lock, ArrowLeft, Loader2, AlertTriangle, Check, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token') || searchParams.get('resetToken') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Reset token is missing or has expired. Please request a new link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await base44.auth.resetPassword({
        resetToken: token,
        newPassword: password
      });
      setSuccess(true);
      toast.success("Password updated! Redirecting to login...");
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to update password. Link might be invalid.");
      toast.error("Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || error && !password) {
    return (
      <AuthLayout 
        title="Invalid Link" 
        footer={
          <Link to="/forgot-password" className="flex items-center justify-center gap-2 text-violet-400 hover:text-violet-300 font-semibold">
            <ArrowLeft size={14} /> Request New Link
          </Link>
        }
      >
        <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
            <AlertTriangle size={24} />
          </div>
          <p className="text-sm text-slate-300">
            {error || "We could not verify your verification token. It may have expired or already been used."}
          </p>
        </div>
      </AuthLayout>
    );
  }

  if (success) {
    return (
      <AuthLayout title="Success!">
        <div className="flex flex-col items-center justify-center py-4 space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Check size={24} />
          </div>
          <p className="text-sm text-slate-300">
            Your credentials have been successfully updated. Redirecting to login...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create New Password"
      subtitle="Establish a new password for your account access."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/20 text-xs text-red-300 rounded-lg flex items-start gap-2">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="new-pass">New Password</Label>
          <div className="relative">
            <Input
              id="new-pass"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="pl-10 pr-10"
              disabled={loading}
            />
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3 text-slate-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-pass">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirm-pass"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="pl-10 pr-10"
              disabled={loading}
            />
            <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-3 text-slate-500 hover:text-white transition-colors"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full h-11" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Updating Password...
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
