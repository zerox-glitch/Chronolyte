import { useEffect, useState, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, Play, Sparkles, X } from 'lucide-react';
import { CallNowButton } from '../components/CallNowButton';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';

interface ProjectVideo {
  id: number | string;
  video_url: string;
  video_title: string;
  is_primary: boolean;
}

interface PortfolioProject {
  id: number | string;
  title: string;
  client_name: string;
  project_type: string;
  short_description: string;
  tech_stack: string[];
  featured_image: string;
  live_url: string;
  video_url: string;
  metrics: Record<string, string>;
  videos: ProjectVideo[];
  portfolio_kind: 'concept' | 'personal' | 'client';
}

interface ProjectsResponse {
  success?: boolean;
  data?: unknown;
}

const CONCEPT_TITLES = new Set(['InvoiceFlow Pro', 'Luxe Real Estate', 'LeadGen AI']);
const PERSONAL_TITLES = new Set(['qrwho']);

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function parseArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || !value.trim()) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }
}

function parseStringList(value: unknown): string[] {
  return parseArray(value).map(asText).filter(Boolean);
}

function parseMetrics(value: unknown): Record<string, string> {
  let parsed = value;
  if (typeof value === 'string') {
    try {
      parsed = JSON.parse(value) as unknown;
    } catch {
      return {};
    }
  }
  const record = asRecord(parsed);
  return Object.fromEntries(
    Object.entries(record)
      .filter(([, item]) => item !== null && item !== undefined && item !== '')
      .map(([key, item]) => [key, asText(item)])
  );
}

function normalizeVideos(value: unknown): ProjectVideo[] {
  return parseArray(value).map((video, index) => {
    const raw = asRecord(video);
    return {
      id: typeof raw.id === 'number' || typeof raw.id === 'string' ? raw.id : index,
      video_url: asText(raw.video_url || raw.url),
      video_title: asText(raw.video_title || raw.title) || 'Project video',
      is_primary: Boolean(Number(raw.is_primary))
    };
  }).filter((video) => video.video_url);
}

function normalizeProject(value: unknown, index = 0): PortfolioProject {
  const raw = asRecord(value);
  const title = asText(raw.title) || 'Untitled project';
  const isQrWho = PERSONAL_TITLES.has(title.toLowerCase());
  const requestedKind = asText(raw.portfolio_kind);
  const portfolioKind: PortfolioProject['portfolio_kind'] = requestedKind === 'personal' || isQrWho
    ? 'personal'
    : requestedKind === 'concept' || CONCEPT_TITLES.has(title)
      ? 'concept'
      : 'client';
  const rawId = raw.id ?? raw.project_id;
  const id = typeof rawId === 'number' || typeof rawId === 'string' ? rawId : `project-${index}-${title}`;

  return {
    id,
    title,
    client_name: portfolioKind === 'concept'
      ? ''
      : asText(raw.client_name) || (portfolioKind === 'personal' ? 'Built by me' : 'Selected work'),
    project_type: asText(raw.project_type) || 'website',
    short_description: asText(raw.short_description || raw.description) || (isQrWho ? 'A free, browser-based studio for making artistic, photo-based QR codes—with live scannability checks and PNG/SVG export.' : ''),
    tech_stack: portfolioKind === 'personal' ? [] : parseStringList(raw.tech_stack),
    featured_image: asText(raw.featured_image || raw.thumbnail_image || raw.image_url) || (isQrWho ? 'https://www.qrwho.online/samples/aurora.jpg' : ''),
    live_url: isQrWho ? 'https://qrwho.online' : asText(raw.live_url || raw.demo_url),
    video_url: asText(raw.video_url),
    metrics: portfolioKind === 'client' ? parseMetrics(raw.metrics) : {},
    videos: normalizeVideos(raw.videos),
    portfolio_kind: portfolioKind
  };
}

