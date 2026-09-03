import { NextRequest, NextResponse } from 'next/server';
import { getProcessingProvider } from '@/lib/processing/provider';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'Job ID parameter is missing.',
          },
        },
        { status: 400 }
      );
    }

    const provider = getProcessingProvider();
    const statusResult = await provider.getJobStatus(jobId);

    // Update status in Supabase if DB available
    const supabase = createAdminClient();
    const updateData: any = {
      status: statusResult.status,
      progress: statusResult.progress,
    };
    if (statusResult.fileUrl) {
      updateData.file_url = statusResult.fileUrl;
    }
    if (statusResult.status === 'COMPLETED') {
      updateData.completed_at = new Date().toISOString();
    }
    if (statusResult.errorMessage) {
      updateData.error_message = statusResult.errorMessage;
    }

    try {
      await supabase.from('downloads').update(updateData).eq('id', jobId);
    } catch {
      // Ignore DB update errors if DB is unreachable
    }

    return NextResponse.json({
      success: true,
      data: {
        id: jobId,
        status: statusResult.status,
        progress: statusResult.progress,
        fileUrl: statusResult.fileUrl || null,
        errorMessage: statusResult.errorMessage || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PROCESSING_FAILED',
          message: err.message || 'Could not retrieve job status.',
        },
      },
      { status: 500 }
    );
  }
}
