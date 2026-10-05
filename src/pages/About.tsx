import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';
import { LightningIcon } from '../components/LightningIcon';
import { TargetIcon } from '../components/TargetIcon';
import { RocketIcon } from '../components/RocketIcon';
import { HandshakeIcon } from '../components/HandshakeIcon';

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

interface ValueItem {
  icon: JSX.Element;
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
    badge_text: "About Chronolyte",
    headline: "We're Chronolyte",
    description: "An elite AI-powered digital agency dedicated to building the future of web and software experiences. We combine cutting-edge artificial intelligence, advanced web technologies, and strategic design thinking to deliver transformative solutions that scale your business and delight your users."
  },
  stats: [
    { value: "50+", label: "Projects Delivered Globally" },
    { value: "99%", label: "Client Satisfaction Rate" },
    { value: "24/7", label: "Support & Monitoring" },
    { value: "10x", label: "Faster Development" }
  ],
  story: {
    section_title: "Our Story",
    headline: "Born from a Vision to Bend Time",
    paragraphs: [
      "Chronolyte was founded with a singular mission: to harness the power of artificial intelligence to deliver exceptional digital solutions at unprecedented speeds. We saw an opportunity to transform how businesses approach digital transformation.",
      "As a dedicated full-stack developer and AI specialist, we bring the agility and personalized attention of a boutique agency with the capabilities and expertise of a full-scale development team. Every project receives our complete focus, commitment, and strategic insight.",
      "We believe that the best digital experiences come from the perfect fusion of AI-powered efficiency and human creativity. That's the Chronolyte advantage—where cutting-edge technology meets masterful craftsmanship."
    ],
    mission_title: "Our Mission",
    mission_text: "To empower visionary businesses with AI-driven digital solutions that transform ideas into market-leading products, delivered at the speed of tomorrow."
  },
  values: {
    section_title: "Our Values",
    items: [
      { icon: <LightningIcon />, title: "Speed Without Compromise", description: "We leverage AI to deliver projects 10x faster without sacrificing quality or reliability." },
      { icon: <TargetIcon />, title: "Precision Engineering", description: "Every line of code, every pixel, every interaction is meticulously crafted for perfection." },
      { icon: <RocketIcon />, title: "Future-First Approach", description: "We build solutions that don't just work today—they scale and evolve for tomorrow." },
      { icon: <HandshakeIcon />, title: "Partnership Mindset", description: "Your success is our success. We're invested in your growth and long-term vision." }
    ]
  },
  cta: {
    headline: "Ready to Work Together?",
    description: "Let's discuss how we can help transform your vision into reality.",
    button_text: "Get in Touch",
    button_link: "/contact"
  }
};

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

  const values = content.values.items;
  const stats = content.stats;

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <SiteNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">{content.hero.badge_text}</span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              {content.hero.headline.includes('Chronolyte') ? (
                <>We're <span className="gradient-text">Chronolyte</span></>
              ) : (
                content.hero.headline
              )}
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
              {content.hero.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 md:px-6 border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <AnimatedSection key={stat.label} delay={index * 0.1} className="text-center">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <span className="font-display text-4xl md:text-5xl font-bold gradient-text block mb-2">
                    {stat.value}
                  </span>
                  <span className="text-white/50 text-sm">{stat.label}</span>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">{content.story.section_title}</span>
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                {content.story.headline.includes('Bend Time') ? (
                  <>Born from a Vision to <span className="gradient-text">Bend Time</span></>
                ) : (
                  content.story.headline
                )}
              </h2>
              <div className="space-y-5 text-white/70 leading-relaxed">
                {content.story.paragraphs.map((paragraph, idx) => (
                  <p key={idx} className="text-lg">{paragraph}</p>
                ))}
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="glass rounded-3xl p-8 md:p-12">
                <h3 className="font-display text-2xl font-bold mb-6">{content.story.mission_title}</h3>
                <p className="text-white/70 text-lg leading-relaxed">
                  "{content.story.mission_text}"
                </p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">Our Expertise</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              What Sets Us <span className="gradient-text">Apart</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection delay={0}>
              <div className="glass rounded-2xl p-8">
                <h3 className="font-display text-lg font-bold mb-3">Advanced AI Integration</h3>
                <p className="text-white/60">Harness machine learning, natural language processing, and intelligent automation to create smart, adaptive solutions.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.1}>
              <div className="glass rounded-2xl p-8">
                <h3 className="font-display text-lg font-bold mb-3">Full-Stack Excellence</h3>
                <p className="text-white/60">From responsive frontends to scalable backends, we master every layer of modern web architecture.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay={0.2}>
              <div className="glass rounded-2xl p-8">
                <h3 className="font-display text-lg font-bold mb-3">Strategic Design Thinking</h3>
                <p className="text-white/60">User-centric design combined with business strategy ensures your solutions drive real, measurable results.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>


      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">{content.values.section_title}</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              What We <span className="gradient-text">Stand For</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <AnimatedSection key={value.title} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="glass rounded-2xl p-8 h-full flex flex-col"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 flex-shrink-0">
                    <div className="w-6 h-6 text-cyan-400">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-white/60 flex-grow">{value.description}</p>
                </motion.div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="glass-strong rounded-3xl p-12 glow-box">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                {content.cta.headline.includes('Together') ? (
                  <>Ready to Work <span className="gradient-text">Together?</span></>
                ) : (
                  content.cta.headline
                )}
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                {content.cta.description}
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={content.cta.button_link}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-bold text-black hover:shadow-lg hover:shadow-cyan-500/50 transition-shadow text-center"
                >
                  {content.cta.button_text}
                </Link>
                <a
                  href="tel:+18126906121"
                  className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-white border border-white/20 hover:border-cyan-400/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
