import React, { useState } from 'react';
import { 
  Play, 
  Download, 
  ExternalLink, 
  Layers, 
  Image as ImageIcon, 
  Film, 
  Info, 
  CheckCircle2, 
  RotateCcw, 
  Sliders, 
  Sparkles,
  Music,
  Copy,
  Check,
  Eye,
  FileCode
} from 'lucide-react';
import { ParsedUrlData } from '../types';

interface MediaPreviewSectionProps {
  parsedData: ParsedUrlData | null;
  onReset: () => void;
  onOpenLegalModal: (modal: 'terms' | 'privacy' | 'copyright') => void;
}

export const MediaPreviewSection: React.FC<MediaPreviewSectionProps> = ({
  parsedData,
  onReset,
  onOpenLegalModal,
}) => {
  const [showLayoutSpec, setShowLayoutSpec] = useState(false);
  const [simulatedSlide, setSimulatedSlide] = useState(1);
  const [downloadFeedback, setDownloadFeedback] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleSimulatedDownload = (resolution: string) => {
    setDownloadFeedback(`Action registered: "${resolution}" stream. Note: External extraction API will serve this file in Phase 2.`);
    setTimeout(() => setDownloadFeedback(null), 4000);
  };

  const handleCopyLink = () => {
    if (parsedData?.rawUrl) {
      navigator.clipboard.writeText(parsedData.rawUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* State 1: Before URL Input / No Valid Post Analyzed */}
      {!parsedData || !parsedData.isValid ? (
        <div className="bg-slate-50/80 border border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center transition-all">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-400 mb-4">
            <Film className="w-6 h-6 text-indigo-500" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
            Media Preview Workspace
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
            Enter a public post or reel link above and click <span className="font-semibold text-slate-700">"Analyze URL"</span>. The detected media assets and resolution options will appear here for inspection.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Instagram Public Media
              </div>
              <p className="text-slate-500">Supports standard posts, Reels, and multi-image carousels from public accounts.</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Threads Public Media
              </div>
              <p className="text-slate-500">Supports high-res photographs, single videos, and media threads from public creators.</p>
            </div>
          </div>
        </div>
      ) : (
        /* State 2: URL Parsed and Validated */
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="bg-slate-50/90 px-6 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                  URL Validated
                </span>
                <span className="text-xs text-slate-500 ml-2">Phase 1 UI Ready</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReset}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Parsed Metadata Breakdown */}
            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${
                    parsedData.platform === 'instagram'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {parsedData.platform}
                  </span>
                  <span className="text-sm font-semibold text-slate-800 capitalize">
                    {parsedData.contentType} detected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
                  </button>
                  <a
                    href={parsedData.rawUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-md transition-colors flex items-center gap-1"
                  >
                    <span>Open Link</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Technical Inspection Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Target Link</span>
                  <span className="font-mono text-slate-700 truncate block" title={parsedData.rawUrl}>
                    {parsedData.rawUrl}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Content Identifier</span>
                  <span className="font-mono text-slate-800 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200/80 inline-block">
                    {parsedData.id || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Author / Handle</span>
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200/80 inline-block">
                    {parsedData.author ? `@${parsedData.author}` : 'Public Creator'}
                  </span>
                </div>
              </div>
            </div>

            {/* Architecture Notice (Strictly transparent about no fake scraped data) */}
            <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-blue-50/70 via-indigo-50/60 to-purple-50/70 border border-blue-200/70 text-slate-700 text-sm">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-white shadow-2xs text-blue-600 shrink-0 mt-0.5">
                  <Info className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Frontend Extraction Target Confirmed</span>
                    <span className="text-[11px] font-normal px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Cloudflare Pages Ready
                    </span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    This step validates the URL structure and client state. In accordance with this phase&apos;s requirements, no external scraping API or database is triggered. The container below illustrates how media cards and download triggers are structured once your extraction worker is attached.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowLayoutSpec(!showLayoutSpec)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg shadow-2xs transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-purple-600" />
                      <span>{showLayoutSpec ? 'Hide Media Layout Spec' : 'Preview Media Layout Spec & Actions'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenLegalModal('copyright')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-transparent hover:bg-white/80 px-2 py-1 rounded transition-colors cursor-pointer"
                    >
                      <span>Review Content Ownership Rules</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Download Notification */}
            {downloadFeedback && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs sm:text-sm text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{downloadFeedback}</span>
              </div>
            )}

            {/* Media Layout Architecture Box */}
            <div className="border border-slate-200 rounded-2xl p-5 sm:p-6 bg-slate-50/40">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-slate-800">
                    {showLayoutSpec ? 'Interactive Media Layout Spec' : 'Media Render Container (Placeholder Frame)'}
                  </h4>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  Container: #media-preview-root
                </span>
              </div>

              {/* If user toggled layout spec, render the comprehensive interactive wireframe */}
              {showLayoutSpec ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {/* Media Display Aspect Box */}
                    <div className="md:col-span-5 bg-slate-900 rounded-2xl overflow-hidden shadow-inner aspect-[4/5] relative flex flex-col justify-between p-4 text-white">
                      <div className="flex items-center justify-between z-10">
                        <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-black/60 backdrop-blur-md rounded uppercase text-slate-200">
                          {parsedData.platform} {parsedData.contentType}
                        </span>
                        <span className="text-[11px] font-medium bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-slate-300">
                          Slide {simulatedSlide} / 3
                        </span>
                      </div>

                      {/* Center Graphic */}
                      <div className="my-auto text-center space-y-3">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mx-auto flex items-center justify-center text-white shadow-lg cursor-pointer hover:scale-105 transition-transform"
                             onClick={() => handleSimulatedDownload('Standard Video Preview')}>
                          <Play className="w-7 h-7 fill-white translate-x-0.5" />
                        </div>
                        <p className="text-xs text-slate-300 font-medium px-4">
                          HD Stream Preview (1080×1350)
                        </p>
                      </div>

                      {/* Carousel Slide Indicators */}
                      <div className="flex items-center justify-center gap-1.5 z-10 pt-2">
                        {[1, 2, 3].map((slide) => (
                          <button
                            key={slide}
                            type="button"
                            onClick={() => setSimulatedSlide(slide)}
                            className={`h-1.5 rounded-full transition-all cursor-pointer ${
                              simulatedSlide === slide ? 'w-6 bg-white' : 'w-2 bg-white/40'
                            }`}
                            aria-label={`Slide ${slide}`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Media Metadata & Download Controls */}
                    <div className="md:col-span-7 space-y-4">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-purple-600 mb-1">
                          Media Specifications
                        </div>
                        <h5 className="text-base font-bold text-slate-900 leading-snug">
                          {parsedData.contentType === 'reel' ? 'High-Bitrate Vertical Reel' : 'Public Carousel & Media Set'}
                        </h5>
                        <p className="text-xs text-slate-500 mt-1">
                          Calculated aspect ratio 4:5 / 9:16. Includes MP4 video and multi-resolution JPEG/WebP streams.
                        </p>
                      </div>

                      {/* Resolution Selector Options */}
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-700 block">
                          Available Output Formats (Preview)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => handleSimulatedDownload('1080p Full HD (MP4)')}
                            className="p-3 text-left rounded-xl border border-purple-200 bg-purple-50/50 hover:bg-purple-100/60 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-bold text-purple-900">1080p Full HD</span>
                              <span className="text-[10px] font-mono text-purple-700 bg-white px-1.5 py-0.5 rounded border border-purple-200">
                                MP4
                              </span>
                            </div>
                            <span className="text-[11px] text-purple-700/80 block">Original stream quality</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSimulatedDownload('720p HD Compact (MP4)')}
                            className="p-3 text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-bold text-slate-800">720p HD</span>
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                Fast
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block">Optimized file size</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSimulatedDownload('Original Audio Stream (M4A)')}
                            className="p-3 text-left rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer group sm:col-span-2"
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                <Music className="w-3.5 h-3.5 text-blue-600" />
                                Audio Track Only
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                M4A / 320kbps
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 block">Extract soundtrack with copyright authorization</span>
                          </button>
                        </div>
                      </div>

                      {/* Download Action Trigger */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleSimulatedDownload('1080p Primary')}
                          className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.99]"
                        >
                          <Download className="w-4 h-4" />
                          <span>Simulate Download Trigger</span>
                        </button>
                        <p className="text-[11px] text-slate-400 text-center mt-2">
                          Downloads are subject to our Copyright Notice. Only download content you own or have permission to save.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Compact Placeholder Frame */
                <div className="py-8 px-4 text-center bg-white rounded-xl border border-slate-200/80">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                    <ImageIcon className="w-6 h-6 text-slate-500" />
                  </div>
                  <h5 className="text-sm font-semibold text-slate-800 mb-1">
                    Waiting for Extraction API Hook
                  </h5>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                    The URL syntax for <span className="font-mono text-slate-700 font-semibold">{parsedData.id}</span> is verified. The designated media player and resolution options will mount here upon API connection.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowLayoutSpec(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Expand Component Layout Wireframe</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
