import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, AlertTriangle } from 'lucide-react';
import { PageRoute } from '../types';
import { CONTACT_EMAIL } from '../constants';

interface TermsPageProps {
  onNavigateHome: () => void;
  onNavigate: (route: PageRoute) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigateHome, onNavigate }) => {
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
        <span className="text-xs text-slate-400 font-medium">Terms of Service</span>
      </div>

      {/* Main Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-4">
          <FileText className="w-3.5 h-3.5 text-indigo-600" />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: October 2026
        </p>
      </div>

      {/* Terms Body */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the MediaSave website and service (&quot;MediaSave&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you confirm that you have read, understood, and agreed to be bound by these Terms of Service. If you do not agree to these terms in their entirety, you must discontinue your use of MediaSave immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Description of Service</h2>
          <p>
            MediaSave provides a web-based client utility that inspects publicly accessible URLs from supported platforms (including Instagram, Threads, and TikTok) and retrieves publicly distributed media stream references. MediaSave does not host, upload, permanently store, or license media files. All streams originate directly from the third-party platforms&apos; content delivery networks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Permitted and Lawful Use</h2>
          <p>
            You agree to use MediaSave exclusively for lawful, personal purposes. Specifically:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm">
            <li>You may only download or archive media content that you personally created, hold ownership over, or have received explicit written permission and authorization from the intellectual property owner to save.</li>
            <li>You agree not to use the service for mass copyright infringement, unauthorized commercial redistribution, or automated data harvesting.</li>
            <li>You agree not to attempt to bypass technological access control measures or private account restrictions.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">4. Third-Party Platforms and Trademarks</h2>
          <p>
            MediaSave is an independent web application. MediaSave is not affiliated with, endorsed by, sponsored by, or partner of Meta Platforms, Inc., Instagram, Threads, ByteDance Ltd., TikTok, or any of their respective affiliates. All platform names, logos, and trademarks mentioned on this website belong exclusively to their respective owners.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">5. Disclaimer of Warranties</h2>
          <p>
            The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis, without warranties of any kind, whether express, statutory, or implied, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement. We do not guarantee uninterrupted availability, error-free operation, or continued compatibility with third-party platform changes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">6. Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by applicable law, in no event shall MediaSave, its developers, or its contributors be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of or inability to use the service, including any user actions that infringe third-party intellectual property rights.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">7. Changes to Terms</h2>
          <p>
            We reserve the right to revise and update these Terms of Service at any time. Any changes will become effective immediately upon posting to this page with an updated &quot;Last Updated&quot; date.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">8. Inquiries Regarding Terms</h2>
          <p>
            If you have questions regarding these Terms of Service, please reach out via{' '}
            <button
              onClick={() => onNavigate('contact')}
              className="text-indigo-600 hover:text-indigo-800 underline font-semibold cursor-pointer"
            >
              our Contact Page
            </button>{' '}
            or directly by email to{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-600 hover:text-indigo-800 underline font-semibold"
            >
              {CONTACT_EMAIL}
            </a>.
          </p>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-500">
          <button onClick={() => onNavigate('privacy')} className="hover:text-slate-900 underline cursor-pointer">Privacy Policy</button>
          <button onClick={() => onNavigate('copyright')} className="hover:text-slate-900 underline cursor-pointer">Copyright Policy</button>
          <button onClick={() => onNavigate('contact')} className="hover:text-slate-900 underline cursor-pointer">Contact Us</button>
        </div>
        <button
          onClick={onNavigateHome}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Return to Downloader
        </button>
      </div>
    </div>
  );
};
