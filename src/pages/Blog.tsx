import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Clock3, Eye, Sparkles } from 'lucide-react';
import { Footer } from '../components/Footer';
import { SiteNavigation } from '../components/SiteNavigation';
import { BlogRecord, formatBlogDate, normalizeBlog } from '../utils/blog';

interface BlogPostResponse {
  success?: boolean;
  data?: unknown;
  message?: string;
}

interface BlogListResponse {
  success?: boolean;
  data?: unknown[];
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [blog, setBlog] = useState<BlogRecord | null>(null);
  const [relatedBlogs, setRelatedBlogs] = useState<BlogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchBlog = async () => {
      setLoading(true);
      setError('');
      setBlog(null);
      setRelatedBlogs([]);
      window.scrollTo({ top: 0, behavior: 'auto' });

      try {
        const response = await fetch(`/api/blogs.php?action=get&slug=${encodeURIComponent(slug || '')}`);
        const data = await response.json() as BlogPostResponse;
        if (!response.ok || !data.success || !data.data) {
          throw new Error(data.message || 'This guide may have moved or no longer exists.');
        }

        const post = normalizeBlog(data.data);
        if (cancelled) return;
        setBlog(post);
        document.title = `${post.meta_title || post.title} | Chronolyte`;
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) metaDescription.setAttribute('content', post.meta_description || post.excerpt);

        if (post.category) {
          const params = new URLSearchParams({ action: 'category', category: post.category, limit: '4' });
          try {
            const relatedResponse = await fetch(`/api/blogs.php?${params.toString()}`);
            const relatedData = await relatedResponse.json() as BlogListResponse;
            if (!cancelled && relatedData.success && Array.isArray(relatedData.data)) {
              setRelatedBlogs(
                relatedData.data
                  .map(normalizeBlog)
                  .filter((item) => String(item.id) !== String(post.id))
                  .slice(0, 3)
              );
            }
          } catch (relatedError) {
            console.error('Failed to fetch related guides:', relatedError);
          }
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : 'We couldn’t load this guide. Please try again.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void fetchBlog();
    return () => { cancelled = true; };
  }, [slug]);

  return (
    <div className="min-h-screen overflow-x-hidden bg-dark-900 text-white">
      <SiteNavigation />
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-40 top-48 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]" />
        <div className="absolute -right-40 top-[55rem] h-96 w-96 rounded-full bg-blue-600/10 blur-[150px]" />
      </div>

