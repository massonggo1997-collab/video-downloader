import { VideoInfo, VideoFormat } from '@/types/video';

export interface VideoExtractor {
  id: string;
  name: string;
  canHandle(url: string): Promise<boolean>;
  analyze(url: string): Promise<VideoInfo>;
  getFormats(url: string): Promise<VideoFormat[]>;
}
