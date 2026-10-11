import { parseCarouselFromEmbed } from '../src/utils/instagramExtractor';
import { isAllowedMediaHost, sanitizeFilename, streamMediaDownload } from '../src/utils/mediaDownloader';
import { extractThreadsMedia } from '../src/utils/threadsExtractor';
import { extractTiktokMedia } from '../src/utils/tiktokExtractor';

async function runCarouselTests() {
  console.log('====================================================');
  console.log('RUNNING CAROUSEL & MULTI-ITEM DOWNLOAD TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(title: string, cond: boolean, details?: string) {
    if (cond) {
      console.log(`[PASS] ${title}`);
      passed++;
    } else {
      console.error(`[FAIL] ${title} - ${details || ''}`);
      failed++;
    }
  }

  // 1. Mock Instagram Carousel Embed HTML containing multiple slides across different Meta CDN hosts
  console.log('--- 1. INSTAGRAM CAROUSEL PARSING & UNIQUE IDENTIFIERS ---');

  const mockShortcode = 'C_mock123';
  const mockEmbedHtml = `
    window.__additionalData = {
      "graphql": {
        "shortcode_media": {
          "edge_sidecar_to_children": {
            "edges": [
              {
                "node": {
                  "id": "11111",
                  "is_video": false,
                  "display_url": "https:\\/\\/scontent.cdninstagram.com\\/v\\/t51.2885-15\\/slide1.jpg?_nc_cat=1",
                  "dimensions": { "width": 1080, "height": 1350 }
                }
              },
              {
                "node": {
                  "id": "22222",
                  "is_video": true,
                  "display_url": "https:\\/\\/scontent-iad3-1.xx.fbcdn.net\\/v\\/t51.2885-15\\/slide2_poster.jpg",
                  "video_url": "https:\\/\\/scontent-iad3-1.xx.fbcdn.net\\/v\\/t50.2886-16\\/slide2_video.mp4?efg=720",
                  "dimensions": { "width": 720, "height": 1280 }
                }
              },
              {
                "node": {
                  "id": "33333",
                  "is_video": false,
                  "display_url": "https:\\/\\/scontent-ord5-2.xx.fbcdn.net\\/v\\/t51.2885-15\\/slide3.jpg",
                  "dimensions": { "width": 1080, "height": 1080 }
                }
              }
            ]
          }
        }
      }
    };
  `;

  const items = parseCarouselFromEmbed(mockEmbedHtml, mockShortcode);
  assert('Successfully parses carousel items from embed HTML', Boolean(items && items.length === 3));

  if (items && items.length === 3) {
    // Check item 1
    assert('Item 1 is photo', items[0].type === 'image');
    assert('Item 1 has slideIndex 1', items[0].slideIndex === 1);
    assert('Item 1 has unique id', items[0].id === 'instagram_C_mock123_slide_1_photo_11111');
    assert('Item 1 downloadUrl targets /api/download with filename', Boolean(items[0].downloadUrl?.includes('filename=instagram_C_mock123_slide_1.jpg')));
    assert('Item 1 host is allowed', isAllowedMediaHost(items[0].url).allowed === true);

    // Check item 2 (video hosted on regional fbcdn.net)
    assert('Item 2 is video', items[1].type === 'video');
    assert('Item 2 has slideIndex 2', items[1].slideIndex === 2);
    assert('Item 2 has unique id distinct from item 1', items[1].id === 'instagram_C_mock123_slide_2_video_22222');
    assert('Item 2 video URL is on fbcdn.net and allowed by whitelist', isAllowedMediaHost(items[1].url).allowed === true);
    assert('Item 2 downloadUrl targets /api/download with mp4 extension', Boolean(items[1].downloadUrl?.includes('filename=instagram_C_mock123_slide_2.mp4')));
    assert('Item 2 qualityOptions has distinct ID', items[1].qualityOptions?.[0].id === 'quality_slide_2_720p');

    // Check item 3 (photo hosted on scontent-ord5-2.xx.fbcdn.net)
    assert('Item 3 is photo', items[2].type === 'image');
    assert('Item 3 has slideIndex 3', items[2].slideIndex === 3);
    assert('Item 3 has unique id distinct from others', items[2].id === 'instagram_C_mock123_slide_3_photo_33333');
    assert('Item 3 host on scontent-ord5-2 is allowed', isAllowedMediaHost(items[2].url).allowed === true);

    // Verify all IDs are completely unique
    const idSet = new Set(items.map((i) => i.id));
    assert('All item IDs in carousel are globally unique', idSet.size === items.length);

    // Verify all URLs are unique
    const urlSet = new Set(items.map((i) => i.url));
    assert('All item media URLs are unique', urlSet.size === items.length);
  }

  // 2. Test Filename generation for each slide
  console.log('\n--- 2. SLIDE FILENAME GENERATION & SANITIZATION ---');
  const slide1Filename = sanitizeFilename('MediaSave_instagram_C_mock123_slide_1.jpg', 'jpg');
  const slide2Filename = sanitizeFilename('MediaSave_instagram_C_mock123_slide_2.mp4', 'mp4');
  const slide3Filename = sanitizeFilename('MediaSave_instagram_C_mock123_slide_3.jpg', 'jpg');

  assert('Slide 1 filename is clean', slide1Filename === 'MediaSave_instagram_C_mock123_slide_1.jpg');
  assert('Slide 2 filename is clean mp4', slide2Filename === 'MediaSave_instagram_C_mock123_slide_2.mp4');
  assert('Slide 3 filename is clean', slide3Filename === 'MediaSave_instagram_C_mock123_slide_3.jpg');
  assert('All filenames are distinct', slide1Filename !== slide2Filename && slide2Filename !== slide3Filename);

  // 3. Test Host Whitelist for various regional Meta CDN and TikTok clusters
  console.log('\n--- 3. REGIONAL CDN CLUSTER HOST WHITELIST TESTS ---');
  const clusters = [
    'https://scontent.cdninstagram.com/v/t51/1.jpg',
    'https://scontent-iad3-1.cdninstagram.com/v/t51/2.jpg',
    'https://scontent-iad3-2.cdninstagram.com/v/t51/3.jpg',
    'https://scontent-iad3-1.xx.cdninstagram.com/v/t51/4.jpg',
    'https://scontent.xx.fbcdn.net/v/t51/5.jpg',
    'https://scontent-iad3-1.xx.fbcdn.net/v/t51/6.jpg',
    'https://scontent-ord5-2.xx.fbcdn.net/v/t51/7.jpg',
    'https://video.xx.fbcdn.net/v/t50/8.mp4',
    'https://video-iad3-1.cdninstagram.com/v/t50/9.mp4',
  ];

  clusters.forEach((url) => {
    const res = isAllowedMediaHost(url);
    assert(`Allows legitimate host: ${new URL(url).hostname}`, res.allowed === true);
  });

  console.log('\n====================================================');
  console.log(`CAROUSEL TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runCarouselTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
