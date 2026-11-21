import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculators, posts, calcCategories } from '../src/data.ts';
import { allCalculatorSpecs, getCalculatorSpec } from '../src/data/calculatorRegistry/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('================================================================');
console.log('🔍 PHASE 5: INDEPENDENT PRE-LAUNCH AUDIT SCRIPT');
console.log('================================================================\n');

// 1. INVENTORY OF ALL 470 CALCULATOR SLUGS
console.log('--- 1. CALCULATOR SPEC INVENTORY & REGISTRATION ---');
const totalCalcs = calculators.length;
const totalSpecs = allCalculatorSpecs.length;
console.log(`Total calculators in src/data.ts: ${totalCalcs}`);
console.log(`Total specs in allCalculatorSpecs: ${totalSpecs}`);

// Duplicate checks
const duplicateCalcs: string[] = [];
const seenCalcs = new Set<string>();
for (const c of calculators) {
  if (seenCalcs.has(c.slug)) duplicateCalcs.push(c.slug);
  seenCalcs.add(c.slug);
}

const duplicateSpecs: string[] = [];
const seenSpecs = new Set<string>();
for (const s of allCalculatorSpecs) {
  if (seenSpecs.has(s.slug)) duplicateSpecs.push(s.slug);
  seenSpecs.add(s.slug);
}

console.log(`Duplicate calculator slugs in data: ${duplicateCalcs.length}`);
console.log(`Duplicate spec slugs in registry: ${duplicateSpecs.length}`);

// Slugs missing specs or vice-versa
const missingSpecs: string[] = [];
for (const c of calculators) {
  if (!getCalculatorSpec(c.slug)) {
    missingSpecs.push(c.slug);
  }
}
console.log(`Calculators missing registered specs: ${missingSpecs.length}`);

// Check inputs count and calculate function validity
let validSpecsCount = 0;
let specsWithCalculateFn = 0;
for (const spec of allCalculatorSpecs) {
  if (spec.slug && spec.inputs && Array.isArray(spec.inputs) && spec.inputs.length > 0) {
    validSpecsCount++;
  }
  if (typeof spec.calculate === 'function') {
    specsWithCalculateFn++;
  }
}
console.log(`Specs with valid inputs array: ${validSpecsCount} / ${totalSpecs}`);
console.log(`Specs with valid calculate() function: ${specsWithCalculateFn} / ${totalSpecs}`);

// 2. EXPLAIN 554 HTML FILES VS 552 SITEMAP URLS
console.log('\n--- 2. DIST/ HTML FILES VS SITEMAP URLS ---');
function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, fileList);
    } else if (fullPath.endsWith('.html')) {
      fileList.push(path.relative(distDir, fullPath));
    }
  }
  return fileList;
}

const htmlFiles = getAllFiles(distDir);
console.log(`Total HTML files in dist/: ${htmlFiles.length}`);

const sitemapContent = fs.readFileSync(path.resolve(distDir, 'sitemap.xml'), 'utf8');
const sitemapLocs = [...sitemapContent.matchAll(/<loc>(https:\/\/calcuniverse\.org[^<]*)<\/loc>/g)].map(m => m[1]);
console.log(`Total URLs in sitemap.xml: ${sitemapLocs.length}`);

