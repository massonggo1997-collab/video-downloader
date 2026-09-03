import { APP_CONFIG } from '@/lib/config';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory bucket cache for serverless instance life cycle
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Checks rate limits for a given identifier (IP or User ID).
 */
export async function checkRateLimit(
  identifier: string,
  action: 'analyze' | 'download',
  isRegistered = false
): Promise<{ allowed: boolean; remaining: number; resetInSeconds: number }> {
  const limits = isRegistered ? APP_CONFIG.rateLimit.user : APP_CONFIG.rateLimit.guest;
  const maxLimit = action === 'analyze' ? limits.analyzePerHour : limits.downloadPerHour;

  const windowMs = 60 * 60 * 1000; // 1 hour window
  const key = `${action}:${identifier}`;
  const now = Date.now();

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: maxLimit - 1,
      resetInSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (record.count >= maxLimit) {
    const resetInSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
    };
  }

  record.count += 1;
  rateLimitStore.set(key, record);

  return {
    allowed: true,
    remaining: maxLimit - record.count,
    resetInSeconds: Math.ceil((record.resetAt - now) / 1000),
  };
}
