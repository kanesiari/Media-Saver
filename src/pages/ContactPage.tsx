import React, { useState } from 'react';
import { ArrowLeft, Mail, MessageSquare, Send, CheckCircle2, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { PageRoute } from '../types';
import { CONTACT_EMAIL } from '../constants';

interface ContactPageProps {
  onNavigateHome: () => void;
  onNavigate: (route: PageRoute) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigateHome, onNavigate }) => {
  const [subject, setSubject] = useState('General Feedback');
  const [message, setMessage] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Administrative contact email associated with the project repository
  const contactEmail = CONTACT_EMAIL;

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    const mailtoUrl = `mailto:${contactEmail}?subject=${encodeURIComponent(`[MediaSave] ${subject}`)}&body=${encodeURIComponent(
      `From: ${senderEmail || 'Anonymous User'}\n\nMessage:\n${message}`
    )}`;
    window.location.href = mailtoUrl;
    setSubmitted(true);
  };

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
        <span className="text-xs text-slate-400 font-medium">Contact & Support</span>
      </div>

      {/* Main Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-xs font-semibold text-blue-700 mb-4">
          <Mail className="w-3.5 h-3.5" />
          <span>Get in Touch</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
          Contact Us
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
          Have feedback, found a technical bug with a public URL, or need to send a copyright inquiry? We are happy to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Contact info side */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-600" />
              Direct Email
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              You can contact the MediaSave project administrator directly via email:
            </p>
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 break-all transition-colors"
            >
              <span>{contactEmail}</span>
            </a>
            <div className="pt-2 text-[11px] text-slate-500 border-t border-slate-100 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Inquiries are reviewed manually by the site administrator.</span>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Accepted Inquiries</h3>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Bug Reports:</strong> Public posts from Instagram, Threads, or TikTok that failed to parse correctly.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Feature Suggestions:</strong> Usability or accessibility improvements.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Copyright & DMCA:</strong> Intellectual property inquiries from content rights holders.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Message composer */}
        <div className="md:col-span-7">
          <form
            onSubmit={handleSendMail}
            className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-left"
          >
            <div>
              <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                Compose Message
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                This form prepares a message in your device&apos;s default email app (<code className="font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded">mailto:</code>). We do not store or process messages on a backend server.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your Email Address (optional)
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all bg-white"
              >
                <option value="Bug Report">Technical Bug Report</option>
                <option value="General Feedback">General Feedback</option>
                <option value="Copyright/DMCA Notice">Copyright / DMCA Notice</option>
                <option value="Partnership/Advertising">Partnership / Advertising</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Message & Relevant URLs
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or paste the URL you experienced an issue with..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Launch Email Client</span>
            </button>

            {submitted && (
              <p className="text-xs text-emerald-600 text-center font-medium">
                Email composer opened. If your email app did not launch, please send directly to {contactEmail}.
              </p>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-500">
          <button onClick={() => onNavigate('about')} className="hover:text-slate-900 underline cursor-pointer">About Us</button>
          <button onClick={() => onNavigate('privacy')} className="hover:text-slate-900 underline cursor-pointer">Privacy Policy</button>
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
