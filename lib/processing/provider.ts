import { ProcessingProvider } from './types';
import { MockProcessingProvider } from './mock-provider';
import { ExternalProcessingProvider } from './external-provider';
import { APP_CONFIG } from '@/lib/config';

export function getProcessingProvider(): ProcessingProvider {
  if (APP_CONFIG.processingProvider === 'external') {
    return new ExternalProcessingProvider();
  }
  return new MockProcessingProvider();
}
