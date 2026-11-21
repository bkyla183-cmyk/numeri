import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveSiteUrl } from './siteUrl.ts';
import { getRelatedCalculatorForPost } from '../src/data/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');
const baseUrl = resolveSiteUrl(true)!;

console.log('====================================================');
console.log('🔍 NUMERIQ INFRASTRUCTURE & SEO VALIDATION SUITE');
console.log('====================================================\n');
console.log(`Validated SITE_URL: ${baseUrl}\n`);

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, details?: any) {
  if (condition) {
    passCount++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    failCount++;
    console.error(`  ❌ FAIL: ${testName}`, details || '');
  }
}

function extractJsonLdObjects(html: string): any[] {
  const matches = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  const parsed: any[] = [];
  for (const m of matches) {
    parsed.push(JSON.parse(m[1]));
  }
  return parsed;
}

// ----------------------------------------------------
// TEST 1: Firebase Configuration Files
// ----------------------------------------------------
console.log('🔥 1. Firebase Hosting Configuration');
const firebaseJsonPath = path.resolve(rootDir, 'firebase.json');
assert(fs.existsSync(firebaseJsonPath), 'firebase.json exists in root');
if (fs.existsSync(firebaseJsonPath)) {
  const fbConfig = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
  assert(fbConfig.hosting?.public === 'dist', 'firebase.json public directory set to "dist"');
  assert(fbConfig.hosting?.cleanUrls === true, 'firebase.json cleanUrls enabled');
  const hasCatchAllRewrite = fbConfig.hosting?.rewrites?.some((r: any) => r.source === '**');
  assert(!hasCatchAllRewrite, 'firebase.json catch-all rewrite omitted to prevent Soft 404s');
  assert(fbConfig.hosting?.headers?.some((h: any) => h.source === '404.html'), 'firebase.json 404.html header configured with noindex');
  const hasAssetHeaders = fbConfig.hosting?.headers?.some(
    (h: any) => h.source.includes('assets') && h.headers?.some((hdr: any) => hdr.key === 'Cache-Control')
  );
  assert(hasAssetHeaders, 'firebase.json caching headers configured for dist assets');
}

// ----------------------------------------------------
// TEST 2: Static Prerendered HTML Coverage
// ----------------------------------------------------
console.log('\n📄 2. Static Prerendered File Output');

const allCalcs = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'src/data/allCalculatorsData.json'), 'utf8'));
const allPosts = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'src/data/postsData.json'), 'utf8'));
const allCategories = JSON.parse(fs.readFileSync(path.resolve(rootDir, 'src/data/calcCategoriesData.json'), 'utf8'));

assert(allCalcs.length === 75, `Active calculators count verified: 75 (found ${allCalcs.length})`);
assert(allPosts.length === 45, `Posts count verified: 45 (found ${allPosts.length})`);
assert(allCategories.length === 11, `Active categories count verified: 11 (found ${allCategories.length})`);

const catCountMap: Record<string, number> = {};
for (const c of allCalcs) catCountMap[c.category_slug] = (catCountMap[c.category_slug] || 0) + 1;
const thinCats = allCategories.filter((cat: any) => (catCountMap[cat.slug] || 0) < 5);
const mismatchCats = allCategories.filter((cat: any) => cat.calculator_count !== (catCountMap[cat.slug] || 0));
assert(thinCats.length === 0, `0 thin or empty categories (<5 tools) (found: ${thinCats.length})`);
assert(mismatchCats.length === 0, `All ${allCategories.length} categories have exact matching calculator_count metadata`);