const FALLBACK_PROJECTS: PortfolioProject[] = [
  normalizeProject({
    id: 'concept-invoiceflow', title: 'InvoiceFlow Pro', client_name: 'Concept project', portfolio_kind: 'concept', project_type: 'saas',
    short_description: 'A concept billing platform for independent teams, with invoice tracking, payment reminders and a clear finance dashboard.',
    featured_image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&h=700&fit=crop',
    tech_stack: ['React', 'Node.js', 'Stripe', 'PostgreSQL']
  }),
  normalizeProject({
    id: 'concept-luxe', title: 'Luxe Real Estate', client_name: 'Concept project', portfolio_kind: 'concept', project_type: 'website',
    short_description: 'A premium property-search experience concept with editorial listing pages, virtual tours and enquiry flows.',
    featured_image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&h=700&fit=crop',
    tech_stack: ['Next.js', 'Framer Motion', 'Sanity CMS']
  }),
  normalizeProject({
    id: 'concept-leadgen', title: 'LeadGen AI', client_name: 'Concept project', portfolio_kind: 'concept', project_type: 'automation',
    short_description: 'An automation concept for routing and qualifying inbound leads, with a simple CRM handoff and activity dashboard.',
    featured_image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&h=700&fit=crop',
    tech_stack: ['Python', 'OpenAI', 'Zapier', 'HubSpot']
  }),
  normalizeProject({
    id: 'personal-qrwho', title: 'QRWho', client_name: 'Built by me', portfolio_kind: 'personal', project_type: 'website',
    short_description: 'A free, browser-based studio for making artistic, photo-based QR codes—with live scannability checks and PNG/SVG export.',
    featured_image: 'https://www.qrwho.online/samples/aurora.jpg',
    live_url: 'https://qrwho.online'
  }),
  normalizeProject({
    id: 'concept-verdant', title: 'Verdant & Co.', client_name: 'Concept project', portfolio_kind: 'concept', project_type: 'website',
    short_description: 'An editorial storefront concept for a sustainable skincare brand, pairing calm product storytelling with a streamlined checkout.',
    featured_image: '/images/portfolio/verdant-commerce.jpg',
    tech_stack: ['Next.js', 'Shopify', 'Stripe']
  }),
  normalizeProject({
    id: 'concept-atelier', title: 'Atelier Estates', client_name: 'Concept project', portfolio_kind: 'concept', project_type: 'website',
    short_description: 'A boutique property discovery concept with cinematic home pages, saved searches and direct enquiry journeys.',
    featured_image: '/images/portfolio/atelier-estates.jpg',
    tech_stack: ['Next.js', 'Mapbox', 'CMS']
  }),
  normalizeProject({
    id: 'concept-pulseboard', title: 'Pulseboard', client_name: 'Concept project', portfolio_kind: 'concept', project_type: 'saas',
    short_description: 'A SaaS dashboard concept that brings operational metrics, trend charts and shared team views into one focused workspace.',
    featured_image: '/images/portfolio/pulseboard-dashboard.jpg',
    tech_stack: ['React', 'TypeScript', 'Node.js', 'PostgreSQL']
  })
];

function getFallbackProjects(): PortfolioProject[] {
  if (typeof window === 'undefined') return FALLBACK_PROJECTS;
  try {
    const stored = window.localStorage.getItem('all-projects');
    if (!stored) return FALLBACK_PROJECTS;
    const parsed: unknown = JSON.parse(stored);
    const candidates = Array.isArray(parsed) ? parsed : parseArray(asRecord(parsed).projects);
    const extras = candidates
      .map(normalizeProject)
      .filter((project) => !FALLBACK_PROJECTS.some((fallback) => fallback.title === project.title));
    return [...FALLBACK_PROJECTS, ...extras];
  } catch {
    return FALLBACK_PROJECTS;
  }
}

function loadVideosFromStorage(projectId: number | string): ProjectVideo[] {
  try {
    const stored = window.localStorage.getItem(`project-videos-${projectId}`);
    return stored ? normalizeVideos(stored) : [];
  } catch {
    return [];
  }
}

function projectTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    saas: 'SaaS',
    website: 'Website',
    automation: 'Automation',
    ai_tool: 'AI tool',
    custom: 'Custom build'
  };
  return labels[type] || type.replace(/[_-]/g, ' ');
}

function safeMetricLabel(value: string): string {
  return value.replace(/[_-]/g, ' ');
}

