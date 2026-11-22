import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { bespokeEditorials } from '../src/data/calculatorEditorial.ts';
import { getFaqsForCalculator } from '../src/data/calculatorFaqs.ts';
import { getCalculatorSpec } from '../src/data/calculatorRegistry/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const allCalcs: any[] = JSON.parse(
  fs.readFileSync(path.resolve(rootDir, 'src/data/allCalculatorsData.json'), 'utf8')
);
const allCategories: any[] = JSON.parse(
  fs.readFileSync(path.resolve(rootDir, 'src/data/calcCategoriesData.json'), 'utf8')
);
const legacyRedirects: Array<{ source: string; destination: string; type: number }> = JSON.parse(
  fs.readFileSync(path.resolve(rootDir, 'scripts/legacy-redirects.json'), 'utf8')
);

let passed = 0;
let failed = 0;

function check(ok: boolean, label: string, detail?: any) {
  if (ok) {
    passed++;
    console.log(`  ✅ PASS: ${label}`);
  } else {
    failed++;
    console.error(`  ❌ FAIL: ${label}`, detail ?? '');
  }
}

console.log('====================================================');
console.log('🛡️  NUMERIQ EXPANSION & REGRESSION QUALITY GATE');
console.log('====================================================\n');

// 1. Uniqueness & Redirect Collision Guard
const slugSet = new Set<string>();
const nameSet = new Set<string>();
const titleSet = new Set<string>();
const descSet = new Set<string>();
const dupSlugs: string[] = [];
const dupNames: string[] = [];
const dupTitles: string[] = [];
const dupDescs: string[] = [];

for (const c of allCalcs) {
  const s = String(c.slug || '').trim().toLowerCase();
  const n = String(c.name || '').trim().toLowerCase();
  const t = String(c.meta_title || '').trim().toLowerCase();
  const d = String(c.meta_description || '').trim().toLowerCase();
  if (slugSet.has(s)) dupSlugs.push(c.slug);
  slugSet.add(s);
  if (nameSet.has(n)) dupNames.push(c.name);
  nameSet.add(n);
  if (t && titleSet.has(t)) dupTitles.push(c.slug);
  if (t) titleSet.add(t);
  if (d && descSet.has(d)) dupDescs.push(c.slug);
  if (d) descSet.add(d);
}

check(dupSlugs.length === 0, `0 duplicate slugs across ${allCalcs.length} calculators`, dupSlugs);
check(dupNames.length === 0, `0 duplicate calculator names`, dupNames);
check(dupTitles.length === 0, `0 duplicate meta_title values`, dupTitles);
check(dupDescs.length === 0, `0 duplicate meta_description values`, dupDescs);

const redirectedSources = new Set<string>(
  legacyRedirects.map((r) => String(r.source || ''))
);
const redirectCollisions = allCalcs
  .filter((c) => redirectedSources.has(`/calculator/${c.slug}`))
  .map((c) => c.slug);
check(redirectCollisions.length === 0, '0 collisions with legacy 301 redirect slugs in legacy-redirects.json', redirectCollisions);

// 2. Category Integrity
const categorySlugSet = new Set(allCategories.map((cat) => cat.slug));
const orphanCats = allCalcs.filter((c) => !categorySlugSet.has(c.category_slug)).map((c) => c.slug);
check(orphanCats.length === 0, `All ${allCalcs.length} calculators map to valid categories`, orphanCats);

const allPosts: any[] = JSON.parse(
  fs.readFileSync(path.resolve(rootDir, 'src/data/postsData.json'), 'utf8')
);

// 3. Bespoke Editorial, FAQ, E-E-A-T, Reference, Meta Bounds & Input Verification
const missingEditorials: string[] = [];
const thinFaqs: string[] = [];
const invalidRefUrls: string[] = [];
const missingRefsOrEeat: string[] = [];
const brokenRelatedSlugs: string[] = [];
const badMetaDescBounds: string[] = [];
const badMetaTitles: string[] = [];
const doubledWordSlugs: string[] = [];
const invalidSpecInputs: string[] = [];
const defaultCalcErrors: string[] = [];

const doubledWordRegex = /\b([a-z]{3,})\s+\1\b/i;

