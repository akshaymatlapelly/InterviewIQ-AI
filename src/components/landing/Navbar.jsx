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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#0b0c16]/90 backdrop-blur-md border-b border-white/5 py-4' 
        : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.4)] animate-pulse-glow">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold text-lg text-white tracking-tight">InterviewIQ AI</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {menuLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            Log in
          </Link>
          <Link to="/register">
            <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg px-4 py-2 flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-[0.98]">
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
