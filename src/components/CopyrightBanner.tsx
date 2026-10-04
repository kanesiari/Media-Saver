import React from 'react';
import { ShieldAlert, CheckCircle, Scale, AlertTriangle, ArrowRight } from 'lucide-react';

interface CopyrightBannerProps {
  onOpenLegalModal: (modal: 'terms' | 'privacy' | 'copyright') => void;
}

export const CopyrightBanner: React.FC<CopyrightBannerProps> = ({ onOpenLegalModal }) => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl shadow-slate-900/10">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/15">
              <Scale className="w-3.5 h-3.5 text-purple-300" />
              <span>Copyright & Intellectual Property Notice</span>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Respect Creators & Download Authorized Content Only
            </h3>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              MediaSave is built as a technical preview utility for inspecting publicly available content. <strong className="text-white font-semibold">You must only download or save media that you personally own or have explicit authorization and legal rights to store and use.</strong>
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
              <div className="flex items-start gap-2 bg-white/5 rounded-xl p-3 border border-white/10">
                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>Permitted: Your own public posts, authorized creator backups, and fair-use study references.</span>
              </div>
              <div className="flex items-start gap-2 bg-white/5 rounded-xl p-3 border border-white/10">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <span>Prohibited: Commercial redistribution, copyright infringement, or re-uploading without creator permission.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
            <button
              type="button"
              onClick={() => onOpenLegalModal('copyright')}
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-slate-900 bg-white hover:bg-slate-100 transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Read Full Copyright Policy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onOpenLegalModal('terms')}
              className="w-full py-3 px-4 rounded-xl font-medium text-xs sm:text-sm text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Terms of Service</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
