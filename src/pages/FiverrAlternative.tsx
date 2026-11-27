import { ArrowRight, BriefcaseBusiness, Check, Clock3, Globe2, Handshake, Layers3, MessageCircle, ShieldCheck, Users, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LeadCaptureForm } from '../components/LeadCaptureForm';
import { CtaBand, PageHero, SectionHead, Sheet } from '../components/editorial/EditorialPage';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import faqs from '../data/fiverrAlternativeFaqs.json';

const comparisonOptions = [
  {
    name: 'Fiverr',
    model: 'Marketplace of seller services and custom offers',
    bestFor: 'A small, clearly defined deliverable—such as a one-off design asset or a narrowly scoped fix.',
    coordination: 'You select the seller, confirm the requirements, and coordinate the work.',
    tradeoff: 'A series of separate gigs may need extra planning and integration if your project has many parts.'
  },
  {
    name: 'Upwork',
    model: 'Freelance marketplace with different engagement formats',
    bestFor: 'Finding an individual specialist or assembling a flexible freelance arrangement.',
    coordination: 'You review candidates, agree on a contract, and manage communication and delivery.',
    tradeoff: 'You remain responsible for joining the pieces together unless you separately arrange project leadership.'
  },
  {
    name: 'Chronolyte',
    model: 'Remote managed web and software development studio',
    bestFor: 'A website, app, e-commerce store, or SaaS project that needs coordinated planning, design, and development.',
    coordination: 'Start with one project brief and a point of contact for a proposed scope, timeline, and quote.',
    tradeoff: 'A managed studio is not a marketplace for browsing many individual sellers and may not fit every micro-task.'
  }
];

const fitSignals = [
  'The brief is small and specific, and you can describe exactly what “done” means.',
  'You have time to compare providers, review work, and manage handoffs.',
  'You only need one skill or deliverable and can accept responsibility for coordinating it.'
];

const studioSignals = [
  'The project needs discovery, user experience, engineering, and testing to work together.',
  'You prefer one project contact instead of coordinating several independent contracts.',
  'You want the scope, milestones, timeline, and quote discussed before work starts.'
];

