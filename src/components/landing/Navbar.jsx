import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BrainCircuit, Menu, X, ArrowRight } from 'lucide-react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuLinks = [
    { name: 'Features', href: '#features' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'FAQ', href: '#faq' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-[#0b0c16]/75 backdrop-blur-xl border-b border-violet-500/20 py-3 shadow-[0_4px_30px_rgba(0,0,0,0.4)]' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_20px_rgba(139,92,246,0.6)] group-hover:scale-105 transition-all duration-300">
            <BrainCircuit className="text-white w-5 h-5 animate-pulse" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-violet-400 group-hover:to-cyan-400 transition-all duration-300">InterviewIQ AI</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {menuLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors relative group py-1"
            >
              {link.name}
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors relative group py-1">
            Log in
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-violet-500 transition-all duration-300 group-hover:w-full" />
          </Link>
          <Link to="/register">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 hover:scale-105 active:scale-[0.98] transition-all duration-300 shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              Get Started
            </button>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#0b0c16] border-b border-white/10 p-4 space-y-4 shadow-xl glass-strong">
          <nav className="flex flex-col gap-3">
            {menuLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-300 hover:text-white py-2 block"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="flex flex-col gap-2.5 pt-2 border-t border-white/5">
            <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-lg py-2.5 w-full flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                Get Started
              </button>
            </Link>
            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
              <button className="bg-[#121324] hover:bg-[#1a1b33] text-white text-sm font-bold border border-white/10 rounded-lg py-2.5 w-full flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                Sign In
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
