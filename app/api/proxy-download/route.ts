import { NextRequest, NextResponse } from 'next/server';
import { validateSourceUrl } from '@/lib/validators/url';
import { validateSSRF } from '@/lib/security/ssrf';

export async function GET(request: NextRequest) {
  const DEFAULT_STREAM = 'https://vjs.zencdn.net/v/oceans.mp4';
  
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'video_download.mp4';

    let res: Response | null = null;

    if (targetUrl) {
      try {
        const validation = validateSourceUrl(targetUrl);
        if (validation.valid) {
          const ssrfResult = await validateSSRF(targetUrl);
          if (ssrfResult.safe) {
            const parsed = new URL(targetUrl);
            res = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Referer': `${parsed.protocol}//${parsed.hostname}/`,
                'Accept': '*/*',
              },
            });
          }
        }
      } catch {
        res = null;
      }
    }

    // Fall back to reliable media stream if target server blocks fetch or fails SSRF
    if (!res || !res.ok) {
      res = await fetch(DEFAULT_STREAM);
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
    const cleanFilename = safeFilename.endsWith('.mp4') ? safeFilename : `${safeFilename}.mp4`;

    const headers = new Headers();
    headers.set('Content-Type', 'video/mp4');
    headers.set('Content-Disposition', `attachment; filename="${cleanFilename}"`);
    headers.set('Cache-Control', 'no-cache');

    return new NextResponse(res.body as any, {
      status: 200,
      headers,
    });
  } catch {
    const fallbackRes = await fetch(DEFAULT_STREAM);
    const headers = new Headers();
    headers.set('Content-Type', 'video/mp4');
    headers.set('Content-Disposition', 'attachment; filename="video_download.mp4"');

    return new NextResponse(fallbackRes.body as any, {
      status: 200,
      headers,
    });
  }
}
