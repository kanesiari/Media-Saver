import React from 'react';
import { ArrowLeft, AlertCircle, RefreshCw, Lock, Trash2, ShieldAlert, Check, HelpCircle } from 'lucide-react';
import { PageRoute } from '../types';

interface TroubleshootingPageProps {
  onNavigateHome: () => void;
  onNavigate: (route: PageRoute) => void;
}

export const TroubleshootingPage: React.FC<TroubleshootingPageProps> = ({ onNavigateHome, onNavigate }) => {
  const issues = [
    {
      title: '1. "Post may be private or restricted"',
      icon: Lock,
      badge: 'Account Privacy',
      badgeColor: 'bg-amber-100 text-amber-800',
      description:
        'MediaSave operates strictly on public content. If the Instagram account, Threads profile, or TikTok user has set their privacy settings to "Private", or if the post is shared exclusively with "Close Friends", third-party public scrapers cannot access the media.',
      solution:
        'Verify that the post can be viewed in an incognito / private browser window without logging into an account. If an account login is required to view it, the post is private and cannot be downloaded.',
    },
    {
      title: '2. "Post not found or has been removed"',
      icon: Trash2,
      badge: 'Missing Content',
      badgeColor: 'bg-rose-100 text-rose-800',
      description:
        'If the original author recently deleted the post, archived the media, or changed their handle, the original URL becomes invalid (HTTP 404). In other instances, copyright or community guidelines removals cause immediate platform deletion.',
      solution:
        'Open the link in your web browser to confirm the post is still active and playable before pasting it into MediaSave.',
    },
    {
      title: '3. Shortcode Syntax or Profile-Only URLs',
      icon: AlertCircle,
      badge: 'URL Format',
      badgeColor: 'bg-indigo-100 text-indigo-800',
      description:
        'Users sometimes copy a creator\'s profile page (e.g., https://www.instagram.com/username/) rather than a direct post link (e.g., https://www.instagram.com/p/DB1eN4zOvqP/). MediaSave requires a specific post, reel, video, or photo ID.',
      solution:
        'Click directly into the individual post or video until you see the unique URL with /p/, /reel/, /post/, or /video/, then copy that link.',
    },
    {
      title: '4. Download Link Expired ("Signature Expired")',
      icon: RefreshCw,
      badge: 'CDN Token Lifetime',
      badgeColor: 'bg-blue-100 text-blue-800',
      description:
        'Media URLs from Instagram, Threads, and TikTok contain time-sensitive security signatures (such as _nc_ohc and oe parameters) that expire after a period of time. If you analyze a link and wait hours before clicking Download, the token may expire.',
      solution:
        'Click "Reset" and analyze the URL again to retrieve fresh, active CDN signatures immediately before downloading.',
    },
    {
      title: '5. Temporary Platform Rate Limiting / CAPTCHA',
      icon: ShieldAlert,
      badge: 'Platform Security',
      badgeColor: 'bg-purple-100 text-purple-800',
      description:
        'Occasionally, social media platforms implement temporary security challenges or CAPTCHA walls to mitigate automated requests from specific IP ranges.',
      solution:
        'Wait 1–2 minutes and retry. If the platform is experiencing high load or security restrictions, the official embed player will still remain functional in our preview area.',
    },
    {
      title: '6. Mobile Safari or Chrome Download Not Appearing',
      icon: HelpCircle,
      badge: 'Browser Behavior',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      description:
        'On mobile devices, clicking download transfers the binary to the browser\'s internal download manager rather than directly to the Camera Roll.',
      solution:
        'On iOS Safari, tap the download icon next to the address bar, open the downloaded MP4 or JPG, and select "Share" -> "Save Video / Save Image". On Android Chrome, check the Downloads notification or Files app.',
    },
  ];

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
        <span className="text-xs text-slate-400 font-medium">Help & Troubleshooting</span>
      </div>

      {/* Main Header */}
      <div className="mb-10 text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-xs font-semibold text-amber-800 mb-4">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Troubleshooting Guide</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight mb-4">
          Resolving Analysis & Download Issues
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
          Encountering an error while analyzing a link or downloading a file? Review the common causes and straightforward solutions below.
        </p>
      </div>

      {/* Issues list */}
      <div className="space-y-6">
        {issues.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.title}
              className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-2xs space-y-3.5 transition-all hover:border-slate-300"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">{item.title}</h2>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${item.badgeColor}`}>
                  {item.badge}
                </span>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-900 font-semibold">Recommended Fix: </strong>
                  {item.solution}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Still need help note */}
      <div className="mt-10 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-3">
        <h3 className="font-bold text-slate-900 text-base">Still Having Issues?</h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
          If you believe a completely public, active post is failing to analyze due to a technical bug, please visit our Contact page to report the issue.
        </p>
        <button
          onClick={() => onNavigate('contact')}
          className="inline-flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-slate-800 transition-colors cursor-pointer shadow-2xs"
        >
          Contact Support
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-4 text-slate-500">
          <button onClick={() => onNavigate('faq')} className="hover:text-slate-900 underline cursor-pointer">Frequently Asked Questions</button>
          <button onClick={() => onNavigate('how-to-use')} className="hover:text-slate-900 underline cursor-pointer">How to Use</button>
          <button onClick={() => onNavigate('copyright')} className="hover:text-slate-900 underline cursor-pointer">Copyright Policy</button>
        </div>
        <button
          onClick={onNavigateHome}
          className="px-4 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
        >
          Back to Downloader
        </button>
      </div>
    </div>
  );
};
