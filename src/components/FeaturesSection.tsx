import React from 'react';
import { Zap, Smartphone, ShieldCheck } from 'lucide-react';

export const FeaturesSection: React.FC = () => {
  const features = [
    {
      title: 'Simple to Use',
      description:
        'No complicated setups, registrations, or browser extensions needed. Simply copy any public Instagram or Threads link and analyze it in a single click.',
      icon: Zap,
      accentGradient: 'from-blue-500 to-indigo-500',
      tag: 'Intuitive Workflow',
    },
    {
      title: 'Mobile Friendly',
      description:
        'Engineered with responsive touch-first design. Seamlessly inspect videos, photo carousels, and high-resolution media directly from iOS, Android, or desktop browsers.',
      icon: Smartphone,
      accentGradient: 'from-indigo-500 to-purple-500',
      tag: 'Any Device',
    },
    {
      title: 'Privacy Focused',
      description:
        'We never track your personal browsing habits, store your personal account credentials, or retain downloaded media on remote database servers. Your privacy remains yours.',
      icon: ShieldCheck,
      accentGradient: 'from-purple-500 to-pink-500',
      tag: 'Zero Logging',
    },
  ];

  return (
    <section id="features" className="py-16 md:py-24 bg-gradient-to-b from-white via-slate-50/50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 block mb-2">
            Why Choose MediaSave
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Designed for Speed, Simplicity & Privacy
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            A modern client-ready architecture tailored for seamless public content inspection and archiving.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-white rounded-2xl p-7 sm:p-8 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.accentGradient} flex items-center justify-center text-white shadow-sm shadow-indigo-500/20 group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-purple-600 transition-colors">
                      {feature.tag}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-900 transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-medium text-slate-400 group-hover:text-slate-600 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Always free & client-side optimized</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
