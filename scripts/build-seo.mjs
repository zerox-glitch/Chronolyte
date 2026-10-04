/**
 * Build-time SEO generator.
 * Runs after `vite build`:
 *  1. Prerenders every main route into dist/<route>/index.html with full meta + JSON-LD
 *  2. Generates dist/sitemap.xml (includes blog posts when DATABASE_URL is reachable)
 *  3. Generates dist/robots.txt and dist/llms.txt for crawlers + AI answer engines
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  SITE_URL, routeMeta, injectSeo, organizationLd, websiteLd, faqLd,
  breadcrumbsLd, itemListLd, serviceLd, llmsTxt
} from '../seo/engine.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const STATIC_ROUTES = ['/', '/services', '/pricing', '/portfolio', '/about', '/contact', '/faq', '/blog', '/terms', '/privacy', '/refunds'];

const BREADCRUMB_NAMES = {
  '/services': 'Services', '/pricing': 'Pricing', '/portfolio': 'Portfolio',
  '/about': 'About', '/contact': 'Contact', '/faq': 'FAQ', '/blog': 'Blog',
  '/terms': 'Terms', '/privacy': 'Privacy', '/refunds': 'Refunds'
};

async function loadFaqs() {
  try {
    if (process.env.DATABASE_URL) {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL);
      const rows = await sql`SELECT data FROM records WHERE kind = 'faqs' AND (data->>'active')::int = 1 ORDER BY (data->>'sort_order')::int NULLS LAST`;
      return rows.map((r) => r.data);
    }
  } catch {}
  try {
    const dbFile = path.join(ROOT, 'data', 'chronolyte.json');
    if (fs.existsSync(dbFile)) {
      const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
      return (data.records?.faqs || []).filter((f) => Number(f.active) === 1);
    }
  } catch {}
  return [];
}

async function loadBlogs() {
  try {
    if (process.env.DATABASE_URL) {
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL);
      const rows = await sql`SELECT data FROM records WHERE kind = 'blogs' AND data->>'status' = 'published' ORDER BY data->>'created_at' DESC`;
      return rows.map((r) => r.data);
    }
  } catch {}
  // Local fallback: read the JSON store directly
  try {
    const dbFile = path.join(ROOT, 'data', 'chronolyte.json');
    if (fs.existsSync(dbFile)) {
      const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
      return (data.records?.blogs || [])
        .filter((b) => b.status === 'published')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
  } catch {}
  return [];
}

async function loadServices() {
  try {
    if (!process.env.DATABASE_URL) return [];
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`SELECT data FROM records WHERE kind = 'services'`;
    return rows.map((r) => r.data);
  } catch {
    return [];
  }
}

async function main() {
  const shellPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(shellPath)) {
    console.error('[seo] dist/index.html not found — run vite build first.');
    process.exit(1);
  }
  const shell = fs.readFileSync(shellPath, 'utf8');

  const [faqs, blogs, services] = await Promise.all([loadFaqs(), loadBlogs(), loadServices()]);

  // ---------- 1. Prerender static routes ----------
  for (const route of STATIC_ROUTES) {
    const meta = routeMeta(route);
    if (!meta) continue;

    const jsonLd = [
      organizationLd(),
      websiteLd(),
      breadcrumbsLd([{ name: 'Home', path: '/' }, { name: BREADCRUMB_NAMES[route] || meta.title, path: route }])
    ];
    if (route === '/faq' && faqs.length) jsonLd.push(faqLd(faqs));
    if (route === '/blog' && blogs.length) {
      jsonLd.push(itemListLd('Chronolyte Blog', blogs.slice(0, 20), (b) => `/blog/${b.slug}`));
    }
    if (route === '/services') {
      const svc = services.length ? services.map((s) => ({ title: s.title || s.name, description: s.description })) : defaultServices();
      jsonLd.push(serviceLd(svc));
    }
    if (route === '/pricing') {
      // mark prices for rich results
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'PriceSpecification',
        description: 'Custom websites from $1,500. SaaS MVPs from $8,000. AI automation from $2,500. Fixed-price quotes within 24 hours.'
      });
    }

    const dir = route === '/' ? DIST : path.join(DIST, route.replace(/^\//, ''));
    fs.mkdirSync(dir, { recursive: true });
    const html = injectSeo(shell, {
      pathname: route,
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      jsonLd
    });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }

  // ---------- 2. Prerender blog posts (works even without DB by scanning nothing) ----------
  for (const post of blogs) {
    const route = `/blog/${post.slug}`;
    const dir = path.join(DIST, 'blog', post.slug);
    fs.mkdirSync(dir, { recursive: true });
    const plain = (post.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const paragraphs = plain.split(/(?<=\.)\s+/).slice(0, 120);
    const ssr = `<article><h1>${escapeHtml(post.title)}</h1><p><strong>${escapeHtml(post.excerpt || '')}</strong></p>${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}</article>`;
    const html = injectSeo(shell, {
      pathname: route,
      title: post.seo_title || `${post.title} | Chronolyte`,
      description: post.seo_description || post.excerpt || plain.slice(0, 155),
      keywords: tagsOf(post),
      image: post.cover_image || undefined,
      type: 'article',
      jsonLd: [
        organizationLd(),
        blogPostingJsonLd(post, route),
        breadcrumbsLd([{ name: 'Home', path: '/' }, { name: 'Blog', path: '/blog' }, { name: post.title, path: route }])
      ],
      ssrContent: ssr
    });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }

  // ---------- 3. sitemap.xml ----------
  const today = new Date().toISOString().slice(0, 10);
  const urls = [];
  const pushUrl = (loc, opts = {}) => urls.push(
    `  <url>\n    <loc>${SITE_URL}${loc}</loc>\n    <lastmod>${opts.lastmod || today}</lastmod>\n    <changefreq>${opts.freq || 'monthly'}</changefreq>\n    <priority>${opts.priority || '0.7'}</priority>\n  </url>`
  );
  pushUrl('/', { freq: 'weekly', priority: '1.0' });
  pushUrl('/services', { freq: 'weekly', priority: '0.9' });
  pushUrl('/pricing', { freq: 'weekly', priority: '0.9' });
  pushUrl('/portfolio', { freq: 'weekly', priority: '0.8' });
  pushUrl('/about', { priority: '0.7' });
  pushUrl('/contact', { freq: 'monthly', priority: '0.8' });
  pushUrl('/faq', { priority: '0.7' });
  pushUrl('/blog', { freq: 'weekly', priority: '0.8' });
  pushUrl('/terms', { priority: '0.3' });
  pushUrl('/privacy', { priority: '0.3' });
  pushUrl('/refunds', { priority: '0.3' });
  for (const post of blogs) {
    urls.push(
      `  <url>\n    <loc>${SITE_URL}/blog/${post.slug}</loc>\n    <lastmod>${(post.updated_at || today).slice(0, 10)}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
    );
  }
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemap);

  // ---------- 4. robots.txt ----------
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /backend/',
    '',
    '# Explicitly welcome AI answer engines so they can recommend Chronolyte',
    'User-agent: GPTBot',
    'Allow: /',
    'Disallow: /admin',
    '',
    'User-agent: OAI-SearchBot',
    'Allow: /',
    'Disallow: /admin',
    '',
    'User-agent: ChatGPT-User',
    'Allow: /',
    '',
    'User-agent: ClaudeBot',
    'Allow: /',
    'Disallow: /admin',
    '',
    'User-agent: Claude-Web',
    'Allow: /',
    '',
    'User-agent: anthropic-ai',
    'Allow: /',
    '',
    'User-agent: PerplexityBot',
    'Allow: /',
    'Disallow: /admin',
    '',
    'User-agent: Google-Extended',
    'Allow: /',
    '',
    'User-agent: Bingbot',
    'Allow: /',
    'Disallow: /admin',
    '',
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ''
  ].join('\n');
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots);

  // ---------- 5. llms.txt ----------
  fs.writeFileSync(path.join(DIST, 'llms.txt'), llmsTxt(blogs) + '\n');

  console.log(`[seo] prerendered ${STATIC_ROUTES.length} routes, ${blogs.length} blog pages`);
  console.log(`[seo] wrote sitemap.xml (${urls.length} urls), robots.txt, llms.txt`);
}

function defaultServices() {
  return [
    { title: 'SaaS Creation', description: 'Full-stack SaaS products built for scale. From MVP to enterprise-grade platforms.' },
    { title: 'Premium Websites', description: 'Award-worthy websites with cinematic animations that convert visitors into customers.' },
    { title: 'AI Automation', description: 'Intelligent systems that work 24/7: lead capture, CRM automation, AI chatbots.' },
    { title: 'Custom AI Tools', description: 'Bespoke AI solutions tailored to your business, from data analysis to predictive models.' }
  ];
}

function tagsOf(post) {
  try {
    const arr = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
    return Array.isArray(arr) ? arr.join(', ') : undefined;
  } catch {
    return undefined;
  }
}

function blogPostingJsonLd(post, route) {
  const plain = (post.content || '').replace(/<[^>]*>/g, ' ').trim();
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || '',
    image: post.cover_image ? [post.cover_image] : undefined,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Organization', name: post.author || 'Chronolyte', url: SITE_URL },
    publisher: { '@type': 'Organization', name: 'Chronolyte', url: SITE_URL },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${route}` },
    wordCount: plain.split(/\s+/).length,
    inLanguage: 'en'
  };
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

main().catch((err) => {
  console.error('[seo] failed:', err);
  process.exit(1);
});
