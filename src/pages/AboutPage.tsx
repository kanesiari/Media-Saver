import React from 'react';
import { ArrowLeft, ShieldCheck, Zap, Globe, AlertTriangle, Layers, Film } from 'lucide-react';
import { PageRoute } from '../types';

interface AboutPageProps {
  onNavigateHome: () => void;
  onNavigate: (route: PageRoute) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigateHome, onNavigate }) => {
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
        <span className="text-xs text-slate-400 font-medium">About MediaSave</span>
      </div>

      {/* Main Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700 mb-4">
          <Globe className="w-3.5 h-3.5" />
          <span>About the Service</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Empowering Clean, Privacy-First Public Media Inspection
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
          MediaSave is an open web utility engineered to inspect, preview, and download publicly shared multimedia content from Instagram, Threads, and TikTok without tracking or forced account sign-ups.
        </p>
      </div>

      {/* Core Mission & Value */}
      <div className="space-y-8 text-slate-700 leading-relaxed text-sm sm:text-base">
        <section className="bg-slate-50/70 p-6 sm:p-8 rounded-2xl border border-slate-200/80">
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-600" />
            What Problem Does MediaSave Solve?
          </h2>
          <p className="mb-3">
            Social media platforms frequently make it challenging for creators, researchers, and personal archivists to access and preview the media they have permission to inspect. Many alternative downloaders are cluttered with invasive popups, redirect loops, or require sensitive account credentials.
          </p>
          <p>
            MediaSave was built with a different philosophy: a minimalist, high-speed interface where you paste a public URL, verify the content via official metadata and preview players, and download authentic streams with clear, honest resolution metrics.
          </p>
        </section>

        {/* Supported Platforms Breakdown */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Supported Platforms & Real Capabilities</h2>
          <p className="text-slate-600">
            We believe in honest disclosures. Below is the precise scope of what our extraction engine supports based on our real codebase:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500 mb-2" />
              <h3 className="font-bold text-slate-900 mb-1 text-base">Instagram</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Public Reels, standard single-photo posts, and multi-slide carousels containing mixed photos and videos. Video streams are provided up to 720p progressive MP4, mirroring official public embeds.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mb-2" />
              <h3 className="font-bold text-slate-900 mb-1 text-base">Threads</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Public Threads posts featuring photos, video streams, and carousels. Uses SSR payload metadata to resolve genuine CDN candidates without simulated upscaling.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 mb-2" />
              <h3 className="font-bold text-slate-900 mb-1 text-base">TikTok</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Public video posts (with real resolution metadata, e.g. 576×1024 or 1080×1920) and photo slideshow posts. Resolves short URLs (<code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded">vm.tiktok.com</code>, <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded">/t/</code>) securely.
              </p>
            </div>
          </div>
        </section>

        {/* Technical Architecture & Privacy Guarantee */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
          <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Our Privacy & Architecture Principles
          </h2>
          <ul className="space-y-3 text-slate-600 text-sm">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span><strong>Zero User Tracking:</strong> We never require registration, login cookies, or personal identification.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span><strong>No Permanent Media Storage:</strong> Media files stream directly from verified upstream CDN endpoints via our streaming proxy. We do not maintain a server repository of user downloads.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
              <span><strong>Strict SSRF Defense:</strong> Our proxy verifies upstream host whitelists and validates MIME types to prevent open-redirect vulnerabilities.</span>
            </li>
          </ul>
        </section>

        {/* Clear Disclaimer */}
        <section className="p-5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-bold mb-1">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>Important Independence & Legal Disclaimer</span>
          </div>
          <p className="leading-relaxed">
            MediaSave is an independent web utility and is <strong>not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with</strong> Meta Platforms, Inc. (Instagram, Threads) or ByteDance Ltd. (TikTok). All product and company names are trademarks™ or registered® trademarks of their respective holders.
          </p>
        </section>
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
          Try MediaSave Now
        </button>
      </div>
    </div>
  );
};
