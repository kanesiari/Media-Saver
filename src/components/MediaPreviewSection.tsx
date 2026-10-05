import React, { useState, useEffect } from 'react';
import { 
  Download, 
  ExternalLink, 
  Film, 
  Info, 
  CheckCircle2, 
  RotateCcw, 
  Copy, 
  Check, 
  Lock, 
  Code2, 
  ShieldCheck, 
  AlertCircle,
  Image as ImageIcon
} from 'lucide-react';
import { AnalysisResponse, ExtractedMedia } from '../types';

interface MediaPreviewSectionProps {
  analysisData: AnalysisResponse | null;
  isLoading: boolean;
  onReset: () => void;
  onOpenLegalModal: (modal: 'terms' | 'privacy' | 'copyright') => void;
}

export const MediaPreviewSection: React.FC<MediaPreviewSectionProps> = ({
  analysisData,
  isLoading,
  onReset,
  onOpenLegalModal,
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [loadTimedOut, setLoadTimedOut] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [downloadingItemUrl, setDownloadingItemUrl] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  useEffect(() => {
    setIframeLoaded(false);
    setLoadTimedOut(false);
    setDownloadMessage(null);

    if (analysisData?.embedUrl) {
      const timer = setTimeout(() => {
        setLoadTimedOut(true);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [analysisData?.embedUrl]);

  const handleCopyUrl = () => {
    if (analysisData?.canonicalUrl) {
      navigator.clipboard.writeText(analysisData.canonicalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleCopyEmbedCode = () => {
    if (analysisData?.embedUrl) {
      const code = `<iframe src="${analysisData.embedUrl}" width="400" height="500" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`;
      navigator.clipboard.writeText(code);
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    }
  };

  const handleFileDownload = async (item: ExtractedMedia) => {
    const downloadTarget = item.downloadUrl || item.url;
    setDownloadingItemUrl(item.url);
    setDownloadMessage('Starting secure file download...');

    try {
      // Create programmatic anchor pointing to the secure streaming proxy endpoint
      const a = document.createElement('a');
      a.href = downloadTarget;
      a.download = `MediaSave_${analysisData?.platform || 'instagram'}_${analysisData?.shortcode || Date.now()}.${item.type === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setDownloadMessage('File download initiated successfully.');
    } catch {
      // Fallback
      window.open(downloadTarget, '_blank', 'noopener,noreferrer');
      setDownloadMessage('Download opened in new browser tab.');
    } finally {
      setDownloadingItemUrl(null);
      setTimeout(() => setDownloadMessage(null), 4000);
    }
  };

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* State 1: Idle / No Link Entered */}
      {!analysisData && !isLoading && (
        <div className="bg-slate-50/80 border border-dashed border-slate-300 rounded-3xl p-8 sm:p-12 text-center transition-all">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-slate-400 mb-4">
            <Film className="w-6 h-6 text-indigo-500" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
            Media Preview Workspace
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
            Enter a public post or reel link above and click <span className="font-semibold text-slate-700">&quot;Analyze URL&quot;</span>. The verified post and official live media player will appear here.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Instagram Public Posts & Reels
              </div>
              <p className="text-slate-500">Live preview streamed directly via Meta&apos;s official embed CDN player.</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Threads Public Posts
              </div>
              <p className="text-slate-500">Official embed preview for publicly shared Threads content and posts.</p>
            </div>
          </div>
        </div>
      )}

      {/* State 2: Loading State */}
      {isLoading && (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-lg animate-pulse">
          <div className="w-12 h-12 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin mx-auto mb-4" />
          <h4 className="text-base font-bold text-slate-800 mb-1">
            Analyzing Social Media Link...
          </h4>
          <p className="text-xs text-slate-500">
            Validating post shortcode syntax and connecting official CDN embed player.
          </p>
        </div>
      )}

      {/* State 3: Analysis Result Loaded */}
      {analysisData && !isLoading && (
        <div className="bg-white border border-slate-200/90 rounded-3xl shadow-lg shadow-slate-200/50 overflow-hidden transition-all animate-in fade-in duration-200">
          {/* Header Bar */}
          <div className="bg-slate-50/90 px-6 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <div>
                {analysisData.postVerified ? (
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                    Verified by Meta API
                  </span>
                ) : (
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                    URL Validated
                  </span>
                )}
                <span className="text-xs text-slate-500 ml-2">Official Live Player Rendered</span>
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
            {/* Metadata Summary Banner */}
            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide ${
                    analysisData.platform === 'instagram'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {analysisData.platform}
                  </span>
                  <span className="text-sm font-semibold text-slate-800 capitalize">
                    {analysisData.contentType} detected
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyUrl}
                    className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                    <span>{copiedLink ? 'Copied' : 'Copy URL'}</span>
                  </button>
                  <a
                    href={analysisData.canonicalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 bg-white border border-slate-200 rounded-md transition-colors flex items-center gap-1"
                  >
                    <span>View on Instagram</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

              {/* Technical Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Post Shortcode</span>
                  <span className="font-mono text-slate-800 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200/80 inline-block">
                    {analysisData.shortcode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Canonical Source</span>
                  <span className="font-mono text-slate-700 truncate block" title={analysisData.canonicalUrl}>
                    {analysisData.canonicalUrl}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Delivery Mode</span>
                  <span className="font-mono text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200/80 inline-block">
                    Official Meta Embed
                  </span>
                </div>
              </div>
            </div>

            {/* Live Media Player & Preview Container */}
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-6 bg-slate-50/40">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Official Meta Player Preview
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyEmbedCode}
                    className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 transition-colors cursor-pointer"
                  >
                    {copiedEmbed ? <Check className="w-3 h-3 text-emerald-600" /> : <Code2 className="w-3 h-3 text-slate-400" />}
                    <span>{copiedEmbed ? 'Embed Copied' : 'Embed Code'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Official Live Player Frame */}
                <div className="md:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col items-center justify-center min-h-[520px] relative">
                  {!iframeLoaded && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 z-10 p-6 text-center">
                      <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-3" />
                      <p className="text-xs font-semibold text-slate-700">Connecting to Instagram CDN...</p>
                      <p className="text-[11px] text-slate-400 mt-1">Streaming verified public content</p>
                    </div>
                  )}

                  <iframe
                    src={analysisData.embedUrl}
                    title="Instagram Live Embed"
                    className="w-full h-[520px] rounded-2xl border-0"
                    scrolling="no"
                    onLoad={() => setIframeLoaded(true)}
                    allowTransparency
                  />

                  {/* Fallback helper if embed is blank or timed out */}
                  {loadTimedOut && (
                    <div className="w-full p-2.5 bg-amber-50 border-t border-amber-200 text-amber-800 text-[11px] flex items-center justify-between">
                      <span>Post not loading? It may be private or age-restricted.</span>
                      <a
                        href={analysisData.canonicalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline text-amber-900 ml-2"
                      >
                        Open on Instagram
                      </a>
                    </div>
                  )}
                </div>

                {/* Media Actions & Technical Status */}
                <div className="md:col-span-6 space-y-4">
                  {/* Real Verified Media Downloads (if available from Meta API) */}
                  {analysisData.hasDirectDownload && analysisData.mediaList.length > 0 ? (
                    <div className="space-y-3">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Verified Media File Available</span>
                      </div>

                      <div className="space-y-2">
                        {analysisData.mediaList.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                          >
                            <div className="flex items-center gap-3">
                              {item.type === 'video' ? (
                                <Film className="w-5 h-5 text-purple-600 shrink-0" />
                              ) : (
                                <ImageIcon className="w-5 h-5 text-blue-600 shrink-0" />
                              )}
                              <div>
                                <span className="text-xs font-bold text-slate-800 block">
                                  {item.label || (item.type === 'video' ? 'Video File' : 'Photo File')}
                                </span>
                                <span className="text-[11px] text-slate-400">
                                  {item.resolution} {item.mimeType ? `· ${item.mimeType}` : ''}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleFileDownload(item)}
                              disabled={downloadingItemUrl === item.url}
                              className="px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>{downloadingItemUrl === item.url ? 'Downloading...' : 'Download'}</span>
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Video explanation if only photo was returned for a video/reel */}
                      {(analysisData.contentType === 'reel' || analysisData.contentType === 'video') &&
                        !analysisData.mediaList.some((m) => m.type === 'video') && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 space-y-1">
                          <div className="font-semibold text-slate-700 flex items-center gap-1">
                            <Info className="w-3 h-3 text-slate-500" />
                            <span>Raw Video (.mp4) Status</span>
                          </div>
                          <p>
                            Direct .mp4 video file was not found in the public stream. A high-resolution cover photo is available for download above, and the video is streaming live in the official player.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Transparent Status: When Meta API token is not yet configured */
                    <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-2xs space-y-3">
                      <div className="flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
                        <div className="space-y-1">
                          <h5 className="text-xs font-bold text-slate-900">
                            Direct Binary Download Status: Locked
                          </h5>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            While the official embed above renders the confirmed post directly from Instagram&apos;s CDN, <strong>direct raw binary downloads (.mp4 / .jpg) are strictly restricted</strong> by Meta&apos;s anti-scraping and Platform API policies.
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-500 space-y-1">
                        <div className="font-semibold text-slate-700 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>Why is direct binary download locked?</span>
                        </div>
                        <p>
                          1. Meta oEmbed API provides embed player HTML only, not raw downloadable MP4 or JPG files.<br />
                          2. Meta has deprecated the thumbnail_url field from all public oEmbed endpoints.<br />
                          3. Direct media file extraction for third-party content without account owner OAuth is restricted.
                        </p>
                      </div>

                      {/* Explicit Disabled Download Button with Clear Explanation */}
                      <div className="pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          disabled
                          className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-slate-400 bg-slate-100 border border-slate-200 cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>Direct Download Unavailable (Meta Policy Restriction)</span>
                        </button>
                        <p className="text-[11px] text-slate-400 text-center mt-2">
                          Embed streaming is live. We do not generate fake downloads or bypass security.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Feedback Message */}
                  {downloadMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in duration-150">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{downloadMessage}</span>
                    </div>
                  )}

                  {/* Diagnostic / Error Notice Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                      <span>Post Visibility Verification</span>
                    </div>
                    <p className="leading-relaxed text-[11px]">
                      If the preview player displays a blank box or &quot;This page isn&apos;t available&quot;, the post has been removed by the creator, set to private, or region-restricted by Instagram.
                    </p>
                  </div>

                  {/* Primary Working Actions */}
                  <div className="space-y-2 pt-1">
                    <a
                      href={analysisData.canonicalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm text-slate-800 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-2xs flex items-center justify-center gap-2 transition-all hover:border-slate-300"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-600" />
                      <span>Open Original Post on Instagram</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onOpenLegalModal('copyright')}
                      className="w-full py-2.5 px-3 text-xs text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Review Content Ownership & Copyright Terms</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
