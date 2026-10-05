/**
 * Isolated Download Engine Verification Runner (Offline Experiment)
 * Evaluates streamMediaDownload() with simulated real JPEG/MP4 binary responses
 * without making external network calls to Instagram.
 */

import { streamMediaDownload } from '../../src/utils/mediaDownloader';
import {
  createValidJpegBuffer,
  createValidMp4Buffer,
  streamToUint8Array,
} from './mock-media';

let testCount = 0;
let passedCount = 0;
let failedCount = 0;

function assert(description: string, passed: boolean, details?: string) {
  testCount++;
  if (passed) {
    passedCount++;
    console.log(`[PASS] ${description}`);
  } else {
    failedCount++;
    console.error(`[FAIL] ${description}${details ? ` -> ${details}` : ''}`);
  }
}

// Preserve original fetch
const originalFetch = globalThis.fetch;

async function runDownloadEngineTests() {
  console.log('================================================================');
  console.log('DOWNLOAD ENGINE ISOLATION LAB — STREAMING & INTEGRITY TEST SUITE');
  console.log('================================================================\n');

  try {
    // -------------------------------------------------------------
    // Test 1: Real JPEG Image Binary Streaming & Verification
    // -------------------------------------------------------------
    console.log('--- 1. REAL JPEG BINARY STREAMING TEST ---');
    const jpegBuffer = createValidJpegBuffer();
    
    // Mock upstream response for approved Instagram CDN
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = String(input);
      if (urlStr.includes('scontent-iad3-2.cdninstagram.com/photo.jpg')) {
        return new Response(jpegBuffer as unknown as BodyInit, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Length': String(jpegBuffer.byteLength),
          },
        });
      }
      return new Response('Not found', { status: 404 });
    };

    const jpegRes = await streamMediaDownload(
      'https://scontent-iad3-2.cdninstagram.com/photo.jpg',
      'vacation_sunset.jpg'
    );

    assert('JPEG stream returns HTTP 200', jpegRes.status === 200);
    assert('JPEG Content-Type header is image/jpeg', jpegRes.headers.get('Content-Type') === 'image/jpeg');
    assert(
      'Content-Disposition is attachment with sanitized filename',
      jpegRes.headers.get('Content-Disposition') === 'attachment; filename="vacation_sunset.jpg"'
    );
    assert('X-Content-Type-Options is nosniff', jpegRes.headers.get('X-Content-Type-Options') === 'nosniff');

    const receivedJpegBytes = await streamToUint8Array(jpegRes.body as any);
    assert('Received exact JPEG byte length', receivedJpegBytes.length === jpegBuffer.length);
    assert(
      'Valid JPEG magic start marker (FF D8)',
      receivedJpegBytes[0] === 0xff && receivedJpegBytes[1] === 0xd8
    );
    assert(
      'Valid JPEG magic end marker (FF D9)',
      receivedJpegBytes[receivedJpegBytes.length - 2] === 0xff &&
        receivedJpegBytes[receivedJpegBytes.length - 1] === 0xd9
    );
    console.log(`  Stream verified: ${receivedJpegBytes.length} bytes delivered intact.`);

    // -------------------------------------------------------------
    // Test 2: Real MP4 Video Binary Streaming & Verification
    // -------------------------------------------------------------
    console.log('\n--- 2. REAL MP4 VIDEO BINARY STREAMING TEST ---');
    const mp4Buffer = createValidMp4Buffer();

    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = String(input);
      if (urlStr.includes('scontent-iad3-2.cdninstagram.com/reel.mp4')) {
        return new Response(mp4Buffer as unknown as BodyInit, {
          status: 200,
          headers: {
            'Content-Type': 'video/mp4',
            'Content-Length': String(mp4Buffer.byteLength),
          },
        });
      }
      return new Response('Not found', { status: 404 });
    };

    const mp4Res = await streamMediaDownload(
      'https://scontent-iad3-2.cdninstagram.com/reel.mp4',
      'highlight_clip.mp4'
    );

    assert('MP4 stream returns HTTP 200', mp4Res.status === 200);
    assert('MP4 Content-Type header is video/mp4', mp4Res.headers.get('Content-Type') === 'video/mp4');
    assert(
      'Content-Disposition is attachment with sanitized filename',
      mp4Res.headers.get('Content-Disposition') === 'attachment; filename="highlight_clip.mp4"'
    );

    const receivedMp4Bytes = await streamToUint8Array(mp4Res.body as any);
    assert('Received exact MP4 byte length', receivedMp4Bytes.length === mp4Buffer.length);
    // Check ftyp box (bytes 4-7: 0x66, 0x74, 0x79, 0x70)
    const isFtyp =
      receivedMp4Bytes[4] === 0x66 &&
      receivedMp4Bytes[5] === 0x74 &&
      receivedMp4Bytes[6] === 0x79 &&
      receivedMp4Bytes[7] === 0x70;
    assert('Valid MP4 container ftyp box detected', isFtyp);
    console.log(`  Stream verified: ${receivedMp4Bytes.length} bytes delivered intact.`);

    // -------------------------------------------------------------
    // Test 3: Disallowed MIME Type Rejection (HTML Error/Challenge)
    // -------------------------------------------------------------
    console.log('\n--- 3. DISALLOWED MIME TYPE REJECTION ---');
    globalThis.fetch = async () => {
      return new Response('<!DOCTYPE html><html><body>Error page</body></html>', {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    };

    const htmlRes = await streamMediaDownload('https://scontent-iad3-2.cdninstagram.com/fake.jpg');
    assert('Rejects upstream text/html with HTTP 400', htmlRes.status === 400);
    const htmlErr = await htmlRes.json();
    assert('Error message explicitly identifies invalid MIME type', String(htmlErr.error).includes('Invalid MIME type'));

    // -------------------------------------------------------------
    // Test 4: Empty Response (0 bytes) Behavior
    // -------------------------------------------------------------
    console.log('\n--- 4. EMPTY RESPONSE HANDLING ---');
    globalThis.fetch = async () => {
      return new Response(new Uint8Array(0) as unknown as BodyInit, {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' },
      });
    };

    const emptyRes = await streamMediaDownload('https://scontent-iad3-2.cdninstagram.com/empty.jpg');
    assert('Empty upstream response returns HTTP 200', emptyRes.status === 200);
    const emptyBytes = await streamToUint8Array(emptyRes.body as any);
    assert('Delivers 0 bytes without hanging', emptyBytes.length === 0);

    // -------------------------------------------------------------
    // Test 5: Upstream Expiration / HTTP 403 Propagation
    // -------------------------------------------------------------
    console.log('\n--- 5. UPSTREAM EXPIRATION / 403 HANDLING ---');
    globalThis.fetch = async () => {
      return new Response('URL signature expired', {
        status: 403,
        statusText: 'Forbidden',
      });
    };

    const expiredRes = await streamMediaDownload('https://scontent-iad3-2.cdninstagram.com/expired.jpg');
    assert('Propagates upstream 403 status', expiredRes.status === 403);
    const expiredBody = await expiredRes.json();
    assert('Identifies upstream status in message', String(expiredBody.error).includes('403'));

    // -------------------------------------------------------------
    // Test 6: Safe Redirect Following (Approved CDN to Approved CDN)
    // -------------------------------------------------------------
    console.log('\n--- 6. APPROVED CDN REDIRECT HANDLING ---');
    globalThis.fetch = async (input: RequestInfo | URL) => {
      const urlStr = String(input);
      if (urlStr === 'https://scontent.cdninstagram.com/initial.jpg') {
        return new Response(null, {
          status: 302,
          headers: {
            Location: 'https://scontent-iad3-2.cdninstagram.com/redirected.jpg',
          },
        });
      }
      if (urlStr === 'https://scontent-iad3-2.cdninstagram.com/redirected.jpg') {
        return new Response(jpegBuffer as unknown as BodyInit, {
          status: 200,
          headers: { 'Content-Type': 'image/jpeg' },
        });
      }
      return new Response('Not found', { status: 404 });
    };

    const redirectRes = await streamMediaDownload('https://scontent.cdninstagram.com/initial.jpg');
    assert('Follows approved CDN redirect to HTTP 200', redirectRes.status === 200);
    const redirectBytes = await streamToUint8Array(redirectRes.body as any);
    assert('Redirected stream payload matches expected byte count', redirectBytes.length === jpegBuffer.length);

    // -------------------------------------------------------------
    // Test 7: SSRF Open Redirect Prevention
    // -------------------------------------------------------------
    console.log('\n--- 7. SSRF OPEN REDIRECT PREVENTION ---');
    globalThis.fetch = async () => {
      return new Response(null, {
        status: 302,
        headers: {
          Location: 'http://169.254.169.254/latest/meta-data',
        },
      });
    };

    const ssrfRedirectRes = await streamMediaDownload('https://scontent.cdninstagram.com/trap.jpg');
    assert('Blocks redirect targeting cloud metadata IP with HTTP 403', ssrfRedirectRes.status === 403);
    const ssrfRedirectErr = await ssrfRedirectRes.json();
    assert(
      'Error message identifies forbidden redirect destination',
      String(ssrfRedirectErr.error).includes('Forbidden redirect')
    );

    // -------------------------------------------------------------
    // Test 8: Unapproved Host Direct Rejection (Pre-fetch Guard)
    // -------------------------------------------------------------
    console.log('\n--- 8. UNAPPROVED HOST PRE-FETCH REJECTION ---');
    let fetchCalled = false;
    globalThis.fetch = async () => {
      fetchCalled = true;
      return new Response('bad');
    };

    const unapprovedRes = await streamMediaDownload('https://attacker-site.com/exploit.jpg');
    assert('Rejects non-CDN host with HTTP 403', unapprovedRes.status === 403);
    assert('Network fetch is NEVER called for unapproved hosts', fetchCalled === false);

    // -------------------------------------------------------------
    // Test 9: Filename Sanitization & Directory Traversal Stripping
    // -------------------------------------------------------------
    console.log('\n--- 9. FILENAME SANITIZATION IN STREAMING HEADER ---');
    globalThis.fetch = async () => {
      return new Response(mp4Buffer as unknown as BodyInit, {
        status: 200,
        headers: { 'Content-Type': 'video/mp4' },
      });
    };

    const sanitizedRes = await streamMediaDownload(
      'https://scontent-iad3-2.cdninstagram.com/reel.mp4',
      '../../../../etc/passwd.mp4'
    );
    const dispHeader = sanitizedRes.headers.get('Content-Disposition') || '';
    assert('Directory traversal stripped from filename', dispHeader.includes('filename="etc_passwd.mp4"'));
    assert('No path separators in Content-Disposition', !dispHeader.includes('/') && !dispHeader.includes('\\'));

    // -------------------------------------------------------------
    // Test 10: Infinite Redirect Protection (Max Redirect Depth)
    // -------------------------------------------------------------
    console.log('\n--- 10. INFINITE REDIRECT PROTECTION ---');
    globalThis.fetch = async () => {
      return new Response(null, {
        status: 302,
        headers: {
          Location: 'https://scontent.cdninstagram.com/loop.jpg',
        },
      });
    };

    const loopRes = await streamMediaDownload('https://scontent.cdninstagram.com/loop.jpg');
    assert('Detects redirect loop and aborts with HTTP 502', loopRes.status === 502);
    const loopErr = await loopRes.json();
    assert('Error message explicitly states Too many redirects', String(loopErr.error).includes('Too many redirects'));

    console.log('\n================================================================');
    console.log(`TOTAL TESTS: ${testCount} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
    console.log('================================================================\n');

    if (failedCount > 0) {
      process.exit(1);
    }
  } finally {
    // Always restore original fetch
    globalThis.fetch = originalFetch;
  }
}

runDownloadEngineTests().catch((err) => {
  console.error('Fatal error in download engine test runner:', err);
  process.exit(1);
});
