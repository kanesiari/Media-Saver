/**
 * Integration Contract Test Suite for Instagram Extraction Lab
 * Verifies that candidate URLs extracted by the JSON parser strictly comply
 * with the signature, security boundaries, and streaming contract of streamMediaDownload().
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseInstagramOfflinePayload } from '../instagram-json-lab/parser';
import { streamMediaDownload } from '../../src/utils/mediaDownloader';
import {
  createValidJpegBuffer,
  createValidMp4Buffer,
  streamToUint8Array,
} from '../download-engine-lab/mock-media';
import { ExtractionContractResult, ExtractedMediaItem } from './types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const jsonLabFixtures = path.join(__dirname, '../instagram-json-lab/fixtures');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(description: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${description}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${description}${details ? ` -> ${details}` : ''}`);
  }
}

/**
 * Adapter: Transforms ParseResult into ExtractedMediaItem contract
 */
function adaptToContract(rawPayload: string): ExtractionContractResult {
  const parsed = parseInstagramOfflinePayload(rawPayload);
  if (!parsed.isSuccess) {
    return {
      success: false,
      error: parsed.errorMessage || parsed.blockedReason,
      postType: 'unknown',
      items: [],
      metadata: { itemCount: 0 },
    };
  }

  const items: ExtractedMediaItem[] = parsed.allCandidates.map((cand) => ({
    id: cand.id,
    type: cand.type,
    rawUrl: cand.rawUrl,
    downloadUrl: cand.isDownloadAllowed ? `/api/download?url=${encodeURIComponent(cand.rawUrl)}` : undefined,
    previewUrl: cand.rawUrl,
    resolution: cand.width && cand.height ? `${cand.width}x${cand.height}` : undefined,
    mimeType: cand.type === 'video' ? 'video/mp4' : 'image/jpeg',
    verified: cand.isDownloadAllowed,
    isDownloadAllowed: cand.isDownloadAllowed,
    securityReason: cand.securityReason,
  }));

  return {
    success: true,
    postType: parsed.postKind,
    items,
    metadata: {
      shortcode: parsed.metadata.shortcode,
      caption: parsed.metadata.caption,
      author: parsed.metadata.authorUsername,
      itemCount: items.length,
    },
  };
}

