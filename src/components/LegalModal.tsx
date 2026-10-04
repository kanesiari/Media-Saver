import React from 'react';
import { X, ShieldCheck, Scale, Lock, FileText, ExternalLink } from 'lucide-react';
import { LegalModalType } from '../types';

interface LegalModalProps {
  activeModal: LegalModalType;
  onClose: () => void;
  onSelectModal: (modal: LegalModalType) => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  activeModal,
  onClose,
  onSelectModal,
}) => {
  if (!activeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeModal === 'terms' && <FileText className="w-5 h-5 text-indigo-600" />}
            {activeModal === 'privacy' && <Lock className="w-5 h-5 text-purple-600" />}
            {activeModal === 'copyright' && <Scale className="w-5 h-5 text-blue-600" />}
            <h3 className="text-lg font-bold text-slate-900">
              {activeModal === 'terms' && 'Terms of Service'}
              {activeModal === 'privacy' && 'Privacy Policy'}
              {activeModal === 'copyright' && 'Copyright & Intellectual Property Notice'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs">
          <button
            onClick={() => onSelectModal('terms')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeModal === 'terms' ? 'bg-white text-indigo-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terms of Service
          </button>
          <button
            onClick={() => onSelectModal('privacy')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeModal === 'privacy' ? 'bg-white text-purple-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => onSelectModal('copyright')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
              activeModal === 'copyright' ? 'bg-white text-blue-700 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Copyright Notice
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 leading-relaxed">
          {activeModal === 'terms' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">1. Acceptance of Terms</h4>
                <p>
                  By accessing and using MediaSave, you agree to comply with and be bound by these Terms of Service. If you do not agree, please discontinue using the tool immediately.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">2. Scope of Service</h4>
                <p>
                  MediaSave is provided as a client-side media inspector for publicly accessible URLs. MediaSave does not host, store, or republish copyrighted media content on any private servers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">3. Permitted Usage</h4>
                <p>
                  Users may use this application strictly for lawful purposes, such as archiving content they own or hold explicit written authorization to store and view offline. Any unauthorized commercial redistribution or automated scraping in violation of third-party terms is prohibited.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">4. Disclaimer of Warranties</h4>
                <p>
                  The service is provided on an &quot;as is&quot; and &quot;as available&quot; basis without warranties of any kind. MediaSave is an independent web application and is not affiliated with, endorsed by, or sponsored by Instagram, Threads, or Meta Platforms, Inc.
                </p>
              </div>
            </div>
          )}

          {activeModal === 'privacy' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-slate-900 mb-1">1. Zero User Tracking & No Log Policy</h4>
                <p>
                  MediaSave is committed to user privacy. We do not require account registration, passwords, social logins, or personal contact details.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">2. URL Processing</h4>
                <p>
                  URLs pasted into the input field are processed in your browser client. We do not maintain a permanent database recording your browsing patterns or requested links.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">3. Cookies and Local Storage</h4>
                <p>
                  MediaSave does not deploy third-party advertising cookies or cross-site tracking pixels. Local browser preferences (such as platform selection) may be retained locally in your browser session for usability.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">4. Third-Party Links</h4>
                <p>
                  Media links point to public content distributed via content delivery networks. When accessing external links, you are subject to the privacy policies of the corresponding platforms.
                </p>
              </div>
            </div>
          )}

          {activeModal === 'copyright' && (
            <div className="space-y-4">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
                <span className="font-bold block mb-1">Essential Compliance Notice:</span>
                Users must only download or save media that they directly own or hold explicit authorization and legal permission from the copyright owner to store and utilize.
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">1. Intellectual Property Respect</h4>
                <p>
                  All trademarks, logos, content, and copyrights belong to their respective owners. MediaSave honors and respects the intellectual property rights of content creators, photographers, videographers, and publishers worldwide.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">2. User Responsibility</h4>
                <p>
                  You are solely responsible for verifying the legal copyright status of any content you choose to inspect or download. You must not use MediaSave to infringe copyright, distribute proprietary works without consent, or bypass technological protection measures.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-1">3. DMCA & Notice of Infringement</h4>
                <p>
                  Because MediaSave does not host, upload, or store media files on its servers, removing public media requires contacting the originating platform or host directly. If you believe any aspect of our service inadvertently infringes your rights, please reach out with details.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
