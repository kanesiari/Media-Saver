import { ExtractedMedia, VideoQualityOption } from '../types';
import { isAllowedMediaHost } from './mediaDownloader';

export interface ThreadsExtractResult {
  mediaList: ExtractedMedia[];
  contentType: 'photo' | 'video' | 'carousel';
  author?: string;
  caption?: string;
}

/**
 * Searches a nested JS object recursively to find the Threads post media node.
 */
function findThreadsMediaNode(obj: any): any | null {
  if (!obj || typeof obj !== 'object') return null;

  // Direct match on media node with image, video, or carousel versions
  if (
    obj.data &&
    obj.data.media &&
    (obj.data.media.image_versions2 ||
      obj.data.media.video_versions ||
      obj.data.media.carousel_media)
  ) {
    return obj.data.media;
  }

  if (
    obj.image_versions2 ||
    obj.video_versions ||
    obj.carousel_media
  ) {
    // Ensure it looks like a post node (has code, id, or pk)
    if (obj.code || obj.id || obj.pk) {
      return obj;
    }
  }

  for (const key of Object.keys(obj)) {
    const found = findThreadsMediaNode(obj[key]);
    if (found) return found;
  }

  return null;
}

/**
 * Extracts public media (images, videos, carousels) from a public Threads post.
 * Uses official public server-side rendered Relay preloader data.
 */
