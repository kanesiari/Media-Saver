import { isAllowedMediaHost, sanitizeFilename, streamMediaDownload } from '../src/utils/mediaDownloader';
import { analyzePost } from '../src/utils/instagramExtractor';

async function runAllTests() {
  console.log('====================================================');
  console.log('STARTING RIGOROUS SECURITY & DOWNLOAD TEST SUITE');
  console.log('====================================================\n');

  let passedCount = 0;
  let failedCount = 0;

  function assert(title: string, condition: boolean, extraInfo?: string) {
    if (condition) {
      console.log(`[PASS] ${title}`);
      passedCount++;
    } else {
      console.error(`[FAIL] ${title} - ${extraInfo || ''}`);
      failedCount++;
    }
  }

  // 1. Host Validation & SSRF Suite
  console.log('--- 1. HOST VALIDATION & SSRF TESTS ---');
  
  assert(
    'Permits official scontent.cdninstagram.com',
    isAllowedMediaHost('https://scontent.cdninstagram.com/v/t51/photo.jpg').allowed === true
  );

  assert(
    'Permits regional scontent-iad3-2.cdninstagram.com',
    isAllowedMediaHost('https://scontent-iad3-2.cdninstagram.com/v/t51/photo.jpg').allowed === true
  );

  assert(
    'Permits official fbcdn.net host (scontent.xx.fbcdn.net)',
    isAllowedMediaHost('https://scontent.xx.fbcdn.net/v/t51/photo.jpg').allowed === true
  );

  assert(
    'Permits regional fbcdn.net host with cluster dash (scontent-iad3-1.xx.fbcdn.net)',
    isAllowedMediaHost('https://scontent-iad3-1.xx.fbcdn.net/v/t51/photo.jpg').allowed === true
  );

  assert(
    'Permits regional cdninstagram host with cluster dash (scontent-iad3-1.xx.cdninstagram.com)',
    isAllowedMediaHost('https://scontent-iad3-1.xx.cdninstagram.com/v/t51/photo.jpg').allowed === true
  );

  assert(
    'Blocks plain HTTP protocol',
    isAllowedMediaHost('http://scontent.cdninstagram.com/v/t51/photo.jpg').allowed === false
  );

  assert(
    'Blocks non-standard port (:8443)',
    isAllowedMediaHost('https://scontent.cdninstagram.com:8443/v/t51/photo.jpg').allowed === false
  );

  assert(
    'Blocks embedded credentials (user:pass@)',
    isAllowedMediaHost('https://admin:secret@scontent.cdninstagram.com/photo.jpg').allowed === false
  );

  assert(
    'Blocks localhost SSRF',
    isAllowedMediaHost('https://localhost/photo.jpg').allowed === false
  );

  assert(
    'Blocks loopback 127.0.0.1 SSRF',
    isAllowedMediaHost('https://127.0.0.1/photo.jpg').allowed === false
  );

  assert(
    'Blocks private 192.168.x.x SSRF',
    isAllowedMediaHost('https://192.168.1.10/admin').allowed === false
  );

  assert(
    'Blocks private 10.x.x.x SSRF',
    isAllowedMediaHost('https://10.0.0.1/admin').allowed === false
  );

  assert(
    'Blocks cloud metadata 169.254.169.254 SSRF',
    isAllowedMediaHost('https://169.254.169.254/latest/meta-data/').allowed === false
  );

  assert(
    'Blocks subdomain confusion (scontent.cdninstagram.com.evil.com)',
    isAllowedMediaHost('https://scontent.cdninstagram.com.evil.com/fake.jpg').allowed === false
  );

  assert(
    'Blocks prefix confusion (evil-scontent.cdninstagram.com)',
    isAllowedMediaHost('https://evil-scontent.cdninstagram.com/fake.jpg').allowed === false
  );

  assert(
    'Blocks arbitrary domain (google.com)',
    isAllowedMediaHost('https://google.com/test.jpg').allowed === false
  );

  // 2. Filename Sanitization Suite
  console.log('\n--- 2. FILENAME SANITIZATION TESTS ---');

  assert(
    'Directory traversal stripped (../../etc/passwd.jpg)',
    sanitizeFilename('../../etc/passwd.jpg') === 'etc_passwd.jpg'
  );

  const sanitizedWithNewlines = sanitizeFilename('my_photo\r\nSet-Cookie:bad.jpg');
  assert(
    'Header injection chars stripped (no newlines/colons)',
    !sanitizedWithNewlines.includes('\r') && !sanitizedWithNewlines.includes('\n') && !sanitizedWithNewlines.includes(':')
  );

  assert(
    'Invalid extension replaced with safe default',
    sanitizeFilename('dangerous.exe', 'jpg') === 'dangerous.jpg'
  );

  // 3. Media Download Execution Suite
  console.log('\n--- 3. MEDIA DOWNLOAD EXECUTION & FILTERING TESTS ---');

  // Test 3.1: Forbidden host download rejection
  const resForbidden = await streamMediaDownload('https://evil.com/fake.jpg');
  assert('Rejects download from unapproved host with 403', resForbidden.status === 403);

  // Test 3.2: Rejection of invalid MIME types (e.g. text/html or text/plain from scontent.cdninstagram.com)
  const resInvalidMime = await streamMediaDownload('https://scontent.cdninstagram.com/');
  const invalidJson = await resInvalidMime.json();
  assert(
    'Rejects upstream non-media / text response with 400',
    resInvalidMime.status === 400 && String(invalidJson.error).includes('Invalid MIME type')
  );

  // 4. Analysis API Behavior Suite
  console.log('\n--- 4. ANALYSIS API BEHAVIOR TESTS ---');

  // Test 4.1: Invalid URL
  const resInvalidUrl = await analyzePost('invalid-url-string');
  assert('Rejects malformed URL string', resInvalidUrl.success === false && resInvalidUrl.urlValid === false);

  // Test 4.2: Format valid, no token
  const resNoToken = await analyzePost('https://www.instagram.com/reel/C8qKz9xM7pL/');
  assert('Format valid yields urlValid=true', resNoToken.urlValid === true);
  assert('Without token, postVerified=false (honest status)', resNoToken.postVerified === false);
  assert('Without token, hasDirectDownload=false', resNoToken.hasDirectDownload === false);
  assert('Embed URL is properly generated', resNoToken.embedUrl.includes('/embed/captioned/'));

  // Test 4.3: With dummy token (simulating Meta API returning error)
  const resDummyToken = await analyzePost('https://www.instagram.com/reel/C8qKz9xM7pL/', 'INVALID_APP_ID|SECRET');
  assert('Invalid Meta token does NOT mark verified', resDummyToken.postVerified === false);
  assert('Invalid Meta token does NOT activate fake download', resDummyToken.hasDirectDownload === false);

  console.log('\n====================================================');
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
