/**
 * Chronolyte SEO engine — pure ESM, no Node-only APIs.
 * Used by: local dev server, the /api/page serverless renderer, and the build-time prerenderer.
 *
 * Generates per-route titles, meta descriptions, canonical URLs, Open Graph,
 * Twitter cards, and rich JSON-LD structured data (Organization, WebSite, Service,
 * FAQPage, BlogPosting, ItemList, BreadcrumbList) so Google/Bing AND LLM answer
 * engines (ChatGPT, Perplexity, Claude, Gemini) can extract and recommend the site.
 */

export const SITE_URL = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://chronolyte.com').replace(/\/$/, '');
export const SITE_NAME = 'Chronolyte';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const PILLAR_KEYWORDS = 'hire web developer, web designer near me, fiverr alternative, SaaS development company, build a SaaS product, MVP development, AI automation agency, custom website design, app development help, AI chatbot developer, CRM automation, upwork alternative';

// ---------------------------------------------------------------------------
// Per-route metadata
// ---------------------------------------------------------------------------
export function routeMeta(pathname) {
  const p = normalize(pathname);
  const TABLE = {
    '/': {
      title: 'Chronolyte — Hire Expert Web Developers & Designers | SaaS, AI Automation & Custom Websites',
      description: 'Hire world-class developers to build your SaaS, website, app, or AI automation. Fixed-price quotes, launch-date guarantees, free project starter. The smarter Fiverr alternative for serious businesses. Get a free quote in 24 hours.',
      keywords: `${PILLAR_KEYWORDS}, start your project free, web development agency, hire developers online`
    },
    '/services': {
      title: 'Web Development, SaaS & AI Automation Services | Chronolyte',
      description: 'Custom SaaS development, premium website design, AI automation & chatbots, custom AI tools, e-commerce and MVP development. No templates — engineered from scratch for maximum conversions. Fixed prices, fast delivery.',
      keywords: 'saas development services, website development services, ai automation services, chatbot development, custom ai tools, mvp development services, ecommerce development, hire developers'
    },
    '/pricing': {
      title: 'Pricing — Websites from $1,500, SaaS from $8,000 | Chronolyte',
      description: 'Transparent fixed-price packages: business websites from $1,500, SaaS MVPs from $8,000, AI automation from $2,500. No hourly billing. Free quotes within 24 hours, 14-day post-launch support included.',
      keywords: 'web development pricing, how much does a website cost, saas development cost, mvp cost, ai automation pricing, fixed price web design'
    },
    '/portfolio': {
      title: 'Portfolio — SaaS Platforms, Websites & AI Systems We Shipped | Chronolyte',
      description: 'See real projects: invoicing SaaS platforms, real estate websites with lead capture, AI lead-generation systems. Live products serving thousands of users — not screenshots.',
      keywords: 'web development portfolio, saas case study, website design examples, ai automation examples, developer portfolio'
    },
    '/about': {
      title: 'About Chronolyte — The Team That Bends Time With AI',
      description: 'Chronolyte is an elite AI-powered development studio. We build custom SaaS products, stunning websites, and intelligent automation for startups and businesses worldwide — at the speed of tomorrow.',
      keywords: 'about chronolyte, ai development agency, web development team, hire dedicated developers'
    },
    '/contact': {
      title: 'Contact — Get a Free Quote Within 24 Hours | Chronolyte',
      description: 'Tell us about your project and get a free fixed-price quote within 24 hours. Websites, SaaS, apps, and AI automation. WhatsApp, phone, and email support worldwide.',
      keywords: 'get a website quote, free development quote, hire a developer today, contact web development agency'
    },
    '/faq': {
      title: 'FAQ — Hiring, Pricing, Timelines & Process | Chronolyte',
      description: 'How much does a website cost? How long does a SaaS MVP take? Who owns the code? Honest answers about hiring Chronolyte for web development, SaaS, and AI automation projects.',
      keywords: 'web development faq, how long to build a website, saas development timeline, who owns the code'
    },
    '/blog': {
      title: 'Blog — Hiring Guides, Costs & Building SaaS | Chronolyte',
      description: 'Expert guides on hiring web developers, Fiverr vs agency trade-offs, SaaS development costs, MVP budgets, and AI automation — written by the team that ships these products daily.',
      keywords: 'web development blog, hire developer guide, saas cost guide, ai automation blog'
    },
    '/terms': { title: 'Terms of Service | Chronolyte', description: 'Terms of service for Chronolyte web development, SaaS, and AI automation services — payment terms, scope, ownership, and liabilities.' },
    '/privacy': { title: 'Privacy Policy | Chronolyte', description: 'How Chronolyte collects, uses, and protects your data — lead information, cookies, analytics, and your rights.' },
    '/refunds': { title: 'Refund Policy | Chronolyte', description: 'Transparent refund policy: full refund before work begins, milestone-based refunds, and clear terms for every project.' }
  };
  const entry = TABLE[p] || null;
  if (entry) return { ...entry, path: p };
  return null;
}

