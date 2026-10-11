import { ExtractedMedia, VideoQualityOption } from '../types/index';
import { isAllowedMediaHost } from './mediaDownloader';

export interface TiktokExtractResult {
  mediaList: ExtractedMedia[];
  contentType: 'video' | 'photo' | 'carousel';
  author?: string;
  caption?: string;
  shortcode: string;
  canonicalUrl: string;
  embedUrl: string;
}

/**
 * Resolves short TikTok URLs (vm.tiktok.com, vt.tiktok.com, tiktok.com/t/) to the full canonical URL.
 */
export async function resolveTiktokShortUrl(rawUrl: string): Promise<string> {
  let currentUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(currentUrl)) {
    currentUrl = 'https://' + currentUrl;
  }

  try {
    const parsed = new URL(currentUrl);
    const host = parsed.hostname.toLowerCase();

    // Check if it is a known short URL host or /t/ path
    const isShortHost =
      host === 'vm.tiktok.com' ||
      host === 'vt.tiktok.com' ||
      (host.includes('tiktok.com') && parsed.pathname.startsWith('/t/'));

    if (!isShortHost) {
      return currentUrl;
    }

    // Follow redirects safely (up to 3 hops)
    let hops = 0;
    while (hops < 3) {
      hops++;
      const res = await fetch(currentUrl, {
        method: 'GET',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'manual',
      });

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (location) {
          const resolved = new URL(location, currentUrl).toString();
          const targetHost = new URL(resolved).hostname.toLowerCase();
          if (targetHost.includes('tiktok.com')) {
            currentUrl = resolved;
            if (currentUrl.includes('/video/') || currentUrl.includes('/photo/')) {
              break;
            }
          } else {
            break;
          }
        } else {
          break;
        }
      } else {
        break;
      }
    }

    return currentUrl;
  } catch {
    return currentUrl;
  }
}

/**
 * Parses a TikTok URL and extracts video/photo ID and username if present.
 */
export function parseTiktokUrl(rawUrl: string): {
  id?: string;
  author?: string;
  isPhotoPost: boolean;
  canonicalUrl: string;
} {
  try {
    let urlToParse = rawUrl.trim();
    if (!/^https?:\/\//i.test(urlToParse)) {
      urlToParse = 'https://' + urlToParse;
    }
    const parsed = new URL(urlToParse);
    const pathname = parsed.pathname;

    const videoMatch = pathname.match(/\/@([A-Za-z0-9_.-]+)\/video\/(\d+)/i);
    if (videoMatch) {
      return {
        id: videoMatch[2],
        author: videoMatch[1],
        isPhotoPost: false,
        canonicalUrl: `https://www.tiktok.com/@${videoMatch[1]}/video/${videoMatch[2]}`,
      };
    }

    const photoMatch = pathname.match(/\/@([A-Za-z0-9_.-]+)\/photo\/(\d+)/i);
    if (photoMatch) {
      return {
        id: photoMatch[2],
        author: photoMatch[1],
        isPhotoPost: true,
        canonicalUrl: `https://www.tiktok.com/@${photoMatch[1]}/photo/${photoMatch[2]}`,
      };
    }

    const simpleVideoMatch = pathname.match(/\/video\/(\d+)/i);
    if (simpleVideoMatch) {
      return {
        id: simpleVideoMatch[1],
        isPhotoPost: false,
        canonicalUrl: `https://www.tiktok.com/video/${simpleVideoMatch[1]}`,
      };
    }

    const mMatch = pathname.match(/\/v\/(\d+)/i);
    if (mMatch) {
      return {
        id: mMatch[1],
        isPhotoPost: false,
        canonicalUrl: `https://www.tiktok.com/video/${mMatch[1]}`,
      };
    }

    return {
      isPhotoPost: false,
      canonicalUrl: urlToParse,
    };
  } catch {
    return {
      isPhotoPost: false,
      canonicalUrl: rawUrl,
    };
  }
}

/**
 * Extracts media files (video or photo slideshow) from a public TikTok post.
 */
