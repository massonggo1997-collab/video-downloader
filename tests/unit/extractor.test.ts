import { describe, it, expect } from 'vitest';
import { DirectVideoExtractor } from '../../lib/extractors/direct';
import { HTML5VideoExtractor } from '../../lib/extractors/html5';
import { ExtractorManager } from '../../lib/extractors/manager';

describe('Video Extractor Framework', () => {
  it('DirectVideoExtractor should identify direct video extensions', async () => {
    const extractor = new DirectVideoExtractor();
    const canHandleMp4 = await extractor.canHandle('https://example.com/video.mp4');
    expect(canHandleMp4).toBe(true);

    const canHandleM3u8 = await extractor.canHandle('https://example.com/stream.m3u8');
    expect(canHandleM3u8).toBe(true);
  });

  it('HTML5VideoExtractor should handle public web URLs', async () => {
    const extractor = new HTML5VideoExtractor();
    const canHandle = await extractor.canHandle('https://example.com/watch/video-page');
    expect(canHandle).toBe(true);
  });

  it('ExtractorManager should analyze and return format options', async () => {
    const manager = new ExtractorManager();
    const videoInfo = await manager.analyzeUrl('https://example.com/demo.mp4');
    expect(videoInfo.title).toBeDefined();
    expect(videoInfo.formats.length).toBeGreaterThan(0);
    expect(videoInfo.formats[0].quality).toBeDefined();
  });
});
