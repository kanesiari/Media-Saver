/**
 * Security and URL Validator for Instagram JSON Lab (Offline Experiment)
 * Evaluates host, protocol, SSRF risk, and generates safe masked URLs for logs.
 */

const ALLOWED_CDN_HOST_PATTERNS = [
  /^scontent(?:-[a-zA-Z0-9-]+)*\.(?:cdninstagram\.com)$/i,
  /^scontent(?:\.[a-zA-Z0-9-]+)*\.(?:fbcdn\.net)$/i,
  /^(?:static|video)[a-zA-Z0-9-]*\.cdninstagram\.com$/i,
];

/**
 * Masks a URL to prevent logging full query strings or sensitive signature tokens in test output.
 * Example: https://scontent-iad3-2.cdninstagram.com/v/t51/photo.jpg?_nc_cat=1 -> https://scontent-iad3-2.cdninstagram.com/.../photo.jpg
 */
export function maskUrl(urlString: string): string {
  try {
    const parsed = new URL(urlString);
    const pathnameParts = parsed.pathname.split('/').filter(Boolean);
    const lastPart = pathnameParts.length > 0 ? pathnameParts[pathnameParts.length - 1] : 'media';
    return `${parsed.protocol}//${parsed.hostname}/.../${lastPart}`;
  } catch {
    return '[MALFORMED_URL]';
  }
}

/**
 * Validates whether a candidate URL is eligible for secure binary download.
 * Distinct from URL extraction: an extracted URL may exist in JSON but be rejected for download.
 */
export function validateDownloadEligibility(urlString: string): {
  allowed: boolean;
  reason?: string;
} {
  try {
    if (!urlString || typeof urlString !== 'string') {
      return { allowed: false, reason: 'Empty or invalid URL type' };
    }

    const parsed = new URL(urlString.trim());

    // 1. Must be HTTPS
    if (parsed.protocol !== 'https:') {
      return { allowed: false, reason: `Insecure protocol: ${parsed.protocol}` };
    }

    // 2. Reject credentials in URL
    if (parsed.username || parsed.password) {
      return { allowed: false, reason: 'URL contains embedded credentials' };
    }

    // 3. Reject non-standard ports
    if (parsed.port && parsed.port !== '443') {
      return { allowed: false, reason: `Non-standard port: ${parsed.port}` };
    }

    const hostname = parsed.hostname.toLowerCase();

    // 4. Reject localhost, private/loopback IP blocks (SSRF)
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('169.254.') ||
      /^\d+$/.test(hostname)
    ) {
      return { allowed: false, reason: 'Targeting internal or loopback IP is prohibited' };
    }

    // 5. Host pattern match
    const isAllowedHost = ALLOWED_CDN_HOST_PATTERNS.some((pattern) => pattern.test(hostname));
    if (!isAllowedHost) {
      return { allowed: false, reason: `Host "${hostname}" is not in approved CDN whitelist` };
    }

    return { allowed: true };
  } catch (err: any) {
    return { allowed: false, reason: `Malformed URL string: ${err.message}` };
  }
}
