import { Link } from 'react-router-dom';
import { ArrowRight, Check, PhoneCall } from 'lucide-react';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import { CtaBand, PageHero, SectionHead, Sheet } from '../components/editorial/EditorialPage';

const offerings = {
  'website-design': {
    eyebrow: 'Custom website design',
    title: 'Custom Website Design for Small Businesses',
    intro: 'Chronolyte designs and develops business websites, landing pages, and online experiences built around your goals, brand, and customers.',
    suitable: 'Small businesses, consultants, service providers, startups, and founders who want an original, maintainable website.',
    deliverables: ['Responsive layouts for phones, tablets and desktops', 'Clear calls to action and lead-generation forms', 'Accessible navigation and readable page structure', 'Search-friendly metadata and performance-focused implementation', 'Deployment support and a handover plan'],
    questions: [['Can you build a site without a template?', 'Chronolyte offers custom website development. Discuss your preferred design and framework when requesting a quote.'], ['Can you add contact or booking forms?', 'Lead capture, inquiries, and integrations can be scoped to your workflow.']]
  },
  'affordable-web-design': {
    eyebrow: 'Affordable web design',
    title: 'Affordable Web Design for Small Businesses',
    intro: 'Get a website scoped to what your business actually needs. Chronolyte can help prioritize the essentials before expanding into advanced features.',
    suitable: 'Owners who need a professional online presence and want a clear estimate before development begins.',
    deliverables: ['Discovery and scope planning', 'Mobile-responsive website design', 'Easy-to-find contact and conversion paths', 'SEO foundations and clear site structure', 'Launch guidance and optional future improvements'],
    questions: [['How much does a small business website cost?', 'Pricing depends on page count, integrations, content, design and maintenance. See the current pricing page and request a project-specific quote.'], ['Can I start small?', 'Yes, you can request an initial scope focused on your highest-priority pages.']]
  },
  'website-redesign': {
    eyebrow: 'Website redesign',
    title: 'Website Redesign and Modernization',
    intro: 'Refresh an outdated website without losing the content and functionality that already works for your visitors.',
    suitable: 'Businesses with slow, difficult-to-use, dated or underperforming websites.',
    deliverables: ['Existing site review and redesign scope', 'Mobile usability and accessibility improvements', 'Clearer pages and stronger calls to action', 'SEO-safe migration planning and redirect mapping when needed', 'Testing and launch support'],
    questions: [['Will I lose my Google rankings?', 'No redesign can guarantee rankings. We can plan redirect mapping, preserve useful URLs and monitor indexing to reduce migration risk.'], ['Do you have to rebuild everything?', 'Not always. The scope depends on your current site and technology.']]
  },
  'ai-automation': {
    eyebrow: 'AI automation',
    title: 'AI Automation for Business Workflows',
    intro: 'Explore workflow automation, AI chatbots, lead routing and custom integrations that reduce manual work in your business.',
    suitable: 'Teams that repeatedly copy information between tools, answer common questions, or process customer inquiries.',
    deliverables: ['Process discovery and integration planning', 'Custom workflow or chatbot implementation', 'Human review and escalation points', 'Security and privacy requirements assessment', 'Testing and maintenance options'],
    questions: [['Can automation work with my current tools?', 'Compatibility depends on the APIs and access provided by those tools.'], ['Will the AI make decisions alone?', 'We can scope human approval for sensitive or high-impact steps.']]
  },
  'custom-software': {
    eyebrow: 'Custom software',
    title: 'Custom Software and SaaS MVP Development',
    intro: 'Build a focused web application, dashboard, or SaaS MVP around a clearly defined product problem.',
    suitable: 'Founders and businesses with a product idea or internal application requirements.',
    deliverables: ['MVP feature prioritization', 'Architecture and database planning', 'Responsive interface development', 'Authentication and third-party integrations where required', 'Testing, deployment and ownership handover'],
    questions: [['Can you build an MVP first?', 'Yes, request a proposal for a smaller, testable first release.'], ['What will development cost?', 'Cost depends on the feature set, integrations, complexity, and delivery schedule. Request a tailored estimate.']]
  }
} as const;

export type ServiceSlug = keyof typeof offerings;

export function ServiceLanding({ slug }: { slug: ServiceSlug }) {
  const entry = offerings[slug];

  return (
    <>
      <PageHero
        study={slug === 'ai-automation' ? 'signal' : slug === 'custom-software' ? 'gyroscope' : slug === 'website-redesign' ? 'helix' : 'turbine'}
        eyebrow={entry.eyebrow}
        title={entry.title.split(' for ')[0]}
        lede={entry.intro}
        actions={
          <>
            <Link to="/contact" className="ed-btn">Request a project quote <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/pricing" className="ed-btn ed-btn--ghost">Explore pricing</Link>
          </>
        }
        meta={
          <>
            <span>Free scoping call</span>
            <span>Fixed-price quote</span>
            <span>Worldwide remote delivery</span>
          </>
        }
      />

      <Sheet tone="paper">
        <SectionHead
          rubric="Who this is for"
          number="01 / 03"
          title={<>Is this a fit for <em>your project?</em></>}
          lede={entry.suitable}
        />
      </Sheet>

      <Sheet tone="fog">
        <SectionHead
          rubric="What's included"
          number="02 / 03"
          title={<>What your project <em>can include</em></>}
        />
        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.55rem' }}>
          {entry.deliverables.map((item) => (
            <li key={item} className="ed-card" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: '0.7rem', padding: '0.9rem 1.1rem' }}>
              <Check className="h-4 w-4" style={{ flex: 'none', marginTop: 3, color: 'var(--accent-ink)' }} />
              <span style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--copy)' }}>{item}</span>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet tone="paper">
        <SectionHead
          rubric="Common questions"
          number="03 / 03"
          title={<>Straight <em>answers</em></>}
        />
        <div style={{ display: 'grid', gap: '0.9rem' }}>
          {entry.questions.map(([q, a]) => (
            <article key={q} className="ed-card ed-card--flat">
              <h3 className="ed-card__title">{q}</h3>
              <p className="ed-card__body">{a}</p>
            </article>
          ))}
        </div>
        <p className="ed-copy" style={{ marginTop: '1.4rem' }}>
          Prefer to talk it through? <a href={CONTACT_PHONE_TEL} className="ed-link">Call {CONTACT_PHONE_DISPLAY}</a>.
        </p>
      </Sheet>

      <CtaBand
        eyebrow="Free project plan"
        title={<>Tell us what you want <em>to build</em></>}
        description="Share your requirements and receive a proposal based on your project's actual scope — no templates, no vague estimates."
        primaryTo="/contact"
        primaryLabel="Discuss your project"
        secondaryTo="/services"
        secondaryLabel="See all services"
        note="Reply within one business day. No card required."
      >
        <p style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
          <a href={CONTACT_PHONE_TEL} className="ed-link"><PhoneCall className="mr-1 inline h-3.5 w-3.5" /> {CONTACT_PHONE_DISPLAY}</a>
        </p>
      </CtaBand>
    </>
  );
}