      <main className="relative z-10 px-4 pb-16 pt-28 md:px-6 md:pt-36">
        {loading ? (
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 h-4 w-52 animate-pulse rounded bg-white/10" />
            <div className="glass animate-pulse rounded-[2rem] p-7 md:p-12">
              <div className="h-5 w-32 rounded bg-white/10" />
              <div className="mt-6 h-12 max-w-3xl rounded bg-white/10" />
              <div className="mt-3 h-12 max-w-2xl rounded bg-white/10" />
              <div className="mt-8 aspect-[16/7] rounded-2xl bg-white/10" />
              <div className="mt-10 space-y-3"><div className="h-4 rounded bg-white/10" /><div className="h-4 rounded bg-white/10" /><div className="h-4 max-w-4xl rounded bg-white/10" /></div>
            </div>
          </div>
        ) : error || !blog ? (
          <div className="mx-auto max-w-3xl pt-8 text-center">
            <div className="glass rounded-[2rem] px-6 py-14 md:px-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 text-cyan-200"><BookOpen className="h-7 w-7" /></div>
              <h1 className="mt-5 font-display text-3xl font-bold text-white">We couldn’t find that guide</h1>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-white/55">{error || 'This guide may have moved or no longer exists.'}</p>
              <Link to="/blog" className="mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-3 font-semibold text-black transition hover:shadow-lg hover:shadow-cyan-500/25">
                <ArrowLeft className="h-4 w-4" /> Browse all guides
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-5xl">
            <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 text-sm text-white/45">
              <Link to="/" className="transition-colors hover:text-cyan-300">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/blog" className="transition-colors hover:text-cyan-300">Guides</Link>
              {blog.category && <><span aria-hidden="true">/</span><Link to={`/blog/category/${encodeURIComponent(blog.category)}`} className="transition-colors hover:text-cyan-300">{blog.category}</Link></>}
              <span aria-hidden="true">/</span>
              <span className="max-w-[14rem] truncate text-white/65" aria-current="page">{blog.title}</span>
            </nav>

            <article>
              <header className="mb-8 max-w-4xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  <Sparkles className="h-3.5 w-3.5" /> {blog.category}
                </span>
                <h1 className="mt-5 font-display text-4xl font-bold leading-tight text-white md:text-6xl">{blog.title}</h1>
                {blog.excerpt && <p className="mt-5 max-w-3xl text-lg leading-8 text-white/60 md:text-xl">{blog.excerpt}</p>}

                <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-white/10 py-4 text-sm text-white/50">
                  <span className="font-medium text-white/75">By {blog.author_name}</span>
                  <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4 text-cyan-300/70" /> {formatBlogDate(blog.published_at, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  {blog.reading_time > 0 && <span className="inline-flex items-center gap-1.5"><Clock3 className="h-4 w-4 text-cyan-300/70" /> {blog.reading_time} min read</span>}
                  {blog.view_count > 0 && <span className="inline-flex items-center gap-1.5"><Eye className="h-4 w-4 text-cyan-300/70" /> {blog.view_count.toLocaleString()} views</span>}
                </div>
              </header>

              {blog.featured_image && (
                <figure className="mb-10 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-2xl shadow-black/20 md:rounded-[2rem]">
                  <img src={blog.featured_image} alt={blog.featured_image_alt} fetchPriority="high" className="max-h-[34rem] w-full object-cover" />
                </figure>
              )}

              <div className="article-content glass overflow-hidden rounded-[1.5rem] px-5 py-7 md:rounded-[2rem] md:px-10 md:py-12">
                {blog.content ? (
                  <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                ) : (
                  <p className="text-white/60">The full guide is coming soon.</p>
                )}
              </div>

              {blog.images.length > 0 && (
                <section className="mt-10" aria-labelledby="guide-gallery-title">
                  <h2 id="guide-gallery-title" className="mb-5 font-display text-2xl font-bold text-white">More from this guide</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {blog.images.map((image) => (
                      <figure key={image.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                        <img src={image.image_url} alt={image.image_alt || blog.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                      </figure>
                    ))}
                  </div>
                </section>
              )}

              {blog.tags.length > 0 && (
                <div className="mt-8 flex flex-wrap items-center gap-2" aria-label="Guide topics">
                  <span className="mr-1 text-xs font-medium uppercase tracking-wider text-white/40">Topics</span>
                  {blog.tags.map((tag) => (
                    <Link key={tag} to={`/blog/search?q=${encodeURIComponent(tag)}`} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/55 transition hover:border-cyan-300/30 hover:text-cyan-200">#{tag}</Link>
                  ))}
                </div>
              )}
            </article>

            <section className="relative mt-12 overflow-hidden rounded-[2rem] border border-cyan-300/15 bg-gradient-to-r from-cyan-950/50 via-[#0d1523] to-blue-950/40 p-7 md:mt-16 md:p-10">
              <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full bg-cyan-400/10 blur-[90px]" />
              <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Your next step</p>
                  <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">Ready to put the plan into motion?</h2>
                  <p className="mt-3 text-sm leading-6 text-white/55">Tell us what you want to build. We’ll send back a free, no-obligation plan with a scope, timeline and quote.</p>
                </div>
                <Link to="/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 font-semibold text-black transition hover:shadow-lg hover:shadow-cyan-500/25">
                  Start your project free <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </section>

            {relatedBlogs.length > 0 && (
              <section className="mt-14 md:mt-20" aria-labelledby="related-guides-title">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Keep exploring</p>
                    <h2 id="related-guides-title" className="mt-1 font-display text-2xl font-bold text-white md:text-3xl">Related guides</h2>
                  </div>
                  <Link to="/blog" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-white">See all guides <ArrowRight className="h-4 w-4" /></Link>
                </div>
                <div className="grid gap-5 md:grid-cols-3">
                  {relatedBlogs.map((related) => (
                    <Link key={related.id} to={`/blog/${related.slug}`} className="group glass overflow-hidden rounded-3xl transition hover:-translate-y-1 hover:border-cyan-400/30">
                      <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-cyan-950 via-[#101a2a] to-blue-950">
                        {related.featured_image ? <img src={related.featured_image} alt={related.featured_image_alt} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-cyan-300/50"><BookOpen className="h-10 w-10" /></div>}
                      </div>
                      <div className="p-5">
                        <span className="text-xs font-semibold text-cyan-300">{related.category}</span>
                        <h3 className="mt-2 font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-cyan-200">{related.title}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/50">{related.excerpt}</p>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300">Read guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            <div className="mt-10 text-center">
              <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-white/55 transition hover:text-cyan-200"><ArrowLeft className="h-4 w-4" /> Back to all guides</Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
