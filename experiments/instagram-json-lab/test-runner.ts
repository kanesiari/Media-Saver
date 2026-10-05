/**
 * Test Runner for Instagram JSON Lab (Offline Experiment)
 * Executes offline test matrix on simulated fixtures without network requests.
 * Masks URLs in test logs to prevent leaking sensitive queries or long signatures.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseInstagramOfflinePayload } from './parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.join(__dirname, 'fixtures');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function readFixture(name: string): string {
  return fs.readFileSync(path.join(fixturesDir, name), 'utf-8');
}

function assertTest(title: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${title}`);
  } else {
    failedTests++;
    console.error(`[FAIL] ${title}${details ? ` -> ${details}` : ''}`);
  }
}

async function runOfflineLabTests() {
  console.log('================================================================');
  console.log('INSTAGRAM JSON LAB — OFFLINE PARSER TEST SUITE');
  console.log('================================================================\n');

  // 1. Single Photo Fixture
  console.log('--- 1. SINGLE PHOTO SAMPLE ---');
  const singlePhotoPayload = readFixture('single_photo.json');
  const resPhoto = parseInstagramOfflinePayload(singlePhotoPayload);
  assertTest('Single photo parses successfully', resPhoto.isSuccess === true);
  assertTest('Identified as single_photo postKind', resPhoto.postKind === 'single_photo');
  assertTest('Preserves shortcode and caption', resPhoto.metadata.shortcode === 'C8qKz9xM7pL');
  assertTest('Extracted 3 image resolution candidates', resPhoto.imageCandidates.length === 3);
  assertTest('Zero video candidates extracted', resPhoto.videoCandidates.length === 0);
  assertTest('All image candidates allowed for download (valid CDN)', resPhoto.imageCandidates.every(c => c.isDownloadAllowed));
  // Verify masked logging
  console.log(`  Sample masked candidate: ${resPhoto.imageCandidates[0]?.maskedUrl} (${resPhoto.imageCandidates[0]?.width}x${resPhoto.imageCandidates[0]?.height})`);

  // 2. Single Video (Reel) Fixture
  console.log('\n--- 2. SINGLE VIDEO / REEL SAMPLE ---');
  const singleVideoPayload = readFixture('single_video.json');
  const resVideo = parseInstagramOfflinePayload(singleVideoPayload);
  assertTest('Single video parses successfully', resVideo.isSuccess === true);
  assertTest('Identified as single_video postKind', resVideo.postKind === 'single_video');
  assertTest('Extracted video candidates', resVideo.videoCandidates.length === 2);
  assertTest('Extracted video cover photo candidates', resVideo.imageCandidates.length === 1);
  assertTest('Preserved video duration metadata', resVideo.videoCandidates[0]?.durationSeconds === 15.42);
  console.log(`  Sample masked video: ${resVideo.videoCandidates[0]?.maskedUrl} (${resVideo.videoCandidates[0]?.width}x${resVideo.videoCandidates[0]?.height}, ${resVideo.videoCandidates[0]?.durationSeconds}s)`);

  // 3. Carousel Photos Fixture
  console.log('\n--- 3. CAROUSEL PHOTOS SAMPLE ---');
  const carouselPhotoPayload = readFixture('carousel_photos.json');
  const resCarouselPhoto = parseInstagramOfflinePayload(carouselPhotoPayload);
  assertTest('Carousel photos parses successfully', resCarouselPhoto.isSuccess === true);
  assertTest('Identified as carousel postKind', resCarouselPhoto.postKind === 'carousel');
  assertTest('Extracted multiple slide photos', resCarouselPhoto.imageCandidates.length === 2);
  assertTest('Zero video candidates for photo carousel', resCarouselPhoto.videoCandidates.length === 0);

  // 4. Mixed Carousel (Photos + Videos) Fixture
  console.log('\n--- 4. MIXED CAROUSEL SAMPLE ---');
  const mixedPayload = readFixture('carousel_mixed.json');
  const resMixed = parseInstagramOfflinePayload(mixedPayload);
  assertTest('Mixed carousel parses successfully', resMixed.isSuccess === true);
  assertTest('Identified as carousel postKind', resMixed.postKind === 'carousel');
  assertTest('Extracted both photos and videos', resMixed.imageCandidates.length >= 2 && resVideo.videoCandidates.length >= 1);
  assertTest('Preserved slide video duration', resMixed.videoCandidates.some(v => v.durationSeconds === 28.5));

  // 5. Malformed JSON Syntax
  console.log('\n--- 5. MALFORMED JSON SYNTAX ---');
  const resMalformed = parseInstagramOfflinePayload('{ "items": [ broken json ...');
  assertTest('Rejects malformed JSON syntax gracefully', resMalformed.isSuccess === false);
  assertTest('Classified as INVALID_JSON', resMalformed.blockedReason === 'INVALID_JSON');

  // 6. Empty JSON Object
  console.log('\n--- 6. EMPTY JSON OBJECT ---');
  const emptyPayload = readFixture('empty.json');
  const resEmpty = parseInstagramOfflinePayload(emptyPayload);
  assertTest('Rejects empty JSON object', resEmpty.isSuccess === false);
  assertTest('Classified as EMPTY_PAYLOAD', resEmpty.blockedReason === 'EMPTY_PAYLOAD');

  // 7. Login and Checkpoint Responses
  console.log('\n--- 7. LOGIN AND CHECKPOINT RESPONSES ---');
  const loginHtmlPayload = readFixture('login_redirect.html');
  const resLoginHtml = parseInstagramOfflinePayload(loginHtmlPayload);
  assertTest('Detects HTML login redirect page', resLoginHtml.isSuccess === false && resLoginHtml.blockedReason === 'LOGIN_REQUIRED');

  const loginJsonPayload = readFixture('login_required.json');
  const resLoginJson = parseInstagramOfflinePayload(loginJsonPayload);
  assertTest('Detects JSON require_login flag', resLoginJson.isSuccess === false && resLoginJson.blockedReason === 'LOGIN_REQUIRED');

  const checkpointPayload = readFixture('checkpoint.json');
  const resCheckpoint = parseInstagramOfflinePayload(checkpointPayload);
  assertTest('Detects checkpoint/CAPTCHA required response', resCheckpoint.isSuccess === false && resCheckpoint.blockedReason === 'CHECKPOINT_REQUIRED');

  // 8. Unknown JSON Structure
  console.log('\n--- 8. UNKNOWN JSON STRUCTURE ---');
  const unknownPayload = readFixture('unknown_structure.json');
  const resUnknown = parseInstagramOfflinePayload(unknownPayload);
  assertTest('Rejects unknown schema (no items / graphql)', resUnknown.isSuccess === false);
  assertTest('Classified as UNKNOWN_STRUCTURE (no fake success)', resUnknown.blockedReason === 'UNKNOWN_STRUCTURE');

  // 9. Duplicate Candidate URLs
  console.log('\n--- 9. DUPLICATE CANDIDATE URLS ---');
  const dupPayload = readFixture('duplicates.json');
  const resDup = parseInstagramOfflinePayload(dupPayload);
  assertTest('Duplicate URLs deduplicated down to unique entries', resDup.imageCandidates.length === 2);

  // 10. Disallowed Host URL
  console.log('\n--- 10. DISALLOWED HOST URL ---');
  const unallowedPayload = readFixture('unallowed_host.json');
  const resUnallowed = parseInstagramOfflinePayload(unallowedPayload);
  assertTest('Extracts URL candidates from JSON', resUnallowed.imageCandidates.length === 2);
  const maliciousCandidate = resUnallowed.imageCandidates.find(c => c.rawUrl.includes('malicious-external-storage.com'));
  const legitCandidate = resUnallowed.imageCandidates.find(c => c.rawUrl.includes('cdninstagram.com'));
  assertTest('Rejects non-CDN host for download eligibility', maliciousCandidate?.isDownloadAllowed === false);
  assertTest('Allows legit CDN host for download eligibility', legitCandidate?.isDownloadAllowed === true);
  console.log(`  Malicious masked URL: ${maliciousCandidate?.maskedUrl} -> allowed: ${maliciousCandidate?.isDownloadAllowed} (Reason: ${maliciousCandidate?.securityReason})`);

  // 11. Insecure Protocol / Malformed URL
  console.log('\n--- 11. INSECURE PROTOCOL / MALFORMED URL ---');
  const invalidProtoPayload = readFixture('invalid_protocol.json');
  const resInvalidProto = parseInstagramOfflinePayload(invalidProtoPayload);
  const httpCandidate = resInvalidProto.imageCandidates.find(c => c.rawUrl.startsWith('http://'));
  const malformedCandidate = resInvalidProto.imageCandidates.find(c => c.rawUrl === 'not-a-valid-url-at-all');
  const httpsCandidate = resInvalidProto.imageCandidates.find(c => c.rawUrl.startsWith('https://'));
  assertTest('Rejects plain HTTP protocol for download', httpCandidate?.isDownloadAllowed === false);
  assertTest('Rejects malformed URL for download', malformedCandidate?.isDownloadAllowed === false);
  assertTest('Permits valid HTTPS CDN for download', httpsCandidate?.isDownloadAllowed === true);

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runOfflineLabTests().catch((err) => {
  console.error('Fatal error in test runner:', err);
  process.exit(1);
});
