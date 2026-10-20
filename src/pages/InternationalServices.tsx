import React from 'react';
import { Link } from 'react-router-dom';
import { SiteNavigation } from '../components/SiteNavigation';
import { Footer } from '../components/Footer';

const countries = [
  { name: 'United States', note: 'Remote website development across all 50 states', examples: 'Service businesses, startups, consultants and growing teams' },
  { name: 'United Kingdom', note: 'Remote web design and software projects throughout the UK', examples: 'Small businesses, independent professionals, online shops and founders' },
  { name: 'Pakistan', note: 'Remote website development for Pakistani businesses and founders', examples: 'Local service businesses, startups, exporters and online ventures' },
  { name: 'Canada', note: 'Remote web design for Canadian businesses', examples: 'Small businesses, professional services and startup websites' },
  { name: 'Australia', note: 'Remote website development for Australian businesses', examples: 'Service companies, founders and digital products' },
  { name: 'New Zealand', note: 'Remote design and web application work', examples: 'Independent businesses and product teams' },
  { name: 'Ireland', note: 'Remote website and software services', examples: 'Small businesses, consultants and startups' }
];
export function InternationalServices() {
  return <div className="min-h-screen bg-[#050508] text-white">
    <SiteNavigation />
    <main className="mx-auto max-w-6xl px-5 pt-32 pb-20">
      <p className="text-cyan-300 text-sm uppercase tracking-[0.2em] mb-4">Worldwide remote delivery</p>
      <h1 className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight">Website Design & Software Development for Businesses Worldwide</h1>
      <p className="text-white/70 text-lg max-w-3xl mt-6 leading-relaxed">Chronolyte works remotely with businesses in the USA, UK, Pakistan, Canada, Australia, New Zealand, Ireland and other countries. We build responsive websites, online stores, focused software MVPs and practical AI workflows. You can plan your project and collaborate with us online regardless of location.</p>
      <div className="flex flex-wrap gap-4 mt-8">
        <Link to="/contact" className="bg-cyan-400 text-black rounded-full px-7 py-3 font-semibold">Request a project quote</Link>
        <Link to="/pricing" className="border border-white/30 rounded-full px-7 py-3">Explore starting prices</Link>
      </div>
      <section className="mt-20">
        <h2 className="text-3xl font-bold mb-3">Countries we welcome projects from</h2>
        <p className="text-white/60 mb-8">These are remote service areas, not claims of physical offices or locally incorporated entities.</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.map(country => <article key={country.name} className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <h3 className="text-xl font-semibold mb-3">{country.name}</h3>
            <p className="text-white/80 mb-3">{country.note}</p>
            <p className="text-white/55 text-sm">{country.examples}</p>
          </article>)}
        </div>
      </section>
      <section className="mt-20 grid md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-3xl font-bold mb-5">What you can hire Chronolyte to build</h2>
          <ul className="text-white/75 space-y-3 list-disc pl-5">
            <li><Link to="/website-design" className="text-cyan-300">Business websites</Link>, landing pages and redesigns</li>
            <li>Starter e-commerce storefronts and catalogues</li>
            <li><Link to="/custom-software" className="text-cyan-300">Custom software</Link>, dashboards and SaaS prototypes</li>
            <li><Link to="/ai-automation" className="text-cyan-300">AI-assisted workflow automation</Link> and integrations</li>
          </ul>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-5">How cross-border projects work</h2>
          <ol className="text-white/75 space-y-3 list-decimal pl-5">
            <li>Share your goals, country, audience and required features</li>
            <li>Receive a written scope, quote, milestones and delivery estimate</li>
            <li>Collaborate remotely using an agreed communication schedule</li>
            <li>Review the build, approve launch and receive agreed handover materials</li>
          </ol>
        </div>
      </section>
      <section className="mt-20">
        <h2 className="text-3xl font-bold mb-6">Frequently asked questions</h2>
        <div className="space-y-6 max-w-4xl">
          <div><h3 className="text-xl font-semibold">Do you work with businesses outside the United States?</h3><p className="text-white/70 mt-2">Yes. Chronolyte welcomes remote inquiries from the UK, Pakistan, Canada, Australia, New Zealand, Ireland and elsewhere, subject to project fit and the ability to provide services.</p></div>
          <div><h3 className="text-xl font-semibold">Are your website prices the same worldwide?</h3><p className="text-white/70 mt-2">Published prices are in US dollars and are starting quotes, not guaranteed local-currency totals. Final cost, currency, payment method and applicable fees should be agreed before work starts.</p></div>
          <div><h3 className="text-xl font-semibold">Can you deliver a business website within a week?</h3><p className="text-white/70 mt-2">Eligible, clearly scoped starter websites may target three to seven days after assets and approvals are ready. Complex stores, custom software and third-party approvals require separate timelines.</p></div>
          <div><h3 className="text-xl font-semibold">Do you have an office in each country?</h3><p className="text-white/70 mt-2">No. Country coverage describes remote service availability, not local office locations or guaranteed local business registration.</p></div>
        </div>
      </section>
      <div className="mt-16 p-8 rounded-2xl border border-cyan-400/20 bg-cyan-400/5"><h2 className="text-2xl font-bold mb-3">Ready to discuss your project?</h2><p className="text-white/70 mb-6">Tell us where your customers are and what you need built. We will discuss a scope and realistic timeline.</p><Link to="/contact" className="inline-block rounded-full bg-cyan-400 text-black font-semibold px-6 py-3">Contact Chronolyte</Link></div>
    </main><Footer />
  </div>;
}
