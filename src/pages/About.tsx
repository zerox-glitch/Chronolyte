import { useState, useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LightningIcon } from '../components/LightningIcon';
import { TargetIcon } from '../components/TargetIcon';
import { RocketIcon } from '../components/RocketIcon';
import { HandshakeIcon } from '../components/HandshakeIcon';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import { CtaBand, PageHero, SectionHead, Sheet } from '../components/editorial/EditorialPage';

function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ValueItem {
  icon: ReactNode;
  title: string;
  description: string;
}

interface StatItem {
  value: string;
  label: string;
}

interface AboutContent {
  hero: {
    badge_text: string;
    headline: string;
    description: string;
  };
  stats: StatItem[];
  story: {
    section_title: string;
    headline: string;
    paragraphs: string[];
    mission_title: string;
    mission_text: string;
  };
  values: {
    section_title: string;
    items: ValueItem[];
  };
  cta: {
    headline: string;
    description: string;
    button_text: string;
    button_link: string;
  };
}

const defaultContent: AboutContent = {
  hero: {
    badge_text: 'About Chronolyte',
    headline: "We're Chronolyte",
    description: 'An independent digital studio building the future of web and software experiences. We combine artificial intelligence, modern web technologies and strategic design thinking to deliver work that scales your business and delights your users.'
  },
  stats: [
    { value: '50+', label: 'Projects Delivered Globally' },
    { value: '99%', label: 'Client Satisfaction Rate' },
    { value: '24/7', label: 'Support & Monitoring' },
    { value: '10x', label: 'Faster Development' }
  ],
  story: {
    section_title: 'Our Story',
    headline: 'Born from a Vision to Bend Time',
    paragraphs: [
      'Chronolyte was founded with a singular mission: to harness the power of artificial intelligence to deliver exceptional digital solutions at unprecedented speeds. We saw an opportunity to transform how businesses approach digital transformation.',
      'As a dedicated full-stack developer and AI specialist, we bring the agility and personalized attention of a boutique agency with the capabilities and expertise of a full-scale development team. Every project receives our complete focus, commitment, and strategic insight.',
      'We believe that the best digital experiences come from the perfect fusion of AI-powered efficiency and human creativity. That\'s the Chronolyte advantage—where cutting-edge technology meets masterful craftsmanship.'
    ],
    mission_title: 'Our Mission',
    mission_text: 'To empower visionary businesses with AI-driven digital solutions that transform ideas into market-leading products, delivered at the speed of tomorrow.'
  },
  values: {
    section_title: 'Our Values',
    items: [
      { icon: <LightningIcon />, title: 'Speed Without Compromise', description: 'We leverage AI to deliver projects 10x faster without sacrificing quality or reliability.' },
      { icon: <TargetIcon />, title: 'Precision Engineering', description: 'Every line of code, every pixel, every interaction is meticulously crafted for perfection.' },
      { icon: <RocketIcon />, title: 'Future-First Approach', description: 'We build solutions that don\'t just work today—they scale and evolve for tomorrow.' },
      { icon: <HandshakeIcon />, title: 'Partnership Mindset', description: 'Your success is our success. We\'re invested in your growth and long-term vision.' }
    ]
  },
  cta: {
    headline: 'Ready to Work Together?',
    description: "Let's discuss how we can help transform your vision into reality.",
    button_text: 'Get in Touch',
    button_link: '/contact'
  }
};

const expertise = [
  { title: 'Advanced AI Integration', body: 'Machine learning, natural language processing and intelligent automation create smart, adaptive solutions.' },
  { title: 'Full-Stack Excellence', body: 'From responsive frontends to scalable backends, we work across every layer of modern web architecture.' },
  { title: 'Strategic Design Thinking', body: 'User-centric design combined with business strategy to drive measurable results.' }
];

