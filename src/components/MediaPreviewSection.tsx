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
  CheckSquare,
  Square,
  Layers,
  Loader2,
  ArrowDownToLine,
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
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);
  const [selectedQualityByItem, setSelectedQualityByItem] = useState<Record<number, string>>({});
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [isBatchDownloading, setIsBatchDownloading] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{
    current: number;
    total: number;
    successCount: number;
    failCount: number;
  } | null>(null);

  // Per-item independent download states to prevent state sharing and closures bugs
  type ItemDownloadState = 'idle' | 'downloading' | 'completed' | 'started' | 'error';
  const [downloadStates, setDownloadStates] = useState<Record<number, ItemDownloadState>>({});
  const [downloadErrors, setDownloadErrors] = useState<Record<number, string>>({});

  useEffect(() => {
    setIframeLoaded(false);
    setLoadTimedOut(false);
    setDownloadMessage(null);
    setSelectedQualityByItem({});
    setIsBatchDownloading(false);
    setBatchProgress(null);
    setDownloadStates({});
    setDownloadErrors({});

    if (analysisData?.mediaList && analysisData.mediaList.length > 0) {
      setSelectedIndices(new Set(analysisData.mediaList.map((_, i) => i)));
    } else {
      setSelectedIndices(new Set());
    }

    if (analysisData?.embedUrl) {
      const timer = setTimeout(() => {
        setLoadTimedOut(true);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [analysisData?.embedUrl, analysisData?.mediaList]);

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

  const handleSelectAll = () => {
    if (!analysisData?.mediaList) return;
    setSelectedIndices(new Set(analysisData.mediaList.map((_, i) => i)));
  };

  const handleDeselectAll = () => {
    setSelectedIndices(new Set());
  };

  const toggleSelectItem = (index: number) => {
    setSelectedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const downloadSingleBlob = async (targetUrl: string, filename: string): Promise<boolean> => {
    const response = await fetch(targetUrl);
    if (!response.ok) {
      let errMsg = `HTTP ${response.status} 오류`;
      try {
        const errJson = await response.json();
        if (errJson?.error) errMsg = `HTTP ${response.status}: ${errJson.error}`;
      } catch {
        // ignore
      }
      const httpErr = new Error(errMsg);
      (httpErr as any).isHttpError = true;
      (httpErr as any).status = response.status;
      throw httpErr;
    }

    const contentType = (response.headers.get('content-type') || '').toLowerCase();
    // Reject HTML error pages or JSON payloads masquerading as success
    if (contentType.includes('text/html')) {
      throw new Error('서버가 미디어 파일 대신 HTML 오류 페이지를 반환했습니다.');
    }
    if (contentType.includes('application/json')) {
      let errMsg = '서버가 오류 메시지를 반환했습니다.';
      try {
        const json = await response.json();
        if (json?.error) errMsg = json.error;
      } catch {
        // ignore
      }
      throw new Error(errMsg);
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) {
      throw new Error('수신된 파일의 크기가 0바이트입니다.');
    }

    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      try {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(objectUrl);
      } catch {
        // ignore
      }
    }, 1200);
    return true;
  };

  const handleFileDownload = async (item: ExtractedMedia, itemIndex: number) => {
    const slideNum = item.slideIndex || itemIndex + 1;
    const ext = item.type === 'video' ? 'mp4' : 'jpg';
    const defaultFilename = `MediaSave_${analysisData?.platform || 'instagram'}_${analysisData?.shortcode || Date.now()}_slide_${slideNum}.${ext}`;

    // Resolve target stream URL
    let rawUrl = item.url;
    if (item.type === 'video' && item.qualityOptions && item.qualityOptions.length > 0) {
      const selectedId = selectedQualityByItem[itemIndex] || item.qualityOptions[0].id;
      const matched = item.qualityOptions.find((q) => q.id === selectedId) || item.qualityOptions[0];
      rawUrl = matched.url;
    }

    // Always route through /api/download proxy to avoid CORS errors on third-party CDNs
    let downloadTarget = item.downloadUrl;
    if (!downloadTarget || !downloadTarget.startsWith('/api/download')) {
      downloadTarget = `/api/download?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(defaultFilename)}`;
    }

    setDownloadStates((prev) => ({ ...prev, [itemIndex]: 'downloading' }));
    setDownloadErrors((prev) => {
      const copy = { ...prev };
      delete copy[itemIndex];
      return copy;
    });
    setDownloadMessage(`항목 #${slideNum} 다운로드 준비 중...`);

    try {
      await downloadSingleBlob(downloadTarget, defaultFilename);
      setDownloadStates((prev) => ({ ...prev, [itemIndex]: 'completed' }));
      setDownloadMessage(`항목 #${slideNum} 파일이 성공적으로 다운로드되었습니다!`);
      setTimeout(() => {
        setDownloadStates((prev) => (prev[itemIndex] === 'completed' ? { ...prev, [itemIndex]: 'idle' } : prev));
      }, 3500);
    } catch (err: any) {
      console.warn(`Direct blob download failed for slide #${slideNum}:`, err);
      const errMessage = String(err?.message || '');
      const isExplicitServerError =
        Boolean(err?.isHttpError) ||
        errMessage.includes('HTTP') ||
        errMessage.includes('HTML') ||
        errMessage.includes('서버') ||
        errMessage.includes('MIME') ||
        errMessage.includes('0바이트') ||
        errMessage.includes('400') ||
        errMessage.includes('403') ||
        errMessage.includes('500') ||
        errMessage.includes('502');

      if (isExplicitServerError) {
        // Explicit 4xx, 5xx, or format error from server: NEVER mark completed or started!
        setDownloadStates((prev) => ({ ...prev, [itemIndex]: 'error' }));
        setDownloadErrors((prev) => ({ ...prev, [itemIndex]: err?.message || '다운로드 실패' }));
        setDownloadMessage(`항목 #${slideNum} 다운로드 실패: ${err?.message || '서버 오류'}`);
        setTimeout(() => {
          setDownloadStates((prev) => (prev[itemIndex] === 'error' ? { ...prev, [itemIndex]: 'idle' } : prev));
        }, 4000);
      } else {
        // Network/CORS fallback: try browser native anchor navigation
        try {
          const fallbackA = document.createElement('a');
          fallbackA.style.display = 'none';
          fallbackA.href = downloadTarget;
          fallbackA.download = defaultFilename;
          fallbackA.target = '_blank';
          document.body.appendChild(fallbackA);
          fallbackA.click();
          setTimeout(() => {
            if (document.body.contains(fallbackA)) document.body.removeChild(fallbackA);
          }, 1000);

          // DO NOT mark completed! Use 'started' to clearly notify user that local save cannot be verified
          setDownloadStates((prev) => ({ ...prev, [itemIndex]: 'started' }));
          setDownloadMessage(`항목 #${slideNum} 브라우저 다운로드를 요청했습니다. (저장 완료 여부는 확인할 수 없습니다)`);
          setTimeout(() => {
            setDownloadStates((prev) => (prev[itemIndex] === 'started' ? { ...prev, [itemIndex]: 'idle' } : prev));
          }, 4000);
        } catch {
          setDownloadStates((prev) => ({ ...prev, [itemIndex]: 'error' }));
          setDownloadErrors((prev) => ({ ...prev, [itemIndex]: err?.message || '다운로드 실패' }));
          setDownloadMessage(`항목 #${slideNum} 다운로드 실패: ${err?.message || '네트워크 오류'}`);
          setTimeout(() => {
            setDownloadStates((prev) => (prev[itemIndex] === 'error' ? { ...prev, [itemIndex]: 'idle' } : prev));
          }, 4000);
        }
      }
    } finally {
      // Safety guarantee: only resets UI loading indication if stuck in downloading, NEVER disguises as completed or cancels download
      setTimeout(() => {
        setDownloadStates((prev) => (prev[itemIndex] === 'downloading' ? { ...prev, [itemIndex]: 'idle' } : prev));
      }, 5000);
      setTimeout(() => setDownloadMessage(null), 5000);
    }
  };

  const handleBatchDownload = async () => {
    if (!analysisData?.mediaList || selectedIndices.size === 0 || isBatchDownloading) return;

    const indicesToDownload = Array.from(selectedIndices).sort((a, b) => a - b);
    setIsBatchDownloading(true);
    let successCount = 0;
    let fallbackCount = 0;
    let failCount = 0;

    setBatchProgress({
      current: 0,
      total: indicesToDownload.length,
      successCount: 0,
      failCount: 0,
    });
    setDownloadMessage(`총 ${indicesToDownload.length}개 파일 일괄 다운로드를 시작합니다...`);

    for (let i = 0; i < indicesToDownload.length; i++) {
      const idx = indicesToDownload[i];
      const item = analysisData.mediaList[idx];
      if (!item) continue;

      const slideNum = item.slideIndex || idx + 1;
      const ext = item.type === 'video' ? 'mp4' : 'jpg';
      const filename = `MediaSave_${analysisData.platform || 'instagram'}_${analysisData.shortcode || Date.now()}_slide_${slideNum}.${ext}`;

      let rawUrl = item.url;
      if (item.type === 'video' && item.qualityOptions && item.qualityOptions.length > 0) {
        const selectedId = selectedQualityByItem[idx] || item.qualityOptions[0].id;
        const matched = item.qualityOptions.find((q) => q.id === selectedId) || item.qualityOptions[0];
        rawUrl = matched.url;
      }

      let downloadTarget = item.downloadUrl;
      if (!downloadTarget || !downloadTarget.startsWith('/api/download')) {
        downloadTarget = `/api/download?url=${encodeURIComponent(rawUrl)}&filename=${encodeURIComponent(filename)}`;
      }

      setBatchProgress({
        current: i + 1,
        total: indicesToDownload.length,
        successCount,
        failCount,
      });
      setDownloadStates((prev) => ({ ...prev, [idx]: 'downloading' }));
      setDownloadMessage(`다운로드 진행 중 (${i + 1}/${indicesToDownload.length}): 슬라이드 #${slideNum}...`);

      try {
        await downloadSingleBlob(downloadTarget, filename);
        successCount++;
        setDownloadStates((prev) => ({ ...prev, [idx]: 'completed' }));
      } catch (err: any) {
        console.warn(`Failed to download slide ${slideNum}:`, err);
        const errMessage = String(err?.message || '');
        const isExplicitServerError =
          errMessage.includes('HTTP') ||
          errMessage.includes('HTML') ||
          errMessage.includes('서버') ||
          errMessage.includes('MIME') ||
          errMessage.includes('0바이트') ||
          errMessage.includes('400') ||
          errMessage.includes('403') ||
          errMessage.includes('500');

        if (isExplicitServerError) {
          failCount++;
          setDownloadStates((prev) => ({ ...prev, [idx]: 'error' }));
        } else {
          // Fallback: direct anchor navigation
          try {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadTarget;
            a.download = filename;
            a.target = '_blank';
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              if (document.body.contains(a)) document.body.removeChild(a);
            }, 1000);
            // Count as fallback / started, NOT verified success!
            fallbackCount++;
            setDownloadStates((prev) => ({ ...prev, [idx]: 'started' }));
          } catch {
            failCount++;
            setDownloadStates((prev) => ({ ...prev, [idx]: 'error' }));
          }
        }
      }

      setBatchProgress({
        current: i + 1,
        total: indicesToDownload.length,
        successCount,
        failCount,
      });

      // Throttle interval between consecutive browser downloads to prevent browser drops
      if (i < indicesToDownload.length - 1) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    setIsBatchDownloading(false);
    if (failCount === 0 && fallbackCount === 0) {
      setDownloadMessage(`일괄 다운로드 완료! 총 ${successCount}개 파일이 성공적으로 저장되었습니다.`);
    } else if (fallbackCount > 0) {
      setDownloadMessage(`일괄 다운로드 처리: ${successCount}개 확인 완료, ${fallbackCount}개 브라우저 위임(확인 불가)${failCount > 0 ? `, ${failCount}개 실패` : ''}.`);
    } else {
      setDownloadMessage(`일괄 다운로드 완료: ${successCount}개 성공, ${failCount}개 실패.`);
    }
    setTimeout(() => {
      setBatchProgress(null);
      setTimeout(() => setDownloadMessage(null), 3000);
    }, 4000);
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left text-xs">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                Instagram Posts & Reels
              </div>
              <p className="text-slate-500">Live preview and direct high-resolution video and photo download.</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Threads Posts
              </div>
              <p className="text-slate-500">Public Threads photos, single videos, and multi-slide carousels.</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                TikTok Videos & Slides
              </div>
              <p className="text-slate-500">Public TikTok MP4 videos and high-res photo slideshow extraction.</p>
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
                    {analysisData.platform === 'tiktok' ? 'Verified TikTok Post' : 'Verified by Meta API'}
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
                      : analysisData.platform === 'threads'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-slate-900 text-white'
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
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>
                            {analysisData.mediaList.length > 1
                              ? `Verified Carousel Media (${analysisData.mediaList.length} Files)`
                              : 'Verified Media File Available'}
                          </span>
                        </div>

                        {analysisData.mediaList.length > 1 && (
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            동영상 {analysisData.mediaList.filter((m) => m.type === 'video').length} · 사진 {analysisData.mediaList.filter((m) => m.type === 'image').length}
                          </span>
                        )}
                      </div>

                      {/* Carousel Batch Control Bar (When multiple items exist) */}
                      {analysisData.mediaList.length > 1 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Layers className="w-4 h-4 text-purple-600 shrink-0" />
                              <span className="text-xs font-bold text-slate-800">
                                캐러셀 일괄 다운로드
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={handleSelectAll}
                                disabled={isBatchDownloading}
                                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                전체 선택
                              </button>
                              <button
                                type="button"
                                onClick={handleDeselectAll}
                                disabled={isBatchDownloading}
                                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              >
                                전체 해제
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-2 border-t border-slate-200/80">
                            <span className="text-xs text-slate-600">
                              선택: <strong className="text-purple-600 font-bold">{selectedIndices.size}</strong> / {analysisData.mediaList.length}개 항목
                            </span>

                            <button
                              type="button"
                              onClick={handleBatchDownload}
                              disabled={selectedIndices.size === 0 || isBatchDownloading}
                              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
                            >
                              {isBatchDownloading ? (
                                <>
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  <span>다운로드 중 ({batchProgress ? `${batchProgress.current}/${batchProgress.total}` : ''})...</span>
                                </>
                              ) : (
                                <>
                                  <ArrowDownToLine className="w-3.5 h-3.5" />
                                  <span>선택 항목 일괄 다운로드 ({selectedIndices.size}개)</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Batch Progress Bar */}
                          {batchProgress && (
                            <div className="space-y-1.5 pt-1">
                              <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium">
                                <span>진행: {batchProgress.current} / {batchProgress.total}</span>
                                <span>성공 {batchProgress.successCount}개{batchProgress.failCount > 0 ? `, 실패 ${batchProgress.failCount}개` : ''}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-purple-600 transition-all duration-300"
                                  style={{ width: `${(batchProgress.current / batchProgress.total) * 100}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Items List (Carousel / Individual Cards) */}
                      <div className="space-y-4">
                        {analysisData.mediaList.map((item, idx) => {
                          const slideNum = item.slideIndex || idx + 1;
                          const isSelected = selectedIndices.has(idx);
                          const currentStatus = downloadStates[idx] || 'idle';
                          const isDownloadingThis = currentStatus === 'downloading';
                          const isCompletedThis = currentStatus === 'completed';
                          const isStartedThis = currentStatus === 'started';
                          const isErrorThis = currentStatus === 'error';
                          const currentError = downloadErrors[idx];
                          const itemUniqueKey = item.id || `media-slide-${slideNum}-${idx}`;

                          return (
                            <div
                              key={itemUniqueKey}
                              className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                                isSelected
                                  ? 'border-purple-300 ring-2 ring-purple-100 shadow-sm'
                                  : 'border-slate-200 shadow-2xs'
                              }`}
                            >
                              {/* 1. Header: Slide Number & Status Badges */}
                              <div className="bg-slate-50/80 px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                  {analysisData.mediaList.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => toggleSelectItem(idx)}
                                      disabled={isBatchDownloading}
                                      className="text-slate-400 hover:text-purple-600 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                                      title={isSelected ? '일괄 다운로드 선택 해제' : '일괄 다운로드 선택'}
                                    >
                                      {isSelected ? (
                                        <CheckSquare className="w-5 h-5 text-purple-600" />
                                      ) : (
                                        <Square className="w-5 h-5 text-slate-300" />
                                      )}
                                    </button>
                                  )}

                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100/80 text-purple-800 border border-purple-200/50">
                                      #{slideNum}
                                    </span>
                                    <span className="text-xs font-semibold text-slate-700">
                                      {analysisData.mediaList.length > 1 ? `슬라이드 ${slideNum}` : '미디어 파일'}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  {/* Media Type Badge */}
                                  <span
                                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                      item.type === 'video'
                                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}
                                  >
                                    {item.type === 'video' ? (
                                      <>
                                        <Film className="w-3 h-3 text-purple-600" />
                                        <span>동영상 (MP4)</span>
                                      </>
                                    ) : (
                                      <>
                                        <ImageIcon className="w-3 h-3 text-blue-600" />
                                        <span>사진 (JPG)</span>
                                      </>
                                    )}
                                  </span>

                                  {item.verified && (
                                    <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      <span>검증 완료</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div className="p-4 sm:p-5 space-y-4">
                                {/* 2. Media Preview */}
                                <div className="w-full bg-slate-900/5 rounded-xl border border-slate-200/80 overflow-hidden relative flex items-center justify-center min-h-[200px] max-h-[360px]">
                                  {item.previewUrl ? (
                                    item.type === 'video' ? (
                                      <div className="relative w-full h-[240px] bg-slate-950 flex items-center justify-center group">
                                        <img
                                          src={item.previewUrl}
                                          alt={item.label || `슬라이드 #${slideNum} 동영상 미리보기`}
                                          className="w-full h-full object-contain"
                                          loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 text-white">
                                          <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg">
                                            <Film className="w-6 h-6" />
                                          </div>
                                          <span className="text-xs font-semibold bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-xs">
                                            동영상 스트림 준비됨 ({item.resolution || '720p HD'})
                                          </span>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="w-full h-[240px] bg-slate-900/5 flex items-center justify-center p-1">
                                        <img
                                          src={item.previewUrl}
                                          alt={item.label || `슬라이드 #${slideNum} 사진`}
                                          className="max-w-full max-h-[230px] object-contain rounded-lg shadow-2xs"
                                          loading="lazy"
                                        />
                                      </div>
                                    )
                                  ) : (
                                    <div className="w-full h-[180px] flex flex-col items-center justify-center text-slate-400 gap-2 bg-slate-50">
                                      {item.type === 'video' ? (
                                        <Film className="w-8 h-8 text-purple-400" />
                                      ) : (
                                        <ImageIcon className="w-8 h-8 text-blue-400" />
                                      )}
                                      <span className="text-xs font-medium text-slate-500">
                                        {item.label || '미디어 미리보기'}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* 3. Media Metadata & Quality Options */}
                                <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/70 space-y-2.5 text-xs">
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="text-slate-500 font-medium">해상도 / 규격:</span>
                                      <span className="font-semibold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                                        {item.resolution || (item.width && item.height ? `${item.width}×${item.height}` : '표준 화질')}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-500">
                                      <span>형식:</span>
                                      <span className="font-mono text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                                        {item.type === 'video' ? 'video/mp4' : 'image/jpeg'}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Quality selector dropdown when multiple streams exist */}
                                  {item.type === 'video' && item.qualityOptions && item.qualityOptions.length > 1 && (
                                    <div className="pt-2 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <label htmlFor={`quality-select-${idx}`} className="font-semibold text-slate-700 text-[11px] shrink-0">
                                        다운로드 화질 선택:
                                      </label>
                                      <select
                                        id={`quality-select-${idx}`}
                                        value={selectedQualityByItem[idx] || item.qualityOptions[0].id}
                                        onChange={(e) =>
                                          setSelectedQualityByItem((prev) => ({ ...prev, [idx]: e.target.value }))
                                        }
                                        disabled={isDownloadingThis || isBatchDownloading}
                                        className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-2.5 py-1 focus:ring-2 focus:ring-purple-500 outline-none cursor-pointer"
                                      >
                                        {item.qualityOptions.map((opt) => (
                                          <option key={opt.id} value={opt.id}>
                                            {opt.label} ({opt.resolution})
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  )}
                                </div>

                                {/* 4. Individual Dedicated Download Button */}
                                <div>
                                  <button
                                    type="button"
                                    id={`download-btn-${itemUniqueKey}`}
                                    onClick={() => handleFileDownload(item, idx)}
                                    disabled={isDownloadingThis || isBatchDownloading}
                                    className={`w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-not-allowed ${
                                      isCompletedThis
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : isStartedThis
                                        ? 'bg-amber-600 hover:bg-amber-700'
                                        : isErrorThis
                                        ? 'bg-rose-600 hover:bg-rose-700'
                                        : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700'
                                    }`}
                                  >
                                    {isDownloadingThis ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                        <span>항목 #{slideNum} 다운로드 처리 중...</span>
                                      </>
                                    ) : isCompletedThis ? (
                                      <>
                                        <Check className="w-4 h-4 text-white shrink-0" />
                                        <span>항목 #{slideNum} 다운로드 완료!</span>
                                      </>
                                    ) : isStartedThis ? (
                                      <>
                                        <ExternalLink className="w-4 h-4 text-white shrink-0" />
                                        <span>항목 #{slideNum} 브라우저 다운로드 요청됨 (확인 불가)</span>
                                      </>
                                    ) : isErrorThis ? (
                                      <>
                                        <AlertCircle className="w-4 h-4 text-white shrink-0" />
                                        <span>항목 #{slideNum} 다시 시도</span>
                                      </>
                                    ) : (
                                      <>
                                        <Download className="w-4 h-4 shrink-0" />
                                        <span>
                                          항목 #{slideNum} 개별 다운로드 ({item.type === 'video' ? 'MP4' : 'JPG'})
                                        </span>
                                      </>
                                    )}
                                  </button>

                                  {isStartedThis && (
                                    <p className="text-[11px] text-amber-700 text-center mt-1.5 flex items-center justify-center gap-1">
                                      <AlertCircle className="w-3 h-3 shrink-0" />
                                      <span>브라우저 외부 저장 완료 여부를 확인할 수 없습니다. 미저장 시 다시 시도해 주세요.</span>
                                    </p>
                                  )}

                                  {isErrorThis && currentError && (
                                    <p className="text-[11px] text-rose-600 text-center mt-1.5 flex items-center justify-center gap-1">
                                      <AlertCircle className="w-3 h-3 shrink-0" />
                                      <span>{currentError}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
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
