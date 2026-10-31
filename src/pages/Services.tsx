import { useState, useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Minus, Plus } from 'lucide-react';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';
import { CtaBand, PageHero, SectionHead, Sheet } from '../components/editorial/EditorialPage';

interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: ReactNode;
  services: ServiceItem[];
}

interface ServicesContent {
  hero: {
    badge_text: string;
    headline_1: string;
    headline_2: string;
    description: string;
  };
  categories: ServiceCategory[];
  cta: {
    headline: string;
    description: string;
    button_text: string;
    button_link: string;
  };
}

// Default fallback content
const defaultContent: ServicesContent = {
  hero: {
    badge_text: "Our Services",
    headline_1: "Precision-Engineered",
    headline_2: "Digital Solutions",
    description: "Every solution we create is custom-built for maximum impact. No templates. No shortcuts. Only results."
  },
  categories: [
    {
      id: "web-development",
      name: "Web Development Services",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
        </svg>
      ),
      services: [
        {
          id: "premium-websites",
          title: "Premium Websites",
          subtitle: "Award-Worthy Digital Experiences",
          description: "Stunning websites with cinematic animations, micro-interactions, and immersive experiences that convert visitors into customers.",
          features: ["Custom Design & Branding", "Advanced Animations", "Performance Optimization", "SEO Best Practices", "Mobile-First Design", "CMS Integration"]
        },
        {
          id: "saas",
          title: "SaaS Development",
          subtitle: "Full-Stack Products Built for Scale",
          description: "From MVP to enterprise-grade platforms, we build complete SaaS products with modern architecture, seamless UX, and revenue-ready features.",
          features: ["Custom Architecture Design", "Scalable Cloud Infrastructure", "User Authentication & Management", "Payment Integration", "Analytics & Monitoring", "API Development"]
        },
        {
          id: "real-estate-website",
          title: "Real Estate Websites",
          subtitle: "Property Showcase Excellence",
          description: "Professional real estate websites with MLS integration, virtual tours, property search, and lead capture systems for agents and agencies.",
          features: ["MLS Integration", "Virtual Tours & 3D Views", "Advanced Search Filters", "Lead Capture Forms", "Agent Management", "Mortgage Calculator"]
        },
        {
          id: "fitness-gym",
          title: "Fitness & Gym Websites",
          subtitle: "Get Fit, Get Found Online",
          description: "Specialized websites for fitness facilities with class booking, membership management, trainer profiles, and progress tracking.",
          features: ["Class Schedule & Booking", "Membership Management", "Trainer Profiles", "Payment Processing", "Progress Tracking", "Member Community"]
        },
        {
          id: "ecommerce",
          title: "E-Commerce Platforms",
          subtitle: "Revenue-Generating Online Stores",
          description: "Full-featured e-commerce websites with product management, inventory systems, secure payments, and advanced analytics.",
          features: ["Product Management", "Shopping Cart System", "Payment Gateway Integration", "Inventory Tracking", "Customer Analytics", "Shipping Integration"]
        },
        {
          id: "restaurant",
          title: "Restaurant Websites",
          subtitle: "Appetizing Online Presence",
          description: "Specialized websites for restaurants featuring online menus, reservation systems, food photography galleries, and integrated ordering platforms.",
          features: ["Online Menu Display", "Reservation System", "Food Photography Galleries", "Integrated Ordering", "Table Management", "Customer Reviews"]
        },
        {
          id: "hotel",
          title: "Hotel & Hospitality Websites",
          subtitle: "Guest Experience Excellence",
          description: "Hotel websites with booking systems, room galleries, amenity showcases, and guest management integration for luxury hospitality.",
          features: ["Room Booking System", "Amenity Showcases", "High-Quality Photo Galleries", "Guest Reviews", "Booking Calendar", "Event Management"]
        },
        {
          id: "healthcare",
          title: "Healthcare & Clinic Websites",
          subtitle: "Patient-Centric Digital Care",
          description: "HIPAA-compliant websites for clinics and healthcare providers with appointment scheduling, patient portals, and medical information management.",
          features: ["Appointment Scheduling", "Patient Portal", "HIPAA Compliance", "Doctor Profiles", "Service Information", "Telemedicine Integration"]
        }
      ]
    },
    {
      id: "crm-management",
      name: "CRM & Management Systems",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      services: [
        {
          id: "real-estate-crm",
          title: "Real Estate CRM System",
          subtitle: "Manage Properties & Leads",
          description: "Comprehensive CRM designed for real estate professionals to manage leads, properties, transactions, and client relationships efficiently.",
          features: ["Lead Management", "Property Database", "Document Automation", "Transaction Tracking", "Reporting & Analytics", "Email Integration", "Mobile Access"]
        },
        {
          id: "custom-business-crm",
          title: "Custom Business CRM",
          subtitle: "Tailor-Made for Your Operations",
          description: "Custom-built CRM solutions designed specifically for your business needs with complete control over workflows, automation, and integrations.",
          features: ["Custom Workflow Design", "Lead & Sales Pipeline", "Contact Management", "Automation Rules", "Integration Hub", "Custom Reports", "Team Collaboration"]
        },
        {
          id: "appointment-booking",
          title: "Appointment Booking System",
          subtitle: "Never Miss a Meeting",
          description: "Complete appointment scheduling solution with calendar management, automated reminders, payment collection, and client profiles.",
          features: ["Calendar Management", "Automated Reminders", "Payment Collection", "Client Profiles", "Email Notifications", "Multi-resource Scheduling", "Waitlist Management"]
        },
        {
          id: "inventory-management",
          title: "Inventory Management System",
          subtitle: "Stock Control Made Simple",
          description: "Advanced inventory tracking system with real-time updates, low-stock alerts, multi-location support, and detailed analytics.",
          features: ["Real-time Stock Tracking", "Low-stock Alerts", "Multi-location Support", "Barcode Scanning", "Supplier Management", "Analytics Dashboard", "Integration Ready"]
        },
        {
          id: "project-management",
          title: "Project Management Platform",
          subtitle: "Keep Your Team Aligned",
          description: "Collaborative project management tool with task tracking, team communication, file sharing, and progress monitoring.",
          features: ["Task Management", "Team Collaboration", "File Sharing", "Progress Tracking", "Time Tracking", "Gantt Charts", "Resource Allocation"]
        }
      ]
    },
    {
      id: "ai-automation",
      name: "AI & Automation Services",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
        </svg>
      ),
      services: [
        {
          id: "voice-agents",
          title: "Voice Agents for Calls",
          subtitle: "AI-Powered Phone Assistance",
          description: "Intelligent voice agents that handle incoming and outgoing calls, schedule appointments, qualify leads, and provide customer support 24/7.",
          features: ["Natural Language Processing", "Call Routing", "Appointment Scheduling", "Lead Qualification", "Call Recording", "Sentiment Analysis", "Multi-language Support"]
        },
        {
          id: "chatbots",
          title: "AI Chatbots",
          subtitle: "Instant Customer Support",
          description: "Intelligent chatbots powered by machine learning that handle customer inquiries, provide product information, and route complex issues to humans.",
          features: ["Natural Language Understanding", "Multi-channel Support", "Intent Recognition", "Learning Capabilities", "Human Handoff", "Analytics Dashboard", "Easy Training"]
        },
        {
          id: "ai-automation",
          title: "AI Automation Solutions",
          subtitle: "Systems That Work 24/7",
          description: "Intelligent automation solutions that handle repetitive tasks, capture leads, process data, and streamline your business operations.",
          features: ["Lead Generation Automation", "Data Processing", "Email Automation", "CRM Integration", "Workflow Automation", "Custom Scripts", "Real-time Monitoring"]
        },
        {
          id: "custom-ai-tools",
          title: "Custom AI Tools & Models",
          subtitle: "Bespoke Intelligence Solutions",
          description: "Tailored AI solutions designed specifically for your unique business challenges, from predictive analytics to computer vision applications.",
          features: ["Machine Learning Models", "Predictive Analytics", "Computer Vision", "Natural Language Processing", "API Integration", "Custom Dashboards", "Continuous Learning"]
        },
        {
          id: "business-intelligence",
          title: "Business Intelligence & Analytics",
          subtitle: "Data-Driven Decision Making",
          description: "Advanced analytics dashboards that transform your data into actionable insights, helping you make smarter business decisions.",
          features: ["Custom Dashboards", "Data Visualization", "KPI Tracking", "Predictive Analytics", "Automated Reports", "Real-time Data", "Integration Hub"]
        }
      ]
    },
    {
      id: "support-growth",
      name: "Support & Growth Services",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      services: [
        {
          id: "website-maintenance",
          title: "Website Maintenance Plans",
          subtitle: "Keep Your Site Running",
          description: "Ongoing website maintenance including security updates, backups, monitoring, content updates, and performance optimization.",
          features: ["Regular Backups", "Security Updates", "Bug Fixes", "Performance Optimization", "Content Management", "24/7 Monitoring", "Priority Support"]
        },
        {
          id: "seo-services",
          title: "SEO & Digital Marketing",
          subtitle: "Get Found Online",
          description: "Comprehensive SEO services including keyword research, on-page optimization, link building, content strategy, and PPC advertising.",
          features: ["Keyword Research", "On-page Optimization", "Technical SEO", "Link Building", "Content Marketing", "Local SEO", "Monthly Reporting"]
        },
        {
          id: "api-integration",
          title: "API Development & Integration",
          subtitle: "Connect Everything",
          description: "Custom API development and third-party integrations to connect your systems, streamline workflows, and automate data flow.",
          features: ["REST API Development", "Third-party Integrations", "Webhook Setup", "Payment Gateway Integration", "API Documentation", "Testing & QA", "Ongoing Support"]
        },
        {
          id: "mobile-apps",
          title: "Mobile App Development",
          subtitle: "Mobile-First Solutions",
          description: "Native and cross-platform mobile apps for iOS and Android with seamless user experience and powerful functionality.",
          features: ["iOS Development", "Android Development", "Cross-platform Apps", "UI/UX Design", "Cloud Integration", "Push Notifications", "App Store Optimization"]
        }
      ]
    }
  ],
  cta: {
    headline: "Ready to Get Started?",
    description: "Let's discuss your project and find the perfect solution for your business.",
    button_text: "Start Your Project",
    button_link: "/contact"
  }
};

