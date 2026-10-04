/**
 * First-run seeding — creates the default admin account and populates
 * the same default content the UI already ships with, so nothing changes visually.
 */

import { nowIso } from './util.js';

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

  // ----- Homepage content -----
  if (!(await store.settings.get('homepage_content'))) {
    await store.settings.set('homepage_content', JSON.stringify({
      hero: {
        badge_text: 'Elite AI Agency',
        headline_1: 'We Bend',
        headline_2: 'Time With AI',
        subheadline: 'Custom SaaS. Stunning Websites. Intelligent Automation.\nBuilt at the speed of tomorrow.',
        cta_primary_text: 'Build With Us',
        cta_primary_link: '/contact',
        cta_secondary_text: 'Explore Services',
        cta_secondary_link: '/services'
      },
      services: { section_title: 'Precision-Engineered', section_subtitle: 'Digital Solutions', section_description: 'Every solution we create is custom-built for maximum impact. No templates. No shortcuts. Only results.', items: [] },
      why: { section_title: 'Why Choose Chronolyte?', section_subtitle: '', items: [] },
      process: { section_title: 'Our Process', section_subtitle: '', steps: [] },
      industries: { section_title: 'Industries We Serve', section_subtitle: '', items: [] },
      cta: { headline: 'Ready to Build Something Amazing?', description: "Let's create digital experiences that bend time and blow minds.", button_text: 'Start Your Project', button_link: '/contact' }
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

  // ----- Pricing plans (categories the public pricing page groups by) -----
  if ((await store.records.list('pricing')).length === 0) {
    const plans = [
      { name: 'Starter Website', category: 'websites', price: 1500, price_display: '', original_price: null, period: 'one-time', timeline: '2 weeks delivery', description: 'Perfect for small businesses that need a premium online presence.', features: JSON.stringify(['Up to 5 pages', 'Mobile-first responsive design', 'SEO foundations', 'Contact form + lead capture', '2 weeks delivery']), highlighted: 0, is_popular: 0, active: 1, sort_order: 1, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) },
      { name: 'Business Growth', category: 'websites', price: 3500, price_display: '', original_price: null, period: 'one-time', timeline: '4 weeks delivery', description: 'For growing businesses that need conversion-focused design.', features: JSON.stringify(['Up to 12 pages', 'Custom animations & interactions', 'Advanced SEO setup', 'Blog / CMS integration', 'Analytics & conversion tracking', '30 days of support']), highlighted: 0, is_popular: 1, active: 1, sort_order: 2, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) },
      { name: 'SaaS MVP', category: 'saas', price: 8000, price_display: '', original_price: null, period: 'starting at', timeline: '8-10 weeks', description: 'Launch your SaaS idea with a production-ready MVP.', features: JSON.stringify(['Auth + user management', 'Payment integration (Stripe/Paddle)', 'Admin dashboard', 'Database architecture', 'API + integrations', 'Deployment included']), highlighted: 1, is_popular: 1, active: 1, sort_order: 3, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) },
      { name: 'AI Automation', category: 'automation', price: 2500, price_display: '', original_price: null, period: 'starting at', timeline: '3-6 weeks', description: 'Intelligent workflows that save thousands of hours.', features: JSON.stringify(['Workflow audit & design', 'AI chatbot or voice agent', 'CRM integration', 'Lead capture automation', 'Monthly optimization available']), highlighted: 0, is_popular: 0, active: 1, sort_order: 4, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) },
      { name: 'Custom AI Tool', category: 'ai-tools', price: 5000, price_display: '', original_price: null, period: 'starting at', timeline: '3-6 weeks', description: 'Bespoke AI tools built around your data and workflow.', features: JSON.stringify(['Custom AI/LLM integration', 'Data processing pipelines', 'API + dashboard', 'Real-time analytics', 'Model tuning & evals']), highlighted: 0, is_popular: 0, active: 1, sort_order: 5, created_at: daysAgoIso(25), updated_at: daysAgoIso(25) }
    ];
    for (const p of plans) {
      p.id = await store.counters.next('pricing');
      await store.records.insert('pricing', p);
    }
  }

  // ----- FAQs -----
  if ((await store.records.list('faqs')).length === 0) {
    const faqs = [
      { question: 'How long does a typical project take?', answer: 'Most websites launch in 2-4 weeks. SaaS MVPs typically take 6-10 weeks depending on scope. We give you a precise timeline after our first discovery call — and we hit it.', sort_order: 1, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'How much does a website or SaaS product cost?', answer: 'Starter websites begin at $1,500, business websites at $3,500, and SaaS MVPs start around $8,000. Every quote is fixed-price — no hourly billing surprises.', sort_order: 2, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'What technologies do you use?', answer: 'Modern, proven stacks: React, TypeScript, Next.js, Tailwind CSS on the front; Node.js, PostgreSQL, and cloud infrastructure (AWS/Vercel) on the back. AI features built on OpenAI, Anthropic and open-source models.', sort_order: 3, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'Do you provide support after launch?', answer: 'Yes — every project includes 14 days of post-launch support. Ongoing monthly maintenance and growth plans are available for clients who want continuous improvement.', sort_order: 4, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'Can you take over an existing project?', answer: 'Absolutely. We start with a technical audit, stabilize what exists, then execute the roadmap. We regularly rescue projects other teams could not finish.', sort_order: 5, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) },
      { question: 'How do we communicate during the project?', answer: 'Direct access to your developer via WhatsApp, email, and scheduled calls. You get progress updates at every milestone — no account managers, no telephone games.', sort_order: 6, active: 1, created_at: daysAgoIso(20), updated_at: daysAgoIso(20) }
    ];
    for (const f of faqs) {
      f.id = await store.counters.next('faq');
      await store.records.insert('faqs', f);
    }
  }

  // ----- SEO blog posts (targeting "hire developer / fiverr alternative / saas cost" searches) -----
  if ((await store.records.list('blogs')).length === 0) {
    for (const post of blogSeeds()) {
      post.id = await store.counters.next('blog');
      await store.records.insert('blogs', post);
    }
  }
}

