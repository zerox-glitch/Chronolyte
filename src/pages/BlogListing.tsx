import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Clock3, Search } from 'lucide-react';
import { CtaBand, PageHero, Sheet } from '../components/editorial/EditorialPage';
import { BlogRecord, formatBlogDate, normalizeBlog } from '../utils/blog';

interface BlogListResponse {
  success?: boolean;
  data?: unknown[];
  pagination?: { pages?: number };
  message?: string;
}

export function BlogListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { category: routeCategory } = useParams<{ category?: string }>();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const searchQuery = pathname.startsWith('/blog/search')
    ? searchParams.get('q') || ''
    : searchParams.get('search') || '';
  const selectedCategory = routeCategory || searchParams.get('category') || '';
  const requestedPage = Number(searchParams.get('page') || '1');
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;

  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => setSearchInput(searchQuery), [searchQuery]);

  useEffect(() => {
    let cancelled = false;
    const fetchBlogs = async () => {
      setLoading(true);
      setError('');
      try {
        let url = `/api/blogs.php?action=list&page=${page}&limit=9`;
        if (selectedCategory) {
          url = `/api/blogs.php?action=category&category=${encodeURIComponent(selectedCategory)}&page=${page}&limit=9`;
        } else if (searchQuery) {
          url = `/api/blogs.php?action=search&q=${encodeURIComponent(searchQuery)}&page=${page}&limit=9`;
        }

        const response = await fetch(url);
        const data = await response.json() as BlogListResponse;
        if (!response.ok || !data.success || !Array.isArray(data.data)) {
          throw new Error(data.message || 'We couldn’t load the guides. Please try again.');
        }
        if (cancelled) return;
        setBlogs(data.data.map(normalizeBlog));
        setTotalPages(Math.max(1, Number(data.pagination?.pages) || 1));
      } catch (fetchError) {
        if (cancelled) return;
        setBlogs([]);
        setTotalPages(1);
        setError(fetchError instanceof Error ? fetchError.message : 'We couldn’t load the guides. Please try again.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchBlogs();
    return () => { cancelled = true; };
  }, [page, searchQuery, selectedCategory]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/blogs.php?action=list&limit=100')
      .then((response) => response.json() as Promise<BlogListResponse>)
      .then((data) => {
        if (!cancelled && data.success && Array.isArray(data.data)) {
          const names = data.data.map(normalizeBlog).map((blog) => blog.category).filter(Boolean);
          setCategories([...new Set(names)]);
        }
      })
      .catch((fetchError: unknown) => console.error('Failed to fetch guide categories:', fetchError));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const title = searchQuery
      ? `Search results for “${searchQuery.slice(0, 60)}” | Chronolyte Guides`
      : selectedCategory
        ? `${selectedCategory} Guides | Chronolyte`
        : 'Web Design, Development & SaaS Guides | Chronolyte';
    const description = searchQuery
      ? `Search Chronolyte guides for ${searchQuery.slice(0, 90)}.`
      : selectedCategory
        ? `Practical ${selectedCategory} guides on project scope, costs, hiring, and digital product planning.`
        : 'Practical guides on website and app costs, hiring developers, SaaS MVP planning, and building digital products with clearer scope and budgets.';
    const isFiltered = Boolean(searchQuery || selectedCategory || page > 1);
    const canonicalPath = isFiltered ? pathname : '/blog';
    const canonicalUrl = `${window.location.origin}${canonicalPath}`;

    document.title = title;
    const setMeta = (selector: string, attr: string, value: string, create?: () => HTMLElement) => {
      let element = document.querySelector<HTMLElement>(selector);
      if (!element && create) {
        element = create();
        document.head.appendChild(element);
      }
      element?.setAttribute(attr, value);
    };
    setMeta('meta[name="description"]', 'content', description, () => {
      const element = document.createElement('meta');
      element.name = 'description';
      return element;
    });
    setMeta('meta[name="robots"]', 'content', isFiltered ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', () => {
      const element = document.createElement('meta');
      element.name = 'robots';
      return element;
    });
    setMeta('link[rel="canonical"]', 'href', canonicalUrl, () => {
      const element = document.createElement('link');
      element.rel = 'canonical';
      return element;
    });
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', canonicalUrl);
    setMeta('meta[name="twitter:title"]', 'content', title);
    setMeta('meta[name="twitter:description"]', 'content', description);
  }, [pathname, page, searchQuery, selectedCategory]);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchInput.trim();
    navigate(query ? `/blog/search?q=${encodeURIComponent(query)}` : '/blog');
  };

  const handleCategorySelect = (category: string) => {
    navigate(category === selectedCategory ? '/blog' : `/blog/category/${encodeURIComponent(category)}`);
  };

  const changePage = (nextPage: number) => {
    const nextParams = new URLSearchParams(searchParams);
    if (nextPage <= 1) nextParams.delete('page');
    else nextParams.set('page', String(nextPage));
    setSearchParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearchInput('');
    navigate('/blog');
  };


  const heading = searchQuery
    ? <>Search <em>the guides</em></>
    : selectedCategory
      ? <>Browse <em>{selectedCategory}</em></>
      : <>Build with <em>more confidence.</em></>;

  return (
    <>
      <PageHero
        eyebrow="The Chronolyte guides"
        title={heading}
        lede="Clear, practical advice on project costs, timelines and hiring — so you can make your next digital move with confidence."
        meta={
          <>
            <span>{categories.length > 0 ? `${categories.length} topics` : 'Cost guides'}</span>
            <span>Written by the studio</span>
            <span>No fluff</span>
          </>
        }
      />

      <Sheet tone="paper">
        <nav aria-label="Breadcrumb" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem', marginBottom: '1.4rem', fontSize: '0.8rem', color: '#6a746a' }}>
          <Link to="/" className="ed-link" style={{ textDecoration: 'none' }}>Home</Link>
          <span aria-hidden="true">/</span>
          <span style={{ color: '#26312a', fontWeight: 700 }}>Guides</span>
          {selectedCategory && (
            <>
              <span aria-hidden="true">/</span>
              <span>{selectedCategory}</span>
            </>
          )}
        </nav>

        <form onSubmit={handleSearch} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '1rem' }}>
          <label style={{ position: 'relative', flex: '1 1 240px' }}>
            <span className="sr-only">Search guides</span>
            <Search style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 18, height: 18, color: '#7b8578' }} />
            <input
              type="search"
              placeholder="Search costs, websites, apps, hiring…"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="ed-input"
              style={{ paddingLeft: 42 }}
            />
          </label>
          <button type="submit" className="ed-btn">Search <ArrowRight className="h-4 w-4" /></button>
        </form>

        {categories.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginBottom: '1.6rem' }}>
            <span style={{ marginRight: '0.3rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7b8578' }}>Explore</span>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => handleCategorySelect(category)}
                aria-pressed={selectedCategory === category}
                className={`ed-choice ${selectedCategory === category ? 'ed-choice--active' : ''}`}
                style={{ padding: '0.36rem 0.8rem', fontSize: '0.78rem', fontWeight: 700 }}
              >
                {category}
              </button>
            ))}
            {(selectedCategory || searchQuery) && (
              <button type="button" onClick={clearFilters} className="ed-link" style={{ marginLeft: 'auto', background: 'none', border: 0, cursor: 'pointer', fontSize: '0.8rem' }}>Clear filters</button>
            )}
          </div>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: '0.8rem', marginBottom: '1.4rem' }}>
          <div>
            <p className="ed-rubric">{selectedCategory || 'Explore'}</p>
            <h2 className="ed-title ed-title--sm" style={{ textTransform: 'none', letterSpacing: '-0.03em' }}>
              {searchQuery ? `Results for “${searchQuery}”` : selectedCategory ? `Latest ${selectedCategory.toLowerCase()}` : 'Ideas worth getting right'}
            </h2>
          </div>
          {!loading && blogs.length > 0 && <span style={{ fontSize: '0.8rem', color: '#6a746a' }}>Page {page} of {totalPages}</span>}
        </div>

        {error && (
          <div role="alert" className="ed-alert" style={{ marginBottom: '1.2rem' }}>
            {error} <button type="button" onClick={() => window.location.reload()} className="ed-link" style={{ background: 'none', border: 0, cursor: 'pointer' }}>Retry</button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="ed-card" style={{ height: 340, alignItems: 'center', justifyContent: 'center' }}>
                <span className="ed-loading-dot" />
              </div>
            ))}
          </div>
        ) : blogs.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog) => (
              <Link key={blog.id} to={`/blog/${blog.slug}`} className="ed-card" style={{ padding: 0, overflow: 'hidden', textDecoration: 'none' }}>
                <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: '#e6ddc9', borderBottom: '1px solid rgba(84,72,48,0.3)' }}>
                  {blog.featured_image ? (
                    <img src={blog.featured_image} alt={blog.featured_image_alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#7b182a' }}><BookOpen className="h-10 w-10" /></div>
                  )}
                  <span className="ed-chip" style={{ position: 'absolute', left: 12, top: 12, background: '#f0ebdd' }}>{blog.category}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, padding: 'clamp(16px, 2vw, 22px)' }}>
                  <h3 className="ed-card__title" style={{ marginTop: 0 }}>{blog.title}</h3>
                  <p className="ed-card__body" style={{ flexGrow: 1 }}>{blog.excerpt}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.9rem', marginTop: '0.9rem', paddingTop: '0.8rem', borderTop: '1px solid rgba(84,72,48,0.2)', fontSize: '0.74rem', color: '#6a746a' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><CalendarDays className="h-3.5 w-3.5" /> {formatBlogDate(blog.published_at)}</span>
                    {blog.reading_time > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock3 className="h-3.5 w-3.5" /> {blog.reading_time} min read</span>}
                  </div>
                  <span style={{ marginTop: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#7b182a' }}>
                    Read the guide <ArrowUpRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : !error ? (
          <div className="ed-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <div style={{ margin: '0 auto 1rem', width: 52, height: 52, display: 'grid', placeItems: 'center', borderRadius: 4, background: 'rgba(197,222,151,0.6)', border: '1px solid rgba(123,24,42,0.3)', color: '#7b182a' }}>
              <BookOpen className="h-6 w-6" />
            </div>
            <h2 className="ed-card__title">No guides found</h2>
            <p className="ed-card__body" style={{ maxWidth: '34rem', margin: '0.4rem auto 0' }}>
              {searchQuery || selectedCategory ? 'Try another search or clear your filters to see all guides.' : 'We’re preparing more practical guides. Check back soon.'}
            </p>
            {(searchQuery || selectedCategory) && <button type="button" onClick={clearFilters} className="ed-btn ed-btn--sm" style={{ marginTop: '1rem' }}>Show all guides</button>}
          </div>
        ) : null}

        {!loading && totalPages > 1 && (
          <nav aria-label="Guide pages" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginTop: '2rem' }}>
            <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="ed-btn ed-btn--ghost ed-btn--sm" style={{ opacity: page <= 1 ? 0.35 : 1 }}>
              <ArrowRight className="h-4 w-4 rotate-180" /> Previous
            </button>
            <span className="ed-chip">{page} / {totalPages}</span>
            <button type="button" disabled={page >= totalPages} onClick={() => changePage(page + 1)} className="ed-btn ed-btn--ghost ed-btn--sm" style={{ opacity: page >= totalPages ? 0.35 : 1 }}>
              Next <ArrowRight className="h-4 w-4" />
            </button>
          </nav>
        )}
      </Sheet>

      <CtaBand
        eyebrow="Have something in mind?"
        title={<>Turn the next idea into a <em>real plan.</em></>}
        description="Tell us what you’re building. We’ll help you map the scope, timeline and budget — free, with no obligation."
        primaryTo="/contact"
        primaryLabel="Start your project free"
        secondaryTo="/services"
        secondaryLabel="Explore services"
        note="One business day reply. No card required."
      />
    </>
  );
}
