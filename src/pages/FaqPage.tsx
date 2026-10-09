import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { PageRoute } from '../types';

interface FaqPageProps {
  onNavigateHome: () => void;
  onNavigate: (route: PageRoute) => void;
}

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigateHome, onNavigate }) => {
  const [openIndices, setOpenIndices] = useState<Set<number>>(new Set([0, 1]));

  const toggleIndex = (idx: number) => {
    setOpenIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const faqs = [
    {
      q: 'Which platforms and formats does MediaSave support?',
      a: 'MediaSave supports public Instagram Reels, single-image posts, and multi-slide carousels (both photos and videos); public Threads single photos, videos, and carousels; and public TikTok videos and multi-image photo slideshows. Media is delivered in standard MP4 for video streams and JPEG for photo slides.',
    },
    {
      q: 'Is MediaSave completely free to use?',
      a: 'Yes, MediaSave is 100% free to use. There are no paid subscription tiers, hidden paywalls, or credit card requirements.',
    },
    {
      q: 'Do I need to sign up for an account or install browser extensions?',
      a: 'No. MediaSave operates directly in your standard web browser across desktop and mobile devices. You do not need to register, create a username, or install any software or third-party extensions.',
    },
    {
      q: 'Are downloaded media files stored on MediaSave servers?',
      a: 'No. MediaSave does not retain, save, or build a permanent archive of downloaded content. Media streams pass directly from the originating platform’s public CDN through an in-memory streaming proxy straight to your device.',
    },
    {
      q: 'Can MediaSave download posts from private accounts or "Close Friends"?',
      a: 'No. Private posts, stories shared with Close Friends, and accounts that require login permissions cannot be accessed. MediaSave strictly respects platform privacy configurations and does not bypass authorization barriers.',
    },
    {
      q: 'How does MediaSave determine media resolution?',
      a: 'We extract genuine dimensions directly from the upstream media metadata and stream manifest. For instance, public Instagram web embeds cap streams at progressive 720p; we display this as 720p and never claim false "1080p AI Upscaling" or artificial 4K options.',
    },
    {
      q: 'How does MediaSave comply with copyright laws and platform policies?',
      a: 'Users must only download media that they personally own, created, or have received explicit written permission to archive. MediaSave is a technology tool for personal inspection and fair use archiving. Unauthorized redistribution of copyrighted material is prohibited.',
    },
    {
      q: 'Are cookies used on this website?',
      a: 'MediaSave uses local storage solely to retain your client interface preferences (such as platform tab selection). Third-party vendors, including Google, use cookies to serve relevant advertisements based on a user\'s prior visits to this and other websites on the internet. You can read more in our Privacy Policy and opt out via Google Ads Settings.',
    },
    {
      q: 'Why did my download fail with an error?',
      a: 'The most common causes are: (1) The post was set to private or deleted by the creator, (2) The URL is a user profile link rather than a specific post link, or (3) The CDN signature expired because too much time passed between analysis and download. Please refer to our Troubleshooting Guide for step-by-step help.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Breadcrumb & Back button */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-slate-500" />
          <span>Back to Media Downloader</span>
        </button>
        <span className="text-xs text-slate-400 font-medium">Frequently Asked Questions</span>
      </div>

      {/* Main Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-xs font-semibold text-indigo-700 mb-4">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
          Everything you need to know about our extraction engine, supported platforms, resolution reporting, and privacy standards.
        </p>
      </div>

      {/* Accordion list */}
      <div className="space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndices.has(idx);
          return (
            <div
              key={faq.q}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs transition-all hover:border-slate-300"
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full p-5 sm:p-6 text-left font-bold text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base leading-snug">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/30">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-500">
          <button onClick={() => onNavigate('how-to-use')} className="hover:text-slate-900 underline cursor-pointer">How to Use</button>
          <button onClick={() => onNavigate('troubleshooting')} className="hover:text-slate-900 underline cursor-pointer">Troubleshooting</button>
          <button onClick={() => onNavigate('privacy')} className="hover:text-slate-900 underline cursor-pointer">Privacy Policy</button>
        </div>
        <button
          onClick={onNavigateHome}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Try MediaSave
        </button>
      </div>
    </div>
  );
};
