import { ArrowRight, BriefcaseBusiness, Check, Clock3, Globe2, Handshake, Layers3, MessageCircle, ShieldCheck, Users, Workflow } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { LeadCaptureForm } from '../components/LeadCaptureForm';
import { SiteNavigation } from '../components/SiteNavigation';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import faqs from '../data/fiverrAlternativeFaqs.json';

const comparisonOptions = [
  {
    name: 'Fiverr',
    model: 'Marketplace of seller services and custom offers',
    bestFor: 'A small, clearly defined deliverable—such as a one-off design asset or a narrowly scoped fix.',
    coordination: 'You select the seller, confirm the requirements, and coordinate the work.',
    tradeoff: 'A series of separate gigs may need extra planning and integration if your project has many parts.',
    tone: 'border-white/10 bg-white/[0.035]'
  },
  {
    name: 'Upwork',
    model: 'Freelance marketplace with different engagement formats',
    bestFor: 'Finding an individual specialist or assembling a flexible freelance arrangement.',
    coordination: 'You review candidates, agree on a contract, and manage communication and delivery.',
    tradeoff: 'You remain responsible for joining the pieces together unless you separately arrange project leadership.',
    tone: 'border-white/10 bg-white/[0.035]'
  },
  {
    name: 'Chronolyte',
    model: 'Remote managed web and software development studio',
    bestFor: 'A website, app, e-commerce store, or SaaS project that needs coordinated planning, design, and development.',
    coordination: 'Start with one project brief and a point of contact for a proposed scope, timeline, and quote.',
    tradeoff: 'A managed studio is not a marketplace for browsing many individual sellers and may not fit every micro-task.',
    tone: 'border-cyan-300/30 bg-gradient-to-br from-cyan-950/45 via-[#0b1420] to-blue-950/35'
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
    <div className="min-h-screen overflow-x-hidden bg-dark-900 text-white">
      <SiteNavigation />
      <main id="main" className="px-4 pb-16 pt-28 md:px-6 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-white/45">
            <Link to="/" className="transition-colors hover:text-cyan-300">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/75" aria-current="page">Fiverr &amp; Upwork alternatives</span>
          </nav>

          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#101c2b] via-[#0a101b] to-[#090b13] px-6 py-10 md:px-12 md:py-16">
            <div className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-[90px]" />
            <div className="relative max-w-4xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                <BriefcaseBusiness className="h-4 w-4" /> Compare ways to build your project
              </span>
              <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
                Looking for a Fiverr or Upwork alternative for <span className="gradient-text">web development?</span>
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/60 md:text-lg">
                The right choice depends on the size of the job and how much project coordination you want to do. Compare freelance marketplaces with a managed studio before you choose a team for your website, app, online store, or SaaS product.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#start" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-black transition hover:shadow-lg hover:shadow-cyan-500/25">
                  Get a free project plan <ArrowRight className="h-4 w-4" />
                </a>
                <a href="#compare" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-cyan-300/40 hover:text-white">
                  Compare the options
                </a>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/55">
                <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-cyan-300" /> No obligation to proceed</span>
                <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-cyan-300" /> Reply within one business day</span>
                <span className="inline-flex items-center gap-2"><Globe2 className="h-4 w-4 text-cyan-300" /> Remote U.S.-wide service</span>
              </div>
            </div>
          </section>

          <section aria-labelledby="short-answer-title" className="mt-8 rounded-3xl border border-cyan-300/20 bg-cyan-400/[0.055] p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Short answer</p>
            <h2 id="short-answer-title" className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">Which option should you choose?</h2>
            <p className="mt-4 max-w-5xl leading-7 text-white/65">
              Fiverr or Upwork may suit a small, well-defined task when you are comfortable selecting and managing the freelancer. A managed development studio is another option when a website, app, or SaaS project needs connected planning, design, development, and delivery. Chronolyte works remotely with U.S. businesses nationwide and provides a free initial project plan and quote; fit depends on your scope and requirements.
            </p>
          </section>

          <section id="compare" className="mt-14 scroll-mt-28 md:mt-20" aria-labelledby="comparison-title">
            <div className="mb-7 max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Side-by-side comparison</span>
              <h2 id="comparison-title" className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">Fiverr vs Upwork vs a managed development studio</h2>
              <p className="mt-3 leading-7 text-white/55">These are different service models, not a guarantee that one provider will suit every project. Individual experience varies, and marketplace terms can change.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {comparisonOptions.map((option, index) => (
                <article key={option.name} className={`rounded-2xl border p-5 md:p-6 ${option.tone}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-300">Option {index + 1}</p>
                      <h3 className="mt-2 font-display text-2xl font-bold text-white">{option.name}</h3>
                    </div>
                    {index === 2 && <Handshake className="h-6 w-6 shrink-0 text-cyan-300" aria-hidden="true" />}
                  </div>
                  <dl className="mt-5 space-y-4">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">Model</dt>
                      <dd className="mt-1 text-sm leading-6 text-white/75">{option.model}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">Often a fit for</dt>
                      <dd className="mt-1 text-sm leading-6 text-white/65">{option.bestFor}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">Who coordinates?</dt>
                      <dd className="mt-1 text-sm leading-6 text-white/65">{option.coordination}</dd>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-white/40">Consider</dt>
                      <dd className="mt-1 text-sm leading-6 text-white/55">{option.tradeoff}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-white/40">Fiverr and Upwork are mentioned for comparison only. Chronolyte is independent and is not affiliated with or endorsed by either platform. Confirm current platform features, fees, and terms directly with each provider.</p>
          </section>

          <section className="mt-14 grid gap-5 md:mt-20 md:grid-cols-2" aria-label="Choosing between a marketplace and a managed studio">
            <article className="glass rounded-2xl p-6 md:p-8">
              <div className="flex items-center gap-3"><Users className="h-5 w-5 text-cyan-300" /><h2 className="font-display text-xl font-bold text-white">A marketplace may fit when…</h2></div>
              <ul className="mt-5 space-y-3">
                {fitSignals.map((signal) => <li key={signal} className="flex items-start gap-3 text-sm leading-6 text-white/60"><Check className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />{signal}</li>)}
              </ul>
            </article>
            <article className="rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-cyan-950/30 to-blue-950/20 p-6 md:p-8">
              <div className="flex items-center gap-3"><Workflow className="h-5 w-5 text-cyan-300" /><h2 className="font-display text-xl font-bold text-white">A managed studio may fit when…</h2></div>
              <ul className="mt-5 space-y-3">
                {studioSignals.map((signal) => <li key={signal} className="flex items-start gap-3 text-sm leading-6 text-white/65"><Check className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />{signal}</li>)}
              </ul>
            </article>
          </section>

          <section className="mt-14 md:mt-20" aria-labelledby="process-title">
            <div className="mb-7 max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">How it works</span>
              <h2 id="process-title" className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">A clear first step, before you commit</h2>
              <p className="mt-3 leading-7 text-white/55">If you want to compare a managed option, share your brief and get a proposed scope before deciding whether to proceed.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { number: '01', icon: MessageCircle, title: 'Describe the outcome', body: 'Tell us what you are building, who it is for, and any current systems or constraints.' },
                { number: '02', icon: Layers3, title: 'Review the proposed scope', body: 'Chronolyte replies with a suggested scope, timeline, and quote for you to review.' },
                { number: '03', icon: Handshake, title: 'Choose what works for you', body: 'Ask questions, compare the proposal with other options, and proceed only if it fits.' }
              ].map((step) => {
                const StepIcon = step.icon;
                return <article key={step.number} className="glass rounded-2xl p-5 md:p-6"><div className="flex items-center justify-between"><span className="font-mono text-sm text-cyan-300">{step.number}</span><StepIcon className="h-5 w-5 text-cyan-300/80" /></div><h3 className="mt-5 font-display text-lg font-bold text-white">{step.title}</h3><p className="mt-2 text-sm leading-6 text-white/55">{step.body}</p></article>;
              })}
            </div>
          </section>

          <section className="mt-14 rounded-[2rem] border border-white/10 bg-white/[0.025] p-6 md:mt-20 md:p-9" aria-labelledby="cost-title">
            <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Compare the full picture</span>
                <h2 id="cost-title" className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">Look beyond the first price you see</h2>
                <p className="mt-3 leading-7 text-white/55">A fair comparison includes more than a listing price or hourly rate. Check what is included, who will manage the work, how revisions and testing are handled, and what happens if the scope changes.</p>
              </div>
              <ul className="space-y-3">
                {['Written deliverables and exclusions', 'Communication and project-management time', 'Testing, revisions, integrations, and handoff', 'Payment schedule, platform terms, and ongoing costs'].map((item) => <li key={item} className="flex items-start gap-3 text-sm leading-6 text-white/65"><Check className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />{item}</li>)}
              </ul>
            </div>
          </section>

          <section className="mt-14 rounded-3xl border border-white/10 bg-white/[0.025] p-6 md:mt-20 md:p-8" aria-labelledby="marketplace-safety-title">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">A practical hiring checklist</span>
              <h2 id="marketplace-safety-title" className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">Reduce avoidable risk when hiring through a marketplace</h2>
              <p className="mt-3 leading-7 text-white/55">A few checks before you start can make expectations clearer, whether you hire one freelancer or build a larger team.</p>
            </div>
            <ul className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                'Write down deliverables, acceptance criteria, due dates, revision limits, and exclusions before work begins.',
                'Review relevant examples and confirm who will do the work; use the platform’s current communication, payment, and dispute processes.',
                'Agree who owns the final code, design files, content, and other assets, and document any third-party licenses.',
                'Protect accounts and customer data: use individual, least-privilege access and avoid sharing passwords or production credentials.',
                'Use clear milestones and review points that fit the scope; plan for testing, documentation, and a usable handoff.',
                'Check the platform’s current terms before changing how you communicate or pay, and keep important agreements in writing.'
              ].map((tip) => <li key={tip} className="flex items-start gap-3 text-sm leading-6 text-white/65"><Check className="mt-1 h-4 w-4 shrink-0 text-cyan-300" />{tip}</li>)}
            </ul>
          </section>

          <section className="mt-14 grid gap-4 sm:grid-cols-2 md:mt-20 lg:grid-cols-4" aria-label="Explore related Chronolyte pages">
            {[
              { to: '/services', title: 'Development services', body: 'Websites, e-commerce, apps, and SaaS.', icon: Workflow },
              { to: '/pricing', title: 'Project pricing', body: 'Review typical project ranges and request a scoped quote.', icon: BriefcaseBusiness },
              { to: '/blog/fiverr-upwork-alternative', title: 'Read the comparison guide', body: 'Explore the longer marketplace comparison and hiring advice.', icon: Layers3 },
              { to: '/locations', title: 'U.S. service areas', body: 'See how remote projects cover all 50 states.', icon: Globe2 }
            ].map((item) => {
              const CardIcon = item.icon;
              return <Link key={item.to} to={item.to} className="glass group rounded-2xl p-5 transition hover:-translate-y-1 hover:border-cyan-300/30"><CardIcon className="h-5 w-5 text-cyan-300" /><h3 className="mt-4 font-display font-bold text-white group-hover:text-cyan-200">{item.title}</h3><p className="mt-2 text-sm leading-6 text-white/50">{item.body}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-cyan-300">Explore <ArrowRight className="h-3.5 w-3.5" /></span></Link>;
            })}
          </section>

          <section className="mt-14 md:mt-20" aria-labelledby="faq-title">
            <div className="max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Frequently asked questions</span>
              <h2 id="faq-title" className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">Fiverr, Upwork, and web development alternatives</h2>
            </div>
            <div className="mt-6 grid gap-3">
              {faqs.map((faq) => (
                <article key={faq.question} className="glass rounded-2xl p-5 md:p-6">
                  <h3 className="font-display text-lg font-semibold leading-7 text-white">{faq.question}</h3>
                  <p className="mt-3 max-w-4xl text-sm leading-7 text-white/60">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-[2rem] border border-cyan-300/15 bg-gradient-to-r from-cyan-950/40 via-[#0b1420] to-blue-950/30 p-6 md:mt-20 md:p-10">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-3xl">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Want to compare a managed option?</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">Get a project scope and quote—then decide.</h2>
                <p className="mt-3 text-sm leading-6 text-white/55">Share your goals and constraints. The initial project plan is free and carries no obligation.</p>
              </div>
              <a href="#start" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 font-semibold text-black transition hover:shadow-lg hover:shadow-cyan-500/25">Start a project brief <ArrowRight className="h-4 w-4" /></a>
            </div>
          </section>

          <section id="start" className="scroll-mt-28 pt-14 md:pt-20" aria-labelledby="start-title">
            <div className="mx-auto max-w-3xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">No pressure, just a clearer next step</span>
              <h2 id="start-title" className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">Tell us what you want to build</h2>
              <p className="mt-3 leading-7 text-white/55">Get a proposed scope, timeline, and quote from a remote team. You can also call <a href={CONTACT_PHONE_TEL} className="whitespace-nowrap font-semibold text-cyan-200 hover:text-white">{CONTACT_PHONE_DISPLAY}</a>.</p>
            </div>
            <div className="mt-6"><LeadCaptureForm source="fiverr-upwork-alternative" /></div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
