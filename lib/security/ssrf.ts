import dns from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(dns.lookup);

/**
 * Checks if an IPv4 address falls within private, loopback, or link-local ranges.
 */
export function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [a, b] = parts;

  // 0.0.0.0/8
  if (a === 0) return true;
  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 10.0.0.0/8 (Private)
  if (a === 10) return true;
  // 172.16.0.0/12 (Private)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;
  // 169.254.0.0/16 (Link-local)
  if (a === 169 && b === 254) return true;

  return false;
}

/**
 * Checks if an IPv6 address is loopback or link-local/private.
 */
export function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe80:') || normalized.startsWith('fc00:') || normalized.startsWith('fd00:')) {
    return true;
  }
  return false;
}

/**
 * Validates a hostname and performs DNS resolution to prevent SSRF against internal services.
 */
export async function validateSSRF(urlStr: string): Promise<{ safe: boolean; reason?: string; resolvedIp?: string }> {
  try {
    const parsed = new URL(urlStr);

    // Protocol check
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, reason: 'Only HTTP and HTTPS protocols are allowed.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Direct hostname check
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return { safe: false, reason: 'Access to localhost and internal hostnames is prohibited.' };
    }

    // If hostname is raw IP
    if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
      return { safe: false, reason: 'Access to private or local IP addresses is prohibited.' };
    }

    // Perform DNS Lookup if running on Server Node.js environment
    try {
      const resolved = await lookupAsync(hostname);
      const resolvedIp = resolved.address;

      if (isPrivateIPv4(resolvedIp) || isPrivateIPv6(resolvedIp)) {
        return {
          safe: false,
          reason: `Resolved IP (${resolvedIp}) is in a private or restricted network range.`,
          resolvedIp,
        };
      }

      return { safe: true, resolvedIp };
    } catch {
      // DNS lookup failed
      return { safe: false, reason: 'Could not resolve domain name via DNS.' };
    }
  } catch (err: any) {
    return { safe: false, reason: err.message || 'Invalid URL format.' };
  }
}
