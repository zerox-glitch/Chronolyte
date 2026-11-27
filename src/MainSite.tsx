import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Clock,
  BadgeCheck,
  Globe,
  Plus,
  Minus,
  Asterisk,
  Rocket,
  Store,
  Target,
  Layers,
  Zap,
} from 'lucide-react';
import { LeadCaptureForm } from './components/LeadCaptureForm';
import { FeaturedBlogs } from './components/FeaturedBlogs';
import { CtaBand, EditorialPage, SectionHead, Sheet } from './components/editorial/EditorialPage';
import { HomeHeroCarousel } from './components/editorial/HomeHeroCarousel';
import { MotionSwitch } from './components/editorial/MotionPreferences';
import { CONTACT_PHONE_TEL, CONTACT_PHONE_DISPLAY } from './constants/siteContact.js';

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
    items: Array<{ name: string; description?: string }>;
  };
  cta: {
    headline: string;
    description: string;
    button_text: string;
    button_link: string;
  };
}

const defaultServices = [
  {
    id: 'web-design',
    title: 'Web Design',
    description: 'Custom, mobile-first websites designed to convert visitors and rank on search engines.',
    features: ['Custom Design', 'Mobile-first', 'Conversion Focused', 'SEO Ready'],
  },
  {
    id: 'web-development',
    title: 'Web Development',
    description: 'Fast, secure, custom-coded websites, portals and integrations built on modern stacks.',
    features: ['Custom Code', 'Portals', 'Integrations', 'Performance'],
  },
  {
    id: 'mobile-apps',
    title: 'Mobile App Development',
    description: 'iOS and Android apps, from MVP to full product — cross-platform or native.',
    features: ['iOS & Android', 'React Native / Flutter', 'MVP to Scale', 'App Store Launch'],
  },
  {
    id: 'saas',
    title: 'SaaS Development',
    description: 'Plan, build and launch your subscription software product with billing and dashboards.',
    features: ['Subscriptions', 'Auth & Billing', 'Admin Dashboards', 'Cloud Deploy'],
  },
  {
    id: 'ecommerce',
    title: 'E-commerce Development',
    description: 'Shopify, WooCommerce and custom online stores engineered to sell.',
    features: ['Shopify', 'WooCommerce', 'Custom Stores', 'Payments'],
  },
  {
    id: 'ui-ux',
    title: 'UI/UX Design',
    description: 'Product design for web apps, SaaS and mobile apps that users understand instantly.',
    features: ['Prototypes', 'Design Systems', 'User Testing', 'Figma'],
  },
  {
    id: 'redesign',
    title: 'Website Redesign & Fixes',
    description: 'Audit, redesign, speed up or rescue your existing site or application.',
    features: ['Audits', 'Speed Optimization', 'Rescue Projects', 'Migrations'],
  },
  {
    id: 'hire-developers',
    title: 'Hire Developers',
    description: 'Vetted developers and designers by the project, hour or month.',
    features: ['Vetted Talent', 'Flexible Terms', 'Fast Start', 'Managed for You'],
  },
];

const defaultBenefits = [
  {
    metric: '1 Day',
    label: 'Reply Time',
    description: 'A real person replies within one business day with questions or a plan.',
  },
  {
    metric: 'See pricing',
    label: 'Websites From',
    description: 'Compare the current website packages and request a project quote.',
  },
  {
    metric: '2-4 mo',
    label: 'SaaS MVPs',
    description: 'Idea to launched, revenue-ready subscription product.',
  },
  {
    metric: '100%',
    label: 'Code Ownership',
    description: 'Code, designs and accounts transfer to you on final payment.',
  },
  {
    metric: '1 Team',
    label: 'Fully Managed',
    description: 'Design, development and project management under one roof.',
  },
];

