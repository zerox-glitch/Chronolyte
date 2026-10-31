import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, Clock3, Eye, Sparkles } from 'lucide-react';
import { Sheet } from '../components/editorial/EditorialPage';
import { BlogRecord, formatBlogDate, normalizeBlog } from '../utils/blog';

function setDocumentMeta(selector: string, attribute: string, value: string, create: () => HTMLElement) {
  let element = document.querySelector<HTMLElement>(selector);
  if (!element) {
    element = create();
    document.head.appendChild(element);
  }
  element.setAttribute(attribute, value);
}

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
        const pageTitle = post.meta_title || (/\bChronolyte\b/i.test(post.title) ? post.title : `${post.title} | Chronolyte`);
        const description = post.meta_description || post.excerpt;
        const canonicalUrl = `${window.location.origin}/blog/${encodeURIComponent(post.slug || slug || '')}`;
        let socialImage = '/og-image.png';
        if (post.featured_image) {
          try {
            const candidate = new URL(post.featured_image, window.location.origin);
            if (candidate.protocol === 'http:' || candidate.protocol === 'https:') socialImage = candidate.href;
          } catch { /* Keep the site-wide fallback image. */ }
        }

        document.title = pageTitle;
        setDocumentMeta('meta[name="description"]', 'content', description, () => {
          const element = document.createElement('meta');
          element.name = 'description';
          return element;
        });
        setDocumentMeta('meta[name="robots"]', 'content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1', () => {
          const element = document.createElement('meta');
          element.name = 'robots';
          return element;
        });
        setDocumentMeta('link[rel="canonical"]', 'href', canonicalUrl, () => {
          const element = document.createElement('link');
          element.rel = 'canonical';
          return element;
        });
        setDocumentMeta('meta[property="og:title"]', 'content', pageTitle, () => {
          const element = document.createElement('meta');
          element.setAttribute('property', 'og:title');
          return element;
        });
        setDocumentMeta('meta[property="og:description"]', 'content', description, () => {
          const element = document.createElement('meta');
          element.setAttribute('property', 'og:description');
          return element;
        });
        setDocumentMeta('meta[property="og:url"]', 'content', canonicalUrl, () => {
          const element = document.createElement('meta');
          element.setAttribute('property', 'og:url');
          return element;
        });
        setDocumentMeta('meta[property="og:image"]', 'content', socialImage, () => {
          const element = document.createElement('meta');
          element.setAttribute('property', 'og:image');
          return element;
        });
        setDocumentMeta('meta[name="twitter:title"]', 'content', pageTitle, () => {
          const element = document.createElement('meta');
          element.name = 'twitter:title';
          return element;
        });
        setDocumentMeta('meta[name="twitter:description"]', 'content', description, () => {
          const element = document.createElement('meta');
          element.name = 'twitter:description';
          return element;
        });
        setDocumentMeta('meta[name="twitter:image"]', 'content', socialImage, () => {
          const element = document.createElement('meta');
          element.name = 'twitter:image';
          return element;
        });

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
    <>
      {loading ? (
        <Sheet tone="paper">
          <div style={{ display: 'grid', gap: '0.8rem' }}>
            <div style={{ height: 14, width: 200, background: 'rgba(31,39,35,0.12)', borderRadius: 2 }} />
            <div style={{ height: 46, width: '70%', background: 'rgba(31,39,35,0.12)', borderRadius: 2 }} />
            <div style={{ height: 18, width: '55%', background: 'rgba(31,39,35,0.1)', borderRadius: 2 }} />
            <div style={{ aspectRatio: '16 / 7', marginTop: '1rem', background: 'rgba(31,39,35,0.1)', borderRadius: 4 }} />
            <div style={{ display: 'grid', gap: '0.6rem', marginTop: '1rem' }}>
              {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 14, background: 'rgba(31,39,35,0.09)', borderRadius: 2, maxWidth: i === 3 ? '60%' : '100%' }} />)}
            </div>
          </div>
        </Sheet>
      ) : error || !blog ? (
        <Sheet tone="paper" medium>
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <div style={{ margin: '0 auto 1rem', width: 54, height: 54, display: 'grid', placeItems: 'center', borderRadius: 4, background: 'rgba(197,222,151,0.6)', border: '1px solid rgba(123,24,42,0.3)', color: '#7b182a' }}>
              <BookOpen className="h-6 w-6" />
            </div>
            <h1 className="ed-title ed-title--sm">We couldn’t find that guide</h1>
            <p className="ed-lede" style={{ margin: '0.8rem auto 0' }}>{error || 'This guide may have moved or no longer exists.'}</p>
            <Link to="/blog" className="ed-btn" style={{ marginTop: '1.4rem' }}>
              <ArrowLeft className="h-4 w-4" /> Browse all guides
            </Link>
          </div>
        </Sheet>
      ) : (
        <>
          <Sheet tone="paper">
            <nav aria-label="Breadcrumb" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.45rem', marginBottom: '1.4rem', fontSize: '0.8rem', color: '#6a746a' }}>
              <Link to="/" className="ed-link" style={{ textDecoration: 'none' }}>Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/blog" className="ed-link" style={{ textDecoration: 'none' }}>Guides</Link>
              {blog.category && (
                <>
                  <span aria-hidden="true">/</span>
                  <Link to={`/blog/category/${encodeURIComponent(blog.category)}`} className="ed-link" style={{ textDecoration: 'none' }}>{blog.category}</Link>
                </>
              )}
            </nav>

            <article>
              <header style={{ maxWidth: '56rem' }}>
                <span className="ed-chip"><Sparkles className="h-3.5 w-3.5" /> {blog.category}</span>
                <h1 className="ed-hero__title" style={{ fontSize: 'clamp(2.1rem, 5vw, 4.4rem)', marginTop: '0.8rem' }}>{blog.title}</h1>
                {blog.excerpt && <p className="ed-lede">{blog.excerpt}</p>}

                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem 1.3rem', marginTop: '1.2rem', padding: '0.85rem 0', borderTop: '1px solid rgba(93,48,49,0.22)', borderBottom: '1px solid rgba(93,48,49,0.22)', fontSize: '0.8rem', color: '#5f6d62' }}>
                  <span style={{ fontWeight: 700, color: '#26312a' }}>By {blog.author_name}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><CalendarDays className="h-4 w-4" /> {formatBlogDate(blog.published_at, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  {blog.reading_time > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock3 className="h-4 w-4" /> {blog.reading_time} min read</span>}
                  {blog.view_count > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><Eye className="h-4 w-4" /> {blog.view_count.toLocaleString()} views</span>}
                </div>
              </header>

              {blog.featured_image && (
                <figure style={{ margin: '1.6rem 0', overflow: 'hidden', borderRadius: 4, border: '1px solid rgba(84,72,48,0.3)' }}>
                  <img src={blog.featured_image} alt={blog.featured_image_alt} fetchPriority="high" style={{ width: '100%', maxHeight: '34rem', objectFit: 'cover', display: 'block' }} />
                </figure>
              )}

              <div className="ed-prose" style={{ maxWidth: '52rem' }}>
                {blog.content ? (
                  <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                ) : (
                  <p>The full guide is coming soon.</p>
                )}
              </div>

              {blog.images.length > 0 && (
                <section style={{ marginTop: '2rem' }} aria-labelledby="guide-gallery-title">
                  <h2 id="guide-gallery-title" className="ed-title ed-title--xs">More from this guide</h2>
                  <div className="grid gap-3 sm:grid-cols-2" style={{ marginTop: '0.9rem' }}>
                    {blog.images.map((image) => (
                      <figure key={image.id} style={{ margin: 0, overflow: 'hidden', borderRadius: 4, border: '1px solid rgba(84,72,48,0.3)' }}>
                        <img src={image.image_url} alt={image.image_alt || blog.title} loading="lazy" style={{ aspectRatio: '16 / 10', width: '100%', objectFit: 'cover', display: 'block' }} />
                      </figure>
                    ))}
                  </div>
                </section>
              )}

              {blog.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.4rem', marginTop: '1.8rem' }} aria-label="Guide topics">
                  <span style={{ marginRight: '0.3rem', fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#7b8578' }}>Topics</span>
                  {blog.tags.map((tag) => (
                    <Link key={tag} to={`/blog/search?q=${encodeURIComponent(tag)}`} className="ed-chip" style={{ textDecoration: 'none' }}>#{tag}</Link>
                  ))}
                </div>
              )}
            </article>
          </Sheet>

          <Sheet tone="cherry">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ maxWidth: '42rem' }}>
                <p className="ed-rubric">Your next step</p>
                <h2 className="ed-title ed-title--sm" style={{ marginTop: '0.45rem' }}>Ready to put the plan into <em>motion?</em></h2>
                <p className="ed-lede">Tell us what you want to build. We’ll send back a free, no-obligation plan with a scope, timeline and quote.</p>
              </div>
              <Link to="/contact" className="ed-btn ed-btn--onDark">
                Start your project free <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Sheet>

          {relatedBlogs.length > 0 && (
            <Sheet tone="paper">
              <div className="ed-section-head">
                <div className="ed-section-head__body">
                  <p className="ed-rubric">Keep exploring</p>
                  <h2 className="ed-title ed-title--sm">Related <em>guides</em></h2>
                </div>
                <Link to="/blog" className="ed-btn ed-btn--ghost ed-btn--sm">See all guides <ArrowRight className="h-4 w-4" /></Link>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {relatedBlogs.map((related) => (
                  <Link key={related.id} to={`/blog/${related.slug}`} className="ed-card" style={{ padding: 0, overflow: 'hidden', textDecoration: 'none' }}>
                    <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: '#e6ddc9', borderBottom: '1px solid rgba(84,72,48,0.3)' }}>
                      {related.featured_image
                        ? <img src={related.featured_image} alt={related.featured_image_alt} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ display: 'grid', placeItems: 'center', height: '100%', color: '#7b182a' }}><BookOpen className="h-10 w-10" /></div>}
                    </div>
                    <div style={{ padding: 'clamp(14px, 2vw, 20px)' }}>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#7b182a' }}>{related.category}</span>
                      <h3 className="ed-card__title" style={{ marginTop: '0.35rem', fontSize: '1.05rem' }}>{related.title}</h3>
                      <p className="ed-card__body" style={{ fontSize: '0.86rem' }}>{related.excerpt}</p>
                      <span style={{ marginTop: '0.7rem', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: '#7b182a' }}>
                        Read guide <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </Sheet>
          )}

          <Sheet tone="cream" narrow>
            <div style={{ textAlign: 'center' }}>
              <Link to="/blog" className="ed-btn ed-btn--ghost"><ArrowLeft className="h-4 w-4" /> Back to all guides</Link>
            </div>
          </Sheet>
        </>
      )}
    </>
  );
}
