import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute({ children }) {
  const { user, profile, loading } = useAuth();
  const { pathname } = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c16] flex flex-col items-center justify-center gap-4 text-white">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-violet-500/20 border-t-violet-500 animate-spin" />
        </div>
        <p className="font-display text-sm font-medium text-slate-400">Securing environment...</p>
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user profile is not set up and we are not on onboarding, redirect to onboarding
  const isOnboarding = pathname === '/onboarding';
  const hasOnboarded = profile && profile.onboarding_complete;

  if (!hasOnboarded && !isOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  // If onboarding is complete and they try to visit /onboarding, send them to dashboard
  if (hasOnboarded && isOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
