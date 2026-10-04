import React from 'react';
import { Link2, Eye, ShieldCheck, ArrowRight } from 'lucide-react';

interface HowItWorksSectionProps {
  onScrollToInput: () => void;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ onScrollToInput }) => {
  const steps = [
    {
      stepNumber: '01',
      title: 'Paste a public URL',
      description:
        'Copy any publicly available link from Instagram (Reels, Posts, Videos) or Threads and paste it into the search bar above.',
      icon: Link2,
      accent: 'from-blue-600 to-indigo-600',
    },
    {
      stepNumber: '02',
      title: 'Preview available media',
      description:
        'Inspect the detected media streams, preview photo slides or video resolution options, and verify content format specifications.',
      icon: Eye,
      accent: 'from-indigo-600 to-purple-600',
    },
    {
      stepNumber: '03',
      title: 'Save content you are authorized to use',
      description:
        'Download the public media files to your device for authorized personal offline access, educational reference, or creator backups.',
      icon: ShieldCheck,
      accent: 'from-purple-600 to-pink-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block mb-2">
            Step-by-Step Guide
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Follow three simple steps to inspect and save public social media content.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.stepNumber}
                className="relative bg-slate-50/70 rounded-2xl p-7 sm:p-8 border border-slate-200/80 transition-all hover:bg-white hover:shadow-md hover:border-slate-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-3xl font-extrabold font-mono tracking-tighter bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {item.stepNumber}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-indigo-900 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-purple-700">
                  <span>Step {index + 1} of 3</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA banner below steps */}
        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={onScrollToInput}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-purple-500/20 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <span>Try MediaSave Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
