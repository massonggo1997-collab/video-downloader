import { describe, it, expect } from 'vitest';
import { validateSourceUrl } from '../../lib/validators/url';

describe('URL Validator', () => {
  it('should accept valid HTTP and HTTPS URLs', () => {
    const res1 = validateSourceUrl('https://example.com/video.mp4');
    expect(res1.valid).toBe(true);
    expect(res1.normalizedUrl).toBe('https://example.com/video.mp4');

    const res2 = validateSourceUrl('http://commondatastorage.googleapis.com/sample.mp4');
    expect(res2.valid).toBe(true);
  });

  it('should reject ftp and invalid schemes', () => {
    const res = validateSourceUrl('ftp://example.com/video.mp4');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('http:// or https://');
  });

  it('should reject localhost and internal hostnames', () => {
    const res1 = validateSourceUrl('http://localhost/video.mp4');
    expect(res1.valid).toBe(false);

    const res2 = validateSourceUrl('https://127.0.0.1/video.mp4');
    expect(res2.valid).toBe(false);
  });
});
