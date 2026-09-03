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



  async analyze(urlStr: string): Promise<VideoInfo> {
    const url = new URL(urlStr);
    const domain = url.hostname;
    let pageTitle = `Media from ${domain}`;
    let thumbnail: string | undefined = `https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80`;

    let detectedStreamUrl = urlStr;
    let durationSec = 1420; // Default 23-minute episode estimate for anime streaming pages
    let fetchedHtml: string | undefined = undefined;

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
        fetchedHtml = html;

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

        // Extract embedded player iframe src (preferring id="mediaplayer" or any iframe player)
        const iframeMatch = html.match(/<iframe[^>]*id=["']mediaplayer["'][^>]*src=["']([^"']+)["']/i) ||
                            html.match(/<iframe[^>]*src=["']([^"']+)["'][^>]*id=["']mediaplayer["']/i) ||
                            html.match(/<iframe[^>]+src=["']([^"']+)["']/i);

        if (iframeMatch && iframeMatch[1]) {
          try {
            const resolvedIframeUrl = new URL(iframeMatch[1], urlStr).toString();
            if (resolvedIframeUrl.startsWith('http://') || resolvedIframeUrl.startsWith('https://')) {
              detectedStreamUrl = resolvedIframeUrl;

              // Attempt level 2 iframe resolution if level 1 is an intermediate player wrapper
              if (resolvedIframeUrl.includes('adsbatch') || resolvedIframeUrl.includes('player') || resolvedIframeUrl.includes('upload')) {
                try {
                  const level2Res = await fetch(resolvedIframeUrl, {
                    signal: controller.signal,
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                      'Referer': urlStr,
                    },
                  });
                  if (level2Res.ok) {
                    const level2Html = await level2Res.text();
                    const level2Match = level2Html.match(/<iframe[^>]+src=["']([^"']+)["']/i);
                    if (level2Match && level2Match[1]) {
                      const resolvedLevel2Url = new URL(level2Match[1], resolvedIframeUrl).toString();
                      if (resolvedLevel2Url.startsWith('http://') || resolvedLevel2Url.startsWith('https://')) {
                        detectedStreamUrl = resolvedLevel2Url;
                      }
                    }
                  }
                } catch {
                  // Keep level 1 URL
                }
              }
            }
          } catch {
            detectedStreamUrl = urlStr;
          }
        }
      }
    } catch {
      clearTimeout(timeoutId);
      // Fall back to clean title derivation
    }

    const formats = await this.getFormats(urlStr, fetchedHtml);



    return {
      title: pageTitle,
      thumbnail,
      duration: durationSec,
      sourceUrl: detectedStreamUrl,
      sourceDomain: domain,
      formats,
    };
  }

  async getFormats(urlStr: string, htmlContent?: string): Promise<VideoFormat[]> {
    const parsedLinks: Record<string, string> = {};

    if (htmlContent) {
      const linkMatches = Array.from(htmlContent.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>\s*(1K|1080P|720P|480P|SD360P|360P|240P)\s*<\/a>/gi));
      for (const match of linkMatches) {
        const [, href, qualityTag] = match;
        if (href && !href.includes('none') && href.startsWith('http')) {
          const key = qualityTag.toUpperCase();
          if (!parsedLinks[key]) {
            parsedLinks[key] = href;
          }
        }
      }
    }

    const formats: VideoFormat[] = [];

    // 1080p / 1K
    if (parsedLinks['1K'] || parsedLinks['1080P']) {
      formats.push({
        id: '1080p-html5',
        quality: '1080p Full HD',
        format: 'MP4',
        mimeType: 'video/mp4',
        width: 1920,
        height: 1080,
        fileSize: 320 * 1024 * 1024,
        hasAudio: true,
        hasVideo: true,
        downloadable: true,
        sourceUrl: parsedLinks['1K'] || parsedLinks['1080P'],
      });
    }

    // 720p
    formats.push({
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
      sourceUrl: parsedLinks['720P'] || urlStr,
    });

    // 480p
    formats.push({
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
      sourceUrl: parsedLinks['480P'] || urlStr,
    });

    // 360p
    formats.push({
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
      sourceUrl: parsedLinks['360P'] || parsedLinks['SD360P'] || urlStr,
    });

    // 240p
    if (parsedLinks['240P']) {
      formats.push({
        id: '240p-html5',
        quality: '240p Low',
        format: 'MP4',
        mimeType: 'video/mp4',
        width: 426,
        height: 240,
        fileSize: 25 * 1024 * 1024,
        hasAudio: true,
        hasVideo: true,
        downloadable: true,
        sourceUrl: parsedLinks['240P'],
      });
    }

    return formats;
  }
}
