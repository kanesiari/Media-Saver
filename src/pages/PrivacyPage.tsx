import React from 'react';
import { ArrowLeft, Lock, ShieldCheck, Cookie, Eye } from 'lucide-react';
import { PageRoute } from '../types';
import { CONTACT_EMAIL } from '../constants';

interface PrivacyPageProps {
  onNavigateHome: () => void;
  onNavigate: (route: PageRoute) => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onNavigateHome, onNavigate }) => {
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
        <span className="text-xs text-slate-400 font-medium">Privacy Policy</span>
      </div>

      {/* Main Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200/80 text-xs font-semibold text-purple-700 mb-4">
          <Lock className="w-3.5 h-3.5" />
          <span>Data Protection & Privacy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: October 2026
        </p>
      </div>

      {/* Privacy Body */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Commitment to User Privacy</h2>
          <p>
            MediaSave (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) is committed to protecting your online privacy. This Privacy Policy outlines what information is processed when you use our website, how that data is handled, and your options regarding cookies and advertising.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Personal Information We Do NOT Collect</h2>
          <p>
            MediaSave is engineered with privacy as a foundational principle:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm">
            <li>We do not require account registration, passwords, phone numbers, or credit card information.</li>
            <li>We do not record, log, or track your personal identity or tie your activity to a user profile.</li>
            <li>We do not maintain a permanent database storing your submitted URLs or your downloaded media files.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. How URLs and Media Are Processed</h2>
          <p>
            When you enter a URL into MediaSave, the address is analyzed transiently to extract public metadata (such as post title, author handle, and stream URLs). File downloads stream in-memory through our secure proxy with strict server-side request forgery (SSRF) controls directly to your browser. No copy of the media file is saved or cached on our servers after transmission finishes.
          </p>
        </section>

        {/* AdSense & Cookies Section */}
        <section className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-indigo-600" />
            4. Cookies and Google AdSense Advertising Disclosures
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            In accordance with Google AdSense and third-party advertising requirements, we disclose the following:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 text-xs sm:text-sm">
            <li>
              <strong>Third-Party Vendors & Google:</strong> Third-party vendors, including Google, use cookies to serve ads based on a user&apos;s prior visits to this website or other websites on the internet.
            </li>
            <li>
              <strong>Advertising Cookies:</strong> Google&apos;s use of advertising cookies enables it and its partners to serve ads to users based on their visits to our site and/or other sites across the World Wide Web.
            </li>
            <li>
              <strong>Personalized Advertising Opt-Out:</strong> Users may opt out of personalized advertising at any time by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline font-semibold"
              >
                Google Ads Settings (google.com/settings/ads)
              </a>. Alternatively, you may opt out of third-party vendor use of cookies for personalized advertising by visiting{' '}
              <a
                href="https://www.aboutads.info/choices/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline font-semibold"
              >
                aboutads.info (www.aboutads.info/choices)
              </a>.
            </li>
            <li>
              <strong>Local Storage:</strong> We use lightweight browser local storage exclusively to save your functional interface preferences (such as your chosen platform tab). This data stays strictly on your local device.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">5. External Links and Content Delivery Networks</h2>
          <p>
            MediaSave connects to publicly accessible CDN endpoints hosted by third-party services (such as Instagram, Threads, and TikTok). Once you navigate to external links or access media delivered by third-party servers, your interactions are governed by the privacy practices of those respective third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">6. Security Measures and Infrastructure Routing</h2>
          <p>
            All communications with MediaSave are encrypted in transit using standard Transport Layer Security (TLS/HTTPS). Our backend APIs validate incoming parameters and enforce strict upstream hostname allowlists to prevent unauthorized network queries and Server-Side Request Forgery (SSRF).
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            While our application codebase does not store, log, or track user IP addresses or activity histories in any database, standard network metadata (such as IP addresses and request headers) may be transiently processed at the hosting network edge (e.g., Cloudflare) for essential routing, DDoS mitigation, and firewall protection in accordance with standard infrastructure operations.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">7. Inquiries Regarding Privacy</h2>
          <p>
            If you have questions, concerns, or feedback about our Privacy Policy or data practices, you may reach out through{' '}
            <button
              onClick={() => onNavigate('contact')}
              className="text-indigo-600 hover:text-indigo-800 underline font-semibold cursor-pointer"
            >
              our Contact Page
            </button>{' '}
            or directly via email at{' '}
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
          <button onClick={() => onNavigate('terms')} className="hover:text-slate-900 underline cursor-pointer">Terms of Service</button>
          <button onClick={() => onNavigate('copyright')} className="hover:text-slate-900 underline cursor-pointer">Copyright Policy</button>
          <button onClick={() => onNavigate('faq')} className="hover:text-slate-900 underline cursor-pointer">FAQ</button>
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
