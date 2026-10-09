/**
 * Instagram & Threads Extraction Engine
 * Provides URL parsing, official embed resolution, and Meta oEmbed API integration.
 * In accordance with Meta API v25.0+ specifications, thumbnail_url is deprecated
 * and direct raw binary extraction for third-party posts is not provided by Meta.
 */

import { AnalysisResponse, ExtractedMedia, VideoQualityOption } from '../types';
import { isAllowedMediaHost } from './mediaDownloader';
import { extractThreadsMedia } from './threadsExtractor';
import { extractTiktokMedia, parseTiktokUrl } from './tiktokExtractor';

/**
 * Accurately detects video resolution from surrounding dimensions metadata or URL parameters.
 * If dimensions cannot be verified, returns '해상도 확인 불가'.
 */
/**
 * Accurately analyzes video resolution and metadata.
 * Differentiates post display/canvas dimensions from actual encoded video stream resolution.
 * Instagram public web embeds provide progressive MP4 streams that are capped at 720p.
 * Never falsely classifies 720p streams as 1080p based on post canvas dimensions.
 */
export function detectVideoResolution(
  html: string,
  videoUrl: string
): { width?: number; height?: number; resolution: string; shortLabel: string; isEstimated: boolean } {
  let canvasWidth: number | undefined;
  let canvasHeight: number | undefined;

  // 1. Check canvas/viewport dimensions in JSON (represents original upload/canvas aspect ratio)
  const dimMatch =
    html.match(/\\"dimensions\\":\{\\"height\\":(\d+),\\"width\\":(\d+)\}/) ||
    html.match(/"dimensions":\{"height":(\d+),"width":(\d+)\}/);
  if (dimMatch) {
    canvasHeight = parseInt(dimMatch[1], 10);
    canvasWidth = parseInt(dimMatch[2], 10);
  }

  // 2. Check efg query parameter in URL (e.g. 720, 1080 preset encoding tag)
  let efgPresetTag: string | null = null;
  try {
    const parsed = new URL(videoUrl);
    const efg = parsed.searchParams.get('efg');
    if (efg) {
      const rawDecoded = decodeURIComponent(efg);
      let decodedStr = '';
      if (typeof atob === 'function') {
        decodedStr = atob(rawDecoded);
      } else if (typeof Buffer !== 'undefined') {
        decodedStr = Buffer.from(rawDecoded, 'base64').toString('utf8');
      }
      const tagMatch = decodedStr.match(/\.(\d{3,4})\./);
      if (tagMatch) {
        efgPresetTag = `${tagMatch[1]}p`;
      }
    }
  } catch {
    // ignore
  }

  // 3. Strict analysis:
  // Note: Instagram public web embeds transcode all progressive MP4s to 720p.
  // Even if canvas dimensions are 1080x1350 or 1080x1920, the actual video stream is scaled down to 720p (720x900 or 720x1280).
  // If efg has 720 (or default web progressive stream):
  if (efgPresetTag === '720p' || (!efgPresetTag && canvasWidth && canvasHeight)) {
    // Calculate the actual 720p scaled video dimensions
    if (canvasWidth && canvasHeight && canvasWidth > 0) {
      const aspectRatio = canvasHeight / canvasWidth;
      const actualWidth = 720;
      const actualHeight = Math.round(720 * aspectRatio);
      return {
        width: actualWidth,
        height: actualHeight,
        resolution: `720p HD (${actualWidth}×${actualHeight})`,
        shortLabel: '720p HD',
        isEstimated: false,
      };
    }
    return {
      resolution: '720p HD (웹 표준 화질)',
      shortLabel: '720p HD',
      isEstimated: true,
    };
  }

  // If explicitly tagged as 1080p in efg (very rare on public embeds)
  if (efgPresetTag === '1080p') {
    return {
      resolution: '1080p Full HD',
      shortLabel: '1080p Full HD',
      isEstimated: false,
    };
  }

  // If efg tagged with another resolution (e.g. 480p)
  if (efgPresetTag) {
    return {
      resolution: `${efgPresetTag} (추정 해상도)`,
      shortLabel: efgPresetTag,
      isEstimated: true,
    };
  }

  // If cannot be confirmed:
  return {
    resolution: '해상도 확인 불가',
    shortLabel: '해상도 확인 불가',
    isEstimated: true,
  };
}

