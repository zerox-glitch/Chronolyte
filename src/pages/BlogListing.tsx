import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, BookOpen, CalendarDays, Clock3, Search, Sparkles } from 'lucide-react';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-dark-900 text-white">
      <SiteNavigation />
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -right-40 top-[45rem] h-96 w-96 rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <main className="relative z-10 px-4 pb-16 pt-28 md:px-6 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-sm text-white/45">
            <Link to="/" className="transition-colors hover:text-cyan-300">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-white/80">Guides</span>
            {selectedCategory && <><span aria-hidden="true">/</span><span className="text-white/65">{selectedCategory}</span></>}
          </nav>

          <section className="relative mb-10 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#101c2b] via-[#0a101b] to-[#090b13] px-6 py-10 md:px-12 md:py-14">
            <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]" />
            <div className="relative max-w-3xl">
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                <Sparkles className="h-3.5 w-3.5" /> The Chronolyte guides
              </span>
              <h1 className="font-display text-4xl font-bold leading-tight text-white md:text-6xl">
                {searchQuery ? <>Search <span className="gradient-text">the guides</span></> : selectedCategory ? <>Browse <span className="gradient-text">{selectedCategory}</span></> : <>Build with <span className="gradient-text">more confidence.</span></>}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/60 md:text-lg">
                Clear, practical advice on project costs, timelines and hiring — so you can make your next digital move with confidence.
              </p>
            </div>
          </section>

          <section aria-label="Search and filter guides" className="glass mb-9 rounded-3xl p-4 md:p-6">
            <form onSubmit={handleSearch} className="flex flex-col gap-3 sm:flex-row">
              <label className="relative flex-1">
                <span className="sr-only">Search guides</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/35" />
                <input
                  type="search"
                  placeholder="Search costs, websites, apps, hiring…"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-12 pr-4 text-sm text-white outline-none placeholder:text-white/35 transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/10"
                />
              </label>
              <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 font-semibold text-black transition hover:shadow-lg hover:shadow-cyan-500/20">
                Search <ArrowRight className="h-4 w-4" />
              </button>
            </form>
            {categories.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="mr-1 text-xs font-medium uppercase tracking-wider text-white/40">Explore</span>
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    aria-pressed={selectedCategory === category}
                    className={`rounded-full border px-3.5 py-2 text-xs font-medium transition ${selectedCategory === category ? 'border-cyan-300/50 bg-cyan-400/15 text-cyan-200' : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:text-white'}`}
                  >
                    {category}
                  </button>
                ))}
                {(selectedCategory || searchQuery) && (
                  <button type="button" onClick={clearFilters} className="ml-auto text-xs text-cyan-300 transition hover:text-white">Clear filters</button>
                )}
              </div>
            )}
          </section>

          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{selectedCategory || 'Explore'}</p>
              <h2 className="mt-1 font-display text-2xl font-bold text-white md:text-3xl">
                {searchQuery ? `Results for “${searchQuery}”` : selectedCategory ? `Latest ${selectedCategory.toLowerCase()}` : 'Ideas worth getting right'}
              </h2>
            </div>
            {!loading && blogs.length > 0 && <span className="text-sm text-white/40">Page {page} of {totalPages}</span>}
          </div>

          {error && (
            <div role="alert" className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/5 px-5 py-4 text-sm text-red-200">
              {error} <button type="button" onClick={() => window.location.reload()} className="ml-2 underline underline-offset-4">Retry</button>
            </div>
          )}

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {[0, 1, 2, 3, 4, 5].map((item) => <div key={item} className="glass h-[390px] animate-pulse rounded-3xl" />)}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {blogs.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blog/${blog.slug}`}
                  className="group glass flex h-full flex-col overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_18px_55px_rgba(0,200,255,0.12)]"
                >
                  <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-cyan-950 via-[#101a2a] to-blue-950">
                    {blog.featured_image ? (
                      <img src={blog.featured_image} alt={blog.featured_image_alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-cyan-300/50"><BookOpen className="h-12 w-12" /></div>
                    )}
                    <span className="absolute left-4 top-4 rounded-full border border-cyan-300/25 bg-[#07101e]/85 px-3 py-1.5 text-xs font-semibold text-cyan-100 backdrop-blur">
                      {blog.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 md:p-6">
                    <h3 className="font-display text-xl font-bold leading-snug text-white transition-colors group-hover:text-cyan-200">{blog.title}</h3>
                    <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-white/55">{blog.excerpt}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/10 pt-4 text-xs text-white/40">
                      <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {formatBlogDate(blog.published_at)}</span>
                      {blog.reading_time > 0 && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {blog.reading_time} min read</span>}
                    </div>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition group-hover:gap-3">
                      Read the guide <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : !error ? (
            <div className="glass rounded-3xl px-6 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200"><BookOpen className="h-7 w-7" /></div>
              <h2 className="mt-5 font-display text-2xl font-bold text-white">No guides found</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/50">
                {searchQuery || selectedCategory ? 'Try another search or clear your filters to see all guides.' : 'We’re preparing more practical guides. Check back soon.'}
              </p>
              {(searchQuery || selectedCategory) && <button type="button" onClick={clearFilters} className="mt-5 rounded-full border border-cyan-300/25 px-5 py-2.5 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-400/10">Show all guides</button>}
            </div>
          ) : null}

          {!loading && totalPages > 1 && (
            <nav aria-label="Guide pages" className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <button type="button" disabled={page <= 1} onClick={() => changePage(page - 1)} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-white/65 transition enabled:hover:border-cyan-300/40 enabled:hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30">
                <ArrowRight className="h-4 w-4 rotate-180" /> Previous
              </button>
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2.5 text-sm font-medium text-cyan-100">{page} / {totalPages}</span>
              <button type="button" disabled={page >= totalPages} onClick={() => changePage(page + 1)} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm text-white/65 transition enabled:hover:border-cyan-300/40 enabled:hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            </nav>
          )}

          <section className="relative mt-16 overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-gradient-to-r from-cyan-950/50 via-[#0d1523] to-blue-950/40 p-7 md:mt-24 md:p-12">
            <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Have something in mind?</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">Turn the next idea into a real plan.</h2>
                <p className="mt-3 text-sm leading-6 text-white/55 md:text-base">Tell us what you’re building. We’ll help you map the scope, timeline and budget — free, with no obligation.</p>
              </div>
              <Link to="/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 font-semibold text-black transition hover:shadow-lg hover:shadow-cyan-500/25">
                Start your project free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
