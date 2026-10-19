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
  const features = Array.isArray(tier.features) ? tier.features : typeof tier.features === 'string' ? JSON.parse(tier.features) : [];
  const isMostPopular = isPopular || tier.is_popular || tier.badge === "Most Popular";
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
          Start Your Project
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

export function Pricing() {
  const [openFAQs, setOpenFAQs] = useState<Record<number, boolean>>({});
  const [pricingData, setPricingData] = useState<Record<string, any[]>>({});
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
            if (plan.category === 'websites') grouped.websites.push(plan);
            else if (plan.category === 'ai-tools') grouped.aitools.push(plan);
            else if (plan.category === 'saas') grouped.saas.push(plan);
            else if (plan.category === 'automation') grouped.automation.push(plan);
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
    {
      question: "How long does it take to complete my project?",
      answer: "Timeline varies by project complexity. Website projects typically take 2-4 weeks, AI tools 3-6 weeks, and SaaS platforms 6-12 weeks. We provide a detailed timeline during the discovery phase."
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
              Choose the perfect plan for your project. All plans include 14 days of free post-launch support.
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