/**
 * Validates and extracts shortcode from Instagram and Threads URLs
 */
export function extractShortcode(rawUrl: string): {
  platform: 'instagram' | 'threads' | 'tiktok' | 'unknown';
  contentType: 'reel' | 'post' | 'video' | 'photo' | 'unknown';
  shortcode: string | null;
  author?: string;
} {
  try {
    let urlToParse = rawUrl.trim();
    if (!/^https?:\/\//i.test(urlToParse)) {
      urlToParse = 'https://' + urlToParse;
    }
    const parsed = new URL(urlToParse);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    if (host.includes('instagram.com') || host === 'instagr.am') {
      const reelMatch = pathname.match(/\/(?:reel|reels)\/([A-Za-z0-9_-]+)/);
      if (reelMatch) {
        return { platform: 'instagram', contentType: 'reel', shortcode: reelMatch[1] };
      }
      const postMatch = pathname.match(/\/p\/([A-Za-z0-9_-]+)/);
      if (postMatch) {
        return { platform: 'instagram', contentType: 'post', shortcode: postMatch[1] };
      }
      const tvMatch = pathname.match(/\/tv\/([A-Za-z0-9_-]+)/);
      if (tvMatch) {
        return { platform: 'instagram', contentType: 'video', shortcode: tvMatch[1] };
      }
      return { platform: 'instagram', contentType: 'unknown', shortcode: null };
    }

    if (host.includes('threads.net') || host.includes('threads.com')) {
      const authorPostMatch = pathname.match(/\/@([A-Za-z0-9_.-]+)\/post\/([A-Za-z0-9_-]+)/);
      if (authorPostMatch) {
        return {
          platform: 'threads',
          contentType: 'post',
          shortcode: authorPostMatch[2],
          author: authorPostMatch[1],
        };
      }
      const postMatch = pathname.match(/\/post\/([A-Za-z0-9_-]+)/);
      if (postMatch) {
        return { platform: 'threads', contentType: 'post', shortcode: postMatch[1] };
      }
      const tMatch = pathname.match(/\/t\/([A-Za-z0-9_-]+)/);
      if (tMatch) {
        return { platform: 'threads', contentType: 'post', shortcode: tMatch[1] };
      }
      return { platform: 'threads', contentType: 'unknown', shortcode: null };
    }

    if (
      host.includes('tiktok.com') ||
      host === 'vm.tiktok.com' ||
      host === 'vt.tiktok.com'
    ) {
      const { id, author: tiktokAuthor, isPhotoPost } = parseTiktokUrl(urlToParse);
      const isShortHost =
        host === 'vm.tiktok.com' ||
        host === 'vt.tiktok.com' ||
        pathname.startsWith('/t/');

      if (id) {
        return {
          platform: 'tiktok',
          contentType: isPhotoPost ? 'photo' : 'video',
          shortcode: id,
          author: tiktokAuthor,
        };
      }

      if (isShortHost) {
        return {
          platform: 'tiktok',
          contentType: 'video',
          shortcode: 'pending',
          author: tiktokAuthor,
        };
      }

      return { platform: 'tiktok', contentType: 'unknown', shortcode: null };
    }

    return { platform: 'unknown', contentType: 'unknown', shortcode: null };
  } catch {
    return { platform: 'unknown', contentType: 'unknown', shortcode: null };
  }
}

interface SidecarNode {
  id?: string;
  is_video?: boolean;
  display_url?: string;
  video_url?: string;
  dimensions?: {
    height?: number;
    width?: number;
  };
}

/**
 * Parses all slides from Instagram carousel (edge_sidecar_to_children) JSON block in embed HTML.
 */
