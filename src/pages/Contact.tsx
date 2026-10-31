import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Mail, Phone, Send } from 'lucide-react';
import { ScheduleCall } from '../components/ScheduleCall';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, CONTACT_WHATSAPP_URL } from '../constants/siteContact.js';
import { PageHero, SectionHead, Sheet } from '../components/editorial/EditorialPage';

interface ContactContent {
  hero: {
    badge_text: string;
    headline: string;
    description: string;
  };
  info: {
    email: string;
    phone: string;
    response_time: string;
  };
  form: {
    title: string;
    description: string;
    success_message: string;
  };
}

const defaultContactContent: ContactContent = {
  hero: {
    badge_text: "Get In Touch",
    headline: "Let's Build Together",
    description: "Ready to transform your vision into reality? We'd love to hear from you."
  },
  info: {
    email: "hello@chronolyte.com",
    phone: CONTACT_PHONE_DISPLAY,
    response_time: "We typically respond within 24 hours"
  },
  form: {
    title: "Send Us a Message",
    description: "Fill out the form below and we'll get back to you as soon as possible.",
    success_message: "Thank you! Your message has been sent. We'll be in touch soon."
  }
};

export function Contact() {
  const [pageContent, setPageContent] = useState<ContactContent>(defaultContactContent);
  const [isScheduleCallOpen, setIsScheduleCallOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    service: '',
    budgetOption: '',
    customBudget: '',
    message: ''
  });
  
  useEffect(() => {
    fetch('/backend/api/settings.php?action=get&key=contact_page_content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.value) {
          const parsed = typeof data.data.value === 'string' ? JSON.parse(data.data.value) : data.data.value;
          setPageContent({ ...defaultContactContent, ...parsed });
        }
      })
      .catch(err => console.error('Failed to load contact content:', err));
  }, []);

  const budgetsByService = {
    website: [
      { label: 'Starter Business Website', value: 600 },
      { label: 'Pro Business Website', value: 950 },
      { label: 'AI-Enhanced Website', value: 1400 },
      { label: 'Custom Web Platform', value: 2500 }
    ],
    saas: [
      { label: 'MVP SaaS Build', value: 3000 },
      { label: 'Growth SaaS Platform', value: 6500 },
      { label: 'Scale SaaS System', value: 9500 },
      { label: 'Enterprise SaaS', value: 15000 }
    ],
    automation: [
      { label: 'Basic Automation', value: 600 },
      { label: 'Smart Automation', value: 1500 },
      { label: 'Automation Suite', value: 3000 }
    ],
    'ai-tools': [
      { label: 'AI Tool Starter', value: 900 },
      { label: 'AI Tool Pro', value: 2500 },
      { label: 'AI Tool Scale', value: 5000 },
      { label: 'AI Tool Enterprise', value: 10000 }
    ],
    other: []
  };

  const getMinBudget = (service: string) => {
    const options = budgetsByService[service as keyof typeof budgetsByService];
    if (!options || options.length === 0) return 0;
    return Math.min(...options.map(opt => opt.value));
  };
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name || !formData.email || !formData.service) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.service === 'other' && !formData.customBudget) {
      setError('Please enter a budget amount');
      return;
    }

    if (formData.service !== 'other' && !formData.budgetOption && !formData.customBudget) {
      setError('Please select or enter a budget');
      return;
    }

    if (formData.customBudget) {
      const amount = parseFloat(formData.customBudget);
      if (isNaN(amount) || amount < 0) {
        setError('Please enter a valid budget amount');
        return;
      }
      const minBudget = getMinBudget(formData.service);
      if (formData.service !== 'other' && amount < minBudget) {
        setError(`Budget must be at least $${minBudget}`);
        return;
      }
    }

    setIsSubmitting(true);
    
    try {
      const budget = formData.customBudget || formData.budgetOption;
      const selectedOption = budgetsByService[formData.service as keyof typeof budgetsByService].find(
        opt => opt.value.toString() === formData.budgetOption
      )?.label || 'Custom';

      const serviceNames: Record<string, string> = {
        website: 'Website Development',
        saas: 'SaaS Development',
        automation: 'AI Automation',
        'ai-tools': 'Custom AI Tools',
        other: 'Other Services'
      };

      const response = await fetch('/backend/api/leads.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          service_interested: serviceNames[formData.service],
          budget: budget,
          notes: `Service Type: ${serviceNames[formData.service]}\nPackage Selected: ${selectedOption}\nProject Details: ${formData.message}`,
          status: 'new',
          source: 'contact-form'
        })
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({ name: '', email: '', phone: '', company: '', service: '', budgetOption: '', customBudget: '', message: '' });
      } else {
        const errData = await response.json().catch(() => null);
        setError(errData?.error || errData?.message || 'Failed to submit form. Please try again.');
      }
    } catch (err) {
      setError('Failed to submit form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'service') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        budgetOption: '',
        customBudget: ''
      }));
    } else if (name === 'budgetOption') {
      setFormData(prev => ({
        ...prev,
        budgetOption: value,
        customBudget: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    setError('');
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: "Email",
      value: "hello@chronolyte.com",
      href: "mailto:hello@chronolyte.com"
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      title: "Phone",
      value: CONTACT_PHONE_DISPLAY,
      href: CONTACT_PHONE_TEL
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Response Time",
      value: "Within 24 hours",
      href: null
    }
  ];

  const budgetOptions = formData.service && budgetsByService[formData.service as keyof typeof budgetsByService]
    ? budgetsByService[formData.service as keyof typeof budgetsByService]
    : [];

  return (
    <>
      <PageHero
        eyebrow={pageContent.hero.badge_text}
        title={<>Let's build <em>together</em></>}
        lede={pageContent.hero.description}
        actions={
          <>
            <a href="#contact-form" className="ed-btn">Send a message <ArrowRight className="h-4 w-4" /></a>
            <button type="button" onClick={() => setIsScheduleCallOpen(true)} className="ed-btn ed-btn--ghost">
              <Calendar className="h-4 w-4" /> Schedule a call
            </button>
          </>
        }
        meta={
          <>
            <span>Replies within one business day</span>
            <span>100% free project plan</span>
            <span>Working worldwide</span>
          </>
        }
      />

      <Sheet tone="lime">
        <div className="grid gap-4 md:grid-cols-3">
          {contactInfo.map((info, index) => (
            <motion.div key={info.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              {info.href ? (
                <a href={info.href} className="ed-card h-full" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.9rem', textDecoration: 'none' }}>
                  <span className="ed-icon-badge" style={{ marginBottom: 0 }}>{info.icon}</span>
                  <span>
                    <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5c6b52' }}>{info.title}</span>
                    <span style={{ display: 'block', marginTop: '0.2rem', fontWeight: 700, color: '#26312a' }}>{info.value}</span>
                  </span>
                </a>
              ) : (
                <div className="ed-card h-full" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.9rem' }}>
                  <span className="ed-icon-badge" style={{ marginBottom: 0 }}>{info.icon}</span>
                  <span>
                    <span style={{ display: 'block', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#5c6b52' }}>{info.title}</span>
                    <span style={{ display: 'block', marginTop: '0.2rem', fontWeight: 700, color: '#26312a' }}>{info.value}</span>
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Sheet>

      <Sheet tone="paper" id="contact-form">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.4fr] lg:items-start">
          <div>
            <SectionHead
              rubric={pageContent.form.title}
              number="02 / 03"
              title={<>Tell us about <em>the project</em></>}
              lede={pageContent.form.description}
            />
            <div style={{ display: 'grid', gap: '0.55rem', marginTop: '1.4rem', fontSize: '0.88rem', color: '#3e4c43' }}>
              <a href={`mailto:hello@chronolyte.com`} className="ed-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}><Mail className="h-4 w-4" /> hello@chronolyte.com</a>
              <a href={CONTACT_PHONE_TEL} className="ed-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem' }}><Phone className="h-4 w-4" /> {CONTACT_PHONE_DISPLAY}</a>
              <a href={CONTACT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="ed-link">WhatsApp {CONTACT_PHONE_DISPLAY}</a>
            </div>
            <p className="ed-copy" style={{ fontSize: '0.82rem', marginTop: '1.2rem' }}>
              Prefer a structured brief? <Link to="/pricing" className="ed-link">Pick a package</Link> or use the free project plan on the homepage.
            </p>
          </div>

          <div className="ed-card" style={{ padding: 'clamp(20px, 3vw, 34px)' }}>
            {submitted ? (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{ width: 58, height: 58, borderRadius: '50%', background: '#c5de97', border: '2px solid #7b182a', display: 'grid', placeItems: 'center', margin: '0 auto 1rem' }}>
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="#7b182a" strokeWidth={2.4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
                <h3 className="ed-title ed-title--xs">Message sent!</h3>
                <p className="ed-copy" style={{ marginTop: '0.6rem' }}>{pageContent.form.success_message || "Thank you for reaching out. We'll get back to you within 24 hours."}</p>
                <button type="button" onClick={() => setSubmitted(false)} className="ed-btn ed-btn--ghost ed-btn--sm" style={{ marginTop: '1.2rem' }}>Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="ed-field">
                    <label htmlFor="name" className="ed-label">Your name *</label>
                    <input type="text" id="name" name="name" required value={formData.name} onChange={handleChange} className="ed-input" placeholder="John Doe" />
                  </div>
                  <div className="ed-field">
                    <label htmlFor="email" className="ed-label">Email address *</label>
                    <input type="email" id="email" name="email" required value={formData.email} onChange={handleChange} className="ed-input" placeholder="john@company.com" />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="ed-field">
                    <label htmlFor="phone" className="ed-label">Phone number</label>
                    <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} className="ed-input" placeholder="+1 (555) 123-4567" />
                  </div>
                  <div className="ed-field">
                    <label htmlFor="company" className="ed-label">Company name</label>
                    <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} className="ed-input" placeholder="Acme Inc." />
                  </div>
                </div>

                <div className="ed-field">
                  <label htmlFor="service" className="ed-label">Service interested in *</label>
                  <select id="service" name="service" required value={formData.service} onChange={handleChange} className="ed-select">
                    <option value="">Select a service</option>
                    <option value="saas">SaaS Development</option>
                    <option value="website">Website Development</option>
                    <option value="automation">AI Automation</option>
                    <option value="ai-tools">Custom AI Tools</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <span className="ed-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Project budget</span>
                  {budgetOptions.length > 0 && (
                    <div style={{ display: 'grid', gap: '0.4rem', marginBottom: '0.7rem' }}>
                      {budgetOptions.map((option) => (
                        <label key={option.value} className={`ed-choice ${formData.budgetOption === option.value.toString() ? 'ed-choice--active' : ''}`} style={{ cursor: 'pointer' }}>
                          <input type="radio" name="budgetOption" value={option.value.toString()} checked={formData.budgetOption === option.value.toString()} onChange={handleChange} className="ed-check" />
                          <span style={{ flex: 1, fontSize: '0.88rem', color: '#26312a' }}>{option.label}</span>
                          <span style={{ fontWeight: 700, color: '#7b182a' }}>${option.value.toLocaleString()}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <div className="ed-field">
                    <label htmlFor="customBudget" className="ed-label" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500 }}>
                      Or enter a custom amount {getMinBudget(formData.service) > 0 && `(minimum: $${getMinBudget(formData.service)})`}
                    </label>
                    <input id="customBudget" type="number" name="customBudget" value={formData.customBudget} onChange={handleChange} className="ed-input" placeholder="Enter amount" min="0" />
                  </div>
                </div>

                {error && <div role="alert" className="ed-alert">{error}</div>}

                <div className="ed-field">
                  <label htmlFor="message" className="ed-label">Project details *</label>
                  <textarea id="message" name="message" required rows={5} value={formData.message} onChange={handleChange} className="ed-textarea" placeholder="Tell us about your project..." />
                </div>

                <button type="submit" disabled={isSubmitting} className="ed-btn" style={{ width: '100%', opacity: isSubmitting ? 0.6 : 1 }}>
                  {isSubmitting ? 'Sending…' : <><Send className="h-4 w-4" /> Send message</>}
                </button>
                <p style={{ margin: 0, fontSize: '0.74rem', color: '#5f6d62', textAlign: 'center' }}>
                  By sending this form you agree to our <Link to="/privacy" className="ed-link">privacy policy</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </Sheet>

      <Sheet tone="cherry">
        <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-center">
          <div>
            <p className="ed-rubric">Prefer to talk?<span className="ed-rubric__num">03 / 03</span></p>
            <h2 className="ed-title ed-title--sm" style={{ marginTop: '0.5rem' }}>A real person, <em>not a bot</em></h2>
            <p className="ed-lede">Schedule a call and we'll talk through scope, timeline and budget — or message us on WhatsApp for a quick answer.</p>
          </div>
          <div className="ed-btn-row">
            <button type="button" onClick={() => setIsScheduleCallOpen(true)} className="ed-btn ed-btn--onDark">
              <Calendar className="h-4 w-4" /> Schedule a call
            </button>
            <a href={CONTACT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn--ghostOnDark">
              WhatsApp {CONTACT_PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </Sheet>

      <ScheduleCall
        isOpen={isScheduleCallOpen}
        onClose={() => setIsScheduleCallOpen(false)}
      />
    </>
  );
}
