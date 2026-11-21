import 'dotenv/config';

const PLACEHOLDER_HOSTS = new Set([
  'numeriq.example',
  'example.com',
  'www.example.com',
  'example.org',
  'example.net',
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  'your-domain.com',
  'yourdomain.com',
  'my-app.com',
]);

export function validateProductionSiteUrl(raw: string): string {
  const trimmed = (raw || '').trim().replace(/\/+$/, '');
  if (!trimmed) {
    throw new Error(
      'SITE_URL is required for production SEO builds (e.g., SITE_URL=https://numeriq-prod-domain.com).'
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(`Invalid SITE_URL "${trimmed}". Expected an absolute https:// origin.`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(
      `SITE_URL must use https:// in production (received "${parsed.protocol}//${parsed.host}").`
    );
  }

  const host = parsed.hostname.toLowerCase();
  if (
    PLACEHOLDER_HOSTS.has(host) ||
    host.endsWith('.example') ||
    host.endsWith('.invalid') ||
    host.endsWith('.test') ||
    host.endsWith('.local') ||
    host.includes('calcuniverse') ||
    host.includes('ais-dev-') ||
    trimmed.includes('MY_APP_URL')
  ) {
    throw new Error(
      `SITE_URL "${trimmed}" is a placeholder, local, or preview hostname and is rejected for production builds.`
    );
  }

  if (parsed.pathname !== '/' && parsed.pathname !== '') {
    throw new Error(
      `SITE_URL must be a root origin without a subpath (received "${trimmed}").`
    );
  }

  return `${parsed.protocol}//${parsed.host}`;
}

export function resolveSiteUrl(strict: boolean): string | null {
  const raw = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').trim();
  if (!raw) {
    if (strict) {
      throw new Error(
        'SITE_URL is unset. Production build/sitemap generation rejects unset domains. ' +
          'Set SITE_URL=https://<your-domain> before running production build, prerender, or sitemap generation.'
      );
    }
    return null;
  }

  return validateProductionSiteUrl(raw);
}