export async function extractTiktokMedia(
  inputUrl: string
): Promise<TiktokExtractResult | null> {
  try {
    // 1. Resolve short URLs if necessary
    const resolvedUrl = await resolveTiktokShortUrl(inputUrl);
    const { id: detectedId, author: detectedAuthor, isPhotoPost, canonicalUrl } = parseTiktokUrl(resolvedUrl);

    if (!detectedId) {
      return null;
    }

    const shortcode = detectedId;
    const embedUrl = `https://www.tiktok.com/player/v1/${shortcode}`;

    // 2. Query official TikTok oEmbed as baseline metadata source
    let oembedData: any = null;
    try {
      const oembedRes = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(canonicalUrl)}`,
        { headers: { 'User-Agent': 'Mozilla/5.0' } }
      );
      if (oembedRes.ok) {
        oembedData = await oembedRes.json();
      }
    } catch {
      // Continue with HTML fetch
    }

    let author = detectedAuthor || oembedData?.author_unique_id || oembedData?.author_name;
    let caption = oembedData?.title;

    // 3. Fetch TikTok post page with desktop browser headers to get full SSR state
    const pageRes = await fetch(canonicalUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!pageRes.ok && !oembedData) {
      return null;
    }

    const html = await pageRes.text();

    // 4. Parse __UNIVERSAL_DATA_FOR_REHYDRATION__ script
    let itemStruct: any = null;
    const rehydrationMatch = html.match(
      /<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/i
    );

    if (rehydrationMatch) {
      try {
        const parsed = JSON.parse(rehydrationMatch[1]);
        const videoDetail = parsed?.__DEFAULT_SCOPE__?.['webapp.video-detail'];
        itemStruct = videoDetail?.itemInfo?.itemStruct;
      } catch {
        // Ignore parse error
      }
    }

    // Fallback: Check SIGI_STATE or VideoObject
    if (!itemStruct) {
      const sigiMatch = html.match(/<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/i);
      if (sigiMatch) {
        try {
          const parsed = JSON.parse(sigiMatch[1]);
          itemStruct = parsed?.ItemModule?.[shortcode];
        } catch {
          // Ignore
        }
      }
    }

    // Update metadata from itemStruct if available
    if (itemStruct?.author?.uniqueId) {
      author = itemStruct.author.uniqueId;
    }
    if (itemStruct?.desc) {
      caption = itemStruct.desc;
    }

    const mediaList: ExtractedMedia[] = [];

    // Case A: Photo Slide Post (imagePost.images)
    if (
      itemStruct?.imagePost?.images &&
      Array.isArray(itemStruct.imagePost.images) &&
      itemStruct.imagePost.images.length > 0
    ) {
      const images = itemStruct.imagePost.images;
      images.forEach((img: any, idx: number) => {
        const slideNum = idx + 1;
        const allCandidates: string[] = [
          ...(img.displayImage?.urlList || []),
          ...(img.imageURL?.urlList || []),
          ...(img.thumbnail?.urlList || []),
        ];
        const candidateUrl = allCandidates.find((u) => typeof u === 'string' && isAllowedMediaHost(u).allowed);

        if (candidateUrl) {
          const width = img.displayImage?.width;
          const height = img.displayImage?.height;
          const resolution = width && height ? `Photo (${width}×${height})` : 'Original Photo';
          const filename = `tiktok_${shortcode}_slide_${slideNum}.jpg`;

          mediaList.push({
            id: `tiktok_${shortcode}_slide_${slideNum}_photo`,
            slideIndex: slideNum,
            type: 'image',
            url: candidateUrl,
            downloadUrl: `/api/download?url=${encodeURIComponent(candidateUrl)}&filename=${encodeURIComponent(filename)}`,
            previewUrl: candidateUrl,
            resolution,
            mimeType: 'image/jpeg',
            verified: true,
            label: `Slide ${slideNum} (Photo .jpg)`,
            width,
            height,
          });
        }
      });

      if (mediaList.length > 0) {
        return {
          mediaList,
          contentType: 'carousel',
          author,
          caption,
          shortcode,
          canonicalUrl: author ? `https://www.tiktok.com/@${author}/photo/${shortcode}` : canonicalUrl,
          embedUrl,
        };
      }
    }

    // Case B: Video Post (itemStruct.video)
    if (itemStruct?.video) {
      const video = itemStruct.video;

      // Find direct streaming URL: prioritize /aweme/v1/play/ endpoint which redirects cleanly to CDN
      let streamUrl: string | undefined;

      if (Array.isArray(video.bitrateInfo)) {
        for (const b of video.bitrateInfo) {
          const playCandidate = b.PlayAddr?.UrlList?.find((u: string) => u.includes('/aweme/v1/play/'));
          if (playCandidate) {
            streamUrl = playCandidate;
            break;
          }
        }
      }

      if (!streamUrl && Array.isArray(video.playAddr?.urlList)) {
        streamUrl = video.playAddr.urlList.find((u: string) => u.includes('/aweme/v1/play/')) || video.playAddr.urlList[0];
      }

      if (!streamUrl && typeof video.playAddr === 'string') {
        streamUrl = video.playAddr;
      }

      if (!streamUrl && typeof video.downloadAddr === 'string') {
        streamUrl = video.downloadAddr;
      }

      if (streamUrl && isAllowedMediaHost(streamUrl).allowed) {
        const width = video.width;
        const height = video.height;
        const resolution = width && height ? `${width}×${height}` : '제공 화질';
        const coverUrl = video.cover || video.originCover || oembedData?.thumbnail_url;
        const filename = `tiktok_${shortcode}.mp4`;

        mediaList.push({
          id: 'tiktok_single_video',
          type: 'video',
          url: streamUrl,
          downloadUrl: `/api/download?url=${encodeURIComponent(streamUrl)}&filename=${encodeURIComponent(filename)}`,
          previewUrl: coverUrl || streamUrl,
          resolution,
          mimeType: 'video/mp4',
          verified: true,
          label: 'Original Video (.mp4)',
          width,
          height,
          qualityOptions: [
            {
              id: 'tiktok_video_default',
              label: width && height ? `${width}×${height} (제공 화질)` : '제공 화질',
              resolution,
              width,
              height,
              url: streamUrl,
              downloadUrl: `/api/download?url=${encodeURIComponent(streamUrl)}&filename=${encodeURIComponent(filename)}`,
              mimeType: 'video/mp4',
              isDefault: true,
            },
          ],
        });

        // Add cover image if available and permitted
        if (coverUrl && isAllowedMediaHost(coverUrl).allowed) {
          const coverFilename = `tiktok_${shortcode}_cover.jpg`;
          mediaList.push({
            id: 'tiktok_video_cover',
            type: 'image',
            url: coverUrl,
            downloadUrl: `/api/download?url=${encodeURIComponent(coverUrl)}&filename=${encodeURIComponent(coverFilename)}`,
            previewUrl: coverUrl,
            resolution: 'Video Cover Photo',
            mimeType: 'image/jpeg',
            verified: true,
            label: 'Video Cover Photo (.jpg)',
          });
        }

        return {
          mediaList,
          contentType: 'video',
          author,
          caption,
          shortcode,
          canonicalUrl: author ? `https://www.tiktok.com/@${author}/video/${shortcode}` : canonicalUrl,
          embedUrl,
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Error in extractTiktokMedia:', err);
    return null;
  }
}
