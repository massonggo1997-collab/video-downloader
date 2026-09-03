import { ProcessingProvider } from './types';
import { CreateJobInput, ProcessingJob } from '@/types/download';

interface MockJobRecord {
  id: string;
  createdAt: number;
  formatId: string;
  sourceUrl: string;
  progress: number;
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  fileUrl?: string;
}

const mockJobsStore = new Map<string, MockJobRecord>();

export class MockProcessingProvider implements ProcessingProvider {
  id = 'mock';
  name = 'Mock Development Processing Provider';

  async createJob(input: CreateJobInput & { jobId: string }): Promise<ProcessingJob> {
    const record: MockJobRecord = {
      id: input.jobId,
      createdAt: Date.now(),
      formatId: input.formatId,
      sourceUrl: input.sourceUrl,
      progress: 5,
      status: 'QUEUED',
    };

    mockJobsStore.set(input.jobId, record);

    return {
      id: input.jobId,
      status: 'QUEUED',
      progress: 5,
    };
  }

  async getJobStatus(id: string): Promise<ProcessingJob> {
    let record = mockJobsStore.get(id);

    if (!record) {
      // Return initial status if not found in memory (e.g., restarted server instance)
      return {
        id,
        status: 'PROCESSING',
        progress: 55,
        fileUrl: `https://vjs.zencdn.net/v/oceans.mp4`,
      };
    }

    const elapsedMs = Date.now() - record.createdAt;

    // Simulate progress over 10 seconds
    if (elapsedMs < 2000) {
      record.status = 'QUEUED';
      record.progress = Math.min(20, Math.floor((elapsedMs / 2000) * 20));
    } else if (elapsedMs < 8000) {
      record.status = 'PROCESSING';
      record.progress = 20 + Math.floor(((elapsedMs - 2000) / 6000) * 75);
    } else {
      record.status = 'COMPLETED';
      record.progress = 100;
      record.fileUrl = 'https://vjs.zencdn.net/v/oceans.mp4';
    }

    mockJobsStore.set(id, record);

    return {
      id: record.id,
      status: record.status,
      progress: record.progress,
      fileUrl: record.fileUrl,
    };
  }

  async cancelJob(id: string): Promise<void> {
    const record = mockJobsStore.get(id);
    if (record) {
      record.status = 'FAILED';
      record.progress = 0;
      mockJobsStore.set(id, record);
    }
  }
}
