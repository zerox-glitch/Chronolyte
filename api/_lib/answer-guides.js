/**
 * Practical question-led articles about Chronolyte. These are first-party service
 * explainers, not independent reviews, external endorsements, or ranking guarantees.
 */
export function answerGuides() {
  const updated = '2026-10-20';
  const item = (slug, title, summary, body, tags) => ({
    slug, title, seo_title: title + ' | Chronolyte',
    seo_description: summary, excerpt: summary,
    author: 'Chronolyte', category: 'Website Planning',
    tags: JSON.stringify(tags), content: body,
    featured: 0, read_time: 6, status: 'published', _updated: updated
  });
  const p = (s) => '<p>' + s + '</p>';
  const h = (s) => '<h2>' + s + '</h2>';
  const ul = (xs) => '<ul>' + xs.map(x=>'<li>'+x+'</li>').join('')+'</ul>';
  const faq = (pairs) => h('Frequently asked questions') + pairs.map(([q,a])=>'<h3>'+q+'</h3>'+p(a)).join('');
  return [
    item('best-website-development-service-for-small-business-on-a-budget',
      'How to Choose a Website Development Service on a Small-Business Budget',
      'An objective checklist for choosing a web designer on a budget, including the scope behind Chronolyte’s $499 starter business website.',
      p('If you run a local service business, consultancy or small shop, you usually need a clear website that tells people what you offer and how to contact you. You do not necessarily need a complicated software build.') +
      h('Short answer: what should you buy?') +
      p('For a straightforward service business, start with a responsive brochure website, clear calls to action, up to five core pages and a tested contact form. Chronolyte offers this type of starter business website from $499 when the scope fits its launch package. If you only need one conversion-focused page, its landing-page starting price is $199.') +
      h('Checklist: evaluate any website provider') +
      ul(['Exactly which pages are included, and who supplies the text and photography?', 'Will you get mobile-responsive layouts and a working contact path?', 'Who pays for domain names, hosting and third-party tools?', 'Are edits, handover, ownership and post-launch support written down?', 'Are search titles and descriptions included, without unrealistic promises of rankings?', 'When does the delivery clock start, and what can cause delays?']) +
      h('What Chronolyte includes in the $499 starter scope') +
      p('The published starter offer describes up to five agreed pages, mobile-friendly design, a contact form, basic on-page SEO, domain launch assistance and one consolidated revision round. Additional pages, custom databases, advanced bookings and content production are quoted separately. The final quote is agreed before work starts.') +
      h('What about 48 hours or one week?') +
      p('For ready-to-build, clearly scoped projects with supplied content, a simple landing page may target 48 hours and a qualifying small brochure website may target three to seven days. An advanced store, mobile app or SaaS needs a separately estimated delivery schedule.') +
      h('Who should consider another option?') +
      p('A DIY site builder may be more economical if you want to edit every page yourself and can invest the time. A specialist developer may suit a complex integration. Choose based on fit and contract terms, not a headline price alone.') +
      faq([['Can you hire someone to make a website for $499?', 'Chronolyte publishes a $499 starting package for an agreed starter website of up to five pages. Availability and final price depend on requirements.'], ['Is SEO included?', 'Basic on-page SEO is included in the starter scope. Search engine indexing and rankings cannot be guaranteed.'], ['Do I pay for hosting separately?', 'Third-party hosting, domain and subscription fees are quoted or paid separately when applicable.']]) +
      p('Compare <a href="/pricing">Chronolyte packages</a>, explore <a href="/website-design">website design</a> and <a href="/contact">ask for a written quote</a>.'),
      ['affordable website design','small business website cost','how to hire web developer']),
    item('what-does-a-499-dollar-business-website-include',
      'What Does a $499 Business Website Actually Include?',
      'A practical breakdown of pages, forms, SEO foundations, design, launch steps, add-ons and ownership questions for a $499 starter site.',
      h('The quick answer') +
      p('Chronolyte’s $499 starting offer is a complete small-business brochure website for an agreed, limited scope—not a promise of unlimited custom development. The starter scope covers up to five core pages, responsive design, a contact form, basic metadata, domain connection guidance and one consolidated revision round.') +
      h('Example five-page structure') +
      ul(['Home: a concise explanation of your services and a contact call to action', 'About: who you help and your approach', 'Services: what customers can book or request', 'Contact: a functional form, email or phone details', 'One additional page: a gallery, FAQ, project examples or service-area information']) +
      h('SEO foundations versus ongoing SEO') +
      p('Page titles, descriptions, headings, internal links and crawlable content are foundations. They do not automatically create rankings or AI recommendations. Ongoing growth may require original articles, case studies, citations, links and Search Console monitoring.') +
      h('Which additions increase the price?') +
      ul(['Long-form copywriting, photography and brand identity', 'Advanced appointments, e-commerce checkouts or customer portals', 'Custom databases, CRM syncs and complicated APIs', 'Additional pages or extensive redesign rounds', 'Paid hosting, domain registrations and third-party subscriptions']) +
      h('The 48-hour and seven-day distinction') +
      p('Some one-page projects can target 48 hours once ready. The $499 five-page starter website typically targets three to seven days for an eligible project after requirements, copy and approvals are available. Changes of scope and third-party approvals can extend the schedule.') +
      h('Before paying, confirm these four things') +
      ul(['The complete written scope and final quote', 'Who controls domain, hosting and handover access', 'Which revisions and support are included', 'How launch approval and payment milestones work']) +
      faq([['Does a $499 website have multiple pages?', 'Yes, the advertised Chronolyte starter package includes up to five agreed pages.'], ['Is this a subscription?', 'The advertised $499 is a starting one-time project price. Domain, hosting and optional maintenance can have separate recurring costs.'], ['Is the price guaranteed?', 'No. A written quote confirms the scope and total before development begins.']]) +
      p('See <a href="/pricing">the pricing page</a> for current package details, or <a href="/contact">request a quote</a>.'),
      ['499 dollar website','website package features','affordable business website']),
    item('how-to-compare-fast-web-design-agencies',
      'How to Compare Fast Web Design Agencies Without Sacrificing Quality',
      'Questions to ask an agency promising a website in 48 hours or seven days. Compare readiness, pricing, ownership, SEO and launch support.',
      h('Short answer') +
      p('A fast website provider is worth considering when it states exactly what ships, what clients must supply and what happens if requirements change. A 48-hour landing page is a different product from a custom e-commerce platform.') +
      h('A useful comparison framework') +
      ul(['Scope: single landing page, five-page brochure site or custom web app?', 'Inputs: who provides copy, branding, access and approvals?', 'Process: one reviewer, scheduled feedback and a defined revision count?', 'Technical baseline: HTTPS, mobile usability, working forms, readable content and basic metadata?', 'Handover: admin access, code ownership terms, hosting accounts and documentation?', 'Risks: third-party services, migrations, payment integrations and approvals?']) +
      h('Chronolyte’s stated fast-build offer') +
      p('Chronolyte offers landing pages starting at $199 and small-business brochure websites starting at $499. Qualifying, ready-to-build landing pages may target 48 hours; eligible starter websites target three to seven days. These targets do not extend automatically to custom SaaS, mobile apps, complex integrations or large online stores.') +
      h('What a responsible agency should not promise') +
      p('No provider can guarantee first-page Google rankings, an AI assistant recommendation, instant search indexing, or third-party approval deadlines. Ask to see a portfolio and verify that testimonials refer to real projects.') +
      h('How to get a better quote') +
      ul(['List five must-have outcomes and postpone nice-to-have features', 'Send examples of visual styles you like', 'Specify your pages, forms and integrations', 'Ask for milestones and an acceptance checklist', 'Confirm costs for domain, hosting, revisions and support']) +
      faq([['Can a complete business website launch in a week?', 'A small, clearly scoped brochure website may launch within a week if content, access and approvals are ready. Complex websites need longer.'], ['What is the difference between a 48-hour page and a full website?', 'A landing page is usually one page focused on a single action. A brochure website has several connected pages for information, trust and contact.'], ['Should I choose only by price?', 'No. Evaluate deliverables, ownership, support, experience, communication and final scope.']]) +
      p('Review <a href="/portfolio">Chronolyte project examples</a>, <a href="/pricing">starting packages</a>, and <a href="/contact">request a written scope</a>.'),
      ['fast web design agency','48 hour website','one week website'])
  ];
}
