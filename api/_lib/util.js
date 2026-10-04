/** HTTP + parsing helpers shared by the local server and Vercel functions. */

import crypto from 'node:crypto';
import path from 'node:path';

export function readBody(req, limitBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > limitBytes) {
        reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export async function readJson(req, limitBytes = 2 * 1024 * 1024) {
  const buf = await readBody(req, limitBytes);
  if (!buf.length) return {};
  try {
    return JSON.parse(buf.toString('utf8'));
  } catch {
    throw Object.assign(new Error('Invalid JSON body'), { statusCode: 400 });
  }
}

/** Minimal multipart/form-data parser -> { fields: {}, files: [{ field, filename, contentType, buffer }] } */
export function parseMultipart(buffer, contentType) {
  const m = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  if (!m) throw Object.assign(new Error('Missing multipart boundary'), { statusCode: 400 });
  const boundary = '--' + (m[1] || m[2]).trim();
  const bBoundary = Buffer.from(boundary);
  const parts = [];
  let start = buffer.indexOf(bBoundary);
  while (start !== -1) {
    const next = buffer.indexOf(bBoundary, start + bBoundary.length);
    if (next === -1) break;
    let partStart = start + bBoundary.length;
    if (buffer[partStart] === 0x0d && buffer[partStart + 1] === 0x0a) partStart += 2;
    const partEnd = next - 2; // trailing CRLF
    if (partEnd > partStart) parts.push(buffer.subarray(partStart, partEnd));
    start = next;
  }

  const fields = {};
  const files = [];
  for (const part of parts) {
    const headerEnd = part.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;
    const headerText = part.subarray(0, headerEnd).toString('utf8');
    const body = part.subarray(headerEnd + 4);
    const nameMatch = /name="([^"]*)"/i.exec(headerText);
    const fileMatch = /filename="([^"]*)"/i.exec(headerText);
    const typeMatch = /content-type:\s*([^\r\n]+)/i.exec(headerText);
    const name = nameMatch ? nameMatch[1] : 'field';
    if (fileMatch && fileMatch[1]) {
      files.push({
        field: name,
        filename: path.basename(fileMatch[1]).replace(/[^\w.\- ]+/g, '_') || 'upload.bin',
        contentType: typeMatch ? typeMatch[1].trim() : 'application/octet-stream',
        buffer: body
      });
    } else {
      fields[name] = body.toString('utf8');
    }
  }
  return { fields, files };
}

export function parseCookies(req) {
  const out = {};
  const raw = req.headers.cookie || '';
  for (const pair of raw.split(';')) {
    const idx = pair.indexOf('=');
    if (idx > -1) out[pair.slice(0, idx).trim()] = decodeURIComponent(pair.slice(idx + 1).trim());
  }
  return out;
}

export function randomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

export function nowIso() {
  return new Date().toISOString();
}

export function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function sanitizeText(value, maxLen = 5000) {
  if (value === null || value === undefined) return null;
  return String(value).slice(0, maxLen);
}

export function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

/** Small in-memory sliding-window rate limiter (per serverless instance). */
const buckets = new Map();
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || now - entry.start > windowMs) {
    buckets.set(key, { start: now, count: 1 });
    if (buckets.size > 5000) buckets.clear();
    return true;
  }
  entry.count += 1;
  return entry.count <= limit;
}