async function runIntegrationTests() {
  console.log('================================================================');
  console.log('EXTRACTION LAB — INTEGRATION CONTRACT & PIPELINE TESTS');
  console.log('================================================================\n');

  const originalFetch = globalThis.fetch;
  const jpegBuffer = createValidJpegBuffer();
  const mp4Buffer = createValidMp4Buffer();

  try {
    // -------------------------------------------------------------
    // Test 1: Photo Candidate Extraction & Engine Compatibility
    // -------------------------------------------------------------
    console.log('--- 1. PHOTO CANDIDATE EXTRACTION & STREAM CONTRACT ---');
    const photoPayload = fs.readFileSync(path.join(jsonLabFixtures, 'single_photo.json'), 'utf-8');
    const contractPhoto = adaptToContract(photoPayload);

    assert('Photo payload parsed to contract successfully', contractPhoto.success === true);
    assert('Correct postType single_photo', contractPhoto.postType === 'single_photo');
    assert('Extracted valid photo candidates', contractPhoto.items.length > 0);
    assert('All items classified as image', contractPhoto.items.every((it) => it.type === 'image'));

    const photoCandidate = contractPhoto.items[0];
    assert('Photo candidate has valid resolution metadata', photoCandidate.resolution === '1080x1350');
    assert('Photo candidate marked as download allowed', photoCandidate.isDownloadAllowed === true);

    // Mock upstream CDN response for this photo
    globalThis.fetch = async () =>
      new Response(jpegBuffer as unknown as BodyInit, {
        status: 200,
        headers: { 'Content-Type': 'image/jpeg' },
      });

    // Pass directly to operational streamMediaDownload()
    const photoRes = await streamMediaDownload(photoCandidate.rawUrl, 'photo.jpg');
    assert('streamMediaDownload accepts candidate URL with HTTP 200', photoRes.status === 200);
    assert('streamMediaDownload Content-Type matches image/jpeg', photoRes.headers.get('Content-Type') === 'image/jpeg');
    const receivedPhotoBytes = await streamToUint8Array(photoRes.body as any);
    assert('Delivered intact JPEG byte length', receivedPhotoBytes.length === jpegBuffer.length);

    // -------------------------------------------------------------
    // Test 2: Video Candidate Extraction & Engine Compatibility
    // -------------------------------------------------------------
    console.log('\n--- 2. VIDEO CANDIDATE EXTRACTION & STREAM CONTRACT ---');
    const videoPayload = fs.readFileSync(path.join(jsonLabFixtures, 'single_video.json'), 'utf-8');
    const contractVideo = adaptToContract(videoPayload);

    assert('Video payload parsed to contract successfully', contractVideo.success === true);
    assert('Correct postType single_video', contractVideo.postType === 'single_video');
    const videoItems = contractVideo.items.filter((it) => it.type === 'video');
    assert('Extracted at least one video candidate', videoItems.length >= 1);

    const videoCandidate = videoItems[0];
    assert('Video candidate marked as download allowed', videoCandidate.isDownloadAllowed === true);

    globalThis.fetch = async () =>
      new Response(mp4Buffer as unknown as BodyInit, {
        status: 200,
        headers: { 'Content-Type': 'video/mp4' },
      });

    const videoRes = await streamMediaDownload(videoCandidate.rawUrl, 'reel.mp4');
    assert('streamMediaDownload accepts video candidate URL with HTTP 200', videoRes.status === 200);
    assert('streamMediaDownload Content-Type matches video/mp4', videoRes.headers.get('Content-Type') === 'video/mp4');
    const receivedVideoBytes = await streamToUint8Array(videoRes.body as any);
    assert('Delivered intact MP4 byte length', receivedVideoBytes.length === mp4Buffer.length);

    // -------------------------------------------------------------
    // Test 3: Carousel Item Separation & Deduplication
    // -------------------------------------------------------------
    console.log('\n--- 3. CAROUSEL ITEM SEPARATION & DEDUPLICATION ---');
    const mixedPayload = fs.readFileSync(path.join(jsonLabFixtures, 'carousel_mixed.json'), 'utf-8');
    const contractCarousel = adaptToContract(mixedPayload);

    assert('Carousel parsed successfully', contractCarousel.success === true);
    assert('Post type identified as carousel', contractCarousel.postType === 'carousel');
    const rawUrls = contractCarousel.items.map((it) => it.rawUrl);
    const uniqueRawUrls = new Set(rawUrls);
    assert('Zero duplicate URLs in extracted carousel items', rawUrls.length === uniqueRawUrls.size);
    assert(
      'Carousel separates both photo and video slides',
      contractCarousel.items.some((it) => it.type === 'image') &&
        contractCarousel.items.some((it) => it.type === 'video')
    );

    // -------------------------------------------------------------
    // Test 4: Missing or Malformed Payload Handling
    // -------------------------------------------------------------
    console.log('\n--- 4. MISSING OR MALFORMED PAYLOAD FAILURE CONTRACT ---');
    const badContract = adaptToContract('not a json');
    assert('Malformed input returns success: false', badContract.success === false);
    assert('Malformed input returns empty items array', badContract.items.length === 0);
    assert('Error message explicitly identifies failure reason', Boolean(badContract.error));

    // -------------------------------------------------------------
    // Test 5: Insecure Protocol & Unapproved Host Rejection
    // -------------------------------------------------------------
    console.log('\n--- 5. INSECURE PROTOCOL & UNAPPROVED HOST REJECTION ---');
    const unallowedPayload = fs.readFileSync(path.join(jsonLabFixtures, 'unallowed_host.json'), 'utf-8');
    const contractUnallowed = adaptToContract(unallowedPayload);
    const unallowedItem = contractUnallowed.items.find((it) => it.rawUrl.includes('malicious-external-storage.com'));
    assert('Unapproved host marked with isDownloadAllowed: false', unallowedItem?.isDownloadAllowed === false);
    assert('Unapproved host downloadUrl is undefined', unallowedItem?.downloadUrl === undefined);

    // Confirm that operational engine also rejects this URL directly
    if (unallowedItem) {
      const rejectRes = await streamMediaDownload(unallowedItem.rawUrl);
      assert('Operational engine rejects unapproved candidate with HTTP 403', rejectRes.status === 403);
    }

    // -------------------------------------------------------------
    // Test 6: Upstream 403 / Expired Signature Detection
    // -------------------------------------------------------------
    console.log('\n--- 6. UPSTREAM 403 / EXPIRED SIGNATURE CONTRACT ---');
    globalThis.fetch = async () =>
      new Response('URL signature expired', {
        status: 403,
        statusText: 'Forbidden',
      });

    const expiredRes = await streamMediaDownload(
      'https://scontent-iad3-2.cdninstagram.com/expired_sig.jpg'
    );
    assert('Expired signature returns HTTP 403, not 200', expiredRes.status === 403);
    const expiredData = await expiredRes.json();
    assert('Expired signature does not masquerade as success', !expiredData.success);

    // -------------------------------------------------------------
    // Test 7: Operational Engine Signature & Contract Compliance
    // -------------------------------------------------------------
    console.log('\n--- 7. OPERATIONAL ENGINE CONTRACT & TYPE COMPLIANCE ---');
    // Verify streamMediaDownload parameter contract
    assert('streamMediaDownload is a callable function', typeof streamMediaDownload === 'function');
    assert('streamMediaDownload accepts 2 optional arguments (url, filename)', streamMediaDownload.length >= 1);

    console.log('\n================================================================');
    console.log(`TOTAL INTEGRATION TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
    console.log('================================================================\n');

    if (failedTests > 0) {
      process.exit(1);
    }
  } finally {
    globalThis.fetch = originalFetch;
  }
}

runIntegrationTests().catch((err) => {
  console.error('Fatal error in integration test runner:', err);
  process.exit(1);
});