export async function extractThreadsMedia(
  shortcode: string,
  authorUsername?: string
): Promise<ThreadsExtractResult | null> {
  try {
    // Construct the canonical URL for fetching
    const targetUrl = authorUsername
      ? `https://www.threads.net/@${authorUsername}/post/${shortcode}`
      : `https://www.threads.net/t/${shortcode}`;

    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });

    if (!res.ok) {
      return null;
    }

    const html = await res.text();

    // 1. Extract author and caption from HTML meta if available
    let author = authorUsername;
    if (!author) {
      const authorMatch =
        html.match(/property="og:title"\s+content="([^"]*)\s*\(@([A-Za-z0-9_.-]+)\)"/i) ||
        html.match(/<title[^>]*>.*?&#064;([A-Za-z0-9_.-]+)\)/i);
      if (authorMatch) {
        author = authorMatch[2] || authorMatch[1];
      }
    }

    let caption: string | undefined;
    const ogDescMatch =
      html.match(/property="og:description"\s+content="([^"]*)"/i) ||
      html.match(/name="description"\s+content="([^"]*)"/i);
    if (ogDescMatch && ogDescMatch[1] && !ogDescMatch[1].startsWith('Join Threads')) {
      caption = ogDescMatch[1].trim();
    }

    // 2. Locate all application/json script blocks
    const scriptRegex = /<script[^>]*type="application\/json"[^>]*>([\s\S]*?)<\/script>/gi;
    let match: RegExpExecArray | null;
    let targetMediaNode: any = null;

    while ((match = scriptRegex.exec(html)) !== null) {
      const rawScript = match[1];
      if (
        rawScript.includes('BarcelonaPostPageTargetQueryRelayPreloader') ||
        rawScript.includes('"data":{"media":') ||
        rawScript.includes(shortcode)
      ) {
        try {
          const parsed = JSON.parse(rawScript);
          const found = findThreadsMediaNode(parsed);
          if (found) {
            targetMediaNode = found;
            break;
          }
        } catch {
          // Continue searching other script blocks
        }
      }
    }

    if (!targetMediaNode) {
      return null;
    }

    // Update author from media user profile if present
    if (targetMediaNode.user?.username) {
      author = targetMediaNode.user.username;
    }

    const mediaList: ExtractedMedia[] = [];

    // Case A: Carousel Post (Multiple Media Items)
    if (
      Array.isArray(targetMediaNode.carousel_media) &&
      targetMediaNode.carousel_media.length > 0
    ) {
      targetMediaNode.carousel_media.forEach((item: any, idx: number) => {
        const slideNum = idx + 1;
        const isVideo = Array.isArray(item.video_versions) && item.video_versions.length > 0;

        if (isVideo) {
          const primaryVideo = item.video_versions[0];
          const videoUrl = primaryVideo.url;
          if (videoUrl && isAllowedMediaHost(videoUrl).allowed) {
            const filename = `threads_${shortcode}_slide_${slideNum}.mp4`;
            const width = primaryVideo.width || item.original_width;
            const height = primaryVideo.height || item.original_height;
            const resolution = width && height ? `${width}×${height}` : '해상도 정보 없음';

            // Find poster image for slide preview
            const poster = item.image_versions2?.candidates?.[0]?.url;

            mediaList.push({
              id: `threads_${shortcode}_slide_${slideNum}_video`,
              slideIndex: slideNum,
              type: 'video',
              url: videoUrl,
              downloadUrl: `/api/download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`,
              previewUrl: poster || videoUrl,
              resolution,
              mimeType: 'video/mp4',
              verified: true,
              label: `Slide ${slideNum} (Video .mp4)`,
              width,
              height,
              qualityOptions: [
                {
                  id: `threads_slide_${slideNum}_quality`,
                  label: width && height ? `${width}×${height} (제공 화질)` : '제공 화질',
                  resolution,
                  width,
                  height,
                  url: videoUrl,
                  downloadUrl: `/api/download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`,
                  mimeType: 'video/mp4',
                  isDefault: true,
                },
              ],
            });
          }
        } else if (item.image_versions2?.candidates?.length > 0) {
          // Photo item: Select highest resolution candidate
          const primaryImg = item.image_versions2.candidates[0];
          const imgUrl = primaryImg.url;
          if (imgUrl && isAllowedMediaHost(imgUrl).allowed) {
            const filename = `threads_${shortcode}_slide_${slideNum}.jpg`;
            const width = primaryImg.width || item.original_width;
            const height = primaryImg.height || item.original_height;
            const resolution = width && height ? `Photo (${width}×${height})` : 'Original Photo';

            mediaList.push({
              id: `threads_${shortcode}_slide_${slideNum}_photo`,
              slideIndex: slideNum,
              type: 'image',
              url: imgUrl,
              downloadUrl: `/api/download?url=${encodeURIComponent(imgUrl)}&filename=${encodeURIComponent(filename)}`,
              previewUrl: imgUrl,
              resolution,
              mimeType: 'image/jpeg',
              verified: true,
              label: `Slide ${slideNum} (Photo .jpg)`,
              width,
              height,
            });
          }
        }
      });

      if (mediaList.length > 0) {
        return {
          mediaList,
          contentType: 'carousel',
          author,
          caption,
        };
      }
    }

    // Case B: Single Video Post
    if (
      Array.isArray(targetMediaNode.video_versions) &&
      targetMediaNode.video_versions.length > 0
    ) {
      const primaryVideo = targetMediaNode.video_versions[0];
      const videoUrl = primaryVideo.url;

      if (videoUrl && isAllowedMediaHost(videoUrl).allowed) {
        const filename = `threads_${shortcode}.mp4`;
        const width = primaryVideo.width || targetMediaNode.original_width;
        const height = primaryVideo.height || targetMediaNode.original_height;
        const resolution = width && height ? `${width}×${height}` : '해상도 정보 없음';

        // Check for poster preview
        const posterUrl = targetMediaNode.image_versions2?.candidates?.[0]?.url;

        mediaList.push({
          id: 'threads_single_video',
          type: 'video',
          url: videoUrl,
          downloadUrl: `/api/download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`,
          previewUrl: posterUrl || videoUrl,
          resolution,
          mimeType: 'video/mp4',
          verified: true,
          label: 'Original Video (.mp4)',
          width,
          height,
          qualityOptions: [
            {
              id: 'threads_single_video_q1',
              label: width && height ? `${width}×${height} (제공 화질)` : '제공 화질',
              resolution,
              width,
              height,
              url: videoUrl,
              downloadUrl: `/api/download?url=${encodeURIComponent(videoUrl)}&filename=${encodeURIComponent(filename)}`,
              mimeType: 'video/mp4',
              isDefault: true,
            },
          ],
        });

        // Add poster image as video cover photo
        if (posterUrl && isAllowedMediaHost(posterUrl).allowed) {
          const coverFilename = `threads_${shortcode}_cover.jpg`;
          mediaList.push({
            id: 'threads_video_cover',
            type: 'image',
            url: posterUrl,
            downloadUrl: `/api/download?url=${encodeURIComponent(posterUrl)}&filename=${encodeURIComponent(coverFilename)}`,
            previewUrl: posterUrl,
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
        };
      }
    }

    // Case C: Single Photo Post
    if (
      targetMediaNode.image_versions2?.candidates &&
      targetMediaNode.image_versions2.candidates.length > 0
    ) {
      const primaryImg = targetMediaNode.image_versions2.candidates[0];
      const imgUrl = primaryImg.url;

      if (imgUrl && isAllowedMediaHost(imgUrl).allowed) {
        const filename = `threads_${shortcode}.jpg`;
        const width = primaryImg.width || targetMediaNode.original_width;
        const height = primaryImg.height || targetMediaNode.original_height;
        const resolution = width && height ? `Photo (${width}×${height})` : 'Original Photo';

        mediaList.push({
          id: 'threads_single_photo',
          type: 'image',
          url: imgUrl,
          downloadUrl: `/api/download?url=${encodeURIComponent(imgUrl)}&filename=${encodeURIComponent(filename)}`,
          previewUrl: imgUrl,
          resolution,
          mimeType: 'image/jpeg',
          verified: true,
          label: 'Original Photo (.jpg)',
          width,
          height,
        });

        return {
          mediaList,
          contentType: 'photo',
          author,
          caption,
        };
      }
    }

    return null;
  } catch (err) {
    console.error('Error in extractThreadsMedia:', err);
    return null;
  }
}
