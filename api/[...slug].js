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
import { handleApi, initStore } from './_lib/router.js';

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
    await initStore(store);
  } catch (err) {
    initError = err;
    console.error('[api] store init failed:', err);
  }
})();

// Flatten an error's cause chain: undici and Neon hide the real reason one or
// two levels down (ECONNREFUSED / ENOTFOUND / UND_ERR_CONNECT_TIMEOUT surface
// only as a bare "fetch failed" otherwise). Neon's HTTP driver uses
// `.sourceError` rather than the standard `.cause`, so follow both.
function errDetail(e) {
  let d = String((e && e.message) || e);
  let c = e && (e.cause || e.sourceError);
  let i = 0;
  while (c && i++ < 3) {
    const m = String((c && c.message) || c);
    const code = c && (c.code || c.errno);
    d += ' -> ' + m + (code ? ` [${code}]` : '');
    c = c.cause || c.sourceError;
  }
  return d;
}

export default async function handler(req, res) {
  await storeReady;

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Reconstruct the original path when reached via a vercel.json rewrite.
  // Vercel's api-directory router only matches ONE segment per bracket file,
  // so every multi-segment request is funnelled to the literal /api/handler
  // target; the captured path arrives as the auto-appended `__orig` query
  // param (with `__ns` carrying any namespace prefix from the rewrite dest).
  let pathname = url.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {}
  if (pathname === '/api/handler' || pathname === '/api/handler/') {
    const ns = (url.searchParams.get('__ns') || '').replace(/^\/+|\/+$/g, '');
    const orig = (url.searchParams.get('__orig') || '').replace(/^\/+/, '');
    pathname = ns
      ? `/api/${ns}${orig ? '/' + orig : ''}`
      : (orig ? `/api/${orig}` : '/api');
  }
  url.searchParams.delete('__orig');
  url.searchParams.delete('__ns');

  // Normalize legacy /backend/api/foo.php -> /api/foo (belt & suspenders with vercel.json rewrites)
  if (pathname.startsWith('/backend/api/')) {
    pathname = '/api/' + pathname.slice('/backend/api/'.length).replace(/\.php$/, '');
  } else if (pathname.startsWith('/api/') && pathname.endsWith('.php')) {
    pathname = '/api/' + pathname.slice('/api/'.length).replace(/\.php$/, '');
  }

  // Self-diagnosis: if store init (migration/seed) failed, the health + diag
  // endpoints still answer with JSON explaining why, so the admin login screen
  // and /api/diag show the real cause instead of a blank 500. Other endpoints
  // fall through and retry init via handleApi().
  // The module-scope init above runs during cold start, where Vercel's
  // outbound network is not reliably up yet — Neon's HTTP driver then fails
  // with a bare "fetch failed". Retry once inside the request, which is
  // exactly what handleApi() already does for every other endpoint (and why
  // data routes answered fine while /api/health and /api/diag reported 503).
  if (initError) {
    try {
      await initStore(store);
      initError = null;
    } catch (err) {
      initError = err;
    }
  }

  if (initError && (pathname === '/api/health' || pathname === '/api/diag')) {
    res.writeHead(503, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({
      success: false,
      error: 'Store initialization failed (database unreachable or seed error) — check DATABASE_URL and the function logs',
      detail: errDetail(initError),
      runtime_commit: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || null
    }));
    return;
  }

  // Keep `url` consistent with the resolved pathname: handleAuth() (and any
  // other downstream consumer) reads url.pathname, which would still say
  // "/api/handler" after a rewrite funnel.
  if (url.pathname !== pathname) {
    try { url.pathname = pathname; } catch {}
  }

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
