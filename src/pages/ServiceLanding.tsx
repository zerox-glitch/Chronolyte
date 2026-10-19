import React from 'react';
import { Link } from 'react-router-dom';

const offerings = {
  'website-design': {
    title: 'Custom Website Design for Small Businesses',
    intro: 'Chronolyte designs and develops business websites, landing pages, and online experiences built around your goals, brand, and customers.',
    suitable: 'Small businesses, consultants, service providers, startups, and founders who want an original, maintainable website.',
    deliverables: ['Responsive layouts for phones, tablets and desktops', 'Clear calls to action and lead-generation forms', 'Accessible navigation and readable page structure', 'Search-friendly metadata and performance-focused implementation', 'Deployment support and a handover plan'],
    questions: [['Can you build a site without a template?', 'Chronolyte offers custom website development. Discuss your preferred design and framework when requesting a quote.'], ['Can you add contact or booking forms?', 'Lead capture, inquiries, and integrations can be scoped to your workflow.']]
  },
  'affordable-web-design': {
    title: 'Affordable Web Design for Small Businesses',
    intro: 'Get a website scoped to what your business actually needs. Chronolyte can help prioritize the essentials before expanding into advanced features.',
    suitable: 'Owners who need a professional online presence and want a clear estimate before development begins.',
    deliverables: ['Discovery and scope planning', 'Mobile-responsive website design', 'Easy-to-find contact and conversion paths', 'SEO foundations and clear site structure', 'Launch guidance and optional future improvements'],
    questions: [['How much does a small business website cost?', 'Pricing depends on page count, integrations, content, design and maintenance. See the current pricing page and request a project-specific quote.'], ['Can I start small?', 'Yes, you can request an initial scope focused on your highest-priority pages.']]
  },
  'website-redesign': {
    title: 'Website Redesign and Modernization',
    intro: 'Refresh an outdated website without losing the content and functionality that already works for your visitors.',
    suitable: 'Businesses with slow, difficult-to-use, dated or underperforming websites.',
    deliverables: ['Existing site review and redesign scope', 'Mobile usability and accessibility improvements', 'Clearer pages and stronger calls to action', 'SEO-safe migration planning and redirect mapping when needed', 'Testing and launch support'],
    questions: [['Will I lose my Google rankings?', 'No redesign can guarantee rankings. We can plan redirect mapping, preserve useful URLs and monitor indexing to reduce migration risk.'], ['Do you have to rebuild everything?', 'Not always. The scope depends on your current site and technology.']]
  },
  'ai-automation': {
    title: 'AI Automation for Business Workflows',
    intro: 'Explore workflow automation, AI chatbots, lead routing and custom integrations that reduce manual work in your business.',
    suitable: 'Teams that repeatedly copy information between tools, answer common questions, or process customer inquiries.',
    deliverables: ['Process discovery and integration planning', 'Custom workflow or chatbot implementation', 'Human review and escalation points', 'Security and privacy requirements assessment', 'Testing and maintenance options'],
    questions: [['Can automation work with my current tools?', 'Compatibility depends on the APIs and access provided by those tools.'], ['Will the AI make decisions alone?', 'We can scope human approval for sensitive or high-impact steps.']]
  },
  'custom-software': {
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
  return <div className="min-h-screen bg-[#050508] text-white">
    <header className="mx-auto max-w-6xl px-6 py-6 flex flex-wrap gap-6 items-center justify-between border-b border-white/10">
      <Link to="/" className="text-xl font-bold tracking-wider text-cyan-300">CHRONOLYTE</Link>
      <nav aria-label="Main navigation" className="flex flex-wrap gap-5 text-sm text-white/80">
        <Link to="/services">Services</Link><Link to="/pricing">Pricing</Link><Link to="/portfolio">Portfolio</Link><Link to="/about">About</Link><Link to="/contact">Contact</Link>
      </nav>
    </header>
    <main className="mx-auto max-w-5xl px-6 py-16 space-y-12">
      <section className="space-y-6 max-w-3xl">
        <p className="uppercase tracking-widest text-cyan-300 text-sm">Chronolyte Development Services</p>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">{entry.title}</h1>
        <p className="text-lg text-white/75 leading-relaxed">{entry.intro}</p>
        <div className="flex flex-wrap gap-4">
          <Link className="rounded-full bg-cyan-400 px-6 py-3 font-semibold text-black" to="/contact">Request a project quote</Link>
          <Link className="rounded-full border border-white/30 px-6 py-3" to="/pricing">Explore pricing</Link>
        </div>
      </section>
      <section className="space-y-3"><h2 className="text-2xl font-semibold">Who this service is for</h2><p className="text-white/70">{entry.suitable}</p></section>
      <section className="space-y-5"><h2 className="text-2xl font-semibold">What your project can include</h2><ul className="grid md:grid-cols-2 gap-4">{entry.deliverables.map(v=><li key={v} className="rounded-xl bg-white/5 border border-white/10 p-5 text-white/80">{v}</li>)}</ul></section>
      <section className="space-y-5"><h2 className="text-2xl font-semibold">Common questions</h2>{entry.questions.map(([q,a])=><div key={q} className="border-b border-white/10 pb-5"><h3 className="font-semibold text-lg">{q}</h3><p className="text-white/70 mt-2">{a}</p></div>)}</section>
      <section className="rounded-2xl border border-cyan-400/25 p-8 space-y-4"><h2 className="text-2xl font-semibold">Tell us what you want to build</h2><p className="text-white/70">Share your requirements and receive a proposal based on your project's actual scope.</p><Link to="/contact" className="inline-block rounded-full bg-cyan-400 px-6 py-3 text-black font-semibold">Discuss your project</Link></section>
    </main>
    <footer className="max-w-5xl mx-auto px-6 py-10 text-sm text-white/60 border-t border-white/10"><Link to="/">Chronolyte</Link> · <Link to="/privacy">Privacy</Link> · <Link to="/terms">Terms</Link></footer>
  </div>;
}
