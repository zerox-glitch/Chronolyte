/**
 * Chronolyte SEO engine — pure ESM, no Node-only APIs.
 * Used by: local dev server, the /api/page serverless renderer, and the build-time prerenderer.
 *
 * Generates per-route titles, meta descriptions, canonical URLs, Open Graph,
 * Twitter cards, and structured data (Organization, WebSite, Service,
 * FAQPage, BlogPosting, ItemList, BreadcrumbList) to make public site information
 * clearer to search engines and other crawlers.
 */

import { CONTACT_PHONE_E164, CONTACT_PHONE_DISPLAY } from '../src/constants/siteContact.js';
import US_SERVICE_AREAS from '../src/data/usServiceAreas.json' with { type: 'json' };
import BUSINESS_TYPES from '../src/data/businessTypes.json' with { type: 'json' };

export const SITE_URL = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://chronolyte.com').replace(/\/$/, '');
export const SITE_NAME = 'Chronolyte';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

const PILLAR_KEYWORDS = 'website design and development, custom business websites, e-commerce development, SaaS and MVP development, mobile app development, AI automation, remote web development for U.S. businesses';

// ---------------------------------------------------------------------------
// Per-route metadata
// ---------------------------------------------------------------------------
export function routeMeta(pathname) {
  const p = normalize(pathname);
  const TABLE = {
    '/': {
      title: 'Website Design & Development Across the U.S. | Chronolyte',
      description: 'Custom websites, e-commerce, SaaS, apps, and AI automation for businesses in all 50 U.S. states. Get a free scope, timeline, and project quote.',
      keywords: `${PILLAR_KEYWORDS}, website design company, small business web design, U.S. web development studio`
    },
    '/services': {
      title: 'Website, E-commerce, SaaS & App Development Services | Chronolyte',
      description: 'Plan and build custom business websites, online stores, SaaS products, mobile apps, and workflow automation. Remote delivery for U.S. businesses, with a clear scope and quote.',
      keywords: 'business website design, e-commerce development, SaaS product development, mobile app development, workflow automation, remote U.S. web services'
    },
    '/pricing': {
      title: 'Website, E-commerce & App Development Pricing | Chronolyte',
      description: 'See typical project ranges for landing pages, business websites, online stores, mobile apps, SaaS MVPs, and developer support. Request a scoped fixed-price quote.',
      keywords: 'website design pricing, e-commerce website cost, SaaS MVP cost, mobile app development cost, fixed-price web development'
    },
    '/industries': {
      title: 'Websites & Software for Every Business Type | Chronolyte',
      description: 'Digital projects for trades, clinics, law firms, real estate, retail, restaurants, manufacturers, nonprofits, SaaS teams, and more. Scope around your real workflow.',
      keywords: 'small business website design, contractor websites, healthcare websites, law firm websites, real estate websites, ecommerce, restaurant websites, manufacturing websites, nonprofit websites, SaaS'
    },
    '/locations': {
      title: 'Remote Web Design Across All 50 U.S. States | Chronolyte',
      description: 'Chronolyte works remotely with organizations throughout all 50 states, from major cities to smaller communities. Browse example cities and plan a project online.',
      keywords: 'nationwide web design, remote web development United States, web design across the U.S., website development for businesses in all 50 states'
    },
    '/fiverr-upwork-alternative': {
      title: 'Fiverr & Upwork Alternatives for Web Development | Chronolyte',
      description: 'Compare Fiverr, Upwork, and a managed web development studio for websites, apps, and SaaS. See who manages the work and request a free project scope.',
      keywords: 'Fiverr alternative for web development, Upwork alternative for website development, managed web development studio, freelance marketplace comparison, hire a web development team'
    },
    '/portfolio': {
      title: 'Portfolio — QRWho & Concept Web Projects | Chronolyte',
      description: 'Explore QRWho, a live browser-based QR design product, alongside clearly labeled website, e-commerce, property, and SaaS concept projects.',
      keywords: 'web development portfolio, QRWho, website design concepts, e-commerce concept, SaaS concept work'
    },
    '/about': {
      title: 'About Chronolyte — Remote Web & Product Development',
      description: 'Meet Chronolyte, a remote digital product team working with businesses across the United States and worldwide on websites, apps, SaaS, and automation.',
      keywords: 'about Chronolyte, remote web development team, digital product studio, U.S. website development'
    },
    '/contact': {
      title: 'Contact Chronolyte — Plan Your Website or Software Project',
      description: `Discuss a website, online store, app, SaaS product, or automation project. Call ${CONTACT_PHONE_DISPLAY} or send a project brief for a free scope and quote.`,
      keywords: 'contact web development studio, website quote, software project consultation, call Chronolyte'
    },
    '/faq': {
      title: 'FAQ — Hiring, Pricing, Timelines & Process | Chronolyte',
      description: 'How much does a website cost? How long does a SaaS MVP take? Who owns the code? Honest answers about hiring Chronolyte for web development, SaaS, and AI automation projects.',
      keywords: 'web development faq, how long to build a website, saas development timeline, who owns the code'
    },
    '/blog': {
      title: 'Web Design, Development & SaaS Guides | Chronolyte',
      description: 'Practical guides on website and app costs, hiring developers, SaaS MVP planning, e-commerce, and building digital products with clearer scope and budgets.',
      keywords: 'website development guides, web design cost, app development guide, SaaS MVP guide, e-commerce development advice'
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

function absoluteImageUrl(image) {
  if (!image) return DEFAULT_OG_IMAGE;
  try {
    const parsed = new URL(String(image), `${SITE_URL}/`);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : DEFAULT_OG_IMAGE;
  } catch {
    return DEFAULT_OG_IMAGE;
  }
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
  const phone = overrides.contact_phone || CONTACT_PHONE_E164;
  const stateAreas = US_SERVICE_AREAS.map((state) => ({
    '@type': 'AdministrativeArea',
    name: state.name,
    containedInPlace: { '@type': 'Country', name: 'United States' }
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    image: DEFAULT_OG_IMAGE,
    description: 'Chronolyte plans and builds websites, e-commerce stores, SaaS products, apps, and automation for businesses across the United States and worldwide, working remotely.',
    slogan: 'We bend time with AI.',
    email: 'contact@chronolyte.com',
    telephone: phone,
    contactPoint: [{
      '@type': 'ContactPoint',
      telephone: phone,
      contactType: 'sales',
      url: `${SITE_URL}/contact`,
      availableLanguage: ['English']
    }],
    priceRange: '$$',
    sameAs: [
      'https://facebook.com/chronolyte',
      'https://instagram.com/chronolyte'
    ],
    knowsAbout: [
      'Responsive website design', 'Website development', 'E-commerce development',
      'SaaS development', 'MVP planning', 'Mobile app development',
      'Workflow automation', 'AI-assisted software', 'CRM integrations',
      ...BUSINESS_TYPES.map((businessType) => businessType.name)
    ],
    areaServed: [
      { '@type': 'Country', name: 'United States' },
      ...stateAreas,
      { '@type': 'Place', name: 'Remote projects worldwide' }
    ],
    ...(overrides.address ? { address: overrides.address } : {}),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Development Services',
      itemListElement: [
        offer('Custom Website Design & Development', 'Custom, responsive websites for business services, content, and lead generation.', '$500 - $8,000'),
        offer('E-commerce Development', 'Online stores, product catalogs, checkout flows, and integrations scoped to the business.', '$2,500 - $15,000'),
        offer('SaaS Product Development', 'Product planning and software development for SaaS MVPs and established products.', '$20,000 - $75,000'),
        offer('Mobile App Development', 'iOS, Android, and cross-platform applications, planned to match product scope.', 'from $15,000'),
        offer('Workflow Automation', 'Business process automation and integrations, scoped to existing systems.', undefined)
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
    description: 'Plan and build custom websites, e-commerce, SaaS products, apps, and automation remotely with Chronolyte for U.S. and worldwide businesses.',
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
  const plain = stripHtml(post.content || '');
  const readingTime = Number(post.reading_time || post.read_time);
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${absoluteUrl(pathname)}#article`,
    headline: post.seo_title || post.meta_title || post.title,
    description: post.seo_description || post.meta_description || post.excerpt || '',
    image: [absoluteImageUrl(post.cover_image || post.featured_image)],
    ...(post.created_at || post.published_at ? { datePublished: post.created_at || post.published_at } : {}),
    ...(post.updated_at || post.created_at || post.published_at ? { dateModified: post.updated_at || post.created_at || post.published_at } : {}),
    author: { '@type': 'Organization', name: post.author_name || post.author || SITE_NAME, url: SITE_URL },
    publisher: { '@id': `${SITE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(pathname) },
    wordCount: plain ? plain.split(/\s+/).length : 0,
    keywords: safeTags(post.tags),
    articleSection: post.category || undefined,
    timeRequired: readingTime > 0 ? `PT${readingTime}M` : undefined,
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
        areaServed: [
          { '@type': 'Country', name: 'United States' },
          { '@type': 'Place', name: 'Remote projects worldwide' }
        ]
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
  const socialImage = absoluteImageUrl(image);
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
  parts.push(`<meta property="og:image" content="${escapeHtml(socialImage)}" />`);
  parts.push(`<meta property="og:image:width" content="1200" />`);
  parts.push(`<meta property="og:image:height" content="630" />`);
  parts.push(`<meta property="og:locale" content="en_US" />`);
  parts.push(`<meta name="twitter:card" content="summary_large_image" />`);
  parts.push(`<meta name="twitter:title" content="${escapeHtml(title)}" />`);
  parts.push(`<meta name="twitter:description" content="${escapeHtml(description)}" />`);
  parts.push(`<meta name="twitter:image" content="${escapeHtml(socialImage)}" />`);

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
    // Visible crawlable fallback. React's createRoot replaces this markup on the
    // client; without JavaScript, the page still exposes readable page content.
    out = out.replace(/(<div id="root">)/i, `$1<div data-ssr>${ssrContent}</div>`);
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

/** llms.txt — an additional, openly crawlable summary of the site. */
export function llmsTxt(blogs = []) {
  const lines = [
    `# ${SITE_NAME}`,
    '',
    '> Chronolyte is a remote web design and software development studio. It plans and builds business websites, e-commerce stores, SaaS products, mobile apps, and workflow automation for organizations across the United States and worldwide. Chronolyte works remotely; it does not claim to have a physical office in every listed city.',
    '',
    '## Services',
    '',
    '- Custom website design and development for service businesses, organizations, and product teams.',
    '- E-commerce design and development, including catalogs, checkout, and platform integrations.',
    '- SaaS and web application planning, MVP development, dashboards, and integrations.',
    '- Mobile application design and development for iOS, Android, or cross-platform products.',
    '- Workflow automation, CRM integrations, and custom AI-assisted tools where appropriate.',
    '',
    '## Business types',
    '',
    ...BUSINESS_TYPES.map((businessType) => `- **${businessType.name}** — ${businessType.examples}.`),
    '',
    '## United States coverage',
    '',
    `Chronolyte serves projects remotely throughout all 50 U.S. states: ${US_SERVICE_AREAS.map((state) => state.name).join(', ')}. The city examples in the coverage directory are representative, not an exhaustive list or a claim of local offices. Businesses in other U.S. cities and smaller communities can request a project plan.`,
    '',
    '## Useful pages',
    '',
    `- [Home](${SITE_URL}/): Company overview and project intake.`,
    `- [Services](${SITE_URL}/services): Website, e-commerce, application, and automation services.`,
    `- [Industries](${SITE_URL}/industries): Examples of business types and common digital needs.`,
    `- [U.S. service areas](${SITE_URL}/locations): All 50 states and representative city examples.`,
    `- [Fiverr and Upwork alternatives](${SITE_URL}/fiverr-upwork-alternative): Compare marketplace and managed-studio models for web and software projects.`,
    `- [Pricing](${SITE_URL}/pricing): Typical project ranges; request a current scoped quote.`,
    `- [Portfolio](${SITE_URL}/portfolio): QRWho and clearly labeled concept work.`,
    `- [Guides](${SITE_URL}/blog): Published articles and project planning guides.`,
    `- [Contact](${SITE_URL}/contact): Send a brief or contact Chronolyte directly.`
  ];
  if (blogs.length) {
    lines.push('', '## Published guides');
    for (const post of blogs) {
      lines.push(`- [${post.title}](${SITE_URL}/blog/${post.slug}): ${post.excerpt || ''}`);
    }
  }
  lines.push(
    '',
    '## Contact',
    '',
    '- Phone: ' + CONTACT_PHONE_DISPLAY,
    '- Telephone link: ' + CONTACT_PHONE_E164,
    '- WhatsApp: ' + `https://wa.me/${CONTACT_PHONE_E164.replace(/\D/g, '')}`,
    '- Email: contact@chronolyte.com'
  );
  return lines.join('\n');
}

/** Expanded machine-readable context, including city examples and industries. */
export function llmsFullTxt(blogs = []) {
  const lines = [
    llmsTxt(blogs),
    '',
    '## U.S. states and representative cities',
    '',
    ...US_SERVICE_AREAS.map((state) => `- **${state.name} (${state.abbr})**: ${state.cities.join(', ')}.`),
    '',
    '## Common digital needs by business type',
    '',
    ...BUSINESS_TYPES.map((businessType) => `- **${businessType.name}** — Examples: ${businessType.examples}. Common needs: ${businessType.digitalNeeds}`),
    '',
    '## Project process',
    '',
    '- Share the business goal, audience, requirements, current tools, and target launch window.',
    '- Receive a proposed scope, timeline, and quote before deciding whether to proceed.',
    '- Agree on milestones and review working progress during delivery.',
    '- Confirm handoff, hosting, ownership, and any ongoing support in the project agreement.',
    '',
    'Information on this site describes Chronolyte services and published editorial guidance. Confirm current scope, timing, and pricing directly before making a purchase decision.'
  ];
  return lines.join('\n');
}
