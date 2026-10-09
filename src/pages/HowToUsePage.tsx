import React from 'react';
import { ArrowLeft, CheckCircle2, Copy, Play, ArrowDownToLine, Smartphone, Monitor, Info } from 'lucide-react';
import { PageRoute } from '../types';

interface HowToUsePageProps {
  onNavigateHome: () => void;
  onNavigate: (route: PageRoute) => void;
}

export const HowToUsePage: React.FC<HowToUsePageProps> = ({ onNavigateHome, onNavigate }) => {
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
        <span className="text-xs text-slate-400 font-medium">Step-by-Step Guide</span>
      </div>

      {/* Main Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-xs font-semibold text-purple-700 mb-4">
          <Play className="w-3.5 h-3.5" />
          <span>User Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          How to Use MediaSave
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
          Follow these quick and straightforward steps to inspect and save public media from Instagram, Threads, and TikTok onto your mobile phone or computer.
        </p>
      </div>

      <div className="space-y-10 text-slate-700 leading-relaxed text-sm sm:text-base">
        {/* Step 1: Copy Link */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
              1
            </div>
            <h2 className="text-xl font-bold text-slate-900">Copy the Public Post Link</h2>
          </div>
          <p className="text-slate-600">
            Open the corresponding app or website and find the public post you want to inspect:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Instagram
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tap the three dots (<code className="text-[11px] bg-slate-200 px-1 py-0.5 rounded">•••</code>) on the post or the paper plane share icon, then select <strong>&quot;Copy link&quot;</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Threads
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tap the paper airplane share icon beneath the thread or post, then select <strong>&quot;Copy link&quot;</strong>.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                TikTok
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tap the <strong>Share</strong> arrow icon on the video or photo post, then tap <strong>&quot;Copy link&quot;</strong>.
              </p>
            </div>
          </div>
        </section>

        {/* Step 2: Paste and Analyze */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
              2
            </div>
            <h2 className="text-xl font-bold text-slate-900">Paste & Analyze in MediaSave</h2>
          </div>
          <p className="text-slate-600">
            Return to MediaSave. Paste your copied link into the URL input field at the top of the page (or click the <strong>&quot;Paste&quot;</strong> shortcut button), then click <strong>&quot;Analyze URL&quot;</strong>.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>Our system automatically recognizes whether your link belongs to Instagram, Threads, or TikTok, parsing the unique post shortcode safely.</span>
          </div>
        </section>

        {/* Step 3: Inspect & Download */}
        <section className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm">
              3
            </div>
            <h2 className="text-xl font-bold text-slate-900">Preview and Download</h2>
          </div>
          <p className="text-slate-600">
            Once analyzed, you will see the media card with its genuine resolution metrics and an official preview player:
          </p>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Single Video or Photo:</strong> Click the green <strong>&quot;Download&quot;</strong> button to immediately initiate the stream transfer.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span><strong>Multi-Slide Carousels:</strong> Check the checkboxes for specific slides you want, or click <strong>&quot;Select All&quot;</strong> and <strong>&quot;Download Selected&quot;</strong> for sequential batch downloading.</span>
            </li>
          </ul>
        </section>

        {/* Mobile vs Desktop Tips */}
        <section className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200/80 space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Platform Tips (Mobile vs. Desktop)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                iOS (iPhone / iPad) & Android
              </div>
              <p className="text-slate-600 leading-relaxed text-xs">
                In Safari on iOS, after clicking download, tap the download arrow in the address bar. Tap the downloaded file and choose <strong>&quot;Save Video / Save Image&quot;</strong> to move it into your Photos library.
              </p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-indigo-600" />
                Desktop (Chrome, Safari, Firefox, Edge)
              </div>
              <p className="text-slate-600 leading-relaxed text-xs">
                Files are downloaded automatically to your browser&apos;s standard <strong>Downloads</strong> folder with a structured, unique filename (e.g., <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">MediaSave_instagram_C8qKz9xM7pL.mp4</code>).
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-500">
          <button onClick={() => onNavigate('troubleshooting')} className="hover:text-slate-900 underline cursor-pointer">Troubleshooting</button>
          <button onClick={() => onNavigate('faq')} className="hover:text-slate-900 underline cursor-pointer">FAQ</button>
          <button onClick={() => onNavigate('terms')} className="hover:text-slate-900 underline cursor-pointer">Terms of Service</button>
        </div>
        <button
          onClick={onNavigateHome}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Start Downloading
        </button>
      </div>
    </div>
  );
};
