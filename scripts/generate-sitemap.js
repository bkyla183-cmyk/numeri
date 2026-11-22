import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const DEFAULT_PRODUCTION_URL = 'https://numeriq.github.io';
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

function resolveSitemapBaseUrl() {
  const isStrict = process.env.PRODUCTION_BUILD === '1';
  const raw = (process.env.SITE_URL || process.env.VITE_SITE_URL || '').trim().replace(/\/+$/, '');

  if (!raw) {
    if (isStrict) {
      throw new Error(
        'SITE_URL is unset during PRODUCTION_BUILD=1. Set SITE_URL=https://numeriq.github.io (or your custom domain) before running build:production.'
      );
    }
    return DEFAULT_PRODUCTION_URL;
  }

  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(`Invalid SITE_URL "${raw}". Expected an absolute https:// origin.`);
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`SITE_URL must use https:// (received "${parsed.protocol}//${parsed.host}").`);
  }

  const host = parsed.hostname.toLowerCase();
  if (
    PLACEHOLDER_HOSTS.has(host) ||
    host.endsWith('.example') ||
    host.endsWith('.invalid') ||
    host.endsWith('.test') ||
    host.endsWith('.local') ||
    host.includes('calcuniverse') ||
    host.includes('ais-dev-')
  ) {
    throw new Error(`SITE_URL "${raw}" is not allowed for sitemap generation.`);
  }

  return `${parsed.protocol}//${parsed.host}`;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function loadDataExports() {
  try {
    const dataModule = await import('../src/data.ts');
    return {
      calculators: dataModule.calculators,
      posts: dataModule.posts,
      calcCategories: dataModule.calcCategories,
    };
  } catch {
    // Fallback for plain Node execution without a TypeScript loader
    const calcCategories = JSON.parse(
      fs.readFileSync(path.resolve(rootDir, 'src/data/calcCategoriesData.json'), 'utf8')
    );
    const calculators = JSON.parse(
      fs.readFileSync(path.resolve(rootDir, 'src/data/allCalculatorsData.json'), 'utf8')
    );
    const posts = JSON.parse(
      fs.readFileSync(path.resolve(rootDir, 'src/data/postsData.json'), 'utf8')
    );
    return { calculators, posts, calcCategories };
  }
}

async function main() {
  const baseUrl = resolveSitemapBaseUrl();
  const { calculators, posts, calcCategories } = await loadDataExports();
  const currentDate = new Date().toISOString().split('T')[0];

  console.log('====================================================');
  console.log('🗺️  NUMERIQ SITEMAP XML GENERATOR (generate-sitemap.js)');
  console.log('====================================================\n');
  console.log(`Base URL: ${baseUrl}`);
  console.log(`Timestamp: ${currentDate}`);
  console.log(`Scanned ${calculators.length} Calculators, ${posts.length} Guides, ${calcCategories.length} Categories`);

  const emittedUrls = new Set();

  const formatUrlEntry = (routePath, lastmod, changefreq, priority) => {
    const normalizedPath = routePath === '/' ? '/' : `/${routePath.replace(/^\/+/, '')}`;
    const absoluteUrl = `${baseUrl}${normalizedPath}`;

    if (!absoluteUrl.startsWith('https://') || /\s/.test(absoluteUrl)) {
      throw new Error(`Invalid sitemap URL detected: "${absoluteUrl}"`);
    }
    if (normalizedPath === '/saved' || normalizedPath === '/404') {
      throw new Error(`Noindex route must not be included in sitemap: "${absoluteUrl}"`);
    }
    if (emittedUrls.has(absoluteUrl)) {
      throw new Error(`Duplicate sitemap URL detected: "${absoluteUrl}"`);
    }

    emittedUrls.add(absoluteUrl);
    return (
      `  <url>\n` +
      `    <loc>${escapeXml(absoluteUrl)}</loc>\n` +
      `    <lastmod>${escapeXml(lastmod)}</lastmod>\n` +
      `    <changefreq>${escapeXml(changefreq)}</changefreq>\n` +
      `    <priority>${escapeXml(priority)}</priority>\n` +
      `  </url>\n`
    );
  };

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Core & Legal Indexable Static Pages (excludes noindex routes /saved and /404)
  const coreRoutes = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/calculators', changefreq: 'daily', priority: '0.9' },
    { path: '/categories', changefreq: 'weekly', priority: '0.9' },
    { path: '/blog', changefreq: 'daily', priority: '0.9' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/privacy', changefreq: 'monthly', priority: '0.5' },
    { path: '/terms', changefreq: 'monthly', priority: '0.5' },
    { path: '/disclaimer', changefreq: 'monthly', priority: '0.5' },
    { path: '/contact', changefreq: 'monthly', priority: '0.6' },
  ];

  for (const route of coreRoutes) {
    xml += formatUrlEntry(route.path, currentDate, route.changefreq, route.priority);
  }

  // 2. Category Directories
  for (const cat of calcCategories) {
    const catDate = String(cat.updated_at || currentDate).split('T')[0];
    xml += formatUrlEntry(`/category/${cat.slug}`, catDate, 'weekly', '0.85');
  }

  // 3. Dedicated Calculator Pages
  for (const calc of calculators) {
    const calcDate = String(calc.updated_at || currentDate).split('T')[0];
    const priority = calc.is_popular ? '0.9' : '0.8';
    xml += formatUrlEntry(`/calculator/${calc.slug}`, calcDate, 'weekly', priority);
  }

  // 4. Knowledge Hub Editorial Guides
  const publishedPosts = posts.filter((post) => post.published !== false && post.published !== 'false');
  for (const post of publishedPosts) {
    const rawDate = post.updated_at || post.published_at || post.created_at || currentDate;
    const postDate = String(rawDate).split('T')[0];
    xml += formatUrlEntry(`/guide/${post.slug}`, postDate, 'weekly', '0.8');
  }

  xml += '</urlset>\n';

  const expectedCount = coreRoutes.length + calcCategories.length + calculators.length + publishedPosts.length;
  if (emittedUrls.size !== expectedCount) {
    throw new Error(`Expected ${expectedCount} sitemap URLs, generated ${emittedUrls.size}.`);
  }

  const publicSitemapPath = path.resolve(rootDir, 'public/sitemap.xml');
  fs.mkdirSync(path.dirname(publicSitemapPath), { recursive: true });
  fs.writeFileSync(publicSitemapPath, xml, 'utf8');
  console.log(`\n✅ Generated ${publicSitemapPath} (${emittedUrls.size} URLs)`);

  const distDir = path.resolve(rootDir, 'dist');
  if (process.argv.includes('--sync-dist') || fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
    fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), xml, 'utf8');
    fs.writeFileSync(path.resolve(distDir, 'sitemap-main.xml'), xml, 'utf8');
    console.log(`✅ Synced dist/sitemap.xml and dist/sitemap-main.xml (${emittedUrls.size} URLs)`);
  }

  console.log('====================================================\n');
}

main().catch((err) => {
  console.error('❌ Sitemap generation failed:', err);
  process.exit(1);
});
