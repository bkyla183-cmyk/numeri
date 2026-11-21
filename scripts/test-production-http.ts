import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveSiteUrl } from './siteUrl.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const fbConfig = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'firebase.json'), 'utf8'));
const redirects: Array<{ source: string; destination: string; type: number }> = fbConfig.hosting?.redirects || [];
const expectedOrigin = resolveSiteUrl(true)!;

console.log('================================================================');
console.log('🌐 NUMERIQ PRODUCTION HTTP RESPONSE VERIFICATION SUITE');
console.log('================================================================\n');

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0].split('#')[0];

  const exactRedirect = redirects.find((r) => r.source === urlPath);
  if (exactRedirect) {
    res.statusCode = exactRedirect.type || 301;
    res.setHeader('Location', exactRedirect.destination);
    res.end();
    return;
  }
  if (urlPath.startsWith('/post/')) {
    res.statusCode = 301;
    res.setHeader('Location', urlPath.replace('/post/', '/guide/'));
    res.end();
    return;
  }

  let filePath = '';
  if (urlPath === '/' || urlPath === '') {
    filePath = path.join(distDir, 'index.html');
  } else {
    const tryDir = path.join(distDir, urlPath, 'index.html');
    const tryFile = path.join(distDir, `${urlPath}.html`);
    const tryDirect = path.join(distDir, urlPath);

    if (fs.existsSync(tryDir)) {
      filePath = tryDir;
    } else if (fs.existsSync(tryFile)) {
      filePath = tryFile;
    } else if (fs.existsSync(tryDirect) && fs.statSync(tryDirect).isFile()) {
      filePath = tryDirect;
    } else {
      filePath = path.join(distDir, '404.html');
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Robots-Tag', 'noindex, follow');
      if (fs.existsSync(filePath)) {
        res.end(fs.readFileSync(filePath));
      } else {
        res.end('<h1>404 Not Found</h1>');
      }
      return;
    }
  }

  res.statusCode = 200;
  if (filePath.endsWith('.html')) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  } else if (filePath.endsWith('.xml')) {
    res.setHeader('Content-Type', 'application/xml');
  } else if (filePath.endsWith('.svg')) {
    res.setHeader('Content-Type', 'image/svg+xml');
  } else if (filePath.endsWith('.txt')) {
    res.setHeader('Content-Type', 'text/plain');
  }
  res.end(fs.readFileSync(filePath));
});

server.listen(4567, async () => {
  console.log('🚀 Simulation server running on http://127.0.0.1:4567\n');

  const testEndpoints = [
    { url: '/', expectedStatus: 200, label: 'Homepage (Numeriq)' },
    { url: '/calculators', expectedStatus: 200, label: 'Calculators Directory' },
    { url: '/categories', expectedStatus: 200, label: 'Categories Directory' },
    { url: '/category/finance', expectedStatus: 200, label: 'Finance Category' },
    { url: '/calculator/mortgage-calculator', expectedStatus: 200, label: 'Mortgage Calculator' },
    { url: '/calculator/scientific-calculator', expectedStatus: 200, label: 'Scientific Calculator' },
    { url: '/calculator/bmi-calculator', expectedStatus: 200, label: 'BMI Calculator' },
    { url: '/guide/how-to-calculate-bmi-complete-guide', expectedStatus: 200, label: 'BMI Editorial Guide' },
    { url: '/saved', expectedStatus: 200, label: 'Saved Workspace (noindex, no canonical)' },
    { url: '/favicon.svg', expectedStatus: 200, label: 'Brand Favicon SVG' },
    { url: '/sitemap.xml', expectedStatus: 200, label: 'XML Sitemap' },
    { url: '/robots.txt', expectedStatus: 200, label: 'Robots.txt' },
    { url: '/ads.txt', expectedStatus: 200, label: 'Ads.txt' },
    { url: '/calculator/emi-calculator', expectedStatus: 301, expectedLocation: '/calculator/loan-calculator', label: 'Consolidated 301 Redirect (EMI -> Loan)' },
    { url: '/calculator/bmr-calculator', expectedStatus: 301, expectedLocation: '/calculator/calorie-calculator', label: 'Consolidated 301 Redirect (BMR -> Calorie)' },
    { url: '/post/how-to-calculate-bmi-complete-guide', expectedStatus: 301, expectedLocation: '/guide/how-to-calculate-bmi-complete-guide', label: 'Legacy /post/ 301 Redirect' },
    { url: '/calculator/love-calculator', expectedStatus: 404, label: 'Removed Novelty Calc (Expect 404)' },
    { url: '/calculator/fourier-transform-calculator', expectedStatus: 404, label: 'Deferred Advanced Calc (Expect 404)' },
    { url: '/nonexistent-calculator-slug-404', expectedStatus: 404, label: 'Nonexistent Page (Expect 404)' },
    { url: '/calculator/invalid-slug-99999', expectedStatus: 404, label: 'Invalid Calculator Slug (Expect 404)' },
  ];

  let passed = 0;
  let failed = 0;

  console.log('| Target URL | Endpoint Type | Expected | Actual Status | Content-Type | Result |');
  console.log('|---|---|---|---|---|---|');

  for (const ep of testEndpoints) {
    try {
      const response = await fetch(`http://127.0.0.1:4567${ep.url}`, { redirect: 'manual' });
      const status = response.status;
      const contentType = response.headers.get('content-type') || '';
      const text = await response.text();

      const isStatusMatch = status === ep.expectedStatus;
      let hasValidBody = true;

      if (status === 200) {
        if (ep.url.endsWith('.xml')) {
          hasValidBody = text.includes('<urlset') && text.includes(expectedOrigin);
        } else if (ep.url.endsWith('.svg')) {
          hasValidBody = text.includes('<svg') && text.includes('</svg>');
        } else if (ep.url.endsWith('.txt')) {
          hasValidBody = text.length > 0 && text.includes('Numeriq');
        } else if (ep.url === '/saved') {
          hasValidBody =
            text.includes('<meta name="robots" content="noindex, follow" />') &&
            !text.includes('<link rel="canonical"') &&
            text.includes('Numeriq');
        } else {
          hasValidBody =
            text.includes('<title>') &&
            text.includes('Numeriq') &&
            text.includes('<div id="root">') &&
            !text.includes('FAQPage') &&
            text.length > 500;
        }
      } else if (status === 301) {
        hasValidBody = response.headers.get('location') === (ep as any).expectedLocation;
      } else if (status === 404) {
        hasValidBody = text.includes('404') && (text.includes('noindex') || Boolean(response.headers.get('x-robots-tag')?.includes('noindex')));
      }

      if (isStatusMatch && hasValidBody) {
        passed++;
        console.log(`| \`${ep.url}\` | ${ep.label} | ${ep.expectedStatus} | **${status}** | \`${contentType.split(';')[0] || 'redirect'}\` | ✅ PASS |`);
      } else {
        failed++;
        console.log(`| \`${ep.url}\` | ${ep.label} | ${ep.expectedStatus} | **${status}** | \`${contentType.split(';')[0]}\` | ❌ FAIL |`);
      }
    } catch (err: any) {
      failed++;
      console.log(`| \`${ep.url}\` | ${ep.label} | ${ep.expectedStatus} | ERR | N/A | ❌ EXCEPTION: ${err.message} |`);
    }
  }

  console.log(`\n📊 HTTP Results: ${passed} / ${testEndpoints.length} Passed, ${failed} Failed\n`);
  server.close();
  process.exit(failed > 0 ? 1 : 0);
});
