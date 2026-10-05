/**
 * Types and Contracts for Media Extraction Integration Lab
 * Bridges JSON parser output with media downloader engine contract.
 */

export interface ExtractedMediaItem {
  id?: string;
  type: 'image' | 'video' | 'carousel';
  rawUrl: string;
  downloadUrl?: string;
  previewUrl?: string;
  resolution?: string;
  mimeType?: string;
  verified: boolean;
  isDownloadAllowed: boolean;
  securityReason?: string;
}

export interface ExtractionContractResult {
  success: boolean;
  error?: string;
  postType: 'single_photo' | 'single_video' | 'carousel' | 'unknown';
  items: ExtractedMediaItem[];
  metadata: {
    shortcode?: string;
    caption?: string;
    author?: string;
    itemCount: number;
  };
}
