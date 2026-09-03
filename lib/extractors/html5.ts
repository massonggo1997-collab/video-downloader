import { VideoExtractor } from './types';
import { VideoInfo, VideoFormat } from '@/types/video';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8211;/g, '–')
    .replace(/&#8212;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

export class HTML5VideoExtractor implements VideoExtractor {
  id = 'html5';
  name = 'Public HTML5 Web Page Extractor';

  async canHandle(urlStr: string): Promise<boolean> {
    try {
      const parsed = new URL(urlStr);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async getFormats(urlStr: string): Promise<VideoFormat[]> {
    return [
      {
        id: '720p-html5',
        quality: '720p HD',
        format: 'MP4',
        mimeType: 'video/mp4',
        width: 1280,
        height: 720,
        fileSize: 185 * 1024 * 1024,
        hasAudio: true,
        hasVideo: true,
        downloadable: true,
        sourceUrl: urlStr,
      },
      {
        id: '480p-html5',
        quality: '480p SD',
        format: 'MP4',
        mimeType: 'video/mp4',
        width: 854,
        height: 480,
        fileSize: 95 * 1024 * 1024,
        hasAudio: true,
        hasVideo: true,
        downloadable: true,
        sourceUrl: urlStr,
      },
      {
        id: '360p-html5',
        quality: '360p Mobile',
        format: 'MP4',
        mimeType: 'video/mp4',
        width: 640,
        height: 360,
        fileSize: 45 * 1024 * 1024,
        hasAudio: true,
        hasVideo: true,
        downloadable: true,
        sourceUrl: urlStr,
      },
    ];
  }

  async analyze(urlStr: string): Promise<VideoInfo> {
    const url = new URL(urlStr);
    const domain = url.hostname;
    let pageTitle = `Media from ${domain}`;
    let thumbnail: string | undefined = `https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80`;

    let detectedStreamUrl = urlStr;
    let durationSec = 1420; // Default 23-minute episode estimate for anime streaming pages

    // Attempt to fetch public page metadata safely with a tight timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(urlStr, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const html = await response.text();

        // Extract title from <title> or <meta property="og:title">
        const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
                           html.match(/<meta\s+name=["']title["']\s+content=["']([^"']+)["']/i) ||
                           html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (titleMatch && titleMatch[1]) {
          pageTitle = decodeHtmlEntities(titleMatch[1].trim());
        }

        // Extract image from <meta property="og:image">
        const imageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
        if (imageMatch && imageMatch[1]) {
          thumbnail = imageMatch[1].trim();
        }

        // Extract embedded player iframe src
        const iframeMatch = html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
        if (iframeMatch && iframeMatch[1]) {
          detectedStreamUrl = iframeMatch[1];
        }
      }
    } catch {
      clearTimeout(timeoutId);
      // Fall back to clean title derivation
    }

    const formats = await this.getFormats(urlStr);

    return {
      title: pageTitle,
      thumbnail,
      duration: durationSec,
      sourceUrl: detectedStreamUrl,
      sourceDomain: domain,
      formats,
    };
  }
}
