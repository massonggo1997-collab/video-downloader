export type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';

export interface DownloadJob {
  id: string;
  userId?: string | null;
  sourceUrl: string;
  sourceDomain: string;
  title: string;
  thumbnailUrl?: string;
  quality: string;
  format: string;
  fileSize?: number;
  status: JobStatus;
  progress: number;
  fileUrl?: string | null;
  errorMessage?: string | null;
  createdAt: string;
  completedAt?: string | null;
  expiresAt?: string | null;
}

export interface CreateJobInput {
  sourceUrl: string;
  formatId: string;
  quality?: string;
  format?: string;
  title?: string;
  thumbnailUrl?: string;
  userId?: string | null;
}

export interface ProcessingJob {
  id: string;
  status: JobStatus;
  progress: number;
  fileUrl?: string | null;
  errorMessage?: string | null;
}
