import { useState, useEffect } from 'react';
import {
  Home,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  List,
  Sparkles,
  Users,
  Target,
  Zap,
  Star
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

interface HeroContent {
  badge_text: string;
  headline_1: string;
  headline_2: string;
  subheadline: string;
  cta_primary_text: string;
  cta_primary_link: string;
  cta_secondary_text: string;
  cta_secondary_link: string;
}

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  features: string[];
}

interface WhyItem {
  metric: string;
  label: string;
  description: string;
}

interface ProcessStep {
  step: string;
  title: string;
  description: string;
}

interface IndustryItem {
  name: string;
}

interface CTAContent {
  headline: string;
  description: string;
  button_text: string;
  button_link: string;
}

interface HomePageContent {
  hero: HeroContent;
  services: {
    section_title: string;
    section_subtitle: string;
    section_description: string;
    items: ServiceItem[];
  };
  why: {
    section_title: string;
    section_subtitle: string;
    items: WhyItem[];
  };
  process: {
    section_title: string;
    section_subtitle: string;
    steps: ProcessStep[];
  };
  industries: {
    section_title: string;
    section_subtitle: string;
    items: IndustryItem[];
  };
  cta: CTAContent;
}

const defaultContent: HomePageContent = {
  hero: {
    badge_text: "Elite AI Agency",
    headline_1: "We Bend",
    headline_2: "Time With AI",
    subheadline: "Custom SaaS. Stunning Websites. Intelligent Automation.\nBuilt at the speed of tomorrow.",
    cta_primary_text: "Build With Us",
    cta_primary_link: "/contact",
    cta_secondary_text: "Explore Services",
    cta_secondary_link: "/services"
  },
  services: {
    section_title: "Precision-Engineered",
    section_subtitle: "Digital Solutions",
    section_description: "Every solution we create is custom-built for maximum impact. No templates. No shortcuts. Only results.",
    items: [
      {
        id: "saas",
        title: "SaaS Creation",
        description: "Full-stack SaaS products built for scale. From MVP to enterprise-grade platforms with modern architecture, seamless UX, and revenue-ready features.",
        features: ["Custom Architecture", "Scalable Infrastructure", "User Analytics", "Payment Integration"]
      },
      {
        id: "websites",
        title: "Premium Websites",
        description: "Award-worthy websites with cinematic animations, micro-interactions, and immersive experiences that convert visitors into customers.",
        features: ["Advanced Animations", "Performance Optimized", "SEO Excellence", "Conversion Focused"]
      },
      {
        id: "automation",
        title: "AI Automation",
        description: "Intelligent systems that work 24/7. Lead capture, CRM automation, AI chatbots, and custom workflows that save thousands of hours.",
        features: ["Lead Generation", "Smart Chatbots", "CRM Integration", "Custom Workflows"]
      },
      {
        id: "ai-tools",
        title: "Custom AI Tools",
        description: "Bespoke AI solutions tailored to your business. From data analysis to predictive models, we build the intelligence you need.",
        features: ["Machine Learning", "Data Processing", "API Integration", "Real-time Analytics"]
      }
    ]
  },
  why: {
    section_title: "Why Choose Chronolyte?",
    section_subtitle: "Numbers don't lie. Here's what sets us apart.",
    items: [
      { metric: "10x", label: "Faster Delivery", description: "We deliver in weeks what others take months to build." },
      { metric: "99%", label: "Client Satisfaction", description: "Our clients love the results we deliver." },
      { metric: "24/7", label: "AI-Powered Support", description: "Automation that works around the clock." },
      { metric: "100+", label: "Projects Delivered", description: "Experience across diverse industries." }
    ]
  },
  process: {
    section_title: "Our Process",
    section_subtitle: "From vision to reality in four simple steps.",
    steps: [
      { step: "01", title: "Discovery", description: "We dive deep into your business, goals, and requirements to understand exactly what you need." },
      { step: "02", title: "Strategy", description: "We create a detailed roadmap with timelines, milestones, and clear deliverables." },
      { step: "03", title: "Build", description: "Our team works tirelessly to bring your vision to life with precision and care." },
      { step: "04", title: "Launch & Support", description: "We ensure a smooth launch and provide ongoing support to keep things running perfectly." }
    ]
  },
  industries: {
    section_title: "Industries We Serve",
    section_subtitle: "Expertise across multiple sectors",
    items: [
      { name: "SaaS & Tech" },
      { name: "E-commerce" },
      { name: "Healthcare" },
      { name: "Finance" },
      { name: "Real Estate" },
      { name: "Education" },
      { name: "Hospitality" },
      { name: "Agencies" }
    ]
  },
  cta: {
    headline: "Ready to Build Something Amazing?",
    description: "Let's create digital experiences that bend time and blow minds. Your next big idea starts here.",
    button_text: "Start Your Project",
    button_link: "/contact"
  }
};

