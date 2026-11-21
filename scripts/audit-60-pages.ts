import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculators } from '../src/data.ts';
import { getCalculatorSpec } from '../src/data/calculatorRegistry/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('================================================================');
console.log('🔍 PHASE 6: 60-PAGE DEEP CONTENT ORIGINALITY & QUALITY AUDIT');
console.log('================================================================\n');

// 60 distinct calculator slugs covering all major categories
const slugs60 = [
  // 1. Finance & Investment (8)
  'mortgage-calculator',
  'compound-interest-calculator',
  'loan-calculator',
  'auto-loan-calculator',
  '401k-calculator',
  'refinance-calculator',
  'credit-card-payoff-calculator',
  'roi-calculator',

  // 2. Business, Tax & Salary (8)
  'sales-tax-calculator',
  'vat-calculator',
  'reverse-vat-calculator',
  'capital-gains-tax-calculator',
  'hourly-to-salary-calculator',
  'salary-to-hourly-calculator',
  'overtime-calculator',
  'profit-margin-calculator',

  // 3. Health, Fitness & Nutrition (8)
  'bmi-calculator',
  'calorie-calculator',
  'body-fat-calculator',
  'target-heart-rate-calculator',
  'water-intake-calculator',
  'ideal-weight-calculator',
  'waist-to-hip-ratio-calculator',
  'running-pace-calculator',

  // 4. Mathematics & Arithmetic (6)
  'percentage-calculator',
  'fraction-calculator',
  'gcd-calculator',
  'lcm-calculator',
  'logarithm-calculator',
  'scientific-notation-calculator',

  // 5. Geometry & Algebra (8)
  'triangle-area-calculator',
  'cylinder-calculator',
  'sphere-calculator',
  'trapezoid-calculator',
  'pythagorean-theorem-calculator',
  'quadratic-formula-calculator',
  'slope-calculator',
  'matrix-multiplication-calculator',

  // 6. Science - Physics, Chemistry & Biology (8)
  'ohms-law-calculator',
  'kinetic-energy-calculator',
  'force-calculator',
  'density-calculator',
  'ph-calculator',
  'molarity-calculator',
  'dilution-calculator',
  'ideal-gas-law-calculator',

  // 7. Statistics & Probability (6)
  'standard-deviation-calculator',
  'z-score-calculator',
  'combinations-calculator',
  'permutations-calculator',
  'binomial-distribution-calculator',
  'confidence-interval-calculator',

  // 8. Engineering, Construction, Automotive & Energy (8)
  'beam-deflection-calculator',
  'stress-strain-calculator',
  'pipe-flow-calculator',
  'concrete-calculator',
  'mpg-calculator',
  'fuel-cost-calculator',
  'solar-panel-calculator',
  'electricity-cost-calculator',
];

interface AuditRow {
  slug: string;
  category: string;
  fileSize: number;
  hasH1: boolean;
  hasCanonical: boolean;
  hasFormula: boolean;
  hasVarTable: boolean;
  hasWorkedExample: boolean;
  faqCount: number;
  sampleFaq: string;
  scenarioSnippet: string;
  status: 'PASS' | 'FAIL';
}

const auditRows: AuditRow[] = [];
const seenScenarios = new Set<string>();
const seenFaqs = new Set<string>();
let duplicateScenarios = 0;
let duplicateFaqs = 0;

for (const slug of slugs60) {
  const filePath = path.resolve(distDir, `calculator/${slug}/index.html`);
  if (!fs.existsSync(filePath)) {
    auditRows.push({
      slug,
      category: 'MISSING',
      fileSize: 0,
      hasH1: false,
      hasCanonical: false,
      hasFormula: false,
      hasVarTable: false,
      hasWorkedExample: false,
      faqCount: 0,
      sampleFaq: '',
      scenarioSnippet: '',
      status: 'FAIL',
    });
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const calc = calculators.find(c => c.slug === slug);
  const spec = getCalculatorSpec(slug);

  const hasH1 = /<h1[^>]*>/.test(html);
  const hasCanonical = /<link rel="canonical" href="https:\/\/calcuniverse\.org\/calculator\//.test(html);
  const hasFormula = html.includes('Governing Equation') || html.includes('Mathematical Formula');
  const hasVarTable = html.includes('Variable Definitions &amp; Units') || html.includes('<table');
  const hasWorkedExample = html.includes('Step-by-Step Worked Calculation Example');
  
  // FAQs
  const faqSummaries = [...html.matchAll(/<summary class="[^"]*">([^<]+)<\/summary>/g)].map(m => m[1]);
  const sampleFaq = faqSummaries[0] || '';

  // Extract scenario snippet
  const scenarioMatch = html.match(/<strong>Scenario:<\/strong>\s*([^<]+)/);
  const scenarioSnippet = scenarioMatch ? scenarioMatch[1].trim() : '';

  if (scenarioSnippet) {
    if (seenScenarios.has(scenarioSnippet)) {
      duplicateScenarios++;
    }
    seenScenarios.add(scenarioSnippet);
  }

  for (const q of faqSummaries) {
    if (seenFaqs.has(q)) {
      duplicateFaqs++;
    }
    seenFaqs.add(q);
  }

  const isPass = hasH1 && hasCanonical && hasFormula && hasVarTable && hasWorkedExample && faqSummaries.length >= 3 && scenarioSnippet.length > 10;

  auditRows.push({
    slug,
    category: calc?.category_slug || spec?.category || 'General',
    fileSize: html.length,
    hasH1,
    hasCanonical,
    hasFormula,
    hasVarTable,
    hasWorkedExample,
    faqCount: faqSummaries.length,
    sampleFaq,
    scenarioSnippet,
    status: isPass ? 'PASS' : 'FAIL',
  });
}

console.log('| # | Slug | Category | Size | Formula | Table | Example | FAQs | Status | First FAQ |');
console.log('|---|---|---|---|---|---|---|---|---|---|');
auditRows.forEach((r, idx) => {
  const statusStr = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
  const faqShort = r.sampleFaq.length > 40 ? r.sampleFaq.slice(0, 38) + '...' : r.sampleFaq;
  console.log(`| ${idx + 1} | \`${r.slug}\` | ${r.category} | ${(r.fileSize / 1024).toFixed(1)}k | ${r.hasFormula ? '✅' : '❌'} | ${r.hasVarTable ? '✅' : '❌'} | ${r.hasWorkedExample ? '✅' : '❌'} | ${r.faqCount} | ${statusStr} | ${faqShort} |`);
});

const passCount = auditRows.filter(r => r.status === 'PASS').length;
console.log(`\n================================================================`);
console.log(`📊 60-Page Content Originality & Quality Summary:`);
console.log(`   - Total Pages Audited: ${auditRows.length}`);
console.log(`   - Passed Quality Standards: ${passCount} / ${auditRows.length} (${((passCount / auditRows.length) * 100).toFixed(1)}%)`);
console.log(`   - Duplicate Worked Scenarios Found: ${duplicateScenarios}`);
console.log(`   - Duplicate FAQs Found: ${duplicateFaqs}`);
console.log(`================================================================\n`);
