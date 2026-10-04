/**
 * JSON-file store — local development fallback (no DATABASE_URL required).
 * Implements the exact same interface as the Neon Postgres store.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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

const DEFAULT_COUNTERS = {
  lead: 1000, project_request: 5000, blog: 0, project: 3, testimonial: 0,
  faq: 0, snippet: 0, page: 0, pricing: 0, admin: 1, video: 0, service: 0, file: 0
};

export function createJsonStore(dataDir) {
  const DB_FILE = path.join(dataDir, 'chronolyte.json');
  const UPLOAD_DIR = path.join(dataDir, 'uploads');
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  let state = null;
  let writeTimer = null;
  let dirty = false;
  let writing = false;

  function defaults() {
    return {
      meta: { version: 1, created_at: nowIso() },
      counters: { ...DEFAULT_COUNTERS },
      admins: [],
      sessions: [],
      leads: [],
      activity: [],
      settings: {},
      records: {},
      files: []
    };
  }

  function load() {
    if (state) return state;
    try {
      if (fs.existsSync(DB_FILE)) state = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (err) {
      console.error('[store:json] failed to read db file:', err.message);
    }
    if (!state || typeof state !== 'object') state = defaults();
    const def = defaults();
    for (const [k, v] of Object.entries(def)) if (state[k] === undefined) state[k] = v;
    return state;
  }

  function save() {
    dirty = true;
    if (writeTimer) return;
    writeTimer = setTimeout(flush, 120);
  }

  function flush() {
    if (writeTimer) { clearTimeout(writeTimer); writeTimer = null; }
    if (!dirty || writing || !state) return;
    writing = true;
    try {
      const tmp = DB_FILE + '.tmp';
      fs.writeFileSync(tmp, JSON.stringify(state, null, 1));
      fs.renameSync(tmp, DB_FILE);
      dirty = false;
    } catch (err) {
      console.error('[store:json] failed to persist:', err.message);
    } finally {
      writing = false;
    }
  }

  const store = {
    kind: 'json',
    hashPassword,
    verifyPassword,

    async init() {
      load();
      // process exit safety
      for (const sig of ['exit', 'SIGINT', 'SIGTERM']) {
        process.removeAllListeners(sig);
        process.on(sig, () => { try { flush(); } catch {} if (sig !== 'exit') process.exit(0); });
      }
    },

    settings: {
      async get(key) { return load().settings[key] ?? null; },
      async set(key, value) { load().settings[key] = value; save(); },
      async delete(key) { delete load().settings[key]; save(); },
      async all() { return { ...load().settings }; }
    },

    counters: {
      async next(kind) {
        const s = load();
        s.counters[kind] = (s.counters[kind] ?? 1000) + 1;
        save();
        return s.counters[kind];
      }
    },

    admins: {
      async list() { return load().admins.slice(); },
      async byLogin(login) {
        const l = String(login || '').toLowerCase();
        return load().admins.find((a) => a.active && (a.username.toLowerCase() === l || (a.email || '').toLowerCase() === l)) || null;
      },
      async byId(id) { return load().admins.find((a) => String(a.id) === String(id)) || null; },
      async create(data) {
        const s = load();
        s.counters.admin = (s.counters.admin ?? 1) + 1;
        const admin = { active: 1, avatar: '', created_at: nowIso(), updated_at: nowIso(), ...data, id: s.counters.admin };
        s.admins.push(admin);
        save();
        return admin;
      },
      async update(id, patch) {
        const admin = load().admins.find((a) => String(a.id) === String(id));
        if (!admin) return null;
        Object.assign(admin, patch, { updated_at: nowIso() });
        save();
        return admin;
      },
      async remove(id) {
        const s = load();
        const idx = s.admins.findIndex((a) => String(a.id) === String(id));
        if (idx === -1) return false;
        s.admins.splice(idx, 1);
        save();
        return true;
      },
      async countActive() { return load().admins.filter((a) => a.active).length; }
    },

    sessions: {
      async create({ token, admin_id, expires_at }) {
        const s = load();
        s.sessions.push({ token, admin_id, created_at: nowIso(), expires_at });
        if (s.sessions.length > 200) s.sessions = s.sessions.slice(-200);
        save();
      },
      async find(token) {
        const sess = load().sessions.find((x) => x.token === token);
        if (!sess) return null;
        if (new Date(sess.expires_at).getTime() < Date.now()) return null;
        return sess;
      },
      async remove(token) {
        const s = load();
        s.sessions = s.sessions.filter((x) => x.token !== token);
        save();
      }
    },

    leads: {
      async insert(lead) { load().leads.unshift(lead); save(); return lead; },
      async get(id) { return load().leads.find((l) => String(l.id) === String(id)) || null; },
      async update(id, patch) {
        const lead = load().leads.find((l) => String(l.id) === String(id));
        if (!lead) return null;
        Object.assign(lead, patch, { updated_at: nowIso() });
        save();
        return lead;
      },
      async remove(id) {
        const s = load();
        const idx = s.leads.findIndex((l) => String(l.id) === String(id));
        if (idx === -1) return false;
        s.leads.splice(idx, 1);
        save();
        return true;
      },
      async all() { return load().leads.slice(); },
      async list({ status, priority, source, search, page = 1, limit = 50 } = {}) {
        let list = load().leads.slice();
        if (status && status !== 'all') list = list.filter((l) => l.status === status);
        if (priority && priority !== 'all') list = list.filter((l) => l.priority === priority);
        if (source && source !== 'all') list = list.filter((l) => l.source === source);
        if (search) {
          const q = search.toLowerCase();
          list = list.filter((l) => [l.name, l.email, l.company, l.service_interested, l.notes].some((v) => (v || '').toLowerCase().includes(q)));
        }
        list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const total = list.length;
        return { items: list.slice((page - 1) * limit, page * limit), total };
      }
    },

    activity: {
      async add(entry) {
        const s = load();
        s.activity.unshift({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, ...entry });
        if (s.activity.length > 500) s.activity.length = 500;
        save();
      },
      async recent(n = 12) { return load().activity.slice(0, n); }
    },

    records: {
      async list(kind) { return (load().records[kind] || []).slice(); },
      async get(kind, id) { return (load().records[kind] || []).find((x) => String(x.id) === String(id)) || null; },
      async insert(kind, data) {
        const s = load();
        if (!s.records[kind]) s.records[kind] = [];
        s.records[kind].unshift(data);
        save();
        return data;
      },
      async update(kind, id, patch) {
        const item = (load().records[kind] || []).find((x) => String(x.id) === String(id));
        if (!item) return null;
        Object.assign(item, patch, { id: item.id });
        save();
        return item;
      },
      async remove(kind, id) {
        const list = load().records[kind] || [];
        const idx = list.findIndex((x) => String(x.id) === String(id));
        if (idx === -1) return false;
        list.splice(idx, 1);
        save();
        return true;
      }
    },

    files: {
      async put({ category, filename, original_name, content_type, buffer }) {
        const safeCategory = (category || 'general').replace(/[^a-z0-9_-]/gi, '') || 'general';
        const dir = path.join(UPLOAD_DIR, safeCategory);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, filename), buffer);
        const s = load();
        s.counters.file = (s.counters.file ?? 0) + 1;
        const id = s.counters.file;
        const meta = { id, category: safeCategory, filename, original_name, content_type, size: buffer.length, url: `/uploads/${safeCategory}/${filename}`, created_at: nowIso() };
        s.files.unshift(meta);
        save();
        return meta;
      },
      async get(category, filename) {
        const p = path.join(UPLOAD_DIR, category, filename);
        if (!p.startsWith(UPLOAD_DIR) || !fs.existsSync(p)) return null;
        return { buffer: fs.readFileSync(p) };
      },
      async list(category) {
        const list = load().files.slice();
        return category ? list.filter((f) => f.category === category) : list;
      },
      async removeByUrl(url) {
        const s = load();
        const meta = s.files.find((f) => f.url === url || f.filename === url);
        if (meta) {
          try {
            const p = path.join(UPLOAD_DIR, meta.category, meta.filename);
            if (p.startsWith(UPLOAD_DIR) && fs.existsSync(p)) fs.unlinkSync(p);
          } catch {}
          s.files = s.files.filter((f) => f !== meta);
          save();
        }
      }
    }
  };

  return store;
}
