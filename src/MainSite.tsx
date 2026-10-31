import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { ShieldCheck, Clock, BadgeCheck, Globe, ArrowRight } from 'lucide-react';
import { LeadCaptureForm } from './components/LeadCaptureForm';
import { SiteNavigation } from './components/SiteNavigation';
import { FeaturedBlogs } from './components/FeaturedBlogs';
import { Footer } from './components/Footer';
import { WoodStage } from './components/editorial/EditorialPage';
import { CONTACT_PHONE_TEL, CONTACT_PHONE_DISPLAY } from './constants/siteContact.js';

// ============================================
// TYPES
// ============================================

interface HomePageContent {
  hero: {
    badge_text: string;
    headline_1: string;
    headline_2: string;
    subheadline: string;
    cta_primary_text: string;
    cta_primary_link: string;
    cta_secondary_text: string;
    cta_secondary_link: string;
  };
  services: {
    section_title: string;
    section_subtitle: string;
    section_description: string;
    items: Array<{
      id: string;
      title: string;
      description: string;
      features?: string[];
    }>;
  };
  why: {
    section_title: string;
    section_subtitle: string;
    items: Array<{
      metric: string;
      label: string;
      description: string;
    }>;
  };
  process: {
    section_title: string;
    section_subtitle: string;
    steps: Array<{
      step: string;
      title: string;
      description: string;
    }>;
  };
  industries: {
    section_title: string;
    section_subtitle: string;
    items: Array<{ name: string }>;
  };
  cta: {
    headline: string;
    description: string;
    button_text: string;
    button_link: string;
  };
}

// ============================================
// SHARED MOTION
// ============================================

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 42 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 42 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function SheetHeading({ rubric, number, title, accent, lede }: { rubric: string; number?: string; title: string; accent: string; lede?: string }) {
  return (
    <div className="ed-section-head">
      <div className="ed-section-head__body">
        <p className="ed-rubric">
          {rubric}
          {number && <span className="ed-rubric__num">{number}</span>}
        </p>
        <h2 className="ed-title">
          <span className="ed-title__plain">{title}</span>
          <br />
          <em>{accent}</em>
        </h2>
        {lede && <p className="ed-lede">{lede}</p>}
      </div>
    </div>
  );
}

// ============================================
// HERO
// ============================================

function HeroSection({ content }: { content: HomePageContent['hero'] }) {
  return (
    <section className="ed-sheet ed-sheet--paper ed-hero">
      <div className="ed-sheet__inner ed-hero__body">
        <span className="ed-hero__asterisk" aria-hidden="true">✳︎</span>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', alignItems: 'center' }}>
            <span className="ed-chip">
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#7b182a', display: 'inline-block' }} />
              {content.badge_text}
            </span>
            <span className="ed-rubric" style={{ margin: 0 }}>Chronolyte / Independent digital studio</span>
          </div>

          <h1 className="ed-hero__title" style={{ marginTop: 'clamp(16px, 2vw, 26px)' }}>
            <span style={{ color: '#6d1a2b' }}>{content.headline_1}</span>
            <br />
            <em>{content.headline_2}</em>
          </h1>

          <p className="ed-hero__lede" style={{ whiteSpace: 'pre-line' }}>{content.subheadline}</p>

          <div className="ed-btn-row ed-hero__actions">
            <Link to={content.cta_primary_link} className="ed-btn">
              {content.cta_primary_text} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to={content.cta_secondary_link} className="ed-btn ed-btn--ghost">
              {content.cta_secondary_text}
            </Link>
          </div>

          <div className="ed-hero__meta">
            <span><ShieldCheck /> 100% free — no card required</span>
            <span><Clock /> Real person replies within one business day</span>
            <span><BadgeCheck /> Fixed-price quote, not a vague estimate</span>
            <span><Globe /> Working worldwide, remotely</span>
          </div>
        </motion.div>

        <div style={{ marginTop: 'clamp(22px, 3vw, 38px)' }}>
          <LeadCaptureForm />
        </div>
      </div>
    </section>
  );
}

