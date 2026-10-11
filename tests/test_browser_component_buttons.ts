import { JSDOM } from 'jsdom';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { MediaPreviewSection } from '../src/components/MediaPreviewSection';
import { AnalysisResponse } from '../src/types';

// Setup full JSDOM browser simulation environment
const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
  url: 'https://media-saver-9vs.pages.dev/',
});

(global as any).window = dom.window;
(global as any).document = dom.window.document;
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  writable: true,
  configurable: true,
});
(global as any).HTMLElement = dom.window.HTMLElement;
(global as any).HTMLButtonElement = dom.window.HTMLButtonElement;
(global as any).HTMLAnchorElement = dom.window.HTMLAnchorElement;

// Mock URL.createObjectURL and URL.revokeObjectURL
let createdObjectUrls: string[] = [];
let revokedObjectUrls: string[] = [];
(global as any).URL.createObjectURL = (blob: any) => {
  const url = `blob:mock-url-${Date.now()}-${Math.random()}`;
  createdObjectUrls.push(url);
  return url;
};
(global as any).URL.revokeObjectURL = (url: string) => {
  revokedObjectUrls.push(url);
};

// Fixture: Multi-item Carousel Analysis Data
const mockCarouselData: AnalysisResponse = {
  success: true,
  urlValid: true,
  postVerified: true,
  previewAvailable: true,
  hasDirectDownload: true,
  platform: 'instagram',
  contentType: 'carousel',
  shortcode: 'C_testCarousel123',
  canonicalUrl: 'https://www.instagram.com/p/C_testCarousel123/',
  embedUrl: 'https://www.instagram.com/p/C_testCarousel123/embed/captioned/',
  statusMessage: 'Carousel verified',
  mediaList: [
    {
      id: 'instagram_C_testCarousel123_slide_1_photo',
      slideIndex: 1,
      type: 'image',
      url: 'https://scontent.cdninstagram.com/v/t51/slide1_original.jpg',
      downloadUrl: '/api/download?url=https%3A%2F%2Fscontent.cdninstagram.com%2Fv%2Ft51%2Fslide1_original.jpg&filename=instagram_slide_1.jpg',
      previewUrl: 'https://scontent.cdninstagram.com/v/t51/slide1_preview.jpg',
      resolution: 'Photo (1080×1350)',
      mimeType: 'image/jpeg',
      verified: true,
      label: 'Slide 1 (Photo .jpg)',
    },
    {
      id: 'instagram_C_testCarousel123_slide_2_video',
      slideIndex: 2,
      type: 'video',
      url: 'https://scontent-iad3-1.xx.fbcdn.net/v/t50/slide2_video.mp4',
      downloadUrl: '/api/download?url=https%3A%2F%2Fscontent-iad3-1.xx.fbcdn.net%2Fv%2Ft50%2Fslide2_video.mp4&filename=instagram_slide_2.mp4',
      previewUrl: 'https://scontent-iad3-1.xx.fbcdn.net/v/t51/slide2_poster.jpg',
      resolution: '720p HD (720×1280)',
      mimeType: 'video/mp4',
      verified: true,
      label: 'Slide 2 (Video .mp4)',
      qualityOptions: [
        {
          id: 'quality_slide_2_720p',
          label: '720p HD',
          resolution: '720p HD (720×1280)',
          url: 'https://scontent-iad3-1.xx.fbcdn.net/v/t50/slide2_video.mp4',
          downloadUrl: '/api/download?url=https%3A%2F%2Fscontent-iad3-1.xx.fbcdn.net%2Fv%2Ft50%2Fslide2_video.mp4&filename=instagram_slide_2.mp4',
          mimeType: 'video/mp4',
          isDefault: true,
        },
      ],
    },
    {
      id: 'instagram_C_testCarousel123_slide_3_photo',
      slideIndex: 3,
      type: 'image',
      url: 'https://scontent-ord5-2.xx.fbcdn.net/v/t51/slide3_original.jpg',
      downloadUrl: '/api/download?url=https%3A%2F%2Fscontent-ord5-2.xx.fbcdn.net%2Fv%2Ft51%2Fslide3_original.jpg&filename=instagram_slide_3.jpg',
      previewUrl: 'https://scontent-ord5-2.xx.fbcdn.net/v/t51/slide3_preview.jpg',
      resolution: 'Photo (1080×1080)',
      mimeType: 'image/jpeg',
      verified: true,
      label: 'Slide 3 (Photo .jpg)',
    },
  ],
};

