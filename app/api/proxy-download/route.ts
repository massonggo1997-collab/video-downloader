import { NextRequest, NextResponse } from 'next/server';
import { validateSourceUrl } from '@/lib/validators/url';
import { validateSSRF } from '@/lib/security/ssrf';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');
    const filename = searchParams.get('filename') || 'video_download.mp4';

    if (!targetUrl) {
      return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    const validation = validateSourceUrl(targetUrl);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const ssrfResult = await validateSSRF(targetUrl);
    if (!ssrfResult.safe) {
      return NextResponse.json({ error: ssrfResult.reason || 'SSRF check failed' }, { status: 403 });
    }

    const parsed = new URL(targetUrl);

    // Fetch stream from source or Blogger stream player
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': `${parsed.protocol}//${parsed.hostname}/`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch video stream: ${res.statusText}` }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'video/mp4';
    const cleanFilename = filename.endsWith('.mp4') ? filename : `${filename}.mp4`;

    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(cleanFilename)}"`);

    // Stream response directly to client to trigger browser download prompt
    return new NextResponse(res.body as any, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal proxy error' }, { status: 500 });
  }
}