// ============================================
// SERVICES
// ============================================

const serviceIcons = [
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6zM3.75 9.75h16.5M9 20.25V9.75" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
];

const defaultServices = [
  { id: 'web-design', title: 'Web Design', description: 'Custom, mobile-first websites designed to convert visitors and rank on search engines.', features: ['Custom Design', 'Mobile-first', 'Conversion Focused', 'SEO Ready'] },
  { id: 'web-development', title: 'Web Development', description: 'Fast, secure, custom-coded websites, portals and integrations built on modern stacks.', features: ['Custom Code', 'Portals', 'Integrations', 'Performance'] },
  { id: 'mobile-apps', title: 'Mobile App Development', description: 'iOS and Android apps, from MVP to full product — cross-platform or native.', features: ['iOS & Android', 'React Native / Flutter', 'MVP to Scale', 'App Store Launch'] },
  { id: 'saas', title: 'SaaS Development', description: 'Plan, build and launch your subscription software product with billing and dashboards.', features: ['Subscriptions', 'Auth & Billing', 'Admin Dashboards', 'Cloud Deploy'] },
  { id: 'ecommerce', title: 'E-commerce Development', description: 'Shopify, WooCommerce and custom online stores engineered to sell.', features: ['Shopify', 'WooCommerce', 'Custom Stores', 'Payments'] },
  { id: 'ui-ux', title: 'UI/UX Design', description: 'Product design for web apps, SaaS and mobile apps that users understand instantly.', features: ['Prototypes', 'Design Systems', 'User Testing', 'Figma'] },
  { id: 'redesign', title: 'Website Redesign & Fixes', description: 'Audit, redesign, speed up or rescue your existing site or application.', features: ['Audits', 'Speed Optimization', 'Rescue Projects', 'Migrations'] },
  { id: 'hire-developers', title: 'Hire Developers', description: 'Vetted developers and designers by the project, hour or month.', features: ['Vetted Talent', 'Flexible Terms', 'Fast Start', 'Managed for You'] }
];

