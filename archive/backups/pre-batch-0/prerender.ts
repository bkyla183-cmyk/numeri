import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveSiteUrl } from './siteUrl.ts';
import { getCalculatorSpec } from '../src/data/calculatorRegistry/index.ts';
import { getCalculatorEditorial } from '../src/data/calculatorEditorial.ts';
import { getFaqsForCalculator } from '../src/data/calculatorFaqs.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

const strictMode = process.argv.includes('--strict') || process.env.PRODUCTION_BUILD === '1';
const baseUrl = resolveSiteUrl(strictMode);

// Load database
const allCalcs: any[] = JSON.parse(
  fs.readFileSync(path.resolve(rootDir, 'src/data/allCalculatorsData.json'), 'utf8')
);
const allPosts: any[] = JSON.parse(
  fs.readFileSync(path.resolve(rootDir, 'src/data/postsData.json'), 'utf8')
);
const allCategories: any[] = JSON.parse(
  fs.readFileSync(path.resolve(rootDir, 'src/data/calcCategoriesData.json'), 'utf8')
);

function escapeHtml(val: any): string {
  if (val === undefined || val === null) return '';
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isSafeHref(url: string): boolean {
  const trimmed = url.trim();
  return trimmed.startsWith('/') || /^https?:\/\//i.test(trimmed);
}

function renderInlineMarkdown(text: string): string {
  const tokenPattern = /(\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g;
  let result = '';
  let lastIndex = 0;

  for (const match of text.matchAll(tokenPattern)) {
    const idx = match.index ?? 0;
    if (idx > lastIndex) {
      result += escapeHtml(text.slice(lastIndex, idx));
    }

    const token = match[0];
    if (token.startsWith('[')) {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      if (linkMatch && isSafeHref(linkMatch[2])) {
        const label = escapeHtml(linkMatch[1]);
        const href = escapeHtml(linkMatch[2].trim());
        result += `<a href="${href}" class="text-teal-700 font-medium underline underline-offset-2">${label}</a>`;
      } else {
        result += escapeHtml(token);
      }
    } else if (token.startsWith('**') && token.endsWith('**')) {
      result += `<strong>${escapeHtml(token.slice(2, -2))}</strong>`;
    } else if (token.startsWith('`') && token.endsWith('`')) {
      result += `<code class="px-1.5 py-0.5 bg-slate-100 rounded text-xs font-mono">${escapeHtml(token.slice(1, -1))}</code>`;
    } else {
      result += escapeHtml(token);
    }

    lastIndex = idx + token.length;
  }

  if (lastIndex < text.length) {
    result += escapeHtml(text.slice(lastIndex));
  }
  return result;
}

function formatWorkedExample(we: any): string {
  if (!we) return '';
  if (typeof we === 'string') return `<p class="text-xs">${escapeHtml(we)}</p>`;
  return `
    <div class="space-y-2 text-xs">
      ${we.scenario ? `<p class="font-medium text-slate-800"><strong>Scenario:</strong> ${escapeHtml(we.scenario)}</p>` : ''}
      ${Array.isArray(we.steps) && we.steps.length > 0 ? `<ul class="list-disc pl-4 space-y-1">${we.steps.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('')}</ul>` : ''}
      ${we.result ? `<p class="font-semibold text-indigo-700"><strong>Result:</strong> ${escapeHtml(we.result)}</p>` : ''}
      ${we.interpretation ? `<p class="text-slate-600 italic">${escapeHtml(we.interpretation)}</p>` : ''}
    </div>
  `;
}

function markdownToHtml(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inList = false;
  let inOrderedList = false;

  const closeLists = () => {
    if (inList) {
      htmlLines.push('</ul>');
      inList = false;
    }
    if (inOrderedList) {
      htmlLines.push('</ol>');
      inOrderedList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      closeLists();
      continue;
    }

    if (line.startsWith('### ')) {
      closeLists();
      htmlLines.push(`<h3 class="text-lg font-bold mt-4 mb-2 text-slate-900">${renderInlineMarkdown(line.slice(4))}</h3>`);
    } else if (line.startsWith('## ')) {
      closeLists();
      htmlLines.push(`<h2 class="text-xl font-bold mt-6 mb-3 text-slate-900">${renderInlineMarkdown(line.slice(3))}</h2>`);
    } else if (line.startsWith('# ')) {
      closeLists();
      htmlLines.push(`<h1 class="text-2xl font-bold mt-6 mb-3 text-slate-900">${renderInlineMarkdown(line.slice(2))}</h1>`);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      if (inOrderedList) {
        htmlLines.push('</ol>');
        inOrderedList = false;
      }
      if (!inList) {
        htmlLines.push('<ul class="list-disc pl-5 my-2 space-y-1 text-slate-700">');
        inList = true;
      }
      htmlLines.push(`<li>${renderInlineMarkdown(line.slice(2))}</li>`);
    } else if (/^\d+\.\s+/.test(line)) {
      if (inList) {
        htmlLines.push('</ul>');
        inList = false;
      }
      if (!inOrderedList) {
        htmlLines.push('<ol class="list-decimal pl-5 my-2 space-y-1 text-slate-700">');
        inOrderedList = true;
      }
      htmlLines.push(`<li>${renderInlineMarkdown(line.replace(/^\d+\.\s+/, ''))}</li>`);
    } else {
      closeLists();
      htmlLines.push(`<p class="my-2 leading-relaxed text-slate-700">${renderInlineMarkdown(line)}</p>`);
    }
  }

  closeLists();
  return htmlLines.join('\n');
}

interface PageMeta {
  title: string;
  description: string;
  canonicalPath: string;
  type?: string;
  isNoindex?: boolean;
  schema?: Record<string, any>[];
  bodyHtml: string;
}

function upsertHeadTag(html: string, pattern: RegExp, replacement: string): string {
  if (pattern.test(html)) {
    return html.replace(pattern, replacement);
  }
  return replacement ? html.replace('</head>', `  ${replacement}\n</head>`) : html;
}

function renderHtml(templateHtml: string, meta: PageMeta): string {
  let html = templateHtml;

  const fullCanonical = baseUrl
    ? meta.canonicalPath === '/'
      ? `${baseUrl}/`
      : `${baseUrl}${meta.canonicalPath}`
    : null;

  // 1. Replace Title
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);

  // 2. Replace or Inject Meta Description
  html = upsertHeadTag(
    html,
    /<meta\s+name="description"[^>]*>/i,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`
  );

  // 3. Canonical URL (only for indexable routes when SITE_URL is set)
  if (!meta.isNoindex && fullCanonical) {
    html = upsertHeadTag(
      html,
      /<link\s+rel="canonical"[^>]*>/i,
      `<link rel="canonical" href="${escapeHtml(fullCanonical)}" />`
    );
  } else {
    html = html.replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '');
  }

  // 4. Robots Tag
  const robotsTag = meta.isNoindex
    ? '<meta name="robots" content="noindex, follow" />'
    : '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />';
  html = upsertHeadTag(html, /<meta\s+name="robots"[^>]*>/i, robotsTag);

  // 5. OpenGraph Tags
  html = upsertHeadTag(
    html,
    /<meta\s+property="og:title"[^>]*>/i,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`
  );
  html = upsertHeadTag(
    html,
    /<meta\s+property="og:description"[^>]*>/i,
    `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
  );
  if (!meta.isNoindex && fullCanonical) {
    html = upsertHeadTag(
      html,
      /<meta\s+property="og:url"[^>]*>/i,
      `<meta property="og:url" content="${escapeHtml(fullCanonical)}" />`
    );
  } else {
    html = html.replace(/<meta\s+property="og:url"[^>]*>\s*/gi, '');
  }
  html = upsertHeadTag(
    html,
    /<meta\s+property="og:type"[^>]*>/i,
    `<meta property="og:type" content="${meta.type || 'website'}" />`
  );

  // 6. Twitter Tags
  html = upsertHeadTag(
    html,
    /<meta\s+name="twitter:title"[^>]*>/i,
    `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`
  );
  html = upsertHeadTag(
    html,
    /<meta\s+name="twitter:description"[^>]*>/i,
    `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`
  );

  // 7. Schema.org JSON-LD (inject cleanly into <head> when baseUrl and schema exist)
  html = html.replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>\s*/gi, '');
  if (!meta.isNoindex && baseUrl && meta.schema && meta.schema.length > 0) {
    const jsonLd = `<script type="application/ld+json">\n${JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@graph': meta.schema,
      },
      null,
      2
    )}\n  </script>`;
    html = html.replace('</head>', `  ${jsonLd}\n</head>`);
  }

  // 8. Inject meaningful visible HTML into <div id="root">
  const rootReplacement = `<div id="root">${meta.bodyHtml}</div>`;
  html = html.replace('<div id="root"></div>', rootReplacement);

  return html;
}

function writePage(subPath: string, content: string) {
  const targetPath = subPath.endsWith('.html')
    ? path.resolve(distDir, subPath)
    : path.resolve(distDir, subPath, 'index.html');

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, content, 'utf8');
}

export async function runPrerender() {
  console.log('====================================================');
  console.log('🚀 NUMERIQ BUILD-TIME PRERENDERING ENGINE');
  console.log('====================================================\n');

  if (!fs.existsSync(distDir)) {
    console.error('❌ Error: dist directory not found! Run "vite build" first.');
    process.exit(1);
  }

  if (baseUrl) {
    console.log(`🌐 Base Origin: ${baseUrl}`);
  } else {
    console.warn('⚠️  Preview Build Mode: SITE_URL is unset. Omitting canonical links, og:url, JSON-LD, and sitemap directive from dist/.');
  }

  // Ensure dist/robots.txt accurately includes Sitemap directive only when baseUrl is configured
  const distRobotsPath = path.resolve(distDir, 'robots.txt');
  if (fs.existsSync(distRobotsPath)) {
    const rawRobots = fs.readFileSync(distRobotsPath, 'utf8').replace(/^Sitemap:.*$/gim, '').trimEnd();
    const updatedRobots = baseUrl
      ? `${rawRobots}\n\n# Canonical Sitemap Index\nSitemap: ${baseUrl}/sitemap.xml\n`
      : `${rawRobots}\n`;
    fs.writeFileSync(distRobotsPath, updatedRobots, 'utf8');
  }

  const templateHtml = fs.readFileSync(path.resolve(distDir, 'index.html'), 'utf8');

  let countCalcs = 0;
  let countGuides = 0;
  let countCategories = 0;
  let countCore = 0;

  // ----------------------------------------------------
  // 1. Core and Legal Pages
  // ----------------------------------------------------
  console.log('📄 Prerendering Core & Legal Pages...');

  // Home Page (includes Organization + WebSite JSON-LD when SITE_URL is set)
  {
    const homeDesc = `Use ${allCalcs.length} curated, double-precision online calculators across ${allCategories.length} focused domains — backed by transparent formulas and ${allPosts.length} guides.`;
    const homeHtml = renderHtml(templateHtml, {
      title: 'Numeriq – Practical Online Calculators & Clear Answers',
      description: homeDesc,
      canonicalPath: '/',
      schema: baseUrl
        ? [
            {
              '@type': 'Organization',
              '@id': `${baseUrl}/#organization`,
              name: 'Numeriq',
              url: `${baseUrl}/`,
              logo: `${baseUrl}/favicon.svg`,
              description: 'Practical Calculators. Clear Answers.',
            },
            {
              '@type': 'WebSite',
              '@id': `${baseUrl}/#website`,
              name: 'Numeriq',
              url: `${baseUrl}/`,
              description: homeDesc,
              inLanguage: 'en-US',
              publisher: { '@id': `${baseUrl}/#organization` },
            },
          ]
        : undefined,
      bodyHtml: `
        <header class="py-12 bg-white border-b border-slate-200 text-center">
          <div class="max-w-4xl mx-auto px-4">
            <h1 class="text-4xl font-extrabold text-slate-900">Numeriq – Practical Calculators. Clear Answers.</h1>
            <p class="mt-3 text-lg text-slate-600">Curated double-precision online calculators across finance, business tax, mathematics, statistics, health, and unit conversions.</p>
            <div class="mt-6 flex flex-wrap justify-center gap-3">
              <a href="/calculators" class="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium">Browse All ${allCalcs.length} Calculators</a>
              <a href="/categories" class="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg font-medium">Explore ${allCategories.length} Categories</a>
              <a href="/blog" class="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg font-medium">Read ${allPosts.length} Knowledge Guides</a>
            </div>
          </div>
        </header>
      `,
    });
    fs.writeFileSync(path.resolve(distDir, 'index.html'), homeHtml, 'utf8');
    countCore++;
  }

  // 404 Page (dist/404.html)
  {
    const notFoundHtml = renderHtml(templateHtml, {
      title: 'Page Not Found (404) – Numeriq',
      description: 'The requested calculator, computational tool, or educational guide could not be located on Numeriq.',
      canonicalPath: '/404',
      isNoindex: true,
      bodyHtml: `
        <div class="max-w-2xl mx-auto px-4 py-20 text-center">
          <div class="text-5xl font-black font-mono text-teal-600 mb-4">404</div>
          <h1 class="text-3xl font-bold text-slate-900 mb-2">Page Not Found</h1>
          <p class="text-slate-600 mb-8">The requested calculator, guide, or page does not exist or may have been relocated.</p>
          <div class="flex justify-center gap-4">
            <a href="/" class="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-medium">Return Home</a>
            <a href="/calculators" class="px-5 py-2.5 bg-slate-100 text-slate-800 rounded-xl font-medium">Browse All Calculators</a>
          </div>
        </div>
      `,
    });
    fs.writeFileSync(path.resolve(distDir, '404.html'), notFoundHtml, 'utf8');
    countCore++;
  }

  // Other Core Pages
  const corePages = [
    {
      path: 'calculators',
      title: `All ${allCalcs.length} Online Calculators Directory – Numeriq`,
      desc: `Browse our curated directory of ${allCalcs.length} free verified online calculators for mortgage, loans, tax, math, statistics, unit conversions, and health.`,
      heading: `All Online Calculators Directory (${allCalcs.length} Tools)`,
      isNoindex: false,
    },
    {
      path: 'categories',
      title: `All ${allCategories.length} Calculator Categories – Numeriq`,
      desc: `Explore ${allCategories.length} focused domains covering finance, business tax, algebra, statistics, geometry, health, science, and unit conversions.`,
      heading: `All ${allCategories.length} Calculator Categories`,
      isNoindex: false,
    },
    {
      path: 'blog',
      title: `Knowledge Hub – ${allPosts.length} Calculation Guides & Formulas | Numeriq`,
      desc: `Understand the mathematics, scientific formulas, and financial strategies behind Numeriq calculators with ${allPosts.length} step-by-step guides.`,
      heading: `Numeriq Knowledge Hub (${allPosts.length} Guides)`,
      isNoindex: false,
    },
    {
      path: 'about',
      title: 'About & Editorial Standards – Numeriq',
      desc: 'Learn about Numeriq editorial principles, double-precision formulas, verification methodology, and mission.',
      heading: 'About Numeriq & Our Mathematical Editorial Standards',
      isNoindex: false,
    },
    {
      path: 'privacy',
      title: 'Privacy Policy – Numeriq (GDPR & CCPA Compliant)',
      desc: 'Numeriq privacy policy: client-side calculation privacy, Google AdSense DART cookie disclosure, CCPA and GDPR rights.',
      heading: 'Privacy Policy (GDPR & CCPA Compliant)',
      isNoindex: false,
    },
    {
      path: 'terms',
      title: 'Terms of Service & Usage Agreement – Numeriq',
      desc: 'Terms of service and mathematical calculation guidelines for Numeriq tools, intellectual property, and user warranties.',
      heading: 'Terms of Service & Mathematical Usage Agreement',
      isNoindex: false,
    },
    {
      path: 'disclaimer',
      title: 'Mathematical, Financial & Medical Disclaimers – Numeriq',
      desc: 'Statutory disclaimers for financial estimates, medical formulas (BMI, TDEE, pregnancy), and engineering calculators on Numeriq.',
      heading: 'Statutory Financial, Medical & Engineering Disclaimers',
      isNoindex: false,
    },
    {
      path: 'contact',
      title: 'Contact Numeriq Support & Formula Editorial Team',
      desc: 'Get in touch with our editorial and mathematical engineering team for calculator inquiries, formula corrections, and feedback.',
      heading: 'Contact Numeriq Editorial & Support Team',
      isNoindex: false,
    },
    {
      path: 'saved',
      title: 'Saved Calculators & Bookmarked Guides – Numeriq',
      desc: 'Access your bookmarked formulas, saved calculation tools, and favorite editorial guides in one private browser workspace.',
      heading: 'Your Saved Calculators & Workspace',
      isNoindex: true,
    },
  ];

  for (const page of corePages) {
    const pageHtml = renderHtml(templateHtml, {
      title: page.title,
      description: page.desc,
      canonicalPath: `/${page.path}`,
      isNoindex: page.isNoindex,
      bodyHtml: `
        <div class="max-w-4xl mx-auto px-4 py-12">
          <nav class="text-xs text-slate-500 mb-4"><a href="/">Home</a> / <span class="font-semibold text-slate-800">${escapeHtml(page.heading)}</span></nav>
          <h1 class="text-3xl font-extrabold text-slate-900 mb-3">${escapeHtml(page.heading)}</h1>
          <p class="text-slate-600 mb-6">${escapeHtml(page.desc)}</p>
          <div class="p-6 rounded-2xl bg-white border border-slate-200">
            <p class="text-sm text-slate-700">Interactive workspace ready.</p>
          </div>
        </div>
      `,
    });
    writePage(page.path, pageHtml);
    countCore++;
  }

  // ----------------------------------------------------
  // 2. Active Category Pages
  // ----------------------------------------------------
  console.log(`📁 Prerendering ${allCategories.length} Category Directories...`);

  for (const cat of allCategories) {
    const catCalcs = allCalcs.filter((c) => c.category_slug === cat.slug);
    const catTitle = `${cat.name} Calculators (Free Online Tools) – Numeriq`;
    const catDesc = `Browse ${catCalcs.length} free verified ${cat.name} calculators on Numeriq. Double-precision formulas and worked examples for ${cat.description}`;
    const canonicalPath = `/category/${cat.slug}`;

    const calcsListHtml = catCalcs
      .map(
        (c) => `
      <li class="p-4 rounded-xl border border-slate-200 bg-white hover:border-teal-400">
        <a href="/calculator/${c.slug}" class="font-bold text-slate-900 hover:text-teal-600 block">${escapeHtml(c.name)}</a>
        <p class="text-xs text-slate-600 mt-1">${escapeHtml(c.description)}</p>
        ${c.formula ? `<div class="mt-2 text-xs font-mono text-indigo-600 bg-indigo-50 inline-block px-2 py-0.5 rounded">Formula: ${escapeHtml(c.formula)}</div>` : ''}
      </li>
    `
      )
      .join('\n');

    const catHtml = renderHtml(templateHtml, {
      title: catTitle,
      description: catDesc,
      canonicalPath,
      schema: baseUrl
        ? [
            {
              '@type': 'CollectionPage',
              '@id': `${baseUrl}${canonicalPath}`,
              name: `${cat.name} Calculators`,
              description: catDesc,
              url: `${baseUrl}${canonicalPath}`,
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
                { '@type': 'ListItem', position: 2, name: 'Categories', item: `${baseUrl}/categories` },
                { '@type': 'ListItem', position: 3, name: cat.name, item: `${baseUrl}${canonicalPath}` },
              ],
            },
          ]
        : undefined,
      bodyHtml: `
        <div class="max-w-5xl mx-auto px-4 py-10">
          <nav class="text-xs text-slate-500 mb-4">
            <a href="/">Home</a> / <a href="/categories">Categories</a> / <span class="font-semibold text-slate-800">${escapeHtml(cat.name)}</span>
          </nav>
          <div class="mb-8">
            <span class="text-xs font-semibold text-teal-600 uppercase tracking-wider">${cat.icon || '🔢'} Category Directory</span>
            <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${escapeHtml(cat.name)} Calculators</h1>
            <p class="text-slate-600 mt-2 max-w-2xl">${escapeHtml(cat.description)} (${catCalcs.length} verified calculators available).</p>
          </div>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${calcsListHtml}
          </ul>
        </div>
      `,
    });

    writePage(`category/${cat.slug}`, catHtml);
    countCategories++;
  }

  // ----------------------------------------------------
  // 3. Active Calculator Pages (NO FAQPage JSON-LD; HTML <details> preserved)
  // ----------------------------------------------------
  console.log(`🧮 Prerendering ${allCalcs.length} Dedicated Calculator Pages...`);

  for (const calc of allCalcs) {
    const spec = getCalculatorSpec(calc.slug);
    const editorial = getCalculatorEditorial(calc.slug, calc.name, calc.category_slug, calc.formula);
    const faqs = getFaqsForCalculator(calc.slug, calc.name, calc.category_slug, calc.formula);

    const calcTitle = `${calc.name} – Free Online Calculator | Numeriq`;
    const calcDesc = calc.meta_description || calc.description;
    const canonicalPath = `/calculator/${calc.slug}`;
    const fullUrl = baseUrl ? `${baseUrl}${canonicalPath}` : '';

    const cat =
      allCategories.find((c) => c.slug === calc.category_slug) || { name: calc.category_slug, slug: calc.category_slug };

    const inputsListHtml = (spec?.inputs || [])
      .map(
        (inp: any) => `
      <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
        <label class="block text-xs font-semibold text-slate-700">${escapeHtml(inp.label || inp.id)}</label>
        <span class="text-xs text-slate-500">Default: ${escapeHtml(String(inp.defaultValue ?? ''))} ${escapeHtml(inp.unit || '')}</span>
      </div>
    `
      )
      .join('\n');

    const editorialHtml = editorial
      ? `
      <section class="mt-8 border-t border-slate-200 pt-6 space-y-6">
        <div>
          <h2 class="text-xl font-bold text-slate-900 mb-2">How It Works &amp; Mathematical Principles</h2>
          <p class="text-sm text-slate-700 leading-relaxed mb-3">${escapeHtml(editorial.overview || '')}</p>
          ${editorial.detailedExplanation ? `<p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(editorial.detailedExplanation)}</p>` : ''}
        </div>

        ${
          editorial.formulaDisplay?.formula
            ? `
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Governing Equation</span>
            <div class="font-mono text-xs sm:text-sm text-indigo-700 bg-white p-3 rounded-lg border border-slate-200">${escapeHtml(editorial.formulaDisplay.formula)}</div>
          </div>
        `
            : ''
        }

        ${
          editorial.formulaDisplay?.variableDefinitions && editorial.formulaDisplay.variableDefinitions.length > 0
            ? `
          <div>
            <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Variable Definitions &amp; Units</h3>
            <table class="w-full text-left text-xs border border-slate-200 rounded-lg overflow-hidden">
              <thead class="bg-slate-50 text-slate-500"><tr><th class="p-2">Variable</th><th class="p-2">Name</th><th class="p-2">Unit</th></tr></thead>
              <tbody class="divide-y divide-slate-100">${editorial.formulaDisplay.variableDefinitions.map((v: any) => `<tr><td class="p-2 font-mono font-bold text-indigo-600">${escapeHtml(v.symbol)}</td><td class="p-2">${escapeHtml(v.name)}</td><td class="p-2 text-slate-500">${escapeHtml(v.unit || 'Standard')}</td></tr>`).join('')}</tbody>
            </table>
          </div>
        `
            : ''
        }

        ${
          editorial.workedExample
            ? `
          <div class="p-5 border border-indigo-100 bg-indigo-50/40 rounded-xl space-y-2">
            <h3 class="font-bold text-xs uppercase tracking-wider text-indigo-900">Step-by-Step Worked Calculation Example</h3>
            ${formatWorkedExample(editorial.workedExample)}
          </div>
        `
            : ''
        }

        ${
          editorial.commonMistakes
            ? `
          <div class="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-1">
            <h3 class="font-bold text-amber-900 uppercase tracking-wider">${escapeHtml(typeof editorial.commonMistakes === 'object' && 'title' in editorial.commonMistakes ? (editorial.commonMistakes as any).title : 'Common Pitfalls to Avoid')}</h3>
            <p class="text-amber-800">${escapeHtml(typeof editorial.commonMistakes === 'object' && 'explanation' in editorial.commonMistakes ? (editorial.commonMistakes as any).explanation : String(editorial.commonMistakes))}</p>
          </div>
        `
            : ''
        }
      </section>
    `
      : '';

    const faqsHtml =
      faqs && faqs.length > 0
        ? `
      <section class="mt-8 border-t border-slate-200 pt-6">
        <h2 class="text-xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        <div class="space-y-3">
          ${faqs
            .map(
              (f: any) => `
            <details class="p-4 rounded-xl border border-slate-200 bg-white">
              <summary class="font-semibold text-sm text-slate-900 cursor-pointer">${escapeHtml(f.question)}</summary>
              <p class="mt-2 text-xs text-slate-600 leading-relaxed">${escapeHtml(f.answer)}</p>
            </details>
          `
            )
            .join('\n')}
        </div>
      </section>
    `
        : '';

    const schemaGraph: Record<string, any>[] | undefined = baseUrl
      ? [
          {
            '@type': 'WebApplication',
            '@id': fullUrl,
            name: calc.name,
            applicationCategory: 'EducationalApplication',
            operatingSystem: 'All',
            url: fullUrl,
            description: calc.description,
            inLanguage: ['en-US', 'en-GB', 'en-CA', 'en-AU'],
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            ...(calc.formula ? { featureList: `Formula: ${calc.formula}` } : {}),
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
              { '@type': 'ListItem', position: 2, name: 'Calculators', item: `${baseUrl}/calculators` },
              { '@type': 'ListItem', position: 3, name: cat.name, item: `${baseUrl}/category/${cat.slug}` },
              { '@type': 'ListItem', position: 4, name: calc.name, item: fullUrl },
            ],
          },
        ]
      : undefined;

    const calcHtml = renderHtml(templateHtml, {
      title: calcTitle,
      description: calcDesc,
      canonicalPath,
      schema: schemaGraph,
      bodyHtml: `
        <article class="max-w-4xl mx-auto px-4 py-8">
          <nav class="text-xs text-slate-500 mb-4 flex items-center gap-1.5 flex-wrap">
            <a href="/">Home</a> / <a href="/calculators">Calculators</a> / <a href="/category/${cat.slug}">${escapeHtml(cat.name)}</a> / <span class="font-semibold text-slate-800">${escapeHtml(calc.name)}</span>
          </nav>

          <header class="border-b border-slate-200 pb-5 mb-6">
            <span class="text-xs font-semibold text-teal-600 uppercase tracking-wider">${escapeHtml(cat.name)} · Double-Precision Tool</span>
            <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${escapeHtml(calc.name)}</h1>
            <p class="text-slate-600 text-sm mt-2 leading-relaxed">${escapeHtml(calc.description)}</p>
            ${calc.formula ? `<div class="mt-3 p-3 rounded-lg bg-slate-100 font-mono text-xs text-indigo-700">Formula: ${escapeHtml(calc.formula)}</div>` : ''}
          </header>

          <div class="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs mb-8">
            <h2 class="text-base font-bold text-slate-900 mb-3">Calculator Parameters</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              ${inputsListHtml}
            </div>
            <p class="text-xs text-slate-500">Executing client-side IEEE 754 double precision interactive computation...</p>
          </div>

          ${editorialHtml}
          ${faqsHtml}
        </article>
      `,
    });

    writePage(`calculator/${calc.slug}`, calcHtml);
    countCalcs++;
  }

  // ----------------------------------------------------
  // 4. All Editorial Guide Pages
  // ----------------------------------------------------
  console.log(`📚 Prerendering ${allPosts.length} Editorial Guides...`);

  for (const post of allPosts) {
    const postTitle = `${post.title} | Numeriq Knowledge Hub`;
    const postDesc = post.meta_description || post.excerpt;
    const canonicalPath = `/guide/${post.slug}`;
    const fullUrl = baseUrl ? `${baseUrl}${canonicalPath}` : '';

    const contentHtml = markdownToHtml(post.content);

    const postHtml = renderHtml(templateHtml, {
      title: postTitle,
      description: postDesc,
      canonicalPath,
      type: 'article',
      schema: baseUrl
        ? [
            {
              '@type': 'Article',
              '@id': fullUrl,
              headline: post.title,
              description: post.excerpt,
              url: fullUrl,
              inLanguage: 'en-US',
              author: { '@type': 'Organization', name: post.author || 'Numeriq Editorial Team' },
              publisher: { '@type': 'Organization', name: 'Numeriq', url: `${baseUrl}/` },
              datePublished: post.published_at || post.created_at || '2024-11-15T10:00:00Z',
              dateModified: post.updated_at || post.published_at || post.created_at || '2024-11-15T10:00:00Z',
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: `${baseUrl}/` },
                { '@type': 'ListItem', position: 2, name: 'Knowledge Hub', item: `${baseUrl}/blog` },
                { '@type': 'ListItem', position: 3, name: post.title, item: fullUrl },
              ],
            },
          ]
        : undefined,
      bodyHtml: `
        <article class="max-w-4xl mx-auto px-4 py-8">
          <nav class="text-xs text-slate-500 mb-4">
            <a href="/">Home</a> / <a href="/blog">Knowledge Hub</a> / <span class="font-semibold text-slate-800">${escapeHtml(post.title)}</span>
          </nav>

          <header class="border-b border-slate-200 pb-5 mb-6">
            <span class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">${escapeHtml(post.categories || 'Guide')} · ${post.read_time || 5} min read</span>
            <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${escapeHtml(post.title)}</h1>
            <p class="text-slate-600 text-base mt-2 leading-relaxed">${escapeHtml(post.excerpt)}</p>
            <div class="mt-3 text-xs text-slate-400">By ${escapeHtml(post.author || 'Numeriq Editorial Team')}</div>
          </header>

          <div class="prose prose-slate max-w-none text-slate-800 leading-relaxed">
            ${contentHtml}
          </div>
        </article>
      `,
    });

    writePage(`guide/${post.slug}`, postHtml);
    countGuides++;
  }

  console.log('\n====================================================');
  console.log('✅ NUMERIQ PRERENDERING SUMMARY REPORT');
  console.log('====================================================');
  console.log(`  📄 Core & Legal Pages:   ${countCore}`);
  console.log(`  📁 Category Directories: ${countCategories}`);
  console.log(`  🧮 Calculator Pages:     ${countCalcs}`);
  console.log(`  📚 Editorial Guides:     ${countGuides}`);
  console.log(`  -----------------------------------------`);
  console.log(`  🎉 TOTAL HTML PAGES:     ${countCore + countCategories + countCalcs + countGuides}`);
  console.log('====================================================\n');
}

runPrerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