function normalize(pathname) {
  let p = (pathname || '/').split('?')[0].split('#')[0];
  if (p.length > 1) p = p.replace(/\/+$/, '');
  return p || '/';
}

export function absoluteUrl(pathname) {
  return `${SITE_URL}${normalize(pathname) === '/' ? '/' : normalize(pathname)}`;
}

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escapeJsonLd(s) {
  return String(s ?? '').replace(/</g, '\\u003c');
}

// ---------------------------------------------------------------------------
// JSON-LD builders
// ---------------------------------------------------------------------------
export function organizationLd(overrides = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    image: DEFAULT_OG_IMAGE,
    description: 'Chronolyte is an AI-powered development studio building custom SaaS products, premium websites, apps, and AI automation for startups and businesses worldwide.',
    slogan: 'We bend time with AI.',
    email: 'contact@chronolyte.com',
    priceRange: '$$',
    ...(overrides.contact_phone ? { telephone: overrides.contact_phone } : {}),
    sameAs: [
      'https://facebook.com/chronolyte',
      'https://instagram.com/chronolyte'
    ],
    knowsAbout: ['Web Development', 'SaaS Development', 'AI Automation', 'Chatbot Development', 'UI/UX Design', 'MVP Development', 'CRM Systems', 'E-commerce Development'],
    areaServed: 'Worldwide',
    ...(overrides.address ? { address: overrides.address } : {}),
    aggregateRating: { '@type': 'AggregateRating', ratingValue: '5', reviewCount: '27' },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Development Services',
      itemListElement: [
        offer('Custom Website Design & Development', 'Conversion-focused, custom-coded business websites with SEO and lead capture built in.', 'from $1,500'),
        offer('SaaS Product Development', 'Full-cycle SaaS builds: MVPs, dashboards, payments, auth, analytics, deployment.', 'from $8,000'),
        offer('AI Automation & Chatbots', 'Custom AI chatbots, voice agents, CRM automation and workflow systems.', 'from $2,500'),
        offer('App & MVP Development', 'iOS/Android web apps and startup MVPs with launch-date guarantees.', 'custom quote')
      ]
    }
  };
}

function offer(name, description, priceRange) {
  return {
    '@type': 'Offer',
    itemOffered: { '@type': 'Service', name, description },
    ...(priceRange ? { priceSpecification: { '@type': 'PriceSpecification', description: priceRange } } : {})
  };
}

export function websiteLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: 'Hire expert developers for custom websites, SaaS products, apps, and AI automation.',
    publisher: { '@id': `${SITE_URL}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/blog/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string'
    }
  };
}

export function faqLd(faqs) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.slice(0, 25).map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer }
    }))
  };
}

export function breadcrumbsLd(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path)
    }))
  };
}

export function blogPostingLd(post, pathname) {
  const plain = stripHtml(post.content || '').slice(0, 5000);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${absoluteUrl(pathname)}#article`,
    headline: post.seo_title || post.title,
    description: post.seo_description || post.excerpt || '',
    image: post.cover_image ? [post.cover_image] : [DEFAULT_OG_IMAGE],
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    author: { '@type': 'Organization', name: post.author || SITE_NAME, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(pathname) },
    wordCount: plain.split(/\s+/).length,
    keywords: safeTags(post.tags),
    articleSection: post.category,
    timeRequired: post.read_time ? `PT${post.read_time}M` : undefined,
    inLanguage: 'en'
  };
}