function blogSeeds() {
  const mk = (days, p) => {
    const { markdown, ...rest } = p;
    return {
      ...rest,
      content: mdToHtml(markdown),
      created_at: daysAgoIso(days),
      updated_at: daysAgoIso(days)
    };
  };

  return [
    mk(3, {
      slug: 'how-to-hire-a-web-developer-in-2026-complete-guide',
      title: 'How to Hire a Web Developer in 2026: The Complete Guide',
      excerpt: 'Freelancer vs agency vs Fiverr vs full-time? A no-nonsense guide to hiring the right developer, what fair pricing looks like, and the red flags that cost businesses thousands.',
      markdown: `Hiring a web developer in 2026 is harder than ever — not because talent is scarce, but because the market is loud. Every marketplace promises "top 1% developers" and every agency promises "premium quality." Here is how to cut through the noise and hire right.

## Your Four Options (and what they actually cost)

**1. Freelance marketplaces (Fiverr, Upwork).** Best for small, well-defined tasks: a logo, a landing page fix, a quick integration. You'll pay $15–$150/hour. The risk: quality varies wildly, and complex projects often get abandoned mid-build. If your project is more than "a few pages," be careful.

**2. Independent freelancers.** $50–$200/hour depending on skill and region. Great when you find one — the challenge is vetting. Always ask for three references from projects similar to yours.

**3. Specialized agencies (like us).** $3,000–$50,000+ per project, fixed price. You get a team: design, development, QA, and project management. Best for businesses that need to launch fast and cannot afford a rebuild in six months.

**4. Full-time hires.** $90,000–$180,000/year in the US plus benefits and recruiting time. Makes sense when development is your core business — not when you need one website or one SaaS MVP.

## The 7 Questions That Reveal a Great Developer

1. "Walk me through a project you shipped that is live right now." Real developers show real URLs.
2. "How did you handle your last production bug?" Ownership matters more than perfection.
3. "What happens after launch?" If they have no answer, support will be your problem.
4. "What tech stack do you recommend and why?" Vague answers mean template-milling.
5. "What will this cost, honestly?" Look for fixed-price clarity, not hourly fog.
6. "Who owns the code?" The answer must always be: you do.
7. "Can I talk to a past client?" A confident yes is a green flag.

## Red Flags That Cost Businesses Thousands

- **Price that seems too good.** A $300 "custom SaaS" is a $300 template with your logo. You will pay for the rebuild.
- **No contract, no milestone plan.** Professional work comes with paperwork.
- **Communication that decays.** If replies take days before you pay, imagine after.
- **No portfolio beyond screenshots.** Screenshots hide slow, broken, unlaunched work.

## What Fair Pricing Looks Like in 2026

- Small business website (5–10 pages, custom design): **$1,500 – $5,000**
- E-commerce store: **$3,000 – $15,000**
- SaaS MVP with auth, payments, dashboard: **$8,000 – $30,000**
- AI automation / chatbot systems: **$2,500 – $15,000**

If you are ready to skip the hiring gamble entirely, **Chronolyte builds custom websites, SaaS products, and AI automations on fixed-price quotes with launch dates you can plan around.** Start your project free — tell us what you need and get a quote within 24 hours.`,
      category: 'Hiring Guide',
      tags: JSON.stringify(['hire web developer', 'freelancer vs agency', 'web development cost', 'fiverr alternative']),
      author: 'Chronolyte Team', author_avatar: '',
      cover_image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=630&fit=crop',
      status: 'published', featured: 1, read_time: 8,
      seo_title: 'How to Hire a Web Developer in 2026: Costs, Red Flags & Guide',
      seo_description: 'Freelancer vs agency vs Fiverr: real 2026 prices, 7 vetting questions, and the red flags that cost businesses thousands. A complete guide to hiring developers.'
    }),
    mk(6, {
      slug: 'fiverr-alternatives-for-business-websites-what-actually-works',
      title: 'Fiverr Alternatives for Business Websites: What Actually Works',
      excerpt: 'Fiverr is great for $50 gigs — and risky for real business projects. Here are the smarter alternatives when your website needs to actually make you money.',
      markdown: `Fiverr built an amazing marketplace for quick gigs. But business owners keep learning the same expensive lesson: a $500 website gig and a website that generates leads are two different products.

## When Fiverr Works

Simple, self-contained tasks: a logo refresh, a WordPress plugin fix, a banner design, minor speed optimization. Well-defined, small, low-stakes. Fiverr shines here.

## When It Fails — And What To Use Instead

**Custom business website ($1,500–$5,000).** You need design + development + SEO + conversion thinking in one brain (or one team). A specialized web studio gives you a fixed quote, a launch date, and someone accountable when something breaks. Chronolyte builds exactly this — custom-built, no templates, with lead capture baked in.

**SaaS product or MVP ($8,000–$30,000).** Marketplace gig sellers are not equipped for auth systems, payment infrastructure, database architecture, and deployment. You want a product-focused development team with shipped SaaS in their portfolio. Ask to see live products, not dashboards.

**AI automation and chatbots.** This is the fastest-moving category and the most oversold. Half the "AI developers" on marketplaces are wiring a no-code tool you could wire yourself. Look for teams that build custom integrations into your actual CRM, inbox, and workflows.

**Ongoing partnership.** Marketplaces end at delivery. Real growth needs someone who answers in hours, monitors analytics, and iterates. A studio relationship compounds; a gig relationship ends.

## The Decision Framework

Ask yourself three questions:

1. **Does this project touch revenue?** If yes, do not shop on price alone.
2. **Do I need it to still work in 18 months?** If yes, you need an accountable team, not a gig.
3. **Is the scope crystal clear?** If no, a fixed-price studio quote is worth more than a cheap hourly freelancer.

## Why Businesses Pick Chronolyte Over Marketplaces

- **Fixed-price quotes** — know the full cost before we start
- **Launch-date guarantees** — your project ships when we say it will
- **Custom-built, zero templates** — your business is not a theme
- **Lead capture & SEO included** — websites that pay for themselves
- **14-day post-launch support** and monthly growth plans

Start your project free at Chronolyte — describe what you need, get a quote within 24 hours, and see why businesses stop shopping marketplaces after their first real project.`,
      category: 'Buying Guide',
      tags: JSON.stringify(['fiverr alternative', 'hire web designer', 'website development agency', 'upwork alternative']),
      author: 'Chronolyte Team', author_avatar: '',
      cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
      status: 'published', featured: 1, read_time: 6,
      seo_title: 'Fiverr Alternatives for Business Websites (2026): What Works',
      seo_description: 'When to use Fiverr — and when your business needs a real development team. Compare alternatives for custom websites, SaaS MVPs, and AI automation projects.'
    }),
    mk(10, {
      slug: 'how-much-does-it-cost-to-build-a-saas-product-in-2026',
      title: 'How Much Does It Cost to Build a SaaS Product in 2026?',
      excerpt: 'MVP budgets explained line by line: what $8K buys, what $30K buys, and where first-time founders waste money. Real numbers from real launches.',
      markdown: `Every week a founder asks us the same question: "How much to build my SaaS?" Here is the honest, line-by-line answer from a team that ships SaaS products for a living.

## The Real Cost Bands

**$8,000 – $15,000: Focused MVP.** One core workflow done excellently. Auth, payments (Stripe/Paddle), one dashboard, clean database design. Think "invoice tool for freelancers," not "Salesforce competitor." This is where 80% of SaaS ideas should start.

**$15,000 – $30,000: Multi-role MVP.** Teams, permissions, admin panels, integrations (Zapier, webhooks, CRMs), analytics. Still one product, one market — just more depth.

**$30,000 – $75,000+: Complex platform.** Marketplaces, mobile apps, real-time features, AI pipelines, compliance (HIPAA/PCI). If a dev quotes you this on day one without a discovery phase, walk away.

## Where Founders Waste Money

1. **Building features nobody asked for.** Every feature must map to a user's job-to-be-done from day one. Your roadmap is not a wish list.
2. **Custom-building what exists.** Auth, billing, email — use proven services. Spend your budget on your differentiator.
3. **Designing everything before selling anything.** A landing page + waitlist costs $1,500 and validates demand before you spend $15K.
4. **Hiring cheap, paying twice.** A $4K MVP that needs a $12K rebuild is a $16K MVP with months lost.

## The 2026 Tech Stack That Keeps Costs Down

- **Frontend:** React + TypeScript + Tailwind (fast to build, easy to maintain)
- **Backend:** Node.js + PostgreSQL (boring, proven, scales)
- **Payments:** Stripe or Paddle (merchant-of-record saves tax headaches)
- **AI features:** OpenAI/Anthropic APIs behind your own service layer
- **Hosting:** Vercel + Neon Postgres (deploy in minutes, scale later)

## Timeline Reality Check

- Week 1–2: Discovery, wireframes, fixed-price scope
- Week 3–6: Core build (auth, payments, core workflow)
- Week 7–8: Admin dashboard, polish, QA
- Week 8–9: Launch, analytics, onboarding flow

Nine weeks from idea to paying users is normal when scope is disciplined.

## How Chronolyte Builds SaaS

We do fixed-price MVPs with launch-date guarantees. You get weekly demo builds, full code ownership from day one, and a team that has shipped SaaS products serving thousands of users. Start your project free — tell us about your SaaS idea and get a quote within 24 hours.`,
      category: 'SaaS',
      tags: JSON.stringify(['saas development cost', 'build saas mvp', 'saas development company', 'mvp budget']),
      author: 'Chronolyte Team', author_avatar: '',
      cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
      status: 'published', featured: 1, read_time: 9,
      seo_title: 'SaaS Development Cost in 2026: Real MVP Budgets Explained',
      seo_description: 'What $8K vs $30K actually buys in SaaS development, where founders waste money, and the tech stack that keeps costs down. Real numbers from real launches.'
    })
  ];
}