export function FiverrAlternative() {
  return (
    <>
      <PageHero
        study="register"
        eyebrow="Compare ways to build your project"
        title={<>Looking for a Fiverr or Upwork alternative for <em>web development?</em></>}
        lede="The right choice depends on the size of the job and how much project coordination you want to do. Compare freelance marketplaces with a managed studio before you choose a team for your website, app, online store, or SaaS product."
        actions={
          <>
            <a href="#start" className="ed-btn">Get a free project plan <ArrowRight className="h-4 w-4" /></a>
            <a href="#compare" className="ed-btn ed-btn--ghost">Compare the options</a>
          </>
        }
        meta={
          <>
            <span><ShieldCheck className="h-4 w-4" /> No obligation to proceed</span>
            <span><Clock3 className="h-4 w-4" /> Reply within one business day</span>
            <span><Globe2 className="h-4 w-4" /> Remote, worldwide</span>
          </>
        }
      />

      <Sheet tone="fog">
        <p className="ed-rubric">Short answer<span className="ed-rubric__num">01 / 06</span></p>
        <h2 className="ed-title ed-title--sm" style={{ marginTop: '0.5rem' }}>Which option should you <em>choose?</em></h2>
        <p className="ed-lede">
          Fiverr or Upwork may suit a small, well-defined task when you are comfortable selecting and managing the freelancer. A managed development studio is another option when a website, app, or SaaS project needs connected planning, design, development, and delivery. Chronolyte works remotely with businesses worldwide and provides a free initial project plan and quote; fit depends on your scope and requirements.
        </p>
      </Sheet>

      <Sheet tone="paper" id="compare">
        <SectionHead
          rubric="Side-by-side comparison"
          number="02 / 06"
          title={<>Fiverr vs Upwork vs a <em>managed studio</em></>}
          lede="These are different service models, not a guarantee that one provider will suit every project. Individual experience varies, and marketplace terms can change."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {comparisonOptions.map((option, index) => (
            <article
              key={option.name}
              className="ed-card h-full"
              style={index === 2 ? { borderColor: 'var(--accent-ink)', borderWidth: 2, boxShadow: 'inset 0 3px var(--signal)' } : undefined}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.7rem' }}>
                <div>
                  <p className="ed-rubric" style={{ marginBottom: '0.4rem' }}>Option {index + 1}</p>
                  <h3 className="ed-card__title" style={{ fontSize: '1.5rem' }}>{option.name}</h3>
                </div>
                {index === 2 && <Handshake className="h-6 w-6" style={{ color: 'var(--accent-ink)', flex: 'none' }} aria-hidden="true" />}
              </div>
              <dl style={{ margin: '1rem 0 0', display: 'grid', gap: '0.8rem' }}>
                {[
                  ['Model', option.model],
                  ['Often a fit for', option.bestFor],
                  ['Who coordinates?', option.coordination],
                  ['Consider', option.tradeoff]
                ].map(([term, value]) => (
                  <div key={term} style={term === 'Consider' ? { borderTop: '1px solid var(--line)', paddingTop: '0.7rem' } : undefined}>
                    <dt style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--accent-ink)' }}>{term}</dt>
                    <dd style={{ margin: '0.25rem 0 0', fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--copy)' }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
        <p style={{ marginTop: '0.9rem', fontSize: '0.74rem', lineHeight: 1.6, color: 'var(--muted)' }}>
          Fiverr and Upwork are mentioned for comparison only. Chronolyte is independent and is not affiliated with or endorsed by either platform. Confirm current platform features, fees, and terms directly with each provider.
        </p>
      </Sheet>

      <Sheet tone="alloy">
        <SectionHead rubric="Which fits your situation?" number="03 / 06" title={<>Two honest <em>fit checks</em></>} />
        <div className="grid gap-4 md:grid-cols-2">
          <article className="ed-card h-full">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <Users className="h-5 w-5" style={{ color: 'var(--accent-ink)' }} />
              <h3 className="ed-card__title" style={{ margin: 0 }}>A marketplace may fit when…</h3>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.55rem' }}>
              {fitSignals.map((signal) => (
                <li key={signal} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--copy)' }}>
                  <Check className="h-4 w-4" style={{ flex: 'none', marginTop: 3, color: 'var(--accent-ink)' }} /> {signal}
                </li>
              ))}
            </ul>
          </article>
          <article className="ed-card h-full">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
              <Workflow className="h-5 w-5" style={{ color: 'var(--accent-ink)' }} />
              <h3 className="ed-card__title" style={{ margin: 0 }}>A managed studio may fit when…</h3>
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.55rem' }}>
              {studioSignals.map((signal) => (
                <li key={signal} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--copy)' }}>
                  <Check className="h-4 w-4" style={{ flex: 'none', marginTop: 3, color: 'var(--accent-ink)' }} /> {signal}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </Sheet>

      <Sheet tone="paper">
        <SectionHead
          rubric="How it works"
          number="04 / 06"
          title={<>A clear first step, <em>before you commit</em></>}
          lede="If you want to compare a managed option, share your brief and get a proposed scope before deciding whether to proceed."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { number: '01', icon: MessageCircle, title: 'Describe the outcome', body: 'Tell us what you are building, who it is for, and any current systems or constraints.' },
            { number: '02', icon: Layers3, title: 'Review the proposed scope', body: 'Chronolyte replies with a suggested scope, timeline, and quote for you to review.' },
            { number: '03', icon: Handshake, title: 'Choose what works for you', body: 'Ask questions, compare the proposal with other options, and proceed only if it fits.' }
          ].map((step) => {
            const StepIcon = step.icon;
            return (
              <article key={step.number} className="ed-card ed-card--numbered h-full">
                <span className="ed-card__num">{step.number}</span>
                <span className="ed-icon-badge"><StepIcon /></span>
                <h3 className="ed-card__title">{step.title}</h3>
                <p className="ed-card__body">{step.body}</p>
              </article>
            );
          })}
        </div>
      </Sheet>

      <Sheet tone="fog">
        <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <p className="ed-rubric">Compare the full picture<span className="ed-rubric__num">05 / 06</span></p>
            <h2 className="ed-title ed-title--sm" style={{ marginTop: '0.5rem' }}>Look beyond the first <em>price you see</em></h2>
            <p className="ed-lede">A fair comparison includes more than a listing price or hourly rate. Check what is included, who will manage the work, how revisions and testing are handled, and what happens if the scope changes.</p>
          </div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.55rem' }}>
            {['Written deliverables and exclusions', 'Communication and project-management time', 'Testing, revisions, integrations, and handoff', 'Payment schedule, platform terms, and ongoing costs'].map((item) => (
              <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--copy)' }}>
                <Check className="h-4 w-4" style={{ flex: 'none', marginTop: 3, color: 'var(--accent-ink)' }} /> {item}
              </li>
            ))}
          </ul>
        </div>
      </Sheet>

      <Sheet tone="paper">
        <SectionHead
          rubric="Hiring checklist"
          number="06 / 06"
          title={<>Practical advice for <em>either route</em></>}
        />
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.55rem' }} className="md:grid-cols-2">
          {[
            'Write down deliverables, acceptance criteria, due dates, revision limits, and exclusions before work begins.',
            'Review relevant examples and confirm who will do the work; use the platform’s current communication, payment, and dispute processes.',
            'Agree who owns the final code, design files, content, and other assets, and document any third-party licenses.',
            'Protect accounts and customer data: use individual, least-privilege access and avoid sharing passwords or production credentials.',
            'Use clear milestones and review points that fit the scope; plan for testing, documentation, and a usable handoff.',
            'Check the platform’s current terms before changing how you communicate or pay, and keep important agreements in writing.'
          ].map((tip) => (
            <li key={tip} className="ed-card ed-card--flat" style={{ flexDirection: 'row', gap: '0.6rem', alignItems: 'flex-start', padding: '0.85rem 1rem' }}>
              <Check className="h-4 w-4" style={{ flex: 'none', marginTop: 3, color: 'var(--accent-ink)' }} />
              <span style={{ fontSize: '0.86rem', lineHeight: 1.6, color: 'var(--copy)' }}>{tip}</span>
            </li>
          ))}
        </ul>
      </Sheet>

      <Sheet tone="alloy">
        <SectionHead rubric="Frequently asked questions" title={<>Fiverr, Upwork and <em>alternatives</em></>} />
        <div style={{ display: 'grid', gap: '0.8rem' }}>
          {faqs.map((faq) => (
            <article key={faq.question} className="ed-card ed-card--flat">
              <h3 className="ed-card__title">{faq.question}</h3>
              <p className="ed-card__body">{faq.answer}</p>
            </article>
          ))}
        </div>
      </Sheet>

      <Sheet tone="paper">
        <SectionHead rubric="Explore related pages" title={<>Keep <em>digging</em></>} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { to: '/services', title: 'Development services', body: 'Websites, e-commerce, apps, and SaaS.', icon: Workflow },
            { to: '/pricing', title: 'Project pricing', body: 'Review typical project ranges and request a scoped quote.', icon: BriefcaseBusiness },
            { to: '/blog/fiverr-upwork-alternative', title: 'Read the comparison guide', body: 'Explore the longer marketplace comparison and hiring advice.', icon: Layers3 },
            { to: '/locations', title: 'Service areas', body: 'See how remote projects cover all 50 states.', icon: Globe2 }
          ].map((item) => {
            const CardIcon = item.icon;
            return (
              <Link key={item.to} to={item.to} className="ed-card h-full" style={{ textDecoration: 'none' }}>
                <CardIcon className="h-5 w-5" style={{ color: 'var(--accent-ink)' }} />
                <h3 className="ed-card__title" style={{ marginTop: '0.7rem', fontSize: '1rem' }}>{item.title}</h3>
                <p className="ed-card__body" style={{ fontSize: '0.85rem' }}>{item.body}</p>
                <span style={{ marginTop: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-ink)' }}>
                  Explore <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </Sheet>

      <CtaBand
        eyebrow="Want to compare a managed option?"
        title={<>Get a project scope and quote — <em>then decide.</em></>}
        description="Share your goals and constraints. The initial project plan is free and carries no obligation."
        primaryTo="/contact"
        primaryLabel="Start a project brief"
        secondaryTo="/pricing"
        secondaryLabel="See pricing"
        note={`Or call ${CONTACT_PHONE_DISPLAY} to talk it through.`}
      >
        <p style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
          <a href={CONTACT_PHONE_TEL} className="ed-link">Call {CONTACT_PHONE_DISPLAY}</a>
        </p>
      </CtaBand>

      <Sheet tone="paper" id="start">
        <SectionHead
          rubric="No pressure, just a clearer next step"
          title={<>Tell us what you want <em>to build</em></>}
          lede="Get a proposed scope, timeline, and quote from a remote team."
        />
        <LeadCaptureForm source="fiverr-upwork-alternative" />
      </Sheet>
    </>
  );
}
