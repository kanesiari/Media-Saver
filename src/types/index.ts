export type Platform = 'all' | 'instagram' | 'threads';

export type ContentType = 'reel' | 'post' | 'carousel' | 'video' | 'photo' | 'unknown';

export interface VideoQualityOption {
  id: string;
  label: string;
  resolution: string;
  width?: number;
  height?: number;
  url: string;
  downloadUrl: string;
  mimeType: string;
  isDefault?: boolean;
}

export interface ExtractedMedia {
  id?: string;
  slideIndex?: number;
  type: 'image' | 'video' | 'carousel';
  url: string;
  downloadUrl?: string;
  previewUrl?: string;
  resolution?: string;
  mimeType?: string;
  verified: boolean;
  label?: string;
  width?: number;
  height?: number;
  qualityOptions?: VideoQualityOption[];
}

export interface AnalysisResponse {
  success: boolean;
  urlValid: boolean;
  postVerified: boolean;
  previewAvailable: boolean;
  hasDirectDownload: boolean;
  platform: 'instagram' | 'threads' | 'unknown';
  contentType: 'reel' | 'post' | 'video' | 'photo' | 'carousel' | 'unknown';
  shortcode: string;
  canonicalUrl: string;
  embedUrl: string;
  author?: string;
  caption?: string;
  mediaList: ExtractedMedia[];
  statusMessage: string;
  restrictionNotice?: string;
  technicalDetails?: {
    metaGraphApiConfigured: boolean;
    directStreamAvailable: boolean;
    imageDownloadAvailable: boolean;
    videoDownloadAvailable: boolean;
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
