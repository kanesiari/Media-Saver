export type Platform = 'all' | 'instagram' | 'threads';

export type ContentType = 'reel' | 'post' | 'carousel' | 'video' | 'photo' | 'unknown';

export interface ExtractedMedia {
  type: 'image' | 'video' | 'carousel';
  url: string;
  previewUrl?: string;
  resolution?: string;
}

export interface AnalysisResponse {
  success: boolean;
  platform: 'instagram' | 'threads' | 'unknown';
  contentType: 'reel' | 'post' | 'video' | 'photo' | 'carousel' | 'unknown';
  shortcode: string;
  canonicalUrl: string;
  embedUrl: string;
  author?: string;
  caption?: string;
  mediaList: ExtractedMedia[];
  hasDirectDownload: boolean;
  statusMessage: string;
  technicalDetails?: {
    metaGraphApiConfigured: boolean;
    directStreamAvailable: boolean;
    serverIpRestrictedByMeta: boolean;
    recommendedAccess: string;
  };
  error?: string;
}

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
