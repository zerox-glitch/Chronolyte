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

let submittedLeadId = null;

const cases = [
  ['GET  /api/diag', () => req('GET', '/api/diag'), (r) => r.status === 200 && r.json?.success === true],
  ['GET  /api/health', () => req('GET', '/api/health'), (r) => r.status === 200 && r.json?.success === true],
  ['GET  /api/auth (root)', () => req('GET', '/api/auth'), (r) => r.status === 404 && r.ct.includes('json')],
  ['GET  /api/auth/login (2 segments)', () => req('GET', '/api/auth/login'), (r) => r.status === 404 && r.ct.includes('json')],
  ['POST /api/auth/login (2 segments, bad creds)', () => req('POST', '/api/auth/login', { username: 'admin', password: 'wrong-password' }), (r) => r.status === 401 && r.ct.includes('json')],
  ['POST /api/auth/login (2 segments, valid seed creds)', () => req('POST', '/api/auth/login', { username: 'admin', password: 'admin123' }), (r) => r.status === 200 && Boolean(r.json?.data?.token)],
  ['GET  /api/blogs/1001 (2 segments)', () => req('GET', '/api/blogs/1001'), (r) => (r.status === 200 || r.status === 404) && r.ct.includes('json')],
  ['GET  /api/stats/dashboard (2 segments, unauth)', () => req('GET', '/api/stats/dashboard'), (r) => r.status === 401 && r.ct.includes('json')],
  ['POST /api/leads (public lead, 2 segments)', () => req('POST', '/api/leads', { name: 'Smoke Test', email: 'smoke@test.local', message: 'ping' }), (r) => {
    submittedLeadId = r.json?.data?.id ?? null;
    return r.status === 201 && r.ct.includes('json') && submittedLeadId !== null;
  }],

  // --- vercel.json rewrite funnel: every multi-segment path arrives at the
  // literal /api/handler target with the original path in ?__orig (+ ?__ns). ---
  ['GET  /api/handler?__orig=auth/login (funnel)', () => req('GET', '/api/handler?__orig=auth/login'), (r) => r.status === 404 && r.ct.includes('json') && /Unknown auth endpoint/.test(r.text)],
  ['POST /api/handler?__orig=auth/login (funnel, valid seed creds)', () => req('POST', '/api/handler?__orig=auth/login', { username: 'admin', password: 'admin123' }), (r) => r.status === 200 && Boolean(r.json?.data?.token)],
  ['GET  /api/handler?__orig=blogs/1001 (funnel)', () => req('GET', '/api/handler?__orig=blogs/1001'), (r) => r.status === 200 && r.json?.success === true],
  ['GET  /api/handler?__orig=stats/dashboard (funnel, unauth)', () => req('GET', '/api/handler?__orig=stats/dashboard'), (r) => r.status === 401 && r.ct.includes('json')],
  ['GET  /api/handler?__orig=settings.php&action=get (legacy .php funnel)', () => req('GET', '/api/handler?__orig=settings.php&action=get&key=site_settings'), (r) => r.status === 200 && r.ct.includes('json')],
  ['GET  /api/handler?__ns=page/blog&__orig=<slug> (funnel, SEO html)', () => req('GET', '/api/handler?__ns=page/blog&__orig=how-much-does-a-website-cost'), (r) => r.status === 200 && r.ct.includes('text/html')],
  ['GET  /api/handler (funnel, root)', () => req('GET', '/api/handler'), (r) => r.status === 200 && r.json?.success === true]
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

// A public submission must be readable by the authenticated admin list, not
// merely return a success response to the form.
try {
  const login = await req('POST', '/api/auth/login', { username: 'admin', password: 'admin123' });
  const token = login.json?.data?.token;
  const list = token
    ? await req('GET', `/api/leads?limit=500&token=${encodeURIComponent(token)}`)
    : null;
  const visibleLead = list?.json?.data?.leads?.find((lead) => String(lead.id) === String(submittedLeadId));
  const flowOk = Boolean(token && list?.status === 200 && visibleLead?.email === 'smoke@test.local');
  console.log(`${flowOk ? 'PASS' : 'FAIL'}  lead submission is visible in the authenticated admin list${flowOk ? '' : ` → got status=${list?.status ?? 'no list'} lead=${Boolean(visibleLead)}`}`);
  if (!flowOk) failed++;
} catch (err) {
  console.log(`FAIL  lead submission is visible in the authenticated admin list → threw: ${err.message}`);
  failed++;
}

// Verify a Vercel deployment cannot falsely acknowledge a lead when it has
// fallen back to the per-instance JSON store. Local development remains valid.
const originalVercel = process.env.VERCEL;
try {
  const diag = await req('GET', '/api/diag');
  if (diag.json?.data?.store === 'json') {
    let deployDiag;
    let blocked;
    try {
      process.env.VERCEL = '1';
      deployDiag = await req('GET', '/api/diag');
      blocked = await req('POST', '/api/leads', { name: 'Ephemeral Test', email: 'ephemeral@test.local' });
    } finally {
      if (originalVercel === undefined) delete process.env.VERCEL;
      else process.env.VERCEL = originalVercel;
    }
    const guardOk = deployDiag.json?.data?.lead_storage_ready === false &&
      blocked.status === 503 && /DATABASE_URL/.test(blocked.json?.error || '');
    console.log(`${guardOk ? 'PASS' : 'FAIL'}  Vercel does not acknowledge leads in temporary JSON storage${guardOk ? '' : ` → got status=${blocked.status} body=${blocked.text.slice(0, 160)}`}`);
    if (!guardOk) failed++;
  } else {
    console.log('SKIP  Vercel JSON-store guard (this smoke run uses a persistent database)');
  }
} catch (err) {
  if (originalVercel === undefined) delete process.env.VERCEL;
  else process.env.VERCEL = originalVercel;
  console.log(`FAIL  Vercel JSON-store guard → threw: ${err.message}`);
  failed++;
}

server.close();
console.log(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