function AnimatedSection({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Portfolio() {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedVideoProject, setSelectedVideoProject] = useState<number | string | null>(null);

  const filters = [
    { id: 'all', label: 'All projects' },
    { id: 'saas', label: 'SaaS' },
    { id: 'website', label: 'Websites & apps' },
    { id: 'automation', label: 'Automation' },
    { id: 'ai_tool', label: 'AI tools' }
  ];

  useEffect(() => {
    let active = true;
    const fetchProjects = async () => {
      setLoading(true);
      let loadedProjects = getFallbackProjects();

      try {
        const response = await fetch('/api/projects?published=1');
        if (!response.ok) throw new Error(`Portfolio request failed (${response.status})`);
        const payload = await response.json() as ProjectsResponse;
        const body = asRecord(payload);
        if (body.success && Array.isArray(body.data) && body.data.length > 0) {
          loadedProjects = body.data.map(normalizeProject);
        }
      } catch (error) {
        console.warn('Using portfolio showcase projects because the API could not be reached:', error);
      }

      const projectsWithVideos = await Promise.all(loadedProjects.map(async (project) => {
        const localVideos = loadVideosFromStorage(project.id);
        if (project.videos.length > 0) return project;
        try {
          const response = await fetch(`/api/project-videos?project_id=${encodeURIComponent(String(project.id))}`);
          if (!response.ok) return { ...project, videos: localVideos };
          const payload = await response.json() as ProjectsResponse;
          const body = asRecord(payload);
          const videos = body.success ? normalizeVideos(body.data) : localVideos;
          return { ...project, videos: videos.length > 0 ? videos : localVideos };
        } catch {
          return { ...project, videos: localVideos };
        }
      }));

      if (active) setProjects(projectsWithVideos);
      if (active) setLoading(false);
    };

    void fetchProjects();
    return () => { active = false; };
  }, []);

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter((project) => project.project_type === activeFilter);
  const selectedProject = projects.find((project) => String(project.id) === String(selectedVideoProject));
  const selectedVideoUrl = selectedProject?.video_url || selectedProject?.videos.find((video) => video.is_primary)?.video_url || selectedProject?.videos[0]?.video_url || '';

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      <SiteNavigation />

      <section className="relative overflow-hidden px-4 pb-12 pt-32 md:px-6 md:pb-16 md:pt-40">
        <div className="pointer-events-none absolute left-1/2 top-20 h-96 w-[min(80vw,56rem)] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
              <Sparkles className="h-4 w-4" /> Selected work & experiments
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl md:text-7xl">
              Built with <span className="gradient-text">curiosity.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-white/55 md:text-lg">
              QRWho is a product I built. The other clearly marked concept projects show how I approach thoughtful, useful digital experiences.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="px-4 py-4 md:px-6" aria-label="Filter projects">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap justify-center gap-2.5">
            {filters.map((filter) => (
              <motion.button
                key={filter.id}
                type="button"
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${activeFilter === filter.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-black'
                  : 'border border-white/10 bg-white/5 text-white/65 hover:border-cyan-400/40 hover:text-white'}`}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-6 md:py-14" aria-label="Portfolio projects">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2].map((item) => <div key={item} className="glass h-[440px] animate-pulse rounded-3xl" />)}
            </div>
          ) : filteredProjects.length > 0 ? (
            <motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((project, index) => {
                  const videoUrl = project.video_url || project.videos.find((video) => video.is_primary)?.video_url || project.videos[0]?.video_url;
                  return (
                    <motion.article
                      key={project.id}
                      layout
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 18 }}
                      transition={{ duration: 0.25, delay: Math.min(index * 0.035, 0.2) }}
                      className="group glass flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_18px_55px_rgba(0,200,255,0.12)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-cyan-950 via-[#101a2a] to-blue-950">
                        {project.featured_image && (
                          <img
                            src={project.featured_image}
                            alt={`${project.title} project preview`}
                            loading="lazy"
                            onError={(event) => { event.currentTarget.style.display = 'none'; }}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        )}
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070c]/80 via-transparent to-black/10" />
                        {videoUrl && (
                          <button
                            type="button"
                            aria-label={`Play ${project.title} project video`}
                            onClick={() => setSelectedVideoProject(project.id)}
                            className="absolute inset-0 flex items-center justify-center bg-black/10 transition hover:bg-black/25"
                          >
                            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-black/45 text-cyan-200 backdrop-blur transition group-hover:scale-105">
                              <Play className="ml-1 h-6 w-6 fill-current" />
                            </span>
                          </button>
                        )}
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <span className="rounded-full border border-cyan-300/25 bg-[#07101e]/85 px-3 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur">
                            {projectTypeLabel(project.project_type)}
                          </span>
                          {project.portfolio_kind !== 'client' && (
                            <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur">
                              {project.portfolio_kind === 'personal' ? 'Personal project' : 'Concept project'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col p-5 md:p-6">
                        <h2 className="font-display text-xl font-bold text-white transition-colors group-hover:text-cyan-200 md:text-2xl">{project.title}</h2>
                        {project.client_name && <p className="mt-1.5 text-xs font-medium uppercase tracking-wider text-white/35">{project.client_name}</p>}
                        <p className="mt-4 flex-1 text-sm leading-6 text-white/60">{project.short_description}</p>

                        {project.tech_stack.length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-2">
                            {project.tech_stack.slice(0, 4).map((tag) => (
                              <span key={tag} className="rounded-lg border border-white/5 bg-white/[0.04] px-2.5 py-1.5 text-xs text-white/55">{tag}</span>
                            ))}
                            {project.tech_stack.length > 4 && <span className="rounded-lg border border-white/5 bg-white/[0.04] px-2.5 py-1.5 text-xs text-white/40">+{project.tech_stack.length - 4}</span>}
                          </div>
                        )}

                        {Object.keys(project.metrics).length > 0 && (
                          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-4">
                            {Object.entries(project.metrics).slice(0, 2).map(([key, value]) => (
                              <div key={key}>
                                <p className="text-sm font-bold text-cyan-200">{value}</p>
                                <p className="mt-0.5 text-[10px] uppercase tracking-wider text-white/35">{safeMetricLabel(key)}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {project.live_url && (
                          <a
                            href={project.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-400/10 px-4 py-2.5 text-sm font-semibold text-cyan-100 transition hover:border-cyan-200/50 hover:bg-cyan-400/15"
                          >
                            View live project <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="glass rounded-3xl px-6 py-12 text-center">
              <h2 className="font-display text-xl font-semibold text-white">No projects in this category yet.</h2>
              <button type="button" onClick={() => setActiveFilter('all')} className="mt-4 text-sm font-medium text-cyan-300 hover:text-white">Show all projects</button>
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-12 md:px-6 md:py-20">
        <div className="mx-auto max-w-4xl">
          <AnimatedSection>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#101a28] to-[#080b12] p-7 text-center md:p-12">
              <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
              <div className="relative">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Have a project in mind?</span>
                <h2 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
                  Let’s build something <span className="gradient-text">useful.</span>
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/55 md:text-base">
                  Tell us what you want to make and get a free, no-obligation plan with scope, timeline and a quote.
                </p>
                <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Link to="/contact" className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-7 py-3.5 font-semibold text-black transition hover:shadow-lg hover:shadow-cyan-500/25 sm:w-auto">
                    Start a project <ArrowUpRight className="h-4 w-4" />
                  </Link>
                  <CallNowButton />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <AnimatePresence>
        {selectedVideoProject !== null && (
          <motion.div
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideoProject(null)}
          >
            <motion.div
              className="relative w-full max-w-4xl"
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" aria-label="Close project video" onClick={() => setSelectedVideoProject(null)} className="absolute -right-1 -top-12 rounded-full border border-white/10 bg-white/5 p-2 text-white/70 transition hover:text-white sm:right-0">
                <X className="h-5 w-5" />
              </button>
              {selectedVideoUrl ? (
                <video key={selectedVideoUrl} src={selectedVideoUrl} controls autoPlay className="max-h-[80vh] w-full rounded-2xl bg-black" />
              ) : (
                <div className="flex h-80 items-center justify-center rounded-2xl bg-black/70 text-white/60">No video available.</div>
              )}
              <p className="mt-3 text-center text-sm text-white/60">{selectedProject?.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
