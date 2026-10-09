import React from 'react';
import { ArrowLeft, Scale, AlertTriangle, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';
import { PageRoute } from '../types';
import { CONTACT_EMAIL } from '../constants';

interface CopyrightPageProps {
  onNavigateHome: () => void;
  onNavigate: (route: PageRoute) => void;
}

export const CopyrightPage: React.FC<CopyrightPageProps> = ({ onNavigateHome, onNavigate }) => {
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
        <span className="text-xs text-slate-400 font-medium">Copyright & Fair Use</span>
      </div>

      {/* Main Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700 mb-4">
          <Scale className="w-3.5 h-3.5" />
          <span>Intellectual Property</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
          Copyright Policy & DMCA Infringement Guide
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: October 2026
        </p>
      </div>

      {/* Essential Notice Callout */}
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 mb-8 space-y-2 text-sm leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-base text-amber-950">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>Essential User Requirement</span>
        </div>
        <p>
          MediaSave is strictly intended for downloading content that you personally created or for which you hold explicit written permission and authorization from the copyright holder. You must not use this tool to redistribute, monetize, or infringe upon third-party proprietary creative works.
        </p>
      </div>

      {/* Copyright Body */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/90 shadow-sm space-y-8 text-sm sm:text-base text-slate-700 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">1. Respect for Intellectual Property Rights</h2>
          <p>
            MediaSave honors the creative labor and economic rights of photographers, videographers, independent creators, and digital publishers worldwide. We respect international intellectual property principles and provide an accessible inquiry procedure for copyright holders wishing to report content concerns.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">2. Technical Nature of MediaSave</h2>
          <p>
            MediaSave functions exclusively as an automated indexing and proxy streaming utility. It does not:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-sm">
            <li>Host, store, or archive copyrighted video or photographic files on its own servers.</li>
            <li>Index private content or provide access to material protected by authentication walls.</li>
            <li>Claim ownership or transfer licenses for any third-party media passing through the browser client.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">3. Fair Use & Personal Archiving Considerations</h2>
          <p>
            Under copyright doctrines such as Fair Use (17 U.S.C. § 107 in the United States and comparable international fair dealing exemptions), individuals may reproduce portions of copyrighted materials for limited purposes such as personal backup, education, criticism, commentary, or news reporting. However, fair use determinations depend on contextual legal factors, and users bear sole responsibility for ensuring their usage conforms with local copyright laws.
          </p>
        </section>

        <section className="space-y-3 p-6 rounded-2xl bg-slate-50 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-indigo-600" />
            4. DMCA Notice & Copyright Infringement Inquiries
          </h2>
          <p className="text-sm text-slate-600">
            Because MediaSave does not host files on servers, permanent takedown of public content requires contacting the originating social media platform (Meta Platforms or ByteDance Ltd.) directly. However, if you are a copyright owner or an authorized agent and believe that our service should block or restrict specific links, please submit an inquiry with:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 text-xs sm:text-sm">
            <li>A description of the copyrighted work claimed to have been infringed.</li>
            <li>The exact URL(s) on Instagram, Threads, or TikTok in question.</li>
            <li>Your contact information (name, email address, telephone number).</li>
            <li>A statement confirming your good-faith belief that the disputed use is unauthorized.</li>
            <li>A statement made under penalty of perjury that the notification is accurate and that you are authorized to act on behalf of the owner.</li>
          </ul>
          <p className="text-xs text-slate-500 pt-2 leading-relaxed">
            Please direct copyright and DMCA-related inquiries to our administrator listed on the{' '}
            <button
              onClick={() => onNavigate('contact')}
              className="text-indigo-600 hover:text-indigo-800 underline font-semibold cursor-pointer"
            >
              Contact Page
            </button>{' '}
            or via email at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-indigo-600 hover:text-indigo-800 underline font-semibold"
            >
              {CONTACT_EMAIL}
            </a>. All submissions are reviewed manually by the site administrator upon receipt.
          </p>
        </section>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-500">
          <button onClick={() => onNavigate('terms')} className="hover:text-slate-900 underline cursor-pointer">Terms of Service</button>
          <button onClick={() => onNavigate('privacy')} className="hover:text-slate-900 underline cursor-pointer">Privacy Policy</button>
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