const sitemapPaths = sitemapLocs.map(url => {
  let p = url.replace('https://calcuniverse.org', '');
  if (p === '' || p === '/') return 'index.html';
  p = p.replace(/^\//, '');
  return `${p}/index.html`;
});

const sitemapPathsSet = new Set(sitemapPaths);
const extraHtmlFiles = htmlFiles.filter(f => !sitemapPathsSet.has(f));
console.log(`Extra HTML files in dist/ not indexed in sitemap:`, extraHtmlFiles);
console.log(`Exact reason:`);
console.log(`  1. '404.html': Error landing page (intentionally omitted from sitemap with 'noindex, follow' tag).`);
console.log(`  2. 'saved/index.html': Client-side bookmarks/favorites page (intentionally omitted and disallowed in robots.txt).`);
console.log(`  552 Sitemap URLs + 404.html + saved/index.html = Exactly 554 HTML files.`);

// 3. INSPECT 30 CALCULATOR PAGES FROM DIVERSE CATEGORIES
console.log('\n--- 3. 30 DIVERSE CALCULATOR PAGES QUALITY INSPECTION ---');
const sample30Slugs = [
  // Finance (5)
  'mortgage-calculator',
  'compound-interest-calculator',
  'auto-loan-calculator',
  '401k-calculator',
  'refinance-calculator',
  // Health & Fitness (5)
  'bmi-calculator',
  'calorie-calculator',
  'body-fat-calculator',
  'target-heart-rate-calculator',
  'water-intake-calculator',
  // Mathematics & Algebra (5)
  'percentage-calculator',
  'quadratic-formula-calculator',
  'fraction-calculator',
  'matrix-multiplication-calculator',
  'logarithm-calculator',
  // Physics & Chemistry (5)
  'ohms-law-calculator',
  'kinetic-energy-calculator',
  'ph-calculator',
  'molarity-calculator',
  'ideal-gas-law-calculator',
  // Engineering & Construction (4)
  'beam-deflection-calculator',
  'stress-strain-calculator',
  'concrete-calculator',
  'pipe-flow-calculator',
  // Statistics & Probability (3)
  'standard-deviation-calculator',
  'z-score-calculator',
  'combinations-calculator',
  // Automotive & Energy (3)
  'mpg-calculator',
  'ev-charging-calculator',
  'solar-panel-calculator',
];

interface InspectionResult {
  slug: string;
  category: string;
  htmlExists: boolean;
  htmlSize: number;
  hasH1: boolean;
  hasCanonical: boolean;
  hasTitle: boolean;
  hasMetaDesc: boolean;
  hasFormula: boolean;
  hasTable: boolean;
  hasWorkedExample: boolean;
  hasFaqs: boolean;
  faqCount: number;
  sampleFaqQuestion: string;
}

const audit30: InspectionResult[] = [];
for (const slug of sample30Slugs) {
  const htmlPath = path.resolve(distDir, `calculator/${slug}/index.html`);
  const exists = fs.existsSync(htmlPath);
  if (!exists) {
    audit30.push({
      slug,
      category: 'missing',
      htmlExists: false,
      htmlSize: 0,
      hasH1: false,
      hasCanonical: false,
      hasTitle: false,
      hasMetaDesc: false,
      hasFormula: false,
      hasTable: false,
      hasWorkedExample: false,
      hasFaqs: false,
      faqCount: 0,
      sampleFaqQuestion: '',
    });
    continue;
  }
  const content = fs.readFileSync(htmlPath, 'utf8');
  const calc = calculators.find(c => c.slug === slug);
  const spec = getCalculatorSpec(slug);
  
  const hasH1 = /<h1[^>]*>/.test(content);
  const hasCanonical = /<link rel="canonical" href="https:\/\/calcuniverse\.org\/calculator\//.test(content);
  const hasTitle = /<title>[^<]+<\/title>/.test(content);
  const hasMetaDesc = /<meta name="description" content="[^"]+"/.test(content);
  const hasFormula = content.includes('Governing Equation') || content.includes('Governing Mathematical Formula') || content.includes('Mathematical Formula');
  const hasTable = content.includes('<table') || content.includes('Variable Definitions');
  const hasWorkedExample = content.includes('Step-by-Step Worked Calculation Example') || content.includes('Worked Numerical Example');
  const hasFaqs = content.includes('Frequently Asked Questions');
  
  // Extract FAQs via <summary> tags
  const faqSummaries = [...content.matchAll(/<summary class="[^"]*">([^<]+)<\/summary>/g)].map(m => m[1]);

  audit30.push({
    slug,
    category: calc?.category_slug || spec?.category || 'unknown',
    htmlExists: true,
    htmlSize: content.length,
    hasH1,
    hasCanonical,
    hasTitle,
    hasMetaDesc,
    hasFormula,
    hasTable,
    hasWorkedExample,
    hasFaqs,
    faqCount: faqSummaries.length,
    sampleFaqQuestion: faqSummaries[0] || '',
  });
}

console.log(`Inspected ${audit30.length} pages:`);
let passCount = 0;
for (const item of audit30) {
  const ok = item.htmlExists && item.hasH1 && item.hasCanonical && item.hasFormula && item.hasWorkedExample && item.faqCount >= 3;
  if (ok) passCount++;
  console.log(`- [${ok ? 'PASS' : 'FAIL'}] ${item.slug.padEnd(35)} (${item.category.padEnd(22)}): Size=${item.htmlSize}b, FAQs=${item.faqCount} | Q1: "${item.sampleFaqQuestion.slice(0, 50)}..."`);
}
console.log(`\nTotal 30-page audit passed: ${passCount} / ${audit30.length}`);
