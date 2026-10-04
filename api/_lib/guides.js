/**
 * SEO guides imported from the live Chronolyte site (chronolyte-ebon.vercel.app).
 * Full-fidelity content — costs, tables, FAQs — rendered for the light-themed blog template.
 */

const T = (headers, rows) => `<table style="width:100%;border-collapse:collapse;margin:1.25rem 0;font-size:0.95rem;">
<thead><tr>${headers.map((h) => `<th style="border:1px solid #e5e7eb;padding:0.6rem 0.75rem;text-align:left;background:#f9fafb;color:#111827;">${h}</th>`).join('')}</tr></thead>
<tbody>${rows.map((r) => `<tr>${r.map((c) => `<td style="border:1px solid #e5e7eb;padding:0.6rem 0.75rem;color:#374151;">${c}</td>`).join('')}</tr>`).join('')}</tbody>
</table>`;

const H2 = (t) => `<h2 style="font-size:1.5rem;font-weight:700;color:#111827;margin:2rem 0 0.75rem;">${t}</h2>`;
const P = (t) => `<p style="margin:0.75rem 0;line-height:1.8;">${t}</p>`;
const UL = (items) => `<ul style="margin:0.75rem 0;padding-left:1.4rem;list-style:disc;">${items.map((i) => `<li style="margin:0.4rem 0;line-height:1.7;">${i}</li>`).join('')}</ul>`;
const OL = (items) => `<ol style="margin:0.75rem 0;padding-left:1.4rem;list-style:decimal;">${items.map((i) => `<li style="margin:0.5rem 0;line-height:1.7;">${i}</li>`).join('')}</ol>`;
const BOX = (t) => `<p style="margin:1.25rem 0;padding:1rem 1.25rem;background:#eff6ff;border-left:4px solid #2563eb;border-radius:0.5rem;line-height:1.7;color:#1e3a8a;"><strong>${t}</strong></p>`;
const FAQ = (pairs) => pairs.map(([q, a]) => `<div style="margin:1rem 0;"><h3 style="font-size:1.05rem;font-weight:700;color:#111827;margin:0 0 0.35rem;">${q}</h3><p style="margin:0;line-height:1.7;color:#374151;">${a}</p></div>`).join('');

