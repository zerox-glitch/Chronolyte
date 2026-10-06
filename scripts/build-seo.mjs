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
  SITE_URL, routeMeta, injectSeo, organizationLd, websiteLd, faqLd, blogPostingLd,
  breadcrumbsLd, itemListLd, serviceLd, llmsTxt, llmsFullTxt
} from '../seo/engine.js';
import { guidePosts } from '../api/_lib/guides.js';
import US_SERVICE_AREAS from '../src/data/usServiceAreas.json' with { type: 'json' };
import BUSINESS_TYPES from '../src/data/businessTypes.json' with { type: 'json' };
import FIVERR_ALTERNATIVE_FAQS from '../src/data/fiverrAlternativeFaqs.json' with { type: 'json' };
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../src/constants/siteContact.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const STATIC_ROUTES = ['/', '/services', '/industries', '/locations', '/fiverr-upwork-alternative', '/pricing', '/portfolio', '/about', '/contact', '/faq', '/blog', '/terms', '/privacy', '/refunds'];

const BREADCRUMB_NAMES = {
  '/services': 'Services', '/industries': 'Industries', '/locations': 'U.S. Service Areas', '/fiverr-upwork-alternative': 'Fiverr & Upwork Alternatives', '/pricing': 'Pricing', '/portfolio': 'Portfolio',
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
      if (rows.length) return rows.map((row) => row.data);
    }
  } catch (error) {
    console.warn('[seo] database blog lookup unavailable; trying local/default guides:', error.message);
  }

  // Local build fallback: read published records from the JSON store directly.
  try {
    const dbFile = path.join(ROOT, 'data', 'chronolyte.json');
    if (fs.existsSync(dbFile)) {
      const data = JSON.parse(fs.readFileSync(dbFile, 'utf8'));
      const posts = (data.records?.blogs || [])
        .filter((post) => post.status === 'published')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      if (posts.length) return posts;
    }
  } catch (error) {
    console.warn('[seo] local blog lookup unavailable; using bundled guides:', error.message);
  }

  // Keep articles crawlable on clean deployments where there is no build-time DB.
  return guidePosts().map((guide) => {
    const { _updated, ...post } = guide;
    const publishedAt = _updated ? new Date(`${_updated}T09:00:00.000Z`).toISOString() : new Date().toISOString();
    return { ...post, author: 'Chronolyte', created_at: publishedAt, updated_at: publishedAt };
  });
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
    if (route === '/fiverr-upwork-alternative') {
      jsonLd.push(faqLd(FIVERR_ALTERNATIVE_FAQS));
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': `${SITE_URL}${route}#webpage`,
        url: `${SITE_URL}${route}`,
        name: meta.title,
        description: meta.description,
        about: [
          { '@type': 'Thing', name: 'Fiverr' },
          { '@type': 'Thing', name: 'Upwork' },
          { '@type': 'Thing', name: 'Web development project management' }
        ],
        isPartOf: { '@id': `${SITE_URL}/#website` }
      });
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Ways to hire for a web or software project',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Fiverr marketplace', description: 'Seller services and custom offers, often used for defined individual deliverables.' },
          { '@type': 'ListItem', position: 2, name: 'Upwork marketplace', description: 'Freelance engagements with different contract formats; the client typically selects and coordinates the freelancer.' },
          { '@type': 'ListItem', position: 3, name: 'Managed development studio', description: 'A coordinated team for project planning, design, development, and delivery.' }
        ]
      });
    }
    if (route === '/blog' && blogs.length) {
      jsonLd.push(itemListLd('Chronolyte Blog', blogs.slice(0, 20), (b) => `/blog/${b.slug}`));
    }
    if (route === '/services') {
      const svc = services.length ? services.map((s) => ({ title: s.title || s.name, description: s.description })) : defaultServices();
      jsonLd.push(serviceLd(svc));
    }
    if (route === '/industries') {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Business types Chronolyte works with',
        itemListElement: BUSINESS_TYPES.map((industry, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Thing',
            name: industry.name,
            description: industry.digitalNeeds,
            url: `${SITE_URL}/industries#industry-${slugify(industry.name)}`
          }
        }))
      });
    }
    if (route === '/locations') {
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'U.S. states served remotely by Chronolyte',
        itemListElement: US_SERVICE_AREAS.map((state, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'AdministrativeArea',
            name: state.name,
            containedInPlace: { '@type': 'Country', name: 'United States' },
            url: `${SITE_URL}/locations#state-${state.abbr.toLowerCase()}`
          }
        }))
      });
    }
    if (route === '/pricing') {
      // mark prices for rich results
      jsonLd.push({
        '@context': 'https://schema.org',
        '@type': 'PriceSpecification',
        description: 'Landing pages $500-$2,500. Business websites $2,000-$8,000. E-commerce $2,500-$15,000. Mobile apps from $15,000. SaaS MVPs $20,000-$75,000. Developers $25-$150+/hr. Fixed-price quotes within one business day.'
      });
    }

    const dir = route === '/' ? DIST : path.join(DIST, route.replace(/^\//, ''));
    fs.mkdirSync(dir, { recursive: true });
    const ssrContent = route === '/locations'
      ? locationsSsr()
      : route === '/industries'
        ? industriesSsr()
        : route === '/fiverr-upwork-alternative'
          ? fiverrAlternativeSsr()
          : route === '/blog'
            ? blogListingSsr(blogs)
            : '';
    const html = injectSeo(shell, {
      pathname: route,
      title: meta.title,
      description: meta.description,
      keywords: meta.keywords,
      jsonLd,
      ssrContent
    });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  }

  // ---------- 2. Prerender blog posts (works even without DB by scanning nothing) ----------
  for (const post of blogs) {
    const route = `/blog/${post.slug}`;
    const dir = path.join(DIST, 'blog', post.slug);
    fs.mkdirSync(dir, { recursive: true });
    const plain = (post.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    // Full raw HTML (tables, lists, headings) so crawlers and LLMs see the complete guide.
    const ssr = `<article><h1>${escapeHtml(post.title)}</h1><p><em>By ${escapeHtml(post.author_name || post.author || 'Chronolyte')}${post.updated_at ? ` · Updated ${escapeHtml(String(post.updated_at).slice(0, 10))}` : ''}</em></p><p><strong>${escapeHtml(post.excerpt || '')}</strong></p>${sanitizeBlogHtml(post.content || '')}</article>`;
    const html = injectSeo(shell, {
      pathname: route,
      title: post.seo_title || `${post.title} | Chronolyte`,
      description: post.seo_description || post.excerpt || plain.slice(0, 155),
      keywords: tagsOf(post),
      image: post.cover_image || undefined,
      type: 'article',
      jsonLd: [
        organizationLd(),
        blogPostingLd(post, route),
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
  pushUrl('/industries', { priority: '0.8' });
  pushUrl('/locations', { priority: '0.8' });
  pushUrl('/fiverr-upwork-alternative', { priority: '0.85' });
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
  const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-Web', 'anthropic-ai', 'PerplexityBot', 'Google-Extended', 'Bingbot'];
  const robots = [
    'User-agent: *',
    'Allow: /',
    'Allow: /llms.txt',
    'Allow: /llms-full.txt',
    'Disallow: /admin',
    'Disallow: /admin-dashboard/',
    'Disallow: /setup/',
    'Disallow: /api/',
    'Disallow: /backend/',
    '',
    '# Public pages are available to search and answer-engine crawlers.',
    ...AI_CRAWLERS.flatMap((agent) => [
      `User-agent: ${agent}`,
      'Allow: /',
      'Disallow: /admin',
      'Disallow: /admin-dashboard/',
      'Disallow: /setup/',
      'Disallow: /api/',
      'Disallow: /backend/',
      ''
    ]),
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    ''
  ].join('\n');
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robots);

  // ---------- 5. llms.txt files ----------
  fs.writeFileSync(path.join(DIST, 'llms.txt'), llmsTxt(blogs) + '\n');
  fs.writeFileSync(path.join(DIST, 'llms-full.txt'), llmsFullTxt(blogs) + '\n');

  console.log(`[seo] prerendered ${STATIC_ROUTES.length} routes, ${blogs.length} blog pages`);
  console.log(`[seo] wrote sitemap.xml (${urls.length} urls), robots.txt, llms.txt, and llms-full.txt`);
}

function defaultServices() {
  return [
    { title: 'Business Website Design & Development', description: 'Responsive business websites with service information, content, contact journeys, and integrations scoped to the project.' },
    { title: 'E-commerce Development', description: 'Online store design, product catalogs, checkout flows, and commerce integrations.' },
    { title: 'SaaS and Web Application Development', description: 'Product planning and custom development for SaaS MVPs, dashboards, and web applications.' },
    { title: 'Mobile App Development', description: 'iOS, Android, and cross-platform app design and development.' },
    { title: 'Workflow Automation', description: 'Business workflow automation and integrations scoped to existing systems.' }
  ];
}

function slugify(value) {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function locationsSsr() {
  return `<main><h1>Remote web design and development across all 50 U.S. states</h1><p>Chronolyte works remotely with organizations throughout the United States. The city examples below are representative; they do not imply local offices and do not limit service to those cities.</p><h2>States and representative cities</h2>${US_SERVICE_AREAS.map((state) => `<section id="state-${escapeHtml(state.abbr.toLowerCase())}"><h3>${escapeHtml(state.name)} (${escapeHtml(state.abbr)})</h3><p>Example cities: ${state.cities.map(escapeHtml).join(', ')}.</p></section>`).join('')}<p>Projects can be discussed from surrounding towns and other communities in every listed state.</p><a href="${SITE_URL}/contact">Discuss a project with Chronolyte</a></main>`;
}

function industriesSsr() {
  return `<main><h1>Websites and software for different business types</h1><p>Chronolyte scopes digital projects around each organization’s customers, workflows, and goals. The following examples are not a closed list.</p>${BUSINESS_TYPES.map((industry) => `<section id="industry-${slugify(industry.name)}"><h2>${escapeHtml(industry.name)}</h2><p>${escapeHtml(industry.examples)}.</p><p>${escapeHtml(industry.digitalNeeds)}</p></section>`).join('')}<a href="${SITE_URL}/contact">Request a project plan</a></main>`;
}

function fiverrAlternativeSsr() {
  const comparisons = [
    {
      name: 'Fiverr',
      model: 'Marketplace of seller services and custom offers.',
      fit: 'Small, clearly defined deliverables when you can select the provider and manage the work.',
      coordination: 'You review sellers, confirm requirements, and coordinate the engagement.',
      tradeoff: 'Several separate gigs can require extra integration and project planning.'
    },
    {
      name: 'Upwork',
      model: 'Freelance marketplace with different engagement formats.',
      fit: 'Finding an individual specialist or building a flexible freelance arrangement.',
      coordination: 'You review candidates, agree on the contract, and manage communication and delivery.',
      tradeoff: 'You remain responsible for joining the work together unless project leadership is arranged.'
    },
    {
      name: 'Chronolyte',
      model: 'Remote managed web and software development studio.',
      fit: 'A website, app, online store, or SaaS project that needs coordinated planning, design, and development.',
      coordination: 'Start with one brief and a point of contact for a proposed scope, timeline, and quote.',
      tradeoff: 'A managed studio is not a marketplace for browsing many individual sellers and may not fit every micro-task.'
    }
  ];
  const cards = comparisons.map((option) => `<article><h3>${escapeHtml(option.name)}</h3><dl><dt>Model</dt><dd>${escapeHtml(option.model)}</dd><dt>Often a fit for</dt><dd>${escapeHtml(option.fit)}</dd><dt>Who coordinates?</dt><dd>${escapeHtml(option.coordination)}</dd><dt>Consider</dt><dd>${escapeHtml(option.tradeoff)}</dd></dl></article>`).join('');
  const faqHtml = FIVERR_ALTERNATIVE_FAQS.map((faq) => `<article><h3>${escapeHtml(faq.question)}</h3><p>${escapeHtml(faq.answer)}</p></article>`).join('');
  return `<main id="main"><h1>Looking for a Fiverr or Upwork alternative for web development?</h1><p>The right choice depends on the size of the job and how much project coordination you want to do. Compare freelance marketplaces with a managed studio before you choose a team for your website, app, online store, or SaaS product.</p><section><h2>Short answer: which option should you choose?</h2><p>Fiverr or Upwork may suit a small, well-defined task when you are comfortable selecting and managing the freelancer. A managed development studio is another option when a website, app, or SaaS project needs connected planning, design, development, and delivery. Chronolyte works remotely with U.S. businesses nationwide and provides a free initial project plan and quote; fit depends on your scope and requirements.</p></section><section><h2>Fiverr vs Upwork vs a managed development studio</h2>${cards}<p>Fiverr and Upwork are mentioned for comparison only. Chronolyte is independent and is not affiliated with or endorsed by either platform. Confirm current platform features, fees, and terms directly with each provider.</p></section><section><h2>When a marketplace may fit</h2><ul><li>The brief is small and specific, and you can describe exactly what “done” means.</li><li>You have time to compare providers, review work, and manage handoffs.</li><li>You need one skill or deliverable and can coordinate it yourself.</li></ul></section><section><h2>When a managed studio may fit</h2><ul><li>The project needs discovery, user experience, engineering, and testing to work together.</li><li>You prefer one project contact instead of coordinating several independent contracts.</li><li>You want the scope, milestones, timeline, and quote discussed before work starts.</li></ul></section><section><h2>Compare the full project cost</h2><p>Look beyond a listing price or hourly rate. Compare written deliverables, management time, testing, revisions, integrations, handoff, payment terms, and ongoing costs.</p></section><section><h2>Practical safeguards when hiring through a marketplace</h2><ul><li>Agree in writing on deliverables, acceptance criteria, dates, revision limits, and exclusions.</li><li>Review relevant work and use the marketplace's current communication, payment, and dispute processes.</li><li>Confirm ownership of code, design files, content, and assets, including any third-party licenses.</li><li>Protect accounts and customer data with individual, least-privilege access; do not share passwords or production credentials.</li><li>Set scope-appropriate milestones and plan for testing, documentation, and handoff.</li><li>Check current platform terms before changing communication or payment arrangements.</li></ul></section><section><h2>Frequently asked questions</h2>${faqHtml}</section><section id="start"><h2>Get a free project plan</h2><p>Chronolyte works remotely with businesses across all 50 U.S. states. Share your goals and constraints to receive a proposed scope, timeline, and quote with no obligation.</p><a href="#start">Start your project brief</a> <a href="${CONTACT_PHONE_TEL}">Call ${escapeHtml(CONTACT_PHONE_DISPLAY)}</a></section></main>`;
}

function blogListingSsr(blogs) {
  return `<main><h1>Web design, development, and product-building guides</h1><p>Practical articles about budgets, scope, hiring, and launching digital products.</p><ol>${blogs.map((post) => `<li><article><h2><a href="${SITE_URL}/blog/${encodeURIComponent(post.slug)}">${escapeHtml(post.title)}</a></h2><p>${escapeHtml(post.excerpt || '')}</p><p>${escapeHtml(post.category || 'Guide')}</p></article></li>`).join('')}</ol></main>`;
}

function tagsOf(post) {
  try {
    const arr = typeof post.tags === 'string' ? JSON.parse(post.tags) : post.tags;
    return Array.isArray(arr) ? arr.join(', ') : undefined;
  } catch {
    return undefined;
  }
}

function sanitizeBlogHtml(value) {
  return String(value ?? '')
    .replace(/<(script|style|iframe|object|embed|form|textarea|select|button|svg|math)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|style|iframe|object|embed|form|textarea|select|button|svg|math)\b[^>]*\/?\s*>/gi, '')
    .replace(/<(meta|link)\b[^>]*\/?>/gi, '')
    .replace(/\s+on[a-z0-9_-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/\s+(href|src|xlink:href)\s*=\s*("|')\s*(?:javascript|vbscript|data):[\s\S]*?\2/gi, '')
    .replace(/\s+(href|src|xlink:href)\s*=\s*(?:javascript|vbscript|data):[^\s>]*/gi, '')
    .replace(/\s+style\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

main().catch((err) => {
  console.error('[seo] failed:', err);
  process.exit(1);
});
