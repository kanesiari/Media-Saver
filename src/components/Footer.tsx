import React from 'react';
import { ArrowDownToLine, ShieldCheck, Heart } from 'lucide-react';
import { Platform } from '../types';

interface FooterProps {
  onSelectPlatform: (platform: Platform) => void;
  onOpenLegalModal: (modal: 'terms' | 'privacy' | 'copyright') => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectPlatform,
  onOpenLegalModal,
}) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-white border-t border-slate-200/90 text-slate-600 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-slate-100">
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-xs">
                <ArrowDownToLine className="w-4 h-4" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Media<span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Save</span>
              </span>
            </div>

            <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-sm">
              MediaSave is a clean, modern web interface for analyzing and previewing public Instagram and Threads media. Built for speed, high privacy standards, and ease of deployment.
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              <span>Ready for Cloudflare Pages & GitHub</span>
            </div>
          </div>

          {/* Quick Services */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Downloaders
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlatform('instagram');
                    scrollToSection('media-input-section');
                  }}
                  className="hover:text-purple-600 transition-colors cursor-pointer text-left"
                >
                  Instagram Downloader
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => {
                    onSelectPlatform('threads');
                    scrollToSection('media-input-section');
                  }}
                  className="hover:text-blue-600 transition-colors cursor-pointer text-left"
                >
                  Threads Downloader
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('how-it-works')}
                  className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToSection('features')}
                  className="hover:text-indigo-600 transition-colors cursor-pointer text-left"
                >
                  Core Features
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Legal & Compliance
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('terms')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left font-medium"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('privacy')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left font-medium"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('copyright')}
                  className="hover:text-slate-900 transition-colors cursor-pointer text-left font-medium flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Copyright Notice</span>
                </button>
              </li>
            </ul>

            {/* Copyright Disclaimer Note */}
            <div className="pt-2">
              <p className="text-[11px] text-slate-400 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-semibold text-slate-600">Notice:</span> Users are strictly required to only download content they own or have obtained explicit permission and authorization to save and use.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} MediaSave. All rights reserved.
          </p>

          <p className="text-center sm:text-right text-[11px]">
            Independent utility. Not affiliated with or endorsed by Instagram, Threads, or Meta Platforms.
          </p>
        </div>
      </div>
    </footer>
  );
};
