import { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Briefcase,
  Users,
  HelpCircle,
  Mail
} from 'lucide-react';

function getToken() {
  return localStorage.getItem('admin_token') || '';
}

function getAuthHeaders() {
  return {
    'Authorization': `Bearer ${getToken()}`,
    'Content-Type': 'application/json'
  };
}

// ===== SERVICES PAGE CONTENT =====
interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  pricing: string;
  timeline: string;
}

interface ServicesContent {
  hero: {
    badge_text: string;
    headline_1: string;
    headline_2: string;
    description: string;
  };
  services: ServiceItem[];
  cta: {
    headline: string;
    description: string;
    button_text: string;
    button_link: string;
  };
}

// ===== ABOUT PAGE CONTENT =====
interface ValueItem {
  icon: string;
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

// ===== FAQ PAGE CONTENT =====
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

// ===== CONTACT PAGE CONTENT =====
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

// Default content structures
const defaultServicesContent: ServicesContent = {
  hero: {
    badge_text: "Our Services",
    headline_1: "Precision-Engineered",
    headline_2: "Digital Solutions",
    description: "From blazing-fast websites to intelligent AI automation, we build digital solutions that scale with your ambitions."
  },
  services: [
    {
      id: "saas",
      title: "SaaS Development",
      subtitle: "Full-Stack Products Built for Scale",
      description: "From MVP to enterprise-grade platforms, we build complete SaaS products with modern architecture, seamless UX, and revenue-ready features.",
      features: ["Custom Architecture Design", "Scalable Cloud Infrastructure", "User Authentication & Management", "Payment Integration", "Analytics & Monitoring", "API Development"],
      pricing: "Starting at $15,000",
      timeline: "6-12 weeks"
    },
    {
      id: "website",
      title: "Premium Websites",
      subtitle: "Award-Worthy Digital Experiences",
      description: "Stunning websites with cinematic animations, micro-interactions, and immersive experiences that convert visitors into customers.",
      features: ["Custom Design & Branding", "Advanced Animations", "Performance Optimization", "SEO Best Practices", "Mobile-First Design", "CMS Integration"],
      pricing: "Starting at $5,000",
      timeline: "2-4 weeks"
    },
    {
      id: "automation",
      title: "AI Automation",
      subtitle: "Systems That Work 24/7",
      description: "Intelligent automation solutions that handle repetitive tasks, capture leads, and streamline your business operations.",
      features: ["Lead Generation Automation", "CRM Integration", "AI Chatbots", "Email Automation", "Data Processing", "Custom Workflows"],
      pricing: "Starting at $3,000",
      timeline: "1-3 weeks"
    },
    {
      id: "ai-tools",
      title: "Custom AI Tools",
      subtitle: "Bespoke Intelligence for Your Business",
      description: "Tailored AI solutions designed specifically for your unique business challenges.",
      features: ["Machine Learning Models", "Natural Language Processing", "Computer Vision", "Predictive Analytics", "API Integration", "Custom Dashboards"],
      pricing: "Starting at $10,000",
      timeline: "4-8 weeks"
    }
  ],
  cta: {
    headline: "Let's Build Something Amazing",
    description: "Ready to transform your digital presence? Let's discuss your project.",
    button_text: "Start Your Project",
    button_link: "/contact"
  }
};

const defaultAboutContent: AboutContent = {
  hero: {
    badge_text: "About Us",
    headline: "We're Chronolyte",
    description: "An elite AI agency dedicated to building the future of digital experiences. We combine cutting-edge AI technology with exceptional craftsmanship to deliver solutions that transform businesses."
  },
  stats: [
    { value: "50+", label: "Projects Delivered" },
    { value: "99%", label: "Client Satisfaction" },
    { value: "24/7", label: "Support Available" },
    { value: "10x", label: "Faster Development" }
  ],
  story: {
    section_title: "Our Story",
    headline: "Born from a Vision to Bend Time",
    paragraphs: [
      "Chronolyte was founded with a singular mission: to harness the power of artificial intelligence to deliver exceptional digital solutions at unprecedented speeds.",
      "As a solo founder operation, we bring the agility and dedication of a boutique agency with the capabilities of a full-scale development team.",
      "We believe that the best digital experiences come from the perfect fusion of AI-powered efficiency and human creativity."
    ],
    mission_title: "Our Mission",
    mission_text: "To empower businesses with AI-driven digital solutions that transform ideas into market-leading products, delivered at the speed of tomorrow."
  },
  values: {
    section_title: "Our Values",
    items: [
      { icon: "⚡", title: "Speed Without Compromise", description: "We leverage AI to deliver projects 10x faster without sacrificing quality." },
      { icon: "🎯", title: "Precision Engineering", description: "Every line of code, every pixel, every interaction is meticulously crafted." },
      { icon: "🚀", title: "Future-First Approach", description: "We build solutions that don't just work today—they scale for tomorrow." },
      { icon: "🤝", title: "Partnership Mindset", description: "Your success is our success. We're invested in your growth." }
    ]
  },
  cta: {
    headline: "Ready to Transform Your Business?",
    description: "Let's discuss how we can help you achieve your digital goals.",
    button_text: "Get In Touch",
    button_link: "/contact"
  }
};

const defaultFAQContent: FAQContent = {
  hero: {
    badge_text: "FAQ",
    headline: "Frequently Asked Questions",
    description: "Find answers to common questions about our services, process, and pricing."
  },
  categories: [
    {
      title: "General Questions",
      faqs: [
        { question: "What services does Chronolyte offer?", answer: "We specialize in SaaS product development, premium website design, AI automation solutions, and custom AI tool development." },
        { question: "How long does a typical project take?", answer: "Project timelines vary: Websites 2-4 weeks, Automation 1-3 weeks, SaaS 6-12 weeks, AI tools 4-8 weeks." },
        { question: "Do you work with clients worldwide?", answer: "Yes! We work with clients globally through video calls, email, and project management tools." }
      ]
    },
    {
      title: "Pricing & Payments",
      faqs: [
        { question: "How much do your services cost?", answer: "Pricing starts at $3,000 for automation, $5,000 for websites, $10,000 for AI tools, and $15,000 for SaaS products." },
        { question: "What payment methods do you accept?", answer: "We accept all major credit cards, PayPal, and other payment methods through our secure payment processor." },
        { question: "Do you offer payment plans?", answer: "Yes, for larger projects we offer milestone-based payment plans." }
      ]
    }
  ],
  cta: {
    headline: "Still Have Questions?",
    description: "We're here to help. Reach out and we'll get back to you within 24 hours.",
    button_text: "Contact Us",
    button_link: "/contact"
  }
};

const defaultContactContent: ContactContent = {
  hero: {
    badge_text: "Contact Us",
    headline: "Let's Start a Conversation",
    description: "Have a project in mind? We'd love to hear about it. Reach out and let's discuss how we can help."
  },
  info: {
    email: "hello@chronolyte.com",
    phone: "+1 (555) 000-0000",
    response_time: "We typically respond within 24 hours"
  },
  form: {
    title: "Send Us a Message",
    description: "Fill out the form below and we'll get back to you as soon as possible.",
    success_message: "Thank you! Your message has been sent. We'll be in touch soon."
  }
};

// Tab configuration
const TABS = [
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'about', label: 'About', icon: Users },
  { id: 'faq', label: 'FAQ', icon: HelpCircle },
  { id: 'contact', label: 'Contact', icon: Mail }
];

