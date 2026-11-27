import { ArrowRight, Building2, CheckCircle2, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import businessTypes from '../data/businessTypes.json';
import { CtaBand, PageHero, SectionHead, Sheet } from '../components/editorial/EditorialPage';

const slug = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function Industries() {
  return (
    <>
      <PageHero
        study="helix"
        eyebrow="Industry-aware digital work"
        title={<>Websites and software shaped around <em>your business.</em></>}
        lede="A contractor, clinic, online store, nonprofit or software startup each has different customers and workflows. We scope the website, app, store or automation around what your organisation actually needs — not a one-size-fits-all industry template."
        actions={
          <>
            <Link to="/contact" className="ed-btn">Get a free project plan <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/locations" className="ed-btn ed-btn--ghost"><Globe2 className="h-4 w-4" /> Nationwide service areas</Link>
          </>
        }
        meta={
          <>
            <span><Building2 className="h-4 w-4" /> 12 business types</span>
            <span>Custom scopes, never templates</span>
            <span>Remote worldwide</span>
          </>
        }
      />

      <Sheet tone="paper">
        <SectionHead
          rubric="Business types"
          number="01 / 03"
          title={<>Who we <em>build for</em></>}
          lede="These are common examples, not a closed list. If your business model is specialised or spans multiple sectors, we can scope around that too."
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {businessTypes.map((industry, index) => (
            <article
              id={`industry-${slug(industry.name)}`}
              key={industry.name}
              className="ed-card"
              style={{ scrollMarginTop: 110 }}
            >
              <span className="ed-card__num">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="ed-card__title">{industry.name}</h3>
              <p className="ed-card__body">{industry.examples}</p>
              <p style={{ marginTop: '0.9rem', paddingTop: '0.9rem', borderTop: '1px solid var(--line)', fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--copy)', display: 'flex', gap: '0.5rem' }}>
                <CheckCircle2 className="h-4 w-4" style={{ flex: 'none', marginTop: 3, color: 'var(--accent-ink)' }} />
                <span>{industry.digitalNeeds}</span>
              </p>
            </article>
          ))}
        </div>
      </Sheet>

      <Sheet tone="alloy">
        <SectionHead
          rubric="Ways we help"
          number="02 / 03"
          title={<>Three ways to <em>work with us</em></>}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Websites and e-commerce', 'Responsive marketing sites, catalogues, online stores, booking journeys and customer portals.'],
            ['Apps and SaaS products', 'Product discovery, UX, MVP planning, application development, integrations and ongoing improvements.'],
            ['Automation and integrations', 'Workflow automation, CRM connections, AI-assisted tools and systems that reduce repetitive work.']
          ].map(([title, description], index) => (
            <article key={title} className="ed-card h-full">
              <span className="ed-card__num">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="ed-card__title">{title}</h3>
              <p className="ed-card__body">{description}</p>
            </article>
          ))}
        </div>
      </Sheet>

      <CtaBand
        eyebrow="03 / 03 — Different kind of business?"
        title={<>Have a different kind of <em>business?</em></>}
        description="Tell us about your customers, goals and existing tools. We’ll recommend a practical scope before you commit."
        primaryTo="/contact"
        primaryLabel="Start with a free plan"
        secondaryTo="/pricing"
        secondaryLabel="See pricing"
        note={`Prefer to talk? Call ${CONTACT_PHONE_DISPLAY} — or use the number in the header.`}
      >
        <p style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
          <a href={CONTACT_PHONE_TEL} className="ed-link">Call {CONTACT_PHONE_DISPLAY}</a>
        </p>
      </CtaBand>
    </>
  );
}
