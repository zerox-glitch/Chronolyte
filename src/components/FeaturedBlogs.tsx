import { StudioCover } from './editorial/StudioCover';
import { useEffect, useState } from 'react';
import { ArrowRight, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BlogRecord, formatBlogDate, normalizeBlog } from '../utils/blog';

interface FeaturedBlogsProps {
  limit?: number;
}

export function FeaturedBlogs({ limit = 3 }: FeaturedBlogsProps) {
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/blogs.php?action=featured&limit=${limit}`)
      .then((response) => response.json())
      .then((data: { success?: boolean; data?: unknown[] }) => {
        if (!cancelled && data.success && Array.isArray(data.data)) {
          setBlogs(data.data.map(normalizeBlog));
        }
      })
      .catch((error: unknown) => console.error('Failed to fetch featured guides:', error))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [limit]);

  if (!loading && blogs.length === 0) return null;

  return (
    <div>
      <div className="ed-section-head">
        <div className="ed-section-head__body">
          <p className="ed-rubric">The Chronolyte guides<span className="ed-rubric__num">06 / 07</span></p>
          <h2 className="ed-title">
            <span className="ed-title__plain">Straight answers for</span>
            <br />
            <em>what you’re building</em>
          </h2>
          <p className="ed-lede">
            Plain-English advice on project costs, timelines and hiring — based on the work we build every day.
          </p>
        </div>
        <Link to="/blog" className="ed-btn ed-btn--ghost ed-btn--sm">
          All guides <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((item) => (
            <div key={item} className="ed-card" style={{ height: 300, alignItems: 'center', justifyContent: 'center' }}>
              <span className="ed-loading-dot" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {blogs.map((blog) => (
            <Link
              key={blog.id}
              to={`/blog/${blog.slug}`}
              className="ed-card"
              style={{ padding: 0, overflow: 'hidden', textDecoration: 'none' }}
            >
              <div style={{ position: 'relative', aspectRatio: '16 / 9', overflow: 'hidden', background: 'var(--alloy)', borderBottom: '1px solid var(--line)' }}>
                <StudioCover src={blog.featured_image} alt={blog.featured_image_alt} title={blog.title} />
                  <span className="ed-chip" style={{ position: 'absolute', left: 12, top: 12, background: 'var(--canvas)' }}>
                  {blog.category}
                </span>
              </div>
              <div style={{ padding: 'clamp(16px, 2vw, 22px)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 className="ed-card__title" style={{ marginTop: 0 }}>{blog.title}</h3>
                <p className="ed-card__body" style={{ flexGrow: 1 }}>{blog.excerpt}</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.8rem', marginTop: '1rem', paddingTop: '0.8rem', borderTop: '1px solid var(--line)', fontSize: '0.74rem', color: 'var(--muted)' }}>
                  <span>{formatBlogDate(blog.published_at)}</span>
                  {blog.reading_time > 0 && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock3 className="h-3.5 w-3.5" /> {blog.reading_time} min read</span>
                  )}
                </div>
                <span style={{ marginTop: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-ink)' }}>
                  Read the guide <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