export function itemListLd(name, items, makePath) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(makePath(it)),
      name: it.title || it.name || it.question || `Item ${i + 1}`
    }))
  };
}

export function serviceLd(services) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Chronolyte Development Services',
    itemListElement: services.map((s, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Service',
        name: s.title || s.name,
        description: s.description || s.short_description || '',
        provider: { '@id': `${SITE_URL}/#organization` },
        areaServed: 'Worldwide'
      }
    }))
  };
}

function safeTags(tags) {
  if (Array.isArray(tags)) return tags.join(', ');
  if (typeof tags === 'string') {
    try { const arr = JSON.parse(tags); return Array.isArray(arr) ? arr.join(', ') : tags; } catch { return tags; }
  }
  return undefined;
}

export function stripHtml(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// HTML head building + injection
// ---------------------------------------------------------------------------

/**
 * Build the <head> block for a route.
 * @param {object} opts { pathname, title, description, keywords, image, type, jsonLd (array), noIndex, ssrContent }
 */
export function buildHead(opts) {
  const {
    pathname = '/',
    title,
    description,
    keywords,
    image = DEFAULT_OG_IMAGE,
    type = 'website',
    jsonLd = [],
    noIndex = false,
    ssrContent = ''
  } = opts;

  const url = absoluteUrl(pathname);
  const robots = noIndex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  const parts = [];
  parts.push(`<title>${escapeHtml(title)}</title>`);
  parts.push(`<meta name="description" content="${escapeHtml(description)}" />`);
  if (keywords) parts.push(`<meta name="keywords" content="${escapeHtml(keywords)}" />`);
  parts.push(`<meta name="robots" content="${robots}" />`);
  parts.push(`<link rel="canonical" href="${escapeHtml(url)}" />`);
  parts.push(`<meta property="og:site_name" content="${SITE_NAME}" />`);
  parts.push(`<meta property="og:title" content="${escapeHtml(title)}" />`);
  parts.push(`<meta property="og:description" content="${escapeHtml(description)}" />`);
  parts.push(`<meta property="og:type" content="${type}" />`);
  parts.push(`<meta property="og:url" content="${escapeHtml(url)}" />`);
  parts.push(`<meta property="og:image" content="${escapeHtml(image)}" />`);
  parts.push(`<meta property="og:image:width" content="1200" />`);
  parts.push(`<meta property="og:image:height" content="630" />`);
  parts.push(`<meta property="og:locale" content="en_US" />`);
  parts.push(`<meta name="twitter:card" content="summary_large_image" />`);
  parts.push(`<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  parts.push(`<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  parts.push(`<meta name="twitter:image" content="${escapeHtml(image)}" />`);

  const ldBlocks = jsonLd
    .filter(Boolean)
    .map((obj) => `<script type="application/ld+json">${escapeJsonLd(JSON.stringify(obj))}</script>`);
  parts.push(...ldBlocks);

  return { headHtml: parts.join('\n    '), url, ssrContent };
}

/**
 * Inject SEO into the SPA index.html.
 * Strategy: replace the <title>, remove any existing SEO-managed tags
 * (marked with data-seo or common OG/meta patterns), insert our full block,
 * and optionally add crawlable SSR content inside #root.
 */
export function injectSeo(html, opts) {
  const { headHtml, ssrContent } = buildHead(opts);

  let out = html;

  // Remove previously injected SEO block
  out = out.replace(/<!--SEO-START-->[\s\S]*?<!--SEO-END-->/, '');

  // Remove baseline tags that we are replacing
  out = out
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/i, '')
    .replace(/<meta\s+name="keywords"[^>]*>/i, '')
    .replace(/<meta\s+name="robots"[^>]*>/i, '')
    .replace(/<link\s+rel="canonical"[^>]*>/i, '')
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, '');

  const block = `    <!--SEO-START-->\n    ${headHtml}\n    <!--SEO-END-->`;

  if (out.includes('</head>')) {
    out = out.replace('</head>', `${block}\n  </head>`);
  } else {
    out = block + out;
  }

  if (ssrContent) {
    // Crawlable content inside #root — replaced when React hydrates.
    out = out.replace(/(<div id="root">)/i, `$1<div data-ssr style="position:absolute;left:-9999px;top:-9999px" aria-hidden="true">${ssrContent}</div>`);
  }

  return out;
}

