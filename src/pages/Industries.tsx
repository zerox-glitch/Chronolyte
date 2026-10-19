import { ArrowRight, Building2, CheckCircle2, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import businessTypes from '../data/businessTypes.json';

export function Industries() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-dark-900 text-white">
      <SiteNavigation />
      <main className="px-4 pb-16 pt-28 md:px-6 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#101c2b] via-[#0a101b] to-[#090b13] px-6 py-10 md:px-12 md:py-16">
            <div className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]" />
            <div className="relative max-w-4xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                <Building2 className="h-4 w-4" /> Industry-aware digital work
              </span>
              <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
                Websites and software shaped around <span className="gradient-text">your business.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/60 md:text-lg">
                A contractor, clinic, online store, nonprofit, or software startup each has different customers and workflows. We scope the website, app, store, or automation around what your organization actually needs—not a one-size-fits-all industry template.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-black transition hover:shadow-lg hover:shadow-cyan-500/25">
                  Get a free project plan <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/locations" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-cyan-300/40 hover:text-white">
                  Nationwide service areas <Globe2 className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-14 md:mt-20" aria-labelledby="industry-list-title">
            <div className="mb-7 max-w-3xl">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Business types</span>
              <h2 id="industry-list-title" className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">Who we build for</h2>
              <p className="mt-3 leading-7 text-white/55">These are common examples, not a closed list. If your business model is specialized or spans multiple sectors, we can scope around that too.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {businessTypes.map((industry, index) => (
                <article id={`industry-${industry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} key={industry.name} className="glass scroll-mt-24 rounded-2xl p-5 md:p-6">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-300/15 bg-cyan-400/10 text-sm font-semibold text-cyan-200">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-display text-lg font-bold text-white">{industry.name}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/45">{industry.examples}</p>
                    </div>
                  </div>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <p className="flex items-start gap-2 text-sm leading-6 text-white/65">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-cyan-300/80" />
                      <span>{industry.digitalNeeds}</span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-14 grid gap-5 md:mt-20 md:grid-cols-3" aria-label="Ways we help businesses">
            {[
              ['Websites and e-commerce', 'Responsive marketing sites, catalogs, online stores, booking journeys, and customer portals.'],
              ['Apps and SaaS products', 'Product discovery, UX, MVP planning, application development, integrations, and ongoing improvements.'],
              ['Automation and integrations', 'Workflow automation, CRM connections, AI-assisted tools, and systems that reduce repetitive work.']
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                <h3 className="font-display text-lg font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{description}</p>
              </article>
            ))}
          </section>

          <section className="mt-14 rounded-[2rem] border border-cyan-300/15 bg-gradient-to-r from-cyan-950/40 via-[#0b1420] to-blue-950/30 p-6 text-center md:mt-20 md:p-10">
            <h2 className="font-display text-2xl font-bold text-white md:text-3xl">Have a different kind of business?</h2>
            <p className="mx-auto mt-3 max-w-2xl leading-7 text-white/55">Tell us about your customers, goals, and existing tools. We’ll recommend a practical scope before you commit.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/contact" className="inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-black">Start with a free plan</Link>
              <a href={CONTACT_PHONE_TEL} className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-6 py-3 font-semibold text-white transition hover:border-cyan-300/40">Call {CONTACT_PHONE_DISPLAY}</a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
