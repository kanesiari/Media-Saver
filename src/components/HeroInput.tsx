import React, { useState } from 'react';
import { Clipboard, ArrowRight, X, Sparkles, Check, AlertCircle, Link2, Instagram } from 'lucide-react';
import { Platform } from '../types';
import { SAMPLE_URLS } from '../utils/urlParser';

interface HeroInputProps {
  url: string;
  setUrl: (url: string) => void;
  onAnalyze: (urlToAnalyze?: string) => void;
  isAnalyzing: boolean;
  selectedPlatform: Platform;
  setSelectedPlatform: (p: Platform) => void;
  errorMessage: string | null;
}

export const HeroInput: React.FC<HeroInputProps> = ({
  url,
  setUrl,
  onAnalyze,
  isAnalyzing,
  selectedPlatform,
  setSelectedPlatform,
  errorMessage,
}) => {
  const [pasteSuccess, setPasteSuccess] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text.trim());
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
        } else {
          setCopyNotice('Clipboard is empty');
          setTimeout(() => setCopyNotice(null), 2500);
        }
      } else {
        setCopyNotice('Paste shortcut: Press Ctrl+V / Cmd+V');
        setTimeout(() => setCopyNotice(null), 3000);
      }
    } catch {
      setCopyNotice('Please press Ctrl+V / Cmd+V to paste');
      setTimeout(() => setCopyNotice(null), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAnalyze();
    }
  };

  const handleSampleClick = (sampleUrl: string, platform: Platform) => {
    setUrl(sampleUrl);
    setSelectedPlatform(platform);
    onAnalyze(sampleUrl);
  };

  return (
    <section id="media-input-section" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Subtle Background Glow Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 blur-3xl -z-10">
        <div className="w-[500px] h-[300px] bg-gradient-to-tr from-blue-400/30 to-purple-500/30 rounded-full mx-auto" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle Top Kicker */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700 mb-6 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 animate-pulse" />
          <span>Fast, Clean & Privacy-Oriented Media Utility</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-5 text-balance">
          Save Public Media{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            in One Place
          </span>
        </h1>

        {/* Short Service Intro */}
        <p className="text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-10 font-normal">
          Inspect, preview, and organize publicly shared photos, reels, and video posts from Instagram, Threads, and TikTok with modern simplicity.
        </p>

        {/* Platform Selector Tabs */}
        <div className="inline-flex p-1 bg-slate-100/80 rounded-xl mb-6 border border-slate-200/70 shadow-xs">
          <button
            type="button"
            onClick={() => setSelectedPlatform('all')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
              selectedPlatform === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Platforms
          </button>
          <button
            type="button"
            onClick={() => setSelectedPlatform('instagram')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPlatform === 'instagram'
                ? 'bg-white text-purple-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600" />
            Instagram
          </button>
          <button
            type="button"
            onClick={() => setSelectedPlatform('threads')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPlatform === 'threads'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            Threads
          </button>
          <button
            type="button"
            onClick={() => setSelectedPlatform('tiktok')}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedPlatform === 'tiktok'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            TikTok
          </button>
        </div>

        {/* Main Input Card */}
        <div className="bg-white rounded-2xl p-2 sm:p-3 shadow-xl shadow-slate-200/60 border border-slate-200/90 transition-all hover:border-slate-300 focus-within:ring-2 focus-within:ring-purple-500/20 focus-within:border-purple-500 text-left">
          <div className="flex flex-col md:flex-row items-stretch gap-2">
            {/* Input & embedded action buttons */}
            <div className="relative flex-1 flex items-center">
              <div className="absolute left-3.5 text-slate-400 pointer-events-none">
                <Link2 className="w-5 h-5" />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  selectedPlatform === 'instagram'
                    ? 'Paste Instagram link (e.g. https://instagram.com/reel/C...)'
                    : selectedPlatform === 'threads'
                    ? 'Paste Threads link (e.g. https://threads.net/@user/post/...)'
                    : 'Paste Instagram or Threads public link here...'
                }
                className="w-full pl-11 pr-24 py-3.5 sm:py-4 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none"
              />

              {/* Paste & Clear quick actions inside input */}
              <div className="absolute right-2 flex items-center gap-1">
                {url && (
                  <button
                    type="button"
                    onClick={() => setUrl('')}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handlePaste}
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Paste from clipboard"
                >
                  {pasteSuccess ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Pasted</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                      <span>Paste</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Analyze URL Button */}
            <button
              type="button"
              onClick={() => onAnalyze()}
              disabled={isAnalyzing}
              className="px-6 py-3.5 sm:py-4 rounded-xl font-semibold text-sm sm:text-base text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-[0.99] transition-all shadow-md shadow-purple-500/25 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Analyzing URL...</span>
                </>
              ) : (
                <>
                  <span>Analyze URL</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Copy notice tooltip */}
          {copyNotice && (
            <p className="mt-2 text-xs text-amber-700 px-3 py-1 bg-amber-50 rounded-md border border-amber-200/60 inline-block">
              {copyNotice}
            </p>
          )}
        </div>

        {/* Error Message if Validation Fails */}
        {errorMessage && (
          <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200/80 rounded-xl text-rose-800 text-sm flex items-start gap-2.5 text-left animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
            <div className="flex-1">
              <span className="font-semibold">Unable to analyze link:</span> {errorMessage}
            </div>
            <button
              type="button"
              onClick={() => onAnalyze('')}
              className="text-rose-500 hover:text-rose-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Sample Links for 1-Click Testing */}
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
          <span className="font-medium text-slate-400">Quick Test Links:</span>
          {SAMPLE_URLS.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => handleSampleClick(sample.url, sample.platform)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-purple-600 transition-colors shadow-2xs cursor-pointer"
            >
              <span>{sample.label}</span>
              <span className="text-[10px] text-slate-400 font-mono">sample</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
