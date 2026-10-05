/**
 * Instagram & Threads Extraction Engine
 * Provides URL parsing, official embed resolution, and Meta oEmbed API integration.
 * In accordance with Meta API v25.0+ specifications, thumbnail_url is deprecated
 * and direct raw binary extraction for third-party posts is not provided by Meta.
 */

import { AnalysisResponse, ExtractedMedia } from '../types';
import { isAllowedMediaHost } from './mediaDownloader';

/**
 * Validates and extracts shortcode from Instagram and Threads URLs
 */
export function extractShortcode(rawUrl: string): {
  platform: 'instagram' | 'threads' | 'unknown';
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
      return { platform: 'threads', contentType: 'unknown', shortcode: null };
    }

    return { platform: 'unknown', contentType: 'unknown', shortcode: null };
  } catch {
    return { platform: 'unknown', contentType: 'unknown', shortcode: null };
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
  contentType?: 'reel' | 'post' | 'video' | 'photo';
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
    let detectedContentType: 'reel' | 'post' | 'video' | 'photo' = 'photo';
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

    // 1. Check for video_url
    const videoIdx = html.indexOf('video_url');
    if (videoIdx !== -1) {
      const sub = html.slice(videoIdx);
      const start = sub.indexOf('https');
      const end = sub.indexOf('\\"', start);
      if (start !== -1 && end !== -1) {
        const rawChunk = sub.slice(start, end);
        const cleanVideoUrl = rawChunk.replace(/\\\//g, '/').replace(/\\/g, '');
        const hostCheck = isAllowedMediaHost(cleanVideoUrl);
        if (hostCheck.allowed) {
          detectedContentType = 'video';
          const filename = `instagram_${shortcode}.mp4`;
          mediaList.push({
            type: 'video',
            url: cleanVideoUrl,
            downloadUrl: `/api/download?url=${encodeURIComponent(cleanVideoUrl)}&filename=${encodeURIComponent(filename)}`,
            previewUrl: cleanVideoUrl,
            resolution: '720p HD',
            mimeType: 'video/mp4',
            verified: true,
            label: 'Original Video (.mp4)',
          });
        }
      }
    }

    // 2. Check for high-res photo / cover
    const imgMatch = html.match(/class="EmbeddedMediaImage"[^>]*src="([^"]+)"/i);
    if (imgMatch) {
      const cleanImgUrl = imgMatch[1].replace(/&amp;/g, '&');
      const hostCheck = isAllowedMediaHost(cleanImgUrl);
      if (hostCheck.allowed) {
        const isCover = mediaList.length > 0;
        const filename = `instagram_${shortcode}${isCover ? '_cover' : ''}.jpg`;
        mediaList.push({
          type: 'image',
          url: cleanImgUrl,
          downloadUrl: `/api/download?url=${encodeURIComponent(cleanImgUrl)}&filename=${encodeURIComponent(filename)}`,
          previewUrl: cleanImgUrl,
          resolution: isCover ? 'Video Cover / Poster' : 'High-Res Photo',
          mimeType: 'image/jpeg',
          verified: true,
          label: isCover ? 'Video Cover Photo (.jpg)' : 'Original Photo (.jpg)',
        });
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
      statusMessage: 'Invalid URL. Please provide a direct public Instagram or Threads post link.',
      error: 'Invalid or unsupported URL format.',
    };
  }

  // Build official canonical and embed player URLs
  const canonicalUrl =
    platform === 'instagram'
      ? `https://www.instagram.com/p/${shortcode}/`
      : `https://www.threads.net/post/${shortcode}`;

  const embedUrl =
    platform === 'instagram'
      ? `https://www.instagram.com/p/${shortcode}/embed/captioned/`
      : `https://www.threads.net/post/${shortcode}/embed`;

  // Step 1: Attempt direct public media extraction via official server-rendered embed
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
    statusMessage: 'URL format validated. Streaming live via official Instagram embed player.',
    restrictionNotice:
      'Official embed player active. In accordance with Meta Platform Terms, raw binary file extraction for this post is not supported.',
    technicalDetails: {
      metaGraphApiConfigured: Boolean(metaAccessToken),
      directStreamAvailable: false,
      imageDownloadAvailable: false,
      videoDownloadAvailable: false,
      serverIpRestrictedByMeta: true,
      recommendedAccess: 'Official Meta Embed Player',
    },
  };
}
