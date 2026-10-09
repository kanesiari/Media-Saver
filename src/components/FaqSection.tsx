import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Which Instagram, Threads, and TikTok content types are supported?',
      answer:
        'MediaSave is engineered to parse public Instagram Reels, standard single-image posts, multi-slide carousels, Threads photos and videos, and TikTok MP4 videos and photo slideshows. Private account posts are strictly protected and cannot be retrieved.',
    },
    {
      question: 'Do I need an account or login to use MediaSave?',
      answer:
        'No. MediaSave is completely client-accessible. You do not need an account, password, or login session to inspect publicly shared links.',
    },
    {
      question: 'Is it free to use?',
      answer:
        'Yes, MediaSave is completely free. We do not require credit card information or subscriptions.',
    },
    {
      question: 'How do I ensure I am respecting copyright laws?',
      answer:
        'Only download media that you personally created or for which you have explicit written permission from the copyright holder. You should never repost or commercially distribute third-party content without proper authorization.',
    },
    {
      question: 'How will this application be deployed?',
      answer:
        'MediaSave is designed as a lightweight, clean frontend single-page application (SPA). It can be directly connected to GitHub and deployed within seconds on Cloudflare Pages, Vercel, or Netlify with zero server maintenance overhead.',
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-slate-50/60 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 mb-3 shadow-2xs">
            <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
            <span>Common Questions</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Everything you need to know about using MediaSave responsibly.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden transition-all shadow-2xs hover:border-slate-300"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-slate-900 hover:text-indigo-900 cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