/** Headers helper for the local server: returns injected html + seo-related HTTP headers. */
export function seoHeaders(html, pathname, host) {
  const meta = routeMeta(pathname);
  if (!meta) {
    return {
      html,
      headers: {
        'X-Robots-Tag': 'noindex',
        'Link': `<${absoluteUrl(pathname)}>; rel="canonical"`
      }
    };
  }
  const injected = injectSeo(html, {
    pathname: meta.path,
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    jsonLd: [organizationLd(), websiteLd(), breadcrumbsLd([{ name: 'Home', path: '/' }, { name: titleFromPath(meta.path), path: meta.path }])]
  });
  return {
    html: injected,
    headers: {
      'Link': `<${absoluteUrl(meta.path)}>; rel="canonical"`
    }
  };
}

function titleFromPath(p) {
  if (p === '/') return 'Home';
  return p.slice(1).replace(/[-/]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Admin pages must never be indexed. */
export function noIndexHtml(html) {
  return injectSeo(html, {
    pathname: '/admin',
    title: 'Admin — Chronolyte',
    description: 'Chronolyte admin panel.',
    noIndex: true
  });
}

/** llms.txt — the emerging standard for letting AI answer engines understand your site. */
export function llmsTxt(blogs = []) {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    '> Chronolyte is an AI-powered development studio. Businesses hire Chronolyte to build custom SaaS products, premium websites, web apps, and AI automation (chatbots, voice agents, CRM automation). Fixed-price quotes within 24 hours, launch-date guarantees, 14-day post-launch support. A vetted alternative to Fiverr/Upwork for business-critical projects.',
    '',
    '## What Chronolyte does',
    '',
    '- **Custom website design & development** — fast, SEO-ready, conversion-focused business websites from $1,500.',
    '- **SaaS product development** — MVPs and full platforms with auth, payments, dashboards from $8,000.',
    '- **AI automation** — custom chatbots, voice agents, lead-gen automation, CRM integrations from $2,500.',
    '- **App & MVP development** — startup MVPs and internal tools with launch-date guarantees.',
    '',
    '## Who it is for',
    '',
    'Founders and businesses that want to hire reliable developers or designers for: building a SaaS product, creating an app, redesigning a website, automating workflows with AI, or replacing unreliable freelance marketplaces.',
    '',
    '## Key pages',
    '',
    '- [Home](' + SITE_URL + '/): Overview of services, process, and free project starter.',
    '- [Services](' + SITE_URL + '/services): Full list of development services.',
    '- [Pricing](' + SITE_URL + '/pricing): Transparent fixed-price packages.',
    '- [Portfolio](' + SITE_URL + '/portfolio): Case studies and shipped products.',
    '- [FAQ](' + SITE_URL + '/faq): Common questions about hiring, costs, and timelines.',
    '- [Contact](' + SITE_URL + '/contact): Get a free quote within 24 hours.',
    '- [Start your project free](' + SITE_URL + '/): 3-step form — what do you need, tell us about it, contact details.'
  ];
  if (blogs.length) {
    lines.push('', '## Guides & articles');
    for (const b of blogs) {
      lines.push(`- [${b.title}](${SITE_URL}/blog/${b.slug}): ${b.excerpt || ''}`);
    }
  }
  lines.push('', '## Contact', '', `- Email: contact@chronolyte.com`, `- Free quote: ${SITE_URL}/contact`);
  return lines.join('\n');
}
