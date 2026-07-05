import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '../lib/AuthContext';

export default function UserNotRegisteredError() {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-[#0b0c16] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto">
      <ShieldAlert className="w-16 h-16 text-rose-500 animate-bounce" />
      <h2 className="text-2xl font-display font-bold text-white">Account Not Registered</h2>
      <p className="text-slate-400 text-sm leading-relaxed">
        Your email is not currently registered on the InterviewIQ platform. Please request an invite or login using an authorized Google Workspace account.
      </p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={logout}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Log Out
        </Button>
      </div>
    </div>
  );
}
