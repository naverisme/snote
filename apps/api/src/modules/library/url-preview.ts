import * as net from 'node:net';

export interface UrlPreview {
  url: string;
  domain: string;
  title?: string;
  coverImage?: string;
}

export function normalizeUrl(inputUrl: string): string {
  const trimmed = inputUrl.trim();
  if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function extractFirstUrl(text: string): string | null {
  // Match http(s)://... or standard domain-based URLs like example.com/foo
  const urlPattern = /(?:https?:\/\/|www\.)[^\s<>"{}|\\^`[\]]+|[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.[a-zA-Z]{2,}(?:\/[^\s<>"{}|\\^`[\]]*)?/i;
  const match = text.match(urlPattern);
  if (!match) return null;
  return normalizeUrl(match[0]);
}

export function isPrivateOrBlockedIp(ip: string): boolean {
  if (ip === '0.0.0.0' || ip === '::' || ip === '127.0.0.1' || ip === '::1') {
    return true;
  }

  // IPv4 checks
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link Local / Cloud Metadata 169.254.169.254)
    if (parts[0] === 169 && parts[1] === 254) return true;
  }

  // IPv6 checks
  if (net.isIPv6(ip)) {
    const lower = ip.toLowerCase();
    if (lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80')) {
      return true;
    }
  }

  return false;
}

export function isPrivateOrBlockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase().trim();
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal') ||
    host.endsWith('.lan') ||
    host.includes('metadata.google.internal') ||
    host.includes('169.254.169.254')
  ) {
    return true;
  }

  if (net.isIP(host)) {
    return isPrivateOrBlockedIp(host);
  }

  return false;
}

export async function fetchUrlPreview(
  rawUrl: string,
  timeoutMs: number = 2000,
): Promise<UrlPreview> {
  const normalized = normalizeUrl(rawUrl);
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(normalized);
  } catch {
    return { url: rawUrl, domain: rawUrl };
  }

  const domain = parsedUrl.hostname;

  // SSRF defense (QA-12, LIB-18): Never access blocked / private destinations
  if (isPrivateOrBlockedHost(domain)) {
    return { url: normalized, domain };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(normalized, {
      method: 'GET',
      headers: {
        'User-Agent': 'SNOTE-v2-Bot/1.0 (+https://snote.edu.vn)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    clearTimeout(timer);

    // Verify redirected URL is not private (QA-12)
    const finalUrl = new URL(response.url);
    if (isPrivateOrBlockedHost(finalUrl.hostname)) {
      return { url: normalized, domain };
    }

    if (!response.ok) {
      return { url: normalized, domain };
    }

    const html = await response.text();

    let title: string | undefined;
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1].trim();
    } else {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
    }

    let coverImage: string | undefined;
    const ogImageMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImageMatch && ogImageMatch[1]) {
      const rawImage = ogImageMatch[1].trim();
      try {
        const resolvedImage = new URL(rawImage, normalized).toString();
        const imgHost = new URL(resolvedImage).hostname;
        if (!isPrivateOrBlockedHost(imgHost)) {
          coverImage = resolvedImage;
        }
      } catch {
        // ignore malformed image url
      }
    }

    return {
      url: normalized,
      domain,
      title,
      coverImage,
    };
  } catch {
    // If fetching fails, fallback to domain and url (LIB-18, QA-12)
    return { url: normalized, domain };
  }
}
