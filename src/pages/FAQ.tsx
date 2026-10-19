import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';

// FAQ Item Component
function FAQItem({ question, answer, isOpen, onClick }: { 
  question: string; 
  answer: string; 
  isOpen: boolean; 
  onClick: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl overflow-hidden"
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left"
      >
        <h3 className="font-semibold text-lg pr-4">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0"
        >
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-5">
              <p className="text-white/60 leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  faqs: FAQItem[];
}

interface FAQContent {
  hero: {
    badge_text: string;
    headline: string;
    description: string;
  };
  categories: FAQCategory[];
  cta: {
    headline: string;
    description: string;
    button_text: string;
    button_link: string;
  };
}

const defaultContent: FAQContent = {
  hero: {
    badge_text: "FAQ",
    headline: "Frequently Asked Questions",
    description: "Got questions? We've got answers. If you can't find what you're looking for, feel free to reach out."
  },
  categories: [
    {
      title: "General Questions",
      faqs: [
        { question: "What services does Chronolyte offer?", answer: "We specialize in four core areas: SaaS product development, premium website design, AI automation solutions, and custom AI tool development." },
        { question: "How long does a typical project take?", answer: "Project timelines vary: Websites 2-4 weeks, Automation 1-3 weeks, SaaS 6-12 weeks, AI tools 4-8 weeks." },
        { question: "Do you work with clients worldwide?", answer: "Yes! We work with clients globally through video calls, email, and project management tools." },
        { question: "What makes Chronolyte different?", answer: "We leverage AI to deliver projects up to 10x faster without sacrificing quality. Everything is custom-built." }
      ]
    },
    {
      title: "Pricing & Payments",
      faqs: [
        { question: "How much do your services cost?", answer: "Pricing starts at $3,000 for automation, $5,000 for websites, $10,000 for AI tools, and $15,000 for SaaS products." },
        { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, and other payment methods through our secure payment processor." },
        { question: "Do you offer payment plans?", answer: "Yes, for larger projects we offer milestone-based payment plans." },
        { question: "Can I get a refund?", answer: "We offer a 14-day satisfaction guarantee for new purchases. Please review our Refund Policy for details." }
      ]
    }
  ],
  cta: {
    headline: "Still Have Questions?",
    description: "We're here to help! Reach out and we'll get back to you within 24 hours.",
    button_text: "Contact Us",
    button_link: "/contact"
  }
};

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [content, setContent] = useState<FAQContent>(defaultContent);
  
  useEffect(() => {
    fetch('/backend/api/settings.php?action=get&key=faq_content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.value) {
          const parsed = typeof data.data.value === 'string' ? JSON.parse(data.data.value) : data.data.value;
          setContent({ ...defaultContent, ...parsed });
        }
      })
      .catch(err => console.error('Failed to load FAQ content:', err));
  }, []);

  const categories = content.categories;

  // Flatten FAQs with category info for tracking open state
  const allFaqs = categories.flatMap((cat, catIndex) => 
    cat.faqs.map((faq, faqIndex) => ({
      ...faq,
      category: cat.title,
      globalIndex: categories.slice(0, catIndex).reduce((acc, c) => acc + c.faqs.length, 0) + faqIndex
    }))
  );

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <SiteNavigation />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">{content.hero.badge_text}</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {content.hero.headline.includes('Questions') ? (
                <>Frequently Asked <span className="gradient-text">Questions</span></>
              ) : (
                content.hero.headline
              )}
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              {content.hero.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          {categories.map((category, catIndex) => {
            const startIndex = categories.slice(0, catIndex).reduce((acc, c) => acc + c.faqs.length, 0);
            
            return (
              <div key={category.title} className="mb-12">
                <h2 className="font-display text-2xl font-bold mb-6 text-cyan-400">{category.title}</h2>
                <div className="space-y-4">
                  {category.faqs.map((faq, faqIndex) => {
                    const globalIndex = startIndex + faqIndex;
                    return (
                      <FAQItem
                        key={globalIndex}
                        question={faq.question}
                        answer={faq.answer}
                        isOpen={openIndex === globalIndex}
                        onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Still Have Questions CTA */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-strong rounded-3xl p-12 glow-box"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              {content.cta.headline.includes('Questions') ? (
                <>Still Have <span className="gradient-text">Questions?</span></>
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
                href={CONTACT_PHONE_TEL}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-semibold text-white border border-white/20 hover:border-cyan-400/50 hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
