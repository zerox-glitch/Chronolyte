import { ArrowRight, Globe2, MapPin, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import usServiceAreas from '../data/usServiceAreas.json';
import { CtaBand, PageHero, SectionHead, Sheet } from '../components/editorial/EditorialPage';

export function Locations() {
  return (
    <>
      <PageHero
        study="globe"
        eyebrow="Remote nationwide service"
        title={<>Web design and development across the <em>United States.</em></>}
        lede="Chronolyte works remotely with businesses in all 50 states. We plan, design, build and support projects online, so you can work with our team from a major metro, a smaller city or a surrounding community. The cities below are examples — not a limit on where we work — and do not imply a local office in each place."
        actions={
          <>
            <Link to="/contact" className="ed-btn">Discuss your project <ArrowRight className="h-4 w-4" /></Link>
            <a href={CONTACT_PHONE_TEL} className="ed-btn ed-btn--ghost"><PhoneCall className="h-4 w-4" /> {CONTACT_PHONE_DISPLAY}</a>
          </>
        }
        meta={
          <>
            <span><Globe2 className="h-4 w-4" /> All 50 states</span>
            <span>Remote-first since day one</span>
            <span>No local office claims</span>
          </>
        }
      />

      <Sheet tone="paper">
        <div className="ed-section-head">
          <div className="ed-section-head__body">
            <p className="ed-rubric">Where we work<span className="ed-rubric__num">01 / 03</span></p>
            <h2 className="ed-title">All 50 states, <em>one remote team</em></h2>
          </div>
          <Link to="/industries" className="ed-btn ed-btn--ghost ed-btn--sm">
            Explore business types <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <nav aria-label="Jump to a state" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.6rem' }}>
          {usServiceAreas.map((state) => (
            <a key={state.abbr} href={`#state-${state.abbr.toLowerCase()}`} className="ed-chip" style={{ textDecoration: 'none' }}>
              {state.abbr}
            </a>
          ))}
        </nav>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {usServiceAreas.map((state) => (
            <article id={`state-${state.abbr.toLowerCase()}`} key={state.abbr} className="ed-card ed-card--flat" style={{ scrollMarginTop: 110 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.7rem' }}>
                <h3 className="ed-card__title" style={{ margin: 0 }}>{state.name}</h3>
                <span className="ed-chip">{state.abbr}</span>
              </div>
              <p style={{ margin: '0.8rem 0 0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent-ink)' }}>
                <MapPin className="h-3.5 w-3.5" /> Example cities
              </p>
              <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', margin: 0, padding: 0, listStyle: 'none' }}>
                {state.cities.map((city) => (
                  <li key={city} style={{ padding: '0.28rem 0.6rem', border: '1px solid var(--line)', borderRadius: 999, background: 'var(--signal-wash)', fontSize: '0.72rem', color: 'var(--copy)' }}>{city}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="ed-copy" style={{ marginTop: '1.2rem', fontSize: '0.85rem' }}>
          City names are representative examples. Remote availability extends to other towns and communities in these states as well.
        </p>
      </Sheet>

      <Sheet tone="alloy">
        <SectionHead
          rubric="Remote project delivery"
          number="02 / 03"
          title={<>Distance is <em>not the constraint</em></>}
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Plan across time zones', 'We use a clear brief, written scope, scheduled calls and shared project updates to keep remote work moving.'],
            ['Build for your customers', 'The project starts with your audience, service area, buying process and the tools your team already uses.'],
            ['Launch and keep improving', 'You receive a handoff plan and can discuss support, updates and next steps after launch.']
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
        eyebrow="03 / 03 — Anywhere in the U.S."
        title={<>Tell us where your <em>customers are</em></>}
        description="Share your city, state and what you need built. We’ll reply with a free plan, timeline and fixed quote within one business day."
        primaryTo="/contact"
        primaryLabel="Start your project free"
        secondaryTo="/international-web-development"
        secondaryLabel="Working outside the U.S.?"
        note="Remote service only — no physical office is implied in any listed city or state."
      />
    </>
  );
}
