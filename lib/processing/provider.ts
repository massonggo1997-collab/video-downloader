import { ProcessingProvider } from './types';
import { MockProcessingProvider } from './mock-provider';
import { ExternalProcessingProvider } from './external-provider';
import { NativeProcessingProvider } from './native-provider';
import { APP_CONFIG } from '@/lib/config';

export function getProcessingProvider(): ProcessingProvider {
  if (APP_CONFIG.processingProvider === 'external') {
    return new ExternalProcessingProvider();
  }
  if (APP_CONFIG.processingProvider === 'mock') {
    return new MockProcessingProvider();
  }
  return new NativeProcessingProvider();
}
