import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL } from '../constants/siteContact.js';

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

// Service icons mapping
const serviceIcons: Record<string, JSX.Element> = {
  saas: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  website: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
    </svg>
  ),
  restaurant: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6M5 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
    </svg>
  ),
  hotel: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2zM3 9h18M9 5v4m0 0v4m0-4h6m0 0v4m0-4v4m0 0H9" />
    </svg>
  ),
  clinic: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 12h6m0 0h-6" />
    </svg>
  ),
  ecommerce: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4l1-12z" />
    </svg>
  ),
  automation: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  'ai-tools': (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  ),
  default: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127l.214-1.281z" />
    </svg>
  )
};

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
  icon: JSX.Element;
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
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">{content.hero.badge_text}</span>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              {content.hero.headline_1} <br />
              <span className="gradient-text">{content.hero.headline_2}</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto">
              {content.hero.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 px-4 md:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {categories.map((category, categoryIndex) => (
            <AnimatedSection key={category.id} delay={categoryIndex * 0.1}>
              <motion.div className="space-y-4">
                {/* Category Header */}
                <motion.button
                  onClick={() => setExpandedCategory(expandedCategory === category.id ? null : category.id)}
                  className="w-full glass rounded-3xl p-6 md:p-8 overflow-hidden relative group hover:bg-white/10 transition-all"
                  whileHover={{ y: -2 }}
                >
                  {/* Background gradient on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center text-cyan-400 flex-shrink-0">
                        {category.icon}
                      </div>
                      <div>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-white">{category.name}</h2>
                        <p className="text-white/60 text-sm mt-1">{category.services.length} services</p>
                      </div>
                    </div>
                    <motion.div
                      animate={{ rotate: expandedCategory === category.id ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </motion.div>
                  </div>
                </motion.button>

                {/* Expandable Services */}
                <AnimatePresence>
                  {expandedCategory === category.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4 overflow-hidden"
                    >
                      {category.services.map((service, serviceIndex) => (
                        <motion.div
                          key={service.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: serviceIndex * 0.05 }}
                          className="glass rounded-2xl p-6 md:p-8 overflow-hidden relative group ml-4 border-l-2 border-cyan-500/30"
                          whileHover={{ x: 8 }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          <div className="relative z-10">
                            <div className="flex flex-col lg:flex-row gap-6">
                              {/* Left side - Info */}
                              <div className="lg:w-1/2">
                                <h3 className="font-display text-2xl font-bold mb-2 text-white">{service.title}</h3>
                                <p className="text-cyan-400 text-sm font-semibold mb-4">{service.subtitle}</p>
                                <p className="text-white/60 text-base mb-6">{service.description}</p>
                                


                                <Link
                                  to="/contact"
                                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-semibold text-black hover:shadow-lg hover:shadow-cyan-500/30 transition-shadow"
                                >
                                  Get Started
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                  </svg>
                                </Link>
                              </div>

                              {/* Right side - Features */}
                              <div className="lg:w-1/2">
                                <h4 className="text-white/50 text-sm font-semibold tracking-wider uppercase mb-4">What's Included</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {service.features.map((feature) => (
                                    <div key={feature} className="flex items-center gap-3">
                                      <div className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                        <svg className="w-3 h-3 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                      <span className="text-white/70 text-sm">{feature}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-4 md:px-6 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">How We Work</span>
            <h2 className="font-display text-3xl md:text-5xl font-bold">
              Our <span className="gradient-text">Process</span>
            </h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Discovery", desc: "We dive deep into your vision and requirements" },
              { step: "02", title: "Design", desc: "Strategic architecture and stunning UI/UX" },
              { step: "03", title: "Build", desc: "Rapid development with AI acceleration" },
              { step: "04", title: "Launch", desc: "Deploy, monitor, and optimize for success" }
            ].map((item, index) => (
              <AnimatedSection key={item.step} delay={index * 0.1}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="glass rounded-2xl p-6 text-center h-full"
                >
                  <span className="text-cyan-400 font-display text-sm font-bold">{item.step}</span>
                  <h3 className="font-display text-xl font-bold mt-2 mb-3">{item.title}</h3>
                  <p className="text-white/50 text-sm">{item.desc}</p>
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
                {content.cta.headline.includes('Started') ? (
                  <>Ready to Get <span className="gradient-text">Started?</span></>
                ) : (
                  <span dangerouslySetInnerHTML={{ __html: content.cta.headline }} />
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
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
