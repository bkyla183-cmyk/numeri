import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { resolveSiteUrl } from './siteUrl.ts';
import { getCalculatorSpec } from '../src/data/calculatorRegistry/index.ts';
import { getCalculatorEditorial } from '../src/data/calculatorEditorial.ts';
import { getFaqsForCalculator } from '../src/data/calculatorFaqs.ts';
import { getRelatedCalculatorForPost, getRelatedPostsForCalculator } from '../src/data/index.ts';

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

function slugifyHeading(text: string): string {
  return text.toLowerCase().replace(/[^\w]+/g, '-');
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

function formatCommonMistakes(cm: any): string {
  if (!cm) return '';
  const items: { title?: string; explanation?: string }[] = Array.isArray(cm)
    ? cm
    : typeof cm === 'object'
      ? [cm]
      : [{ title: 'Common Pitfalls to Avoid', explanation: String(cm) }];

  if (items.length === 0) return '';

  return `
    <div class="p-4 bg-amber-50/60 border border-amber-200 rounded-xl text-xs space-y-2">
      <h3 class="font-bold text-amber-900 uppercase tracking-wider">${escapeHtml(items[0]?.title || 'Common Pitfalls to Avoid')}</h3>
      ${items
        .map(
          (item, idx) =>
            `<p class="text-amber-800 leading-relaxed">${idx > 0 && item.title ? `<strong>${escapeHtml(item.title)}:</strong> ` : ''}${escapeHtml(item.explanation || '')}</p>`
        )
        .join('\n')}
    </div>
  `;
}

function markdownToHtml(md: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  const htmlLines: string[] = [];
  let inList = false;
  let inOrderedList = false;
  let inTable = false;
  let tableRows: string[][] = [];

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

  const closeTable = () => {
    if (inTable && tableRows.length > 0) {
      const header = tableRows[0];
      const body = tableRows.slice(1).filter((r) => !r.every((c) => /^[-:\s]+$/.test(c)));
      htmlLines.push('<div class="my-6 overflow-x-auto border border-slate-200 rounded-xl">');
      htmlLines.push('<table class="w-full text-left text-xs sm:text-sm">');
      htmlLines.push(
        `<thead class="bg-slate-100 text-slate-800 font-semibold font-mono"><tr>${header
          .map((col) => `<th class="py-2.5 px-3.5">${escapeHtml(col.trim())}</th>`)
          .join('')}</tr></thead>`
      );
      htmlLines.push(
        `<tbody class="divide-y divide-slate-200 text-slate-700">${body
          .map(
            (row) =>
              `<tr>${row.map((cell) => `<td class="py-2 px-3.5 font-mono">${renderInlineMarkdown(cell.trim())}</td>`).join('')}</tr>`
          )
          .join('')}</tbody>`
      );
      htmlLines.push('</table></div>');
      tableRows = [];
      inTable = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith('|') && line.endsWith('|')) {
      closeLists();
      inTable = true;
      tableRows.push(line.slice(1, -1).split('|'));
      continue;
    } else if (inTable) {
      closeTable();
    }

    if (!line) {
      closeLists();
      continue;
    }

    if (line.startsWith('### ')) {
      closeLists();
      const text = line.slice(4).trim();
      htmlLines.push(`<h3 id="${escapeHtml(slugifyHeading(text))}" class="text-lg font-bold mt-4 mb-2 text-slate-900">${renderInlineMarkdown(text)}</h3>`);
    } else if (line.startsWith('## ')) {
      closeLists();
      const text = line.slice(3).trim();
      htmlLines.push(`<h2 id="${escapeHtml(slugifyHeading(text))}" class="text-xl font-bold mt-6 mb-3 text-slate-900">${renderInlineMarkdown(text)}</h2>`);
    } else if (line.startsWith('# ')) {
      closeLists();
      const text = line.slice(2).trim();
      htmlLines.push(`<h1 class="text-2xl font-bold mt-6 mb-3 text-slate-900">${renderInlineMarkdown(text)}</h1>`);
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
  closeTable();
  return htmlLines.join('\n');
}

function getCalculatorSeoTitle(calc: any): string {
  if (calc.name.length <= 28 && !/converter/i.test(calc.name)) {
    return `${calc.name} – Free Online Calculator | Numeriq`;
  }
  return calc.meta_title || `${calc.name} | Numeriq`;
}

function getGuideSeoTitle(post: any): string {
  const full = `${post.title} | Numeriq Knowledge Hub`;
  return full.length <= 76 ? full : `${post.title} | Numeriq`;
}

const STATIC_TRUST_FOOTER_HTML = `
  <footer class="mt-12 pt-6 border-t border-slate-200 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
    <span>&copy; 2026 Numeriq. Double-precision browser calculators &amp; educational reference guides.</span>
    <nav aria-label="Legal and Editorial" class="flex flex-wrap items-center gap-4">
      <a href="/calculators" class="hover:underline text-slate-600">All Calculators</a>
      <a href="/categories" class="hover:underline text-slate-600">Categories</a>
      <a href="/blog" class="hover:underline text-slate-600">Knowledge Hub</a>
      <a href="/about" class="hover:underline text-slate-600">About &amp; Standards</a>
      <a href="/privacy" class="hover:underline text-slate-600">Privacy Policy</a>
      <a href="/terms" class="hover:underline text-slate-600">Terms of Service</a>
      <a href="/disclaimer" class="hover:underline text-slate-600">Disclaimers</a>
      <a href="/contact" class="hover:underline text-slate-600">Contact</a>
    </nav>
  </footer>
`;

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

  const sitemapHref = baseUrl ? `${baseUrl}/sitemap.xml` : '/sitemap.xml';
  html = upsertHeadTag(
    html,
    /<link\s+rel="sitemap"[^>]*>/i,
    `<link rel="sitemap" type="application/xml" title="Sitemap" href="${escapeHtml(sitemapHref)}" />`
  );

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
  if (baseUrl) {
    html = upsertHeadTag(
      html,
      /<meta\s+property="og:image"[^>]*>/i,
      `<meta property="og:image" content="${escapeHtml(`${baseUrl}/og-image.jpg`)}" />`
    );
    html = upsertHeadTag(
      html,
      /<meta\s+property="og:image:alt"[^>]*>/i,
      `<meta property="og:image:alt" content="${escapeHtml(meta.title)}" />`
    );
  }

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
  if (baseUrl) {
    html = upsertHeadTag(
      html,
      /<meta\s+name="twitter:image"[^>]*>/i,
      `<meta name="twitter:image" content="${escapeHtml(`${baseUrl}/og-image.jpg`)}" />`
    );
    html = upsertHeadTag(
      html,
      /<meta\s+name="twitter:image:alt"[^>]*>/i,
      `<meta name="twitter:image:alt" content="${escapeHtml(meta.title)}" />`
    );
  }

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
  // 1. Core and Legal Pages (Rich Crawl & AdSense Content)
  // ----------------------------------------------------
  console.log('📄 Prerendering Core & Legal Pages...');

  // Home Page
  {
    const homeDesc = `Use ${allCalcs.length} curated, double-precision online calculators across ${allCategories.length} domains — backed by transparent formulas and ${allPosts.length} guides.`;
    const popularTop = allCalcs.filter((c) => c.is_popular).slice(0, 12);
    const fallbackTop = popularTop.length >= 12 ? popularTop : allCalcs.slice(0, 12);

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
              logo: { '@type': 'ImageObject', url: `${baseUrl}/favicon.svg` },
              image: `${baseUrl}/og-image.jpg`,
              description: 'Practical Calculators. Clear Answers.',
            },
            {
              '@type': 'WebSite',
              '@id': `${baseUrl}/#website`,
              name: 'Numeriq',
              url: `${baseUrl}/`,
              description: homeDesc,
              inLanguage: ['en-US', 'en-GB', 'en-CA', 'en-AU'],
              publisher: { '@id': `${baseUrl}/#organization` },
              potentialAction: {
                '@type': 'SearchAction',
                target: `${baseUrl}/calculators?q={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            },
          ]
        : undefined,
      bodyHtml: `
        <div class="max-w-5xl mx-auto px-4 py-10 space-y-10">
          <header class="py-10 border-b border-slate-200 text-center space-y-4">
            <h1 class="text-4xl font-extrabold text-slate-900">Numeriq – Practical Calculators. Clear Answers.</h1>
            <p class="text-base text-slate-600 max-w-2xl mx-auto">Access ${allCalcs.length} curated, double-precision online calculators across ${allCategories.length} domains — backed by published 2026 regulatory formulas, step-by-step worked examples, and ${allPosts.length} educational guides.</p>
            <div class="flex flex-wrap justify-center gap-3 pt-2">
              <a href="/calculators" class="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium">Browse All ${allCalcs.length} Calculators</a>
              <a href="/categories" class="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg font-medium">Explore ${allCategories.length} Categories</a>
              <a href="/blog" class="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg font-medium">Read ${allPosts.length} Knowledge Guides</a>
            </div>
          </header>

          <section class="space-y-4">
            <h2 class="text-2xl font-bold text-slate-900">Popular Online Calculators</h2>
            <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              ${fallbackTop
                .map(
                  (c) => `<li class="p-4 rounded-xl border border-slate-200 bg-white"><a href="/calculator/${c.slug}" class="font-bold text-slate-900 block">${escapeHtml(c.name)}</a><p class="text-xs text-slate-600 mt-1">${escapeHtml(c.description)}</p></li>`
                )
                .join('\n')}
            </ul>
          </section>

          <section class="space-y-4">
            <h2 class="text-2xl font-bold text-slate-900">All ${allCategories.length} Calculator Domains</h2>
            <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              ${allCategories
                .map(
                  (cat) => `<li class="p-4 rounded-xl border border-slate-200 bg-white"><a href="/category/${cat.slug}" class="font-bold text-slate-900 block">${escapeHtml(cat.name)} (${cat.calculator_count})</a><p class="text-xs text-slate-600 mt-1">${escapeHtml(cat.description)}</p></li>`
                )
                .join('\n')}
            </ul>
          </section>

          <section class="space-y-4">
            <h2 class="text-2xl font-bold text-slate-900">Featured Knowledge Hub Guides</h2>
            <ul class="grid grid-cols-1 md:grid-cols-3 gap-4">
              ${allPosts
                .slice(0, 6)
                .map(
                  (p) => `<li class="p-4 rounded-xl border border-slate-200 bg-white"><a href="/guide/${p.slug}" class="font-bold text-slate-900 block">${escapeHtml(p.title)}</a><p class="text-xs text-slate-600 mt-1">${escapeHtml(p.excerpt)}</p></li>`
                )
                .join('\n')}
            </ul>
          </section>

          ${STATIC_TRUST_FOOTER_HTML}
        </div>
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

  // Rich Directory Pages (/calculators, /categories, /blog)
  {
    const calcSectionsHtml = allCategories
      .map((cat) => {
        const items = allCalcs.filter((c) => c.category_slug === cat.slug);
        return `
          <section class="space-y-3">
            <h2 class="text-xl font-bold text-slate-900 border-b border-slate-200 pb-2"><a href="/category/${cat.slug}" class="hover:text-teal-700">${escapeHtml(cat.name)} (${items.length})</a></h2>
            <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              ${items
                .map(
                  (c) => `<li class="p-3 rounded-xl border border-slate-200 bg-white"><a href="/calculator/${c.slug}" class="font-semibold text-sm text-slate-900 block">${escapeHtml(c.name)}</a><p class="text-xs text-slate-500 mt-1">${escapeHtml(c.description)}</p></li>`
                )
                .join('\n')}
            </ul>
          </section>
        `;
      })
      .join('\n');

    const directoryHtml = renderHtml(templateHtml, {
      title: `All ${allCalcs.length} Online Calculators Directory – Numeriq`,
      description: `Browse our curated directory of ${allCalcs.length} free verified online calculators for mortgage, loans, tax, math, statistics, unit conversions, and health.`,
      canonicalPath: '/calculators',
      schema: baseUrl
        ? [
            {
              '@type': 'CollectionPage',
              '@id': `${baseUrl}/calculators`,
              name: `All ${allCalcs.length} Online Calculators Directory`,
              url: `${baseUrl}/calculators`,
            },
          ]
        : undefined,
      bodyHtml: `
        <div class="max-w-5xl mx-auto px-4 py-10 space-y-8">
          <nav class="text-xs text-slate-500"><a href="/">Home</a> / <span class="font-semibold text-slate-800">All Calculators</span></nav>
          <header>
            <h1 class="text-3xl font-extrabold text-slate-900">All Online Calculators Directory (${allCalcs.length} Tools)</h1>
            <p class="text-slate-600 mt-2">Explore every verified double-precision calculator on Numeriq organized across ${allCategories.length} domains.</p>
          </header>
          <div class="space-y-8">${calcSectionsHtml}</div>
          ${STATIC_TRUST_FOOTER_HTML}
        </div>
      `,
    });
    writePage('calculators', directoryHtml);
    countCore++;
  }

  {
    const categoriesHtml = renderHtml(templateHtml, {
      title: `All ${allCategories.length} Calculator Categories – Numeriq`,
      description: `Explore ${allCategories.length} focused domains covering finance, business tax, algebra, statistics, geometry, health, science, and unit conversions.`,
      canonicalPath: '/categories',
      schema: baseUrl
        ? [
            {
              '@type': 'CollectionPage',
              '@id': `${baseUrl}/categories`,
              name: `All ${allCategories.length} Calculator Categories`,
              url: `${baseUrl}/categories`,
            },
          ]
        : undefined,
      bodyHtml: `
        <div class="max-w-5xl mx-auto px-4 py-10 space-y-8">
          <nav class="text-xs text-slate-500"><a href="/">Home</a> / <span class="font-semibold text-slate-800">Categories</span></nav>
          <header>
            <h1 class="text-3xl font-extrabold text-slate-900">All ${allCategories.length} Computational Categories</h1>
            <p class="text-slate-600 mt-2">Browse ${allCalcs.length} double-precision calculators grouped by mathematical, financial, scientific, and everyday utility discipline.</p>
          </header>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${allCategories
              .map((cat) => {
                const topTools = allCalcs.filter((c) => c.category_slug === cat.slug).slice(0, 4);
                return `
                  <li class="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <a href="/category/${cat.slug}" class="text-lg font-bold text-slate-900 block">${escapeHtml(cat.name)} (${cat.calculator_count} tools)</a>
                    <p class="text-xs text-slate-600">${escapeHtml(cat.description)}</p>
                    <div class="pt-2 flex flex-wrap gap-2 text-xs">
                      ${topTools.map((t) => `<a href="/calculator/${t.slug}" class="text-teal-700 underline">${escapeHtml(t.name)}</a>`).join(' · ')}
                    </div>
                  </li>
                `;
              })
              .join('\n')}
          </ul>
          ${STATIC_TRUST_FOOTER_HTML}
        </div>
      `,
    });
    writePage('categories', categoriesHtml);
    countCore++;
  }

  {
    const blogHtml = renderHtml(templateHtml, {
      title: `Knowledge Hub – ${allPosts.length} Calculation Guides & Formulas | Numeriq`,
      description: `Understand the mathematics, scientific formulas, and 2026 financial frameworks behind Numeriq calculators with ${allPosts.length} step-by-step guides.`,
      canonicalPath: '/blog',
      schema: baseUrl
        ? [
            {
              '@type': 'CollectionPage',
              '@id': `${baseUrl}/blog`,
              name: `Numeriq Knowledge Hub (${allPosts.length} Guides)`,
              url: `${baseUrl}/blog`,
            },
          ]
        : undefined,
      bodyHtml: `
        <div class="max-w-5xl mx-auto px-4 py-10 space-y-8">
          <nav class="text-xs text-slate-500"><a href="/">Home</a> / <span class="font-semibold text-slate-800">Knowledge Hub</span></nav>
          <header>
            <h1 class="text-3xl font-extrabold text-slate-900">Numeriq Knowledge Hub (${allPosts.length} Guides)</h1>
            <p class="text-slate-600 mt-2">In-depth tutorials, worked examples, tax schedules, and mathematical explanations paired directly with Numeriq calculators.</p>
          </header>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${allPosts
              .map(
                (p) => `
                  <li class="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <span class="text-xs font-semibold text-emerald-700 uppercase">${escapeHtml(p.categories)} · ${p.read_time} min read</span>
                    <a href="/guide/${p.slug}" class="text-lg font-bold text-slate-900 block">${escapeHtml(p.title)}</a>
                    <p class="text-xs text-slate-600">${escapeHtml(p.excerpt)}</p>
                  </li>
                `
              )
              .join('\n')}
          </ul>
          ${STATIC_TRUST_FOOTER_HTML}
        </div>
      `,
    });
    writePage('blog', blogHtml);
    countCore++;
  }

  // Full Static Legal & Editorial Trust Pages (Mandatory for AdSense, Google & Bing E-E-A-T)
  const legalPages = [
    {
      path: 'about',
      title: 'About & Editorial Standards – Numeriq',
      desc: 'Learn about Numeriq editorial principles, 2026 regulatory benchmarks, double-precision formulas, and multi-stage verification methodology.',
      heading: 'About Numeriq & Our Mathematical Editorial Standards',
      contentHtml: `
        <div class="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p><strong>Numeriq</strong> was created to connect published mathematical, financial, clinical, and scientific equations with everyday decision-making—offering ${allCalcs.length} client-side calculators with transparent equations, worked examples, and ${allPosts.length} explanatory guides.</p>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">1. Published Regulatory &amp; Scientific Equations</h2>
            <p>Financial, tax, retirement, clinical, and engineering calculators implement primary published standards including IRS Revenue Procedure 2025-32 and IRS Notice 2025-67 (2026 brackets, $16,100/$32,200 standard deductions, $24,500 401(k) and $7,500 IRA limits), HMRC 2026–27 allowances, CRA 2026 RRSP/TFSA rules, ATO FY 2026–27 Superannuation thresholds, CDC/WHO health standards, and NIST/CODATA physical constants.</p>
          </section>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">2. Independent Multi-Stage Verification</h2>
            <ul class="list-disc pl-5 space-y-1.5">
              <li><strong>Primary Source Grounding:</strong> Every regulatory rule and physical constant is documented with its effective date and authoritative institutional link.</li>
              <li><strong>Independent Arithmetic Checks:</strong> Worked examples explicitly declare compounding frequency, payment timing, and intermediate rounding steps.</li>
              <li><strong>Boundary &amp; Edge-Case Guards:</strong> All calculators validate zero divisors, negative domains, empty inputs, and extreme magnitudes cleanly without NaN or Infinity leaks.</li>
              <li><strong>Client-Side Privacy:</strong> Computations execute strictly in your browser using IEEE 754 double-precision JavaScript arithmetic without transmitting entered numbers to external servers.</li>
            </ul>
          </section>
          <p>Questions or formula corrections? Reach our team via the <a href="/contact" class="text-indigo-600 underline font-medium">Contact &amp; Formula Feedback page</a>, or review our <a href="/disclaimer" class="text-indigo-600 underline font-medium">Statutory Disclaimers</a>.</p>
        </div>
      `,
    },
    {
      path: 'privacy',
      title: 'Privacy Policy – Numeriq (GDPR & CCPA Compliant)',
      desc: 'Numeriq privacy policy: client-side calculation privacy, local browser storage, Google AdSense advertising cookies, GDPR, CCPA, and PIPEDA rights.',
      heading: 'Privacy Policy (GDPR, UK GDPR & CCPA Compliant)',
      contentHtml: `
        <div class="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p class="text-xs font-mono text-slate-500">Last Updated: November 20, 2026</p>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">1. Client-Side Calculation Privacy</h2>
            <p><strong>Numeriq</strong> executes all calculator computations directly inside your browser. Financial figures, tax salaries, health measurements, and dates entered into tools are never stored on or transmitted to an application database.</p>
          </section>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">2. First-Party Browser Storage</h2>
            <p>Numeriq uses non-personal browser <code>localStorage</code> keys strictly to remember optional UI preferences such as light/dark theme (<code>calc_theme</code>), bookmarked tools/articles (<code>calc_saved_calcs</code>, <code>calc_saved_posts</code>), and local usage sorting (<code>numeriq_calc_usage</code>), which you can clear anytime.</p>
          </section>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">3. Advertising, Cookies &amp; Third-Party Disclosures</h2>
            <p>When display advertising (such as Google AdSense) is active following domain approval and regional consent verification, third-party vendors including Google may use cookies to serve ads based on prior visits. Visitors may review Google's advertising technology practices and opt out of personalized ads via <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline">Google Ads Policies</a>.</p>
          </section>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">4. International Privacy Rights (GDPR, CCPA/CPRA, PIPEDA)</h2>
            <p>Numeriq does not sell personal data. Visitors in the EEA, UK, California and other US states, Canada, Australia, and New Zealand retain full consent, access, and opt-out controls. Contact us anytime through our <a href="/contact" class="text-indigo-600 underline font-medium">Contact page</a>.</p>
          </section>
        </div>
      `,
    },
    {
      path: 'terms',
      title: 'Terms of Service & Usage Agreement – Numeriq',
      desc: 'Terms of service and mathematical calculation guidelines for Numeriq online tools, educational guides, intellectual property, and warranties.',
      heading: 'Terms of Service & Mathematical Usage Agreement',
      contentHtml: `
        <div class="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p class="text-xs font-mono text-slate-500">Effective Date: November 20, 2026</p>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">1. Acceptance of Terms</h2>
            <p>By accessing and using the interactive calculators, formulas, and Knowledge Hub guides published on <strong>Numeriq</strong>, you agree to be bound by these Terms of Service and applicable laws.</p>
          </section>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">2. Educational Use License &amp; Intellectual Property</h2>
            <p>You are granted permission to use Numeriq tools and guides for personal, academic, and analytical evaluation. Automated scraping, mirroring, or commercial redistribution of compiled specifications and editorial libraries without written authorization is prohibited.</p>
          </section>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">3. Disclaimer of Warranties &amp; Limitation of Liability</h2>
            <p>All calculators and reference articles are provided on an "as is" basis for educational planning. Numeriq disclaims liability for financial, medical, structural, or commercial outcomes arising from reliance on unverified estimates. Always confirm contractual, tax, and clinical decisions with qualified professionals.</p>
          </section>
        </div>
      `,
    },
    {
      path: 'disclaimer',
      title: 'Mathematical, Financial & Medical Disclaimers – Numeriq',
      desc: 'Statutory disclaimers for financial estimates, 2026 tax models, medical formulas (BMI, TDEE, pregnancy), and engineering calculators on Numeriq.',
      heading: 'Statutory Financial, Medical & Engineering Disclaimers',
      contentHtml: `
        <div class="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p class="text-xs font-mono text-slate-500">Last Updated: November 20, 2026</p>
          <section class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <h2 class="text-base font-bold mb-1">General Educational Notice</h2>
            <p class="text-xs">All interactive calculators and educational guides on Numeriq are provided solely for informational and planning illustration. Nothing on Numeriq constitutes licensed financial, tax, legal, medical, or structural engineering advice.</p>
          </section>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">1. Financial, Tax &amp; Investment Estimates</h2>
            <p>Mortgage, loan, retirement, compounding, and tax models depend on user assumptions and statutory snapshots (such as 2026 IRS, HMRC, CRA, and ATO schedules). Consult a Certified Public Accountant (CPA) or Certified Financial Planner (CFP) before signing binding agreements or filing returns.</p>
          </section>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">2. Health, Nutrition &amp; Clinical Calculators</h2>
            <p>BMI, TDEE, body fat, heart rate, clinical scoring, and due date tools reflect broad demographic equations and do not diagnose medical conditions or replace licensed care from a physician (MD) or registered dietitian (RD).</p>
          </section>
          <section class="space-y-2">
            <h2 class="text-xl font-bold text-slate-900">3. Engineering, Construction &amp; Energy Estimators</h2>
            <p>Concrete volume, lumber, HVAC, electrical, and solar sizing outputs are preliminary approximations and never substitute for local municipal building codes or stamped Professional Engineer (PE) blueprints.</p>
          </section>
        </div>
      `,
    },
    {
      path: 'contact',
      title: 'Contact Numeriq Support & Formula Editorial Team',
      desc: 'Contact Numeriq editorial and quantitative engineering team to report mathematical edge cases, formula questions, or compliance inquiries.',
      heading: 'Contact Numeriq Editorial & Support Team',
      contentHtml: `
        <div class="space-y-6 text-sm text-slate-700 leading-relaxed">
          <p>We welcome formula verification notes, boundary-case bug reports, accessibility feedback, and editorial inquiries across any of our ${allCalcs.length} calculators and ${allPosts.length} Knowledge Hub guides.</p>
          <section class="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <h2 class="text-lg font-bold text-slate-900">How to Prepare a Formula or Content Report</h2>
            <ul class="list-disc pl-5 space-y-1.5">
              <li>Include the exact calculator or guide URL path (for example, <code>/calculator/mortgage-calculator</code>).</li>
              <li>List every entered input value, dropdown option, and unit selection used.</li>
              <li>State the displayed output alongside your expected analytical figure and primary source reference.</li>
            </ul>
            <p class="text-xs text-slate-500 pt-2">This interactive workspace operates client-side without collecting form submissions on external servers. Use the interactive summary formatter on this page to copy a structured report cleanly.</p>
          </section>
        </div>
      `,
    },
  ];

  for (const page of legalPages) {
    const pageHtml = renderHtml(templateHtml, {
      title: page.title,
      description: page.desc,
      canonicalPath: `/${page.path}`,
      schema: baseUrl
        ? [
            {
              '@type': 'WebPage',
              '@id': `${baseUrl}/${page.path}`,
              name: page.heading,
              description: page.desc,
              url: `${baseUrl}/${page.path}`,
              inLanguage: 'en-US',
            },
          ]
        : undefined,
      bodyHtml: `
        <article class="max-w-4xl mx-auto px-4 py-12 space-y-6">
          <nav class="text-xs text-slate-500"><a href="/">Home</a> / <span class="font-semibold text-slate-800">${escapeHtml(page.heading)}</span></nav>
          <header class="border-b border-slate-200 pb-4">
            <h1 class="text-3xl font-extrabold text-slate-900">${escapeHtml(page.heading)}</h1>
            <p class="text-slate-600 mt-2">${escapeHtml(page.desc)}</p>
          </header>
          ${page.contentHtml}
          ${STATIC_TRUST_FOOTER_HTML}
        </article>
      `,
    });
    writePage(page.path, pageHtml);
    countCore++;
  }

  // Saved page (noindex utility workspace)
  {
    const savedHtml = renderHtml(templateHtml, {
      title: 'Saved Calculators & Bookmarked Guides – Numeriq',
      description: 'Access your bookmarked formulas, saved calculation tools, and favorite editorial guides in one private browser workspace.',
      canonicalPath: '/saved',
      isNoindex: true,
      bodyHtml: `
        <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
          <nav class="text-xs text-slate-500"><a href="/">Home</a> / <span class="font-semibold text-slate-800">Saved Workspace</span></nav>
          <h1 class="text-3xl font-extrabold text-slate-900">Your Saved Calculators &amp; Workspace</h1>
          <p class="text-slate-600">Bookmarked calculators and Knowledge Hub guides are stored privately inside your browser's local storage.</p>
          <div class="flex gap-3">
            <a href="/calculators" class="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium">Browse Calculators</a>
            <a href="/blog" class="px-4 py-2 bg-slate-100 text-slate-800 rounded-lg text-sm font-medium">Explore Guides</a>
          </div>
          ${STATIC_TRUST_FOOTER_HTML}
        </div>
      `,
    });
    writePage('saved', savedHtml);
    countCore++;
  }

  // Side-by-Side Compare workspace (noindex utility route)
  {
    const compareHtml = renderHtml(templateHtml, {
      title: 'Side-by-Side Calculator Comparison – Numeriq',
      description: 'Compare any two Numeriq calculators in a live split-pane layout, including Loan vs. Savings and Mortgage vs. Investing.',
      canonicalPath: '/compare',
      isNoindex: true,
      bodyHtml: `
        <div class="max-w-4xl mx-auto px-4 py-12 space-y-6">
          <nav class="text-xs text-slate-500"><a href="/">Home</a> / <span class="font-semibold text-slate-800">Side-by-Side Compare</span></nav>
          <h1 class="text-3xl font-extrabold text-slate-900">Side-by-Side Calculator Comparison</h1>
          <p class="text-slate-600">Select two calculators to run in a split-pane layout and compare results in real time.</p>
          <div class="flex gap-3">
            <a href="/calculator/loan-calculator" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">Loan Calculator</a>
            <a href="/calculator/savings-goal-calculator" class="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium">Savings Goal Calculator</a>
          </div>
          ${STATIC_TRUST_FOOTER_HTML}
        </div>
      `,
    });
    writePage('compare', compareHtml);
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
        <div class="max-w-5xl mx-auto px-4 py-10 space-y-6">
          <nav class="text-xs text-slate-500">
            <a href="/">Home</a> / <a href="/categories">Categories</a> / <span class="font-semibold text-slate-800">${escapeHtml(cat.name)}</span>
          </nav>
          <div>
            <span class="text-xs font-semibold text-teal-600 uppercase tracking-wider">${cat.icon || '🔢'} Category Directory</span>
            <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${escapeHtml(cat.name)} Calculators</h1>
            <p class="text-slate-600 mt-2 max-w-2xl">${escapeHtml(cat.description)} (${catCalcs.length} verified calculators available).</p>
          </div>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${calcsListHtml}
          </ul>
          ${STATIC_TRUST_FOOTER_HTML}
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

    const calcTitle = getCalculatorSeoTitle(calc);
    const calcDesc = calc.meta_description || calc.description;
    const canonicalPath = `/calculator/${calc.slug}`;
    const fullUrl = baseUrl ? `${baseUrl}${canonicalPath}` : '';

    const cat =
      allCategories.find((c) => c.slug === calc.category_slug) || { name: calc.category_slug, slug: calc.category_slug };

    const siblingCalcs = allCalcs
      .filter((c) => c.category_slug === calc.category_slug && c.slug !== calc.slug)
      .slice(0, 6);
    const relatedGuides = getRelatedPostsForCalculator(calc.slug).slice(0, 3);

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
          editorial.countryContext
            ? `
          <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
            <h3 class="font-bold text-slate-900 uppercase tracking-wider">Regional Standards &amp; Units</h3>
            <p class="text-slate-600">${escapeHtml(editorial.countryContext.summary)}</p>
            <ul class="space-y-1.5">
              ${editorial.countryContext.markets
                .map(
                  (m: any) =>
                    `<li><strong>${escapeHtml(m.region)}:</strong> ${escapeHtml(m.standard)}${m.unitsOrCurrency ? ` (${escapeHtml(m.unitsOrCurrency)})` : ''}${m.effectiveDate ? ` [${escapeHtml(m.effectiveDate)}]` : ''}</li>`
                )
                .join('\n')}
            </ul>
          </div>
        `
            : ''
        }

        ${formatCommonMistakes(editorial.commonMistakes)}

        ${
          Array.isArray(editorial.references) && editorial.references.length > 0
            ? `
          <div class="p-4 bg-white border border-slate-200 rounded-xl text-xs space-y-2">
            <h3 class="font-bold text-slate-900 uppercase tracking-wider">Authoritative Sources &amp; References</h3>
            <ul class="list-disc pl-4 space-y-1.5 text-slate-700">
              ${editorial.references
                .map(
                  (r: any) =>
                    `<li><a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 underline font-semibold">${escapeHtml(r.name)}</a> — ${escapeHtml(r.organization)}${r.effectiveDate ? ` (${escapeHtml(r.effectiveDate)})` : ''}: ${escapeHtml(r.note)}</li>`
                )
                .join('\n')}
            </ul>
          </div>
        `
            : ''
        }

        <div class="p-5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <h3 class="font-bold text-slate-900 uppercase tracking-wider">Methodology, Verification &amp; Limitations</h3>
            <span class="font-mono text-slate-500">Verified: ${escapeHtml(editorial.eeat?.lastVerifiedDate || editorial.editorialReview?.reviewDate || '2026-11-20')}${editorial.eeat?.taxOrRegulationYear ? ` · ${escapeHtml(editorial.eeat.taxOrRegulationYear)}` : ''}</span>
          </div>
          <p class="text-slate-700"><strong>${escapeHtml(editorial.eeat?.authorRole || editorial.editorialReview?.reviewedBy || 'Numeriq Editorial Team')}</strong>${editorial.eeat?.reviewerRole ? ` · Reviewed by ${escapeHtml(editorial.eeat.reviewerRole)}` : ''}</p>
          <p class="text-slate-600">${escapeHtml(editorial.eeat?.methodology || editorial.editorialReview?.accuracyStandard || '')}</p>
          ${
            Array.isArray(editorial.eeat?.limitations) && editorial.eeat.limitations.length > 0
              ? `<ul class="list-disc pl-4 space-y-1 text-slate-600">${editorial.eeat.limitations.map((l: string) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`
              : ''
          }
          <p class="text-slate-500 pt-1 border-t border-slate-200"><strong>Non-Advice Notice:</strong> ${escapeHtml(editorial.eeat?.nonAdviceDisclaimer || 'Outputs are provided strictly for educational and planning illustration; consult a licensed advisor for individualized financial, tax, or legal advice.')} · <a href="/about" class="text-indigo-600 underline">Editorial Standards</a> · <a href="/disclaimer" class="text-indigo-600 underline">Disclaimers</a></p>
        </div>
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

    const internalLinksHtml = `
      <section class="mt-8 border-t border-slate-200 pt-6 space-y-4">
        ${
          siblingCalcs.length > 0
            ? `
          <div>
            <h3 class="text-base font-bold text-slate-900 mb-2">More ${escapeHtml(cat.name)} Tools</h3>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              ${siblingCalcs
                .map(
                  (s) => `<li><a href="/calculator/${s.slug}" class="text-indigo-700 font-medium hover:underline">${escapeHtml(s.name)}</a></li>`
                )
                .join('\n')}
            </ul>
          </div>
        `
            : ''
        }
        ${
          relatedGuides.length > 0
            ? `
          <div>
            <h3 class="text-base font-bold text-slate-900 mb-2">Related Knowledge Hub Guides</h3>
            <ul class="space-y-1 text-xs">
              ${relatedGuides
                .map(
                  (g) => `<li><a href="/guide/${g.slug}" class="text-teal-700 font-medium hover:underline">${escapeHtml(g.title)}</a></li>`
                )
                .join('\n')}
            </ul>
          </div>
        `
            : ''
        }
      </section>
    `;

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
            dateModified: editorial?.eeat?.lastVerifiedDate || '2026-11-20',
            author: { '@type': 'Organization', name: editorial?.eeat?.authorRole || 'Numeriq Editorial Team' },
            publisher: { '@type': 'Organization', name: 'Numeriq', url: `${baseUrl}/` },
            publishingPrinciples: `${baseUrl}/about`,
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
          ${internalLinksHtml}
          ${STATIC_TRUST_FOOTER_HTML}
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
    const postTitle = getGuideSeoTitle(post);
    const postDesc = post.meta_description || post.excerpt;
    const canonicalPath = `/guide/${post.slug}`;
    const fullUrl = baseUrl ? `${baseUrl}${canonicalPath}` : '';

    const contentHtml = markdownToHtml(post.content);
    const relatedCalc = getRelatedCalculatorForPost(post.slug);
    const updatedDate = String(post.updated_at || post.published_at || post.created_at || '2026-11-20').split('T')[0];

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
              image: `${baseUrl}/og-image.jpg`,
              inLanguage: 'en-US',
              author: { '@type': 'Organization', name: post.author || 'Numeriq Editorial Team' },
              publisher: {
                '@type': 'Organization',
                name: 'Numeriq',
                url: `${baseUrl}/`,
                logo: { '@type': 'ImageObject', url: `${baseUrl}/favicon.svg` },
              },
              datePublished: post.published_at || post.created_at || '2024-11-15T10:00:00Z',
              dateModified: post.updated_at || post.published_at || post.created_at || '2026-11-20T10:00:00Z',
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
        <article class="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <nav class="text-xs text-slate-500">
            <a href="/">Home</a> / <a href="/blog">Knowledge Hub</a> / <span class="font-semibold text-slate-800">${escapeHtml(post.title)}</span>
          </nav>

          <header class="border-b border-slate-200 pb-5">
            <span class="text-xs font-semibold text-emerald-600 uppercase tracking-wider">${escapeHtml(post.categories || 'Guide')} · ${post.read_time || 5} min read</span>
            <h1 class="text-3xl font-extrabold text-slate-900 mt-1">${escapeHtml(post.title)}</h1>
            <p class="text-slate-600 text-base mt-2 leading-relaxed">${escapeHtml(post.excerpt)}</p>
            <div class="mt-3 text-xs text-slate-500">By ${escapeHtml(post.author || 'Numeriq Editorial Team')} · Updated ${escapeHtml(updatedDate)}</div>
          </header>

          ${
            relatedCalc
              ? `
            <div class="p-4 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-between gap-4">
              <div>
                <span class="text-[11px] font-bold uppercase text-indigo-700 block">Interactive Companion Tool</span>
                <a href="/calculator/${relatedCalc.slug}" class="text-sm font-bold text-slate-900 underline">${escapeHtml(relatedCalc.name)}</a>
              </div>
              <a href="/calculator/${relatedCalc.slug}" class="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold">Launch Tool</a>
            </div>
          `
              : ''
          }

          <div class="prose prose-slate max-w-none text-slate-800 leading-relaxed">
            ${contentHtml}
          </div>

          <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            <strong>Editorial &amp; Informational Notice:</strong> Published by Numeriq Editorial Team for educational illustration. Confirm individualized financial, tax, engineering, or health decisions with a qualified professional. <a href="/about" class="text-indigo-600 underline">Editorial Standards</a> · <a href="/disclaimer" class="text-indigo-600 underline">Disclaimers</a> · <a href="/privacy" class="text-indigo-600 underline">Privacy Policy</a>
          </div>

          ${STATIC_TRUST_FOOTER_HTML}
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
