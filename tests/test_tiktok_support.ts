import { parseTiktokUrl, resolveTiktokShortUrl, extractTiktokMedia } from '../src/utils/tiktokExtractor';
import { parseSocialUrl } from '../src/utils/urlParser';
import { analyzePost } from '../src/utils/instagramExtractor';
import { isAllowedMediaHost, sanitizeFilename, streamMediaDownload } from '../src/utils/mediaDownloader';

async function runTiktokVerification() {
  console.log('====================================================');
  console.log('RUNNING TIKTOK & REGRESSION VERIFICATION TEST SUITE');
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

  // 1. TikTok URL Parsing
  console.log('--- 1. TIKTOK URL PARSING ---');
  const v1 = parseTiktokUrl('https://www.tiktok.com/@tiktok/video/7106594312292453675');
  assert('Parses standard video URL ID', v1.id === '7106594312292453675' && v1.author === 'tiktok' && !v1.isPhotoPost);

  const p1 = parseTiktokUrl('https://www.tiktok.com/@creator/photo/7382910291823910293?is_from_webapp=1');
  assert('Parses standard photo URL ID with query param', p1.id === '7382910291823910293' && p1.author === 'creator' && p1.isPhotoPost);

  const s1 = parseSocialUrl('https://www.tiktok.com/@tiktok/video/7106594312292453675');
  assert('Social parser recognizes TikTok video', s1.isValid && s1.platform === 'tiktok' && s1.contentType === 'video');

  const s2 = parseSocialUrl('https://vm.tiktok.com/ZMhD8K9pL/');
  assert('Social parser recognizes TikTok short URL', s2.isValid && s2.platform === 'tiktok');

  const s3 = parseSocialUrl('https://www.tiktok.com/@tiktok');
  assert('Social parser rejects TikTok profile-only URL', !s3.isValid && s3.platform === 'tiktok');

  // 2. TikTok CDN Security & SSRF Defense
  console.log('\n--- 2. TIKTOK CDN SECURITY & SSRF DEFENSE ---');
  assert('Allows official tiktokcdn.com', isAllowedMediaHost('https://p16-sign-va.tiktokcdn.com/image.jpg').allowed === true);
  assert('Allows official tiktokcdn-us.com', isAllowedMediaHost('https://p19-sign.tiktokcdn-us.com/photo.jpg').allowed === true);
  assert('Allows official byteoversea.com', isAllowedMediaHost('https://v16-webapp-prime.byteoversea.com/video.mp4').allowed === true);
  assert('Allows official ibytedtos.com', isAllowedMediaHost('https://p16-va-tiktok.ibytedtos.com/image.jpg').allowed === true);
  assert('Allows tiktok.com play endpoint', isAllowedMediaHost('https://www.tiktok.com/aweme/v1/play/?video_id=123').allowed === true);

  assert('Blocks malicious evil-tiktokcdn.com', isAllowedMediaHost('https://evil-tiktokcdn.com/bad.mp4').allowed === false);
  assert('Blocks malicious tiktokcdn.com.evil.com', isAllowedMediaHost('https://tiktokcdn.com.evil.com/bad.mp4').allowed === false);
  assert('Blocks malicious evilbyteoversea.com', isAllowedMediaHost('https://evilbyteoversea.com/bad.mp4').allowed === false);
  assert('Blocks malicious eviltiktok.com', isAllowedMediaHost('https://eviltiktok.com/bad.mp4').allowed === false);

  // 3. Real TikTok Extraction & Streaming Download
  console.log('\n--- 3. LIVE TIKTOK EXTRACTION & STREAM DOWNLOAD ---');
  const sampleTiktokUrl = 'https://www.tiktok.com/@tiktok/video/7106594312292453675';
  const tiktokResult = await analyzePost(sampleTiktokUrl);

  assert('TikTok analyzePost succeeds', tiktokResult.success === true);
  assert('TikTok platform identified as tiktok', tiktokResult.platform === 'tiktok');
  assert('TikTok contentType is video', tiktokResult.contentType === 'video');
  assert('TikTok hasDirectDownload is true', tiktokResult.hasDirectDownload === true);
  assert('TikTok mediaList contains at least 1 video item', tiktokResult.mediaList.some((m) => m.type === 'video'));

  const videoItem = tiktokResult.mediaList.find((m) => m.type === 'video');
  if (videoItem?.url) {
    console.log(`  Found video URL: ${videoItem.url.slice(0, 70)}...`);
    console.log(`  Reported resolution: ${videoItem.resolution}`);
    assert('Video item has legitimate resolution', typeof videoItem.resolution === 'string' && videoItem.resolution.length > 0);

    const downloadRes = await streamMediaDownload(videoItem.url, 'sample_test.mp4');
    assert('streamMediaDownload returns HTTP 200', downloadRes.status === 200);
    assert('streamMediaDownload has video/mp4 Content-Type', downloadRes.headers.get('content-type')?.includes('video') === true);
    assert('streamMediaDownload sets attachment Content-Disposition', downloadRes.headers.get('content-disposition')?.includes('attachment') === true);

    const bytes = await downloadRes.arrayBuffer();
    console.log(`  Downloaded bytes size: ${bytes.byteLength} bytes`);
    assert('Downloaded payload is non-empty (> 100 KB)', bytes.byteLength > 100000);
  }

  // 4. Instagram & Threads Regression Verification
  console.log('\n--- 4. INSTAGRAM & THREADS REGRESSION TESTS ---');
  const igSocial = parseSocialUrl('https://www.instagram.com/reel/C8qKz9xM7pL/');
  assert('Instagram reel URL parsed correctly', igSocial.isValid && igSocial.platform === 'instagram' && igSocial.contentType === 'reel');

  const threadsSocial = parseSocialUrl('https://www.threads.net/@zuck/post/Ddt4W2Qx-D1');
  assert('Threads post URL parsed correctly', threadsSocial.isValid && threadsSocial.platform === 'threads' && threadsSocial.contentType === 'post');

  const igAnalysis = await analyzePost('https://www.instagram.com/reel/C8qKz9xM7pL/');
  assert('Instagram URL validation remains consistent', igAnalysis.urlValid === true && igAnalysis.platform === 'instagram');

  console.log('\n====================================================');
  console.log(`TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('====================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTiktokVerification().catch((err) => {
  console.error('Test suite uncaught error:', err);
  process.exit(1);
});
