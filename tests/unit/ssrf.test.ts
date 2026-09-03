import { describe, it, expect } from 'vitest';
import { isPrivateIPv4, isPrivateIPv6, validateSSRF } from '../../lib/security/ssrf';

describe('SSRF Protection Security', () => {
  it('should detect private IPv4 ranges correctly', () => {
    expect(isPrivateIPv4('127.0.0.1')).toBe(true);
    expect(isPrivateIPv4('10.0.0.5')).toBe(true);
    expect(isPrivateIPv4('172.16.0.1')).toBe(true);
    expect(isPrivateIPv4('192.168.1.100')).toBe(true);
    expect(isPrivateIPv4('169.254.169.254')).toBe(true);
    expect(isPrivateIPv4('8.8.8.8')).toBe(false);
    expect(isPrivateIPv4('1.1.1.1')).toBe(false);
  });

  it('should detect loopback IPv6 addresses', () => {
    expect(isPrivateIPv6('::1')).toBe(true);
    expect(isPrivateIPv6('fe80::1')).toBe(true);
    expect(isPrivateIPv6('2001:4860:4860::8888')).toBe(false);
  });

  it('should reject localhost in validateSSRF', async () => {
    const res = await validateSSRF('http://localhost:3000/api');
    expect(res.safe).toBe(false);
    expect(res.reason).toContain('internal hostnames is prohibited');
  });

  it('should allow public domains in validateSSRF', async () => {
    const res = await validateSSRF('https://example.com/file.mp4');
    expect(res.safe).toBe(true);
  });
});
