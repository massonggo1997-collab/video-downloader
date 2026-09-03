import { CreateJobInput, ProcessingJob } from '@/types/download';

export interface ProcessingProvider {
  id: string;
  name: string;
  createJob(input: CreateJobInput & { jobId: string }): Promise<ProcessingJob>;
  getJobStatus(id: string): Promise<ProcessingJob>;
  cancelJob?(id: string): Promise<void>;
}
