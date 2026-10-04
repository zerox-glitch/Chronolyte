/**
 * Chronolyte local/production Node server.
 * - Serves the built SPA from dist/ with per-route SEO injection
 * - Serves uploaded files from data/uploads/
 * - Delegates /api/* (and legacy /backend/api/*) to the shared router
 *
 * Uses Neon Postgres when DATABASE_URL is set; otherwise a JSON file store.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStore } from '../api/_lib/store.js';
import { handleApi } from '../api/_lib/router.js';
import { seoHeaders, noIndexHtml } from '../seo/engine.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const DATA_DIR = path.join(ROOT, 'data');
const PORT = parseInt(process.env.PORT || '8787', 10);
const HOST = process.env.HOST || '0.0.0.0';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip'
};

fs.mkdirSync(DATA_DIR, { recursive: true });

const store = await createStore();
const { initStore } = await import('../api/_lib/router.js');
await initStore(store);
console.log(`[server] store: ${store.kind}`);

const indexHtmlCache = { html: null, mtime: 0 };
function getIndexHtml() {
  const file = path.join(DIST, 'index.html');
  try {
    const stat = fs.statSync(file);
    if (!indexHtmlCache.html || stat.mtimeMs !== indexHtmlCache.mtime) {
      indexHtmlCache.html = fs.readFileSync(file, 'utf8');
      indexHtmlCache.mtime = stat.mtimeMs;
    }
  } catch {
    return null;
  }
  return indexHtmlCache.html;
}

function send(res, status, body, headers = {}) {
  const isBuffer = Buffer.isBuffer(body);
  res.writeHead(status, {
    'Content-Length': isBuffer ? body.length : Buffer.byteLength(body),
    ...headers
  });
  res.end(body);
}

/** Normalize legacy paths: /backend/api/foo.php and /api/foo.php -> /api/foo */
function normalizePathname(pathname) {
  if (pathname.startsWith('/backend/api/')) {
    return '/api/' + pathname.slice('/backend/api/'.length).replace(/\.php$/, '');
  }
  if (pathname.startsWith('/api/') && pathname.endsWith('.php')) {
    return '/api/' + pathname.slice('/api/'.length).replace(/\.php$/, '');
  }
  return pathname;
}

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  let pathname = '/';
  try {
    const u = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    pathname = decodeURIComponent(u.pathname);
    if (pathname.includes('..')) return send(res, 400, 'Bad request');

    // ---------- API ----------
    const apiPath = normalizePathname(pathname);
    if (apiPath === '/api' || apiPath.startsWith('/api/')) {
      try {
        const handled = await handleApi({ req, res, method: req.method || 'GET', pathname: apiPath, url: u, store });
        if (!handled) {
          res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
        }
      } catch (err) {
        console.error('[api] error on', req.method, apiPath, err);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ success: false, error: 'Internal server error' }));
        } else {
          res.end();
        }
      }
      if (process.env.LOG_REQUESTS !== '0') {
        console.log(`${req.method} ${pathname} -> ${res.statusCode} ${Date.now() - started}ms`);
      }
      return;
    }

    // ---------- Uploaded files ----------
    if (pathname.startsWith('/uploads/')) {
      const safe = path.normalize(pathname).replace(/^(\.\.[/\\])+/, '');
      const file = path.join(DATA_DIR, safe);
      if (!file.startsWith(path.join(DATA_DIR, 'uploads'))) return send(res, 403, 'Forbidden');
      if (fs.existsSync(file) && fs.statSync(file).isFile()) {
        const ext = path.extname(file).toLowerCase();
        return send(res, 200, fs.readFileSync(file), {
          'Content-Type': MIME[ext] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable'
        });
      }
      return send(res, 404, 'Not found');
    }

    // ---------- Static assets from dist ----------
    const staticPath = path.join(DIST, pathname);
    if (pathname !== '/' && fs.existsSync(staticPath) && fs.statSync(staticPath).isFile()) {
      const ext = path.extname(staticPath).toLowerCase();
      const isHtml = ext === '.html';
      return send(res, 200, fs.readFileSync(staticPath), {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': isHtml ? 'no-cache' : 'public, max-age=86400'
      });
    }

    // ---------- SPA with SEO injection ----------
    const html = getIndexHtml();
    if (!html) {
      return send(res, 503, '<h1>Chronolyte</h1><p>Frontend build missing. Run: npm run build</p>', {
        'Content-Type': 'text/html; charset=utf-8'
      });
    }

    // Blog routes get per-post SEO (title, Article JSON-LD, crawlable content)
    if (pathname === '/blog' || pathname.startsWith('/blog/')) {
      const handled = await handleApi({ req, res, method: 'GET', pathname: '/api/page' + pathname, url: u, store });
      if (handled) return;
    }

    if (pathname === '/admin' || pathname.startsWith('/admin/')) {
      return send(res, 200, noIndexHtml(html), {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow'
      });
    }

    const { html: out, headers } = seoHeaders(html, pathname, req.headers.host);
    send(res, 200, out, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache',
      ...headers
    });
  } catch (err) {
    console.error('[server] error', req.method, pathname, err);
    if (!res.headersSent) send(res, 500, 'Internal server error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Chronolyte server running at http://${HOST}:${PORT}`);
  console.log(`  - Site:        http://localhost:${PORT}/`);
  console.log(`  - Admin panel: http://localhost:${PORT}/admin  (default login: admin / admin123)`);
  console.log(`  - API health:  http://localhost:${PORT}/api/health`);
});