export function PagesEditor() {
  const [activeTab, setActiveTab] = useState('services');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  
  // Content states
  const [servicesContent, setServicesContent] = useState<ServicesContent>(defaultServicesContent);
  const [aboutContent, setAboutContent] = useState<AboutContent>(defaultAboutContent);
  const [faqContent, setFAQContent] = useState<FAQContent>(defaultFAQContent);
  const [contactContent, setContactContent] = useState<ContactContent>(defaultContactContent);
  
  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    hero: true,
    services: false,
    values: false,
    story: false,
    categories: false,
    cta: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Load content
  useEffect(() => {
    loadAllContent();
  }, []);

  const loadAllContent = async () => {
    setLoading(true);
    try {
      // Load all page content in parallel
      const [servicesRes, aboutRes, faqRes, contactRes] = await Promise.all([
        fetch('/backend/api/settings.php?action=get&key=services_content'),
        fetch('/backend/api/settings.php?action=get&key=about_content'),
        fetch('/backend/api/settings.php?action=get&key=faq_content'),
        fetch('/backend/api/settings.php?action=get&key=contact_page_content')
      ]);

      if (!servicesRes.ok || !aboutRes.ok || !faqRes.ok || !contactRes.ok) {
        throw new Error('One or more API requests failed');
      }

      const servicesJson = await servicesRes.json();
      const aboutJson = await aboutRes.json();
      const faqJson = await faqRes.json();
      const contactJson = await contactRes.json();

      if (servicesJson.success && servicesJson.data?.value) {
        const parsed = typeof servicesJson.data.value === 'string' 
          ? JSON.parse(servicesJson.data.value) 
          : servicesJson.data.value;
        setServicesContent({ ...defaultServicesContent, ...parsed });
      }

      if (aboutJson.success && aboutJson.data?.value) {
        const parsed = typeof aboutJson.data.value === 'string' 
          ? JSON.parse(aboutJson.data.value) 
          : aboutJson.data.value;
        setAboutContent({ ...defaultAboutContent, ...parsed });
      }

      if (faqJson.success && faqJson.data?.value) {
        const parsed = typeof faqJson.data.value === 'string' 
          ? JSON.parse(faqJson.data.value) 
          : faqJson.data.value;
        setFAQContent({ ...defaultFAQContent, ...parsed });
      }

      if (contactJson.success && contactJson.data?.value) {
        const parsed = typeof contactJson.data.value === 'string' 
          ? JSON.parse(contactJson.data.value) 
          : contactJson.data.value;
        setContactContent({ ...defaultContactContent, ...parsed });
      }
    } catch (err) {
      console.error('Failed to load content:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async (key: string, value: any) => {
    setSaving(true);
    setMessage({ type: null, text: '' });
    
    try {
      const res = await fetch('/backend/api/settings.php?action=set', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ key, value: JSON.stringify(value) })
      });

      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Content saved successfully!' });
      } else {
        setMessage({ type: 'error', text: json.message || 'Failed to save' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error saving content' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ type: null, text: '' }), 3000);
    }
  };

  const handleSave = () => {
    switch (activeTab) {
      case 'services':
        saveContent('services_content', servicesContent);
        break;
      case 'about':
        saveContent('about_content', aboutContent);
        break;
      case 'faq':
        saveContent('faq_content', faqContent);
        break;
      case 'contact':
        saveContent('contact_page_content', contactContent);
        break;
    }
  };

  // Render section header
  const SectionHeader = ({ title, section, icon: Icon }: { title: string; section: string; icon: any }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-cyan-400" />
        <span className="font-semibold text-white">{title}</span>
      </div>
      {expandedSections[section] ? <ChevronUp className="w-5 h-5 text-white/50" /> : <ChevronDown className="w-5 h-5 text-white/50" />}
    </button>
  );

  // ===== SERVICES TAB =====
  const renderServicesTab = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Hero Section" section="hero" icon={FileText} />
        {expandedSections.hero && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Badge Text</label>
                <input
                  type="text"
                  value={servicesContent.hero.badge_text}
                  onChange={(e) => setServicesContent(prev => ({ ...prev, hero: { ...prev.hero, badge_text: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Headline Line 1</label>
                <input
                  type="text"
                  value={servicesContent.hero.headline_1}
                  onChange={(e) => setServicesContent(prev => ({ ...prev, hero: { ...prev.hero, headline_1: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Headline Line 2 (Gradient)</label>
              <input
                type="text"
                value={servicesContent.hero.headline_2}
                onChange={(e) => setServicesContent(prev => ({ ...prev, hero: { ...prev.hero, headline_2: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Description</label>
              <textarea
                value={servicesContent.hero.description}
                onChange={(e) => setServicesContent(prev => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Services List */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Services" section="services" icon={Briefcase} />
        {expandedSections.services && (
          <div className="p-6 space-y-6 border-t border-white/10">
            {servicesContent.services.map((service, idx) => (
              <div key={service.id} className="bg-white/5 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-cyan-400">{service.title || `Service ${idx + 1}`}</h4>
                  <button
                    onClick={() => {
                      const newServices = [...servicesContent.services];
                      newServices.splice(idx, 1);
                      setServicesContent(prev => ({ ...prev, services: newServices }));
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Title</label>
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => {
                        const newServices = [...servicesContent.services];
                        newServices[idx] = { ...newServices[idx], title: e.target.value };
                        setServicesContent(prev => ({ ...prev, services: newServices }));
                      }}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={service.subtitle}
                      onChange={(e) => {
                        const newServices = [...servicesContent.services];
                        newServices[idx] = { ...newServices[idx], subtitle: e.target.value };
                        setServicesContent(prev => ({ ...prev, services: newServices }));
                      }}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Description</label>
                  <textarea
                    value={service.description}
                    onChange={(e) => {
                      const newServices = [...servicesContent.services];
                      newServices[idx] = { ...newServices[idx], description: e.target.value };
                      setServicesContent(prev => ({ ...prev, services: newServices }));
                    }}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Pricing</label>
                    <input
                      type="text"
                      value={service.pricing}
                      onChange={(e) => {
                        const newServices = [...servicesContent.services];
                        newServices[idx] = { ...newServices[idx], pricing: e.target.value };
                        setServicesContent(prev => ({ ...prev, services: newServices }));
                      }}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Timeline</label>
                    <input
                      type="text"
                      value={service.timeline}
                      onChange={(e) => {
                        const newServices = [...servicesContent.services];
                        newServices[idx] = { ...newServices[idx], timeline: e.target.value };
                        setServicesContent(prev => ({ ...prev, services: newServices }));
                      }}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1">Features (one per line)</label>
                  <textarea
                    value={service.features.join('\n')}
                    onChange={(e) => {
                      const newServices = [...servicesContent.services];
                      newServices[idx] = { ...newServices[idx], features: e.target.value.split('\n').filter(f => f.trim()) };
                      setServicesContent(prev => ({ ...prev, services: newServices }));
                    }}
                    rows={4}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                setServicesContent(prev => ({
                  ...prev,
                  services: [...prev.services, {
                    id: `service-${Date.now()}`,
                    title: 'New Service',
                    subtitle: 'Service Subtitle',
                    description: 'Service description...',
                    features: ['Feature 1', 'Feature 2'],
                    pricing: 'Starting at $X,XXX',
                    timeline: 'X-X weeks'
                  }]
                }));
              }}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Call to Action" section="cta" icon={CheckCircle} />
        {expandedSections.cta && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div>
              <label className="block text-sm text-white/70 mb-2">Headline</label>
              <input
                type="text"
                value={servicesContent.cta.headline}
                onChange={(e) => setServicesContent(prev => ({ ...prev, cta: { ...prev.cta, headline: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Description</label>
              <textarea
                value={servicesContent.cta.description}
                onChange={(e) => setServicesContent(prev => ({ ...prev, cta: { ...prev.cta, description: e.target.value } }))}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Button Text</label>
                <input
                  type="text"
                  value={servicesContent.cta.button_text}
                  onChange={(e) => setServicesContent(prev => ({ ...prev, cta: { ...prev.cta, button_text: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Button Link</label>
                <input
                  type="text"
                  value={servicesContent.cta.button_link}
                  onChange={(e) => setServicesContent(prev => ({ ...prev, cta: { ...prev.cta, button_link: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ===== ABOUT TAB =====
  const renderAboutTab = () => (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Hero Section" section="hero" icon={FileText} />
        {expandedSections.hero && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div>
              <label className="block text-sm text-white/70 mb-2">Badge Text</label>
              <input
                type="text"
                value={aboutContent.hero.badge_text}
                onChange={(e) => setAboutContent(prev => ({ ...prev, hero: { ...prev.hero, badge_text: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Headline</label>
              <input
                type="text"
                value={aboutContent.hero.headline}
                onChange={(e) => setAboutContent(prev => ({ ...prev, hero: { ...prev.hero, headline: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Description</label>
              <textarea
                value={aboutContent.hero.description}
                onChange={(e) => setAboutContent(prev => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Stats" section="stats" icon={CheckCircle} />
        {expandedSections.stats && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div className="grid md:grid-cols-2 gap-4">
              {aboutContent.stats.map((stat, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-white/50">Stat {idx + 1}</span>
                    <button
                      onClick={() => {
                        const newStats = [...aboutContent.stats];
                        newStats.splice(idx, 1);
                        setAboutContent(prev => ({ ...prev, stats: newStats }));
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => {
                      const newStats = [...aboutContent.stats];
                      newStats[idx] = { ...newStats[idx], value: e.target.value };
                      setAboutContent(prev => ({ ...prev, stats: newStats }));
                    }}
                    placeholder="Value (e.g., 50+)"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => {
                      const newStats = [...aboutContent.stats];
                      newStats[idx] = { ...newStats[idx], label: e.target.value };
                      setAboutContent(prev => ({ ...prev, stats: newStats }));
                    }}
                    placeholder="Label (e.g., Projects Delivered)"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={() => setAboutContent(prev => ({ ...prev, stats: [...prev.stats, { value: '', label: '' }] }))}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
            >
              <Plus className="w-4 h-4" /> Add Stat
            </button>
          </div>
        )}
      </div>

      {/* Story */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Our Story" section="story" icon={FileText} />
        {expandedSections.story && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Section Title</label>
                <input
                  type="text"
                  value={aboutContent.story.section_title}
                  onChange={(e) => setAboutContent(prev => ({ ...prev, story: { ...prev.story, section_title: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Headline</label>
                <input
                  type="text"
                  value={aboutContent.story.headline}
                  onChange={(e) => setAboutContent(prev => ({ ...prev, story: { ...prev.story, headline: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Story Paragraphs (one per line)</label>
              <textarea
                value={aboutContent.story.paragraphs.join('\n\n')}
                onChange={(e) => setAboutContent(prev => ({ 
                  ...prev, 
                  story: { ...prev.story, paragraphs: e.target.value.split('\n\n').filter(p => p.trim()) } 
                }))}
                rows={6}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Mission Title</label>
              <input
                type="text"
                value={aboutContent.story.mission_title}
                onChange={(e) => setAboutContent(prev => ({ ...prev, story: { ...prev.story, mission_title: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Mission Text</label>
              <textarea
                value={aboutContent.story.mission_text}
                onChange={(e) => setAboutContent(prev => ({ ...prev, story: { ...prev.story, mission_text: e.target.value } }))}
                rows={3}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Values */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Our Values" section="values" icon={CheckCircle} />
        {expandedSections.values && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div>
              <label className="block text-sm text-white/70 mb-2">Section Title</label>
              <input
                type="text"
                value={aboutContent.values.section_title}
                onChange={(e) => setAboutContent(prev => ({ ...prev, values: { ...prev.values, section_title: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            {aboutContent.values.items.map((item, idx) => (
              <div key={idx} className="bg-white/5 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/50">Value {idx + 1}</span>
                  <button
                    onClick={() => {
                      const newItems = [...aboutContent.values.items];
                      newItems.splice(idx, 1);
                      setAboutContent(prev => ({ ...prev, values: { ...prev.values, items: newItems } }));
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={item.icon}
                    onChange={(e) => {
                      const newItems = [...aboutContent.values.items];
                      newItems[idx] = { ...newItems[idx], icon: e.target.value };
                      setAboutContent(prev => ({ ...prev, values: { ...prev.values, items: newItems } }));
                    }}
                    placeholder="Emoji"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  />
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const newItems = [...aboutContent.values.items];
                      newItems[idx] = { ...newItems[idx], title: e.target.value };
                      setAboutContent(prev => ({ ...prev, values: { ...prev.values, items: newItems } }));
                    }}
                    placeholder="Title"
                    className="md:col-span-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                  />
                </div>
                <textarea
                  value={item.description}
                  onChange={(e) => {
                    const newItems = [...aboutContent.values.items];
                    newItems[idx] = { ...newItems[idx], description: e.target.value };
                    setAboutContent(prev => ({ ...prev, values: { ...prev.values, items: newItems } }));
                  }}
                  placeholder="Description"
                  rows={2}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
                />
              </div>
            ))}
            <button
              onClick={() => setAboutContent(prev => ({ 
                ...prev, 
                values: { 
                  ...prev.values, 
                  items: [...prev.values.items, { icon: '✨', title: '', description: '' }] 
                } 
              }))}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
            >
              <Plus className="w-4 h-4" /> Add Value
            </button>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Call to Action" section="cta" icon={CheckCircle} />
        {expandedSections.cta && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div>
              <label className="block text-sm text-white/70 mb-2">Headline</label>
              <input
                type="text"
                value={aboutContent.cta.headline}
                onChange={(e) => setAboutContent(prev => ({ ...prev, cta: { ...prev.cta, headline: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Description</label>
              <textarea
                value={aboutContent.cta.description}
                onChange={(e) => setAboutContent(prev => ({ ...prev, cta: { ...prev.cta, description: e.target.value } }))}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Button Text</label>
                <input
                  type="text"
                  value={aboutContent.cta.button_text}
                  onChange={(e) => setAboutContent(prev => ({ ...prev, cta: { ...prev.cta, button_text: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Button Link</label>
                <input
                  type="text"
                  value={aboutContent.cta.button_link}
                  onChange={(e) => setAboutContent(prev => ({ ...prev, cta: { ...prev.cta, button_link: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

// ===== FAQ TAB =====
  const renderFAQTab = () => (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Hero Section" section="hero" icon={FileText} />
        {expandedSections.hero && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div>
              <label className="block text-sm text-white/70 mb-2">Badge Text</label>
              <input
                type="text"
                value={faqContent.hero.badge_text}
                onChange={(e) => setFAQContent(prev => ({ ...prev, hero: { ...prev.hero, badge_text: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Headline</label>
              <input
                type="text"
                value={faqContent.hero.headline}
                onChange={(e) => setFAQContent(prev => ({ ...prev, hero: { ...prev.hero, headline: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Description</label>
              <textarea
                value={faqContent.hero.description}
                onChange={(e) => setFAQContent(prev => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* FAQ Categories */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="FAQ Categories" section="categories" icon={HelpCircle} />
        {expandedSections.categories && (
          <div className="p-6 space-y-6 border-t border-white/10">
            {faqContent.categories.map((category, catIdx) => (
              <div key={catIdx} className="bg-white/5 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={category.title}
                    onChange={(e) => {
                      const newCats = [...faqContent.categories];
                      newCats[catIdx] = { ...newCats[catIdx], title: e.target.value };
                      setFAQContent(prev => ({ ...prev, categories: newCats }));
                    }}
                    placeholder="Category Title"
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-cyan-400 font-semibold"
                  />
                  <button
                    onClick={() => {
                      const newCats = [...faqContent.categories];
                      newCats.splice(catIdx, 1);
                      setFAQContent(prev => ({ ...prev, categories: newCats }));
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {category.faqs.map((faq, faqIdx) => (
                  <div key={faqIdx} className="bg-white/5 rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => {
                          const newCats = [...faqContent.categories];
                          newCats[catIdx].faqs[faqIdx] = { ...newCats[catIdx].faqs[faqIdx], question: e.target.value };
                          setFAQContent(prev => ({ ...prev, categories: newCats }));
                        }}
                        placeholder="Question"
                        className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
                      />
                      <button
                        onClick={() => {
                          const newCats = [...faqContent.categories];
                          newCats[catIdx].faqs.splice(faqIdx, 1);
                          setFAQContent(prev => ({ ...prev, categories: newCats }));
                        }}
                        className="text-red-400 hover:text-red-300 mt-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        const newCats = [...faqContent.categories];
                        newCats[catIdx].faqs[faqIdx] = { ...newCats[catIdx].faqs[faqIdx], answer: e.target.value };
                        setFAQContent(prev => ({ ...prev, categories: newCats }));
                      }}
                      placeholder="Answer"
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm resize-none"
                    />
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const newCats = [...faqContent.categories];
                    newCats[catIdx].faqs.push({ question: '', answer: '' });
                    setFAQContent(prev => ({ ...prev, categories: newCats }));
                  }}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white/10 text-white/70 rounded-lg hover:bg-white/20"
                >
                  <Plus className="w-3 h-3" /> Add FAQ
                </button>
              </div>
            ))}
            <button
              onClick={() => setFAQContent(prev => ({ 
                ...prev, 
                categories: [...prev.categories, { title: 'New Category', faqs: [] }] 
              }))}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30"
            >
              <Plus className="w-4 h-4" /> Add Category
            </button>
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Call to Action" section="cta" icon={CheckCircle} />
        {expandedSections.cta && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div>
              <label className="block text-sm text-white/70 mb-2">Headline</label>
              <input
                type="text"
                value={faqContent.cta.headline}
                onChange={(e) => setFAQContent(prev => ({ ...prev, cta: { ...prev.cta, headline: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Description</label>
              <textarea
                value={faqContent.cta.description}
                onChange={(e) => setFAQContent(prev => ({ ...prev, cta: { ...prev.cta, description: e.target.value } }))}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Button Text</label>
                <input
                  type="text"
                  value={faqContent.cta.button_text}
                  onChange={(e) => setFAQContent(prev => ({ ...prev, cta: { ...prev.cta, button_text: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Button Link</label>
                <input
                  type="text"
                  value={faqContent.cta.button_link}
                  onChange={(e) => setFAQContent(prev => ({ ...prev, cta: { ...prev.cta, button_link: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ===== CONTACT TAB =====
  const renderContactTab = () => (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Hero Section" section="hero" icon={FileText} />
        {expandedSections.hero && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div>
              <label className="block text-sm text-white/70 mb-2">Badge Text</label>
              <input
                type="text"
                value={contactContent.hero.badge_text}
                onChange={(e) => setContactContent(prev => ({ ...prev, hero: { ...prev.hero, badge_text: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Headline</label>
              <input
                type="text"
                value={contactContent.hero.headline}
                onChange={(e) => setContactContent(prev => ({ ...prev, hero: { ...prev.hero, headline: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Description</label>
              <textarea
                value={contactContent.hero.description}
                onChange={(e) => setContactContent(prev => ({ ...prev, hero: { ...prev.hero, description: e.target.value } }))}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Contact Info */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Contact Information" section="info" icon={Mail} />
        {expandedSections.info && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/70 mb-2">Email Address</label>
                <input
                  type="email"
                  value={contactContent.info.email}
                  onChange={(e) => setContactContent(prev => ({ ...prev, info: { ...prev.info, email: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-white/70 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={contactContent.info.phone}
                  onChange={(e) => setContactContent(prev => ({ ...prev, info: { ...prev.info, phone: e.target.value } }))}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Response Time Text</label>
              <input
                type="text"
                value={contactContent.info.response_time}
                onChange={(e) => setContactContent(prev => ({ ...prev, info: { ...prev.info, response_time: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Form Settings */}
      <div className="bg-dark-900 border border-white/10 rounded-xl overflow-hidden">
        <SectionHeader title="Form Settings" section="form" icon={FileText} />
        {expandedSections.form && (
          <div className="p-6 space-y-4 border-t border-white/10">
            <div>
              <label className="block text-sm text-white/70 mb-2">Form Title</label>
              <input
                type="text"
                value={contactContent.form.title}
                onChange={(e) => setContactContent(prev => ({ ...prev, form: { ...prev.form, title: e.target.value } }))}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Form Description</label>
              <textarea
                value={contactContent.form.description}
                onChange={(e) => setContactContent(prev => ({ ...prev, form: { ...prev.form, description: e.target.value } }))}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm text-white/70 mb-2">Success Message</label>
              <textarea
                value={contactContent.form.success_message}
                onChange={(e) => setContactContent(prev => ({ ...prev, form: { ...prev.form, success_message: e.target.value } }))}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <FileText className="text-cyan-400" />
            Page Content Editor
          </h2>
          <p className="text-white/60 mt-1">Edit content for all website pages</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-cyan-500 text-black font-semibold rounded-lg hover:bg-cyan-400 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Changes
        </button>
      </div>

      {/* Message */}
      {message.type && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200' 
            : 'bg-red-500/20 border border-red-500/50 text-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-4">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-cyan-500 text-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'services' && renderServicesTab()}
      {activeTab === 'about' && renderAboutTab()}
      {activeTab === 'faq' && renderFAQTab()}
      {activeTab === 'contact' && renderContactTab()}
    </div>
  );
}
