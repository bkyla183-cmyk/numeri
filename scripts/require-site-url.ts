import { resolveSiteUrl } from './siteUrl.ts';

try {
  const url = resolveSiteUrl(true);
  console.log(`✅ Verified production SITE_URL: ${url}`);
} catch (err: any) {
  console.error(`\n❌ PRODUCTION BUILD ABORTED: ${err.message}\n`);
  process.exit(1);
}