export function parseCarouselFromEmbed(
  html: string,
  shortcode: string
): ExtractedMedia[] | null {
  const sidecarIdx = html.indexOf('edge_sidecar_to_children');
  if (sidecarIdx === -1) return null;

  const colonIdx = html.indexOf(':', sidecarIdx);
  const startIdx = html.indexOf('{', colonIdx);
  if (startIdx === -1) return null;

  let depth = 0;
  let endIdx = startIdx;
  for (let i = startIdx; i < html.length; i++) {
    if (html[i] === '{' && html[i - 1] !== '\\') depth++;
    else if (html[i] === '}' && html[i - 1] !== '\\') {
      depth--;
      if (depth === 0) {
        endIdx = i;
        break;
      }
    }
  }

  if (endIdx <= startIdx) return null;

  const rawJsonStr = html.slice(startIdx, endIdx + 1);
  const unescaped = rawJsonStr.replace(/\\"/g, '"').replace(/\\\\/g, '\\').replace(/\\\//g, '/');

  try {
    const parsed = JSON.parse(unescaped) as { edges?: Array<{ node?: SidecarNode }> };
    if (!parsed.edges || !Array.isArray(parsed.edges) || parsed.edges.length === 0) {
      return null;
    }

    const carouselMediaList: ExtractedMedia[] = [];

    parsed.edges.forEach((edge, idx) => {
      const node = edge?.node;
      if (!node) return;

      const slideNum = idx + 1;
      const isVideo = Boolean(node.is_video && node.video_url);

      if (isVideo && node.video_url) {
        const cleanVideoUrl = node.video_url.replace(/\\\//g, '/').replace(/\\/g, '');
        const hostCheck = isAllowedMediaHost(cleanVideoUrl);
        if (hostCheck.allowed) {
          const cleanPosterUrl = node.display_url
            ? node.display_url.replace(/\\\//g, '/').replace(/\\/g, '')
            : cleanVideoUrl;
          const dims = node.dimensions;
          const res = dims?.width && dims?.height
            ? `720p HD (${dims.width}×${dims.height})`
            : '720p HD';
          const filename = `instagram_${shortcode}_slide_${slideNum}.mp4`;

          carouselMediaList.push({
            id: node.id || `slide_${slideNum}_video`,
            slideIndex: slideNum,
            type: 'video',
            url: cleanVideoUrl,
            downloadUrl: `/api/download?url=${encodeURIComponent(cleanVideoUrl)}&filename=${encodeURIComponent(filename)}`,
            previewUrl: cleanPosterUrl,
            resolution: res,
            mimeType: 'video/mp4',
            verified: true,
            label: `Slide ${slideNum} (Video .mp4)`,
            width: dims?.width || 720,
            height: dims?.height || 900,
            qualityOptions: [
              {
                id: `quality_slide_${slideNum}_720p`,
                label: '720p HD',
                resolution: res,
                width: dims?.width || 720,
                height: dims?.height || 900,
                url: cleanVideoUrl,
                downloadUrl: `/api/download?url=${encodeURIComponent(cleanVideoUrl)}&filename=${encodeURIComponent(filename)}`,
                mimeType: 'video/mp4',
                isDefault: true,
              },
            ],
          });
        }
      } else if (node.display_url) {
        const cleanImgUrl = node.display_url.replace(/\\\//g, '/').replace(/\\/g, '');
        const hostCheck = isAllowedMediaHost(cleanImgUrl);
        if (hostCheck.allowed) {
          const dims = node.dimensions;
          const res = dims?.width && dims?.height
            ? `Photo (${dims.width}×${dims.height})`
            : 'High-Res Photo';
          const filename = `instagram_${shortcode}_slide_${slideNum}.jpg`;

          carouselMediaList.push({
            id: node.id || `slide_${slideNum}_photo`,
            slideIndex: slideNum,
            type: 'image',
            url: cleanImgUrl,
            downloadUrl: `/api/download?url=${encodeURIComponent(cleanImgUrl)}&filename=${encodeURIComponent(filename)}`,
            previewUrl: cleanImgUrl,
            resolution: res,
            mimeType: 'image/jpeg',
            verified: true,
            label: `Slide ${slideNum} (Photo .jpg)`,
            width: dims?.width,
            height: dims?.height,
          });
        }
      }
    });

    return carouselMediaList.length > 0 ? carouselMediaList : null;
  } catch (err) {
    console.error('Failed to parse carousel JSON from embed:', err);
    return null;
  }
}

/**
 * Attempts to extract direct media file candidates (image and/or video) from public embed endpoint
 */
export async function extractMediaFromPublicEmbed(
  shortcode: string,
  platform: 'instagram' | 'threads'
): Promise<{
  mediaList: ExtractedMedia[];
  contentType?: 'reel' | 'post' | 'video' | 'photo' | 'carousel';
  author?: string;
  caption?: string;
} | null> {
  if (platform !== 'instagram') {
    return null;
  }

  try {
    const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;
    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      return null;
    }

    const html = await res.text();
    const mediaList: ExtractedMedia[] = [];
    let detectedContentType: 'reel' | 'post' | 'video' | 'photo' | 'carousel' = 'photo';
    let author: string | undefined;
    let caption: string | undefined;

    // Extract author username
    const authorMatch =
      html.match(/class="UsernameText"[^>]*>([^<]+)<\/span>/i) ||
      html.match(/"username":\s*"([^"]+)"/i);
    if (authorMatch) {
      author = authorMatch[1].trim();
    }

    // Extract caption text
    const captionMatch = html.match(/class="Caption"[^>]*>([\s\S]*?)<\/div>/i);
    if (captionMatch) {
      caption = captionMatch[1]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim();
    }

    // A. Check if post is a carousel (has edge_sidecar_to_children)
    const carouselItems = parseCarouselFromEmbed(html, shortcode);
    if (carouselItems && carouselItems.length > 0) {
      return {
        mediaList: carouselItems,
        contentType: 'carousel',
        author,
        caption,
      };
    }

    // B. Fallback to single item extraction (Single Video / Single Photo / Reel)
    // 1. Search for all video_url occurrences in HTML
    const foundVideoUrls: string[] = [];
    let searchIdx = 0;
    while ((searchIdx = html.indexOf('video_url', searchIdx)) !== -1) {
      const sub = html.slice(searchIdx);
      const start = sub.indexOf('https');
      const end = sub.indexOf('\\"', start);
      if (start !== -1 && end !== -1) {
        const rawChunk = sub.slice(start, end);
        const cleanVideoUrl = rawChunk.replace(/\\\//g, '/').replace(/\\/g, '');
        const hostCheck = isAllowedMediaHost(cleanVideoUrl);
        if (hostCheck.allowed && !foundVideoUrls.includes(cleanVideoUrl)) {
          foundVideoUrls.push(cleanVideoUrl);
        }
      }
      searchIdx += 9;
    }

    if (foundVideoUrls.length > 1) {
      // Post contains MULTIPLE distinct videos (Video Carousel)
      detectedContentType = 'carousel';
      foundVideoUrls.forEach((vUrl, idx) => {
        const slideNum = idx + 1;
        const meta = detectVideoResolution(html, vUrl);
        const filename = `instagram_${shortcode}_slide_${slideNum}.mp4`;
        mediaList.push({
          id: `slide_${slideNum}_video`,
          slideIndex: slideNum,
          type: 'video',
          url: vUrl,
          downloadUrl: `/api/download?url=${encodeURIComponent(vUrl)}&filename=${encodeURIComponent(filename)}`,
          previewUrl: vUrl,
          resolution: meta.resolution,
          mimeType: 'video/mp4',
          verified: true,
          label: `Slide ${slideNum} (Video .mp4)`,
          width: meta.width,
          height: meta.height,
          qualityOptions: [
            {
              id: `quality_slide_${slideNum}`,
              label: '720p HD',
              resolution: meta.resolution,
              width: meta.width,
              height: meta.height,
              url: vUrl,
              downloadUrl: `/api/download?url=${encodeURIComponent(vUrl)}&filename=${encodeURIComponent(filename)}`,
              mimeType: 'video/mp4',
              isDefault: true,
            },
          ],
        });
      });
      // In a multi-video carousel, do not append an unrelated single cover photo
    } else if (foundVideoUrls.length === 1) {
      // Single Video post / Reel
      detectedContentType = 'video';
      const primaryVideoUrl = foundVideoUrls[0];
      const primaryMeta = detectVideoResolution(html, primaryVideoUrl);
      const filename = `instagram_${shortcode}.mp4`;

      mediaList.push({
        id: 'single_video',
        type: 'video',
        url: primaryVideoUrl,
        downloadUrl: `/api/download?url=${encodeURIComponent(primaryVideoUrl)}&filename=${encodeURIComponent(filename)}`,
        previewUrl: primaryVideoUrl,
        resolution: primaryMeta.resolution,
        mimeType: 'video/mp4',
        verified: true,
        label: 'Original Video (.mp4)',
        width: primaryMeta.width,
        height: primaryMeta.height,
        qualityOptions: [
          {
            id: 'quality_single_720p',
            label: '720p HD',
            resolution: primaryMeta.resolution,
            width: primaryMeta.width,
            height: primaryMeta.height,
            url: primaryVideoUrl,
            downloadUrl: `/api/download?url=${encodeURIComponent(primaryVideoUrl)}&filename=${encodeURIComponent(filename)}`,
            mimeType: 'video/mp4',
            isDefault: true,
          },
        ],
      });

      // Check for high-res photo / cover for single video
      const imgMatch = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i);
      if (imgMatch) {
        const cleanImgUrl = imgMatch[1].replace(/&amp;/g, '&');
        const hostCheck = isAllowedMediaHost(cleanImgUrl);
        if (hostCheck.allowed) {
          const coverFilename = `instagram_${shortcode}_cover.jpg`;
          mediaList.push({
            id: 'single_cover',
            type: 'image',
            url: cleanImgUrl,
            downloadUrl: `/api/download?url=${encodeURIComponent(cleanImgUrl)}&filename=${encodeURIComponent(coverFilename)}`,
            previewUrl: cleanImgUrl,
            resolution: 'Video Cover / Poster',
            mimeType: 'image/jpeg',
            verified: true,
            label: 'Video Cover Photo (.jpg)',
          });
        }
      }
    } else {
      // 2. Check for high-res photo when no video was found
      const imgMatch = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i);
      if (imgMatch) {
        const cleanImgUrl = imgMatch[1].replace(/&amp;/g, '&');
        const hostCheck = isAllowedMediaHost(cleanImgUrl);
        if (hostCheck.allowed) {
          const filename = `instagram_${shortcode}.jpg`;
          mediaList.push({
            id: 'single_photo',
            type: 'image',
            url: cleanImgUrl,
            downloadUrl: `/api/download?url=${encodeURIComponent(cleanImgUrl)}&filename=${encodeURIComponent(filename)}`,
            previewUrl: cleanImgUrl,
            resolution: 'High-Res Photo',
            mimeType: 'image/jpeg',
            verified: true,
            label: 'Original Photo (.jpg)',
          });
        }
      }
    }

    if (mediaList.length === 0) {
      return null;
    }

    return {
      mediaList,
      contentType: detectedContentType,
      author,
      caption,
    };
  } catch (err) {
    console.error('Error in extractMediaFromPublicEmbed:', err);
    return null;
  }
}

/**
 * Analyzes public Instagram/Threads URL.
 * Supports direct public media extraction, Meta oEmbed queries, and official embed player rendering.
 */
export async function analyzePost(
  targetUrl: string,
  metaAccessToken?: string
): Promise<AnalysisResponse> {
  const { platform, contentType, shortcode, author } = extractShortcode(targetUrl);

  if (!shortcode || platform === 'unknown') {
    return {
      success: false,
      urlValid: false,
      postVerified: false,
      previewAvailable: false,
      hasDirectDownload: false,
      platform,
      contentType,
      shortcode: shortcode || '',
      canonicalUrl: targetUrl,
      embedUrl: '',
      mediaList: [],
      statusMessage: 'Invalid URL. Please provide a direct public Instagram, Threads, or TikTok post link.',
      error: 'Invalid or unsupported URL format.',
    };
  }

  // Build official canonical and embed player URLs
  const canonicalUrl =
    platform === 'instagram'
      ? `https://www.instagram.com/p/${shortcode}/`
      : platform === 'threads'
      ? author
        ? `https://www.threads.net/@${author}/post/${shortcode}`
        : `https://www.threads.net/t/${shortcode}`
      : targetUrl;

  const embedUrl =
    platform === 'instagram'
      ? `https://www.instagram.com/p/${shortcode}/embed/captioned/`
      : platform === 'threads'
      ? `https://www.threads.net/t/${shortcode}/embed`
      : shortcode && shortcode !== 'pending'
      ? `https://www.tiktok.com/player/v1/${shortcode}`
      : '';

  // Step 1: Attempt direct public media extraction
  if (platform === 'tiktok') {
    const directTiktokMedia = await extractTiktokMedia(targetUrl);
    if (directTiktokMedia && directTiktokMedia.mediaList.length > 0) {
      return {
        success: true,
        urlValid: true,
        postVerified: true,
        previewAvailable: true,
        hasDirectDownload: true, // REAL DIRECT DOWNLOAD IS AVAILABLE!
        platform: 'tiktok',
        contentType: directTiktokMedia.contentType,
        shortcode: directTiktokMedia.shortcode,
        canonicalUrl: directTiktokMedia.canonicalUrl,
        embedUrl: directTiktokMedia.embedUrl,
        author: directTiktokMedia.author,
        caption: directTiktokMedia.caption,
        mediaList: directTiktokMedia.mediaList,
        statusMessage: `TikTok ${directTiktokMedia.contentType} verified. ${directTiktokMedia.mediaList.length} downloadable media file(s) ready.`,
        technicalDetails: {
          metaGraphApiConfigured: false,
          directStreamAvailable: true,
          imageDownloadAvailable: directTiktokMedia.mediaList.some((m) => m.type === 'image'),
          videoDownloadAvailable: directTiktokMedia.mediaList.some((m) => m.type === 'video'),
          serverIpRestrictedByMeta: false,
          recommendedAccess: 'Direct Streaming Download',
        },
      };
    } else {
      return {
        success: false,
        urlValid: true,
        postVerified: false,
        previewAvailable: false,
        hasDirectDownload: false,
        platform: 'tiktok',
        contentType: contentType || 'video',
        shortcode: shortcode || '',
        canonicalUrl: targetUrl,
        embedUrl: shortcode && shortcode !== 'pending' ? `https://www.tiktok.com/player/v1/${shortcode}` : '',
        mediaList: [],
        statusMessage:
          'Unable to extract public media from this TikTok post. The post may be private, age-restricted, removed, or protected by security verification.',
        error: 'TikTok media extraction failed or restricted.',
      };
    }
  }

  if (platform === 'threads') {
    const directThreadsMedia = await extractThreadsMedia(shortcode, author);
    if (directThreadsMedia && directThreadsMedia.mediaList.length > 0) {
      return {
        success: true,
        urlValid: true,
        postVerified: true,
        previewAvailable: true,
        hasDirectDownload: true, // REAL DIRECT DOWNLOAD IS AVAILABLE!
        platform: 'threads',
        contentType: directThreadsMedia.contentType,
        shortcode,
        canonicalUrl: directThreadsMedia.author
          ? `https://www.threads.net/@${directThreadsMedia.author}/post/${shortcode}`
          : canonicalUrl,
        embedUrl,
        author: directThreadsMedia.author || author,
        caption: directThreadsMedia.caption,
        mediaList: directThreadsMedia.mediaList,
        statusMessage: `Threads post verified. ${directThreadsMedia.mediaList.length} downloadable media file(s) ready.`,
        technicalDetails: {
          metaGraphApiConfigured: Boolean(metaAccessToken),
          directStreamAvailable: true,
          imageDownloadAvailable: directThreadsMedia.mediaList.some((m) => m.type === 'image'),
          videoDownloadAvailable: directThreadsMedia.mediaList.some((m) => m.type === 'video'),
          serverIpRestrictedByMeta: false,
          recommendedAccess: 'Direct Streaming Download',
        },
      };
    }
  }

  if (platform === 'instagram') {
    const directMedia = await extractMediaFromPublicEmbed(shortcode, platform);
    if (directMedia && directMedia.mediaList.length > 0) {
      return {
        success: true,
        urlValid: true,
        postVerified: true,
        previewAvailable: true,
        hasDirectDownload: true, // REAL DIRECT DOWNLOAD IS AVAILABLE!
        platform,
        contentType: directMedia.contentType || contentType,
        shortcode,
        canonicalUrl,
        embedUrl,
        author: directMedia.author || author,
        caption: directMedia.caption,
        mediaList: directMedia.mediaList,
        statusMessage: `Post verified. ${directMedia.mediaList.length} downloadable media file(s) ready.`,
        technicalDetails: {
          metaGraphApiConfigured: Boolean(metaAccessToken),
          directStreamAvailable: true,
          imageDownloadAvailable: directMedia.mediaList.some((m) => m.type === 'image'),
          videoDownloadAvailable: directMedia.mediaList.some((m) => m.type === 'video'),
          serverIpRestrictedByMeta: false,
          recommendedAccess: 'Direct Streaming Download',
        },
      };
    }
  }

  // Step 2: Attempt Meta oEmbed API query (if token provided or as fallback)
  if (platform === 'instagram') {
    try {
      let oembedEndpoint = `https://graph.facebook.com/v25.0/instagram_oembed?url=${encodeURIComponent(
        canonicalUrl
      )}&omitscript=true`;

      if (metaAccessToken) {
        oembedEndpoint += `&access_token=${encodeURIComponent(metaAccessToken)}`;
      }

      const res = await fetch(oembedEndpoint);
      if (res.ok) {
        const data = await res.json();
        return {
          success: true,
          urlValid: true,
          postVerified: true,
          previewAvailable: true,
          hasDirectDownload: false,
          platform,
          contentType: (data.type as any) || contentType,
          shortcode,
          canonicalUrl,
          embedUrl,
          author,
          mediaList: [],
          statusMessage: 'Post verified via official Meta oEmbed API. Live player is active.',
          restrictionNotice:
            'Meta Platform Notice: The official oEmbed API provides embed player HTML only. Direct media files are unavailable for this post.',
          technicalDetails: {
            metaGraphApiConfigured: Boolean(metaAccessToken),
            directStreamAvailable: false,
            imageDownloadAvailable: false,
            videoDownloadAvailable: false,
            serverIpRestrictedByMeta: false,
            recommendedAccess: 'Official Meta Embed Player',
          },
        };
      }
    } catch {
      // Fallback to client embed rendering
    }
  }

  // Step 3: Standard official embed fallback
  const platformName = platform === 'threads' ? 'Threads' : 'Instagram';
  return {
    success: true,
    urlValid: true,
    postVerified: false,
    previewAvailable: true,
    hasDirectDownload: false,
    platform,
    contentType,
    shortcode,
    canonicalUrl,
    embedUrl,
    author,
    mediaList: [],
    statusMessage: `URL format validated. Viewing via official ${platformName} embed player.`,
    restrictionNotice:
      `Official ${platformName} embed player active. In accordance with Meta Platform Terms, raw binary file extraction for this post is not supported.`,
    technicalDetails: {
      metaGraphApiConfigured: Boolean(metaAccessToken),
      directStreamAvailable: false,
      imageDownloadAvailable: false,
      videoDownloadAvailable: false,
      serverIpRestrictedByMeta: true,
      recommendedAccess: `Official Meta ${platformName} Embed Player`,
    },
  };
}
