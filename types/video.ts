export interface VideoFormat {
  id: string;
  quality?: string;
  format: string;
  mimeType?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  hasAudio?: boolean;
  hasVideo?: boolean;
  downloadable: boolean;
  sourceUrl?: string;
}

export interface VideoInfo {
  title: string;
  thumbnail?: string;
  duration?: number;
  sourceUrl: string;
  sourceDomain: string;
  formats: VideoFormat[];
}
