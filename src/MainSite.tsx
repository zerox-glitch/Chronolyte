import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ShieldCheck, Clock, BadgeCheck, Globe } from 'lucide-react';
import { LeadCaptureForm } from './components/LeadCaptureForm';
import { SiteNavigation } from './components/SiteNavigation';
import { FeaturedBlogs } from './components/FeaturedBlogs';
import { HourglassLogo } from './components/HourglassLogo';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, CONTACT_WHATSAPP_URL } from './constants/siteContact.js';

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
// COMPONENTS
// ============================================

// Animated Section Wrapper
function AnimatedSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 60 }}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Glowing Orb Background Effect
function GlowOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden hidden sm:block">
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" style={{ animation: 'pulse-glow-optimized 4s ease-in-out infinite' }} />
      <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px]" style={{ animation: 'pulse-glow-optimized 4s ease-in-out infinite 2s' }} />
    </div>
  );
}

// Noise Overlay
function NoiseOverlay() {
  return <div className="fixed inset-0 pointer-events-none noise-bg hidden sm:block" />;
}

// Grid Background
function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none opacity-[0.02] hidden sm:block">
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(rgba(0,245,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)`,
        backgroundSize: '100px 100px'
      }} />
    </div>
  );
}

// Shared public navigation lives in components/SiteNavigation.tsx.

// Hero Section
function HeroSection({ content }: { content: HomePageContent['hero'] }) {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 100]);
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);
  
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 md:pt-24">
      {/* Animated Light Streaks */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
            style={{
              width: '200px',
              top: `${20 + i * 15}%`,
              left: '-200px',
            }}
            animate={{
              x: ['0vw', '150vw'],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 1.2,
              ease: 'linear',
            }}
          />
        ))}
      </div>
      
      {/* Central Glow */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[800px] h-[400px] md:h-[800px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(0,245,255,0.1) 0%, transparent 70%)',
          y,
        }}
      />
      
      <motion.div style={{ opacity }} className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 glass rounded-full mb-8 md:mb-10"
          >
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-xs md:text-sm text-white/70">{content.badge_text}</span>
          </motion.div>
          
          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.95] mb-4 md:mb-6"
          >
            <span className="text-white">{content.headline_1}</span>
            <br />
            <span className="gradient-text glow-text">{content.headline_2}</span>
          </motion.h1>
          
          {/* Sub-headline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-base md:text-xl text-white/60 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-2 whitespace-pre-line"
          >
            {content.subheadline}
          </motion.p>
          
          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4"
          >
            <Link to={content.cta_primary_link}>
              <motion.div
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,245,255,0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="group relative w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-semibold text-black overflow-hidden text-center"
              >
                <span className="relative z-10">{content.cta_primary_text}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.div>
            </Link>
            <Link to={content.cta_secondary_link}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full sm:w-auto px-6 md:px-8 py-3.5 md:py-4 glass rounded-full font-semibold text-white hover:bg-white/10 transition-colors text-center"
              >
                {content.cta_secondary_text}
              </motion.div>
            </Link>
          </motion.div>

          {/* Trust bullets — same promises as the live site */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-white/50">
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400" /> 100% free — no card required</span>
            <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-cyan-400" /> Real person replies within one business day</span>
            <span className="flex items-center gap-2"><BadgeCheck className="w-4 h-4 text-cyan-400" /> Fixed-price quote, not a vague estimate</span>
            <span className="flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-400" /> Working worldwide, remotely</span>
          </motion.div>
        </motion.div>
      </motion.div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 pb-10">
        <LeadCaptureForm />
      </div>
    </section>
  );
}

// Services Section
// Default service icons (used as fallback)
const serviceIcons = [
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>,
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
  </svg>,
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
  </svg>,
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
  </svg>,
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>,
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
  </svg>,
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>,
  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
  </svg>
];

const defaultServices = [
  { id: "web-design", title: "Web Design", description: "Custom, mobile-first websites designed to convert visitors and rank on search engines.", features: ["Custom Design", "Mobile-first", "Conversion Focused", "SEO Ready"] },
  { id: "web-development", title: "Web Development", description: "Fast, secure, custom-coded websites, portals and integrations built on modern stacks.", features: ["Custom Code", "Portals", "Integrations", "Performance"] },
  { id: "mobile-apps", title: "Mobile App Development", description: "iOS and Android apps, from MVP to full product — cross-platform or native.", features: ["iOS & Android", "React Native / Flutter", "MVP to Scale", "App Store Launch"] },
  { id: "saas", title: "SaaS Development", description: "Plan, build and launch your subscription software product with billing and dashboards.", features: ["Subscriptions", "Auth & Billing", "Admin Dashboards", "Cloud Deploy"] },
  { id: "ecommerce", title: "E-commerce Development", description: "Shopify, WooCommerce and custom online stores engineered to sell.", features: ["Shopify", "WooCommerce", "Custom Stores", "Payments"] },
  { id: "ui-ux", title: "UI/UX Design", description: "Product design for web apps, SaaS and mobile apps that users understand instantly.", features: ["Prototypes", "Design Systems", "User Testing", "Figma"] },
  { id: "redesign", title: "Website Redesign & Fixes", description: "Audit, redesign, speed up or rescue your existing site or application.", features: ["Audits", "Speed Optimization", "Rescue Projects", "Migrations"] },
  { id: "hire-developers", title: "Hire Developers", description: "Vetted developers and designers by the project, hour or month.", features: ["Vetted Talent", "Flexible Terms", "Fast Start", "Managed for You"] }
];

// Services Section
function ServicesSection({ content }: { content: HomePageContent['services'] }) {
  const services = content.items.length > 0 ? content.items : defaultServices;
  
  return (
    <section id="services" className="relative py-16 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <AnimatedSection className="text-center mb-10 md:mb-20">
          <span className="text-cyan-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">What We Build</span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            {content.section_title || "Precision-Engineered"}
            <br />
            <span className="gradient-text">{content.section_subtitle || "Digital Solutions"}</span>
          </h2>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto px-2">
            {content.section_description || "Every solution we create is custom-built for maximum impact. No templates. No shortcuts. Only results."}
          </p>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {services.map((service, index) => (
            <AnimatedSection key={service.id || service.title} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -5, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative glass rounded-2xl md:rounded-3xl p-5 md:p-8 h-full overflow-hidden hover:glow-box"
              >
                {/* Hover Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10">
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 md:mb-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300">
                    {serviceIcons[index] || serviceIcons[0]}
                  </div>
                  <h3 className="font-display text-xl md:text-2xl font-bold mb-2 md:mb-3 group-hover:text-cyan-400 transition-colors">{service.title}</h3>
                  <p className="text-white/60 text-sm md:text-base mb-4 md:mb-6 leading-relaxed">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {(service.features || []).map((feature) => (
                      <span key={feature} className="px-3 py-1 text-xs text-cyan-400/80 bg-cyan-400/10 rounded-full border border-cyan-400/20">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

const defaultBenefits = [
  { metric: "1 Day", label: "Reply Time", description: "A real person replies within one business day with questions or a plan." },
  { metric: "$500+", label: "Websites From", description: "Transparent, fixed-price quotes — not vague hourly estimates." },
  { metric: "2-4 mo", label: "SaaS MVPs", description: "Idea to launched, revenue-ready subscription product." },
  { metric: "100%", label: "Code Ownership", description: "Code, designs and accounts transfer to you on final payment." },
  { metric: "1 Team", label: "Fully Managed", description: "Design, development and project management under one roof." }
];

// Why Chronolyte Section
function WhySection({ content }: { content: HomePageContent['why'] }) {
  const benefits = content.items.length > 0 ? content.items : defaultBenefits;
  
  return (
    <section id="why" className="relative py-16 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <AnimatedSection className="text-center mb-10 md:mb-20">
          <span className="text-cyan-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">Why Chronolyte</span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            {content.section_title || "Built Different."}
            <br />
            <span className="gradient-text">{content.section_subtitle || "Engineered Better."}</span>
          </h2>
        </AnimatedSection>
        
        <div className="grid md:grid-cols-5 gap-4">
          {benefits.map((benefit, index) => (
            <AnimatedSection key={benefit.label} delay={index * 0.1}>
              <motion.div
                whileHover={{ y: -10 }}
                className="group relative glass rounded-2xl p-6 text-center h-full overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <motion.span 
                    className="font-display text-4xl md:text-5xl font-bold gradient-text block mb-2"
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {benefit.metric}
                  </motion.span>
                  <h3 className="font-semibold text-white mb-2">{benefit.label}</h3>
                  <p className="text-sm text-white/50">{benefit.description}</p>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

const defaultSteps = [
  { step: "01", title: "Tell Us What You Want", description: "Answer three quick questions about your project. It takes about a minute." },
  { step: "02", title: "Get Your Free Plan", description: "Within one business day we reply with a recommended scope, timeline and fixed quote." },
  { step: "03", title: "Approve & Kick Off", description: "Happy with the plan? We agree milestones and start. Not for you? No obligation." },
  { step: "04", title: "See Progress, Launch, Grow", description: "Working demos every 1-2 weeks, then launch and ongoing support." }
];

// Process Section
function ProcessSection({ content }: { content: HomePageContent['process'] }) {
  const steps = content.steps.length > 0 ? content.steps : defaultSteps;
  
  return (
    <section id="process" className="relative py-16 md:py-32 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <AnimatedSection className="text-center mb-10 md:mb-20">
          <span className="text-cyan-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">The Process</span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            {content.section_title || "From Vision to"}
            <br />
            <span className="gradient-text">{content.section_subtitle || "Velocity"}</span>
          </h2>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto px-2">
            A battle-tested framework that transforms ideas into market-dominating products.
          </p>
        </AnimatedSection>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-cyan-500/50 via-blue-500/50 to-transparent hidden lg:block" />
          
          <div className="space-y-12 lg:space-y-0">
            {steps.map((step, index) => (
              <AnimatedSection key={step.step} delay={index * 0.15}>
                <div className={`lg:flex items-center gap-8 ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`lg:w-1/2 ${index % 2 === 0 ? 'lg:text-right lg:pr-16' : 'lg:pl-16'}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="glass rounded-2xl p-8 inline-block"
                    >
                      <span className="text-cyan-400 font-display text-sm font-bold">{step.step}</span>
                      <h3 className="font-display text-2xl font-bold mt-2 mb-3">{step.title}</h3>
                      <p className="text-white/60">{step.description}</p>
                    </motion.div>
                  </div>
                  
                  {/* Center Node */}
                  <div className="hidden lg:flex items-center justify-center absolute left-1/2 -translate-x-1/2" style={{ top: `${index * 20 + 10}%` }}>
                    <motion.div 
                      whileHover={{ scale: 1.3 }}
                      className="w-4 h-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 glow-box"
                    />
                  </div>
                  
                  <div className="lg:w-1/2" />
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Custom SVG Logo Components
const RocketLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10L60 35H40L50 10Z" fill="currentColor"/>
    <path d="M45 35H55V60C55 70 50 80 50 80C50 80 45 70 45 60V35Z" fill="currentColor" opacity="0.8"/>
    <circle cx="40" cy="65" r="3" fill="currentColor"/>
    <circle cx="60" cy="65" r="3" fill="currentColor"/>
    <path d="M35 60L30 70V80L40 75V60H35Z" fill="currentColor" opacity="0.6"/>
    <path d="M65 60L70 70V80L60 75V60H65Z" fill="currentColor" opacity="0.6"/>
  </svg>
);

const TargetLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="2"/>
    <circle cx="50" cy="50" r="32" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
    <circle cx="50" cy="50" r="18" fill="currentColor"/>
    <circle cx="50" cy="50" r="8" fill="white"/>
  </svg>
);

const StoreLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 40H80L75 85H25L20 40Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="35" y="50" width="12" height="20" fill="currentColor"/>
    <rect x="53" y="50" width="12" height="20" fill="currentColor"/>
    <path d="M30 40L35 25H65L70 40" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
);

const DiamondLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15L75 50L50 85L25 50L50 15Z" fill="currentColor"/>
    <path d="M50 35L65 50L50 65L35 50L50 35Z" fill="white"/>
  </svg>
);

const BoltLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 15L65 45H50L70 85L35 55H50L30 15L50 15Z" fill="currentColor"/>
  </svg>
);

const LaptopLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="20" width="70" height="50" rx="3" stroke="currentColor" strokeWidth="2"/>
    <rect x="20" y="25" width="60" height="40" fill="currentColor" opacity="0.3"/>
    <path d="M30 75H70M35 75L40 80H60L65 75" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const CartLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 30H25L35 65H70L78 35H30" stroke="currentColor" strokeWidth="2" fill="none"/>
    <circle cx="40" cy="75" r="4" fill="currentColor"/>
    <circle cx="65" cy="75" r="4" fill="currentColor"/>
  </svg>
);

const HeartLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 85C25 70 15 55 15 45C15 35 22 28 30 28C38 28 45 35 50 42C55 35 62 28 70 28C78 28 85 35 85 45C85 55 75 70 50 85Z" fill="currentColor"/>
  </svg>
);

const CoinsLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="35" cy="45" r="20" stroke="currentColor" strokeWidth="2"/>
    <text x="35" y="52" textAnchor="middle" fontSize="20" fill="currentColor" fontWeight="bold">$</text>
    <circle cx="65" cy="55" r="20" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
    <text x="65" y="62" textAnchor="middle" fontSize="20" fill="currentColor" fontWeight="bold" opacity="0.6">$</text>
  </svg>
);

const HouseLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 60L50 25L80 60V80H20V60Z" stroke="currentColor" strokeWidth="2" fill="none"/>
    <rect x="40" y="65" width="20" height="20" fill="currentColor" opacity="0.4"/>
    <rect x="30" y="55" width="12" height="12" fill="currentColor" opacity="0.3"/>
    <rect x="58" y="55" width="12" height="12" fill="currentColor" opacity="0.3"/>
  </svg>
);

const BookLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 25V75C25 78 27 80 30 80H70C73 80 75 78 75 75V25C75 22 73 20 70 20H30C27 20 25 22 25 25Z" stroke="currentColor" strokeWidth="2"/>
    <line x1="50" y1="20" x2="50" y2="80" stroke="currentColor" strokeWidth="1.5"/>
    <line x1="35" y1="35" x2="65" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
    <line x1="35" y1="45" x2="65" y2="45" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
    <line x1="35" y1="55" x2="65" y2="55" stroke="currentColor" strokeWidth="1" opacity="0.6"/>
  </svg>
);

const BuildingLogo = () => (
  <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="25" y="30" width="50" height="55" stroke="currentColor" strokeWidth="2"/>
    <rect x="32" y="38" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.4"/>
    <rect x="46" y="38" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.4"/>
    <rect x="60" y="38" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.4"/>
    <rect x="32" y="52" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.4"/>
    <rect x="46" y="52" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.4"/>
    <rect x="60" y="52" width="10" height="10" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.4"/>
    <rect x="42" y="72" width="16" height="13" stroke="currentColor" strokeWidth="1.5" fill="currentColor" opacity="0.3"/>
  </svg>
);

const logoComponents: Record<string, React.ReactNode> = {
  "Startups": <RocketLogo />,
  "Agencies": <TargetLogo />,
  "Local Business": <StoreLogo />,
  "SaaS Founders": <DiamondLogo />,
  "Entrepreneurs": <BoltLogo />,
  "SaaS & Tech": <LaptopLogo />,
  "E-commerce": <CartLogo />,
  "Healthcare": <HeartLogo />,
  "Finance": <CoinsLogo />,
  "Real Estate": <HouseLogo />,
  "Education": <BookLogo />,
  "Hospitality": <BuildingLogo />
};

const defaultIndustries = [
  { name: "Startups", description: "Turn an idea into a launched MVP without hiring a full team" },
  { name: "Local Business", description: "A professional website that brings in enquiries" },
  { name: "Agencies", description: "Add reliable developers when your roadmap outgrows your team" },
  { name: "SaaS Founders", description: "Plan, build and launch your subscription product" },
  { name: "Entrepreneurs", description: "Plain-English advice, one accountable team" }
];

// Industries Section
function IndustriesSection({ content }: { content: HomePageContent['industries'] }) {
  const industries = content.items.length > 0 
    ? content.items.map(item => ({
        name: item.name,
        description: "",
        icon: item.name
      }))
    : defaultIndustries.map(ind => ({ ...ind, icon: ind.name }));
  
  return (
    <section id="industries" className="relative py-16 md:py-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <AnimatedSection className="text-center mb-10 md:mb-20">
          <span className="text-cyan-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">Who We Serve</span>
          <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            {content.section_title || "Built for"}
            <br />
            <span className="gradient-text">{content.section_subtitle || "Visionaries"}</span>
          </h2>
        </AnimatedSection>
        
        <div className="grid grid-cols-2 md:flex md:flex-wrap justify-center gap-3 md:gap-4">
          {industries.map((industry, index) => (
            <AnimatedSection key={industry.name} delay={index * 0.1}>
              <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                className="glass rounded-xl md:rounded-2xl px-4 py-4 md:px-8 md:py-6 text-center min-w-0 md:min-w-[200px] group hover:glow-box transition-all duration-300"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-cyan-400 group-hover:text-white group-hover:scale-110 transition-all duration-300">
                  {logoComponents[industry.name] || logoComponents["Startups"]}
                </div>
                <h3 className="font-display font-bold text-sm md:text-lg mb-1 group-hover:text-cyan-400 transition-colors">{industry.name}</h3>
                {industry.description && <p className="text-xs md:text-sm text-white/50 hidden md:block">{industry.description}</p>}
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ content }: { content: HomePageContent['cta'] }) {
  return (
    <section id="cta" className="relative py-16 md:py-32 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-dark-900 via-dark-800 to-dark-900" />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,245,255,0.15) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 md:px-6 text-center">
        <AnimatedSection>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="glass-strong rounded-2xl md:rounded-3xl p-6 md:p-12 lg:p-16 glow-box"
          >
            <span className="text-cyan-400 text-xs md:text-sm font-semibold tracking-wider uppercase mb-3 md:mb-4 block">Ready to Lead?</span>
            <h2 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
              {content.headline || "Future-Proof Your Business"}
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto mb-6 md:mb-10 px-2">
              {content.description || "The businesses thriving in 2025 and beyond are building with AI today. Don't watch the future happen—create it."}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
              <Link to={content.button_link || "/contact"}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 50px rgba(0,245,255,0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-bold text-base md:text-lg text-black overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {content.button_text || "Start Building Now"}
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 md:px-10 py-4 md:py-5 rounded-full font-semibold text-white border border-white/20 hover:border-cyan-400/50 hover:bg-white/5 transition-all text-center"
                >
                  Schedule a Call
                </motion.button>
              </Link>
            </div>
            
            <p className="text-white/40 text-sm mt-8">
              Typically respond within 24 hours
            </p>
          </motion.div>
        </AnimatedSection>
      </div>
    </section>
  );
}

type SocialKey = 'twitter' | 'linkedin' | 'github' | 'facebook' | 'instagram' | 'youtube' | 'whatsapp';

const socialDefaults: Record<SocialKey, string> = {
  twitter: '',
  linkedin: '',
  github: '',
  facebook: 'https://facebook.com/chronolyte',
  instagram: 'https://instagram.com/chronolyte',
  youtube: '',
  whatsapp: CONTACT_WHATSAPP_URL
};

const socialIcons: Record<SocialKey, React.ReactNode> = {
  twitter: (
    <path d="M22 5.92c-.77.35-1.6.58-2.46.69a4.3 4.3 0 001.9-2.38 8.62 8.62 0 01-2.72 1.04 4.28 4.28 0 00-7.3 3.9 12.14 12.14 0 01-8.82-4.47 4.28 4.28 0 001.32 5.71 4.24 4.24 0 01-1.94-.54v.05a4.28 4.28 0 003.44 4.2 4.32 4.32 0 01-1.93.07 4.28 4.28 0 004 2.97 8.6 8.6 0 01-5.32 1.84c-.35 0-.7-.02-1.05-.06a12.15 12.15 0 006.57 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19-.01-.38-.02-.56A8.7 8.7 0 0022 5.92z" />
  ),
  linkedin: (
    <path d="M20 3H4a1 1 0 00-1 1v16a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1zM8.34 18.34H5.67V10h2.67v8.34zM7 8.72a1.55 1.55 0 110-3.1 1.55 1.55 0 010 3.1zm11.34 9.62h-2.66v-4.5c0-1.07-.02-2.45-1.49-2.45-1.5 0-1.73 1.16-1.73 2.37v4.58h-2.66V10h2.55v1.14h.04c.36-.69 1.24-1.42 2.55-1.42 2.73 0 3.23 1.8 3.23 4.14v4.48z" />
  ),
  github: (
    <path d="M12 .5a12 12 0 00-3.79 23.4c.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.07-3.34.73-4.04-1.61-4.04-1.61-.55-1.4-1.35-1.77-1.35-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.83 1.32 3.52 1.01.11-.78.42-1.32.76-1.62-2.67-.3-5.48-1.33-5.48-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.5.12-3.12 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.62.24 2.82.12 3.12.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.9-.01 3.29 0 .32.22.7.83.58A12 12 0 0012 .5z" />
  ),
  facebook: (
    <path d="M13.5 9H15V6h-2a3 3 0 00-3 3v2H8v3h2v6h3v-6h2.06L15 11h-2v-.9c0-.7.23-1.1.88-1.1z" />
  ),
  instagram: (
    <path d="M7 3h10a4 4 0 014 4v10a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm0 2a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H7zm11 1.5a1 1 0 11-2 0 1 1 0 012 0zM12 8.5A3.5 3.5 0 1112 15a3.5 3.5 0 010-7zm0 2a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  ),
  youtube: (
    <path d="M21.8 8.2s-.2-1.4-.8-2c-.8-.8-1.6-.8-2-0.9C16.4 5 12 5 12 5h0s-4.4 0-7 .3c-.4 0-1.2.1-2 .9-.6.6-.8 2-.8 2S2 9.8 2 11.4v1.1c0 1.6.2 3.2.2 3.2s.2 1.4.8 2c.8.8 1.8.8 2.2.9 1.6.1 6.8.3 6.8.3s4.4 0 7-.3c.4-.1 1.2-.1 2-.9.6-.6.8-2 .8-2s.2-1.6.2-3.2v-1.1c0-1.6-.2-3.2-.2-3.2zM10 14.7V8.7l5.2 3-5.2 3z" />
  ),
  whatsapp: (
    <path d="M20 12.1a8 8 0 10-14.1 5L4 21l4-1a8 8 0 0012-7.9zm-4.1 2.7c-.17-.09-1-.53-1.16-.6-.15-.06-.26-.09-.37.08-.11.17-.43.6-.52.72-.09.12-.19.13-.36.04-.17-.09-.7-.26-1.33-.84-.49-.44-.82-.98-.92-1.15-.1-.17-.01-.26.08-.35.08-.08.17-.21.25-.31.08-.1.11-.17.17-.29.06-.12.03-.22-.02-.31-.05-.09-.37-.9-.51-1.24-.14-.33-.28-.29-.37-.3h-.32c-.12 0-.31.04-.47.22-.16.17-.61.6-.61 1.46 0 .86.63 1.7.72 1.82.09.12 1.23 1.88 3 2.63.42.18.75.29 1.01.37.42.13.8.11 1.1.07.34-.05 1-.41 1.14-.82.14-.41.14-.76.1-.82-.04-.06-.15-.09-.32-.18z" />
  )
};

// Footer
function Footer() {
  const [socialLinks, setSocialLinks] = useState<Record<SocialKey, string>>(socialDefaults);
  const [siteSettings, setSiteSettings] = useState({
    contact_email: 'contact@chronolyte.com',
    contact_phone: CONTACT_PHONE_DISPLAY,
    footer_copyright: '© 2025 Chronolyte. All rights reserved.',
    footer_tagline: 'We bend time with AI.',
    footer_show_social: true
  });

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        // Load site settings
        const settingsRes = await fetch('/backend/api/settings.php?action=get&key=site_settings');
        if (settingsRes.ok) {
          const json = await settingsRes.json();
          if (json?.success && json?.data?.value) {
            const parsed = typeof json.data.value === 'string' ? JSON.parse(json.data.value) : json.data.value;
            if (mounted) {
              setSiteSettings(prev => ({ ...prev, ...parsed }));
              // Extract social links from site settings
              const socials: Record<string, string> = {};
              if (parsed.social_twitter) socials.twitter = parsed.social_twitter;
              if (parsed.social_linkedin) socials.linkedin = parsed.social_linkedin;
              if (parsed.social_github) socials.github = parsed.social_github;
              if (parsed.social_facebook) socials.facebook = parsed.social_facebook;
              if (parsed.social_instagram) socials.instagram = parsed.social_instagram;
              if (parsed.social_youtube) socials.youtube = parsed.social_youtube;
              if (parsed.social_whatsapp) socials.whatsapp = parsed.social_whatsapp;
              setSocialLinks(prev => ({ ...prev, ...socials }));
            }
          }
        }
      } catch (err) {
        console.warn('Settings fetch failed', err);
      }
    };
    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  const socialEntries = Object.entries(socialLinks).filter(([_, url]) => Boolean(url));

  return (
    <footer className="relative py-10 md:py-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        {/* Contact Info Row */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 mb-8 text-sm text-white/60">
          <a href={`mailto:${siteSettings.contact_email}`} className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {siteSettings.contact_email}
          </a>
          <a href={CONTACT_PHONE_TEL} className="flex items-center gap-2 hover:text-cyan-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {CONTACT_PHONE_DISPLAY}
          </a>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="flex items-center gap-2 md:gap-3">
            <HourglassLogo className="w-8 h-8 md:w-10 md:h-10" />
            <span className="font-display font-bold text-base md:text-lg flex items-center text-white" style={{ textShadow: '0 0 8px rgba(0,229,255,0.3)' }}>
              CHR
              <span className="relative inline-flex items-center justify-center w-5 h-5 mx-0.5">
                <span className="absolute inset-[-2px] rounded-full bg-cyan-400/20 blur-sm"></span>
                <span className="absolute inset-0 rounded-full border-2 border-cyan-400" style={{ boxShadow: '0 0 8px rgba(0,229,255,0.8), inset 0 0 4px rgba(0,229,255,0.3)' }}></span>
                <span className="absolute inset-[2px] rounded-full border border-cyan-300/40"></span>
                <span className="absolute w-6 h-[1.5px] bg-gradient-to-r from-transparent via-white to-transparent"></span>
                <span className="absolute h-6 w-[1.5px] bg-gradient-to-b from-transparent via-white/80 to-transparent"></span>
                <span className="absolute w-1.5 h-1.5 rounded-full bg-white" style={{ boxShadow: '0 0 4px #fff' }}></span>
              </span>
              NOLYTE
            </span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-white/50 md:gap-x-6 md:text-sm">
            <Link to="/services" className="hover:text-cyan-400 transition-colors">Services</Link>
            <Link to="/industries" className="hover:text-cyan-400 transition-colors">Industries</Link>
            <Link to="/locations" className="hover:text-cyan-400 transition-colors">Locations</Link>
            <Link to="/portfolio" className="hover:text-cyan-400 transition-colors">Portfolio</Link>
            <Link to="/about" className="hover:text-cyan-400 transition-colors">About</Link>
            <Link to="/blog" className="hover:text-cyan-400 transition-colors">Guides</Link>
            <Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link>
          </div>
          
          {siteSettings.footer_show_social && socialEntries.length > 0 && (
            <div className="flex items-center gap-3 md:gap-4">
              {socialEntries.map(([social, url]) => (
                <motion.a
                  key={social}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-8 h-8 md:w-10 md:h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors"
                >
                  <span className="sr-only">{social}</span>
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    {socialIcons[social as SocialKey]}
                  </svg>
                </motion.a>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 md:mt-12 pt-6 md:pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4 text-xs md:text-sm text-white/30">
          <p>{siteSettings.footer_copyright}</p>
          <div className="flex items-center gap-4">
            <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
            <Link to="/refunds" className="hover:text-cyan-400 transition-colors">Refunds</Link>
          </div>
          <p>{siteSettings.footer_tagline}</p>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN SITE
// ============================================

const defaultHomeContent: HomePageContent = {
  hero: {
    badge_text: "Start your project free",
    headline_1: "Hire Web Designers",
    headline_2: "& Developers",
    subheadline: "Tell us what you want to build — get a free plan, timeline and fixed quote within one business day.\nNo obligation, no card required.",
    cta_primary_text: "Start your project free",
    cta_primary_link: "/contact",
    cta_secondary_text: "See pricing",
    cta_secondary_link: "/pricing"
  },
  services: {
    section_title: "Websites, Apps &",
    section_subtitle: "SaaS Products",
    section_description: "One team for design, development and launch — delivered on fixed quotes with demos every 1-2 weeks.",
    items: []
  },
  why: {
    section_title: "Marketplace Flexibility,",
    section_subtitle: "Studio Accountability",
    items: []
  },
  process: {
    section_title: "From Idea to",
    section_subtitle: "Launch in 4 Steps",
    steps: []
  },
  industries: {
    section_title: "Who We",
    section_subtitle: "Help",
    items: []
  },
  cta: {
    headline: "Ready to Build Something Great?",
    description: "Tell us about your project and get a free plan, timeline and quote within one business day.",
    button_text: "Start your project free",
    button_link: "/contact"
  }
};

export function MainSite() {
  const [homeContent, setHomeContent] = useState<HomePageContent>(defaultHomeContent);

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
  }, []);

  return (
    <>
      <SiteNavigation />
      <div className="relative min-h-screen bg-dark-900 text-white overflow-x-hidden">
        <GlowOrbs />
        <NoiseOverlay />
        <GridBackground />
        <main>
        <HeroSection content={homeContent.hero} />
        <ServicesSection content={homeContent.services} />
        <WhySection content={homeContent.why} />
        <ProcessSection content={homeContent.process} />
        <IndustriesSection content={homeContent.industries} />
        <FeaturedBlogs limit={3} />
        <CTASection content={homeContent.cta} />
      </main>
        <Footer />
      </div>
    </>
  );
}