type SectionKey = 'hero' | 'services' | 'why' | 'process' | 'industries' | 'cta';

export function HomePageEditor() {
  const [content, setContent] = useState<HomePageContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' });
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
    hero: true,
    services: false,
    why: false,
    process: false,
    industries: false,
    cta: false
  });

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const res = await fetch('/backend/api/settings.php?action=get&key=homepage_content');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data?.value) {
        const parsed = typeof json.data.value === 'string' ? JSON.parse(json.data.value) : json.data.value;
        setContent({ ...defaultContent, ...parsed });
      }
    } catch (err) {
      console.error('Failed to load homepage content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: null, text: '' });
    try {
      const res = await fetch('/backend/api/settings.php?action=set', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          key: 'homepage_content',
          value: JSON.stringify(content)
        })
      });
      const json = await res.json();
      if (json.success) {
        setMessage({ type: 'success', text: 'Homepage content saved successfully!' });
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

  const toggleSection = (section: SectionKey) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateHero = (field: keyof HeroContent, value: string) => {
    setContent(prev => ({ ...prev, hero: { ...prev.hero, [field]: value } }));
  };

  const updateServicesSection = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      services: { ...prev.services, [field]: value }
    }));
  };

  const updateServiceItem = (index: number, field: keyof ServiceItem, value: any) => {
    const updated = [...content.services.items];
    updated[index] = { ...updated[index], [field]: value };
    setContent(prev => ({ ...prev, services: { ...prev.services, items: updated } }));
  };

  const addServiceItem = () => {
    setContent(prev => ({
      ...prev,
      services: {
        ...prev.services,
        items: [...prev.services.items, {
          id: `service-${Date.now()}`,
          title: "New Service",
          description: "Service description here",
          features: ["Feature 1", "Feature 2"]
        }]
      }
    }));
  };

  const removeServiceItem = (index: number) => {
    const updated = content.services.items.filter((_, i) => i !== index);
    setContent(prev => ({ ...prev, services: { ...prev.services, items: updated } }));
  };

  const updateWhySection = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      why: { ...prev.why, [field]: value }
    }));
  };

  const updateWhyItem = (index: number, field: keyof WhyItem, value: string) => {
    const updated = [...content.why.items];
    updated[index] = { ...updated[index], [field]: value };
    setContent(prev => ({ ...prev, why: { ...prev.why, items: updated } }));
  };

  const addWhyItem = () => {
    setContent(prev => ({
      ...prev,
      why: {
        ...prev.why,
        items: [...prev.why.items, { metric: "100+", label: "New Metric", description: "Description here" }]
      }
    }));
  };

  const removeWhyItem = (index: number) => {
    const updated = content.why.items.filter((_, i) => i !== index);
    setContent(prev => ({ ...prev, why: { ...prev.why, items: updated } }));
  };

  const updateProcessSection = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      process: { ...prev.process, [field]: value }
    }));
  };

  const updateProcessStep = (index: number, field: keyof ProcessStep, value: string) => {
    const updated = [...content.process.steps];
    updated[index] = { ...updated[index], [field]: value };
    setContent(prev => ({ ...prev, process: { ...prev.process, steps: updated } }));
  };

  const addProcessStep = () => {
    const stepNum = String(content.process.steps.length + 1).padStart(2, '0');
    setContent(prev => ({
      ...prev,
      process: {
        ...prev.process,
        steps: [...prev.process.steps, { step: stepNum, title: "New Step", description: "Step description" }]
      }
    }));
  };

  const removeProcessStep = (index: number) => {
    const updated = content.process.steps.filter((_, i) => i !== index);
    setContent(prev => ({ ...prev, process: { ...prev.process, steps: updated } }));
  };

  const updateIndustriesSection = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      industries: { ...prev.industries, [field]: value }
    }));
  };

  const updateIndustryItem = (index: number, value: string) => {
    const updated = [...content.industries.items];
    updated[index] = { name: value };
    setContent(prev => ({ ...prev, industries: { ...prev.industries, items: updated } }));
  };

  const addIndustryItem = () => {
    setContent(prev => ({
      ...prev,
      industries: {
        ...prev.industries,
        items: [...prev.industries.items, { name: "New Industry" }]
      }
    }));
  };

  const removeIndustryItem = (index: number) => {
    const updated = content.industries.items.filter((_, i) => i !== index);
    setContent(prev => ({ ...prev, industries: { ...prev.industries, items: updated } }));
  };

  const updateCTA = (field: keyof CTAContent, value: string) => {
    setContent(prev => ({ ...prev, cta: { ...prev.cta, [field]: value } }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  const SectionHeader = ({ title, icon: Icon, section, color = "cyan" }: { title: string; icon: any; section: SectionKey; color?: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className={`w-full flex items-center justify-between p-4 bg-${color}-500/10 border border-${color}-500/30 rounded-xl hover:bg-${color}-500/20 transition-colors`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 text-${color}-400`} />
        <span className="font-semibold text-white">{title}</span>
      </div>
      {expandedSections[section] ? <ChevronUp className="w-5 h-5 text-white/60" /> : <ChevronDown className="w-5 h-5 text-white/60" />}
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
            <Home className="text-cyan-400" />
            Homepage Editor
          </h2>
          <p className="text-white/60 mt-1">Edit every section of your homepage</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>

      {/* Status Message */}
      {message.type && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-200' : 'bg-red-500/20 border border-red-500/50 text-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Hero Section */}
      <div className="space-y-4">
        <SectionHeader title="Hero Section" icon={Sparkles} section="hero" />
        {expandedSections.hero && (
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Badge Text</label>
                <input
                  type="text"
                  value={content.hero.badge_text}
                  onChange={(e) => updateHero('badge_text', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Headline Line 1</label>
                <input
                  type="text"
                  value={content.hero.headline_1}
                  onChange={(e) => updateHero('headline_1', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Headline Line 2 (Gradient)</label>
                <input
                  type="text"
                  value={content.hero.headline_2}
                  onChange={(e) => updateHero('headline_2', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Subheadline</label>
                <textarea
                  value={content.hero.subheadline}
                  onChange={(e) => updateHero('subheadline', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors resize-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/10">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Primary Button Text</label>
                <input
                  type="text"
                  value={content.hero.cta_primary_text}
                  onChange={(e) => updateHero('cta_primary_text', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Primary Button Link</label>
                <input
                  type="text"
                  value={content.hero.cta_primary_link}
                  onChange={(e) => updateHero('cta_primary_link', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Secondary Button Text</label>
                <input
                  type="text"
                  value={content.hero.cta_secondary_text}
                  onChange={(e) => updateHero('cta_secondary_text', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Secondary Button Link</label>
                <input
                  type="text"
                  value={content.hero.cta_secondary_link}
                  onChange={(e) => updateHero('cta_secondary_link', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Services Section */}
      <div className="space-y-4">
        <SectionHeader title="Services Section" icon={Zap} section="services" />
        {expandedSections.services && (
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.services.section_title}
                  onChange={(e) => updateServicesSection('section_title', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Section Subtitle (Gradient)</label>
                <input
                  type="text"
                  value={content.services.section_subtitle}
                  onChange={(e) => updateServicesSection('section_subtitle', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Section Description</label>
              <textarea
                value={content.services.section_description}
                onChange={(e) => updateServicesSection('section_description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors resize-none"
              />
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Service Items</h4>
                <button
                  onClick={addServiceItem}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Service
                </button>
              </div>
              <div className="space-y-4">
                {content.services.items.map((item, idx) => (
                  <div key={item.id} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-cyan-400 font-medium">Service {idx + 1}</span>
                      <button
                        onClick={() => removeServiceItem(idx)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateServiceItem(idx, 'title', e.target.value)}
                      placeholder="Service Title"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 transition-colors"
                    />
                    <textarea
                      value={item.description}
                      onChange={(e) => updateServiceItem(idx, 'description', e.target.value)}
                      placeholder="Service Description"
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 transition-colors resize-none"
                    />
                    <div>
                      <label className="block text-xs text-white/50 mb-1">Features (comma-separated)</label>
                      <input
                        type="text"
                        value={item.features.join(', ')}
                        onChange={(e) => updateServiceItem(idx, 'features', e.target.value.split(',').map(f => f.trim()))}
                        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 transition-colors"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Why Section */}
      <div className="space-y-4">
        <SectionHeader title="Why Choose Us Section" icon={Star} section="why" />
        {expandedSections.why && (
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.why.section_title}
                  onChange={(e) => updateWhySection('section_title', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Section Subtitle</label>
                <input
                  type="text"
                  value={content.why.section_subtitle}
                  onChange={(e) => updateWhySection('section_subtitle', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Metrics</h4>
                <button
                  onClick={addWhyItem}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Metric
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.why.items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-cyan-400 font-medium">Metric {idx + 1}</span>
                      <button
                        onClick={() => removeWhyItem(idx)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={item.metric}
                        onChange={(e) => updateWhyItem(idx, 'metric', e.target.value)}
                        placeholder="10x"
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 transition-colors"
                      />
                      <input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateWhyItem(idx, 'label', e.target.value)}
                        placeholder="Label"
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 transition-colors"
                      />
                    </div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateWhyItem(idx, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 transition-colors"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Process Section */}
      <div className="space-y-4">
        <SectionHeader title="Process Section" icon={List} section="process" />
        {expandedSections.process && (
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.process.section_title}
                  onChange={(e) => updateProcessSection('section_title', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Section Subtitle</label>
                <input
                  type="text"
                  value={content.process.section_subtitle}
                  onChange={(e) => updateProcessSection('section_subtitle', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Process Steps</h4>
                <button
                  onClick={addProcessStep}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Step
                </button>
              </div>
              <div className="space-y-4">
                {content.process.steps.map((step, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-cyan-400 font-medium">Step {idx + 1}</span>
                      <button
                        onClick={() => removeProcessStep(idx)}
                        className="p-1 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={step.step}
                        onChange={(e) => updateProcessStep(idx, 'step', e.target.value)}
                        placeholder="01"
                        className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 transition-colors"
                      />
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => updateProcessStep(idx, 'title', e.target.value)}
                        placeholder="Title"
                        className="col-span-3 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 transition-colors"
                      />
                    </div>
                    <textarea
                      value={step.description}
                      onChange={(e) => updateProcessStep(idx, 'description', e.target.value)}
                      placeholder="Step description"
                      rows={2}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 transition-colors resize-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Industries Section */}
      <div className="space-y-4">
        <SectionHeader title="Industries Section" icon={Users} section="industries" />
        {expandedSections.industries && (
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Section Title</label>
                <input
                  type="text"
                  value={content.industries.section_title}
                  onChange={(e) => updateIndustriesSection('section_title', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Section Subtitle</label>
                <input
                  type="text"
                  value={content.industries.section_subtitle}
                  onChange={(e) => updateIndustriesSection('section_subtitle', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-white">Industries</h4>
                <button
                  onClick={addIndustryItem}
                  className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg hover:bg-cyan-500/30 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Industry
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {content.industries.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updateIndustryItem(idx, e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:border-cyan-400 transition-colors"
                    />
                    <button
                      onClick={() => removeIndustryItem(idx)}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="space-y-4">
        <SectionHeader title="Call to Action Section" icon={Target} section="cta" />
        {expandedSections.cta && (
          <div className="bg-dark-900 border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Headline</label>
              <input
                type="text"
                value={content.cta.headline}
                onChange={(e) => updateCTA('headline', e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">Description</label>
              <textarea
                value={content.cta.description}
                onChange={(e) => updateCTA('description', e.target.value)}
                rows={2}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Button Text</label>
                <input
                  type="text"
                  value={content.cta.button_text}
                  onChange={(e) => updateCTA('button_text', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Button Link</label>
                <input
                  type="text"
                  value={content.cta.button_link}
                  onChange={(e) => updateCTA('button_link', e.target.value)}
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-cyan-400 transition-colors"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Save Button */}
      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? 'Saving All Changes...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
}
