/**
 * Neon Postgres store — production persistence for Vercel serverless functions.
 * Uses the Neon serverless HTTP driver (no WebSockets, perfect for Lambda).
 *
 * Schema:
 *   counters(kind PK, value)                    — per-kind id sequences
 *   settings(key PK, value)                     — key/value site settings
 *   admins(id PK, username UNIQUE, ...)         — admin users
 *   sessions(token PK, admin_id, expires_at)    — login sessions
 *   leads(id PK, name, email, ...)              — first-class leads table
 *   records(kind, id, data JSONB, PK(kind,id))  — blogs, projects, pricing, faqs, testimonials, pages, snippets, services, project_requests, project_videos
 *   files(id PK, category, filename, data TEXT) — uploaded media (base64)
 *   activity(id SERIAL, ...)                    — activity log
 */

import crypto from 'node:crypto';
import { neon } from '@neondatabase/serverless';
import { nowIso } from './util.js';

export function hashPassword(password, salt = null) {
  salt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(String(password), salt, 100000, 32, 'sha256').toString('hex');
  return `pbkdf2$${salt}$${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    if (typeof stored !== 'string') return false;
    if (stored.startsWith('pbkdf2$')) {
      const [, salt, hash] = stored.split('$');
      const check = crypto.pbkdf2Sync(String(password), salt, 100000, 32, 'sha256').toString('hex');
      return crypto.timingSafeEqual(Buffer.from(check, 'hex'), Buffer.from(hash, 'hex'));
    }
    return stored === String(password);
  } catch {
    return false;
  }
}

export function createNeonStore(databaseUrl) {
  const sql = neon(databaseUrl);

  const store = {
    kind: 'neon',
    hashPassword,
    verifyPassword,
    driver: sql,

    async init() {
      await sql`
        CREATE TABLE IF NOT EXISTS counters (
          kind TEXT PRIMARY KEY,
          value BIGINT NOT NULL DEFAULT 1000
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS admins (
          id BIGINT PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          email TEXT,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'admin',
          active INT NOT NULL DEFAULT 1,
          avatar TEXT DEFAULT '',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          token TEXT PRIMARY KEY,
          admin_id BIGINT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          expires_at TIMESTAMPTZ NOT NULL
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS leads (
          id BIGINT PRIMARY KEY,
          reference_number TEXT,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT,
          company TEXT,
          service_interested TEXT,
          budget TEXT,
          timeline TEXT,
          status TEXT NOT NULL DEFAULT 'new',
          priority TEXT NOT NULL DEFAULT 'medium',
          source TEXT NOT NULL DEFAULT 'website',
          notes TEXT,
          message TEXT,
          meta JSONB,
          expected_value BIGINT,
          follow_up_date TEXT,
          assigned_to BIGINT,
          ip_address TEXT,
          user_agent TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)`;
      await sql`
        CREATE TABLE IF NOT EXISTS records (
          kind TEXT NOT NULL,
          id BIGINT NOT NULL,
          data JSONB NOT NULL,
          sort_order INT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
          PRIMARY KEY (kind, id)
        )`;
      await sql`CREATE INDEX IF NOT EXISTS idx_records_kind ON records(kind)`;
      await sql`
        CREATE TABLE IF NOT EXISTS files (
          id BIGINT PRIMARY KEY,
          category TEXT NOT NULL,
          filename TEXT NOT NULL,
          original_name TEXT,
          content_type TEXT,
          size BIGINT,
          data TEXT,
          url TEXT,
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await sql`
        CREATE TABLE IF NOT EXISTS activity (
          id BIGSERIAL PRIMARY KEY,
          user_name TEXT,
          action TEXT,
          details TEXT,
          type TEXT DEFAULT 'info',
          created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
    },

    settings: {
      async get(key) {
        const rows = await sql`SELECT value FROM settings WHERE key = ${key} LIMIT 1`;
        return rows.length ? rows[0].value : null;
      },
      async set(key, value) {
        await sql`
          INSERT INTO settings (key, value, updated_at) VALUES (${key}, ${String(value)}, now())
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now()`;
      },
      async delete(key) {
        await sql`DELETE FROM settings WHERE key = ${key}`;
      },
      async all() {
        const rows = await sql`SELECT key, value FROM settings`;
        return Object.fromEntries(rows.map((r) => [r.key, r.value]));
      }
    },

    counters: {
      async next(kind) {
        const rows = await sql`
          INSERT INTO counters (kind, value) VALUES (${kind}, 1001)
          ON CONFLICT (kind) DO UPDATE SET value = counters.value + 1
          RETURNING value`;
        return Number(rows[0].value);
      }
    },

    admins: {
      async list() {
        const rows = await sql`SELECT * FROM admins ORDER BY id`;
        return rows.map(rowAdmin);
      },
      async byLogin(login) {
        const l = String(login || '').toLowerCase();
        const rows = await sql`SELECT * FROM admins WHERE active = 1 AND (LOWER(username) = ${l} OR LOWER(COALESCE(email,'')) = ${l}) LIMIT 1`;
        return rows.length ? rowAdmin(rows[0]) : null;
      },
      async byId(id) {
        const rows = await sql`SELECT * FROM admins WHERE id = ${Number(id)} LIMIT 1`;
        return rows.length ? rowAdmin(rows[0]) : null;
      },
      async create(data) {
        const id = await store.counters.next('admin');
        await sql`
          INSERT INTO admins (id, username, email, password, role, active, avatar)
          VALUES (${id}, ${data.username}, ${data.email || ''}, ${data.password}, ${data.role || 'admin'}, 1, ${data.avatar || ''})`;
        return store.admins.byId(id);
      },
      async update(id, patch) {
        const cur = await store.admins.byId(id);
        if (!cur) return null;
        const next = { ...cur, ...patch, updated_at: nowIso() };
        await sql`
          UPDATE admins SET username=${next.username}, email=${next.email || ''}, password=${next.password},
            role=${next.role}, active=${Number(next.active) || 0}, avatar=${next.avatar || ''}, updated_at=now()
          WHERE id=${Number(id)}`;
        return store.admins.byId(id);
      },
      async remove(id) {
        await sql`DELETE FROM admins WHERE id = ${Number(id)}`;
        return true;
      },
      async countActive() {
        const rows = await sql`SELECT COUNT(*)::int AS c FROM admins WHERE active = 1`;
        return rows[0].c;
      }
    },

    sessions: {
      async create({ token, admin_id, expires_at }) {
        await sql`INSERT INTO sessions (token, admin_id, expires_at) VALUES (${token}, ${Number(admin_id)}, ${new Date(expires_at).toISOString()})`;
      },
      async find(token) {
        const rows = await sql`SELECT * FROM sessions WHERE token = ${token} AND expires_at > now() LIMIT 1`;
        return rows.length ? rows[0] : null;
      },
      async remove(token) {
        await sql`DELETE FROM sessions WHERE token = ${token}`;
      }
    },

    leads: {
      async insert(lead) {
        await sql`
          INSERT INTO leads (id, reference_number, name, email, phone, company, service_interested, budget, timeline,
            status, priority, source, notes, message, meta, expected_value, ip_address, user_agent, created_at, updated_at)
          VALUES (${lead.id}, ${lead.reference_number}, ${lead.name}, ${lead.email}, ${lead.phone}, ${lead.company},
            ${lead.service_interested}, ${lead.budget}, ${lead.timeline}, ${lead.status}, ${lead.priority}, ${lead.source},
            ${lead.notes}, ${lead.message}, ${lead.meta ? JSON.stringify(lead.meta) : null}, ${lead.expected_value},
            ${lead.ip_address}, ${lead.user_agent}, ${lead.created_at}, ${lead.updated_at})`;
        return lead;
      },
      async get(id) {
        const rows = await sql`SELECT * FROM leads WHERE id = ${Number(id)} LIMIT 1`;
        return rows.length ? rowLead(rows[0]) : null;
      },
      async update(id, patch) {
        const cur = await store.leads.get(id);
        if (!cur) return null;
        const next = { ...cur, ...patch };
        await sql`
          UPDATE leads SET name=${next.name}, email=${next.email}, phone=${next.phone}, company=${next.company},
            service_interested=${next.service_interested}, budget=${next.budget}, timeline=${next.timeline},
            status=${next.status}, priority=${next.priority}, source=${next.source}, notes=${next.notes},
            message=${next.message}, expected_value=${next.expected_value}, follow_up_date=${next.follow_up_date},
            assigned_to=${next.assigned_to}, updated_at=${nowIso()}
          WHERE id=${Number(id)}`;
        return store.leads.get(id);
      },
      async remove(id) {
        await sql`DELETE FROM leads WHERE id = ${Number(id)}`;
        return true;
      },
      async all() {
        const rows = await sql`SELECT * FROM leads ORDER BY created_at DESC LIMIT 10000`;
        return rows.map(rowLead);
      },
      async list({ status, priority, source, search, page = 1, limit = 50 } = {}) {
        const clauses = [];
        if (status && status !== 'all') clauses.push(sql`status = ${status}`);
        if (priority && priority !== 'all') clauses.push(sql`priority = ${priority}`);
        if (source && source !== 'all') clauses.push(sql`source = ${source}`);
        if (search) {
          const q = `%${search.toLowerCase()}%`;
          clauses.push(sql`(LOWER(name) LIKE ${q} OR LOWER(email) LIKE ${q} OR LOWER(COALESCE(company,'')) LIKE ${q} OR LOWER(COALESCE(service_interested,'')) LIKE ${q} OR LOWER(COALESCE(notes,'')) LIKE ${q})`);
        }
        const where = clauses.length ? sql` WHERE ${sql.join(clauses, sql` AND `)}` : sql``;
        const countRows = await sql`SELECT COUNT(*)::int AS total FROM leads${where}`;
        const total = countRows[0].total;
        const offset = (Math.max(1, page) - 1) * limit;
        const rows = await sql`
          SELECT * FROM leads${where}
          ORDER BY created_at DESC, CASE priority WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END
          LIMIT ${limit} OFFSET ${offset}`;
        return { items: rows.map(rowLead), total };
      }
    },

    activity: {
      async add(entry) {
        await sql`INSERT INTO activity (user_name, action, details, type) VALUES (${entry.user_name}, ${entry.action}, ${entry.details || ''}, ${entry.type || 'info'})`;
      },
      async recent(n = 12) {
        const rows = await sql`SELECT * FROM activity ORDER BY id DESC LIMIT ${n}`;
        return rows.map((r) => ({ id: String(r.id), user_name: r.user_name, action: r.action, details: r.details, type: r.type, created_at: r.created_at }));
      }
    },

    records: {
      async list(kind) {
        const rows = await sql`SELECT data FROM records WHERE kind = ${kind}`;
        return rows.map((r) => r.data);
      },
      async get(kind, id) {
        const rows = await sql`SELECT data FROM records WHERE kind = ${kind} AND id = ${Number(id)} LIMIT 1`;
        return rows.length ? rows[0].data : null;
      },
      async insert(kind, data) {
        await sql`
          INSERT INTO records (kind, id, data, sort_order, created_at, updated_at)
          VALUES (${kind}, ${Number(data.id)}, ${JSON.stringify(data)}, ${Number(data.sort_order) || null}, ${data.created_at || nowIso()}, ${data.updated_at || nowIso()})`;
        return data;
      },
      async update(kind, id, patch) {
        const cur = await store.records.get(kind, id);
        if (!cur) return null;
        const next = { ...cur, ...patch, id: cur.id };
        await sql`
          UPDATE records SET data = ${JSON.stringify(next)}, sort_order = ${Number(next.sort_order) || null}, updated_at = now()
          WHERE kind = ${kind} AND id = ${Number(id)}`;
        return next;
      },
      async remove(kind, id) {
        await sql`DELETE FROM records WHERE kind = ${kind} AND id = ${Number(id)}`;
        return true;
      }
    },

    files: {
      async put({ category, filename, original_name, content_type, buffer }) {
        const safeCategory = (category || 'general').replace(/[^a-z0-9_-]/gi, '') || 'general';
        const id = await store.counters.next('file');
        const url = `/uploads/${safeCategory}/${filename}`;
        await sql`
          INSERT INTO files (id, category, filename, original_name, content_type, size, data, url)
          VALUES (${id}, ${safeCategory}, ${filename}, ${original_name}, ${content_type}, ${buffer.length}, ${buffer.toString('base64')}, ${url})`;
        return { id, category: safeCategory, filename, original_name, content_type, size: buffer.length, url, created_at: nowIso() };
      },
      async get(category, filename) {
        const rows = await sql`SELECT data FROM files WHERE category = ${category} AND filename = ${filename} LIMIT 1`;
        return rows.length ? { buffer: Buffer.from(rows[0].data, 'base64') } : null;
      },
      async list(category) {
        const rows = category
          ? await sql`SELECT id, category, filename, original_name, content_type, size, url, created_at FROM files WHERE category = ${category} ORDER BY id DESC`
          : await sql`SELECT id, category, filename, original_name, content_type, size, url, created_at FROM files ORDER BY id DESC`;
        return rows.map((r) => ({ ...r, id: Number(r.id) }));
      },
      async removeByUrl(url) {
        await sql`DELETE FROM files WHERE url = ${url} OR filename = ${url}`;
      }
    }
  };

  return store;
}

function rowAdmin(r) {
  return {
    id: Number(r.id),
    username: r.username,
    email: r.email,
    password: r.password,
    role: r.role,
    active: Number(r.active),
    avatar: r.avatar || '',
    created_at: r.created_at,
    updated_at: r.updated_at
  };
}

function rowLead(r) {
  return {
    id: Number(r.id),
    reference_number: r.reference_number,
    name: r.name,
    email: r.email,
    phone: r.phone,
    company: r.company,
    service_interested: r.service_interested,
    budget: r.budget,
    timeline: r.timeline,
    status: r.status,
    priority: r.priority,
    source: r.source,
    notes: r.notes,
    message: r.message,
    meta: r.meta,
    expected_value: r.expected_value === null ? null : Number(r.expected_value),
    follow_up_date: r.follow_up_date,
    assigned_to: r.assigned_to,
    ip_address: r.ip_address,
    user_agent: r.user_agent,
    created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at,
    updated_at: r.updated_at instanceof Date ? r.updated_at.toISOString() : r.updated_at
  };
}
