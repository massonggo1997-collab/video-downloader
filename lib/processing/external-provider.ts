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

  private getHeaders(): Record<string, string> {
    let hostname = '';
    try {
      hostname = new URL(this.apiUrl).hostname;
    } catch {
      // fallback
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      headers['x-rapidapi-key'] = this.apiKey;
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      if (hostname) {
        headers['x-rapidapi-host'] = hostname;
      }
    }

    return headers;
  }

  async createJob(input: CreateJobInput & { jobId: string }): Promise<ProcessingJob> {
    if (!this.apiUrl) {
      throw new Error('External processing API URL is not configured.');
    }

    const response = await fetch(`${this.apiUrl}/jobs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        jobId: input.jobId,
        sourceUrl: input.sourceUrl,
        url: input.sourceUrl,
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
    const extractedFileUrl = data.fileUrl || data.url || data.download_url || data.link || data.result;

    return {
      id: data.id || input.jobId,
      status: extractedFileUrl ? 'COMPLETED' : (data.status || 'QUEUED'),
      progress: extractedFileUrl ? 100 : (data.progress || 0),
      fileUrl: extractedFileUrl,
    };
  }

  async getJobStatus(id: string): Promise<ProcessingJob> {
    const response = await fetch(`${this.apiUrl}/jobs/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to query external job status.');
    }

    const data = await response.json();
    const extractedFileUrl = data.fileUrl || data.url || data.download_url || data.link || data.result;

    return {
      id: data.id || id,
      status: extractedFileUrl ? 'COMPLETED' : (data.status || 'PROCESSING'),
      progress: extractedFileUrl ? 100 : (data.progress || 50),
      fileUrl: extractedFileUrl,
      errorMessage: data.errorMessage,
    };
  }

  async cancelJob(id: string): Promise<void> {
    await fetch(`${this.apiUrl}/jobs/${id}/cancel`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  }
}
