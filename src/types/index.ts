export type Platform = 'all' | 'instagram' | 'threads';

export type ContentType = 'reel' | 'post' | 'carousel' | 'video' | 'photo' | 'unknown';

export interface ParsedUrlData {
  isValid: boolean;
  rawUrl: string;
  platform: 'instagram' | 'threads' | 'unknown';
  contentType: ContentType;
  id?: string;
  author?: string;
  errorMessage?: string;
}

export type LegalModalType = 'terms' | 'privacy' | 'copyright' | null;
