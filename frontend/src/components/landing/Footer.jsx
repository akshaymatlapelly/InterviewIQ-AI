import React from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#07080e] border-t border-white/5 py-12 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Column */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <BrainCircuit className="text-violet-500 w-6 h-6" />
              <span className="font-display font-bold text-base text-white">InterviewIQ AI</span>
            </Link>
            <p className="text-slate-400 leading-relaxed max-w-xs">
              Empowering candidates to scale their technical and communication skills with proctored AI mock trials.
            </p>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Sign In</Link></li>
            </ul>
          </div>

          {/* Developer Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Resources</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API References</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Support Channels</a></li>
            </ul>
          </div>

          {/* Connect Column */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Connect</h4>
            <div className="flex gap-4">
              <a href="#" className="p-2 rounded-lg bg-white/3 hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                <Twitter size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/3 hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                <Github size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg bg-white/3 hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                <Linkedin size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} InterviewIQ AI. All rights reserved.</p>
          <div className="flex gap-6 text-slate-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
