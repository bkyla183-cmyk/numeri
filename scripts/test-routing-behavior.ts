import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.resolve(rootDir, 'dist');

console.log('================================================================');
console.log('🌐 NUMERIQ ROUTING & 404 HTTP BEHAVIOR AUDIT');
console.log('================================================================\n');

function startTestServer(isSpaRewriteEnabled: boolean, port: number): Promise<http.Server> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const urlPath = (req.url || '/').split('?')[0].split('#')[0];

      let targetFile: string | null = null;
      if (urlPath === '/' || urlPath === '') {
        targetFile = path.join(distDir, 'index.html');
      } else {
        const p1 = path.join(distDir, urlPath, 'index.html');
        const p2 = path.join(distDir, `${urlPath}.html`);
        const p3 = path.join(distDir, urlPath);
        if (fs.existsSync(p1) && fs.statSync(p1).isFile()) targetFile = p1;
        else if (fs.existsSync(p2) && fs.statSync(p2).isFile()) targetFile = p2;
        else if (fs.existsSync(p3) && fs.statSync(p3).isFile()) targetFile = p3;
      }

      if (targetFile && fs.existsSync(targetFile)) {
        res.statusCode = 200;
        if (targetFile.endsWith('.html')) res.setHeader('Content-Type', 'text/html; charset=utf-8');
        else if (targetFile.endsWith('.xml')) res.setHeader('Content-Type', 'application/xml');
        else if (targetFile.endsWith('.txt')) res.setHeader('Content-Type', 'text/plain');
        else res.setHeader('Content-Type', 'application/octet-stream');
        res.end(fs.readFileSync(targetFile));
        return;
      }

      if (isSpaRewriteEnabled) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Simulated-Routing', 'Static-SPA-Fallback-To-Index');
        res.end(fs.readFileSync(path.join(distDir, 'index.html')));
      } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('X-Robots-Tag', 'noindex, follow');
        res.setHeader('X-Simulated-Routing', 'Native-Static-404');
        const errPage = path.join(distDir, '404.html');
        if (fs.existsSync(errPage)) {
          res.end(fs.readFileSync(errPage));
        } else {
          res.end('<h1>404 Not Found</h1>');
        }
      }
    });

    server.listen(port, () => resolve(server));
  });
}

async function request(port: number, urlPath: string): Promise<{ status: number; contentType: string; routing: string }> {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:${port}${urlPath}`, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          contentType: res.headers['content-type'] || '',
          routing: (res.headers['x-simulated-routing'] as string) || 'Direct-File-Match',
        });
      });
    }).on('error', reject);
  });
}

async function run() {
  const testRoutes = [
    { path: '/', desc: 'Homepage' },
    { path: '/calculator/mortgage-calculator', desc: 'Existing Calculator' },
    { path: '/calculator/scientific-calculator', desc: 'Scientific Calculator' },
    { path: '/guide/how-to-calculate-bmi-complete-guide', desc: 'Existing Editorial Guide' },
    { path: '/category/finance', desc: 'Existing Category' },
    { path: '/calculator/fake-ghost-calc-99999', desc: 'Nonexistent Calculator Slug' },
    { path: '/totally-random-nonexistent-path', desc: 'Random Nonexistent Path' },
    { path: '/assets/nonexistent-image.png', desc: 'Missing Static Asset' },
  ];

  console.log('--- PURE STATIC MODE (GitHub Pages serves prerendered pages cleanly and dist/404.html on unknown routes) ---');
  const serverStatic = await startTestServer(false, 5002);
  let failures = 0;
  for (const r of testRoutes) {
    const res = await request(5002, r.path);
    const expect404 = r.path.includes('fake-ghost') || r.path.includes('nonexistent');
    if ((expect404 && res.status !== 404) || (!expect404 && res.status !== 200)) failures++;
    console.log(`[Static Mode] ${r.desc.padEnd(28)} -> Status: ${res.status} | Routing: ${res.routing}`);
  }
  serverStatic.close();

  if (failures > 0) process.exit(1);
}

run().catch(console.error);
