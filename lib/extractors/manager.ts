import { VideoExtractor } from './types';
import { DirectVideoExtractor } from './direct';
import { HTML5VideoExtractor } from './html5';
import { VideoInfo } from '@/types/video';

export class ExtractorManager {
  private extractors: VideoExtractor[] = [];

  constructor() {
    // Register extractors in priority order
    this.extractors = [
      new DirectVideoExtractor(),
      new HTML5VideoExtractor(),
    ];
  }

  public registerExtractor(extractor: VideoExtractor) {
    this.extractors.unshift(extractor);
  }

  public async analyzeUrl(url: string): Promise<VideoInfo> {
    for (const extractor of this.extractors) {
      const canHandle = await extractor.canHandle(url);
      if (canHandle) {
        try {
          const info = await extractor.analyze(url);
          if (info && info.formats && info.formats.length > 0) {
            return info;
          }
        } catch {
          // Continue to next extractor if analysis failed
        }
      }
    }

    throw new Error('VIDEO_NOT_FOUND: No downloadable public video content was found at the provided URL.');
  }
}

export const extractorManager = new ExtractorManager();