export function Services() {
  const [content, setContent] = useState<ServicesContent>(defaultContent);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  
  useEffect(() => {
    // Load content from database
    fetch('/backend/api/settings.php?action=get&key=services_content')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data?.value) {
          const parsed = typeof data.data.value === 'string' ? JSON.parse(data.data.value) : data.data.value;
          setContent({ ...defaultContent, ...parsed });
        }
      })
      .catch(err => console.error('Failed to load services content:', err));
  }, []);

  const categories = content.categories;

  const tones = ['cherry', 'paper', 'mist', 'lime'] as const;

  return (
    <>
      <PageHero
        eyebrow={content.hero.badge_text}
        title={<>{content.hero.headline_1}<br /><em>{content.hero.headline_2}</em></>}
        lede={content.hero.description}
        actions={
          <>
            <Link to="/contact" className="ed-btn">Start your project free <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/pricing" className="ed-btn ed-btn--ghost">See pricing</Link>
          </>
        }
        meta={
          <>
            <span>{categories.length} service categories</span>
            <span>Fixed-price quotes</span>
            <span>Demos every 1–2 weeks</span>
          </>
        }
      />

      {categories.map((category, categoryIndex) => {
        const tone = tones[categoryIndex % tones.length];
        const isOpen = expandedCategory === category.id;
        return (
          <Sheet tone={tone} key={category.id} id={`category-${category.id}`}>
            <div className="ed-section-head">
              <div className="ed-section-head__body">
                <p className="ed-rubric">
                  {String(categoryIndex + 1).padStart(2, '0')} / {String(categories.length).padStart(2, '0')} — {category.services.length} services
                </p>
                <h2 className="ed-title">{category.name}</h2>
              </div>
              <button
                type="button"
                className={tone === 'cherry' ? 'ed-btn ed-btn--onDark ed-btn--sm' : 'ed-btn ed-btn--sm'}
                aria-expanded={isOpen}
                onClick={() => setExpandedCategory(isOpen ? null : category.id)}
              >
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {isOpen ? 'Hide details' : 'See what is included'}
              </button>
            </div>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    {category.services.map((service, serviceIndex) => (
                      <article key={service.id} className="ed-card h-full">
                        <span className="ed-card__num">{String(serviceIndex + 1).padStart(2, '0')}</span>
                        <p className="ed-rubric" style={{ marginBottom: '0.5rem' }}>{category.name.split(' ')[0]}</p>
                        <h3 className="ed-card__title">{service.title}</h3>
                        <p style={{ margin: '0 0 0.6rem', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.02em', color: tone === 'cherry' ? '#c5de97' : '#7b182a' }}>
                          {service.subtitle}
                        </p>
                        <p className="ed-card__body" style={{ flexGrow: 1 }}>{service.description}</p>
                        <div className="ed-kicker-row" style={{ margin: '0.9rem 0' }}>
                          {service.features.slice(0, 4).map((feature) => (
                            <span key={feature} className="ed-chip">
                              <Check className="h-3 w-3" /> {feature}
                            </span>
                          ))}
                        </div>
                        <Link to="/contact" className={tone === 'cherry' ? 'ed-btn ed-btn--onDark ed-btn--sm' : 'ed-btn ed-btn--sm'} style={{ width: 'fit-content' }}>
                          Get started <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </article>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!isOpen && (
              <div className="ed-kicker-row">
                {category.services.slice(0, 6).map((service) => (
                  <span key={service.id} className="ed-chip">{service.title}</span>
                ))}
                {category.services.length > 6 && <span className="ed-chip">+{category.services.length - 6} more</span>}
              </div>
            )}
          </Sheet>
        );
      })}

      <Sheet tone="paper">
        <SectionHead
          rubric="How we work"
          number="Process"
          title={<>From brief to <em>launch</em></>}
        />
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { step: '01', title: 'Discovery', desc: 'We dive deep into your vision and requirements' },
            { step: '02', title: 'Design', desc: 'Strategic architecture and considered UI/UX' },
            { step: '03', title: 'Build', desc: 'Rapid development with AI acceleration' },
            { step: '04', title: 'Launch', desc: 'Deploy, monitor and optimise for success' }
          ].map((item) => (
            <article key={item.step} className="ed-card ed-card--numbered h-full">
              <span className="ed-card__num">{item.step}</span>
              <h3 className="ed-card__title">{item.title}</h3>
              <p className="ed-card__body">{item.desc}</p>
            </article>
          ))}
        </div>
      </Sheet>

      <CtaBand
        eyebrow="Next step"
        title={<>Ready to get <em>started?</em></>}
        description={content.cta.description}
        primaryTo={content.cta.button_link}
        primaryLabel={content.cta.button_text}
        secondaryTo="/pricing"
        secondaryLabel="Compare packages"
        note={`Or call ${CONTACT_PHONE_DISPLAY} — no obligation, no card required.`}
      >
        <p style={{ marginTop: '1rem', fontSize: '0.82rem' }}>
          <a href={CONTACT_PHONE_TEL} className="ed-link">Call {CONTACT_PHONE_DISPLAY}</a>
        </p>
      </CtaBand>
    </>
  );
}
