import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function PageNotFound() {
  return (
    <div className="min-h-screen bg-[#0b0c16] flex flex-col items-center justify-center p-6 text-center space-y-6 max-w-md mx-auto relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-violet-600/5 blur-[80px] pointer-events-none" />

      <AlertCircle className="w-16 h-16 text-violet-500 animate-pulse mb-2" />
      <h2 className="text-4xl font-display font-black text-white">404</h2>
      <h3 className="text-lg font-bold text-slate-200">Page Not Found</h3>
      <p className="text-slate-400 text-sm leading-relaxed">
        The route you are trying to reach does not exist or has been relocated to another workspace path.
      </p>
      
      <Link to="/dashboard">
        <Button>
          <ArrowLeft className="w-4 h-4 mr-2" /> Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}
export { PageNotFound };