for (const c of allCalcs) {
  const metaDesc = String(c.meta_description || '').trim();
  const metaTitle = String(c.meta_title || '').trim();
  if (metaDesc.length < 120 || metaDesc.length > 160) {
    badMetaDescBounds.push(`${c.slug}(${metaDesc.length})`);
  }
  if (!metaTitle || metaTitle.length > 65 || /converter calculator/i.test(metaTitle)) {
    badMetaTitles.push(`${c.slug}("${metaTitle}")`);
  }
  if (
    doubledWordRegex.test(metaTitle) ||
    doubledWordRegex.test(metaDesc) ||
    doubledWordRegex.test(String(c.description || ''))
  ) {
    doubledWordSlugs.push(`meta:${c.slug}`);
  }

  const ed = bespokeEditorials[c.slug];
  if (!ed) {
    missingEditorials.push(c.slug);
  } else {
    if (!Array.isArray(ed.references) || ed.references.length === 0 || !ed.eeat) {
      missingRefsOrEeat.push(c.slug);
    }
    if (Array.isArray(ed.references)) {
      for (const ref of ed.references) {
        if (!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}/i.test(ref.url) || /example\./i.test(ref.url)) {
          invalidRefUrls.push(`${c.slug}:${ref.url}`);
        }
      }
    }
    if (Array.isArray(ed.relatedCalculatorSlugs)) {
      for (const rel of ed.relatedCalculatorSlugs) {
        if (!slugSet.has(String(rel).toLowerCase())) {
          brokenRelatedSlugs.push(`${c.slug}->${rel}`);
        }
      }
    }
  }

  const faqs = getFaqsForCalculator(c.slug, c.name, c.category_slug, c.formula);
  if (!faqs || faqs.length < 2) {
    thinFaqs.push(c.slug);
  } else {
    for (const faq of faqs) {
      if (doubledWordRegex.test(faq.question) || doubledWordRegex.test(faq.answer)) {
        doubledWordSlugs.push(`faq:${c.slug}`);
        break;
      }
    }
  }

  const spec = getCalculatorSpec(c.slug);
  if (!spec) {
    check(false, `Missing registry spec for ${c.slug}`);
  } else {
    const inputIds = new Set<string>();
    const defaults: Record<string, any> = {};
    for (const inp of spec.inputs) {
      if (inputIds.has(inp.id)) {
        invalidSpecInputs.push(`${c.slug}:dup-id:${inp.id}`);
      }
      inputIds.add(inp.id);
      defaults[inp.id] = inp.defaultValue;

      if (inp.type === 'number' || (!inp.type && typeof inp.defaultValue === 'number')) {
        const numVal = Number(inp.defaultValue);
        if (!Number.isFinite(numVal)) {
          invalidSpecInputs.push(`${c.slug}:${inp.id}:non-finite-default`);
        }
        if (typeof inp.min === 'number' && numVal < inp.min) {
          invalidSpecInputs.push(`${c.slug}:${inp.id}:default<min`);
        }
        if (typeof inp.max === 'number' && numVal > inp.max) {
          invalidSpecInputs.push(`${c.slug}:${inp.id}:default>max`);
        }
        if (inp.step !== undefined && inp.step !== 'any' && Number(inp.step) <= 0) {
          invalidSpecInputs.push(`${c.slug}:${inp.id}:bad-step`);
        }
      } else if (inp.type === 'select' && Array.isArray(inp.options)) {
        const validOpts = new Set(inp.options.map((o) => String(o.value)));
        if (!validOpts.has(String(inp.defaultValue))) {
          invalidSpecInputs.push(`${c.slug}:${inp.id}:invalid-select-default`);
        }
      }
    }

    try {
      const out = spec.calculate(defaults);
      const val = out.primaryValue ?? out.primaryOutput;
      if (
        out.isError ||
        val === undefined ||
        val === null ||
        (typeof val === 'number' && !Number.isFinite(val)) ||
        (typeof val === 'string' && (/\bNaN\b/.test(val) || /\bInfinity\b/.test(val)))
      ) {
        defaultCalcErrors.push(`${c.slug}:${val ?? out.errorMessage ?? 'error'}`);
      }
    } catch (err: any) {
      defaultCalcErrors.push(`${c.slug}:throw:${err?.message || err}`);
    }
  }
}

const badPostMetaDesc: string[] = [];
for (const p of allPosts) {
  const md = String(p.meta_description || '').trim();
  if (md.length < 120 || md.length > 160) {
    badPostMetaDesc.push(`${p.slug}(${md.length})`);
  }
}

check(missingEditorials.length === 0, `100% bespoke editorial coverage (${allCalcs.length}/${allCalcs.length})`, missingEditorials);
check(missingRefsOrEeat.length === 0, `All ${allCalcs.length} calculators include authoritative references and E-E-A-T metadata`, missingRefsOrEeat);
check(brokenRelatedSlugs.length === 0, `0 broken relatedCalculatorSlugs across all ${allCalcs.length} editorials`, brokenRelatedSlugs);
check(thinFaqs.length === 0, `All ${allCalcs.length} calculators have >= 2 FAQ entries`, thinFaqs);
check(invalidRefUrls.length === 0, 'All authoritative reference URLs use valid HTTPS domains', invalidRefUrls);
check(badMetaDescBounds.length === 0, `All ${allCalcs.length} calculator meta_description values are 120–160 chars`, badMetaDescBounds);
check(badMetaTitles.length === 0, `All ${allCalcs.length} calculator meta_title values are <= 65 chars without "Converter Calculator"`, badMetaTitles);
check(badPostMetaDesc.length === 0, `All ${allPosts.length} guide meta_description values are 120–160 chars`, badPostMetaDesc);
check(doubledWordSlugs.length === 0, '0 doubled words across calculator meta and FAQs', doubledWordSlugs);
check(invalidSpecInputs.length === 0, `All ${allCalcs.length} calculator input definitions pass boundary & option checks`, invalidSpecInputs);
check(defaultCalcErrors.length === 0, `All ${allCalcs.length} calculators execute cleanly on default inputs`, defaultCalcErrors);

// 4. Optional dist/ & sitemap parity check (when dist exists)
const distDir = path.resolve(rootDir, 'dist');
if (fs.existsSync(distDir) && fs.existsSync(path.resolve(distDir, 'sitemap.xml'))) {
  const sitemapXml = fs.readFileSync(path.resolve(distDir, 'sitemap.xml'), 'utf8');
  const missingInSitemap = allCalcs
    .filter((c) => !sitemapXml.includes(`/calculator/${c.slug}</loc>`))
    .map((c) => c.slug);
  const missingPrerendered = allCalcs
    .filter((c) => !fs.existsSync(path.resolve(distDir, `calculator/${c.slug}/index.html`)))
    .map((c) => c.slug);

  check(missingInSitemap.length === 0, `All ${allCalcs.length} calculators present in dist/sitemap.xml`, missingInSitemap);
  check(missingPrerendered.length === 0, `All ${allCalcs.length} calculators have prerendered HTML in dist/`, missingPrerendered);
}

console.log('\n====================================================');
console.log(`QUALITY GATE TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('====================================================');
if (failed > 0) process.exit(1);
