import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ExternalLink, Play, X } from 'lucide-react';
import { CallNowButton } from '../components/CallNowButton';
import { CtaBand, PageHero, Sheet } from '../components/editorial/EditorialPage';

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
    <>
      <PageHero
        eyebrow="Selected work & experiments"
        title={<>Built with <em>curiosity.</em></>}
        lede="QRWho is a product I built. The other clearly marked concept projects show how I approach thoughtful, useful digital experiences."
        actions={
          <>
            <Link to="/contact" className="ed-btn">Start a project <ArrowUpRight className="h-4 w-4" /></Link>
            <CallNowButton />
          </>
        }
        meta={
          <>
            <span>Client work</span>
            <span>Personal builds</span>
            <span>Concept projects</span>
          </>
        }
      />

      <Sheet tone="paper">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: 'clamp(18px, 2.4vw, 28px)' }}>
          <div>
            <p className="ed-rubric">The work<span className="ed-rubric__num">01 / 02</span></p>
            <h2 className="ed-title ed-title--sm">Filter the <em>portfolio</em></h2>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }} role="group" aria-label="Filter projects">
            {filters.map((filter) => (
              <button
                key={filter.id}
                type="button"
                aria-pressed={activeFilter === filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`ed-choice ${activeFilter === filter.id ? 'ed-choice--active' : ''}`}
                style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', fontWeight: 700 }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="ed-card" style={{ height: 380, alignItems: 'center', justifyContent: 'center' }}>
                <span className="ed-loading-dot" />
              </div>
            ))}
          </div>
        ) : filteredProjects.length > 0 ? (
          <motion.div layout className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                    transition={{ duration: 0.24, delay: Math.min(index * 0.03, 0.18) }}
                    className="ed-card"
                    style={{ padding: 0, overflow: 'hidden' }}
                  >
                    <div style={{ position: 'relative', aspectRatio: '16 / 10', overflow: 'hidden', background: '#e6ddc9', borderBottom: '1px solid rgba(84,72,48,0.3)' }}>
                      {project.featured_image && (
                        <img
                          src={project.featured_image}
                          alt={`${project.title} project preview`}
                          loading="lazy"
                          onError={(event) => { event.currentTarget.style.display = 'none'; }}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      )}
                      {videoUrl && (
                        <button
                          type="button"
                          aria-label={`Play ${project.title} project video`}
                          onClick={() => setSelectedVideoProject(project.id)}
                          style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(31,39,35,0.18)', border: 0, cursor: 'pointer' }}
                        >
                          <span style={{ display: 'grid', placeItems: 'center', width: 54, height: 54, borderRadius: '50%', background: '#f0ebdd', border: '2px solid #7b182a', color: '#7b182a' }}>
                            <Play className="ml-1 h-5 w-5 fill-current" />
                          </span>
                        </button>
                      )}
                      <div style={{ position: 'absolute', left: 10, top: 10, display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        <span className="ed-chip" style={{ background: '#f0ebdd' }}>{projectTypeLabel(project.project_type)}</span>
                        {project.portfolio_kind !== 'client' && (
                          <span className="ed-chip" style={{ background: '#f0ebdd' }}>{project.portfolio_kind === 'personal' ? 'Personal project' : 'Concept project'}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 'clamp(16px, 2vw, 22px)' }}>
                      <h3 className="ed-card__title" style={{ marginTop: 0 }}>{project.title}</h3>
                      {project.client_name && <p style={{ margin: '0.2rem 0 0', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8577' }}>{project.client_name}</p>}
                      <p className="ed-card__body" style={{ marginTop: '0.7rem', flexGrow: 1 }}>{project.short_description}</p>

                      {project.tech_stack.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.8rem' }}>
                          {project.tech_stack.slice(0, 4).map((tag) => (
                            <span key={tag} className="ed-chip" style={{ background: 'transparent', borderColor: 'rgba(84,72,48,0.25)', color: '#4c5a50', fontWeight: 600 }}>{tag}</span>
                          ))}
                          {project.tech_stack.length > 4 && <span className="ed-chip" style={{ background: 'transparent', borderColor: 'rgba(84,72,48,0.25)', color: '#5f6d62' }}>+{project.tech_stack.length - 4}</span>}
                        </div>
                      )}

                      {Object.keys(project.metrics).length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1.4rem', marginTop: '0.9rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(84,72,48,0.2)' }}>
                          {Object.entries(project.metrics).slice(0, 2).map(([key, value]) => (
                            <div key={key}>
                              <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#7b182a' }}>{value}</p>
                              <p style={{ margin: '0.15rem 0 0', fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#8a8577' }}>{safeMetricLabel(key)}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {project.live_url && (
                        <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="ed-btn ed-btn--ghost ed-btn--sm" style={{ marginTop: '0.9rem', width: 'fit-content', textDecoration: 'none' }}>
                          View live project <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="ed-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <h3 className="ed-card__title">No projects in this category yet.</h3>
            <button type="button" onClick={() => setActiveFilter('all')} className="ed-btn ed-btn--sm" style={{ marginTop: '1rem' }}>Show all projects</button>
          </div>
        )}
      </Sheet>

      <CtaBand
        eyebrow="02 / 02 — Have a project in mind?"
        title={<>Let’s build something <em>useful.</em></>}
        description="Tell us what you want to make and get a free, no-obligation plan with scope, timeline and a quote."
        primaryTo="/contact"
        primaryLabel="Start a project"
        secondaryTo="/pricing"
        secondaryLabel="See pricing"
        note="References and project walkthroughs available on request."
      >
        <div style={{ marginTop: '1rem' }}><CallNowButton /></div>
      </CtaBand>

      <AnimatePresence>
        {selectedVideoProject !== null && (
          <motion.div
            className="ed-modal-backdrop"
            style={{ alignItems: 'center', zIndex: 90 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedVideoProject(null)}
          >
            <motion.div
              initial={{ scale: 0.96, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 12 }}
              onClick={(event) => event.stopPropagation()}
              style={{ position: 'relative', width: '100%', maxWidth: '56rem' }}
            >
              <button
                type="button"
                aria-label="Close project video"
                onClick={() => setSelectedVideoProject(null)}
                className="ed-btn ed-btn--onDark ed-btn--sm"
                style={{ position: 'absolute', right: 0, top: -46 }}
              >
                <X className="h-4 w-4" /> Close
              </button>
              {selectedVideoUrl ? (
                <video key={selectedVideoUrl} src={selectedVideoUrl} controls autoPlay style={{ width: '100%', maxHeight: '80vh', borderRadius: 5, background: '#000' }} />
              ) : (
                <div style={{ display: 'grid', placeItems: 'center', height: 260, borderRadius: 5, background: '#1f2723', color: '#f0ebdd' }}>No video available.</div>
              )}
              <p style={{ marginTop: '0.7rem', textAlign: 'center', fontSize: '0.85rem', color: '#f0ebdd' }}>{selectedProject?.title}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
