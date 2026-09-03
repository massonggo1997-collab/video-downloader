import { NextRequest, NextResponse } from 'next/server';
import { validateSourceUrl } from '@/lib/validators/url';
import { validateSSRF } from '@/lib/security/ssrf';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { getProcessingProvider } from '@/lib/processing/provider';
import { getCurrentUser } from '@/lib/security/authorization';
import { createAdminClient } from '@/lib/supabase/admin';
import { APP_CONFIG } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
    const identifier = user ? user.id : clientIp;

    // Rate Limiting
    const rateLimit = await checkRateLimit(identifier, 'download', !!user);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: `Download rate limit reached. Try again in ${rateLimit.resetInSeconds} seconds.`,
          },
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { sourceUrl, formatId, quality = '720p', format = 'MP4', title = 'Downloaded Video', thumbnailUrl } = body;

    if (!sourceUrl || !formatId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'sourceUrl and formatId are required.',
          },
        },
        { status: 400 }
      );
    }

    // URL Validation
    const validation = validateSourceUrl(sourceUrl);
    if (!validation.valid || !validation.normalizedUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: validation.error || 'Invalid video source URL.',
          },
        },
        { status: 400 }
      );
    }

    // SSRF Check
    const ssrfResult = await validateSSRF(validation.normalizedUrl);
    if (!ssrfResult.safe) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Source URL violates SSRF security boundaries.',
          },
        },
        { status: 400 }
      );
    }

    const domain = new URL(validation.normalizedUrl).hostname;
    const expiresAt = new Date(Date.now() + APP_CONFIG.fileExpirationHours * 60 * 60 * 1000).toISOString();

    // Create database job in Supabase
    const supabase = createAdminClient();
    const { data: jobRecord, error: dbError } = await supabase
      .from('downloads')
      .insert({
        user_id: user?.id || null,
        source_url: validation.normalizedUrl,
        source_domain: domain,
        title: title,
        thumbnail_url: thumbnailUrl,
        quality: quality,
        format: format,
        status: 'QUEUED',
        progress: 0,
        expires_at: expiresAt,
      })
      .select('id, status, progress')
      .single();

    if (dbError || !jobRecord) {
      // Fallback if DB table is not initialized yet in local test mode
      const fallbackId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const provider = getProcessingProvider();
      await provider.createJob({
        jobId: fallbackId,
        sourceUrl: validation.normalizedUrl,
        formatId,
        quality,
        format,
        title,
        thumbnailUrl,
        userId: user?.id || null,
      });

      return NextResponse.json({
        success: true,
        data: {
          id: fallbackId,
          status: 'QUEUED',
          progress: 0,
          expiresAt,
        },
      });
    }

    // Submit to Processing Provider
    const provider = getProcessingProvider();
    const job = await provider.createJob({
      jobId: jobRecord.id,
      sourceUrl: validation.normalizedUrl,
      formatId,
      quality,
      format,
      title,
      thumbnailUrl,
      userId: user?.id || null,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: jobRecord.id,
        status: job.status,
        progress: job.progress,
        expiresAt,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROCESSING_FAILED',
          message: err.message || 'Failed to initialize download job.',
        },
      },
      { status: 500 }
    );
  }
}
