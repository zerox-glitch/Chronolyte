import { useEffect, useState } from 'react';
import { ArrowRight, BookOpen, Clock3 } from 'lucide-react';
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
    <section className="relative overflow-hidden bg-[#070a12] px-4 py-16 md:px-6 md:py-24">
      <div className="pointer-events-none absolute -left-32 top-10 h-72 w-72 rounded-full bg-cyan-500/10 blur-[110px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-blue-500/10 blur-[110px]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between md:mb-12">
          <div className="max-w-2xl">
            <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">
              <BookOpen className="h-4 w-4" /> The Chronolyte guides
            </p>
            <h2 className="font-display text-3xl font-bold text-white md:text-5xl">
              Straight answers for <span className="gradient-text">what you’re building</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/55 md:text-base">
              Plain-English advice on project costs, timelines and hiring — based on the work we build every day.
            </p>
          </div>
          <Link
            to="/blog"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-5 py-3 text-sm font-semibold text-cyan-200 transition hover:border-cyan-300/60 hover:bg-cyan-500/15"
          >
            All guides <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="glass h-[340px] animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                to={`/blog/${blog.slug}`}
                className="group glass overflow-hidden rounded-3xl transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30 hover:shadow-[0_18px_55px_rgba(0,200,255,0.12)]"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-cyan-950 via-[#101a2a] to-blue-950">
                  {blog.featured_image ? (
                    <img
                      src={blog.featured_image}
                      alt={blog.featured_image_alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-cyan-300/60">
                      <BookOpen className="h-12 w-12" />
                    </div>
                  )}
                  <span className="absolute left-4 top-4 rounded-full border border-cyan-300/25 bg-[#07101e]/85 px-3 py-1 text-xs font-semibold text-cyan-200 backdrop-blur">
                    {blog.category}
                  </span>
                </div>
                <div className="p-5 md:p-6">
                  <h3 className="font-display text-lg font-bold leading-snug text-white transition-colors group-hover:text-cyan-200 md:text-xl">
                    {blog.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/55">{blog.excerpt}</p>
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-white/40">
                    <span>{formatBlogDate(blog.published_at)}</span>
                    {blog.reading_time > 0 && (
                      <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {blog.reading_time} min read</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
