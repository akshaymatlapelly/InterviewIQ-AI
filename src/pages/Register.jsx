import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { BrainCircuit, Mail, Lock, User, Loader2, AlertTriangle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
  const { registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, fullName);
      localStorage.setItem('iq_is_new_user', 'true');
      toast.success("Account created successfully!");
      navigate('/onboarding');
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create account. Email may already be in use.");
      toast.error("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c16] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Absolute Back to Home Button at Top-Left */}
      <div className="absolute top-6 left-6 z-20">
        <Link to="/">
          <Button variant="outline" className="border-white/10 hover:bg-white/5 flex items-center gap-1.5 text-xs text-slate-300 px-3.5 py-1.5 h-auto">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </Button>
        </Link>
      </div>
      {/* Mesh Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/3 w-[250px] h-[250px] rounded-full bg-cyan-600/5 blur-[80px] pointer-events-none animate-pulse-glow" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        <div className="flex flex-col items-center text-center space-y-2">
          <Link to="/" className="flex items-center gap-2 mb-2">
            <BrainCircuit className="text-violet-500 w-12 h-12 avatar-glow" />
          </Link>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Get Started</h2>
          <p className="text-sm text-slate-400 max-w-sm">Create an account to begin your AI proctored mock trials.</p>
        </div>

        <div className="glass p-8 rounded-2xl border border-white/5 shadow-xl space-y-5">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/20 text-xs text-red-300 rounded-lg flex items-start gap-2">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="reg-name">Full Name</Label>
              <div className="relative">
                <Input
                  id="reg-name"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="pl-10"
                  disabled={loading}
                />
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reg-email">Email ID</Label>
              <div className="relative">
                <Input
                  id="reg-email"
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

            <div className="space-y-1.5">
              <Label htmlFor="reg-password">Password</Label>
              <div className="relative">
                <Input
                  id="reg-password"
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

            <div className="space-y-1.5">
              <Label htmlFor="reg-confirm">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="reg-confirm"
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

            <Button type="submit" className="w-full h-11 text-sm font-semibold mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

        </div>

        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
