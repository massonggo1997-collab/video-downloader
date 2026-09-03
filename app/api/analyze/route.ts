import { NextRequest, NextResponse } from 'next/server';
import { validateSourceUrl } from '@/lib/validators/url';
import { validateSSRF } from '@/lib/security/ssrf';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { extractorManager } from '@/lib/extractors/manager';
import { getCurrentUser } from '@/lib/security/authorization';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const identifier = user ? user.id : clientIp;

    // Rate Limiting
    const rateLimit = await checkRateLimit(identifier, 'analyze', !!user);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: `Rate limit exceeded. Please try again in ${rateLimit.resetInSeconds} seconds.`,
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { url } = body;

    // URL Validation
    const validation = validateSourceUrl(url);
    if (!validation.valid || !validation.normalizedUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: validation.error || 'The provided URL is invalid.',
          },
        },
        { status: 400 }
      );
    }

    const targetUrl = validation.normalizedUrl;

    // SSRF Check
    const ssrfResult = await validateSSRF(targetUrl);
    if (!ssrfResult.safe) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: ssrfResult.reason || 'URL violates security policies (SSRF protection).',
          },
        },
        { status: 400 }
      );
    }

    // Perform Video Analysis via Extractor Framework
    const videoInfo = await extractorManager.analyzeUrl(targetUrl);

    return NextResponse.json({
      success: true,
      data: videoInfo,
    });
  } catch (err: any) {
    const message = err.message || '';
    if (message.startsWith('VIDEO_NOT_FOUND')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VIDEO_NOT_FOUND',
            message: 'No downloadable public video was found at the provided URL.',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROCESSING_FAILED',
          message: err.message || 'Failed to analyze video URL.',
        },
      },
      { status: 500 }
    );
  }
}
