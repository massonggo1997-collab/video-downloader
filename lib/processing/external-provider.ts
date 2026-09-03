import { ProcessingProvider } from './types';
import { CreateJobInput, ProcessingJob } from '@/types/download';
import { APP_CONFIG } from '@/lib/config';

export class ExternalProcessingProvider implements ProcessingProvider {
  id = 'external';
  name = 'External REST Processing Provider';

  private apiUrl: string;
  private apiKey: string;

  constructor() {
    this.apiUrl = APP_CONFIG.processingApiUrl;
    this.apiKey = APP_CONFIG.processingApiKey;
  }

  async createJob(input: CreateJobInput & { jobId: string }): Promise<ProcessingJob> {
    if (!this.apiUrl) {
      throw new Error('External processing API URL is not configured.');
    }

    const response = await fetch(`${this.apiUrl}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        jobId: input.jobId,
        sourceUrl: input.sourceUrl,
        formatId: input.formatId,
        quality: input.quality,
        format: input.format,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`External processing provider error: ${errText}`);
    }

    const data = await response.json();
    return {
      id: data.id || input.jobId,
      status: data.status || 'QUEUED',
      progress: data.progress || 0,
    };
  }

  async getJobStatus(id: string): Promise<ProcessingJob> {
    const response = await fetch(`${this.apiUrl}/jobs/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to query external job status.');
    }

    const data = await response.json();
    return {
      id: data.id || id,
      status: data.status,
      progress: data.progress,
      fileUrl: data.fileUrl,
      errorMessage: data.errorMessage,
    };
  }

  async cancelJob(id: string): Promise<void> {
    await fetch(`${this.apiUrl}/jobs/${id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });
  }
}
