/**
 * Self-contained Types for Instagram JSON Lab (Offline Experiment)
 * Strictly decoupled from operational codebase (src/ and worker.ts).
 */

export type BlockedReason =
  | 'INVALID_JSON'
  | 'EMPTY_PAYLOAD'
  | 'LOGIN_REQUIRED'
  | 'CHECKPOINT_REQUIRED'
  | 'NOT_FOUND'
  | 'UNKNOWN_STRUCTURE';

export type PostKind = 'single_photo' | 'single_video' | 'carousel' | 'unknown';

export interface MediaCandidate {
  id?: string;
  type: 'image' | 'video';
  rawUrl: string;
  maskedUrl: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
  isDownloadAllowed: boolean;
  securityReason?: string;
}

export interface ParseResult {
  isSuccess: boolean;
  blockedReason?: BlockedReason;
  errorMessage?: string;
  postKind: PostKind;
  mediaCount: number;
  imageCandidates: MediaCandidate[];
  videoCandidates: MediaCandidate[];
  allCandidates: MediaCandidate[];
  metadata: {
    shortcode?: string;
    caption?: string;
    authorUsername?: string;
    likeCount?: number;
    commentCount?: number;
  };
}
