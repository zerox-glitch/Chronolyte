import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ProjectIntakeForm } from '../components/ProjectIntakeForm';
import { CheckCircle2, ChevronDown, Clock, Shield, CreditCard, HeartHandshake, ArrowRight } from 'lucide-react';
import { CtaBand, PageHero, SectionHead, Sheet } from '../components/editorial/EditorialPage';

// Pricing Card
interface PricingCardProps {
  tier: {
    name: string;
    price?: number;
    price_display?: string;
    period?: string;
    badge?: string;
    is_popular?: boolean;
    highlighted?: boolean | number;
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
  const isMostPopular = Boolean(Number(isPopular) || Number(tier.highlighted));
  const priceDisplay = tier.price_display || `$${tier.price?.toLocaleString()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55 }}
      whileHover={{ y: -5 }}
      className="ed-card h-full"
      style={isMostPopular ? { borderColor: '#7b182a', borderWidth: 2, boxShadow: '9px 9px 0 rgba(123,24,42,0.24)' } : undefined}
    >
      {isMostPopular && (
        <span className="ed-chip" style={{ alignSelf: 'flex-start', marginBottom: '0.7rem', background: '#7b182a', borderColor: '#5a0f1f', color: '#fff5e8' }}>
          Most popular
        </span>
      )}
      <h3 className="ed-card__title">{tier.name}</h3>
      <p className="ed-card__body" style={{ marginTop: '0.2rem' }}>{tier.description}</p>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', margin: '0.9rem 0 0.3rem' }}>
        <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.9rem, 3vw, 2.6rem)', fontWeight: 700, letterSpacing: '-0.05em', color: '#7b182a', lineHeight: 1 }}>
          {priceDisplay}
        </span>
        {tier.period && <span style={{ fontSize: '0.82rem', color: '#5f6d62' }}>{tier.period}</span>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#5f6d62' }}>
        <Clock className="h-3.5 w-3.5" />
        <span>{tier.timeline}</span>
      </div>

      <hr className="ed-hairline" style={{ margin: '1rem 0' }} />

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem', flexGrow: 1 }}>
        {features.slice(0, 8).map((feature: string, idx: number) => (
          <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.87rem', lineHeight: 1.55, color: '#4c5a50' }}>
            <CheckCircle2 className="h-4 w-4" style={{ flex: 'none', marginTop: 3, color: '#7b182a' }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onStartProject({
          name: tier.name,
          price: tier.price || 0,
          category: tier.category || 'Custom'
        })}
        className={isMostPopular ? 'ed-btn' : 'ed-btn ed-btn--ghost'}
        style={{ width: '100%', marginTop: '1.2rem' }}
      >
        Get my exact quote
      </button>
    </motion.div>
  );
}

// FAQ Item
function FAQItem({ question, answer, isOpen, onToggle }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="ed-card ed-card--flat" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={onToggle}
        aria-expanded={isOpen}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.2rem', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left' }}
      >
        <h4 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.02em', color: '#26312a' }}>{question}</h4>
        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }} style={{ flex: 'none', width: 26, height: 26, borderRadius: '50%', border: '1px solid rgba(123,24,42,0.4)', display: 'grid', placeItems: 'center', color: '#7b182a' }}>
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
            <p className="ed-copy" style={{ padding: '0.9rem 1.2rem 1.1rem', margin: 0, fontSize: '0.92rem', borderTop: '1px solid rgba(84,72,48,0.18)' }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const formatStartingPrice = (plan: any) => plan.price_display || 'From $' + Number(plan.price || 0).toLocaleString('en-US');

export function Pricing() {
  const [openFAQs, setOpenFAQs] = useState<Record<number, boolean>>({});
  const [pricingData, setPricingData] = useState<Record<string, any[]>>({ websites: [], aitools: [], saas: [], automation: [] });
  const [loading, setLoading] = useState(true);
  const [intakeFormOpen, setIntakeFormOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<{ name: string; price: number; category: string } | undefined>(undefined);

  const handleStartProject = (pkg: { name: string; price: number; category: string }) => {
    setSelectedPackage(pkg);
    setIntakeFormOpen(true);
  };

  useEffect(() => {
    const loadPricing = async () => {
      try {
        const res = await fetch('/api/pricing?action=list', { cache: 'no-store' });
        const json = await res.json();
        
        if (res.ok && json.success) {
          const grouped: Record<string, any[]> = { websites: [], aitools: [], saas: [], automation: [] };
          (Array.isArray(json.data) ? json.data : []).forEach((plan: any) => {
            if (Number(plan.active) === 0) return;
            const category = plan.category === 'ai-tools' ? 'aitools' : plan.category;
            if (Array.isArray(grouped[category])) grouped[category].push(plan);
          });
          setPricingData(grouped);
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
    { question: 'What is included in the starting price?', answer: 'Each package card above lists its current included features and delivery guidance. Additional requirements receive a written quote before work begins.' },
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

  const featured = pricingData.websites.find((plan: any) => plan.is_popular || plan.highlighted);

  const renderGroup = (plans: any[], categoryLabel: string) => (
    loading ? (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0', gap: '0.5rem' }}>
        <span className="ed-loading-dot" /><span className="ed-loading-dot" /><span className="ed-loading-dot" />
      </div>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {plans?.map((tier, index) => (
          <PricingCard key={index} tier={{ ...tier, category: categoryLabel }} isPopular={tier.is_popular} onStartProject={handleStartProject} />
        ))}
      </div>
    )
  );

  return (
    <>
      <PageHero
        eyebrow="Transparent pricing"
        title={<>Simple, <em>honest</em> pricing</>}
        lede="Explore up-to-date packages managed directly by Chronolyte. Compare features, delivery timelines and prices before requesting a tailored quote."
        actions={
          <>
            <button type="button" onClick={() => handleStartProject({ name: 'Custom Project', price: 0, category: 'Custom' })} className="ed-btn">
              Get a custom quote <ArrowRight className="h-4 w-4" />
            </button>
            <Link to="/contact" className="ed-btn ed-btn--ghost">Talk it through</Link>
          </>
        }
        meta={
          <>
            <span>50 / 50 payment split</span>
            <span>14 days post-launch support</span>
            <span>Fixed-price quotes</span>
          </>
        }
      />

      {featured && (() => {
        const features = typeof featured.features === 'string' ? (() => { try { return JSON.parse(featured.features); } catch { return []; } })() : (featured.features || []);
        return (
          <Sheet tone="cherry">
            <div className="ed-rubric">Featured website package<span className="ed-rubric__num">01 / 06</span></div>
            <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
              <div>
                <h2 className="ed-title ed-title--sm" style={{ marginTop: '0.6rem' }}>
                  {featured.name} <em>— {formatStartingPrice(featured)}</em>
                </h2>
                <p className="ed-lede">{featured.description}</p>
                {featured.timeline && <p className="ed-chip" style={{ marginTop: '0.9rem' }}>Delivery: {featured.timeline}</p>}
              </div>
              <div className="ed-card">
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.5rem' }}>
                  {features.map((feature: string, index: number) => (
                    <li key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start', fontSize: '0.88rem', lineHeight: 1.55, color: '#eddccd' }}>
                      <CheckCircle2 className="h-4 w-4" style={{ flex: 'none', marginTop: 3, color: '#c5de97' }} /> {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => handleStartProject({ name: featured.name, price: Number(featured.price), category: featured.category })}
                  className="ed-btn ed-btn--onDark"
                  style={{ width: '100%', marginTop: '1.1rem' }}
                >
                  Get a quote for {featured.name}
                </button>
              </div>
            </div>
          </Sheet>
        );
      })()}

      <Sheet tone="paper">
        <div className="grid gap-4 md:grid-cols-3">
          {[['01', 'Choose a package', 'Review the current prices and features above.'], ['02', 'Agree on scope', 'Confirm pages, integrations, timeline and a written final quote.'], ['03', 'Launch and hand over', 'Review, approve and receive your agreed deliverables.']].map(([step, title, description]) => (
            <article key={step} className="ed-card h-full">
              <span className="ed-card__num">{step}</span>
              <h3 className="ed-card__title">{title}</h3>
              <p className="ed-card__body">{description}</p>
            </article>
          ))}
        </div>
      </Sheet>

      <Sheet tone="lime">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['50/50', 'Payment split', '50% upfront to start, 50% upon completion. Simple and fair.'],
            ['14', 'Days free support', 'Every project includes post-launch support at no extra cost.'],
            ['∞', 'Revisions included', 'We work with you until you are comfortable with the delivery.']
          ].map(([value, label, body]) => (
            <div key={label} className="ed-stat">
              <span className="ed-stat__value">{value}</span>
              <span className="ed-stat__label" style={{ marginTop: '0.7rem' }}>{label}</span>
              <p className="ed-copy" style={{ margin: '0.6rem 0 0', fontSize: '0.9rem' }}>{body}</p>
            </div>
          ))}
        </div>
      </Sheet>

      <Sheet tone="paper" id="websites">
        <SectionHead rubric="Websites" number="02 / 06" title={<>Website <em>development</em></>} lede="Stunning, high-performance websites that convert." />
        {renderGroup(pricingData.websites, 'Website')}
      </Sheet>

      <Sheet tone="mist" id="ai-tools">
        <SectionHead rubric="AI solutions" number="03 / 06" title={<>Mobile app & <em>AI builds</em></>} lede="Intelligent solutions powered by modern AI tooling." />
        {renderGroup(pricingData.aitools, 'AI Tool')}
      </Sheet>

      <Sheet tone="paper" id="saas">
        <SectionHead rubric="SaaS" number="04 / 06" title={<>SaaS <em>development</em></>} lede="Full-stack products built for growth and scale." />
        {renderGroup(pricingData.saas, 'SaaS')}
      </Sheet>

      <Sheet tone="lime" id="automation">
        <SectionHead rubric="Automation" number="05 / 06" title={<>Hire <em>developers</em></>} lede="Intelligent workflow automation and vetted talent for your business." />
        {renderGroup(pricingData.automation, 'Automation')}
      </Sheet>

      <Sheet tone="paper">
        <SectionHead rubric="FAQ" number="06 / 06" title={<>Common <em>questions</em></>} lede="Everything about our pricing and process." />
        <div style={{ display: 'grid', gap: '0.7rem' }}>
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} isOpen={openFAQs[index] || false} onToggle={() => toggleFAQ(index)} />
          ))}
        </div>
      </Sheet>

      <Sheet tone="mist">
        <SectionHead rubric="Our policies" title={<>Transparent <em>terms</em></>} lede="Clear, fair policies that protect both sides of the project." />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { title: 'Payment terms', icon: <CreditCard className="h-5 w-5" />, items: ['50% deposit before work begins', '50% upon project completion', 'Milestone payments for large projects ($15k+)', 'Secure payment via Paddle'] },
            { title: 'Refund policy', icon: <Shield className="h-5 w-5" />, items: ['Full refund if canceled before work starts', 'Deposits non-refundable after development begins', 'Pro-rated refund for canceled milestones', 'Processing fees may apply'] },
            { title: 'Support policy', icon: <HeartHandshake className="h-5 w-5" />, items: ['14-day post-launch support included', 'Bug fixes during support period at no cost', 'Optional monthly maintenance plans', 'Priority support for ongoing clients'] }
          ].map((policy) => (
            <article key={policy.title} className="ed-card h-full">
              <span className="ed-icon-badge">{policy.icon}</span>
              <h3 className="ed-card__title">{policy.title}</h3>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.45rem' }}>
                {policy.items.map((item) => (
                  <li key={item} style={{ display: 'flex', gap: '0.45rem', alignItems: 'flex-start', fontSize: '0.86rem', lineHeight: 1.55, color: '#4c5a50' }}>
                    <CheckCircle2 className="h-4 w-4" style={{ flex: 'none', marginTop: 3, color: '#3f7a37' }} /> {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="ed-copy" style={{ marginTop: '1.2rem', fontSize: '0.85rem' }}>
          Read the complete policies: <Link to="/terms" className="ed-link">Terms of Service</Link>, <Link to="/privacy" className="ed-link">Privacy Policy</Link>, <Link to="/refunds" className="ed-link">Refund Policy</Link>.
        </p>
      </Sheet>

      <CtaBand
        eyebrow="Ready when you are"
        title={<>Ready to get <em>started?</em></>}
        description="Submit your project request and we'll get back to you within one business day with a free plan, timeline and fixed quote."
        primaryTo="/contact"
        primaryLabel="Get a custom quote"
        secondaryTo="/services"
        secondaryLabel="Explore services"
        note="No obligation, no card required."
      />

      <ProjectIntakeForm
        isOpen={intakeFormOpen}
        onClose={() => setIntakeFormOpen(false)}
        selectedPackage={selectedPackage}
      />
    </>
  );
}
