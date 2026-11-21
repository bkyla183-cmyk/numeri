import http from 'http';

interface TestSpec {
  urlPath: string;
  desc: string;
  expectedStatus: number;
  bodyCheck?: (body: string, headers: http.IncomingHttpHeaders) => boolean;
}

const tests: TestSpec[] = [
  { urlPath: '/', desc: 'Homepage', expectedStatus: 200 },
  {
    urlPath: '/calculator/mortgage-calculator',
    desc: 'Existing Calculator Direct URL',
    expectedStatus: 200,
    bodyCheck: (body) => body.includes('WebApplication') && !body.includes('FAQPage'),
  },
  { urlPath: '/guide/how-to-calculate-bmi-complete-guide', desc: 'Existing Guide Direct URL', expectedStatus: 200 },
  { urlPath: '/category/finance', desc: 'Existing Category Direct URL', expectedStatus: 200 },
  { urlPath: '/calculators', desc: 'Calculators Directory Direct URL', expectedStatus: 200 },
  { urlPath: '/categories', desc: 'Categories Directory Direct URL', expectedStatus: 200 },
  { urlPath: '/blog', desc: 'Knowledge Hub Direct URL', expectedStatus: 200 },
  { urlPath: '/about', desc: 'About Editorial Direct URL', expectedStatus: 200 },
  { urlPath: '/privacy', desc: 'Privacy Policy Direct URL', expectedStatus: 200 },
  {
    urlPath: '/saved',
    desc: 'Saved Bookmarks Direct URL (noindex)',
    expectedStatus: 200,
    bodyCheck: (body) => body.includes('<meta name="robots" content="noindex, follow" />') && !body.includes('<link rel="canonical"'),
  },
  { urlPath: '/calculator/mortgage-calculator/', desc: 'Trailing Slash Route (CleanURL redirect test)', expectedStatus: 301 },
  { urlPath: '/post/how-to-calculate-bmi-complete-guide', desc: 'Legacy /post/ Route (301 Redirect to /guide/)', expectedStatus: 301 },
  { urlPath: '/calculator/fake-ghost-calc-99999', desc: 'Nonexistent Calculator Slug', expectedStatus: 404 },
  { urlPath: '/totally-random-nonexistent-path', desc: 'Random Nonexistent Path', expectedStatus: 404 },
  { urlPath: '/assets/missing-asset-image.png', desc: 'Missing Image Asset', expectedStatus: 404 },
  { urlPath: '/assets/missing-script.js', desc: 'Missing Script Asset', expectedStatus: 404 },
  { urlPath: '/favicon.svg', desc: 'Brand Favicon SVG', expectedStatus: 200 },
  { urlPath: '/sitemap.xml', desc: 'XML Sitemap File', expectedStatus: 200 },
  { urlPath: '/robots.txt', desc: 'Robots.txt File', expectedStatus: 200 },
];

function queryEmulator(port: number, urlPath: string): Promise<{ status: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    http
      .get(`http://127.0.0.1:${port}${urlPath}`, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: data,
          });
        });
      })
      .on('error', reject);
  });
}

async function run() {
  console.log('================================================================');
  console.log('🔥 REAL FIREBASE HOSTING EMULATOR AUDIT (Port 5000)');
  console.log('================================================================\n');

  console.log('| # | Test Target | Path | Expected | Actual Status | Content-Type | Relevant Headers | Result |');
  console.log('|---|---|---|---|---|---|---|---|');

  let passed = 0;

  for (let i = 0; i < tests.length; i++) {
    const t = tests[i];
    try {
      const res = await queryEmulator(5000, t.urlPath);
      const statusPass = res.status === t.expectedStatus;
      const bodyPass = t.bodyCheck ? t.bodyCheck(res.body, res.headers) : true;
      const isPass = statusPass && bodyPass;
      if (isPass) passed++;

      const cType = (res.headers['content-type'] || 'none').split(';')[0];
      const headersList: string[] = [];
      if (res.headers['cache-control']) headersList.push(`cache: ${res.headers['cache-control']}`);
      if (res.headers['x-robots-tag']) headersList.push(`robots: ${res.headers['x-robots-tag']}`);
      if (res.headers['location']) headersList.push(`loc: ${res.headers['location']}`);

      const headersStr = headersList.slice(0, 2).join(' | ');

      console.log(`| ${i + 1} | ${t.desc} | \`${t.urlPath}\` | ${t.expectedStatus} | **${res.status}** | \`${cType}\` | ${headersStr} | ${isPass ? '✅ PASS' : '❌ FAIL'} |`);
    } catch (err: any) {
      console.log(`| ${i + 1} | ${t.desc} | \`${t.urlPath}\` | ${t.expectedStatus} | ERROR | \`${err.message}\` | - | ❌ FAIL |`);
    }
  }

  console.log(`\n================================================================`);
  console.log(`📊 Firebase Hosting Emulator Verification: ${passed} / ${tests.length} PASSED`);
  console.log(`================================================================\n`);

  if (passed !== tests.length) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
