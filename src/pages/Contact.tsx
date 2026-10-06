import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ScheduleCall } from '../components/ScheduleCall';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, CONTACT_WHATSAPP_URL } from '../constants/siteContact.js';

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
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">{pageContent.hero.badge_text}</span>
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              {pageContent.hero.headline.includes('Together') ? (
                <>Let's Build <span className="gradient-text">Together</span></>
              ) : (
                pageContent.hero.headline
              )}
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto">
              {pageContent.hero.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-8 px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {contactInfo.map((info, index) => (
              <motion.div
                key={info.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {info.href ? (
                  <a
                    href={info.href}
                    className="glass rounded-2xl p-6 flex items-center gap-4 hover:border-cyan-400/50 transition-colors block"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">{info.title}</p>
                      <p className="text-white font-semibold">{info.value}</p>
                    </div>
                  </a>
                ) : (
                  <div className="glass rounded-2xl p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-white/50 text-sm">{info.title}</p>
                      <p className="text-white font-semibold">{info.value}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-3xl p-8 md:p-12"
          >
            {submitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-display text-2xl font-bold mb-4">Message Sent!</h3>
                <p className="text-white/60 mb-6">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-cyan-400 hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white/70 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-white/70 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-white/70 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-white/70 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="service" className="block text-sm font-medium text-white/70 mb-2">
                      Service Interested In *
                    </label>
                    <select
                      id="service"
                      name="service"
                      required
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                    >
                      <option value="" className="bg-dark-900">Select a service</option>
                      <option value="saas" className="bg-dark-900">SaaS Development</option>
                      <option value="website" className="bg-dark-900">Website Development</option>
                      <option value="automation" className="bg-dark-900">AI Automation</option>
                      <option value="ai-tools" className="bg-dark-900">Custom AI Tools</option>
                      <option value="other" className="bg-dark-900">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/70 mb-4">
                    Project Budget
                  </label>
                  
                  {formData.service && budgetsByService[formData.service as keyof typeof budgetsByService].length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {budgetsByService[formData.service as keyof typeof budgetsByService].map((option) => (
                        <label key={option.value} className="flex items-center p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:border-cyan-500/30 transition-colors">
                          <input
                            type="radio"
                            name="budgetOption"
                            value={option.value.toString()}
                            checked={formData.budgetOption === option.value.toString()}
                            onChange={handleChange}
                            className="w-4 h-4 text-cyan-500 cursor-pointer"
                          />
                          <span className="ml-3 text-white">{option.label}</span>
                          <span className="ml-auto text-cyan-400 font-semibold">${option.value.toLocaleString()}</span>
                        </label>
                      ))}
                    </div>
                  ) : null}

                  <div className="space-y-2">
                    <label htmlFor="customBudget" className="block text-sm text-white/50">
                      Or enter custom amount {getMinBudget(formData.service) > 0 && `(minimum: $${getMinBudget(formData.service)})`}
                    </label>
                    <div className="flex items-center">
                      <span className="text-white/50 mr-2">$</span>
                      <input
                        id="customBudget"
                        type="number"
                        name="customBudget"
                        value={formData.customBudget}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors"
                        placeholder="Enter amount"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-white/70 mb-2">
                    Project Details *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-colors resize-none"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl font-bold text-black hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </section>

      {/* Quick Call CTA */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-8"
          >
            <h3 className="font-display text-2xl font-bold mb-4">Prefer to Talk?</h3>
            <p className="text-white/60 mb-6">
              Schedule a call and let's discuss your project in detail.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={() => setIsScheduleCallOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-bold text-black hover:shadow-lg hover:shadow-cyan-500/50 transition-shadow"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Schedule a Call
              </motion.button>
              <a
                href={CONTACT_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border border-white/20 rounded-full font-bold text-white hover:border-emerald-400/50 hover:bg-white/5 transition-all"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a8 8 0 01-4.29-1.243l-.307-.184-2.87.852.852-2.87-.184-.307A8 8 0 1112 20z"/>
                </svg>
                WhatsApp {CONTACT_PHONE_DISPLAY}
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Schedule Call Modal */}
      <ScheduleCall 
        isOpen={isScheduleCallOpen}
        onClose={() => setIsScheduleCallOpen(false)}
      />
    </div>
  );
}
