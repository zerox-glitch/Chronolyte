/**
 * API smoke test — runs the real Vercel-style handler (api/[...slug].js)
 * on plain node:http and asserts the routes that broke in production:
 * multi-segment /api/* paths (login, blog detail, dashboard stats).
 *
 * Usage: npm run smoke
 * Uses the local JSON store (no DATABASE_URL needed).
 */
import http from 'node:http';
import handler from '../api/[...slug].js';

const port = process.env.SMOKE_PORT || 8899;
const base = `http://127.0.0.1:${port}`;

const server = http.createServer((req, res) => {
  handler(req, res).catch((err) => {
    console.error('handler crashed:', err);
    if (!res.headersSent) { res.writeHead(500); res.end('crash'); }
  });
});

await new Promise((resolve) => server.listen(port, '127.0.0.1', resolve));

async function req(method, path, body = null) {
  const res = await fetch(base + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch {}
  return { status: res.status, ct: res.headers.get('content-type') || '', json, text };
}

const cases = [
  ['GET  /api/diag', () => req('GET', '/api/diag'), (r) => r.status === 200 && r.json?.success === true],
  ['GET  /api/health', () => req('GET', '/api/health'), (r) => r.status === 200 && r.json?.success === true],
  ['GET  /api/auth (root)', () => req('GET', '/api/auth'), (r) => r.status === 404 && r.ct.includes('json')],
  ['GET  /api/auth/login (2 segments)', () => req('GET', '/api/auth/login'), (r) => r.status === 404 && r.ct.includes('json')],
  ['POST /api/auth/login (2 segments, bad creds)', () => req('POST', '/api/auth/login', { username: 'admin', password: 'wrong-password' }), (r) => r.status === 401 && r.ct.includes('json')],
  ['POST /api/auth/login (2 segments, valid seed creds)', () => req('POST', '/api/auth/login', { username: 'admin', password: 'admin123' }), (r) => r.status === 200 && Boolean(r.json?.data?.token)],
  ['GET  /api/blogs/1001 (2 segments)', () => req('GET', '/api/blogs/1001'), (r) => (r.status === 200 || r.status === 404) && r.ct.includes('json')],
  ['GET  /api/stats/dashboard (2 segments, unauth)', () => req('GET', '/api/stats/dashboard'), (r) => r.status === 401 && r.ct.includes('json')],
  ['POST /api/leads (public lead, 2 segments)', () => req('POST', '/api/leads', { name: 'Smoke Test', email: 'smoke@test.local', message: 'ping' }), (r) => r.status === 201 && r.ct.includes('json')]
];

let failed = 0;
for (const [name, run, expect] of cases) {
  let ok = false;
  let note = '';
  try {
    const r = await run();
    ok = expect(r);
    if (!ok) note = ` → got status=${r.status} ct=${r.ct} body=${r.text.slice(0, 160)}`;
  } catch (err) {
    note = ` → threw: ${err.message}`;
  }
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${note}`);
  if (!ok) failed++;
}

server.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