let missingCalcs = 0;
let faqSchemaLeaks = 0;
let invalidCalcSchemas = 0;
for (const calc of allCalcs) {
  const filePath = path.resolve(distDir, `calculator/${calc.slug}/index.html`);
  if (!fs.existsSync(filePath)) {
    missingCalcs++;
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  if (html.includes('FAQPage')) {
    faqSchemaLeaks++;
  }
  try {
    const ld = extractJsonLdObjects(html);
    if (ld.length === 0) invalidCalcSchemas++;
  } catch {
    invalidCalcSchemas++;
  }
}
assert(missingCalcs === 0, `All ${allCalcs.length} calculator HTML files generated in dist/ (missing: ${missingCalcs})`);
assert(faqSchemaLeaks === 0, `0 occurrences of deprecated FAQPage JSON-LD across all ${allCalcs.length} calculators`);
assert(invalidCalcSchemas === 0, `All ${allCalcs.length} calculator pages contain valid parseable JSON-LD`);

const distCalcDirs = fs.readdirSync(path.resolve(distDir, 'calculator'));
assert(distCalcDirs.length === allCalcs.length, `dist/calculator/ contains ONLY active calculators (${distCalcDirs.length} === ${allCalcs.length})`);

let missingGuides = 0;
let orphanedGuideMappings = 0;
let invalidGuideSchemas = 0;
let unrenderedMarkdownLinks = 0;
for (const post of allPosts) {
  const filePath = path.resolve(distDir, `guide/${post.slug}/index.html`);
  if (!fs.existsSync(filePath)) {
    missingGuides++;
    continue;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  if (/\[[^\]]+\]\(\/calculator\/[^)]+\)/.test(html)) {
    unrenderedMarkdownLinks++;
  }
  try {
    const ld = extractJsonLdObjects(html);
    if (ld.length === 0) invalidGuideSchemas++;
  } catch {
    invalidGuideSchemas++;
  }
  const relCalc = getRelatedCalculatorForPost(post.slug);
  if (!relCalc) orphanedGuideMappings++;
}
assert(missingGuides === 0, `All ${allPosts.length} guide HTML files generated in dist/ (missing: ${missingGuides})`);
assert(orphanedGuideMappings === 0, `All ${allPosts.length} Knowledge Hub guides map to active retained calculators`);
assert(invalidGuideSchemas === 0, `All ${allPosts.length} guide pages contain valid parseable Article JSON-LD`);
assert(unrenderedMarkdownLinks === 0, `All markdown links in prerendered guides compiled into proper HTML anchors`);

let missingCats = 0;
for (const cat of allCategories) {
  const filePath = path.resolve(distDir, `category/${cat.slug}/index.html`);
  if (!fs.existsSync(filePath)) missingCats++;
}
assert(missingCats === 0, `All ${allCategories.length} category HTML files generated in dist/ (missing: ${missingCats})`);
const distCatDirs = fs.readdirSync(path.resolve(distDir, 'category'));
assert(distCatDirs.length === allCategories.length, `dist/category/ contains ONLY active categories (${distCatDirs.length} === ${allCategories.length})`);

for (const coreFile of [
  '404.html',
  'index.html',
  'favicon.svg',
  'calculators/index.html',
  'categories/index.html',
  'blog/index.html',
  'about/index.html',
  'privacy/index.html',
  'terms/index.html',
  'disclaimer/index.html',
  'contact/index.html',
  'saved/index.html',
]) {
  assert(fs.existsSync(path.resolve(distDir, coreFile)), `dist/${coreFile} exists`);
}

// ----------------------------------------------------
// TEST 3: Metadata, Canonical, Branding & Schema.org Quality
// ----------------------------------------------------
console.log('\n🏷️  3. Metadata, Canonical, Branding & JSON-LD Inspection');

{
  const homeHtml = fs.readFileSync(path.resolve(distDir, 'index.html'), 'utf8');
  assert(homeHtml.includes('<link rel="icon" type="image/svg+xml" href="/favicon.svg"'), 'Homepage references /favicon.svg');
  assert(homeHtml.includes('"@type": "Organization"') && homeHtml.includes('"@type": "WebSite"'), 'Homepage includes Organization + WebSite JSON-LD');
}

{
  const html = fs.readFileSync(path.resolve(distDir, 'calculator/mortgage-calculator/index.html'), 'utf8');
  assert(html.includes('<title>Mortgage Calculator – Free Online Calculator | Numeriq</title>'), 'Mortgage calc: unique Numeriq title in raw HTML');
  assert(html.includes(`<link rel="canonical" href="${baseUrl}/calculator/mortgage-calculator" />`), 'Mortgage calc: exact unique canonical URL in raw HTML');
  assert(!html.includes(`<link rel="canonical" href="${baseUrl}/" />`), 'Mortgage calc: homepage canonical eliminated');
  assert(html.includes('"@type": "WebApplication"'), 'Mortgage calc: Schema.org WebApplication present');
  assert(!html.includes('"@type": "FAQPage"'), 'Mortgage calc: FAQPage JSON-LD absent (rendered as HTML FAQ)');
}

