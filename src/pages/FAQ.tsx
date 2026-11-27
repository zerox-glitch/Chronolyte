import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, Phone } from 'lucide-react';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import { CtaBand, PageHero, SectionHead, Sheet } from '../components/editorial/EditorialPage';

function FAQItem({ question, answer, isOpen, onClick }: {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className="ed-card ed-card--flat" style={{ padding: 0, overflow: 'hidden' }}>
      <button
        onClick={onClick}
        aria-expanded={isOpen}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem', padding: '1.05rem 1.2rem', background: 'transparent', border: 0, cursor: 'pointer', textAlign: 'left' }}
      >
        <h3 style={{ margin: 0, fontFamily: 'var(--sans)', fontSize: '1.02rem', fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text)' }}>{question}</h3>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          style={{ flex: 'none', width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--accent-ink)' }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <p className="ed-copy" style={{ padding: '0 1.2rem 1.15rem', margin: 0, fontSize: '0.94rem', borderTop: '1px solid var(--line)', paddingTop: '0.9rem' }}>
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FAQQuestion {
  question: string;
  answer: string;
}

interface FAQCategory {
  title: string;
  faqs: FAQQuestion[];
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
    badge_text: 'FAQ',
    headline: 'Frequently Asked Questions',
    description: "Got questions? We've got answers. If you can't find what you're looking for, feel free to reach out."
  },
  categories: [
    {
      title: 'General Questions',
      faqs: [
        { question: 'What services does Chronolyte offer?', answer: 'We specialize in four core areas: SaaS product development, premium website design, AI automation solutions, and custom AI tool development.' },
        { question: 'How long does a typical project take?', answer: 'Timelines depend on the exact features and scope. Review the current delivery estimate beside each package on our pricing page.' },
        { question: 'Do you work with clients worldwide?', answer: 'Yes! We work with clients globally through video calls, email, and project management tools.' },
        { question: 'What makes Chronolyte different?', answer: 'We leverage AI to deliver projects up to 10x faster without sacrificing quality. Everything is custom-built.' }
      ]
    },
    {
      title: 'Pricing & Payments',
      faqs: [
        { question: 'How much do your services cost?', answer: 'Current website, software and automation packages are listed on our pricing page. Request a written quote for your project.' },
        { question: 'What payment methods do you accept?', answer: 'We accept all major credit cards, PayPal, and other payment methods through our secure payment processor.' },
        { question: 'Do you offer payment plans?', answer: 'Yes, for larger projects we offer milestone-based payment plans.' },
        { question: 'Can I get a refund?', answer: 'We offer a 14-day satisfaction guarantee for new purchases. Please review our Refund Policy for details.' }
      ]
    }
  ],
  cta: {
    headline: 'Still Have Questions?',
    description: "We're here to help! Reach out and we'll get back to you within 24 hours.",
    button_text: 'Contact Us',
    button_link: '/contact'
  }
};

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [content, setContent] = useState<FAQContent>(defaultContent);
  const [planSummary, setPlanSummary] = useState('See the latest service packages, prices and inclusions on our pricing page.');

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
    fetch('/api/pricing?action=list', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Pricing API unavailable')))
      .then(result => {
        const plans = (Array.isArray(result.data) ? result.data : []).filter((plan: any) => Number(plan.active) !== 0);
        if (!plans.length) return;
        const summary = plans.map((plan: any) => {
          const price = plan.price_display || ('From ' + String.fromCharCode(36) + Number(plan.price || 0).toLocaleString('en-US'));
          return plan.name + ': ' + price;
        }).join('; ');
        setPlanSummary('Our current published starting prices are ' + summary + '. Final quotes depend on the agreed scope. See the pricing page for features and delivery estimates.');
      })
      .catch(() => {});
  }, []);

  const categories = content.categories.map(category => ({
    ...category,
    faqs: category.faqs.map(faq => {
      const pricingQuestion = /how much|pricing|prices|how much do.*cost|what does.*cost|cost of/i.test(faq.question);
      return pricingQuestion ? { ...faq, answer: planSummary } : faq;
    })
  }));

  return (
    <>
      <PageHero
        study="signal"
        eyebrow={content.hero.badge_text}
        title={<>Frequently asked <em>questions</em></>}
        lede={content.hero.description}
        actions={
          <>
            <Link to="/contact" className="ed-btn">Ask us anything</Link>
            <a href={CONTACT_PHONE_TEL} className="ed-btn ed-btn--ghost"><Phone className="h-4 w-4" /> {CONTACT_PHONE_DISPLAY}</a>
          </>
        }
        meta={
          <>
            <span>Replies within one business day</span>
            <span>No obligation</span>
            <span>Worldwide</span>
          </>
        }
      />

      <Sheet tone="paper">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr] lg:items-start">
          <div className="faq-index">
            <p className="ed-rubric">Sections</p>
            <ol style={{ listStyle: 'none', margin: '0.8rem 0 0', padding: 0, display: 'grid', gap: '0.5rem' }}>
              {categories.map((category, catIndex) => (
                <li key={category.title}>
                  <a href={`#faq-${catIndex + 1}`} className="ed-link" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>
                    {String(catIndex + 1).padStart(2, '0')} — {category.title}
                  </a>
                </li>
              ))}
            </ol>
            <p className="ed-copy" style={{ fontSize: '0.82rem', marginTop: '1.4rem' }}>
              Can’t find it? <Link to="/contact" className="ed-link">Send us a question</Link> and a real person replies.
            </p>
          </div>

          <div>
            {categories.map((category, catIndex) => {
              const startIndex = categories.slice(0, catIndex).reduce((acc, c) => acc + c.faqs.length, 0);
              return (
                <div key={category.title} id={`faq-${catIndex + 1}`} style={{ marginBottom: 'clamp(26px, 4vw, 44px)', scrollMarginTop: 110 }}>
                  <SectionHead
                    rubric={`0${catIndex + 1} / 0${categories.length}`}
                    title={<span className="ed-title--xs" style={{ display: 'block', textTransform: 'none' }}>{category.title}</span>}
                  />
                  <div style={{ display: 'grid', gap: '0.7rem' }}>
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
        </div>
      </Sheet>

      <CtaBand
        eyebrow="Still curious?"
        title={<>Still have <em>questions?</em></>}
        description={content.cta.description}
        primaryTo={content.cta.button_link}
        primaryLabel={content.cta.button_text}
        secondaryTo="/pricing"
        secondaryLabel="See pricing"
        note="No sales calls unless you ask for one."
      />
    </>
  );
}