export function About() {
  const [content, setContent] = useState<AboutContent>(defaultContent);

  useEffect(() => {
    fetch('/backend/api/settings.php?action=get&key=about_content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.value) {
          const parsed = typeof data.data.value === 'string' ? JSON.parse(data.data.value) : data.data.value;
          setContent({ ...defaultContent, ...parsed });
        }
      })
      .catch(err => console.error('Failed to load about content:', err));
  }, []);

  const stats = content.stats;
  const values = content.values.items;

  return (
    <>
      <PageHero
        eyebrow={content.hero.badge_text}
        title={<>We're <em>Chronolyte</em></>}
        lede={content.hero.description}
        actions={
          <>
            <Link to="/contact" className="ed-btn">Start a project</Link>
            <Link to="/portfolio" className="ed-btn ed-btn--ghost">See our work</Link>
          </>
        }
        meta={
          <>
            <span>Independent studio</span>
            <span>Working worldwide</span>
            <span>Fixed-price quotes</span>
          </>
        }
      />

      <Sheet tone="lime">
        <div className="ed-rubric" style={{ marginBottom: 'clamp(18px, 2.4vw, 28px)' }}>
          By the numbers<span className="ed-rubric__num">01 / 05</span>
        </div>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, index) => (
            <AnimatedSection key={stat.label} delay={index * 0.08}>
              <div className="ed-stat">
                <span className="ed-stat__value">{stat.value}</span>
                <span className="ed-stat__label">{stat.label}</span>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Sheet>

      <Sheet tone="paper">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-start">
          <AnimatedSection>
            <SectionHead
              rubric={content.story.section_title}
              number="02 / 05"
              title={<>Born from a vision to <em>bend time</em></>}
            />
            <div className="ed-copy" style={{ display: 'grid', gap: '1rem', marginTop: '1.4rem' }}>
              {content.story.paragraphs.map((paragraph, idx) => (
                <p key={idx} style={{ margin: 0, fontSize: '1.02rem' }}>{paragraph}</p>
              ))}
            </div>
          </AnimatedSection>
          <AnimatedSection delay={0.15}>
            <div className="ed-card" style={{ background: '#f7f1e2' }}>
              <p className="ed-rubric">{content.story.mission_title}</p>
              <p className="ed-quote" style={{ marginTop: '0.6rem' }}>“{content.story.mission_text}”</p>
              <p className="ed-card__body" style={{ marginTop: '1rem' }}>
                Every engagement is scoped in writing, priced up front and delivered by the same small team you brief.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </Sheet>

      <Sheet tone="mist">
        <SectionHead
          rubric="Our expertise"
          number="03 / 05"
          title={<>What sets us <em>apart</em></>}
          lede="Three disciplines we combine on every build — not three separate teams you have to coordinate."
        />
        <div className="grid gap-4 md:grid-cols-3">
          {expertise.map((item, index) => (
            <AnimatedSection key={item.title} delay={index * 0.08}>
              <div className="ed-card h-full">
                <span className="ed-card__num">{String(index + 1).padStart(2, '0')}</span>
                <h3 className="ed-card__title">{item.title}</h3>
                <p className="ed-card__body">{item.body}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </Sheet>

      <Sheet tone="cherry">
        <SectionHead
          rubric={content.values.section_title}
          number="04 / 05"
          title={<>What we <em>stand for</em></>}
        />
        <div className="grid gap-4 md:grid-cols-2">
          {values.map((value, index) => (
            <AnimatedSection key={value.title} delay={index * 0.07}>
              <div className="ed-card h-full">
                <span className="ed-icon-badge">{value.icon}</span>
                <h3 className="ed-card__title">{value.title}</h3>
                <p className="ed-card__body">{value.description}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
        <div className="ed-btn-row" style={{ marginTop: 'clamp(22px, 3vw, 34px)' }}>
          <a href={CONTACT_PHONE_TEL} className="ed-btn ed-btn--onDark">Call {CONTACT_PHONE_DISPLAY}</a>
          <Link to="/blog" className="ed-btn ed-btn--ghostOnDark">Read our guides</Link>
        </div>
      </Sheet>

      <CtaBand
        eyebrow="05 / 05 — Let's talk"
        title={<>Ready to work <em>together?</em></>}
        description={content.cta.description}
        primaryTo={content.cta.button_link}
        primaryLabel={content.cta.button_text}
        secondaryTo="/pricing"
        secondaryLabel="See pricing"
        note="Free plan, timeline and fixed quote within one business day. No obligation."
      />
    </>
  );
}