async function runBrowserComponentTests() {
  console.log('====================================================');
  console.log('RUNNING BROWSER COMPONENT BUTTON & DOWNLOAD TESTS');
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

  const container = dom.window.document.getElementById('root')!;
  const root = createRoot(container);

  // Helper to mount fresh component
  async function renderComponent(data: AnalysisResponse = mockCarouselData) {
    // Unmount and remount or deep clone data so useEffect re-triggers
    const freshData = JSON.parse(JSON.stringify(data));
    await act(async () => {
      root.render(
        React.createElement(MediaPreviewSection, {
          analysisData: freshData,
          isLoading: false,
          onReset: () => {},
          onOpenLegalModal: () => {},
        })
      );
    });
  }

  // --------------------------------------------------------------------------
  // Test 1: Clicking second carousel item passes second item's URL
  // --------------------------------------------------------------------------
  console.log('--- 1. ITEM 2 BUTTON CLICK URL PASSING ---');
  let fetchedUrls: string[] = [];

  (global as any).fetch = async (url: string) => {
    fetchedUrls.push(url);
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? 'video/mp4' : null),
      },
      blob: async () => ({ size: 1048576, type: 'video/mp4' }),
    };
  };

  await renderComponent();

  const btnItem2 = container.querySelector('#download-btn-instagram_C_testCarousel123_slide_2_video') as HTMLButtonElement | null;
  assert('Second carousel card download button exists in DOM', Boolean(btnItem2));

  fetchedUrls = [];
  await act(async () => {
    btnItem2?.click();
  });

  assert(
    'Clicking 2nd item download button passes 2nd item URL (slide 2 video)',
    fetchedUrls.some((u) => u.includes('slide2_video.mp4') && !u.includes('slide1') && !u.includes('slide3')),
    `Received: ${fetchedUrls.join(', ')}`
  );

  // --------------------------------------------------------------------------
  // Test 2: Clicking third carousel item passes third item's URL
  // --------------------------------------------------------------------------
  console.log('\n--- 2. ITEM 3 BUTTON CLICK URL PASSING ---');
  const btnItem3 = container.querySelector('#download-btn-instagram_C_testCarousel123_slide_3_photo') as HTMLButtonElement | null;
  assert('Third carousel card download button exists in DOM', Boolean(btnItem3));

  fetchedUrls = [];
  (global as any).fetch = async (url: string) => {
    fetchedUrls.push(url);
    return {
      ok: true,
      status: 200,
      headers: {
        get: (h: string) => (h.toLowerCase() === 'content-type' ? 'image/jpeg' : null),
      },
      blob: async () => ({ size: 524288, type: 'image/jpeg' }),
    };
  };

  await act(async () => {
    btnItem3?.click();
  });

  assert(
    'Clicking 3rd item download button passes 3rd item URL (slide 3 photo)',
    fetchedUrls.some((u) => u.includes('slide3_original.jpg') && !u.includes('slide1') && !u.includes('slide2')),
    `Received: ${fetchedUrls.join(', ')}`
  );

  // --------------------------------------------------------------------------
  // Test 3: Downloading state of card 1 does NOT disable card 2's button
  // --------------------------------------------------------------------------
  console.log('\n--- 3. CARD INDEPENDENCE & DISABLED STATE ISOLATION ---');
  let resolvePendingDownload: ((val: any) => void) | null = null;
  const pendingPromise = new Promise((resolve) => {
    resolvePendingDownload = resolve;
  });

  (global as any).fetch = async (url: string) => {
    if (url.includes('slide1')) {
      await pendingPromise;
    }
    return {
      ok: true,
      status: 200,
      headers: { get: () => 'image/jpeg' },
      blob: async () => ({ size: 50000 }),
    };
  };

  await renderComponent();

  const btn1 = container.querySelector('#download-btn-instagram_C_testCarousel123_slide_1_photo') as HTMLButtonElement;
  const btn2 = container.querySelector('#download-btn-instagram_C_testCarousel123_slide_2_video') as HTMLButtonElement;

  // Trigger download on card 1 (hanging in progress)
  act(() => {
    btn1.click();
  });

  assert('Card 1 button shows downloading state', btn1.textContent?.includes('다운로드 처리 중') === true);
  assert('Card 1 button is disabled while downloading', btn1.disabled === true);
  assert('Card 2 button is NOT disabled while Card 1 is downloading', btn2.disabled === false);
  assert('Card 2 button remains in ready idle state', btn2.textContent?.includes('개별 다운로드') === true);

  // Clean up pending download
  await act(async () => {
    resolvePendingDownload!({
      ok: true,
      status: 200,
      headers: { get: () => 'image/jpeg' },
      blob: async () => ({ size: 50000 }),
    });
  });

  // --------------------------------------------------------------------------
  // Test 4: HTTP 500 or HTML error is NOT marked as completed
  // --------------------------------------------------------------------------
  console.log('\n--- 4. HTTP 500 & INVALID MIME REJECTION (NO FALSE COMPLETED) ---');
  await renderComponent();

  // Test 4a: Server 500 response
  (global as any).fetch = async () => ({
    ok: false,
    status: 500,
    headers: { get: () => 'application/json' },
    json: async () => ({ error: 'Internal Server Error' }),
  });

  const testBtn = container.querySelector('#download-btn-instagram_C_testCarousel123_slide_1_photo') as HTMLButtonElement;
  await act(async () => {
    testBtn.click();
  });

  assert('HTTP 500 is NOT marked completed', !testBtn.textContent?.includes('완료'));
  assert('HTTP 500 marks button as error/retry', testBtn.textContent?.includes('다시 시도') === true);

  // Test 4b: Server returns 200 but Content-Type is text/html (HTML error page)
  await renderComponent();
  const testBtnHtml = container.querySelector('#download-btn-instagram_C_testCarousel123_slide_1_photo') as HTMLButtonElement;
  (global as any).fetch = async () => ({
    ok: true,
    status: 200,
    headers: { get: () => 'text/html; charset=utf-8' },
    blob: async () => ({ size: 1200 }),
  });

  await act(async () => {
    testBtnHtml.click();
  });

  assert('HTML error page response is NOT marked completed', !testBtnHtml.textContent?.includes('완료'));
  assert('HTML error page marks button as error/retry', testBtnHtml.textContent?.includes('다시 시도') === true);

  // --------------------------------------------------------------------------
  // Test 5: Retry is possible after download error
  // --------------------------------------------------------------------------
  console.log('\n--- 5. RETRY CAPABILITY AFTER ERROR ---');
  // First attempt failed
  assert('Button is currently in error state and not stuck disabled', testBtnHtml.disabled === false);

  // Now server recovers
  (global as any).fetch = async () => ({
    ok: true,
    status: 200,
    headers: { get: () => 'image/jpeg' },
    blob: async () => ({ size: 500000 }),
  });

  await act(async () => {
    testBtnHtml.click();
  });

  assert('Clicking retry button initiates new download and marks completed on success', testBtnHtml.textContent?.includes('완료') === true);

  // --------------------------------------------------------------------------
  // Test 6: Timer expiry alone does NOT mark download as completed
  // --------------------------------------------------------------------------
  console.log('\n--- 6. TIMER EXPIRY DOES NOT FABRICATE COMPLETION ---');
  await renderComponent();
  const timerBtn = container.querySelector('#download-btn-instagram_C_testCarousel123_slide_2_video') as HTMLButtonElement;

  // Simulate an unresolved request that times out
  (global as any).fetch = async () => new Promise(() => {}); // never resolves

  act(() => {
    timerBtn.click();
  });

  assert('Button enters downloading state', timerBtn.textContent?.includes('다운로드 처리 중') === true);

  // Fast forward beyond 5 seconds safety timer
  await act(async () => {
    await new Promise((r) => setTimeout(r, 5500));
  });

  assert('Timer expiry resets state to idle, NEVER completed', !timerBtn.textContent?.includes('완료'));
  assert('Button is restored to idle retryable state', timerBtn.textContent?.includes('개별 다운로드') === true);

  // --------------------------------------------------------------------------
  // Test 7: Batch download continues to next item when one fails
  // --------------------------------------------------------------------------
  console.log('\n--- 7. BATCH DOWNLOAD CONTINUES ACROSS FAILURES ---');
  await renderComponent();

  const processedUrls: string[] = [];
  (global as any).fetch = async (url: string) => {
    processedUrls.push(url);
    if (url.includes('slide2')) {
      // Slide 2 fails with 500
      return {
        ok: false,
        status: 500,
        headers: { get: () => 'application/json' },
        json: async () => ({ error: 'Slide 2 failed' }),
      };
    }
    // Slides 1 & 3 succeed
    return {
      ok: true,
      status: 200,
      headers: { get: () => 'image/jpeg' },
      blob: async () => ({ size: 300000 }),
    };
  };

  const batchBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('일괄 다운로드'));

  assert('Batch download button exists in DOM', Boolean(batchBtn));

  await act(async () => {
    (batchBtn as HTMLButtonElement)?.click();
    // Allow batch download loop to finish (includes 600ms throttles)
    await new Promise((r) => setTimeout(r, 2500));
  });

  assert('Batch download processed item 1', processedUrls.some((u) => u.includes('slide1')));
  assert('Batch download processed item 2 (which failed)', processedUrls.some((u) => u.includes('slide2')));
  assert('Batch download CONTINUED and processed item 3 after item 2 failure', processedUrls.some((u) => u.includes('slide3')));

  // --------------------------------------------------------------------------
  // Test 8: UI Elements preservation (Individual cards, numbers, batch controls)
  // --------------------------------------------------------------------------
  console.log('\n--- 8. UI INTEGRITY & CARD HIERARCHY PRESERVATION ---');
  await renderComponent();

  const card1 = container.querySelector('#download-btn-instagram_C_testCarousel123_slide_1_photo');
  const card2 = container.querySelector('#download-btn-instagram_C_testCarousel123_slide_2_video');
  const card3 = container.querySelector('#download-btn-instagram_C_testCarousel123_slide_3_photo');
  assert('All 3 individual card download buttons exist', Boolean(card1 && card2 && card3));

  const badges = Array.from(container.querySelectorAll('span')).map((s) => s.textContent);
  assert('Slide 1 badge #1 rendered', badges.includes('#1'));
  assert('Slide 2 badge #2 rendered', badges.includes('#2'));
  assert('Slide 3 badge #3 rendered', badges.includes('#3'));

  const selectAllBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('전체 선택'));
  const deselectAllBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent?.includes('전체 해제'));
  assert('Batch "전체 선택" button exists', Boolean(selectAllBtn));
  assert('Batch "전체 해제" button exists', Boolean(deselectAllBtn));

  console.log('\n====================================================');
  console.log(`BROWSER COMPONENT TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runBrowserComponentTests().catch((err) => {
  console.error('Browser component test fatal error:', err);
  process.exit(1);
});
