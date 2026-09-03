import { z } from 'zod';
import { APP_CONFIG } from '@/lib/config';

export const sourceUrlSchema = z
  .string()
  .min(1, 'URL is required')
  .max(APP_CONFIG.maxUrlLength, `URL cannot exceed ${APP_CONFIG.maxUrlLength} characters`)
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'URL must begin with http:// or https://' }
  )
  .refine(
    (val) => {
      try {
        const parsed = new URL(val);
        const host = parsed.hostname.toLowerCase();
        return (
          host !== 'localhost' &&
          host !== '127.0.0.1' &&
          host !== '0.0.0.0' &&
          !host.endsWith('.local') &&
          !host.endsWith('.internal')
        );
      } catch {
        return false;
      }
    },
    { message: 'Internal or localhost URLs are not allowed.' }
  );

export function validateSourceUrl(urlStr: string): { valid: boolean; normalizedUrl?: string; error?: string } {
  const result = sourceUrlSchema.safeParse(urlStr);
  if (!result.success) {
    return {
      valid: false,
      error: result.error.errors[0]?.message || 'Invalid URL format',
    };
  }

  try {
    const parsed = new URL(result.data);
    // Normalize hostname to lowercase
    parsed.hostname = parsed.hostname.toLowerCase();
    return {
      valid: true,
      normalizedUrl: parsed.toString(),
    };
  } catch (err: any) {
    return {
      valid: false,
      error: err.message || 'Invalid URL format',
    };
  }
}
