import React, { useState } from 'react';
import { ArrowDownToLine, Menu, X, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import { Platform } from '../types';

interface NavbarProps {
  currentPlatform: Platform;
  onSelectPlatform: (platform: Platform) => void;
  onOpenLegalModal: (modal: 'terms' | 'privacy' | 'copyright') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPlatform,
  onSelectPlatform,
  onOpenLegalModal,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (platform: Platform) => {
    onSelectPlatform(platform);
    setMobileMenuOpen(false);
    const element = document.getElementById('media-input-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <a
            href="#"
            className="flex items-center gap-2.5 group focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ArrowDownToLine className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                Media<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Save</span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">Public Media Inspector</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => handleNavClick('instagram')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentPlatform === 'instagram'
                  ? 'text-purple-600 bg-purple-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Instagram Downloader
            </button>
            <button
              onClick={() => handleNavClick('threads')}
              className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                currentPlatform === 'threads'
                  ? 'text-blue-600 bg-blue-50/80 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Threads Downloader
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Features
            </button>
          </nav>

          {/* Right Action / Legal shortcut */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => onOpenLegalModal('copyright')}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200/80 hover:border-slate-300 transition-colors bg-white cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Copyright Guide</span>
            </button>
            <a
              href="#media-input-section"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('media-input-section');
              }}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-sm shadow-purple-500/20 transition-all hover:shadow hover:scale-[1.02] cursor-pointer"
            >
              Inspect Link
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-100 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="space-y-1">
            <button
              onClick={() => handleNavClick('instagram')}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
            >
              <span>Instagram Downloader</span>
              {currentPlatform === 'instagram' && <span className="text-xs text-purple-600 font-semibold">Active</span>}
            </button>
            <button
              onClick={() => handleNavClick('threads')}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <span>Threads Downloader</span>
              {currentPlatform === 'threads' && <span className="text-xs text-blue-600 font-semibold">Active</span>}
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="w-full px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Key Features
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLegalModal('copyright');
              }}
              className="w-full px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span>Copyright & Fair Use</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                scrollToSection('media-input-section');
              }}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
