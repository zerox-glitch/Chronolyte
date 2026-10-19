import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CallNowButton } from '../components/CallNowButton';
import { ProjectIntakeForm } from '../components/ProjectIntakeForm';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';
import { CheckCircle2, ChevronDown, ChevronUp, Clock, Loader2, Shield, CreditCard, HeartHandshake } from 'lucide-react';

// Animated Section Wrapper
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Pricing Card Component - Dark Theme
interface PricingCardProps {
  tier: {
    name: string;
    price?: number;
    price_display?: string;
    period?: string;
    badge?: string;
    is_popular?: boolean;
    description: string;
    features: string | string[];
    timeline: string;
    cta?: string;
    category?: string;
  };
  isPopular?: boolean;
  onStartProject: (pkg: { name: string; price: number; category: string }) => void;
}

function PricingCard({ tier, isPopular = false, onStartProject }: PricingCardProps) {
  const features = Array.isArray(tier.features) ? tier.features : typeof tier.features === 'string' ? (() => { try { return JSON.parse(tier.features); } catch { return []; } })() : [];
  const isMostPopular = isPopular || tier.name === 'Business Website';
  const priceDisplay = tier.price_display || `$${tier.price?.toLocaleString()}`;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      whileHover={{ y: -5 }}
      className={`relative flex flex-col h-full rounded-2xl transition-all duration-300 ${
        isMostPopular
          ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-2 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
          : 'glass border border-white/10 hover:border-cyan-400/30'
      }`}
    >
      {/* Badge */}
      {isMostPopular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          Most Popular
        </div>
      )}

      <div className="p-8 flex-1 flex flex-col">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            {tier.name}
          </h3>
          <p className="text-sm mb-4 text-white/60">
            {tier.description}
          </p>
          
          {/* Price */}
          <div className="mb-2">
            <div className="flex items-baseline gap-1">
              <span className={`text-4xl font-bold ${isMostPopular ? 'gradient-text' : 'text-cyan-400'}`}>
                {priceDisplay}
              </span>
              {tier.period && (
                <span className="text-white/50">
                  {tier.period}
                </span>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="flex items-center gap-2 text-sm text-white/50">
            <Clock size={16} />
            <span>{tier.timeline}</span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-8 flex-1">
          {features.slice(0, 7).map((feature: string, idx: number) => (
            <div key={idx} className="flex items-start gap-3">
              <CheckCircle2 size={18} className={isMostPopular ? 'text-cyan-400 flex-shrink-0' : 'text-emerald-400 flex-shrink-0'} />
              <span className="text-sm leading-relaxed text-white/70">
                {feature}
              </span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onStartProject({
            name: tier.name,
            price: tier.price || 0,
            category: tier.category || 'Custom'
          })}
          className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-all duration-300 ${
            isMostPopular
              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black hover:shadow-lg hover:shadow-cyan-500/30'
              : 'border border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10'
          }`}
        >
          Get My Exact Quote
        </motion.button>
      </div>
    </motion.div>
  );
}

// FAQ Item Component - Dark Theme
interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}

function FAQItem({ question, answer, isOpen, onToggle }: FAQItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="glass rounded-xl overflow-hidden border border-white/10 hover:border-cyan-400/30 transition-colors"
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-5 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <h4 className="text-lg font-semibold text-white text-left">{question}</h4>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-cyan-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-white/50 flex-shrink-0" />
        )}
      </button>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-hidden border-t border-white/10"
      >
        <p className="px-6 py-5 text-white/70 leading-relaxed">{answer}</p>
      </motion.div>
    </motion.div>
  );
}

const launchPackages: Record<string, { price: number; price_display: string; timeline: string; description: string; features: string[] }> = {
  'Landing Page': {
    price: 199, price_display: 'From $199', timeline: 'As fast as 48 hours*',
    description: 'Best for promoting one service, collecting leads or launching a campaign.',
    features: ['1 professionally designed responsive page', 'Clear call-to-action and contact form', 'Basic search metadata and mobile checks', 'Domain publishing assistance', 'One consolidated revision round']
  },
  'Business Website': {
    price: 499, price_display: 'From $499', timeline: 'Target: 3–7 days*',
    description: 'A complete starter website for a small business — not just a landing page.',
    features: ['Up to 5 essential pages (Home, About, Services, Contact + one more)', 'Responsive design for desktop and mobile', 'Lead/contact form and direct inquiry links', 'On-page SEO basics and performance checks', 'Social links, maps or simple embeds', 'Domain connection and deployment', 'One consolidated revision round']
  },
  'E-commerce Store': {
    price: 999, price_display: 'From $999', timeline: 'Schedule after scoping',
    description: 'A starter online store for a limited catalogue; advanced integrations quoted separately.',
    features: ['Storefront and core product pages', 'Initial product and category setup within agreed limits', 'Standard checkout configuration', 'Mobile-friendly shopping experience', 'Basic search metadata and launch testing']
  },
  'Mobile App': {
    price: 1499, price_display: 'From $1,499', timeline: 'Schedule after scoping',
    description: 'An early app prototype or narrowly scoped MVP — not an unlimited full-featured app.',
    features: ['Feature and screen scope review', 'Basic navigation and UI', 'A focused primary user journey', 'Demo or test build as agreed', 'Handover and next-phase recommendations']
  },
  'SaaS MVP': {
    price: 1999, price_display: 'From $1,999', timeline: 'Schedule after scoping',
    description: 'Validate one core SaaS workflow with a small first release.',
    features: ['MVP feature planning', 'Core user workflow and responsive UI', 'Basic backend and data model as scoped', 'Test and deployment guidance', 'Future roadmap and handover']
  },
  'Hire a Developer': {
    price: 15, price_display: 'From $15/hour', timeline: 'By arrangement',
    description: 'Pay for focused development tasks and technical support.',
    features: ['Defined deliverables and hourly reporting', 'Front-end or backend tasks as agreed', 'Bug fixes and updates within the scope', 'Clear handover of completed work', 'Optional longer-term collaboration']
  }
};

const defaultPackages: Record<string, any[]> = {
  websites: ['Landing Page','Business Website','E-commerce Store'].map(name => ({ name, ...launchPackages[name], period: 'one-time', category: 'websites', is_popular: name === 'Business Website' })),
  aitools: [{ name: 'Mobile App', ...launchPackages['Mobile App'], period: 'one-time', category: 'ai-tools' }],
  saas: [{ name: 'SaaS MVP', ...launchPackages['SaaS MVP'], period: 'one-time', category: 'saas' }],
  automation: [{ name: 'Hire a Developer', ...launchPackages['Hire a Developer'], period: 'per hour', category: 'automation' }]
};

export function Pricing() {
  const [openFAQs, setOpenFAQs] = useState<Record<number, boolean>>({});
  const [pricingData, setPricingData] = useState<Record<string, any[]>>(defaultPackages);
  const [loading, setLoading] = useState(false);
  const [intakeFormOpen, setIntakeFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; price: number; category: string } | undefined>(undefined);

  const handleStartProject = (pkg: { name: string; price: number; category: string }) => {
    setSelectedPackage(pkg);
    setIntakeFormOpen(true);
  };

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const res = await fetch('/backend/api/pricing.php?action=list');
        const json = await res.json();
        
        if (json.success) {
          const grouped: Record<string, any[]> = {
            websites: [],
            aitools: [],
            saas: [],
            automation: []
          };
          
          json.data.forEach((plan: any) => {
            const launch = launchPackages[plan.name];
             const displayedPlan = launch ? { ...plan, ...launch } : plan;
             if (plan.category === 'websites') grouped.websites.push(displayedPlan);
            else if (plan.category === 'ai-tools') grouped.aitools.push(displayedPlan);
            else if (plan.category === 'saas') grouped.saas.push(displayedPlan);
            else if (plan.category === 'automation') grouped.automation.push(displayedPlan);
          });
          
          // Keep the new transparent launch packages authoritative; old seeded DB
          // offers may contain outdated prices and features.
          setPricingData({ ...defaultPackages, ...Object.fromEntries(Object.entries(grouped).map(([category, plans]) => [category, plans.length ? plans.filter(plan => !launchPackages[plan.name]) : []])) ,
            websites: [...defaultPackages.websites, ...grouped.websites.filter(plan => !launchPackages[plan.name])],
            aitools: [...defaultPackages.aitools, ...grouped.aitools.filter(plan => !launchPackages[plan.name])],
            saas: [...defaultPackages.saas, ...grouped.saas.filter(plan => !launchPackages[plan.name])],
            automation: [...defaultPackages.automation, ...grouped.automation.filter(plan => !launchPackages[plan.name])]
          });
        }
      } catch (error) {
        console.error('Failed to load pricing:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadPricing();
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenFAQs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqs = [
    { question: 'Is $499 really enough for a complete website?', answer: 'Yes, for a clearly scoped small-business brochure website of up to five pages using supplied content and standard functionality. Extra pages and advanced integrations receive a separate written quote.' },
    { question: 'Will I own my website?', answer: 'Ownership, access to domain, hosting and deliverables should be specified in your project agreement. Ask us to include the source-code and account-handover details in your quote.' },
    { question: 'Will Google rank my website automatically?', answer: 'No agency can guarantee rankings. Our starter website includes foundational on-page SEO; ongoing content, competition, backlinks and indexing also affect search visibility.' },
    { question: 'What do you need from me to launch quickly?', answer: 'Your logo, text, service details, images, contact details, domain/hosting access and one person available to provide feedback. Deadlines begin once the agreed materials and approvals are ready.' },
    {
      question: "How long does it take to complete my project?",
      answer: "Timeline varies by project complexity. Simple, pre-scoped landing pages may be delivered in 48 hours and eligible brochure websites within 7 days once materials and approvals are complete. Complex stores, AI tools, apps, and SaaS require an individual timeline. We provide a detailed timeline during the discovery phase."
    },
    {
      question: "Do you offer revisions after launch?",
      answer: "Yes! All projects include 14 days of free post-launch support. We also offer monthly maintenance plans starting at $200-500/month."
    },
    {
      question: "What tech stack do you use?",
      answer: "We use modern technologies: React, TypeScript, Vite, Tailwind CSS for frontends. Node.js, PostgreSQL, and cloud infrastructure (AWS/Vercel) for backends. All projects follow best practices for performance and security."
    },
    {
      question: "Can I upgrade my plan later?",
      answer: "Absolutely! We design all projects with scalability in mind. You can start with a Starter plan and upgrade as your business grows."
    },
    {
      question: "What's your payment structure?",
      answer: "We use a simple 50/50 model: 50% upfront to start, 50% upon completion. For larger projects ($15k+), we can discuss milestone-based payments."
    },
    {
      question: "Do you provide ongoing support?",
      answer: "All projects include 14 days free support. We offer monthly maintenance plans for bug fixes, security updates, and feature additions."
    }
  ];

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <SiteNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">Transparent Pricing</span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Simple, <span className="gradient-text">Honest</span> Pricing
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto mb-8">
              A full starter business website from $499, with up to 5 pages, mobile-ready design, a contact form and essential SEO. Simple landing pages start at $199. See exactly what is included before requesting a quote.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <CallNowButton className="text-center" />
              <Link
                to="/contact"
                className="px-8 py-3 rounded-full border border-cyan-400/50 text-cyan-400 font-semibold hover:bg-cyan-400/10 transition-colors"
              >
                Get Custom Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Clear package guide and trust signals */}
      <section className="px-4 md:px-6 pb-16" aria-label="Pricing explained">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 rounded-3xl bg-gradient-to-br from-cyan-500/15 to-blue-700/10 border border-cyan-400/30 p-7 md:p-10">
            <p className="text-cyan-300 text-sm font-semibold uppercase tracking-widest mb-3">Best choice for most small businesses</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Your full business website starts at $499</h2>
            <p className="text-white/75 mb-6 max-w-2xl">A real website with up to five essential pages — designed to explain what you do, build confidence and help visitors contact you. No need to pay thousands for a straightforward brochure website.</p>
            <div className="grid sm:grid-cols-2 gap-3 text-sm mb-7">
              {['Up to five agreed pages', 'Mobile-friendly design', 'Contact or quote-request form', 'Basic on-page SEO', 'Domain and launch assistance', 'One consolidated revision round'].map(item => (
                <div key={item} className="flex gap-2 items-start text-white/85"><CheckCircle2 className="w-5 h-5 text-cyan-300 shrink-0" />{item}</div>
              ))}
            </div>
            <button onClick={() => handleStartProject({ name: 'Business Website', price: 499, category: 'Website' })} className="px-7 py-3 rounded-xl bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition-colors">Get my $499 website quote</button>
            <p className="mt-4 text-xs text-white/50">Starting price, not an automatic checkout total. Additional pages, custom systems and extra revision rounds are quoted before work begins.</p>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 md:p-8 space-y-5">
            <h2 className="text-2xl font-bold">How our pricing works</h2>
            <div><p className="font-semibold text-white">01 · Pick your starting package</p><p className="text-white/60 text-sm mt-1">Compare the inclusions, then tell us about your business.</p></div>
            <div><p className="font-semibold text-white">02 · Agree on the scope</p><p className="text-white/60 text-sm mt-1">We clarify pages, design, content, integrations, timeline and exact cost.</p></div>
            <div><p className="font-semibold text-white">03 · Review and launch</p><p className="text-white/60 text-sm mt-1">You receive a review opportunity before publishing and a documented handover.</p></div>
            <p className="pt-3 border-t border-white/10 text-sm text-white/60">Need a custom portal, store, booking platform or SaaS? We quote those separately instead of hiding them inside a cheap starter package.</p>
          </div>
        </div>
      </section>
      <section className="px-4 md:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">What is included — and what costs extra?</h2>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-7">
              <h3 className="text-xl font-bold text-emerald-300 mb-4">Included in a $499 starter website</h3>
              <ul className="space-y-3 text-white/75 text-sm list-disc pl-5"><li>Up to five pages using your supplied content and assets</li><li>Responsive website styling and contact functionality</li><li>Page titles, meta descriptions and sensible headings</li><li>Basic mobile and browser checks before launch</li><li>Deployment guidance and one agreed round of revisions</li></ul>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-7">
              <h3 className="text-xl font-bold text-cyan-300 mb-4">Quoted separately when required</h3>
              <ul className="space-y-3 text-white/75 text-sm list-disc pl-5"><li>Domain purchases, hosting subscriptions and third-party fees</li><li>Professional copywriting, photography and brand identity</li><li>Booking engines, advanced CMS, accounts and custom databases</li><li>Complex stores, payment or CRM integrations</li><li>Additional pages, major redesigns and ongoing maintenance</li></ul>
            </div>
          </div>
          <p className="text-sm text-center mt-6 text-white/55">*48-hour delivery is a possible target for eligible one-page projects; eligible small business sites target 3–7 days after scope approval, complete materials and timely feedback. Third-party approvals and complex development are not included in those targets.</p>
        </div>
      </section>

      {/* Payment Terms */}
      <section className="py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection delay={0.1}>
              <div className="glass rounded-2xl p-8 border border-white/10 text-center">
                <div className="text-4xl font-bold gradient-text mb-4">50/50</div>
                <h3 className="text-xl font-semibold text-white mb-3">Payment Split</h3>
                <p className="text-white/60 leading-relaxed">
                  50% upfront to start, 50% upon completion. Simple and fair.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="glass rounded-2xl p-8 border border-white/10 text-center">
                <div className="text-4xl font-bold gradient-text mb-4">14</div>
                <h3 className="text-xl font-semibold text-white mb-3">Days Free Support</h3>
                <p className="text-white/60 leading-relaxed">
                  Every project includes post-launch support at no extra cost.
                </p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.3}>
              <div className="glass rounded-2xl p-8 border border-white/10 text-center">
                <div className="text-4xl font-bold gradient-text mb-4">∞</div>
                <h3 className="text-xl font-semibold text-white mb-3">Revisions Included</h3>
                <p className="text-white/60 leading-relaxed">
                  We work with you until you're completely satisfied.
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Website Development */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">Websites</span>
              <h2 className="text-4xl font-bold text-white mb-4">Website Development</h2>
              <p className="text-xl text-white/60">
                Stunning, high-performance websites that convert
              </p>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {pricingData.websites?.map((tier, index) => (
                <div key={index} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[280px] max-w-[350px]">
                  <PricingCard tier={{...tier, category: 'Website'}} isPopular={tier.is_popular} onStartProject={handleStartProject} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Tools */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">AI Solutions</span>
              <h2 className="text-4xl font-bold text-white mb-4">Mobile App Development</h2>
              <p className="text-xl text-white/60">
                Intelligent solutions powered by cutting-edge AI
              </p>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {pricingData.aitools?.map((tier, index) => (
                <div key={index} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] min-w-[280px] max-w-[380px]">
                  <PricingCard tier={{...tier, category: 'AI Tool'}} isPopular={tier.is_popular} onStartProject={handleStartProject} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* SaaS Development */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">SaaS</span>
              <h2 className="text-4xl font-bold text-white mb-4">SaaS Development</h2>
              <p className="text-xl text-white/60">
                Full-stack products built for growth and scale
              </p>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {pricingData.saas?.map((tier, index) => (
                <div key={index} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] min-w-[280px] max-w-[380px]">
                  <PricingCard tier={{...tier, category: 'SaaS'}} isPopular={tier.is_popular} onStartProject={handleStartProject} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Automation */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">Automation</span>
              <h2 className="text-4xl font-bold text-white mb-4">Hire Developers</h2>
              <p className="text-xl text-white/60">
                Intelligent workflow automation for your business
              </p>
            </div>
          </AnimatedSection>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {pricingData.automation?.map((tier, index) => (
                <div key={index} className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] min-w-[280px] max-w-[380px]">
                  <PricingCard tier={{...tier, category: 'Automation'}} isPopular={tier.is_popular} onStartProject={handleStartProject} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">FAQ</span>
              <h2 className="text-4xl font-bold text-white mb-4">Common Questions</h2>
              <p className="text-xl text-white/60">
                Everything about our pricing and process
              </p>
            </div>
          </AnimatedSection>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQs[index] || false}
                onToggle={() => toggleFAQ(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="glass rounded-3xl p-12 border border-cyan-400/20">
              <h2 className="text-4xl font-bold text-white mb-6">Ready to Get Started?</h2>
              <p className="text-xl text-white/60 mb-8 leading-relaxed">
                Submit your project request and we'll get back to you within 24 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => handleStartProject({ name: 'Custom Project', price: 0, category: 'Custom' })}
                  className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
                >
                  Start Your Project
                </button>
                <Link
                  to="/contact"
                  className="px-8 py-3 rounded-full border border-white/20 text-white font-semibold hover:bg-white/5 transition-colors"
                >
                  Get Custom Quote
                </Link>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Policy Sections for Paddle Compliance */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection>
            <div className="text-center mb-16">
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">Our Policies</span>
              <h2 className="text-4xl font-bold text-white mb-4">Transparent Terms</h2>
              <p className="text-xl text-white/60">
                Clear, fair policies to protect both parties
              </p>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Payment Terms */}
            <AnimatedSection delay={0.1}>
              <div className="glass rounded-2xl p-8 border border-white/10 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 flex items-center justify-center mb-6">
                  <CreditCard className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Payment Terms</h3>
                <ul className="space-y-3 text-white/60">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>50% deposit before work begins</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>50% upon project completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Milestone payments for large projects ($15k+)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Secure payment via Paddle</span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>

            {/* Refund Policy */}
            <AnimatedSection delay={0.2}>
              <div className="glass rounded-2xl p-8 border border-white/10 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Refund Policy</h3>
                <ul className="space-y-3 text-white/60">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Full refund if canceled before work starts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Deposits non-refundable after development begins</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Pro-rated refund for canceled milestones</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Processing fees may apply</span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>

            {/* Support Policy */}
            <AnimatedSection delay={0.3}>
              <div className="glass rounded-2xl p-8 border border-white/10 h-full">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-500/20 flex items-center justify-center mb-6">
                  <HeartHandshake className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Support Policy</h3>
                <ul className="space-y-3 text-white/60">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>14-day post-launch support included</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Bug fixes during support period at no cost</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Optional monthly maintenance plans</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <span>Priority support for ongoing clients</span>
                  </li>
                </ul>
              </div>
            </AnimatedSection>
          </div>

          {/* Legal Links */}
          <div className="mt-12 text-center">
            <p className="text-white/40 text-sm mb-4">Read our complete policies:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/terms" className="text-cyan-400 hover:text-cyan-300 text-sm underline underline-offset-2">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300 text-sm underline underline-offset-2">
                Privacy Policy
              </Link>
              <Link to="/refunds" className="text-cyan-400 hover:text-cyan-300 text-sm underline underline-offset-2">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Project Intake Form Modal */}
      <ProjectIntakeForm
        isOpen={intakeFormOpen}
        onClose={() => setIntakeFormOpen(false)}
        selectedPackage={selectedPackage}
      />
    </div>
  );
}