const defaultSteps = [
  {
    step: '01',
    title: 'Tell Us What You Want',
    description: 'Answer three quick questions about your project. It takes about a minute.',
  },
  {
    step: '02',
    title: 'Get Your Free Plan',
    description: 'Within one business day we reply with a recommended scope, timeline and fixed quote.',
  },
  {
    step: '03',
    title: 'Approve & Kick Off',
    description: 'Happy with the plan? We agree milestones and start. Not for you? No obligation.',
  },
  {
    step: '04',
    title: 'See Progress, Launch, Grow',
    description: 'Working demos every 1-2 weeks, then launch and ongoing support.',
  },
];

const defaultIndustries = [
  { name: 'Startups', description: 'Turn an idea into a launched MVP without hiring a full team' },
  { name: 'Local Business', description: 'A professional website that brings in enquiries' },
  { name: 'Agencies', description: 'Add reliable developers when your roadmap outgrows your team' },
  { name: 'SaaS Founders', description: 'Plan, build and launch your subscription product' },
  { name: 'Entrepreneurs', description: 'Plain-English advice, one accountable team' },
];

const defaultHomeContent: HomePageContent = {
  hero: {
    badge_text: 'Start your project free',
    headline_1: 'Hire Web Designers',
    headline_2: '& Developers',
    subheadline:
      'Tell us what you want to build — get a free plan, timeline and fixed quote within one business day.\nNo obligation, no card required.',
    cta_primary_text: 'Start your project free',
    cta_primary_link: '/contact',
    cta_secondary_text: 'See pricing',
    cta_secondary_link: '/pricing',
  },
  services: {
    section_title: 'Websites, Apps &',
    section_subtitle: 'SaaS Products',
    section_description:
      'One team for design, development and launch — delivered on fixed quotes with demos every 1-2 weeks.',
    items: [],
  },
  why: {
    section_title: 'Marketplace Flexibility,',
    section_subtitle: 'Studio Accountability',
    items: [],
  },
  process: {
    section_title: 'From Idea to',
    section_subtitle: 'Launch in 4 Steps',
    steps: [],
  },
  industries: {
    section_title: 'Who We',
    section_subtitle: 'Help',
    items: [],
  },
  cta: {
    headline: 'Ready to Build Something Great?',
    description:
      'Tell us about your project and get a free plan, timeline and quote within one business day.',
    button_text: 'Start your project free',
    button_link: '/contact',
  },
};

function Hero({ content }: { content: HomePageContent['hero'] }) {
  const [intro, ...note] = content.subheadline.split('\n');
  return (
    <section className="studio-hero" aria-labelledby="home-title">
      <div className="studio-hero__inner">
        <div className="studio-hero__copy">
          <p className="studio-eyebrow">
            <span className="signal-rule" />
            Chronolyte / Independent digital studio
          </p>
          <h1 id="home-title" className="studio-headline">
            <span>{content.headline_1}</span> <em>{content.headline_2}</em>
          </h1>
          <p className="studio-intro">{intro}</p>
          <div className="ed-btn-row studio-hero__actions">
            <Link to={content.cta_primary_link} className="ed-btn">
              {content.cta_primary_text}
              <ArrowUpRight size={18} />
            </Link>
            <Link to={content.cta_secondary_link} className="ed-btn ed-btn--ghost">
              {content.cta_secondary_text}
              <ArrowRight size={16} />
            </Link>
          </div>
          {note.length > 0 && (
            <p className="hero-footnote">
              <ShieldCheck size={14} />
              {note.join('\n')}
            </p>
          )}
        </div>
        <HomeHeroCarousel />
      </div>
    </section>
  );
}

