/**
 * Safe Offline Parser for Instagram JSON Lab (Offline Experiment)
 * Parses raw JSON or HTML payloads, classifies structures, extracts candidate URLs,
 * preserves metadata, and enforces security boundary checks.
 */

import { ParseResult, MediaCandidate, BlockedReason, PostKind } from './types';
import { maskUrl, validateDownloadEligibility } from './validator';

export function parseInstagramOfflinePayload(rawPayload: string): ParseResult {
  const emptyResult = (blockedReason: BlockedReason, errorMessage: string): ParseResult => ({
    isSuccess: false,
    blockedReason,
    errorMessage,
    postKind: 'unknown',
    mediaCount: 0,
    imageCandidates: [],
    videoCandidates: [],
    allCandidates: [],
    metadata: {},
  });

  if (!rawPayload || typeof rawPayload !== 'string' || rawPayload.trim().length === 0) {
    return emptyResult('EMPTY_PAYLOAD', 'Payload is empty or whitespace only.');
  }

  const trimmed = rawPayload.trim();

  // 1. Detect HTML Login Page Redirects or Challenge Pages
  if (
    trimmed.startsWith('<!DOCTYPE html>') ||
    trimmed.startsWith('<html') ||
    trimmed.includes('<title>Login • Instagram</title>') ||
    trimmed.includes('/accounts/login/')
  ) {
    return emptyResult(
      'LOGIN_REQUIRED',
      'Payload is an HTML document redirecting to Instagram login or challenge page.'
    );
  }

  // 2. Safe JSON Parsing
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(trimmed);
  } catch (err: any) {
    return emptyResult('INVALID_JSON', `Malformed JSON syntax: ${err.message}`);
  }

  if (typeof parsedJson !== 'object' || parsedJson === null) {
    return emptyResult('INVALID_JSON', 'Parsed JSON is not an object.');
  }

  // 3. Detect Explicit Auth or Checkpoint Flags
  if (parsedJson.require_login === true || parsedJson.message === 'user not logged in') {
    return emptyResult('LOGIN_REQUIRED', 'Instagram returned authentication requirement flag.');
  }

  if (
    parsedJson.message === 'checkpoint_required' ||
    parsedJson.checkpoint_url ||
    parsedJson.status === 'fail' && parsedJson.message?.includes('checkpoint')
  ) {
    return emptyResult('CHECKPOINT_REQUIRED', 'Instagram requested interactive security checkpoint/CAPTCHA.');
  }

  if (parsedJson.status === 'fail') {
    return emptyResult('NOT_FOUND', `Request returned status fail: ${parsedJson.message || 'unknown error'}`);
  }

  // 4. Check for Empty Object
  const keys = Object.keys(parsedJson);
  if (keys.length === 0) {
    return emptyResult('EMPTY_PAYLOAD', 'JSON payload is an empty object {}.');
  }

  // 5. Structure Identification
  const itemNode = parsedJson.items?.[0] || parsedJson.graphql?.shortcode_media;

  if (!itemNode) {
    return emptyResult(
      'UNKNOWN_STRUCTURE',
      'Unrecognized JSON schema: missing both "items[0]" and "graphql.shortcode_media" root nodes.'
    );
  }

  // Extract common metadata
  const shortcode = itemNode.code || itemNode.shortcode;
  const caption =
    itemNode.caption?.text ||
    itemNode.edge_media_to_caption?.edges?.[0]?.node?.text;
  const authorUsername =
    itemNode.user?.username || itemNode.owner?.username;
  const likeCount =
    itemNode.like_count ?? itemNode.edge_media_preview_like?.count;
  const commentCount =
    itemNode.comment_count ?? itemNode.edge_media_to_comment?.count;

  const rawImageCandidates: MediaCandidate[] = [];
  const rawVideoCandidates: MediaCandidate[] = [];

  const addCandidate = (
    url: string,
    type: 'image' | 'video',
    width?: number,
    height?: number,
    durationSeconds?: number,
    id?: string
  ) => {
    if (!url || typeof url !== 'string') return;
    const eligibility = validateDownloadEligibility(url);
    const candidate: MediaCandidate = {
      id,
      type,
      rawUrl: url,
      maskedUrl: maskUrl(url),
      width,
      height,
      durationSeconds,
      isDownloadAllowed: eligibility.allowed,
      securityReason: eligibility.reason,
    };

    if (type === 'image') {
      rawImageCandidates.push(candidate);
    } else {
      rawVideoCandidates.push(candidate);
    }
  };

  let postKind: PostKind = 'unknown';

  // Branch A: Internal Mobile/Web items[0] schema
  if (parsedJson.items && Array.isArray(parsedJson.items)) {
    const mediaType = itemNode.media_type; // 1 = Photo, 2 = Video, 8 = Carousel

    // A.1 Carousel (multi-media)
    if (mediaType === 8 || Array.isArray(itemNode.carousel_media)) {
      postKind = 'carousel';
      const carouselItems = itemNode.carousel_media || [];
      for (let i = 0; i < carouselItems.length; i++) {
        const sub = carouselItems[i];
        const subId = sub.id || `carousel_${i}`;
        // Images in carousel item
        if (sub.image_versions2?.candidates) {
          for (const cand of sub.image_versions2.candidates) {
            addCandidate(cand.url, 'image', cand.width, cand.height, undefined, subId);
          }
        }
        // Videos in carousel item
        if (sub.video_versions && Array.isArray(sub.video_versions)) {
          for (const vid of sub.video_versions) {
            addCandidate(vid.url, 'video', vid.width, vid.height, sub.video_duration, subId);
          }
        }
      }
    }
    // A.2 Single Video
    else if (mediaType === 2 || (itemNode.video_versions && itemNode.video_versions.length > 0)) {
      postKind = 'single_video';
      for (const vid of itemNode.video_versions || []) {
        addCandidate(vid.url, 'video', vid.width, vid.height, itemNode.video_duration);
      }
      for (const img of itemNode.image_versions2?.candidates || []) {
        addCandidate(img.url, 'image', img.width, img.height);
      }
    }
    // A.3 Single Photo
    else if (mediaType === 1 || itemNode.image_versions2?.candidates) {
      postKind = 'single_photo';
      for (const img of itemNode.image_versions2?.candidates || []) {
        addCandidate(img.url, 'image', img.width, img.height);
      }
    }
  }
  // Branch B: GraphQL schema (graphql.shortcode_media)
  else if (parsedJson.graphql?.shortcode_media) {
    const isVideo = Boolean(itemNode.is_video);
    const sidecarEdges = itemNode.edge_sidecar_to_children?.edges;

    if (Array.isArray(sidecarEdges) && sidecarEdges.length > 0) {
      postKind = 'carousel';
      for (let i = 0; i < sidecarEdges.length; i++) {
        const node = sidecarEdges[i].node;
        const subId = node.id || `sidecar_${i}`;
        if (node.display_url) {
          addCandidate(
            node.display_url,
            'image',
            node.dimensions?.width,
            node.dimensions?.height,
            undefined,
            subId
          );
        }
        if (node.video_url) {
          addCandidate(
            node.video_url,
            'video',
            node.dimensions?.width,
            node.dimensions?.height,
            node.video_duration,
            subId
          );
        }
      }
    } else if (isVideo) {
      postKind = 'single_video';
      if (itemNode.video_url) {
        addCandidate(
          itemNode.video_url,
          'video',
          itemNode.dimensions?.width,
          itemNode.dimensions?.height,
          itemNode.video_duration
        );
      }
      if (itemNode.display_url) {
        addCandidate(
          itemNode.display_url,
          'image',
          itemNode.dimensions?.width,
          itemNode.dimensions?.height
        );
      }
    } else {
      postKind = 'single_photo';
      if (itemNode.display_url) {
        addCandidate(
          itemNode.display_url,
          'image',
          itemNode.dimensions?.width,
          itemNode.dimensions?.height
        );
      }
      for (const res of itemNode.display_resources || []) {
        addCandidate(res.src, 'image', res.config_width, res.config_height);
      }
    }
  }

  // Deduplication based on rawUrl
  const deduplicate = (list: MediaCandidate[]): MediaCandidate[] => {
    const seen = new Set<string>();
    const result: MediaCandidate[] = [];
    for (const item of list) {
      if (!seen.has(item.rawUrl)) {
        seen.add(item.rawUrl);
        result.push(item);
      }
    }
    return result;
  };

  const uniqueImages = deduplicate(rawImageCandidates);
  const uniqueVideos = deduplicate(rawVideoCandidates);
  const allCandidates = deduplicate([...uniqueVideos, ...uniqueImages]);

  if (allCandidates.length === 0) {
    return emptyResult(
      'UNKNOWN_STRUCTURE',
      'Item node was located, but no valid photo or video candidate URLs could be extracted.'
    );
  }

  return {
    isSuccess: true,
    postKind,
    mediaCount: allCandidates.length,
    imageCandidates: uniqueImages,
    videoCandidates: uniqueVideos,
    allCandidates,
    metadata: {
      shortcode,
      caption,
      authorUsername,
      likeCount,
      commentCount,
    },
  };
}
