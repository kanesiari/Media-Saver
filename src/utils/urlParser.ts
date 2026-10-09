import { ParsedUrlData } from '../types';
import { parseTiktokUrl } from './tiktokExtractor';

export const SAMPLE_URLS = [
  {
    label: 'Instagram Reel',
    url: 'https://www.instagram.com/reel/C8qKz9xM7pL/',
    platform: 'instagram' as const,
  },
  {
    label: 'Instagram Post / Carousel',
    url: 'https://www.instagram.com/p/DB1eN4zOvqP/',
    platform: 'instagram' as const,
  },
  {
    label: 'Threads Post (Photo)',
    url: 'https://www.threads.net/@zuck/post/Ddt4W2Qx-D1',
    platform: 'threads' as const,
  },
  {
    label: 'TikTok Video',
    url: 'https://www.tiktok.com/@tiktok/video/7106594312292453675',
    platform: 'tiktok' as const,
  },
];

export function parseSocialUrl(input: string): ParsedUrlData {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      isValid: false,
      rawUrl: trimmed,
      platform: 'unknown',
      contentType: 'unknown',
      errorMessage: 'Please enter a URL to analyze.',
    };
  }

  // Ensure scheme
  let urlToTest = trimmed;
  if (!/^https?:\/\//i.test(urlToTest)) {
    urlToTest = 'https://' + urlToTest;
  }

  try {
    const urlObj = new URL(urlToTest);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;

    // Instagram check
    if (hostname.includes('instagram.com') || hostname === 'instagr.am') {
      // Reels: /reel/CODE/ or /reels/CODE/
      const reelMatch = pathname.match(/\/(?:reel|reels)\/([A-Za-z0-9_-]+)/);
      if (reelMatch) {
        return {
          isValid: true,
          rawUrl: trimmed,
          platform: 'instagram',
          contentType: 'reel',
          id: reelMatch[1],
        };
      }

      // Posts: /p/CODE/
      const postMatch = pathname.match(/\/p\/([A-Za-z0-9_-]+)/);
      if (postMatch) {
        return {
          isValid: true,
          rawUrl: trimmed,
          platform: 'instagram',
          contentType: 'post',
          id: postMatch[1],
        };
      }

      // TV / Videos: /tv/CODE/
      const tvMatch = pathname.match(/\/tv\/([A-Za-z0-9_-]+)/);
      if (tvMatch) {
        return {
          isValid: true,
          rawUrl: trimmed,
          platform: 'instagram',
          contentType: 'video',
          id: tvMatch[1],
        };
      }

      return {
        isValid: false,
        rawUrl: trimmed,
        platform: 'instagram',
        contentType: 'unknown',
        errorMessage: 'The link looks like an Instagram URL, but no valid post, reel, or video ID was detected. Please provide a direct public post link.',
      };
    }

    // Threads check
    if (hostname.includes('threads.net') || hostname.includes('threads.com')) {
      // Threads format: /@author/post/CODE
      const threadsMatch = pathname.match(/\/@([A-Za-z0-9_.-]+)\/post\/([A-Za-z0-9_-]+)/);
      if (threadsMatch) {
        return {
          isValid: true,
          rawUrl: trimmed,
          platform: 'threads',
          contentType: 'post',
          author: threadsMatch[1],
          id: threadsMatch[2],
        };
      }

      // Alternative: /post/CODE
      const shortThreadsMatch = pathname.match(/\/post\/([A-Za-z0-9_-]+)/);
      if (shortThreadsMatch) {
        return {
          isValid: true,
          rawUrl: trimmed,
          platform: 'threads',
          contentType: 'post',
          id: shortThreadsMatch[1],
        };
      }

      // Short format: /t/CODE
      const tThreadsMatch = pathname.match(/\/t\/([A-Za-z0-9_-]+)/);
      if (tThreadsMatch) {
        return {
          isValid: true,
          rawUrl: trimmed,
          platform: 'threads',
          contentType: 'post',
          id: tThreadsMatch[1],
        };
      }

      return {
        isValid: false,
        rawUrl: trimmed,
        platform: 'threads',
        contentType: 'unknown',
        errorMessage: 'The link looks like a Threads URL, but no specific post ID was found. Please copy a direct link to a public thread post.',
      };
    }

    // TikTok check
    if (
      hostname.includes('tiktok.com') ||
      hostname === 'vm.tiktok.com' ||
      hostname === 'vt.tiktok.com'
    ) {
      const { id, author, isPhotoPost } = parseTiktokUrl(trimmed);
      const isShort =
        hostname === 'vm.tiktok.com' ||
        hostname === 'vt.tiktok.com' ||
        pathname.startsWith('/t/');

      if (id) {
        return {
          isValid: true,
          rawUrl: trimmed,
          platform: 'tiktok',
          contentType: isPhotoPost ? 'photo' : 'video',
          id,
          author,
        };
      }

      if (isShort) {
        return {
          isValid: true,
          rawUrl: trimmed,
          platform: 'tiktok',
          contentType: 'video',
        };
      }

      return {
        isValid: false,
        rawUrl: trimmed,
        platform: 'tiktok',
        contentType: 'unknown',
        errorMessage:
          'The link looks like a TikTok URL, but no specific video or photo ID was found. Please copy a direct link to a public TikTok video or photo post.',
      };
    }

    return {
      isValid: false,
      rawUrl: trimmed,
      platform: 'unknown',
      contentType: 'unknown',
      errorMessage:
        'Unsupported domain. MediaSave supports public URLs from Instagram (instagram.com), Threads (threads.net), and TikTok (tiktok.com).',
    };
  } catch {
    return {
      isValid: false,
      rawUrl: trimmed,
      platform: 'unknown',
      contentType: 'unknown',
      errorMessage: 'Invalid URL format. Please paste a valid web address starting with https://',
    };
  }
}