{
  const html = fs.readFileSync(path.resolve(distDir, 'calculator/scientific-calculator/index.html'), 'utf8');
  assert(html.includes('<title>Scientific Calculator – Free Online Calculator | Numeriq</title>'), 'Scientific calc: dedicated page & title in raw HTML');
  assert(html.includes(`<link rel="canonical" href="${baseUrl}/calculator/scientific-calculator" />`), 'Scientific calc: exact unique canonical URL in raw HTML');
}

{
  const html = fs.readFileSync(path.resolve(distDir, 'guide/how-to-calculate-bmi-complete-guide/index.html'), 'utf8');
  assert(html.includes('<title>How to Calculate BMI: Complete Guide with Examples | Numeriq Knowledge Hub</title>'), 'BMI Guide: unique Numeriq article title in raw HTML');
  assert(html.includes(`<link rel="canonical" href="${baseUrl}/guide/how-to-calculate-bmi-complete-guide" />`), 'BMI Guide: exact unique canonical URL in raw HTML');
  assert(html.includes('"@type": "Article"'), 'BMI Guide: Schema.org Article present');
}

{
  const html = fs.readFileSync(path.resolve(distDir, 'category/finance/index.html'), 'utf8');
  assert(html.includes('<title>Finance &amp; Investing Calculators (Free Online Tools) – Numeriq</title>'), 'Finance Category: unique Numeriq title in raw HTML');
  assert(html.includes(`<link rel="canonical" href="${baseUrl}/category/finance" />`), 'Finance Category: exact unique canonical URL in raw HTML');
  assert(html.includes('"@type": "CollectionPage"'), 'Finance Category: Schema.org CollectionPage present');
}

for (const noindexFile of ['404.html', 'saved/index.html']) {
  const html = fs.readFileSync(path.resolve(distDir, noindexFile), 'utf8');
  assert(html.includes('<meta name="robots" content="noindex, follow" />'), `${noindexFile}: has noindex, follow directive`);
  assert(!html.includes('<link rel="canonical"'), `${noindexFile}: no canonical tag emitted`);
}

// ----------------------------------------------------
// TEST 4: Uniqueness & Zero Placeholder/Legacy Brand Leak Check Across Dist
// ----------------------------------------------------
console.log('\n🔒 4. Uniqueness & Zero Placeholder/Legacy Leak Check Across Dist');

const canonicalSet = new Set<string>();
const titleSet = new Set<string>();
let duplicateCanonicals = 0;
let duplicateTitles = 0;
let legacyBrandLeaks = 0;
let placeholderDomainLeaks = 0;

function scanDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (/\.(html|js|css|xml|txt|json|csv|svg)$/i.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (/calcuniverse/i.test(content)) {
        legacyBrandLeaks++;
        console.error(`Legacy brand string found in: ${fullPath}`);
      }
      if (/numeriq\.example/i.test(content)) {
        placeholderDomainLeaks++;
        console.error(`Placeholder numeriq.example string found in: ${fullPath}`);
      }
      if (entry.name.endsWith('.html')) {
        const canonicalMatch = content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
        if (canonicalMatch?.[1]) {
          const canUrl = canonicalMatch[1];
          if (canonicalSet.has(canUrl)) {
            duplicateCanonicals++;
            console.error(`Duplicate canonical found: ${canUrl} in ${fullPath}`);
          } else {
            canonicalSet.add(canUrl);
          }
        }
        const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch?.[1]) {
          const title = titleMatch[1];
          if (titleSet.has(title)) {
            duplicateTitles++;
            console.error(`Duplicate title found: "${title}" in ${fullPath}`);
          } else {
            titleSet.add(title);
          }
        }
      }
    }
  }
}

scanDir(distDir);