function ServicesSection({ content }: { content: HomePageContent['services'] }) {
  const services = content.items.length > 0 ? content.items : defaultServices;

  return (
    <section id="services" className="ed-sheet ed-sheet--cherry" data-paper="02">
      <div className="ed-sheet__inner">
        <AnimatedSection>
          <SheetHeading
            rubric="What we build"
            number="02 / 07"
            title={content.section_title || 'Websites, Apps &'}
            accent={content.section_subtitle || 'SaaS Products'}
            lede={content.section_description || 'Every solution we create is custom-built for maximum impact. No templates. No shortcuts. Only results.'}
          />
        </AnimatedSection>

        <div className="grid gap-4 md:grid-cols-2">
          {services.map((service, index) => (
            <AnimatedSection key={service.id || service.title} delay={Math.min(index * 0.06, 0.3)}>
              <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.25 }} className="ed-card h-full">
                <span className="ed-card__num">{String(index + 1).padStart(2, '0')}</span>
                <span className="ed-icon-badge">{serviceIcons[index % serviceIcons.length]}</span>
                <h3 className="ed-card__title">{service.title}</h3>
                <p className="ed-card__body" style={{ flexGrow: 1 }}>{service.description}</p>
                <div className="ed-kicker-row" style={{ marginTop: '1rem' }}>
                  {(service.features || []).map((feature) => (
                    <span key={feature} className="ed-chip">{feature}</span>
                  ))}
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// WHY
// ============================================

const defaultBenefits = [
  { metric: '1 Day', label: 'Reply Time', description: 'A real person replies within one business day with questions or a plan.' },
  { metric: 'See pricing', label: 'Websites From', description: 'Compare the current website packages and request a project quote.' },
  { metric: '2-4 mo', label: 'SaaS MVPs', description: 'Idea to launched, revenue-ready subscription product.' },
  { metric: '100%', label: 'Code Ownership', description: 'Code, designs and accounts transfer to you on final payment.' },
  { metric: '1 Team', label: 'Fully Managed', description: 'Design, development and project management under one roof.' }
];

function WhySection({ content }: { content: HomePageContent['why'] }) {
  const benefits = content.items.length > 0 ? content.items : defaultBenefits;

  return (
    <section id="why" className="ed-sheet ed-sheet--lime" data-paper="03">
      <div className="ed-sheet__inner">
        <AnimatedSection>
          <SheetHeading
            rubric="Why Chronolyte"
            number="03 / 07"
            title={content.section_title || 'Marketplace Flexibility,'}
            accent={content.section_subtitle || 'Studio Accountability'}
            lede="No bidding wars, no mystery freelancers. One accountable studio with fixed quotes and demos every one to two weeks."
          />
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {benefits.map((benefit, index) => (
            <AnimatedSection key={benefit.label} delay={Math.min(index * 0.07, 0.3)}>
              <motion.div whileHover={{ y: -6 }} className="ed-card h-full">
                <span className="ed-stat__value" style={{ fontSize: 'clamp(1.6rem, 2.6vw, 2.4rem)' }}>{benefit.metric}</span>
                <h3 className="ed-card__title" style={{ marginTop: '0.6rem' }}>{benefit.label}</h3>
                <p className="ed-card__body">{benefit.description}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// PROCESS
// ============================================

const defaultSteps = [
  { step: '01', title: 'Tell Us What You Want', description: 'Answer three quick questions about your project. It takes about a minute.' },
  { step: '02', title: 'Get Your Free Plan', description: 'Within one business day we reply with a recommended scope, timeline and fixed quote.' },
  { step: '03', title: 'Approve & Kick Off', description: 'Happy with the plan? We agree milestones and start. Not for you? No obligation.' },
  { step: '04', title: 'See Progress, Launch, Grow', description: 'Working demos every 1-2 weeks, then launch and ongoing support.' }
];

function ProcessSection({ content }: { content: HomePageContent['process'] }) {
  const steps = content.steps.length > 0 ? content.steps : defaultSteps;

  return (
    <section id="process" className="ed-sheet ed-sheet--mist" data-paper="04">
      <div className="ed-sheet__inner">
        <AnimatedSection>
          <SheetHeading
            rubric="The process"
            number="04 / 07"
            title={content.section_title || 'From Idea to'}
            accent={content.section_subtitle || 'Launch in 4 Steps'}
            lede="A battle-tested framework that transforms vague ideas into scoped, fixed-price products."
          />
        </AnimatedSection>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <AnimatedSection key={step.step} delay={Math.min(index * 0.08, 0.3)}>
              <motion.div whileHover={{ y: -4 }} className="ed-card ed-card--numbered h-full">
                <span className="ed-card__num">{step.step}</span>
                <p className="ed-rubric" style={{ marginBottom: '0.4rem' }}>Step {step.step}</p>
                <h3 className="ed-card__title">{step.title}</h3>
                <p className="ed-card__body">{step.description}</p>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================
// INDUSTRIES
// ============================================

const RocketLogo = () => (<svg viewBox="0 0 100 100" fill="none"><path d="M50 10L60 35H40L50 10Z" fill="currentColor" /><path d="M45 35H55V60C55 70 50 80 50 80C50 80 45 70 45 60V35Z" fill="currentColor" opacity="0.8" /><circle cx="40" cy="65" r="3" fill="currentColor" /><circle cx="60" cy="65" r="3" fill="currentColor" /><path d="M35 60L30 70V80L40 75V60H35Z" fill="currentColor" opacity="0.6" /><path d="M65 60L70 70V80L60 75V60H65Z" fill="currentColor" opacity="0.6" /></svg>);
const TargetLogo = () => (<svg viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2" /><circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2" opacity="0.6" /><circle cx="50" cy="50" r="18" fill="currentColor" /></svg>);
const StoreLogo = () => (<svg viewBox="0 0 100 100" fill="none"><path d="M20 40H80L75 85H25L20 40Z" stroke="currentColor" strokeWidth="2" /><rect x="35" y="50" width="12" height="20" fill="currentColor" /><rect x="53" y="50" width="12" height="20" fill="currentColor" /><path d="M30 40L35 25H65L70 40" stroke="currentColor" strokeWidth="2" /></svg>);
const DiamondLogo = () => (<svg viewBox="0 0 100 100" fill="none"><path d="M50 15L75 50L50 85L25 50L50 15Z" fill="currentColor" /><path d="M50 35L65 50L50 65L35 50L50 35Z" fill="#f0ebdd" /></svg>);
const BoltLogo = () => (<svg viewBox="0 0 100 100" fill="none"><path d="M50 15L65 45H50L70 85L35 55H50L30 15L50 15Z" fill="currentColor" /></svg>);
const LaptopLogo = () => (<svg viewBox="0 0 100 100" fill="none"><rect x="15" y="20" width="70" height="50" rx="3" stroke="currentColor" strokeWidth="2" /><rect x="20" y="25" width="60" height="40" fill="currentColor" opacity="0.3" /><path d="M30 75H70M35 75L40 80H60L65 75" stroke="currentColor" strokeWidth="2" /></svg>);
const CartLogo = () => (<svg viewBox="0 0 100 100" fill="none"><path d="M20 30H25L35 65H70L78 35H30" stroke="currentColor" strokeWidth="2" /><circle cx="40" cy="75" r="4" fill="currentColor" /><circle cx="65" cy="75" r="4" fill="currentColor" /></svg>);
const HeartLogo = () => (<svg viewBox="0 0 100 100" fill="none"><path d="M50 85C25 70 15 55 15 45C15 35 22 28 30 28C38 28 45 35 50 42C55 35 62 28 70 28C78 28 85 35 85 45C85 55 75 70 50 85Z" fill="currentColor" /></svg>);
const CoinsLogo = () => (<svg viewBox="0 0 100 100" fill="none"><circle cx="35" cy="45" r="20" stroke="currentColor" strokeWidth="2" /><text x="35" y="52" textAnchor="middle" fontSize="20" fill="currentColor" fontWeight="bold">$</text><circle cx="65" cy="55" r="20" stroke="currentColor" strokeWidth="2" opacity="0.6" /><text x="65" y="62" textAnchor="middle" fontSize="20" fill="currentColor" fontWeight="bold" opacity="0.6">$</text></svg>);
const HouseLogo = () => (<svg viewBox="0 0 100 100" fill="none"><path d="M20 60L50 25L80 60V80H20V60Z" stroke="currentColor" strokeWidth="2" /><rect x="40" y="65" width="20" height="20" fill="currentColor" opacity="0.4" /><rect x="30" y="55" width="12" height="12" fill="currentColor" opacity="0.3" /><rect x="58" y="55" width="12" height="12" fill="currentColor" opacity="0.3" /></svg>);
const BookLogo = () => (<svg viewBox="0 0 100 100" fill="none"><path d="M25 25V75C25 78 27 80 30 80H70C73 80 75 78 75 75V25C75 22 73 20 70 20H30C27 20 25 22 25 25Z" stroke="currentColor" strokeWidth="2" /><line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="1.5" /><line x1="35" y1="35" x2="65" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.6" /><line x1="35" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="1" opacity="0.6" /></svg>);
const BuildingLogo = () => (<svg viewBox="0 0 100 100" fill="none"><rect x="25" y="30" width="50" height="55" stroke="currentColor" strokeWidth="2" /><rect x="32" y="38" width="10" height="10" fill="currentColor" opacity="0.4" /><rect x="46" y="38" width="10" height="10" fill="currentColor" opacity="0.4" /><rect x="60" y="38" width="10" height="10" fill="currentColor" opacity="0.4" /><rect x="42" y="72" width="16" height="13" fill="currentColor" opacity="0.3" /></svg>);

const logoComponents: Record<string, React.ReactNode> = {
  Startups: <RocketLogo />,
  Agencies: <TargetLogo />,
  'Local Business': <StoreLogo />,
  'SaaS Founders': <DiamondLogo />,
  Entrepreneurs: <BoltLogo />,
  'SaaS & Tech': <LaptopLogo />,
  'E-commerce': <CartLogo />,
  Healthcare: <HeartLogo />,
  Finance: <CoinsLogo />,
  'Real Estate': <HouseLogo />,
  Education: <BookLogo />,
  Hospitality: <BuildingLogo />
};

const defaultIndustries = [
  { name: 'Startups', description: 'Turn an idea into a launched MVP without hiring a full team' },
  { name: 'Local Business', description: 'A professional website that brings in enquiries' },
  { name: 'Agencies', description: 'Add reliable developers when your roadmap outgrows your team' },
  { name: 'SaaS Founders', description: 'Plan, build and launch your subscription product' },
  { name: 'Entrepreneurs', description: 'Plain-English advice, one accountable team' }
];

function IndustriesSection({ content }: { content: HomePageContent['industries'] }) {
  const industries = content.items.length > 0
    ? content.items.map((item) => ({ name: item.name, description: '' }))
    : defaultIndustries;

  return (
    <section id="industries" className="ed-sheet ed-sheet--cream" data-paper="05">
      <div className="ed-sheet__inner">
        <AnimatedSection>
          <SheetHeading
            rubric="Who we serve"
            number="05 / 07"
            title={content.section_title || 'Built for'}
            accent={content.section_subtitle || 'Visionaries'}
            lede="Different industries, one standard of craft. Tell us your customers and constraints — we scope around them."
          />
        </AnimatedSection>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {industries.map((industry, index) => (
            <AnimatedSection key={industry.name} delay={Math.min(index * 0.05, 0.25)}>
              <motion.div whileHover={{ scale: 1.03, y: -4 }} className="ed-card h-full" style={{ alignItems: 'flex-start' }}>
                <div style={{ width: 38, height: 38, color: '#7b182a', marginBottom: '0.65rem' }}>
                  {logoComponents[industry.name] || logoComponents.Startups}
                </div>
                <h3 className="ed-card__title" style={{ fontSize: '1rem' }}>{industry.name}</h3>
                {industry.description && <p className="ed-card__body" style={{ fontSize: '0.82rem' }}>{industry.description}</p>}
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        <div className="ed-btn-row" style={{ marginTop: 'clamp(22px, 3vw, 34px)' }}>
          <Link to="/industries" className="ed-btn ed-btn--ghost">See all industries</Link>
          <Link to="/locations" className="ed-btn ed-btn--ghost">Where we work</Link>
        </div>
      </div>
    </section>
  );
}

// ============================================
// CTA
// ============================================

function CTASection({ content }: { content: HomePageContent['cta'] }) {
  return (
    <section id="cta" className="ed-sheet ed-sheet--ink" data-paper="07">
      <div className="ed-sheet__inner" style={{ maxWidth: '62rem' }}>
        <span className="ed-hero__asterisk" aria-hidden="true">✳︎</span>
        <AnimatedSection>
          <p className="ed-rubric">Ready to lead?<span className="ed-rubric__num">07 / 07</span></p>
          <h2 className="ed-title" style={{ color: '#f6eee3' }}>
            <span className="ed-title__plain">{content.headline || 'Future-Proof Your Business'}</span>
          </h2>
          <p className="ed-lede">{content.description || 'Tell us about your project and get a free plan, timeline and quote within one business day.'}</p>
          <div className="ed-btn-row" style={{ marginTop: 'clamp(20px, 2.6vw, 30px)' }}>
            <Link to={content.button_link || '/contact'} className="ed-btn ed-btn--onDark">
              {content.button_text || 'Start Building Now'} <ArrowRight className="h-4 w-4" />
            </Link>
            <a href={CONTACT_PHONE_TEL} className="ed-btn ed-btn--ghostOnDark">
              Call {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
          <p style={{ marginTop: '1.2rem', fontSize: '0.82rem', color: '#b9b2a4' }}>Typically respond within 24 hours — no obligation.</p>
        </AnimatedSection>
      </div>
    </section>
  );
}

// ============================================
// MAIN SITE
// ============================================

const defaultHomeContent: HomePageContent = {
  hero: {
    badge_text: 'Start your project free',
    headline_1: 'Hire Web Designers',
    headline_2: '& Developers',
    subheadline: 'Tell us what you want to build — get a free plan, timeline and fixed quote within one business day.\nNo obligation, no card required.',
    cta_primary_text: 'Start your project free',
    cta_primary_link: '/contact',
    cta_secondary_text: 'See pricing',
    cta_secondary_link: '/pricing'
  },
  services: {
    section_title: 'Websites, Apps &',
    section_subtitle: 'SaaS Products',
    section_description: 'One team for design, development and launch — delivered on fixed quotes with demos every 1-2 weeks.',
    items: []
  },
  why: {
    section_title: 'Marketplace Flexibility,',
    section_subtitle: 'Studio Accountability',
    items: []
  },
  process: {
    section_title: 'From Idea to',
    section_subtitle: 'Launch in 4 Steps',
    steps: []
  },
  industries: {
    section_title: 'Who We',
    section_subtitle: 'Help',
    items: []
  },
  cta: {
    headline: 'Ready to Build Something Great?',
    description: 'Tell us about your project and get a free plan, timeline and quote within one business day.',
    button_text: 'Start your project free',
    button_link: '/contact'
  }
};

export function MainSite() {
  const [homeContent, setHomeContent] = useState<HomePageContent>(defaultHomeContent);
  const [websiteStartingPrice, setWebsiteStartingPrice] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch('/backend/api/settings.php?action=get&key=homepage_content');
        const json = await res.json();
        if (json.success && json.data?.value) {
          const parsed = typeof json.data.value === 'string' ? JSON.parse(json.data.value) : json.data.value;
          setHomeContent(prev => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.error('Failed to load homepage content:', err);
      }
    };
    fetchContent();
    fetch('/api/pricing?action=list', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Pricing request failed')))
      .then(result => {
        const plans = (Array.isArray(result.data) ? result.data : []).filter((plan: any) => plan.category === 'websites' && Number(plan.active) !== 0 && Number(plan.price) > 0);
        if (!plans.length) return;
        const lowestPrice = Math.min(...plans.map((plan: any) => Number(plan.price)));
        setWebsiteStartingPrice('From ' + String.fromCharCode(36) + lowestPrice.toLocaleString('en-US'));
      })
      .catch(() => setWebsiteStartingPrice(null));
  }, []);

  return (
    <div className="ed-site ed-home">
      <WoodStage />
      <SiteNavigation />
      <main className="ed-main">
        <HeroSection content={homeContent.hero} />
        <ServicesSection content={homeContent.services} />
        <WhySection
          content={{
            ...homeContent.why,
            items: homeContent.why.items.map(item =>
              item.label === 'Websites From' ? { ...item, metric: websiteStartingPrice || 'See pricing' } : item
            )
          }}
        />
        <ProcessSection content={homeContent.process} />
        <IndustriesSection content={homeContent.industries} />
        <section className="ed-sheet ed-sheet--paper" data-paper="06">
          <div className="ed-sheet__inner">
            <FeaturedBlogs limit={3} />
          </div>
        </section>
        <CTASection content={homeContent.cta} />
      </main>
      <Footer />
    </div>
  );
}