export function guidePosts() {
  const UPDATED = '2026-09-30';
  return [
    {
      slug: 'how-much-does-a-website-cost',
      title: 'How Much Does a Website Cost in 2026? Real Price Ranges',
      excerpt: 'A realistic breakdown of website costs for small businesses and startups — what drives the price, what is usually left out, and how to avoid overpaying.',
      category: 'Cost Guides',
      tags: JSON.stringify(['website cost', 'how much does a website cost', 'web design pricing', 'small business website']),
      cover_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop',
      featured: 1, read_time: 7, status: 'published',
      seo_title: 'How Much Does a Website Cost in 2026? Real Price Ranges',
      seo_description: 'Website costs in 2026: landing pages $500-$2,500, business sites $2,000-$8,000, e-commerce $2,500-$15,000, custom builds $8,000-$60,000+. Plus hidden costs to budget for.',
      content:
        P('<strong>Short answer:</strong> a simple landing page costs about <strong>$500-$2,500</strong>, a small business website <strong>$2,000-$8,000</strong>, an e-commerce store <strong>$2,500-$15,000</strong>, and a custom-designed or custom-coded website <strong>$8,000-$60,000+</strong>. Add roughly <strong>$20-$100 per month</strong> for hosting, domain and maintenance.') +
        H2('Website cost by type') +
        T(['Type of website', 'Typical one-off cost', 'Typical timeline'], [
          ['DIY template builder (Wix, Squarespace)', '$0 - $500 plus subscription', 'Days'],
          ['Landing page (1 page)', '$500 - $2,500', '1 - 2 weeks'],
          ['Small business site (5-10 pages)', '$2,000 - $8,000', '3 - 6 weeks'],
          ['E-commerce store (Shopify / WooCommerce)', '$2,500 - $15,000', '3 - 8 weeks'],
          ['Custom-designed, brand-led website', '$8,000 - $25,000+', '6 - 12 weeks'],
          ['Custom web application or portal', '$15,000 - $60,000+', '2 - 5 months']
        ]) +
        P('These are typical market ranges in US dollars. Prices vary by region, team and scope, so treat them as a planning guide rather than a quote.') +
        H2('What makes a website cost more?') +
        UL([
          '<strong>Number of pages and templates</strong> — every unique layout needs design and development.',
          '<strong>Custom design vs templates</strong> — a bespoke design takes longer than customising a template.',
          '<strong>Functionality</strong> — booking, memberships, calculators, user accounts, search and integrations all add cost.',
          '<strong>Content</strong> — copywriting, photography and video are often billed separately.',
          '<strong>E-commerce complexity</strong> — number of products, variants, shipping rules, tax and payment methods.',
          '<strong>Speed and SEO requirements</strong> — migrations with redirects and technical SEO need extra care.',
          '<strong>Who builds it</strong> — freelancers, agencies and studios price differently (see our guide to hiring a web developer).'
        ]) +
        H2('Costs people forget to budget for') +
        UL([
          '<strong>Domain name:</strong> about $10-$20 per year.',
          '<strong>Hosting:</strong> $5-$50 per month for most small sites; more for high-traffic or e-commerce.',
          '<strong>Plugins and licences:</strong> premium themes, forms, SEO or booking tools.',
          '<strong>Maintenance and security:</strong> updates, backups and monitoring, usually $50-$300 per month if outsourced.',
          '<strong>Content updates:</strong> new pages, blog posts and campaigns after launch.',
          '<strong>Marketing:</strong> a website does not bring visitors by itself — budget for SEO, ads or email.'
        ]) +
        H2('How to get an accurate website quote') +
        OL([
          'Write down your goal (more enquiries, online sales, bookings, credibility).',
          'List the pages and features you need, and mark which are must-haves.',
          'Collect 3-5 websites you like and what you like about each.',
          'Decide who will supply the text and images.',
          'Ask for a fixed-price quote with deliverables, revisions and timeline spelled out.'
        ]) +
        BOX('Want a number for your own project? Start your project free and Chronolyte will send a scoped plan and quote.') +
        H2('How to save money without getting a worse website') +
        UL([
          'Launch with the essential pages and add the rest later.',
          'Use proven templates or components for standard sections and spend your budget on what makes you different.',
          'Supply good content early — waiting on copy is the most common cause of delays and overruns.',
          'Avoid unclear scope: changes mid-project are what inflate budgets.'
        ]) +
        H2('Frequently asked questions') +
        FAQ([
          ['How much does a small business website cost?', 'Most small business websites cost $2,000-$8,000 with a professional designer or studio, depending on pages, features and content.'],
          ['Is a cheap $500 website worth it?', 'For a simple landing page or a temporary presence, yes. For a site that must generate leads, a very low price often means templated design, no strategy and little support.'],
          ['How much does website maintenance cost?', 'Typically $50-$300 per month for updates, backups, security monitoring and small changes, plus hosting.'],
          ['Why do web designers charge so much?', 'You are paying for strategy, design, development, testing, project management and ongoing responsibility — not just a few hours of drag-and-drop.']
        ]),
      _updated: UPDATED
    },
    {
      slug: 'how-much-does-it-cost-to-build-an-app',
      title: 'How Much Does It Cost to Build an App in 2026? Full Breakdown',
      excerpt: 'App development costs for 2026: simple, mid-complexity and complex apps, cost drivers, iOS vs Android vs cross-platform and ways to reduce your budget.',
      category: 'Cost Guides',
      tags: JSON.stringify(['app development cost', 'how much does it cost to build an app', 'mobile app budget', 'ios android development']),
      cover_image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&h=630&fit=crop',
      featured: 1, read_time: 7, status: 'published',
      seo_title: 'How Much Does It Cost to Build an App in 2026? Full Breakdown',
      seo_description: 'App development costs in 2026: simple apps $15,000-$40,000, mid-complexity $40,000-$100,000, complex $100,000-$250,000+. Cost drivers, platforms and budget tips.',
      content:
        P('<strong>Short answer:</strong> a simple app costs about <strong>$15,000-$40,000</strong>, a mid-complexity app <strong>$40,000-$100,000</strong>, and a complex app (marketplace, real-time, payments, AI features) <strong>$100,000-$250,000+</strong>. Plan an extra <strong>15-20% of the build cost per year</strong> for maintenance and updates.') +
        H2('App development cost by complexity') +
        T(['Complexity', 'Typical features', 'Typical cost', 'Timeline'], [
          ['Simple', 'Login, a handful of screens, basic API, no complex logic', '$15,000 - $40,000', '2 - 4 months'],
          ['Mid-complexity', 'Payments, push notifications, chat, maps, admin panel, third-party integrations', '$40,000 - $100,000', '4 - 7 months'],
          ['Complex', 'Marketplace, real-time or video, AI/ML, offline sync, multiple user roles', '$100,000 - $250,000+', '6 - 12 months']
        ]) +
        P('Figures are typical market ranges in USD and vary by team location and scope. They are planning estimates, not quotes.') +
        H2('What drives app cost?') +
        UL([
          '<strong>Platforms:</strong> iOS, Android or both. Two native apps cost more than one cross-platform codebase.',
          '<strong>Design:</strong> custom UI, animation and branding take more time than standard components.',
          '<strong>Back end:</strong> user accounts, databases, APIs and an admin dashboard are often half of the work.',
          '<strong>Integrations:</strong> payments, maps, analytics, CRMs, SMS and email services.',
          '<strong>Compliance:</strong> healthcare (HIPAA), payments (PCI) and privacy laws (GDPR) add effort.',
          '<strong>Team model:</strong> freelancer, studio, or in-house — each has a different cost and risk profile.'
        ]) +
        H2('iOS vs Android vs cross-platform') +
        T(['Approach', 'Best for', 'Cost impact'], [
          ['Cross-platform (React Native, Flutter)', 'Most MVPs and business apps', 'One codebase for both stores — generally the most economical'],
          ['Native iOS (Swift)', 'iOS-only audiences, heavy device features', 'Higher if you also need Android'],
          ['Native Android (Kotlin)', 'Android-heavy markets, deep system integration', 'Higher if you also need iOS'],
          ['Progressive web app', 'Simple tools that do not need app-store presence', 'Lowest, but limited device access']
        ]) +
        H2('Hidden and ongoing costs') +
        UL([
          'Apple Developer Program (about $99 per year) and Google Play developer account (one-time registration fee).',
          'Cloud hosting and third-party service fees that grow with users.',
          'OS updates every year that require testing and fixes.',
          'Customer support, analytics and marketing to acquire users.'
        ]) +
        H2('How to reduce app development cost') +
        OL([
          'Build an MVP with one core user journey — not every feature you can imagine.',
          'Choose cross-platform unless you have a strong reason for native.',
          'Prototype in Figma and test with users before development.',
          'Use proven services (Stripe, Firebase, Twilio) instead of building from scratch.',
          'Release in phases and let real usage decide what you build next.'
        ]) +
        BOX('Have an app idea? Start your project free and get a scoped plan, timeline and quote from Chronolyte.') +
        H2('Frequently asked questions') +
        FAQ([
          ['How much does a simple app cost?', 'A simple cross-platform app typically costs $15,000-$40,000 and takes 2-4 months.'],
          ['How long does it take to build an app?', 'Most MVPs take 2-4 months; mid-complexity apps 4-7 months; complex products 6-12 months or more.'],
          ['Is it cheaper to build an app for iOS or Android?', 'Costs are similar for each platform. Building for both is where cross-platform frameworks save money.'],
          ['Can I build an app without coding?', 'Simple apps can be built with no-code tools, but custom logic, performance and long-term scalability usually need developers.']
        ]),
      _updated: UPDATED
    },
    {
      slug: 'how-to-hire-a-web-developer',
      title: 'How to Hire a Web Developer (Without Getting Burned)',
      excerpt: 'A practical guide for non-technical founders and business owners: where to find developers, what to ask, what it costs and what to avoid.',
      category: 'Hiring Guides',
      tags: JSON.stringify(['hire web developer', 'freelancer vs agency', 'developer rates', 'web development contract']),
      cover_image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&h=630&fit=crop',
      featured: 1, read_time: 8, status: 'published',
      seo_title: 'How to Hire a Web Developer in 2026: Complete Guide',
      seo_description: 'How to hire a web developer: freelancer vs agency vs studio, rates ($25-$150+/hr), vetting questions, red flags and contract tips for non-technical founders.',
      content:
        P('<strong>Short answer:</strong> define your goal and scope first, shortlist 3-5 candidates, review real work, ask about process and communication, agree a written fixed-price or milestone-based contract, and start with a small paid milestone. Developer rates range from about <strong>$25 to $150+ per hour</strong> depending on region and seniority.') +
        H2('Freelancer vs agency vs studio vs marketplace') +
        T(['Option', 'Best for', 'Watch out for'], [
          ['Freelancer (direct)', 'Small, well-defined tasks; tight budgets', 'Single point of failure; availability; you manage everything'],
          ['Freelance marketplace (Fiverr, Upwork)', 'Quick access to many candidates and one-off jobs', 'Quality varies widely; time spent vetting; no one accountable for the whole project'],
          ['Development studio', 'Websites and apps that need design + development + project management', 'Higher cost than a freelancer; check you work with the actual team'],
          ['Large agency', 'Enterprise projects and complex compliance needs', 'Premium rates and process overhead'],
          ['In-house hire', 'Ongoing product development', 'Salary, benefits and hiring time; slow to start']
        ]) +
        H2('Typical web developer rates in 2026') +
        UL([
          '<strong>Junior or budget freelancer:</strong> about $15-$35 per hour.',
          '<strong>Mid-level freelancer:</strong> about $35-$80 per hour.',
          '<strong>Senior freelancer or studio developer:</strong> about $80-$150+ per hour.',
          '<strong>Dedicated developer through a studio:</strong> about $4,000-$15,000 per month.'
        ]) +
        P('Rates vary widely by country and specialism. Cheaper is not always worse and expensive is not always better — judge on evidence, communication and process.') +
        H2('Step-by-step: how to hire') +
        OL([
          '<strong>Write a one-page brief:</strong> the goal, audience, must-have features, examples you like, budget range and deadline.',
          '<strong>Shortlist 3-5 candidates</strong> from referrals, portfolios and platforms.',
          '<strong>Review real, live work</strong> — open the sites and apps, test them on your phone, and ask what exactly the candidate did.',
          '<strong>Hold a short call</strong> and listen for questions about your business, not just technology.',
          '<strong>Request a written proposal</strong> with scope, deliverables, timeline, price and what is excluded.',
          '<strong>Start with a small paid milestone</strong> to test communication and quality before committing the whole budget.',
          '<strong>Agree ownership and handover in writing</strong> — code, designs, domains and hosting accounts in your name.'
        ]) +
        H2('Questions to ask any developer') +
        UL([
          'Can I see 2-3 similar projects and talk to a past client?',
          'Who exactly will work on my project, and who is my point of contact?',
          'How do you handle changes in scope, and how are they priced?',
          'How often will I see progress, and in what form?',
          'What happens after launch — bugs, support, hosting and updates?',
          'Will I own all code, designs and accounts when the project ends?'
        ]) +
        H2('Red flags') +
        UL([
          'A price quoted instantly without any questions about your goals.',
          'No live examples of similar work, or portfolio pieces they cannot explain.',
          'Pressure to pay everything upfront.',
          'Vague deliverables and no written scope.',
          'Developer keeps hosting, domain or code repository in their own name.',
          'Slow or evasive communication before you have even paid.'
        ]) +
        BOX('Prefer a managed team to hiring and supervising someone yourself? Start your project free — Chronolyte assigns and vets the team for you.') +
        H2('Frequently asked questions') +
        FAQ([
          ['How much does it cost to hire a web developer?', 'Freelancers typically charge $25-$150+ per hour; studios often quote fixed prices from $2,000 for small sites to $60,000+ for custom platforms.'],
          ['Should I hire a freelancer or an agency?', 'Choose a freelancer for small, well-defined tasks. Choose a studio or agency when you need design, development and project management together or when the project is business critical.'],
          ['What should be in a web development contract?', 'Scope and deliverables, price and payment milestones, timeline, revision rounds, ownership of code and designs, confidentiality, and support after launch.'],
          ['How do I vet a developer if I am not technical?', 'Test their live work, ask for client references, request a written plan and run a small paid trial milestone.']
        ]),
      _updated: UPDATED
    },
    {
      slug: 'saas-mvp-development-guide',
      title: 'SaaS MVP Development: The Practical Guide for Founders',
      excerpt: 'How to build a SaaS MVP: scope, tech stack, cost ($20k-$75k typical), timeline, and the mistakes that sink first-time founders.',
      category: 'SaaS Guides',
      tags: JSON.stringify(['saas mvp', 'build a saas product', 'saas development cost', 'mvp development']),
      cover_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&h=630&fit=crop',
      featured: 1, read_time: 8, status: 'published',
      seo_title: 'SaaS MVP Development Guide: Steps, Cost & Timeline (2026)',
      seo_description: 'How to build a SaaS MVP: validate, scope one core journey, pick a stack, and launch. Typical cost $20,000-$75,000, timeline 2-4 months. Mistakes to avoid.',
      content:
        P('<strong>Short answer:</strong> a SaaS MVP is the smallest subscription product that proves people will pay to solve a specific problem. It typically costs <strong>$20,000-$75,000</strong> and takes <strong>2-4 months</strong> to build with a professional team. The steps: validate the problem, define one core user journey, design and prototype, build, launch to a small group and iterate.') +
        H2('What is a SaaS MVP?') +
        P('A minimum viable product (MVP) is the simplest version of your software that delivers real value to early customers. It is not a buggy prototype — it is a focused product that does one job well, with just enough surrounding features (accounts, billing, basic admin) to be usable and chargeable.') +
        H2('The 7 steps to build a SaaS MVP') +
        OL([
          '<strong>Validate the problem.</strong> Talk to 10-20 potential customers. If they are not already trying to solve it (even with spreadsheets), reconsider.',
          '<strong>Define one core journey.</strong> Write the single path from sign-up to the moment the customer gets value.',
          '<strong>List must-haves vs nice-to-haves.</strong> For an MVP, keep only what the core journey needs, plus accounts and billing.',
          '<strong>Design and prototype.</strong> A clickable Figma prototype lets you test with users before paying for development.',
          '<strong>Choose a pragmatic tech stack.</strong> Use mainstream tools your future hires will know.',
          '<strong>Build in short sprints.</strong> Demand a working demo every one to two weeks.',
          '<strong>Launch small, measure and iterate.</strong> Release to a limited audience, watch behaviour and talk to users weekly.'
        ]) +
        H2('What goes into a SaaS MVP') +
        UL([
          'User registration, login and password reset',
          'The core feature set for one main use case',
          'Subscription billing (Stripe): trial, plans, invoices',
          'A simple admin panel for you and your support team',
          'Basic analytics and error monitoring',
          'Transactional email (welcome, receipts, notifications)'
        ]) +
        H2('Recommended tech stack') +
        T(['Layer', 'Common choice', 'Why'], [
          ['Front end', 'React or Next.js', 'Large talent pool, fast iteration'],
          ['Back end', 'Node.js, Laravel or Python (Django/FastAPI)', 'Mature frameworks with auth and ORM'],
          ['Database', 'PostgreSQL or MySQL', 'Reliable, relational, easy to host'],
          ['Payments', 'Stripe Billing', 'Handles subscriptions, tax tools and invoices'],
          ['Hosting', 'AWS, Vercel, DigitalOcean', 'Scales from prototype to production']
        ]) +
        H2('SaaS MVP cost and timeline') +
        T(['Stage', 'Typical cost', 'Typical timeline'], [
          ['Clickable prototype', '$3,000 - $10,000', '2 - 4 weeks'],
          ['MVP', '$20,000 - $75,000', '2 - 4 months'],
          ['Full v1 (teams, integrations, advanced admin)', '$75,000 - $200,000', '5 - 9 months']
        ]) +
        P('Typical market ranges in USD. Your exact cost depends on features, design depth and integrations.') +
        H2('Common SaaS MVP mistakes') +
        UL([
          '<strong>Building too much.</strong> Every extra feature delays learning.',
          '<strong>Skipping user validation.</strong> Building for an imagined customer.',
          '<strong>Over-engineering for scale.</strong> You can re-architect once you have paying users.',
          '<strong>Ignoring onboarding.</strong> If users do not reach value fast, they leave.',
          '<strong>No plan after launch.</strong> Budget time and money for feedback and iteration.'
        ]) +
        BOX('Ready to scope yours? Start your project free and Chronolyte will propose an MVP scope, timeline and quote.') +
        H2('Frequently asked questions') +
        FAQ([
          ['How long does it take to build a SaaS MVP?', 'Most SaaS MVPs take 2-4 months with a professional team, after a short scoping and design phase.'],
          ['How much does a SaaS MVP cost?', 'Typically $20,000-$75,000, depending on features, integrations and design.'],
          ['Can I build a SaaS MVP with no-code tools?', 'Yes, for validating demand. No-code is fine for early tests, but custom code gives you control over performance, data and costs as you grow.'],
          ['What should an MVP include?', 'One core user journey, accounts, subscription billing, a basic admin panel and analytics.']
        ]),
      _updated: UPDATED
    },
    {
      slug: 'fiverr-upwork-alternative',
      title: 'The Best Fiverr and Upwork Alternative for Web and App Projects',
      excerpt: 'Freelance marketplaces are great for some jobs and risky for others. Here is an honest comparison to help you pick the right way to get your website, app or SaaS built.',
      category: 'Hiring Guides',
      tags: JSON.stringify(['fiverr alternative', 'upwork alternative', 'hire developers', 'managed development team']),
      cover_image: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=630&fit=crop',
      featured: 1, read_time: 7, status: 'published',
      seo_title: 'Fiverr & Upwork Alternative for Web & App Projects | Chronolyte',
      seo_description: 'Looking for a Fiverr or Upwork alternative for websites, apps and SaaS? Compare marketplaces, agencies and Chronolyte\'s managed team — honestly.',
      content:
        P('<strong>Short answer:</strong> use Fiverr or Upwork for small, well-defined tasks you are happy to manage yourself. Choose a managed studio like <strong>Chronolyte</strong> when the project is important to your business, needs design and development together, or you want one accountable team instead of coordinating freelancers.') +
        H2('Fiverr vs Upwork vs Chronolyte') +
        T(['', 'Fiverr', 'Upwork', 'Chronolyte'], [
          ['<strong>Model</strong>', 'Fixed-price gigs from individual sellers', 'Hourly or fixed-price contracts with freelancers', 'Managed studio with a project lead'],
          ['<strong>Best for</strong>', 'Small, clearly defined tasks (logo, small fix)', 'Finding specialists and building a flexible team', 'Websites, apps and SaaS that need planning, design and development'],
          ['<strong>Vetting</strong>', 'You vet each seller', 'You vet each freelancer', 'We assign and vet the team for you'],
          ['<strong>Project management</strong>', 'You', 'You', 'Included — one point of contact'],
          ['<strong>Scope and quote</strong>', 'Gig packages and custom offers', 'Proposals from many freelancers', 'Free plan with scope, timeline and fixed quote'],
          ['<strong>Accountability</strong>', 'Per gig', 'Per freelancer', 'One team accountable for the whole result'],
          ['<strong>Marketplace fees</strong>', 'Platform service fees apply', 'Platform service fees apply', 'None — you pay the quoted price']
        ]) +
        P('This comparison is general: individual freelancers on marketplaces vary from excellent to poor, and platform fees and policies change over time. Check each platform\'s current terms.') +
        H2('When Fiverr or Upwork is the right choice') +
        UL([
          'You have a small, clearly specified task (a logo, a bug fix, a short script).',
          'You have the time and skill to vet candidates and manage the work.',
          'Your budget is very tight and the risk of a poor result is acceptable.',
          'You want to test a few freelancers before hiring one longer term.'
        ]) +
        H2('When a managed team is the better choice') +
        UL([
          'The project affects revenue or reputation (company website, product, store, app).',
          'You need design, development and QA to work together.',
          'You are not technical and cannot judge code quality.',
          'You want one price, one timeline and one team responsible.',
          'You previously hired a freelancer who disappeared or delivered something unfinished.'
        ]) +
        H2('How to avoid the common marketplace problems') +
        UL([
          'Write a clear brief and ask every candidate to repeat back what they understood.',
          'Review live examples of similar projects, not just screenshots.',
          'Pay by milestone, never everything upfront.',
          'Keep the domain, hosting and code repository in your own name.',
          'Test on your own phone and browser before approving each milestone.'
        ]) +
        BOX('Want a managed team instead? Start your project free — we reply within one business day with a plan and quote.') +
        H2('Frequently asked questions') +
        FAQ([
          ['What is the best alternative to Fiverr for web development?', 'For anything beyond a small task, a managed studio gives you one accountable team for design, development and delivery. Chronolyte offers this with a free plan and quote.'],
          ['Is Upwork better than Fiverr for developers?', 'Upwork tends to suit longer-term or hourly engagements and Fiverr suits packaged, fixed-price tasks. Neither manages the project for you.'],
          ['Is it cheaper to hire on Fiverr or Upwork than a studio?', 'Often the headline price is lower, but costs can rise through rework, delays and your own management time. Compare total cost and risk, not only price.'],
          ['Can Chronolyte handle small tasks too?', 'Yes. Small fixes and features can be quoted as fixed-price tasks. Start with the free form and tell us what you need.']
        ]),
      _updated: UPDATED
    }
  ];
}
