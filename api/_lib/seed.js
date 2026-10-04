/**
 * First-run seeding — creates the default admin account and populates
 * the same default content the UI already ships with, so nothing changes visually.
 */

import { nowIso } from './util.js';
import { guidePosts } from './guides.js';

function daysAgoIso(days) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

function mdToHtml(md) {
  const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (t) => esc(t)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  const lines = md.split('\n');
  const out = [];
  let listType = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (/^[-*] /.test(trimmed)) {
      if (listType !== 'ul') { if (listType) out.push(`</${listType}>`); out.push('<ul>'); listType = 'ul'; }
      out.push(`<li>${inline(trimmed.slice(2))}</li>`);
      continue;
    }
    if (/^\d+\. /.test(trimmed)) {
      if (listType !== 'ol') { if (listType) out.push(`</${listType}>`); out.push('<ol>'); listType = 'ol'; }
      out.push(`<li>${inline(trimmed.replace(/^\d+\. /, ''))}</li>`);
      continue;
    }
    if (listType) { out.push(`</${listType}>`); listType = null; }
    if (!trimmed) continue;
    const h = /^(#{1,4}) (.+)$/.exec(trimmed);
    if (h) out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`);
    else out.push(`<p>${inline(trimmed)}</p>`);
  }
  if (listType) out.push(`</${listType}>`);
  return out.join('\n');
}

export async function seedStore(store) {
  // ----- Default admin -----
  if ((await store.admins.list()).length === 0) {
    const username = process.env.ADMIN_USERNAME || 'admin';
    await store.admins.create({
      username,
      email: process.env.ADMIN_EMAIL || 'admin@chronolyte.com',
      password: store.hashPassword(process.env.ADMIN_PASSWORD || 'admin123'),
      role: 'super_admin',
      avatar: '',
      active: 1
    });
    console.log(`[seed] created admin user "${username}"`);
  }

  // ----- Homepage content (content migrated from the live Chronolyte site) -----
  if (!(await store.settings.get('homepage_content'))) {
    await store.settings.set('homepage_content', JSON.stringify({
      hero: {
        badge_text: 'Start your project free',
        headline_1: 'Hire Web Designers',
        headline_2: '& Developers',
        subheadline: 'Tell us what you want to build — get a free plan, timeline and fixed quote within one business day.\nNo obligation, no card required.',
        cta_primary_text: 'Start your project free',
        cta_primary_link: '/contact',
        cta_secondary_text: 'See pricing',
        cta_secondary_link: '/pricing'
      },
      services: {
        section_title: 'Websites, Apps &',
        section_subtitle: 'SaaS Products',
        section_description: 'One team for design, development and launch — delivered on fixed quotes with demos every 1-2 weeks.',
        items: [
          { title: 'Web Design', description: 'Custom, mobile-first websites designed to convert visitors and rank on search engines.', icon: 'globe', features: ['Custom Design', 'Mobile-first', 'Conversion Focused', 'SEO Ready'] },
          { title: 'Web Development', description: 'Fast, secure, custom-coded websites, portals and integrations built on modern stacks.', icon: 'code', features: ['Custom Code', 'Portals', 'Integrations', 'Performance'] },
          { title: 'Mobile App Development', description: 'iOS and Android apps, from MVP to full product — cross-platform or native.', icon: 'phone', features: ['iOS & Android', 'React Native / Flutter', 'MVP to Scale', 'App Store Launch'] },
          { title: 'SaaS Development', description: 'Plan, build and launch your subscription software product with billing and dashboards.', icon: 'saas', features: ['Subscriptions', 'Auth & Billing', 'Admin Dashboards', 'Cloud Deploy'] },
          { title: 'E-commerce Development', description: 'Shopify, WooCommerce and custom online stores engineered to sell.', icon: 'cart', features: ['Shopify', 'WooCommerce', 'Custom Stores', 'Payments'] },
          { title: 'UI/UX Design', description: 'Product design for web apps, SaaS and mobile apps that users understand instantly.', icon: 'pen', features: ['Prototypes', 'Design Systems', 'User Testing', 'Figma'] },
          { title: 'Website Redesign & Fixes', description: 'Audit, redesign, speed up or rescue your existing site or application.', icon: 'refresh', features: ['Audits', 'Speed Optimization', 'Rescue Projects', 'Migrations'] },
          { title: 'Hire Developers', description: 'Vetted developers and designers by the project, hour or month.', icon: 'users', features: ['Vetted Talent', 'Flexible Terms', 'Fast Start', 'Managed for You'] }
        ]
      },
      why: {
        section_title: 'Marketplace Flexibility,',
        section_subtitle: 'Studio Accountability',
        items: [
          { metric: '1 Day', label: 'Reply Time', description: 'A real person replies within one business day with questions or a plan.' },
          { metric: '$500+', label: 'Websites From', description: 'Transparent, fixed-price quotes — not vague hourly estimates.' },
          { metric: '2-4 mo', label: 'SaaS MVPs', description: 'Idea to launched, revenue-ready subscription product.' },
          { metric: '100%', label: 'Code Ownership', description: 'Code, designs and accounts transfer to you on final payment.' },
          { metric: '1 Team', label: 'Fully Managed', description: 'Design, development and project management under one roof.' }
        ]
      },
      process: {
        section_title: 'From Idea to',
        section_subtitle: 'Launch in 4 Steps',
        steps: [
          { step: '01', title: 'Tell Us What You Want', description: 'Answer three quick questions about your project. It takes about a minute.' },
          { step: '02', title: 'Get Your Free Plan', description: 'Within one business day we reply with a recommended scope, timeline and fixed quote.' },
          { step: '03', title: 'Approve & Kick Off', description: 'Happy with the plan? We agree milestones and start. Not for you? No obligation.' },
          { step: '04', title: 'See Progress, Launch, Grow', description: 'Working demos every 1-2 weeks, then launch and ongoing support.' }
        ]
      },
      industries: {
        section_title: 'Who We',
        section_subtitle: 'Help',
        items: [
          { name: 'Startups', description: 'Turn an idea into a launched MVP without hiring a full team' },
          { name: 'Local Business', description: 'A professional website that brings in enquiries' },
          { name: 'Agencies', description: 'Add reliable developers when your roadmap outgrows your team' },
          { name: 'SaaS Founders', description: 'Plan, build and launch your subscription product' },
          { name: 'Entrepreneurs', description: 'Plain-English advice, one accountable team' }
        ]
      },
      cta: { headline: 'Ready to Build Something Great?', description: 'Tell us about your project and get a free plan, timeline and quote within one business day.', button_text: 'Start your project free', button_link: '/contact' }
    }));
  }

  if (!(await store.settings.get('site_settings'))) {
    await store.settings.set('site_settings', JSON.stringify({
      contact_email: 'contact@chronolyte.com',
      contact_phone: '+1 (555) 000-0000',
      footer_copyright: '© 2025 Chronolyte. All rights reserved.',
      footer_tagline: 'We bend time with AI.',
      footer_show_social: true
    }));
  }

  // ----- Portfolio projects (same items the public page already falls back to) -----
  if ((await store.records.list('projects')).length === 0) {
    const projects = [
      {
        title: 'InvoiceFlow Pro', client_name: 'InvoiceFlow', project_type: 'saas',
        short_description: 'Complete invoicing and billing SaaS platform with automated reminders, payment tracking, and financial analytics.',
        long_description: 'A comprehensive SaaS solution for managing invoices, tracking payments, and generating financial reports. Features automated reminders and integration with major payment gateways.',
        featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        tech_stack: JSON.stringify(['React', 'Node.js', 'Stripe', 'PostgreSQL']),
        features: JSON.stringify(['Automated invoicing', 'Payment tracking', 'Financial analytics', 'Multi-currency support']),
        images: JSON.stringify([]),
        metrics: JSON.stringify({ users: '2,500+', revenue: '$45K MRR' }),
        price: 4500, category: 'SaaS', published: 1, featured: 1, video_url: '', live_url: '',
        created_at: daysAgoIso(60), updated_at: daysAgoIso(60)
      },
      {
        title: 'Luxe Real Estate', client_name: 'Luxe RE', project_type: 'website',
        short_description: 'Premium real estate website with virtual tours, property search, and lead capture system.',
        long_description: 'A stunning real estate website featuring virtual property tours, advanced search filters, and an integrated lead capture system to convert visitors into qualified leads.',
        featured_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        tech_stack: JSON.stringify(['Next.js', 'Framer Motion', 'Sanity CMS']),
        features: JSON.stringify(['Virtual tours', 'Property search', 'Lead capture', 'Agent profiles']),
        images: JSON.stringify([]),
        metrics: JSON.stringify({ traffic: '50K/mo', leads: '200+/mo' }),
        price: 3200, category: 'Website', published: 1, featured: 1, video_url: '', live_url: '',
        created_at: daysAgoIso(50), updated_at: daysAgoIso(50)
      },
      {
        title: 'LeadGen AI', client_name: 'LeadGen', project_type: 'automation',
        short_description: 'Automated lead generation system with AI-powered qualification and CRM integration.',
        long_description: 'An intelligent automation system that generates, qualifies, and nurtures leads using AI. Integrates with major CRM platforms for seamless workflow.',
        featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        tech_stack: JSON.stringify(['Python', 'OpenAI', 'Zapier', 'HubSpot']),
        features: JSON.stringify(['AI qualification', 'CRM sync', 'Email sequences', 'Analytics dashboard']),
        images: JSON.stringify([]),
        metrics: JSON.stringify({ leads: '1,000+/mo', accuracy: '95%' }),
        price: 5000, category: 'Automation', published: 1, featured: 1, video_url: '', live_url: '',
        created_at: daysAgoIso(40), updated_at: daysAgoIso(40)
      }
    ];
    for (const p of projects) {
      p.id = await store.counters.next('project');
      await store.records.insert('projects', p);
    }
  }

  // ----- Testimonials (mirrors admin defaults) -----
  if ((await store.records.list('testimonials')).length === 0) {
    const testimonials = [
      { client_name: 'Jennifer Martinez', client_title: 'CEO', client_company: 'InnovateTech Solutions', project_name: 'AI Automation Suite', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer', content: 'Chronolyte transformed our entire digital infrastructure. Their AI automation saved us 200+ hours monthly. The ROI was visible within the first month.', rating: 5, featured: 1, status: 'approved', created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { client_name: 'Marcus Chen', client_title: 'Founder', client_company: 'PayStream', project_name: 'Fintech SaaS Platform', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus', content: 'From MVP to a production platform serving thousands of users in 8 weeks. The engineering quality and speed were unlike anything we have experienced with other agencies.', rating: 5, featured: 1, status: 'approved', created_at: daysAgoIso(15), updated_at: daysAgoIso(15) },
      { client_name: 'Sarah Williams', client_title: 'Director of Operations', client_company: 'Luxe Properties', project_name: 'Real Estate Platform', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', content: 'The new website doubled our qualified leads in the first quarter. Beautiful design, blazing fast, and the lead capture automation works exactly as promised.', rating: 5, featured: 1, status: 'approved', created_at: daysAgoIso(10), updated_at: daysAgoIso(10) }
    ];
    for (const t of testimonials) {
      t.id = await store.counters.next('testimonial');
      await store.records.insert('testimonials', t);
    }
  }

  // ----- Pricing plans (ranges migrated from the live Chronolyte site) -----
  if ((await store.records.list('pricing')).length === 0) {
    const plans = [
      { name: 'Landing Page', category: 'websites', price: 500, price_display: '$500 - $2,500', original_price: null, period: 'one-time', timeline: '1 - 2 weeks', description: 'A single high-converting page for a product, service or campaign.', features: JSON.stringify(['1 page, custom design', 'Mobile-first & fast', 'Contact / lead form', 'SEO basics & analytics', 'Launch-ready copy guidance']), highlighted: 0, is_popular: 0, active: 1, sort_order: 1, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) },
      { name: 'Business Website', category: 'websites', price: 2000, price_display: '$2,000 - $8,000', original_price: null, period: 'one-time', timeline: '3 - 6 weeks', description: 'A professional 5-10 page website that brings in enquiries.', features: JSON.stringify(['5-10 custom pages', 'Design + development + copy guidance', 'CMS so you can edit content', 'On-page SEO & speed optimization', 'Contact forms & maps', 'Analytics & training']), highlighted: 0, is_popular: 1, active: 1, sort_order: 2, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) },
      { name: 'E-commerce Store', category: 'websites', price: 2500, price_display: '$2,500 - $15,000', original_price: null, period: 'one-time', timeline: '3 - 8 weeks', description: 'Shopify, WooCommerce or a custom store built to sell.', features: JSON.stringify(['Product catalogue setup', 'Payments & shipping config', 'Conversion-focused design', 'Abandoned-cart & email hooks', 'Order & inventory basics', 'Post-launch support']), highlighted: 0, is_popular: 0, active: 1, sort_order: 3, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) },
      { name: 'Mobile App', category: 'ai-tools', price: 15000, price_display: '$15,000+', original_price: null, period: 'one-time', timeline: '2 - 7 months', description: 'iOS and Android apps, from MVP to full product.', features: JSON.stringify(['iOS, Android or cross-platform', 'Design + development + store launch', 'Push notifications & payments', 'Admin dashboard & analytics', 'App Store / Play Store submission']), highlighted: 0, is_popular: 0, active: 1, sort_order: 4, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) },
      { name: 'SaaS MVP', category: 'saas', price: 20000, price_display: '$20,000 - $75,000', original_price: null, period: 'one-time', timeline: '2 - 4 months', description: 'Launch your subscription software with billing and dashboards.', features: JSON.stringify(['One core user journey, done well', 'Accounts + Stripe subscriptions', 'Admin panel & basic analytics', 'Scalable, documented code', 'Cloud deployment included', 'Weekly demo builds']), highlighted: 1, is_popular: 1, active: 1, sort_order: 5, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) },
      { name: 'Hire a Developer', category: 'automation', price: 25, price_display: '$25 - $150+', original_price: null, period: 'per hour', timeline: 'Starts in days', description: 'Vetted developers and designers by the hour or month.', features: JSON.stringify(['Freelancers or a dedicated team', 'Web, mobile, SaaS & design skills', 'You manage — or we manage for you', 'Start within days, scale anytime', 'Monthly options available']), highlighted: 0, is_popular: 0, active: 1, sort_order: 6, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) }
    ];
    for (const p of plans) {
      p.id = await store.counters.next('pricing');
      await store.records.insert('pricing', p);
    }
  }

  // ----- FAQs (migrated from the live Chronolyte site) -----
  if ((await store.records.list('faqs')).length === 0) {
    const faqs = [
      { question: 'What is Chronolyte?', answer: 'Chronolyte is a managed web design and development studio. We plan, design and build websites, web apps, mobile apps, e-commerce stores and SaaS products for clients worldwide — with one accountable team and fixed-price quotes.', sort_order: 1, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'How does "start your project free" work?', answer: 'You answer three quick questions about what you want to build. Within one business day, a real person replies with a recommended scope, timeline and a fixed-price quote. If you like the plan, we agree milestones and start. If not, there is no obligation.', sort_order: 2, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'Is the plan really free?', answer: 'Yes — the plan, timeline and quote cost nothing and carry no obligation. We only start billing once you approve a proposal, and we keep it fixed-price so there are no hourly surprises.', sort_order: 3, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'What kinds of projects can you build?', answer: 'Landing pages, business websites, e-commerce stores, custom web applications, mobile apps (iOS and Android), SaaS products and MVPs, UI/UX design, redesigns and fixes — plus hiring dedicated developers or designers.', sort_order: 4, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'How are you different from Fiverr or Upwork?', answer: 'On marketplaces you find and manage individual freelancers yourself, and quality varies. Chronolyte assigns and vets the team for you: design, development and project management under one roof, with one person accountable for the whole result.', sort_order: 5, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'How much does a website, app or SaaS MVP cost?', answer: 'Typical ranges: landing pages $500-$2,500, business websites $2,000-$8,000, e-commerce $2,500-$15,000, mobile apps $15,000-$100,000+, SaaS MVPs $20,000-$75,000, and developers from $25-$150+ per hour. Every quote is fixed-price.', sort_order: 6, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'How long do projects take?', answer: 'Landing pages: 1-2 weeks. Business websites: 3-6 weeks. E-commerce: 3-8 weeks. Mobile apps: 2-7 months. SaaS MVPs: 2-4 months. You get a timeline with your free plan, and working demos every 1-2 weeks.', sort_order: 7, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'Can you work with our existing code or website?', answer: 'Yes. We regularly audit, rescue, redesign and extend existing sites, apps and codebases — and we are happy to work alongside your current team or agency.', sort_order: 8, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'Who owns the code and designs?', answer: 'You do. On final payment, all code, designs and assets are yours, and we transfer every domain, hosting and repository account to your name.', sort_order: 9, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'Do you work with clients worldwide?', answer: 'Yes — we work remotely with clients in every time zone. Communication runs on email, phone or WhatsApp, whichever you prefer, with scheduled calls when useful.', sort_order: 10, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) }
    ];
    for (const f of faqs) {
      f.id = await store.counters.next('faq');
      await store.records.insert('faqs', f);
    }
  }

  // ----- SEO guides (full content imported from the live Chronolyte site) -----
  if ((await store.records.list('blogs')).length === 0) {
    for (const post of blogSeeds()) {
      post.id = await store.counters.next('blog');
      await store.records.insert('blogs', post);
    }
  }
}

function blogSeeds() {
  return guidePosts().map((g) => {
    const { content, _updated, ...rest } = g;
    const created = new Date(`${_updated}T09:00:00Z`).toISOString();
    return {
      ...rest,
      content,
      author: 'Chronolyte',
      author_avatar: '',
      created_at: created,
      updated_at: created
    };
  });
}
