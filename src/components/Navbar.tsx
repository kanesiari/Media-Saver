import React, { useState } from 'react';
import { ArrowDownToLine, Menu, X, Sparkles, ExternalLink, ShieldCheck, HelpCircle, Info } from 'lucide-react';
import { Platform, PageRoute } from '../types';

interface NavbarProps {
  currentPlatform: Platform;
  onSelectPlatform: (platform: Platform) => void;
  onOpenLegalModal: (modal: 'terms' | 'privacy' | 'copyright') => void;
  currentRoute?: PageRoute;
  onNavigate?: (route: PageRoute) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPlatform,
  onSelectPlatform,
  onOpenLegalModal,
  currentRoute = 'home',
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (platform: Platform) => {
    if (onNavigate && currentRoute !== 'home') {
      onNavigate('home');
    }
    onSelectPlatform(platform);
    setMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById('media-input-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handlePageNavigation = (route: PageRoute) => {
    setMobileMenuOpen(false);
    if (onNavigate) {
      onNavigate(route);
    }
  };

  const scrollToSection = (id: string) => {
    if (currentRoute !== 'home' && onNavigate) {
      onNavigate('home');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }
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
            href="/"
            className="flex items-center gap-2.5 group focus:outline-none"
            onClick={(e) => {
              e.preventDefault();
              handlePageNavigation('home');
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
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => handleNavClick('instagram')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'home' && currentPlatform === 'instagram'
                  ? 'text-purple-700 bg-purple-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Instagram
            </button>
            <button
              onClick={() => handleNavClick('threads')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'home' && currentPlatform === 'threads'
                  ? 'text-blue-700 bg-blue-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Threads
            </button>
            <button
              onClick={() => handleNavClick('tiktok')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'home' && currentPlatform === 'tiktok'
                  ? 'text-slate-900 bg-slate-100 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              TikTok
            </button>

            <span className="h-4 w-px bg-slate-200 mx-1" />

            <button
              onClick={() => handlePageNavigation('how-to-use')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'how-to-use'
                  ? 'text-indigo-600 bg-indigo-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => handlePageNavigation('troubleshooting')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'troubleshooting'
                  ? 'text-indigo-600 bg-indigo-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Troubleshooting
            </button>
            <button
              onClick={() => handlePageNavigation('faq')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'faq'
                  ? 'text-indigo-600 bg-indigo-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              FAQ
            </button>
            <button
              onClick={() => handlePageNavigation('about')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                currentRoute === 'about'
                  ? 'text-indigo-600 bg-indigo-50 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              About
            </button>
          </nav>

          {/* Right Action / Contact shortcut */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              onClick={() => handlePageNavigation('contact')}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors bg-white cursor-pointer font-medium"
            >
              Contact
            </button>
            <button
              onClick={() => handleNavClick('all')}
              className="inline-flex items-center justify-center px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg shadow-sm shadow-purple-500/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              Downloader
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-1">
            Media Platforms
          </div>
          <button
            onClick={() => handleNavClick('instagram')}
            className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
          >
            <span>Instagram Downloader</span>
            {currentRoute === 'home' && currentPlatform === 'instagram' && (
              <span className="text-xs text-purple-600 font-semibold">Active</span>
            )}
          </button>
          <button
            onClick={() => handleNavClick('threads')}
            className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <span>Threads Downloader</span>
            {currentRoute === 'home' && currentPlatform === 'threads' && (
              <span className="text-xs text-blue-600 font-semibold">Active</span>
            )}
          </button>
          <button
            onClick={() => handleNavClick('tiktok')}
            className="w-full flex items-center justify-between px-3 py-2 text-left text-sm font-medium rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <span>TikTok Downloader</span>
            {currentRoute === 'home' && currentPlatform === 'tiktok' && (
              <span className="text-xs text-slate-900 font-semibold">Active</span>
            )}
          </button>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3">
            Guides & Help
          </div>
          <button
            onClick={() => handlePageNavigation('how-to-use')}
            className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            How to Use
          </button>
          <button
            onClick={() => handlePageNavigation('troubleshooting')}
            className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Troubleshooting Guide
          </button>
          <button
            onClick={() => handlePageNavigation('faq')}
            className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Frequently Asked Questions
          </button>
          <button
            onClick={() => handlePageNavigation('about')}
            className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            About Us
          </button>
          <button
            onClick={() => handlePageNavigation('contact')}
            className="w-full px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
          >
            Contact & Support
          </button>

          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pt-3">
            Legal & Policy
          </div>
          <div className="flex items-center gap-2 px-3 pt-1 text-xs">
            <button
              onClick={() => handlePageNavigation('terms')}
              className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Terms
            </button>
            <span>·</span>
            <button
              onClick={() => handlePageNavigation('privacy')}
              className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => handlePageNavigation('copyright')}
              className="text-slate-600 hover:text-slate-900 underline cursor-pointer"
            >
              Copyright
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
