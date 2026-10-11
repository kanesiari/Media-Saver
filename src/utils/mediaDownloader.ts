/**
 * Secure Media Downloader Module for Cloudflare Workers & Express
 * Enforces strict host whitelisting, SSRF protection, port verification,
 * credential rejection, MIME type validation, and streaming responses.
 */

export const ALLOWED_HOST_PATTERNS = [
  // Official Instagram & Threads CDN hosts (scontent, video, static on cdninstagram.com and fbcdn.net)
  /^(?:scontent|video|static)(?:-[a-zA-Z0-9]+)*(?:\.[a-zA-Z0-9-]+)*\.(?:cdninstagram\.com)$/i,
  /^(?:scontent|video|static)(?:-[a-zA-Z0-9]+)*(?:\.[a-zA-Z0-9-]+)*\.(?:fbcdn\.net)$/i,

  // Official TikTok CDN hosts & play redirect endpoints
  /^(?:[a-zA-Z0-9-]+\.)*tiktokcdn(?:-[a-zA-Z0-9-]+)*\.com$/i,
  /^(?:[a-zA-Z0-9-]+\.)*byteoversea\.com$/i,
  /^(?:[a-zA-Z0-9-]+\.)*ibytedtos\.com$/i,
  /^(?:www\.)?tiktok\.com$/i,
];

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
];

/**
 * Validates that the URL targets an approved, public HTTPS Meta CDN host.
 * Strictly prevents SSRF, credential embedding, non-standard ports, and subdomains tricks.
 */
export function isAllowedMediaHost(urlString: string): { allowed: boolean; reason?: string } {
  try {
    const parsed = new URL(urlString);

    // 1. Protocol must be HTTPS only
    if (parsed.protocol !== 'https:') {
      return { allowed: false, reason: 'Protocol must be HTTPS.' };
    }

    // 2. Reject credentials in URL (https://user:pass@host)
    if (parsed.username || parsed.password) {
      return { allowed: false, reason: 'User credentials in URL are strictly prohibited.' };
    }

    // 3. Port must be default HTTPS port (443 or empty)
    if (parsed.port && parsed.port !== '443') {
      return { allowed: false, reason: 'Non-standard port is prohibited.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 4. Block localhost, loopbacks, and private/internal IP blocks
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname.startsWith('169.254.') ||
      hostname.startsWith('0.') ||
      hostname.startsWith('0x') ||
      /^\d+$/.test(hostname)
    ) {
      return { allowed: false, reason: 'Targeting internal, loopback, or private IP is prohibited.' };
    }

    // 5. Must match approved Meta CDN hosts exactly
    const isMatched = ALLOWED_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
    if (!isMatched) {
      return { allowed: false, reason: 'Host is not in the approved Meta CDN whitelist.' };
    }

    return { allowed: true };
  } catch {
    return { allowed: false, reason: 'Malformed URL.' };
  }
}

/**
 * Sanitizes requested filenames to prevent header injection or directory traversal.
 * Strictly allows only alphanumeric, underscore, hyphen, and recognized safe extension.
 */
export function sanitizeFilename(filename?: string, defaultExt = 'jpg'): string {
  if (!filename) return `media_${Date.now()}.${defaultExt}`;
  
  // 1. Strip control chars and newlines
  let clean = filename.replace(/[\r\n\t\x00-\x1f]/g, '_');
  // 2. Remove all directory traversal sequences like ../ or ..\
  clean = clean.replace(/\.\.+[/\\?]*/g, '');
  // 3. Remove illegal characters for filenames
  clean = clean.replace(/[/\\?%*:|"<>]/g, '_').trim();
  
  // Extract extension if valid
  const match = clean.match(/^([\s\S]+?)(?:\.([a-zA-Z0-9]{3,4}))?$/);
  const baseName = match && match[1] ? match[1].replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50) : `media_${Date.now()}`;
  const ext = match && match[2] ? match[2].toLowerCase() : defaultExt;
  
  const validExts = ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'webm'];
  const safeExt = validExts.includes(ext) ? ext : defaultExt;

  return `${baseName || `media_${Date.now()}`}.${safeExt}`;
}

/**
 * Safely redacts sensitive query parameters from media URLs for logging or diagnostic output.
 */
export function redactMediaUrl(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}?[redacted-signature]`;
  } catch {
    return '[invalid-url]';
  }
}

/**
 * Safely streams the media file from upstream CDN to the client without buffering.
 */
export async function streamMediaDownload(
  mediaUrl: string,
  suggestedFilename?: string,
  redirectCount = 0
): Promise<Response> {
  // Prevent infinite redirect loops
  if (redirectCount > 3) {
    return new Response(
      JSON.stringify({ error: 'Too many redirects from upstream CDN.' }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  const hostCheck = isAllowedMediaHost(mediaUrl);
  if (!hostCheck.allowed) {
    return new Response(
      JSON.stringify({
        error: `Forbidden host: ${hostCheck.reason || 'Media URL does not belong to an approved Meta CDN.'}`,
      }),
      {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const requestHeaders: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,video/*,*/*;q=0.8',
    };

    const targetUrlObj = new URL(mediaUrl);
    if (targetUrlObj.hostname.includes('tiktok') || targetUrlObj.hostname.includes('byte')) {
      requestHeaders['Referer'] = 'https://www.tiktok.com/';
    }

    // Perform manual redirect check to prevent open redirect SSRF
    const upstreamRes = await fetch(mediaUrl, {
      method: 'GET',
      headers: requestHeaders,
      redirect: 'manual',
    });

    // Check for redirects (301, 302, 307, 308)
    if (upstreamRes.status >= 300 && upstreamRes.status < 400) {
      const location = upstreamRes.headers.get('location');
      if (!location) {
        return new Response(
          JSON.stringify({ error: 'Upstream returned redirect without Location header.' }),
          {
            status: 502,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      // Resolve relative redirect against base URL
      const resolvedLocation = new URL(location, mediaUrl).toString();
      const redirectHostCheck = isAllowedMediaHost(resolvedLocation);

      if (!redirectHostCheck.allowed) {
        return new Response(
          JSON.stringify({
            error: `Forbidden redirect: Destination ${redirectHostCheck.reason || 'targets an unapproved host.'}`,
          }),
          {
            status: 403,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      }

      return streamMediaDownload(resolvedLocation, suggestedFilename, redirectCount + 1);
    }

    if (!upstreamRes.ok) {
      return new Response(
        JSON.stringify({
          error: `Upstream CDN returned status ${upstreamRes.status}. The media asset may have expired or is restricted.`,
        }),
        {
          status: upstreamRes.status,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const rawContentType = upstreamRes.headers.get('content-type') || '';
    const contentType = rawContentType.split(';')[0].trim().toLowerCase();

    // Verify MIME type is strictly an authorized media format
    if (!ALLOWED_MIME_TYPES.includes(contentType)) {
      return new Response(
        JSON.stringify({
          error: `Invalid MIME type: Upstream returned "${contentType}", which is not an authorized image or video file.`,
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Determine correct extension based on verified MIME type
    let safeExtension = 'jpg';
    if (contentType === 'video/mp4') safeExtension = 'mp4';
    else if (contentType === 'video/webm') safeExtension = 'webm';
    else if (contentType === 'image/png') safeExtension = 'png';
    else if (contentType === 'image/webp') safeExtension = 'webp';

    const finalFilename = sanitizeFilename(suggestedFilename, safeExtension);

    // Stream the body directly without buffering into memory
    return new Response(upstreamRes.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${finalFilename}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        error: err?.message || 'Failed to stream media from upstream CDN.',
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