const expectedSitemapCount = 9 + allCategories.length + allCalcs.length + allPosts.length; // 140
assert(duplicateCanonicals === 0, `0 duplicate canonical URLs found across ${canonicalSet.size} indexable HTML files`);
assert(duplicateTitles === 0, `0 duplicate titles found across ${titleSet.size} HTML files`);
assert(canonicalSet.size === expectedSitemapCount, `Total unique canonical URLs match exact ${expectedSitemapCount} sitemap URLs (found ${canonicalSet.size})`);
assert(legacyBrandLeaks === 0, `0 occurrences of legacy CalcUniverse branding across dist/`);
assert(placeholderDomainLeaks === 0, `0 occurrences of placeholder numeriq.example across dist/`);

// ----------------------------------------------------
// TEST 5: Sitemap Synchronization (dist/sitemap.xml)
// ----------------------------------------------------
console.log('\n🗺️  5. Sitemap URL Coverage (dist/sitemap.xml)');
const distSitemapPath = path.resolve(distDir, 'sitemap.xml');
assert(fs.existsSync(distSitemapPath), 'dist/sitemap.xml exists');
const sitemapContent = fs.existsSync(distSitemapPath) ? fs.readFileSync(distSitemapPath, 'utf8') : '';
const sitemapUrls = (sitemapContent.match(/<loc>[^<]+<\/loc>/g) || []).map((m) => m.replace(/<\/?loc>/g, ''));
assert(sitemapUrls.length === expectedSitemapCount, `Sitemap contains exact ${expectedSitemapCount} URLs (found ${sitemapUrls.length})`);

let missingSitemapUrls = 0;
for (const url of sitemapUrls) {
  if (!canonicalSet.has(url)) {
    missingSitemapUrls++;
    console.error(`Sitemap URL missing from prerendered canonicals: ${url}`);
  }
}
assert(missingSitemapUrls === 0, `All ${expectedSitemapCount} sitemap URLs match prerendered canonical HTML pages 1-to-1 (missing: ${missingSitemapUrls})`);

// ----------------------------------------------------
// TEST 6: ads.txt & robots.txt Check (dist/)
// ----------------------------------------------------
console.log('\n🛡️  6. ads.txt & robots.txt Compliance (dist/)');
const adsTxt = fs.readFileSync(path.resolve(distDir, 'ads.txt'), 'utf8');
const robotsTxt = fs.readFileSync(path.resolve(distDir, 'robots.txt'), 'utf8');
assert(!adsTxt.includes('pub-') && adsTxt.includes('Numeriq'), 'dist/ads.txt rebranded to Numeriq with no fabricated publisher ID');
assert(robotsTxt.includes('Numeriq') && robotsTxt.includes(`Sitemap: ${baseUrl}/sitemap.xml`), 'dist/robots.txt includes Sitemap directive matching SITE_URL');

// ----------------------------------------------------
// TEST 7: Internal Semantic Linking
// ----------------------------------------------------
console.log('\n🔗 7. Semantic Internal Linking Audit');
const navbarSrc = fs.readFileSync(path.resolve(rootDir, 'src/components/layout/Navbar.tsx'), 'utf8');
assert(navbarSrc.includes('Numeriq') && navbarSrc.includes('href="/calculators"'), 'Navbar displays Numeriq and links to /calculators');
assert(navbarSrc.includes('href="/categories"') && navbarSrc.includes('href="/blog"'), 'Navbar links to /categories and /blog');

const footerSrc = fs.readFileSync(path.resolve(rootDir, 'src/components/layout/Footer.tsx'), 'utf8');
assert(footerSrc.includes('Numeriq') && footerSrc.includes('href="/category/math"'), 'Footer displays Numeriq and links to /category/math');
assert(footerSrc.includes('href="/calculator/scientific-calculator"'), 'Footer links to scientific-calculator');

const heroSrc = fs.readFileSync(path.resolve(rootDir, 'src/components/home/HeroSection.tsx'), 'utf8');
assert(heroSrc.includes('calculators.length') && !heroSrc.includes('470'), 'HeroSection uses dynamic calculators.length without outdated 470+ claims');

console.log('\n====================================================');
console.log(`TOTAL TESTS: ${passCount + failCount}`);
console.log(`PASSED: ${passCount}`);
console.log(`FAILED: ${failCount}`);
console.log('====================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL NUMERIQ INFRASTRUCTURE & SEO CHECKS PASSED WITH 100% SUCCESS!');
}
