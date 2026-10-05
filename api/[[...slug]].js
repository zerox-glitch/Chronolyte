/**
 * Chronolyte API — Vercel serverless function entry (catch-all).
 *
 * Env vars:
 *   DATABASE_URL     (required in production) — Neon Postgres connection string
 *   ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_EMAIL — seeded on first run
 *   SITE_URL         — canonical site origin for SEO (default https://chronolyte.com)
 *
 * Without DATABASE_URL the function runs in local mode using a JSON file store.
 */

import { createNeonStore } from './_lib/store-neon.js';
import { createJsonStore } from './_lib/store-json.js';
import { handleApi } from './_lib/router.js';

function pickStore() {
  if (process.env.DATABASE_URL) {
    return createNeonStore(process.env.DATABASE_URL);
  }
  // Local/dev fallback — data persisted to /tmp (serverless) or ./data (local)
  const dataDir = process.env.VERCEL ? '/tmp/chronolyte-data' : new URL('../../data/', import.meta.url).pathname;
  return createJsonStore(dataDir);
}

const store = pickStore();
let initError = null;
const storeReady = (async () => {
  try {
    const { initStore } = await import('./_lib/router.js');
    await initStore(store);
  } catch (err) {
    initError = err;
    console.error('[api] store init failed:', err);
  }
})();

export default async function handler(req, res) {
  await storeReady;

  // Normalize legacy /backend/api/foo.php -> /api/foo (belt & suspenders with vercel.json rewrites)
  let pathname = req.url.split('?')[0];
  try {
    pathname = decodeURIComponent(pathname);
  } catch {}
  if (pathname.startsWith('/backend/api/')) {
    pathname = '/api/' + pathname.slice('/backend/api/'.length).replace(/\.php$/, '');
  } else if (pathname.startsWith('/api/') && pathname.endsWith('.php')) {
    pathname = '/api/' + pathname.slice('/api/'.length).replace(/\.php$/, '');
  }

  // Self-diagnosis: if store init (migration/seed) failed, the health + diag
  // endpoints still answer with JSON explaining why, so the admin login screen
  // and /api/diag show the real cause instead of a blank 500. Other endpoints
  // fall through and retry init via handleApi().
  if (initError && (pathname === '/api/health' || pathname === '/api/diag')) {
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({
      success: false,
      error: 'Store initialization failed (database unreachable or seed error) — check DATABASE_URL and the function logs',
      detail: String((initError && initError.message) || initError)
    }));
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  try {
    const handled = await handleApi({
      req,
      res,
      method: req.method || 'GET',
      pathname,
      url,
      store
    });
    if (!handled) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
    }
  } catch (err) {
    console.error('[api] error:', req.method, pathname, err);
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
    } else {
      res.end();
    }
  }
}
