import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { NavLogo } from '../components/NavLogo';
import { CallNowButton } from '../components/CallNowButton';
import { Footer } from '../components/Footer';
import { Play, X } from 'lucide-react';

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

interface ProjectVideo {
  id: number;
  video_url: string;
  video_title: string;
  is_primary: boolean;
}

interface PortfolioProject {
  id: number;
  title: string;
  client_name: string;
  project_type: string;
  short_description: string;
  tech_stack: string[];
  featured_image: string;
  video_url?: string;
  metrics?: Record<string, string>;
  videos?: ProjectVideo[];
}

export function Portfolio() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedVideoProject, setSelectedVideoProject] = useState<number | null>(null);

  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'saas', label: 'SaaS' },
    { id: 'website', label: 'Websites' },
    { id: 'automation', label: 'Automation' },
    { id: 'ai_tool', label: 'AI Tools' }
  ];

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects?published=1');
        const data = await response.json();

        const rawProjects = data.success && Array.isArray(data.data) ? data.data : getSampleProjects();

        const projectsWithVideos = await Promise.all(rawProjects.map(async (p: PortfolioProject) => {
          try {
            const videosResponse = await fetch(`/api/project-videos?project_id=${p.id}`);
            const videosData = await videosResponse.json();
            return {
              ...p,
              videos: videosData.success ? videosData.data : loadVideosToDev(p.id)
            };
          } catch {
            return {
              ...p,
              videos: loadVideosToDev(p.id)
            };
          }
        }));

        setProjects(projectsWithVideos);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
        const sample = getSampleProjects();
        const withVideos = sample.map(p => ({
          ...p,
          videos: loadVideosToDev(p.id)
        }));
        setProjects(withVideos);
      } finally {
        setLoading(false);
      }
    };

    const loadVideosToDev = (projectId: number) => {
      const stored = localStorage.getItem(`project-videos-${projectId}`);
      return stored ? JSON.parse(stored) : [];
    };

    fetchProjects();
  }, []);

  const getSampleProjects = () => {
    const sample = [
      {
        id: 1,
        title: 'InvoiceFlow Pro',
        client_name: 'InvoiceFlow',
        project_type: 'saas',
        short_description: 'Complete invoicing and billing SaaS platform with automated reminders, payment tracking, and financial analytics.',
        featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        tech_stack: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
        metrics: { users: '2,500+', revenue: '$45K MRR' }
      },
      {
        id: 2,
        title: 'Luxe Real Estate',
        client_name: 'Luxe RE',
        project_type: 'website',
        short_description: 'Premium real estate website with virtual tours, property search, and lead capture system.',
        featured_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        tech_stack: ['Next.js', 'Framer Motion', 'Sanity CMS'],
        metrics: { traffic: '50K/mo', leads: '200+/mo' }
      },
      {
        id: 3,
        title: 'LeadGen AI',
        client_name: 'LeadGen',
        project_type: 'automation',
        short_description: 'Automated lead generation system with AI-powered qualification and CRM integration.',
        featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
        tech_stack: ['Python', 'OpenAI', 'Zapier', 'HubSpot'],
        metrics: { leads: '1,000+/mo', accuracy: '95%' }
      }
    ];
    
    // Add custom projects from localStorage
    const customProjects = localStorage.getItem('all-projects');
    if (customProjects) {
      try {
        const stored = JSON.parse(customProjects);
        return [...sample, ...stored];
      } catch (e) {
        return sample;
      }
    }
    return sample;
  };

  const filteredProjects = activeFilter === 'all' 
    ? projects 
    : projects.filter(p => p.project_type === activeFilter);

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Navigation */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }} className="backdrop-blur-2xl backdrop-saturate-150 bg-dark-900/60 border-b border-white/10 shadow-lg shadow-black/20 py-4">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <NavLogo />
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <Link to="/" className="hover:text-cyan-400 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-cyan-400 transition-colors">About</Link>
            <Link to="/services" className="hover:text-cyan-400 transition-colors">Services</Link>
            <Link to="/pricing" className="hover:text-cyan-400 transition-colors">Pricing</Link>
            <Link to="/portfolio" className="text-cyan-400">Portfolio</Link>
            <Link to="/contact" className="hover:text-cyan-400 transition-colors">Contact</Link>
          </nav>
          <CallNowButton />
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-cyan-400 text-sm font-semibold tracking-wider uppercase mb-4 block">Our Work</span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              Projects That <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Deliver Results</span>
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-3xl mx-auto">
              Browse our portfolio of successful projects. From custom websites and SaaS platforms
              to intelligent automations, each project represents our commitment to innovation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter.id
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:border-cyan-400/50'
                }`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-white/60">Loading projects...</p>
            </div>
          ) : (
            <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <motion.div
                      whileHover={{ y: -10 }}
                      className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden group h-full flex flex-col hover:border-cyan-400/30 transition-colors"
                    >
                      {/* Image/Video */}
                      <div className="relative h-48 overflow-hidden bg-black/40">
                        {project.video_url || (project.videos && project.videos.length > 0) ? (
                          <>
                            <video
                              src={project.video_url || project.videos?.[0]?.video_url}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                            <button
                              onClick={() => setSelectedVideoProject(project.id)}
                              className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors"
                            >
                              <Play className="w-12 h-12 text-cyan-400" />
                            </button>
                          </>
                        ) : (
                          <img
                            src={project.featured_image || 'https://via.placeholder.com/400x300?text=No+Image'}
                            alt={project.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900 to-transparent opacity-60" />
                        
                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-cyan-500/20 backdrop-blur-sm rounded-full text-xs text-cyan-400 font-medium border border-cyan-500/30">
                            {project.project_type?.toUpperCase() || 'PROJECT'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">
                          {project.title}
                        </h3>
                        <p className="text-white/50 text-sm mb-2">{project.client_name}</p>
                        <p className="text-white/60 text-sm mb-4 flex-1">
                          {project.short_description}
                        </p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {project.tech_stack && project.tech_stack.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs text-white/50 bg-white/5 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        {/* Stats */}
                        {project.metrics && (
                          <div className="flex gap-4 pt-4 border-t border-white/5">
                            {Object.entries(project.metrics).slice(0, 2).map(([key, value]) => (
                              <div key={key}>
                                <p className="text-cyan-400 font-bold text-sm">{value}</p>
                                <p className="text-white/40 text-xs capitalize">{key}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </section>

      {/* Video Modal */}
      {selectedVideoProject && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedVideoProject(null)}
        >
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedVideoProject(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white z-10"
            >
              <X className="w-6 h-6" />
            </button>
            {(() => {
              const project = filteredProjects.find(p => p.id === selectedVideoProject);
              const videoUrl = project?.video_url || project?.videos?.[0]?.video_url;
              if (!videoUrl) {
                return (
                  <div className="w-full h-96 bg-black/40 rounded-xl flex items-center justify-center">
                    <p className="text-white/60">No video available</p>
                  </div>
                );
              }
              return (
                <video
                  key={videoUrl}
                  src={videoUrl}
                  controls
                  autoPlay
                  className="w-full rounded-xl bg-black"
                />
              );
            })()}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection>
            <div className="bg-white/5 border border-white/10 rounded-3xl p-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Start Your <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Next Project?</span>
              </h2>
              <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                Let's discuss your vision and create something exceptional together.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full font-bold text-black hover:shadow-lg hover:shadow-cyan-500/50 transition-shadow text-center"
                >
                  Get Started
                </Link>
                <CallNowButton />
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
