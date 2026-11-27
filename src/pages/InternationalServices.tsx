import { Link } from 'react-router-dom';
import { ArrowRight, Globe2, PhoneCall } from 'lucide-react';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import { CtaBand, PageHero, SectionHead, Sheet } from '../components/editorial/EditorialPage';

const countries = [
  { name: 'United States', note: 'Remote website development across all 50 states', examples: 'Service businesses, startups, consultants and growing teams' },
  { name: 'United Kingdom', note: 'Remote web design and software projects throughout the UK', examples: 'Small businesses, independent professionals, online shops and founders' },
  { name: 'Pakistan', note: 'Remote website development for Pakistani businesses and founders', examples: 'Local service businesses, startups, exporters and online ventures' },
  { name: 'Canada', note: 'Remote web design for Canadian businesses', examples: 'Small businesses, professional services and startup websites' },
  { name: 'Australia', note: 'Remote website development for Australian businesses', examples: 'Service companies, founders and digital products' },
  { name: 'New Zealand', note: 'Remote design and web application work', examples: 'Independent businesses and product teams' },
  { name: 'Ireland', note: 'Remote website and software services', examples: 'Small businesses, consultants and startups' }
];

const faqs = [
  { q: 'Do you work with businesses outside the United States?', a: 'Yes. Chronolyte welcomes remote inquiries from the UK, Pakistan, Canada, Australia, New Zealand, Ireland and elsewhere, subject to project fit and the ability to provide services.' },
  { q: 'Are your website prices the same worldwide?', a: 'Published prices are in US dollars and are starting quotes, not guaranteed local-currency totals. Final cost, currency, payment method and applicable fees should be agreed before work starts.' },
  { q: 'Can you deliver a business website within a week?', a: 'Eligible, clearly scoped starter websites may target three to seven days after assets and approvals are ready. Complex stores, custom software and third-party approvals require separate timelines.' },
  { q: 'Do you have an office in each country?', a: 'No. Country coverage describes remote service availability, not local office locations or guaranteed local business registration.' }
];

export function InternationalServices() {
  return (
    <>
      <PageHero
        study="globe"
        eyebrow="Worldwide remote delivery"
        title={<>Website design & software for businesses <em>worldwide</em></>}
        lede="Chronolyte works remotely with businesses in the USA, UK, Pakistan, Canada, Australia, New Zealand, Ireland and other countries. We build responsive websites, online stores, focused software MVPs and practical AI workflows — planned and delivered online, wherever you are."
        actions={
          <>
            <Link to="/contact" className="ed-btn">Request a project quote <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/pricing" className="ed-btn ed-btn--ghost">Explore starting prices</Link>
          </>
        }
        meta={
          <>
            <span><Globe2 className="h-4 w-4" /> 7+ countries served remotely</span>
            <span><PhoneCall className="h-4 w-4" /> {CONTACT_PHONE_DISPLAY}</span>
            <span>USD pricing</span>
          </>
        }
      />

      <Sheet tone="paper">
        <SectionHead
          rubric="Countries we welcome"
          number="01 / 04"
          title={<>Remote service, <em>worldwide</em></>}
          lede="These are remote service areas, not claims of physical offices or locally incorporated entities."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {countries.map((country, index) => (
            <article key={country.name} className="ed-card h-full">
              <span className="ed-card__num">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="ed-card__title">{country.name}</h3>
              <p className="ed-card__body">{country.note}</p>
              <p className="ed-card__body" style={{ marginTop: '0.7rem', paddingTop: '0.7rem', borderTop: '1px solid var(--line)', fontSize: '0.8rem', color: 'var(--muted)' }}>
                {country.examples}
              </p>
            </article>
          ))}
        </div>
      </Sheet>

      <Sheet tone="fog">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <SectionHead
              rubric="What you can hire us for"
              number="02 / 04"
              title={<>Build the <em>whole thing</em></>}
            />
            <ul style={{ margin: '1.2rem 0 0', paddingLeft: '1.2rem', display: 'grid', gap: '0.6rem', color: 'var(--copy)', lineHeight: 1.65 }}>
              <li><Link to="/website-design" className="ed-link">Business websites</Link>, landing pages and redesigns</li>
              <li>Starter e-commerce storefronts and catalogues</li>
              <li><Link to="/custom-software" className="ed-link">Custom software</Link>, dashboards and SaaS prototypes</li>
              <li><Link to="/ai-automation" className="ed-link">AI-assisted workflow automation</Link> and integrations</li>
            </ul>
          </div>
          <div>
            <SectionHead
              rubric="How it works"
              number="03 / 04"
              title={<>Cross-border, <em>without friction</em></>}
            />
            <ol style={{ margin: '1.2rem 0 0', paddingLeft: '1.2rem', display: 'grid', gap: '0.6rem', color: 'var(--copy)', lineHeight: 1.65 }}>
              <li>Share your goals, country, audience and required features</li>
              <li>Receive a written scope, quote, milestones and delivery estimate</li>
              <li>Collaborate remotely using an agreed communication schedule</li>
              <li>Review the build, approve launch and receive agreed handover materials</li>
            </ol>
          </div>
        </div>
      </Sheet>

      <Sheet tone="paper">
        <SectionHead
          rubric="Frequently asked"
          number="04 / 04"
          title={<>Questions we <em>hear often</em></>}
        />
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          {faqs.map((faq) => (
            <article key={faq.q} className="ed-card ed-card--flat">
              <h3 className="ed-card__title">{faq.q}</h3>
              <p className="ed-card__body">{faq.a}</p>
            </article>
          ))}
        </div>
      </Sheet>

      <CtaBand
        eyebrow="No obligation"
        title={<>Ready to discuss <em>your project?</em></>}
        description="Tell us where your customers are and what you need built. We will discuss a scope and a realistic timeline."
        primaryTo="/contact"
        primaryLabel="Contact Chronolyte"
        secondaryTo="/locations"
        secondaryLabel="See U.S. coverage"
        note={`Or call ${CONTACT_PHONE_DISPLAY} — Monday to Friday, remote.`}
      >
        <p style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
          <a href={CONTACT_PHONE_TEL} className="ed-link">Call {CONTACT_PHONE_DISPLAY}</a>
        </p>
      </CtaBand>
    </>
  );
}