function CapabilitiesStrip({ services }: { services: HomePageContent['services']['items'] }) {
  const names = (services.length ? services : defaultServices).map((service) => service.title);
  return (
    <div className="capabilities-strip">
      <div className="capabilities-window" aria-hidden="true">
        <div className="capabilities-belt">
          {[0, 1].map((copy) => (
            <div className="capabilities-run" key={copy}>
              {names.map((name, i) => (
                <span key={i}>
                  <Asterisk />
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <MotionSwitch compact />
    </div>
  );
}

const assurances = [
  { Icon: ShieldCheck, text: '100% free — no card required' },
  { Icon: Clock, text: 'Real person replies within one business day' },
  { Icon: BadgeCheck, text: 'Fixed-price quote, not a vague estimate' },
  { Icon: Globe, text: 'Working worldwide, remotely' },
];
function ProjectPlanner({ badge }: { badge: string }) {
  return (
    <Sheet id="start" className="home-planner" innerClassName="planner-layout">
      <div className="planner-intro">
        <p className="studio-eyebrow">
          <span className="section-index">01</span> Project intake
        </p>
        <h2 className="ed-title planner-title">
          Free project <em>plan.</em>
        </h2>
        <ul className="planner-promises">
          {assurances.map(({ Icon, text }) => (
            <li key={text}>
              <Icon size={17} />
              {text}
            </li>
          ))}
        </ul>
      </div>
      <LeadCaptureForm eyebrow={badge} />
    </Sheet>
  );
}

function ServicesSection({ content }: { content: HomePageContent['services'] }) {
  const services = content.items.length ? content.items : defaultServices;
  const [expanded, setExpanded] = useState<number | null>(0);
  return (
    <Sheet id="services" tone="graphite" innerClassName="service-directory">
      <SectionHead
        rubric="What we build"
        number="02 / 07"
        title={
          <>
            {content.section_title || 'Websites, Apps &'}
            <br />
            <em>{content.section_subtitle || 'SaaS Products'}</em>
          </>
        }
        lede={
          content.section_description ||
          'Every solution we create is custom-built for maximum impact. No templates. No shortcuts. Only results.'
        }
      />
      <div className="directory-rows">
        {services.map((s, i) => (
          <article key={s.id || s.title} className="directory-row">
            <h3>
              <button
                type="button"
                aria-expanded={expanded === i}
                aria-controls={`service-spec-${i}`}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                <span>{String(i + 1).padStart(2, '0')}</span>
                {s.title}
                {expanded === i ? <Minus size={19} /> : <Plus size={19} />}
              </button>
            </h3>
            <div id={`service-spec-${i}`} className="directory-spec" hidden={expanded !== i}>
              <p>{s.description}</p>
              <ul>{s.features?.map((f) => <li key={f}>{f}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
    </Sheet>
  );
}

function WhySection({ content }: { content: HomePageContent['why'] }) {
  return (
    <Sheet id="why" tone="white">
      <SectionHead
        rubric="Why Chronolyte"
        number="03 / 07"
        title={
          <>
            {content.section_title || 'Marketplace Flexibility,'}
            <br />
            <em>{content.section_subtitle || 'Studio Accountability'}</em>
          </>
        }
        lede="No bidding wars, no mystery freelancers. One accountable studio with fixed quotes and demos every one to two weeks."
      />
      <div className="benefit-grid">
        {(content.items.length ? content.items : defaultBenefits).map((b) => (
          <article key={b.label}>
            <span className="ed-stat__value">{b.metric}</span>
            <h3>{b.label}</h3>
            <p className="ed-card__body">{b.description}</p>
          </article>
        ))}
      </div>
    </Sheet>
  );
}
function ProcessSection({ content }: { content: HomePageContent['process'] }) {
  return (
    <Sheet id="process" tone="alloy">
      <SectionHead
        rubric="The process"
        number="04 / 07"
        title={
          <>
            {content.section_title || 'From Idea to'}{' '}
            <em>{content.section_subtitle || 'Launch in 4 Steps'}</em>
          </>
        }
        lede="A battle-tested framework that transforms vague ideas into scoped, fixed-price products."
      />
      <ol className="process-track">
        {(content.steps.length ? content.steps : defaultSteps).map((s) => (
          <li key={s.step}>
            <div className="process-marker">
              <span>Step {s.step}</span>
              <ArrowRight size={17} />
            </div>
            <h3>{s.title}</h3>
            <p className="ed-card__body">{s.description}</p>
          </li>
        ))}
      </ol>
    </Sheet>
  );
}
function IndustriesSection({ content }: { content: HomePageContent['industries'] }) {
  const icons = [Rocket, Store, Target, Layers, Zap];
  return (
    <Sheet id="industries">
      <SectionHead
        rubric="Who we serve"
        number="05 / 07"
        title={
          <>
            {content.section_title || 'Built for'} <em>{content.section_subtitle || 'Visionaries'}</em>
          </>
        }
        lede="Different industries, one standard of craft. Tell us your customers and constraints — we scope around them."
      />
      <div className="industry-grid">
        {(content.items.length ? content.items : defaultIndustries).map((industry, i) => {
          const Icon = icons[i % icons.length];
          return (
            <article key={industry.name}>
              <Icon size={28} strokeWidth={1.45} />
              <h3>{industry.name}</h3>
              {industry.description && <p className="ed-card__body">{industry.description}</p>}
            </article>
          );
        })}
      </div>
      <div className="ed-btn-row section-actions">
        <Link to="/industries" className="ed-btn ed-btn--ghost">
          See all industries <ArrowRight />
        </Link>
        <Link to="/locations" className="ed-link">
          Where we work
        </Link>
      </div>
    </Sheet>
  );
}

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
          setHomeContent((prev) => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.error('Failed to load homepage content:', err);
      }
    };
    fetchContent();
    fetch('/api/pricing?action=list', { cache: 'no-store' })
      .then((response) =>
        response.ok ? response.json() : Promise.reject(new Error('Pricing request failed')),
      )
      .then((result) => {
        const plans = (Array.isArray(result.data) ? result.data : []).filter(
          (plan: any) => plan.category === 'websites' && Number(plan.active) !== 0 && Number(plan.price) > 0,
        );
        if (!plans.length) return;
        const lowestPrice = Math.min(...plans.map((plan: any) => Number(plan.price)));
        setWebsiteStartingPrice('From ' + String.fromCharCode(36) + lowestPrice.toLocaleString('en-US'));
      })
      .catch(() => setWebsiteStartingPrice(null));
  }, []);

  return (
    <EditorialPage className="ed-home">
      <Hero content={homeContent.hero} />
      <CapabilitiesStrip services={homeContent.services.items} />
      <ProjectPlanner badge={homeContent.hero.badge_text} />
      <ServicesSection content={homeContent.services} />
      <WhySection
        content={{
          ...homeContent.why,
          items: (homeContent.why.items.length ? homeContent.why.items : defaultBenefits).map((item) =>
            item.label === 'Websites From'
              ? { ...item, metric: websiteStartingPrice || 'See pricing' }
              : item,
          ),
        }}
      />
      <ProcessSection content={homeContent.process} />
      <IndustriesSection content={homeContent.industries} />
      <Sheet tone="white">
        <FeaturedBlogs limit={3} />
      </Sheet>
      <CtaBand
        id="cta"
        eyebrow="Ready to lead?"
        number="07 / 07"
        title={homeContent.cta.headline || 'Future-Proof Your Business'}
        description={
          homeContent.cta.description ||
          'Tell us about your project and get a free plan, timeline and quote within one business day.'
        }
        primaryTo={homeContent.cta.button_link || '/contact'}
        primaryLabel={homeContent.cta.button_text || 'Start Building Now'}
        secondaryLabel=""
        note="Typically respond within 24 hours — no obligation."
        extraAction={
          <a href={CONTACT_PHONE_TEL} className="ed-btn ed-btn--ghostOnDark">
            Call {CONTACT_PHONE_DISPLAY}
          </a>
        }
      />
    </EditorialPage>
  );
}
