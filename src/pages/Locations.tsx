import { ArrowRight, Globe2, MapPin, PhoneCall } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import usServiceAreas from '../data/usServiceAreas.json';

export function Locations() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-dark-900 text-white">
      <SiteNavigation />
      <main className="px-4 pb-16 pt-28 md:px-6 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#101c2b] via-[#0a101b] to-[#090b13] px-6 py-10 md:px-12 md:py-16">
            <div className="pointer-events-none absolute -right-12 -top-16 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]" />
            <div className="relative max-w-4xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                <Globe2 className="h-4 w-4" /> Remote nationwide service
              </span>
              <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl md:text-6xl">
                Web design and development across the <span className="gradient-text">United States.</span>
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-white/60 md:text-lg">
                Chronolyte works remotely with businesses in all 50 states. We plan, design, build, and support projects online, so you can work with our team from a major metro, a smaller city, or a surrounding community. The cities below are examples—not a limit on where we work—and do not imply a local office in each place.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/contact" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3 font-semibold text-black transition hover:shadow-lg hover:shadow-cyan-500/25">
                  Discuss your project <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={CONTACT_PHONE_TEL} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 font-semibold text-white/80 transition hover:border-cyan-300/40 hover:text-white">
                  <PhoneCall className="h-4 w-4" /> {CONTACT_PHONE_DISPLAY}
                </a>
              </div>
            </div>
          </section>

          <section className="mt-12 md:mt-16" aria-labelledby="states-title">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">Where we work</span>
                <h2 id="states-title" className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">All 50 states, one remote team</h2>
              </div>
              <Link to="/industries" className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-200 transition hover:text-white">Explore business types <ArrowRight className="h-4 w-4" /></Link>
            </div>

            <nav aria-label="Jump to a state" className="mb-7 flex flex-wrap gap-2">
              {usServiceAreas.map((state) => (
                <a key={state.abbr} href={`#state-${state.abbr.toLowerCase()}`} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/65 transition hover:border-cyan-300/35 hover:text-cyan-100">
                  {state.abbr}
                </a>
              ))}
            </nav>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {usServiceAreas.map((state) => (
                <article id={`state-${state.abbr.toLowerCase()}`} key={state.abbr} className="glass scroll-mt-24 rounded-2xl p-4 md:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-display text-lg font-bold text-white">{state.name}</h3>
                    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs font-semibold text-white/45">{state.abbr}</span>
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/35"><MapPin className="h-3.5 w-3.5 text-cyan-300/70" /> Example cities</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {state.cities.map((city) => (
                      <li key={city} className="rounded-lg border border-white/5 bg-white/[0.035] px-2.5 py-1.5 text-xs text-white/60">{city}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
            <p className="mt-5 text-sm leading-6 text-white/45">City names are representative examples. Remote availability extends to other towns and communities in these states as well.</p>
          </section>

          <section className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3" aria-label="Remote project delivery">
            {[
              ['Plan across time zones', 'We use a clear brief, written scope, scheduled calls, and shared project updates to keep remote work moving.'],
              ['Build for your customers', 'The project starts with your audience, service area, buying process, and the tools your team already uses.'],
              ['Launch and keep improving', 'You receive a handoff plan and can discuss support, updates, and next steps after launch.']
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
                <h3 className="font-display text-lg font-bold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{description}</p>
              </article>
            ))}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
