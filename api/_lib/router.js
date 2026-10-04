/**
 * Chronolyte API router — framework-neutral core.
 * Called by api/[[...slug]].js (Vercel) and server/index.js (local).
 *
 * Supports both URL styles:
 *   /api/leads            (clean REST)
 *   /backend/api/leads.php (legacy alias — normalized by the callers)
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  readJson, readBody, parseMultipart, parseCookies, randomToken,
  nowIso, isValidEmail, sanitizeText, clientIp, rateLimit
} from './util.js';
import { seedStore } from './seed.js';
import { routeMeta, injectSeo, noIndexHtml, organizationLd, websiteLd, faqLd, breadcrumbsLd, blogPostingLd, itemListLd, serviceLd, stripHtml } from '../../seo/engine.js';

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
let initPromise = null;

export async function initStore(store) {
  if (!initPromise) {
    initPromise = (async () => {
      await store.init();
      await seedStore(store);
    })().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  return initPromise;
}

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------
function ok(res, data = null, extra = {}) {
  return res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    .end(JSON.stringify({ success: true, data, ...extra }));
}
function okMsg(res, message, data = null) {
  return res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    .end(JSON.stringify({ success: true, message, data }));
}
function created(res, message, data = null) {
  return res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    .end(JSON.stringify({ success: true, message, data }));
}
function fail(res, status, error) {
  return res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    .end(JSON.stringify({ success: false, error }));
}
function failMsg(res, status, message) {
  return res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    .end(JSON.stringify({ success: false, message }));
}
function pageParam(url) { return Math.max(1, parseInt(url.searchParams.get('page') || '1', 10) || 1); }
function limitParam(url, def = 50, max = 500) { return Math.min(max, Math.max(1, parseInt(url.searchParams.get('limit') || String(def), 10) || def)); }
function refNumber(prefix, id) { return `${prefix}-${new Date().getFullYear()}-${String(id).padStart(4, '0')}`; }
function publicAdmin(a) {
  return { id: a.id, username: a.username, email: a.email, role: a.role, avatar: a.avatar || undefined, active: a.active };
}

// ---------------------------------------------------------------------------
// Auth context
// ---------------------------------------------------------------------------
async function getAdmin(req, url, store) {
  let token = null;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) token = authHeader.slice(7).trim();
  if (!token) token = url.searchParams.get('token');
  if (!token) token = parseCookies(req)['chronolyte_admin'];
  if (!token) return null;
  const session = await store.sessions.find(token);
  if (!session) return null;
  return store.admins.byId(session.admin_id);
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------
export async function handleApi({ req, res, method, pathname, url, store }) {
  await initStore(store);

  const admin = await getAdmin(req, url, store);

  // ---------------- Health / root ----------------
  if (pathname === '/api/health') {
    return ok(res, { status: 'ok', timestamp: nowIso(), store: store.kind, environment: process.env.NODE_ENV || 'development' });
  }
  // Public one-click diagnostic for deployment troubleshooting (no sensitive values).
  if (pathname === '/api/diag') {
    const admins = await store.admins.list().catch(() => []);
    const envUser = (process.env.ADMIN_USERNAME || '').trim();
    return ok(res, {
      store: store.kind,
      database_url_set: Boolean(process.env.DATABASE_URL),
      runtime_commit: process.env.VERCEL_GIT_COMMIT_SHA ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7) : null,
      env_admin_set: Boolean(envUser && process.env.ADMIN_PASSWORD),
      env_admin_username: envUser || null,
      admins_in_db: admins.length,
      admin_usernames: admins.map((a) => a.username),
      env_admin_in_db: Boolean(envUser) && admins.some((a) => String(a.username).toLowerCase() === envUser.toLowerCase())
    });
  }
  if (pathname === '/api' || pathname === '/api/') {
    return ok(res, {
      name: 'Chronolyte API', version: '1.0', store: store.kind,
      endpoints: ['/auth', '/leads', '/project-requests', '/blogs', '/projects', '/pricing', '/testimonials', '/settings', '/faqs', '/pages', '/snippets', '/services', '/upload', '/stats/dashboard', '/page/...']
    });
  }

  // ---------------- SEO HTML renderer (blog posts + any SPA route on Vercel) ----------------
  if (pathname.startsWith('/api/page/')) {
    return serveSeoPage({ req, res, url, store, pathname });
  }

  // ---------------- Uploaded file streaming (Vercel rewrite target) ----------------
  if (pathname.startsWith('/api/files/')) {
    const rel = pathname.slice('/api/files/'.length);
    const [category, ...rest] = rel.split('/');
    const filename = rest.join('/');
    const found = await store.files.get(category, filename);
    if (!found) return fail(res, 404, 'File not found');
    const ext = path.extname(filename).toLowerCase();
    const types = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.avif': 'image/avif', '.mp4': 'video/mp4', '.webm': 'video/webm', '.mov': 'video/quicktime', '.pdf': 'application/pdf', '.ico': 'image/x-icon' };
    res.writeHead(200, {
      'Content-Type': types[ext] || 'application/octet-stream',
      'Content-Length': found.buffer.length,
      'Cache-Control': 'public, max-age=31536000, immutable'
    });
    return res.end(found.buffer);
  }

  // ---------------- AUTH ----------------
  if (pathname === '/api/auth' || pathname.startsWith('/api/auth/')) {
    return handleAuth({ req, res, method, url, store, admin });
  }

  // ---------------- LEADS ----------------
  if (pathname === '/api/leads' || pathname === '/api/leads/export' || pathname.startsWith('/api/leads/')) {
    return handleLeads({ req, res, method, url, store, admin, pathname });
  }

  // ---------------- PROJECT REQUESTS ----------------
  if (pathname === '/api/project-requests') {
    return handleProjectRequests({ req, res, method, url, store, admin });
  }

  // ---------------- SETTINGS (+ admin users) ----------------
  if (pathname === '/api/settings' || pathname.startsWith('/api/settings/')) {
    return handleSettings({ req, res, method, url, store, admin, pathname });
  }

  // ---------------- FAQS ----------------
  if (pathname === '/api/faqs' || pathname.startsWith('/api/faqs/')) {
    return handleCollection({ req, res, method, url, store, admin, pathname, kind: 'faqs', singular: 'FAQ', publicRead: true, publicFilter: (f) => Number(f.active) === 1 });
  }

  // ---------------- SNIPPETS ----------------
  if (pathname === '/api/snippets' || pathname.startsWith('/api/snippets/')) {
    return handleCollection({ req, res, method, url, store, admin, pathname, kind: 'snippets', singular: 'Snippet', publicRead: false });
  }

  // ---------------- SERVICES ----------------
  if (pathname === '/api/services' || pathname.startsWith('/api/services/')) {
    return handleCollection({ req, res, method, url, store, admin, pathname, kind: 'services', singular: 'Service', publicRead: true });
  }

  // ---------------- PAGES ----------------
  if (pathname === '/api/pages' || pathname.startsWith('/api/pages/')) {
    return handlePages({ req, res, method, url, store, admin, pathname });
  }

  // ---------------- PRICING ----------------
  if (pathname === '/api/pricing' || pathname.startsWith('/api/pricing/')) {
    return handlePricing({ req, res, method, url, store, admin, pathname });
  }

  // ---------------- BLOGS ----------------
  if (pathname === '/api/blogs' || pathname.startsWith('/api/blogs/')) {
    return handleBlogs({ req, res, method, url, store, admin, pathname });
  }

  // ---------------- PROJECTS ----------------
  if (pathname === '/api/projects' || pathname.startsWith('/api/projects/')) {
    return handleProjects({ req, res, method, url, store, admin, pathname });
  }

  // ---------------- PROJECT VIDEOS ----------------
  if (pathname === '/api/project-videos' || pathname.startsWith('/api/project-videos/')) {
    return handleProjectVideos({ req, res, method, url, store, admin, pathname });
  }

  // ---------------- TESTIMONIALS ----------------
  if (pathname === '/api/testimonials' || pathname.startsWith('/api/testimonials/')) {
    return handleTestimonials({ req, res, method, url, store, admin, pathname });
  }

  // ---------------- UPLOADS ----------------
  if (pathname === '/api/upload' || pathname.startsWith('/api/upload/')) {
    return handleUpload({ req, res, method, url, store, admin, pathname });
  }

  // ---------------- FORM SETTINGS ----------------
  if (pathname === '/api/form-settings') {
    return handleFormSettings({ req, res, method, url, store, admin });
  }

  // ---------------- PADDLE ----------------
  if (pathname === '/api/paddle') {
    const action = url.searchParams.get('action');
    if (action === 'config') {
      return ok(res, { configured: !!process.env.PADDLE_API_KEY, environment: process.env.PADDLE_ENVIRONMENT || 'sandbox', message: process.env.PADDLE_API_KEY ? 'Paddle configured.' : 'Paddle is not configured yet. Set PADDLE_API_KEY to enable payment links.' });
    }
    if (action === 'generate-link') {
      return failMsg(res, 400, 'Paddle is not configured. Set PADDLE_API_KEY in the environment to generate payment links.');
    }
    if (action === 'webhook') return ok(res, { received: true });
    return failMsg(res, 400, 'Unknown paddle action');
  }

  // ---------------- STATS ----------------
  if (pathname === '/api/stats/dashboard') {
    if (!admin) return fail(res, 401, 'Unauthorized');
    const stats = await dashboardStats(store);
    return ok(res, stats);
  }

  return false;
}

// ---------------------------------------------------------------------------
// AUTH
// ---------------------------------------------------------------------------
async function handleAuth({ req, res, method, url, store, admin }) {
  const action = url.searchParams.get('action');
  const sub = url.pathname.replace(/^\/api\/auth\/?/, '');
  const isLogin = action === 'login' || sub === 'login' || (!action && !sub && method === 'POST' && url.pathname === '/api/auth');

  if (method === 'POST' && isLogin) {
    const body = await readJson(req);
    const username = String(body.username || body.email || '').trim();
    const password = String(body.password || '');
    if (!username || !password) return fail(res, 400, 'Username and password are required');
    if (!rateLimit(`login:${clientIp(req)}`, 12, 60_000)) return fail(res, 429, 'Too many login attempts. Try again in a minute.');

    const user = await store.admins.byLogin(username);
    if (!user || !store.verifyPassword(password, user.password)) {
      return fail(res, 401, 'Invalid username or password');
    }
    if (!String(user.password).startsWith('pbkdf2$')) {
      await store.admins.update(user.id, { password: store.hashPassword(password) });
    }
    const token = randomToken(32);
    await store.sessions.create({ token, admin_id: user.id, expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString() });
    await store.activity.add({ user_name: user.username, action: 'signed in to the admin panel', type: 'auth' });
    const pub = publicAdmin(user);
    return ok(res, { token, user: pub, admin: pub });
  }

  if (method === 'POST' && (action === 'logout' || sub === 'logout')) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : url.searchParams.get('token');
    if (token) await store.sessions.remove(token);
    return okMsg(res, 'Logged out');
  }

  if (method === 'GET' && (action === 'verify' || sub === 'me' || sub === 'verify')) {
    if (!admin) return fail(res, 401, 'Unauthorized');
    return ok(res, { valid: true, user: publicAdmin(admin), admin: publicAdmin(admin) });
  }

  if (method === 'PUT' && (action === 'password' || sub === 'password')) {
    if (!admin) return fail(res, 401, 'Unauthorized');
    const body = await readJson(req);
    if (!store.verifyPassword(String(body.currentPassword || body.current_password || ''), admin.password)) {
      return fail(res, 400, 'Current password is incorrect');
    }
    const next = String(body.newPassword || body.new_password || '');
    if (next.length < 6) return fail(res, 400, 'New password must be at least 6 characters');
    await store.admins.update(admin.id, { password: store.hashPassword(next) });
    await store.activity.add({ user_name: admin.username, action: 'changed their password', type: 'auth' });
    return okMsg(res, 'Password updated successfully');
  }

  return failMsg(res, 404, 'Unknown auth endpoint');
}

// ---------------------------------------------------------------------------
// LEADS
// ---------------------------------------------------------------------------
async function handleLeads({ req, res, method, url, store, admin, pathname }) {
  const idFromPath = /^\/api\/leads\/([^/]+)$/.exec(pathname);
  const id = idFromPath ? idFromPath[1] : url.searchParams.get('id');

  // --- Public lead capture (homepage starter, contact form, schedule call) ---
  if (method === 'POST' && !id) {
    const body = await readJson(req);
    if (String(body.website || '').trim() !== '') {
      return created(res, 'Thank you! Your request has been received.', { id: 0 });
    }
    const ip = clientIp(req);
    if (!rateLimit(`lead:${ip}`, 8, 60_000)) {
      return fail(res, 429, 'Too many submissions. Please try again shortly.');
    }
    const name = sanitizeText(body.name, 120)?.trim();
    const email = sanitizeText(body.email, 200)?.trim();
    if (!name || !email) return fail(res, 400, 'Name and email are required');
    if (!isValidEmail(email)) return fail(res, 400, 'Please enter a valid email address');

    const lead = {
      id: await store.counters.next('lead'),
      reference_number: null,
      name,
      email,
      phone: sanitizeText(body.phone, 40) || null,
      company: sanitizeText(body.company, 160) || null,
      service_interested: sanitizeText(body.service_interested, 400) || null,
      budget: sanitizeText(body.budget, 80) || null,
      timeline: sanitizeText(body.timeline, 80) || null,
      status: 'new',
      priority: 'medium',
      source: sanitizeText(body.source, 60) || 'website',
      notes: sanitizeText(body.notes, 5000) || null,
      message: sanitizeText(body.message, 5000) || null,
      meta: body.meta && typeof body.meta === 'object' ? body.meta : null,
      expected_value: Number(body.expected_value) || null,
      follow_up_date: null,
      assigned_to: null,
      ip_address: ip,
      user_agent: sanitizeText(req.headers['user-agent'], 300) || null,
      created_at: nowIso(),
      updated_at: nowIso()
    };
    lead.reference_number = refNumber('LD', lead.id);
    await store.leads.insert(lead);
    await store.activity.add({
      user_name: 'Website',
      action: `New lead captured: ${name}`,
      details: `${lead.service_interested || 'General inquiry'} — via ${lead.source}`,
      type: 'lead'
    });
    return created(res, 'Lead created successfully. We will contact you soon!', { id: lead.id, reference_number: lead.reference_number });
  }

  // --- Everything below requires admin ---
  if (!admin) return fail(res, 401, 'Unauthorized');

  // --- CSV export ---
  if (pathname === '/api/leads/export' || url.searchParams.get('action') === 'export') {
    const all = await store.leads.all();
    const cols = ['id', 'reference_number', 'name', 'email', 'phone', 'company', 'service_interested', 'budget', 'timeline', 'status', 'priority', 'source', 'notes', 'created_at'];
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const csv = cols.join(',') + '\n' + all.map((l) => cols.map((c) => esc(l[c])).join(',')).join('\n');
    res.writeHead(200, {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="chronolyte-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'Cache-Control': 'no-store'
    });
    return res.end(csv);
  }

  if (method === 'GET' && id) {
    const lead = await store.leads.get(id);
    if (!lead) return fail(res, 404, 'Lead not found');
    return ok(res, lead);
  }

  if (method === 'GET') {
    const result = await store.leads.list({
      status: url.searchParams.get('status'),
      priority: url.searchParams.get('priority'),
      source: url.searchParams.get('source'),
      search: url.searchParams.get('search'),
      page: pageParam(url),
      limit: limitParam(url, 50)
    });
    return res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }).end(JSON.stringify({
      success: true,
      data: { leads: result.items, total: result.total },
      pagination: { page: pageParam(url), limit: limitParam(url, 50), total: result.total, pages: Math.max(1, Math.ceil(result.total / limitParam(url, 50))) }
    }));
  }

  if (method === 'PUT' && id) {
    const lead = await store.leads.get(id);
    if (!lead) return fail(res, 404, 'Lead not found');
    const body = await readJson(req);
    const fields = ['name', 'email', 'phone', 'company', 'service_interested', 'budget', 'timeline', 'status', 'priority', 'notes', 'message', 'assigned_to', 'expected_value', 'follow_up_date', 'source'];
    const patch = {};
    for (const f of fields) if (f in body) patch[f] = body[f] === '' ? null : body[f];
    const updated = await store.leads.update(id, patch);
    if (patch.status && patch.status !== lead.status) {
      await store.activity.add({ user_name: admin.username, action: `moved lead ${lead.name} to "${patch.status}"`, details: lead.reference_number, type: 'lead' });
    } else if (patch.notes && patch.notes !== lead.notes) {
      await store.activity.add({ user_name: admin.username, action: `updated notes on lead ${lead.name}`, details: lead.reference_number, type: 'lead' });
    }
    return okMsg(res, 'Lead updated successfully', updated);
  }

  if (method === 'DELETE' && id) {
    const lead = await store.leads.get(id);
    if (!lead) return fail(res, 404, 'Lead not found');
    await store.leads.remove(id);
    await store.activity.add({ user_name: admin.username, action: `deleted lead ${lead.name}`, details: lead.reference_number, type: 'lead' });
    return okMsg(res, 'Lead deleted successfully');
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// PROJECT REQUESTS
// ---------------------------------------------------------------------------
async function handleProjectRequests({ req, res, method, url, store, admin }) {
  const action = url.searchParams.get('action');
  const id = url.searchParams.get('id');

  if (method === 'POST' && !id && action !== 'stats') {
    const body = await readJson(req);
    if (String(body.website || '').trim() !== '') {
      return created(res, 'Thank you! Your request has been received.', { id: 0 });
    }
    if (!rateLimit(`pr:${clientIp(req)}`, 8, 60_000)) {
      return fail(res, 429, 'Too many submissions. Please try again shortly.');
    }
    const fullName = sanitizeText(body.full_name, 120)?.trim();
    const email = sanitizeText(body.email, 200)?.trim();
    if (!fullName || !email) return failMsg(res, 400, 'Name and email are required');
    if (!isValidEmail(email)) return failMsg(res, 400, 'Please enter a valid email address');

    const request = {
      id: await store.counters.next('project_request'),
      reference_number: null,
      full_name: fullName,
      email,
      company_name: sanitizeText(body.company_name, 160) || null,
      phone: sanitizeText(body.phone, 40) || null,
      selected_package: sanitizeText(body.selected_package, 160) || null,
      budget: sanitizeText(body.budget, 80) || 'Not specified',
      timeline: sanitizeText(body.timeline, 80) || 'Flexible',
      project_description: sanitizeText(body.project_description, 5000) || '',
      must_have_features: sanitizeText(body.must_have_features, 2000) || null,
      status: 'new',
      admin_notes: null,
      rejection_reason: null,
      quoted_amount: Number(body.quoted_amount) || null,
      deposit_percentage: Number(body.deposit_percentage) || 50,
      deposit_amount: null,
      payment_status: 'not_required',
      paddle_payment_link: null,
      terms_accepted: body.terms_accepted ? 1 : 0,
      source: sanitizeText(body.source, 60) || 'pricing-page',
      created_at: nowIso(),
      updated_at: nowIso(),
      activity_log: []
    };
    request.reference_number = refNumber('PR', request.id);
    await store.records.insert('project_requests', request);
    await store.activity.add({
      user_name: 'Website',
      action: `New project request: ${fullName}`,
      details: `${request.selected_package || 'Custom'} — ${request.budget}`,
      type: 'request'
    });
    return created(res, 'Project request submitted successfully! We will review it and get back to you within 24 hours.', { id: request.id, reference_number: request.reference_number });
  }

  if (!admin) return fail(res, 401, 'Unauthorized');

  if (action === 'stats' && method === 'GET') {
    const all = await store.records.list('project_requests');
    const leads = await store.leads.all();
    const byStatus = {};
    const byPayment = {};
    const now = new Date();
    let thisMonth = 0;
    let totalRevenue = 0;
    let pendingRevenue = 0;
    for (const r of all) {
      byStatus[r.status] = (byStatus[r.status] || 0) + 1;
      byPayment[r.payment_status] = (byPayment[r.payment_status] || 0) + 1;
      const d = new Date(r.created_at);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) thisMonth += 1;
      const amount = Number(r.quoted_amount) || 0;
      if (r.payment_status === 'paid') totalRevenue += amount;
      else if (['pending_payment', 'approved'].includes(r.status) || r.payment_status === 'pending') pendingRevenue += amount;
    }
    for (const l of leads) if (l.status === 'won') totalRevenue += Number(l.expected_value) || 0;
    return ok(res, {
      total: all.length,
      by_status: byStatus,
      by_payment_status: byPayment,
      this_month: thisMonth,
      total_revenue: totalRevenue,
      pending_revenue: pendingRevenue
    });
  }

  if (method === 'GET' && id) {
    const request = (await store.records.list('project_requests')).find((r) => String(r.id) === String(id));
    if (!request) return failMsg(res, 404, 'Request not found');
    return ok(res, request);
  }

  if (method === 'GET') {
    let list = await store.records.list('project_requests');
    const status = url.searchParams.get('status');
    const search = (url.searchParams.get('search') || '').toLowerCase();
    if (status && status !== 'all') list = list.filter((r) => r.status === status);
    if (search) {
      list = list.filter((r) => [r.full_name, r.email, r.company_name, r.reference_number, r.project_description].some((v) => (v || '').toLowerCase().includes(search)));
    }
    list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return ok(res, { requests: list, total: list.length });
  }

  if (method === 'PUT' && id) {
    const request = (await store.records.list('project_requests')).find((r) => String(r.id) === String(id));
    if (!request) return failMsg(res, 404, 'Request not found');
    const body = await readJson(req);
    const fields = ['status', 'admin_notes', 'rejection_reason', 'quoted_amount', 'deposit_percentage', 'deposit_amount', 'payment_status', 'paddle_payment_link', 'selected_package', 'budget', 'timeline'];
    const changes = [];
    for (const f of fields) {
      if (f in body && body[f] !== request[f]) {
        changes.push(`${f.replace(/_/g, ' ')}: ${request[f] ?? '—'} → ${body[f] ?? '—'}`);
        request[f] = body[f];
      }
    }
    request.updated_at = nowIso();
    request.activity_log = request.activity_log || [];
    if (changes.length) {
      request.activity_log.unshift({ action: `Updated by ${admin.username}`, details: changes.join(' | '), created_at: nowIso() });
      await store.activity.add({ user_name: admin.username, action: `updated project request ${request.reference_number}`, details: changes[0] || '', type: 'request' });
    }
    await store.records.update('project_requests', id, request);
    return okMsg(res, 'Request updated successfully', request);
  }

  if (method === 'DELETE' && id) {
    const request = (await store.records.list('project_requests')).find((r) => String(r.id) === String(id));
    if (!request) return failMsg(res, 404, 'Request not found');
    await store.records.remove('project_requests', id);
    await store.activity.add({ user_name: admin.username, action: `deleted project request ${request.reference_number}`, type: 'request' });
    return okMsg(res, 'Request deleted successfully');
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// SETTINGS + ADMIN USERS
// ---------------------------------------------------------------------------
async function handleSettings({ req, res, method, url, store, admin, pathname }) {
  const action = url.searchParams.get('action');
  const keyFromPath = /^\/api\/settings\/([^/]+)$/.exec(pathname);
  const key = url.searchParams.get('key') || (keyFromPath ? keyFromPath[1] : null);

  // ----- Admin user management -----
  if (action === 'admin-users' || action === 'admin-user') {
    if (!admin) return fail(res, 401, 'Unauthorized');
    const id = url.searchParams.get('id');

    if (action === 'admin-users' && method === 'GET') {
      const users = (await store.admins.list()).map((a) => ({ ...publicAdmin(a), created_at: a.created_at }));
      return ok(res, { users });
    }
    if (action === 'admin-user' && method === 'GET' && id) {
      const user = await store.admins.byId(id);
      if (!user) return failMsg(res, 404, 'User not found');
      return ok(res, { ...publicAdmin(user), created_at: user.created_at });
    }
    if (action === 'admin-user' && (method === 'POST' || method === 'PUT')) {
      const body = await readJson(req);
      if (!id || id === 'new') {
        const username = sanitizeText(body.username, 60)?.trim();
        const email = sanitizeText(body.email, 200)?.trim();
        const password = String(body.password || '');
        if (!username || !email || !password) return failMsg(res, 400, 'Username, email, and password are required');
        if (password.length < 6) return failMsg(res, 400, 'Password must be at least 6 characters');
        if (await store.admins.byLogin(username)) return failMsg(res, 400, 'Username already exists');
        const user = await store.admins.create({
          username, email,
          password: store.hashPassword(password),
          role: ['super_admin', 'admin', 'editor'].includes(body.role) ? body.role : 'admin',
          avatar: sanitizeText(body.avatar, 500) || ''
        });
        await store.activity.add({ user_name: admin.username, action: `created admin user "${username}"`, type: 'auth' });
        return okMsg(res, 'User created successfully', publicAdmin(user));
      }
      const user = await store.admins.byId(id);
      if (!user) return failMsg(res, 404, 'User not found');
      const patch = {};
      for (const f of ['username', 'email', 'role', 'avatar']) {
        if (body[f] !== undefined && body[f] !== null && body[f] !== '') patch[f] = sanitizeText(body[f], 200);
      }
      if (body.password) {
        if (String(body.password).length < 6) return failMsg(res, 400, 'Password must be at least 6 characters');
        patch.password = store.hashPassword(String(body.password));
      }
      if (typeof body.active !== 'undefined') patch.active = Number(body.active) ? 1 : 0;
      await store.admins.update(id, patch);
      await store.activity.add({ user_name: admin.username, action: `updated admin user "${user.username}"`, type: 'auth' });
      const fresh = await store.admins.byId(id);
      return okMsg(res, 'User updated successfully', publicAdmin(fresh));
    }
    if (action === 'admin-user' && method === 'DELETE' && id) {
      if (String(admin.id) === String(id)) return failMsg(res, 400, 'You cannot delete your own account');
      if ((await store.admins.countActive()) <= 1) return failMsg(res, 400, 'Cannot delete the last active admin');
      const user = await store.admins.byId(id);
      if (!user) return failMsg(res, 404, 'User not found');
      await store.admins.remove(id);
      await store.activity.add({ user_name: admin.username, action: `removed admin user "${user.username}"`, type: 'auth' });
      return okMsg(res, 'User removed successfully');
    }
  }

  // ----- Key/value settings -----
  if (action === 'get' && method === 'GET') {
    if (!key) return failMsg(res, 400, 'Missing key parameter');
    const value = await store.settings.get(key);
    return ok(res, { key, value: value ?? null, setting_value: value ?? null });
  }

  if ((action === 'set' && method === 'POST') || (method === 'POST' && pathname === '/api/settings')) {
    if (!admin) return fail(res, 401, 'Unauthorized');
    const body = await readJson(req).catch(() => ({}));
    if (body.settings && typeof body.settings === 'object') {
      for (const [k, v] of Object.entries(body.settings)) {
        await store.settings.set(k, typeof v === 'string' ? v : JSON.stringify(v));
      }
    } else {
      const k = body.key || body.setting_key || key;
      if (!k) return failMsg(res, 400, 'Missing settings key');
      let v = body.value !== undefined ? body.value : body.setting_value;
      if (v === undefined) return failMsg(res, 400, 'Missing settings value');
      await store.settings.set(k, typeof v === 'string' ? v : JSON.stringify(v));
    }
    await store.activity.add({ user_name: admin.username, action: 'updated website settings', details: Object.keys(body.settings || body).join(', '), type: 'settings' });
    return okMsg(res, 'Settings saved successfully');
  }

  if (method === 'GET' && !key && !action) {
    if (!admin) return fail(res, 401, 'Unauthorized');
    return ok(res, await store.settings.all());
  }
  if (method === 'GET' && key && !action) {
    const value = await store.settings.get(key);
    return ok(res, { key, value: value ?? null, setting_value: value ?? null });
  }
  if (method === 'PUT' && key) {
    if (!admin) return fail(res, 401, 'Unauthorized');
    const body = await readJson(req);
    let v = body.setting_value !== undefined ? body.setting_value : body.value;
    if (v === undefined) return failMsg(res, 400, 'Missing settings value');
    await store.settings.set(key, typeof v === 'string' ? v : JSON.stringify(v));
    await store.activity.add({ user_name: admin.username, action: `updated setting "${key}"`, type: 'settings' });
    return okMsg(res, 'Setting saved');
  }
  if (method === 'DELETE' && key) {
    if (!admin) return fail(res, 401, 'Unauthorized');
    await store.settings.delete(key);
    return okMsg(res, 'Setting deleted');
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// GENERIC COLLECTIONS (faqs, snippets, services)
// ---------------------------------------------------------------------------
async function handleCollection({ req, res, method, url, store, admin, pathname, kind, singular, publicRead = false, publicFilter = null }) {
  const action = url.searchParams.get('action');
  const idFromPath = new RegExp(`^/api/${kind}/([^/]+)$`).exec(pathname);
  const id = url.searchParams.get('id') || (idFromPath ? idFromPath[1] : null);

  if (method === 'GET' && (action === 'list' || !action || action === 'get') && (action !== 'get' || id)) {
    if (action === 'get' && id) {
      const item = await store.records.get(kind, id);
      if (!item) return failMsg(res, 404, `${singular} not found`);
      return ok(res, item);
    }
    let list = await store.records.list(kind);
    if (publicRead && !admin && publicFilter) list = list.filter(publicFilter);
    list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return ok(res, list);
  }
  if (method === 'GET' && id) {
    const item = await store.records.get(kind, id);
    if (!item) return failMsg(res, 404, `${singular} not found`);
    return ok(res, item);
  }

  if (!admin) return fail(res, 401, 'Unauthorized');

  if (action === 'reorder' && method === 'POST') {
    const body = await readJson(req);
    const order = body.order || body.ids || [];
    for (const item of await store.records.list(kind)) {
      const pos = order.indexOf(item.id);
      if (pos !== -1) await store.records.update(kind, item.id, { sort_order: pos + 1 });
    }
    return okMsg(res, 'Order saved');
  }

  if (action === 'delete' || method === 'DELETE') {
    if (!id) return failMsg(res, 400, 'Missing id');
    const item = await store.records.get(kind, id);
    if (!item) return failMsg(res, 404, `${singular} not found`);
    await store.records.remove(kind, id);
    await store.activity.add({ user_name: admin.username, action: `deleted ${singular.toLowerCase()} #${id}`, type: 'content' });
    return okMsg(res, `${singular} deleted successfully`);
  }

  if (action === 'update' || (method === 'PUT' && id)) {
    const item = await store.records.get(kind, id);
    if (!item) return failMsg(res, 404, `${singular} not found`);
    const body = await readJson(req);
    const patch = { ...body };
    delete patch.id;
    patch.updated_at = nowIso();
    const updated = await store.records.update(kind, id, patch);
    await store.activity.add({ user_name: admin.username, action: `updated ${singular.toLowerCase()} #${id}`, type: 'content' });
    return okMsg(res, `${singular} updated successfully`, updated);
  }

  if (action === 'create' || method === 'POST') {
    const body = await readJson(req);
    const item = { ...body };
    delete item.id;
    item.id = await store.counters.next(kind);
    item.created_at = nowIso();
    item.updated_at = nowIso();
    await store.records.insert(kind, item);
    await store.activity.add({ user_name: admin.username, action: `created a new ${singular.toLowerCase()}`, type: 'content' });
    return okMsg(res, `${singular} created successfully`, item);
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// PAGES
// ---------------------------------------------------------------------------
async function handlePages({ req, res, method, url, store, admin, pathname }) {
  const action = url.searchParams.get('action');
  const slug = url.searchParams.get('slug');
  const idFromPath = /^\/api\/pages\/([^/]+)$/.exec(pathname);
  const key = slug || (idFromPath ? idFromPath[1] : null);

  if (method === 'GET' && (action === 'list' || !action)) {
    return ok(res, await store.records.list('pages'));
  }
  if (method === 'GET' && (action === 'get' || key)) {
    const page = (await store.records.list('pages')).find((p) => p.slug === key);
    return ok(res, page || null);
  }

  if (!admin) return fail(res, 401, 'Unauthorized');

  if (action === 'delete' || method === 'DELETE') {
    if (!key) return failMsg(res, 400, 'Missing slug');
    const page = (await store.records.list('pages')).find((p) => p.slug === key);
    if (page) await store.records.remove('pages', page.id);
    return okMsg(res, 'Page deleted');
  }

  if (action === 'create' || action === 'update' || method === 'POST' || method === 'PUT') {
    const body = await readJson(req);
    const targetSlug = (action === 'update' ? (url.searchParams.get('slug') || body.slug) : body.slug) || key;
    if (!targetSlug) return failMsg(res, 400, 'Missing page slug');
    const existing = (await store.records.list('pages')).find((p) => p.slug === targetSlug);
    if (existing) {
      const patch = { ...body, updated_at: nowIso() };
      const updated = await store.records.update('pages', existing.id, patch);
      await store.activity.add({ user_name: admin.username, action: `saved page "/${targetSlug}"`, type: 'content' });
      return okMsg(res, 'Page saved successfully', updated);
    }
    const page = { ...body, slug: targetSlug, id: await store.counters.next('page'), created_at: nowIso(), updated_at: nowIso() };
    await store.records.insert('pages', page);
    await store.activity.add({ user_name: admin.username, action: `created page "/${targetSlug}"`, type: 'content' });
    return okMsg(res, 'Page created successfully', page);
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// PRICING
// ---------------------------------------------------------------------------
async function handlePricing({ req, res, method, url, store, admin, pathname }) {
  const action = url.searchParams.get('action');
  const idFromPath = /^\/api\/pricing\/([^/]+)$/.exec(pathname);
  const id = url.searchParams.get('id') || (idFromPath ? idFromPath[1] : null);

  if (method === 'GET' && (action === 'list' || !action || action === 'admin') && !id) {
    let list = await store.records.list('pricing');
    if (!admin) list = list.filter((p) => Number(p.active) === 1);
    list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
    return ok(res, list);
  }
  if (method === 'GET' && id) {
    const plan = await store.records.get('pricing', id);
    if (!plan) return failMsg(res, 404, 'Plan not found');
    return ok(res, plan);
  }

  if (!admin) return fail(res, 401, 'Unauthorized');

  if (action === 'create' || (method === 'POST' && !id)) {
    const body = await readJson(req);
    const plan = {
      id: await store.counters.next('pricing'),
      name: sanitizeText(body.name, 120) || 'Untitled Plan',
      category: sanitizeText(body.category, 60) || 'websites',
      price: Number(body.price) || 0,
      price_display: sanitizeText(body.price_display, 60) || '',
      original_price: body.original_price ? Number(body.original_price) : null,
      period: sanitizeText(body.period, 40) || 'one-time',
      timeline: sanitizeText(body.timeline, 80) || '',
      description: sanitizeText(body.description, 500) || '',
      features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []),
      highlighted: Number(body.highlighted) || 0,
      is_popular: Number(body.is_popular ?? body.popular) || 0,
      active: body.active === undefined ? 1 : Number(body.active),
      sort_order: Number(body.sort_order) || (await store.records.list('pricing')).length + 1,
      created_at: nowIso(),
      updated_at: nowIso()
    };
    await store.records.insert('pricing', plan);
    await store.activity.add({ user_name: admin.username, action: `created pricing plan "${plan.name}"`, type: 'content' });
    return okMsg(res, 'Pricing plan created successfully', plan);
  }

  if (action === 'update' || method === 'PUT') {
    if (!id) return failMsg(res, 400, 'Missing id');
    const plan = await store.records.get('pricing', id);
    if (!plan) return failMsg(res, 404, 'Plan not found');
    const body = await readJson(req);
    const patch = { ...body };
    delete patch.id; delete patch.created_at;
    patch.updated_at = nowIso();
    const updated = await store.records.update('pricing', id, patch);
    await store.activity.add({ user_name: admin.username, action: `updated pricing plan "${updated.name}"`, type: 'content' });
    return okMsg(res, 'Pricing plan updated successfully', updated);
  }

  if (action === 'delete' || method === 'DELETE') {
    if (!id) return failMsg(res, 400, 'Missing id');
    const plan = await store.records.get('pricing', id);
    if (!plan) return failMsg(res, 404, 'Plan not found');
    await store.records.remove('pricing', id);
    await store.activity.add({ user_name: admin.username, action: `deleted pricing plan "${plan.name}"`, type: 'content' });
    return okMsg(res, 'Pricing plan deleted successfully');
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// BLOGS
// ---------------------------------------------------------------------------
async function handleBlogs({ req, res, method, url, store, admin, pathname }) {
  const action = url.searchParams.get('action');
  const idFromPath = /^\/api\/blogs\/([^/]+)$/.exec(pathname);
  const id = url.searchParams.get('id') || (idFromPath ? idFromPath[1] : null);
  const jsonList = (obj, extra = {}) => res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
    .end(JSON.stringify({ success: true, ...obj, ...extra }));

  if (method === 'GET') {
    const all = (await store.records.list('blogs')).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const published = all.filter((b) => b.status === 'published');

    if (action === 'get' || (id && !/^\d+$/.test(String(id)))) {
      const key = id || url.searchParams.get('slug');
      const blog = all.find((b) => b.slug === key || String(b.id) === String(key));
      if (!blog) return failMsg(res, 404, 'Blog post not found');
      await store.records.update('blogs', blog.id, { views: (blog.views || 0) + 1 });
      return ok(res, blog);
    }
    if (action === 'featured') {
      const limit = limitParam(url, 3, 20);
      return jsonList({ data: published.filter((b) => Number(b.featured) === 1).slice(0, limit) });
    }
    if (action === 'category') {
      const category = url.searchParams.get('category');
      const page = pageParam(url);
      const limit = limitParam(url, 9, 50);
      const list = published.filter((b) => b.category === category);
      return jsonList({
        data: list.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, total: list.length, pages: Math.max(1, Math.ceil(list.length / limit)) }
      });
    }
    if (action === 'search') {
      const q = (url.searchParams.get('q') || '').toLowerCase();
      const page = pageParam(url);
      const limit = limitParam(url, 9, 50);
      const list = published.filter((b) => [b.title, b.excerpt, stripHtml(b.content), b.category].some((v) => (v || '').toLowerCase().includes(q)));
      return jsonList({
        data: list.slice((page - 1) * limit, page * limit),
        pagination: { page, limit, total: list.length, pages: Math.max(1, Math.ceil(list.length / limit)) }
      });
    }
    // list
    const page = pageParam(url);
    const limit = limitParam(url, 9, 100);
    const list = admin ? all : published;
    return jsonList({
      data: list.slice((page - 1) * limit, page * limit),
      pagination: { page, limit, total: list.length, pages: Math.max(1, Math.ceil(list.length / limit)) }
    });
  }

  if (!admin) return fail(res, 401, 'Unauthorized');

  if (method === 'POST' && !id) {
    const body = await readJson(req);
    let slug = (sanitizeText(body.slug, 200) || body.title || 'post')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 180);
    const existing = await store.records.list('blogs');
    if (existing.some((b) => b.slug === slug)) slug = `${slug}-${Date.now().toString(36)}`;
    const blog = {
      id: await store.counters.next('blog'),
      slug,
      title: sanitizeText(body.title, 200) || 'Untitled',
      excerpt: sanitizeText(body.excerpt, 500) || '',
      content: body.content || '',
      category: sanitizeText(body.category, 80) || 'General',
      tags: typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags || []),
      author: sanitizeText(body.author, 120) || admin.username,
      author_avatar: sanitizeText(body.author_avatar, 500) || '',
      cover_image: sanitizeText(body.cover_image, 500) || '',
      status: ['published', 'draft'].includes(body.status) ? body.status : 'draft',
      featured: Number(body.featured) || 0,
      read_time: Number(body.read_time) || Math.max(1, Math.ceil(stripHtml(String(body.content || '')).split(/\s+/).length / 200)),
      seo_title: sanitizeText(body.seo_title, 200) || null,
      seo_description: sanitizeText(body.seo_description, 320) || null,
      views: 0,
      created_at: nowIso(),
      updated_at: nowIso()
    };
    await store.records.insert('blogs', blog);
    await store.activity.add({ user_name: admin.username, action: `published blog post "${blog.title}"`, type: 'blog' });
    return okMsg(res, 'Blog post created successfully', blog);
  }

  if ((method === 'PUT' || (method === 'POST' && id)) && id) {
    const blog = (await store.records.list('blogs')).find((b) => String(b.id) === String(id) || b.slug === id);
    if (!blog) return failMsg(res, 404, 'Blog post not found');
    const body = await readJson(req);
    const patch = { ...body };
    delete patch.id; delete patch.created_at;
    patch.updated_at = nowIso();
    const updated = await store.records.update('blogs', blog.id, patch);
    await store.activity.add({ user_name: admin.username, action: `updated blog post "${updated.title}"`, type: 'blog' });
    return okMsg(res, 'Blog post updated successfully', updated);
  }

  if ((action === 'delete' || method === 'DELETE') && id) {
    const blog = (await store.records.list('blogs')).find((b) => String(b.id) === String(id));
    if (!blog) return failMsg(res, 404, 'Blog post not found');
    await store.records.remove('blogs', blog.id);
    await store.activity.add({ user_name: admin.username, action: `deleted blog post "${blog.title}"`, type: 'blog' });
    return okMsg(res, 'Blog post deleted successfully');
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// PROJECTS (portfolio)
// ---------------------------------------------------------------------------
async function handleProjects({ req, res, method, url, store, admin, pathname }) {
  const idFromPath = /^\/api\/projects\/([^/]+)$/.exec(pathname);
  const id = url.searchParams.get('id') || (idFromPath ? idFromPath[1] : null);

  if (method === 'GET' && !id) {
    let list = await store.records.list('projects');
    if (url.searchParams.get('published') === '1' || !admin) {
      list = list.filter((p) => Number(p.published) === 1);
    }
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return ok(res, list);
  }
  if (method === 'GET' && id) {
    const project = await store.records.get('projects', id);
    if (!project) return failMsg(res, 404, 'Project not found');
    return ok(res, project);
  }

  if (!admin) return fail(res, 401, 'Unauthorized');

  if (method === 'POST' && !id) {
    const contentType = req.headers['content-type'] || '';
    let body = {};
    let uploadedImageUrl = '';
    if (contentType.includes('multipart/form-data')) {
      const buf = await readBody(req, 120 * 1024 * 1024);
      const { fields, files } = parseMultipart(buf, contentType);
      body = fields;
      const img = files.find((f) => ['image', 'file', 'featured_image'].includes(f.field));
      if (img) {
        const ext = path.extname(img.filename) || '.png';
        const filename = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${ext}`;
        const meta = await store.files.put({ category: 'projects', filename, original_name: img.filename, content_type: img.contentType, buffer: img.buffer });
        uploadedImageUrl = meta.url;
      }
    } else {
      body = await readJson(req);
    }
    const project = {
      id: await store.counters.next('project'),
      title: sanitizeText(body.title, 200) || 'Untitled Project',
      client_name: sanitizeText(body.client_name, 160) || '',
      project_type: sanitizeText(body.project_type, 60) || 'website',
      short_description: sanitizeText(body.short_description, 500) || '',
      long_description: body.long_description || '',
      featured_image: uploadedImageUrl || sanitizeText(body.featured_image, 500) || '',
      tech_stack: typeof body.tech_stack === 'string' ? body.tech_stack : JSON.stringify(body.tech_stack || []),
      features: typeof body.features === 'string' ? body.features : JSON.stringify(body.features || []),
      images: typeof body.images === 'string' ? body.images : JSON.stringify(body.images || []),
      metrics: typeof body.metrics === 'string' ? body.metrics : JSON.stringify(body.metrics || {}),
      price: Number(body.price) || 0,
      category: sanitizeText(body.category, 80) || '',
      video_url: sanitizeText(body.video_url, 500) || '',
      live_url: sanitizeText(body.live_url, 500) || '',
      published: body.published === undefined ? 1 : Number(body.published),
      featured: Number(body.featured) || 0,
      status: sanitizeText(body.status, 40) || 'completed',
      created_at: nowIso(),
      updated_at: nowIso()
    };
    await store.records.insert('projects', project);
    await store.activity.add({ user_name: admin.username, action: `added portfolio project "${project.title}"`, type: 'project' });
    return okMsg(res, 'Project created successfully', project);
  }

  if (method === 'PUT' && id) {
    const project = await store.records.get('projects', id);
    if (!project) return failMsg(res, 404, 'Project not found');
    const body = await readJson(req);
    const patch = { ...body };
    delete patch.id; delete patch.created_at;
    patch.updated_at = nowIso();
    const updated = await store.records.update('projects', id, patch);
    await store.activity.add({ user_name: admin.username, action: `updated portfolio project "${updated.title}"`, type: 'project' });
    return okMsg(res, 'Project updated successfully', updated);
  }

  if (method === 'DELETE' && id) {
    const project = await store.records.get('projects', id);
    if (!project) return failMsg(res, 404, 'Project not found');
    await store.records.remove('projects', id);
    for (const v of await store.records.list('project_videos')) {
      if (String(v.project_id) === String(id)) await store.records.remove('project_videos', v.id);
    }
    await store.activity.add({ user_name: admin.username, action: `deleted portfolio project "${project.title}"`, type: 'project' });
    return okMsg(res, 'Project deleted successfully');
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// PROJECT VIDEOS
// ---------------------------------------------------------------------------
async function handleProjectVideos({ req, res, method, url, store, admin, pathname }) {
  const idFromPath = /^\/api\/project-videos\/([^/]+)$/.exec(pathname);
  let id = url.searchParams.get('id') || (idFromPath ? idFromPath[1] : null);
  let bodyJson = null;

  if (method === 'GET') {
    const projectId = url.searchParams.get('project_id');
    let list = await store.records.list('project_videos');
    if (projectId) list = list.filter((v) => String(v.project_id) === String(projectId));
    list.sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
    return ok(res, list);
  }

  if (!admin) return fail(res, 401, 'Unauthorized');

  // DELETE with JSON body {id}
  if (method === 'DELETE' && !id) {
    try { bodyJson = await readJson(req); } catch { bodyJson = {}; }
    id = bodyJson?.id;
  }

  if (method === 'POST') {
    const contentType = req.headers['content-type'] || '';
    let video;
    if (contentType.includes('multipart/form-data')) {
      const buf = await readBody(req, 300 * 1024 * 1024);
      const { fields, files } = parseMultipart(buf, contentType);
      const file = files.find((f) => f.field === 'video' || f.field === 'file');
      if (!file) return failMsg(res, 400, 'No video file provided');
      const ext = path.extname(file.filename) || '.mp4';
      const filename = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      const meta = await store.files.put({ category: 'videos', filename, original_name: file.filename, content_type: file.contentType, buffer: file.buffer });
      let thumbnailUrl = sanitizeText(fields.thumbnail_url, 500) || '';
      const thumb = files.find((f) => f.field === 'thumbnail');
      if (thumb) {
        const text = path.extname(thumb.filename) || '.png';
        const tname = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${text}`;
        const tmeta = await store.files.put({ category: 'thumbnails', filename: tname, original_name: thumb.filename, content_type: thumb.contentType, buffer: thumb.buffer });
        thumbnailUrl = tmeta.url;
      }
      video = {
        id: await store.counters.next('video'),
        project_id: parseInt(fields.project_id, 10) || null,
        title: sanitizeText(fields.title, 200) || file.filename,
        description: sanitizeText(fields.description, 2000) || '',
        type: sanitizeText(fields.type, 40) || 'demo',
        video_url: meta.url,
        url: meta.url,
        filename: meta.filename,
        thumbnail_url: thumbnailUrl,
        size: meta.size,
        is_primary: Number(fields.is_primary) || 0,
        display_order: Number(fields.display_order) || 0,
        created_at: nowIso()
      };
    } else {
      const body = await readJson(req);
      if (!body.video_url && !body.url) return failMsg(res, 400, 'video_url is required');
      video = {
        id: await store.counters.next('video'),
        project_id: Number(body.project_id) || null,
        title: sanitizeText(body.video_title || body.title, 200) || 'Video',
        description: sanitizeText(body.video_description || body.description, 2000) || '',
        type: sanitizeText(body.video_type || body.type, 40) || 'demo',
        video_url: body.video_url || body.url,
        url: body.video_url || body.url,
        thumbnail_url: sanitizeText(body.thumbnail_url, 500) || '',
        is_primary: Number(body.is_primary) || 0,
        display_order: Number(body.display_order) || 0,
        created_at: nowIso()
      };
    }
    await store.records.insert('project_videos', video);
    await store.activity.add({ user_name: admin.username, action: `added project video "${video.title}"`, type: 'project' });
    return okMsg(res, 'Video uploaded successfully', video);
  }

  if (method === 'PUT' && id) {
    const video = await store.records.get('project_videos', id);
    if (!video) return failMsg(res, 404, 'Video not found');
    const body = await readJson(req);
    const patch = { ...body };
    delete patch.id;
    const updated = await store.records.update('project_videos', id, patch);
    return okMsg(res, 'Video updated successfully', updated);
  }

  if (method === 'DELETE' && id) {
    const video = await store.records.get('project_videos', id);
    if (!video) return failMsg(res, 404, 'Video not found');
    if (video.video_url && video.video_url.startsWith('/uploads/')) await store.files.removeByUrl(video.video_url);
    await store.records.remove('project_videos', id);
    return okMsg(res, 'Video deleted successfully');
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// TESTIMONIALS
// ---------------------------------------------------------------------------
async function handleTestimonials({ req, res, method, url, store, admin, pathname }) {
  const idFromPath = /^\/api\/testimonials\/([^/]+)$/.exec(pathname);
  const id = url.searchParams.get('id') || (idFromPath ? idFromPath[1] : null);

  if (method === 'GET' && !id) {
    let list = await store.records.list('testimonials');
    if (!admin) list = list.filter((t) => t.status === 'approved');
    if (url.searchParams.get('featured') === '1') list = list.filter((t) => Number(t.featured) === 1);
    list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    return ok(res, list);
  }

  if (method === 'POST' && !id) {
    const body = await readJson(req);
    const t = {
      id: await store.counters.next('testimonial'),
      client_name: sanitizeText(body.client_name, 120) || 'Anonymous',
      client_title: sanitizeText(body.client_title, 120) || '',
      client_company: sanitizeText(body.client_company, 160) || '',
      project_name: sanitizeText(body.project_name, 160) || '',
      avatar: sanitizeText(body.avatar, 500) || '',
      content: sanitizeText(body.content, 2000) || '',
      rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
      featured: 0,
      status: admin ? (body.status || 'approved') : 'pending',
      created_at: nowIso(),
      updated_at: nowIso()
    };
    await store.records.insert('testimonials', t);
    await store.activity.add({ user_name: admin ? admin.username : 'Website', action: `testimonial submitted from ${t.client_name}`, type: 'testimonial' });
    return okMsg(res, 'Thank you! Your testimonial has been submitted for review.', t);
  }

  if (!admin) return fail(res, 401, 'Unauthorized');

  if (method === 'PUT' && id) {
    const t = await store.records.get('testimonials', id);
    if (!t) return failMsg(res, 404, 'Testimonial not found');
    const body = await readJson(req);
    const patch = { ...body };
    delete patch.id; delete patch.created_at;
    patch.updated_at = nowIso();
    const updated = await store.records.update('testimonials', id, patch);
    await store.activity.add({ user_name: admin.username, action: `updated testimonial from ${updated.client_name}`, type: 'testimonial' });
    return okMsg(res, 'Testimonial updated successfully', updated);
  }

  if (method === 'DELETE' && id) {
    const t = await store.records.get('testimonials', id);
    if (!t) return failMsg(res, 404, 'Testimonial not found');
    await store.records.remove('testimonials', id);
    await store.activity.add({ user_name: admin.username, action: `deleted testimonial from ${t.client_name}`, type: 'testimonial' });
    return okMsg(res, 'Testimonial deleted successfully');
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// FORM SETTINGS
// ---------------------------------------------------------------------------
async function handleFormSettings({ req, res, method, url, store, admin }) {
  const action = url.searchParams.get('action');
  if (!admin) return fail(res, 401, 'Unauthorized');

  if (method === 'GET' || action === 'get') {
    const saved = await store.settings.get('form_settings');
    let parsed = null;
    try { parsed = saved ? JSON.parse(saved) : null; } catch { parsed = null; }
    return ok(res, parsed || {
      homepage_form_enabled: true,
      contact_form_enabled: true,
      success_message: "Thanks! We'll reach out within 24 hours.",
      notification_email: 'admin@chronolyte.com'
    });
  }
  if (method === 'POST' || action === 'save') {
    const body = await readJson(req);
    const saved = await store.settings.get('form_settings');
    let merged = {};
    try { merged = saved ? JSON.parse(saved) : {}; } catch { merged = {}; }
    merged = { ...merged, ...body };
    await store.settings.set('form_settings', JSON.stringify(merged));
    await store.activity.add({ user_name: admin.username, action: 'updated form settings', type: 'settings' });
    return okMsg(res, 'Form settings saved successfully', merged);
  }
  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// UPLOADS
// ---------------------------------------------------------------------------
async function handleUpload({ req, res, method, url, store, admin, pathname }) {
  const action = url.searchParams.get('action');
  const idFromPath = /^\/api\/upload\/([^/]+)$/.exec(pathname);

  if (action === 'upload' || (method === 'POST' && !action)) {
    if (!admin) return fail(res, 401, 'Unauthorized');
    const contentType = req.headers['content-type'] || '';
    if (!contentType.includes('multipart/form-data')) return failMsg(res, 400, 'Expected multipart/form-data');
    const buf = await readBody(req, 120 * 1024 * 1024);
    const { files } = parseMultipart(buf, contentType);
    const file = files.find((f) => ['file', 'image', 'video'].includes(f.field)) || files[0];
    if (!file) return failMsg(res, 400, 'No file provided');
    const category = url.searchParams.get('category') || 'general';
    const ext = path.extname(file.filename) || '';
    const filename = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const meta = await store.files.put({ category, filename, original_name: file.filename, content_type: file.contentType, buffer: file.buffer });
    await store.activity.add({ user_name: admin.username, action: `uploaded file "${meta.original_name}"`, type: 'media' });
    return okMsg(res, 'File uploaded successfully', { ...meta, message: 'File uploaded successfully' });
  }

  if (action === 'delete' || (method === 'DELETE' && action)) {
    if (!admin) return fail(res, 401, 'Unauthorized');
    const filename = url.searchParams.get('filename');
    if (!filename) return failMsg(res, 400, 'Missing filename');
    await store.files.removeByUrl(filename);
    return okMsg(res, 'File deleted successfully');
  }

  if (method === 'DELETE' && !action && idFromPath) {
    if (!admin) return fail(res, 401, 'Unauthorized');
    const files = await store.files.list();
    const meta = files.find((u) => String(u.id) === String(idFromPath[1]));
    if (meta) await store.files.removeByUrl(meta.url);
    return okMsg(res, 'File deleted');
  }

  if (action === 'list' || action === 'gallery' || method === 'GET') {
    const category = url.searchParams.get('category');
    let list = await store.files.list(category);
    const type = url.searchParams.get('type');
    if (action === 'gallery' && type === 'image') {
      list = list.filter((u) => /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(u.filename || ''));
    }
    return ok(res, { files: list, total: list.length });
  }

  return failMsg(res, 405, 'Method not allowed');
}

// ---------------------------------------------------------------------------
// SEO PAGE RENDERER — serves the SPA shell with per-route SEO injected.
// Used on Vercel for /blog/:slug (via rewrite) and any dynamic route.
// ---------------------------------------------------------------------------
async function serveSeoPage({ req, res, url, store, pathname }) {
  const sub = pathname.replace(/^\/api\/page/, '') || '/';

  // Locate the SPA shell: dist/index.html (bundled with the function via includeFiles)
  const candidates = [
    path.join(process.cwd(), 'dist', 'index.html'),
    path.join(process.cwd(), '..', 'dist', 'index.html'),
    path.join(process.cwd(), 'public', 'index.html')
  ];
  let shell = null;
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) { shell = fs.readFileSync(c, 'utf8'); break; }
    } catch {}
  }
  if (!shell) {
    res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end('<h1>Chronolyte</h1><p>Build the frontend first: npm run build</p>');
  }

  const blogMatch = /^\/blog\/([^/]+)$/.exec(sub);
  const noIndex = sub === '/admin' || sub.startsWith('/admin/');

  if (blogMatch && !noIndex) {
    const slug = decodeURIComponent(blogMatch[1]);
    const post = (await store.records.list('blogs')).find((b) => b.slug === slug && b.status === 'published');
    if (post) {
      const plain = stripHtml(post.content || '');
      // Full raw HTML (tables, lists, headings) so crawlers and LLMs see the complete guide.
      const ssr = `<article><h1>${post.title}</h1><p><em>By ${post.author || 'Chronolyte'}${post.updated_at ? ` · Updated ${String(post.updated_at).slice(0, 10)}` : ''}</em></p><p><strong>${post.excerpt || ''}</strong></p>${post.content || ''}</article>`;
      const html = injectSeo(shell, {
        pathname: sub,
        title: post.seo_title || `${post.title} | Chronolyte`,
        description: post.seo_description || post.excerpt || plain.slice(0, 155),
        keywords: safeTagsList(post.tags),
        image: post.cover_image || undefined,
        type: 'article',
        jsonLd: [
          organizationLd(),
          blogPostingLd(post, sub),
          breadcrumbsLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title, path: sub }])
        ],
        ssrContent: ssr
      });
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=300', 'X-Robots-Tag': 'index, follow' });
      return res.end(html);
    }
  }

  const meta = routeMeta(sub);
  const html = noIndex ? noIndexHtml(shell) : meta
    ? injectSeo(shell, { pathname: meta.path, title: meta.title, description: meta.description, keywords: meta.keywords })
    : shell;
  res.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
    ...(noIndex ? { 'X-Robots-Tag': 'noindex, nofollow' } : {})
  });
  return res.end(html);
}

function safeTagsList(tags) {
  if (Array.isArray(tags)) return tags.join(', ');
  if (typeof tags === 'string') {
    try { const arr = JSON.parse(tags); return Array.isArray(arr) ? arr.join(', ') : tags; } catch { return tags; }
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// DASHBOARD STATS
// ---------------------------------------------------------------------------
export async function dashboardStats(store) {
  const leads = await store.leads.all();
  const now = new Date();
  const totalLeads = leads.length;
  const won = leads.filter((l) => l.status === 'won').length;
  const newThisWeek = leads.filter((l) => Date.now() - new Date(l.created_at).getTime() < 7 * 86400000).length;

  const leadsByMonth = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const count = leads.filter((l) => {
      const ld = new Date(l.created_at);
      return ld.getMonth() === d.getMonth() && ld.getFullYear() === d.getFullYear();
    }).length;
    leadsByMonth.push({ name: d.toLocaleString('en-US', { month: 'short' }), leads: count });
  }

  const sourceCounts = {};
  for (const l of leads) {
    const src = (l.source || 'website').replace(/-/g, ' ');
    sourceCounts[src] = (sourceCounts[src] || 0) + 1;
  }
  const leadSources = Object.entries(sourceCounts)
    .map(([name, count]) => ({ name: name.replace(/\b\w/g, (c) => c.toUpperCase()), value: totalLeads ? Math.round((count / totalLeads) * 100) : 0 }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const typeCounts = {};
  for (const l of leads) {
    const svc = l.service_interested || 'Other';
    typeCounts[svc] = (typeCounts[svc] || 0) + 1;
  }
  const projectTypes = Object.entries(typeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const projects = await store.records.list('projects');
  const requests = await store.records.list('project_requests');
  const activeProjects = projects.filter((p) => ['planning', 'in_progress', 'review'].includes(p.status || 'completed'));

  const revenueThisMonth =
    leads.filter((l) => {
      if (l.status !== 'won') return false;
      const ld = new Date(l.created_at);
      return ld.getMonth() === now.getMonth() && ld.getFullYear() === now.getFullYear();
    }).reduce((sum, l) => sum + (Number(l.expected_value) || 0), 0) +
    requests.filter((r) => r.payment_status === 'paid').reduce((sum, r) => sum + (Number(r.quoted_amount) || 0), 0);

  const byStatus = {};
  for (const l of leads) byStatus[l.status] = (byStatus[l.status] || 0) + 1;

  return {
    total_leads: totalLeads,
    new_leads: byStatus.new || 0,
    new_leads_this_week: newThisWeek,
    won_leads: won,
    conversion_rate: totalLeads ? Math.round((won / totalLeads) * 1000) / 10 : 0,
    active_projects: activeProjects.length,
    total_projects: projects.length,
    project_requests: requests.length,
    pending_requests: requests.filter((r) => ['new', 'reviewing'].includes(r.status)).length,
    revenue_this_month: revenueThisMonth,
    total_revenue: leads.filter((l) => l.status === 'won').reduce((sum, l) => sum + (Number(l.expected_value) || 0), 0),
    leads_by_status: byStatus,
    leads_by_month: leadsByMonth,
    revenue_by_month: leadsByMonth.map((m) => ({ ...m, revenue: Math.round((revenueThisMonth / Math.max(1, leadsByMonth.reduce((s, x) => s + x.leads, 0))) * m.leads) })),
    lead_sources: leadSources,
    project_types: projectTypes,
    recent_activity: await store.activity.recent(12),
    generated_at: nowIso()
  };
}
