import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featured_image: string;
    featured_image_alt: string;
    author_name: string;
    category: string;
    tags: string[];
    meta_title: string;
    meta_description: string;
    view_count: number;
    reading_time: number;
    published_at: string;
    created_at: string;
    images: Array<{id: number; image_url: string; image_alt: string;}>;
}

// The API returns `tags` as a JSON-encoded string when the post comes from the
// Neon store (JSONB column) and as a real array from the local JSON store, so
// normalize before rendering — calling .map() on the string crashed this page.
function normalizeTags(tags: unknown): string[] {
    if (Array.isArray(tags)) return tags.filter((t): t is string => typeof t === 'string');
    if (typeof tags === 'string' && tags.trim()) {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) return parsed.filter((t): t is string => typeof t === 'string');
        } catch {
            return tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
    }
    return [];
}

export const BlogPost = () => {
    const { slug } = useParams<{ slug: string }>();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const response = await fetch(`/api/blogs.php?action=get&slug=${slug}`);
                const data = await response.json();
                
                if (data.success) {
                    setBlog(data.data);
                    
                    // Set meta tags for SEO
                    document.title = data.data.meta_title || data.data.title;
                    const metaDesc = document.querySelector('meta[name="description"]');
                    if (metaDesc) {
                        metaDesc.setAttribute('content', data.data.meta_description || data.data.excerpt);
                    }
                    
                    // Fetch related blogs by category
                    if (data.data.category) {
                        fetchRelatedBlogs(data.data.category, data.data.id);
                    }
                } else {
                    setError('Blog post not found');
                }
            } catch (err) {
                setError('Failed to load blog post');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchBlog();
        }
    }, [slug]);

    const fetchRelatedBlogs = async (category: string, currentBlogId: number) => {
        try {
            const response = await fetch(`/api/blogs.php?action=category&category=${category}&limit=3`);
            const data = await response.json();
            
            if (data.success) {
                // Filter out current blog and limit to 3
                const related = data.data
                    .filter((b: Blog) => b.id !== currentBlogId)
                    .slice(0, 3);
                setRelatedBlogs(related);
            }
        } catch (err) {
            console.error('Failed to fetch related blogs:', err);
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem' }}>Loading...</div>
            </div>
        );
    }

    if (error || !blog) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Oops! {error}</h1>
                <Link to="/blog">← Back to Blog</Link>
            </div>
        );
    }

    const publishedDate = new Date(blog.published_at);
    const formattedDate = publishedDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
            {/* Header with featured image */}
            {blog.featured_image && (
                <div style={{
                    height: '400px',
                    backgroundImage: `url(${blog.featured_image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '2rem',
                        color: 'white'
                    }}>
                        <h1 style={{ margin: '0', fontSize: '2.5rem', fontWeight: 'bold' }}>
                            {blog.title}
                        </h1>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
                {/* Post metadata */}
                <div style={{
                    display: 'flex',
                    gap: '1.5rem',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    fontSize: '0.9rem',
                    color: '#666'
                }}>
                    <div>
                        <strong>By</strong> {blog.author_name}
                    </div>
                    <div>
                        <strong>Published</strong> {formattedDate}
                    </div>
                    {blog.reading_time && (
                        <div>
                            <strong>Reading time</strong> {blog.reading_time} min
                        </div>
                    )}
                    <div>
                        <strong>Views</strong> {blog.view_count}
                    </div>
                </div>

                {/* Category and tags */}
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {blog.category && (
                        <Link
                            to={`/blog/category/${blog.category}`}
                            style={{
                                backgroundColor: '#e8f5e9',
                                color: '#2e7d32',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '20px',
                                textDecoration: 'none',
                                fontSize: '0.85rem',
                                fontWeight: '500'
                            }}
                        >
                            {blog.category}
                        </Link>
                    )}
                    {normalizeTags(blog.tags).map((tag: string) => (
                        <Link
                            key={tag}
                            to={`/blog/search?q=${tag}`}
                            style={{
                                backgroundColor: '#f3e5f5',
                                color: '#6a1b9a',
                                padding: '0.35rem 0.75rem',
                                borderRadius: '20px',
                                textDecoration: 'none',
                                fontSize: '0.85rem'
                            }}
                        >
                            #{tag}
                        </Link>
                    ))}
                </div>

                {/* Main content */}
                <article style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    lineHeight: '1.8',
                    marginBottom: '3rem'
                }}>
                    <div style={{
                        fontSize: '1.1rem',
                        color: '#333',
                        marginBottom: '2rem'
                    }}>
                        <p>{blog.excerpt}</p>
                    </div>

                    <div
                        style={{
                            color: '#333',
                            fontSize: '1rem'
                        }}
                        dangerouslySetInnerHTML={{ __html: blog.content }}
                    />

                    {/* Gallery images */}
                    {blog.images && blog.images.length > 0 && (
                        <div style={{
                            marginTop: '2rem',
                            paddingTop: '2rem',
                            borderTop: '1px solid #eee'
                        }}>
                            <h3>Gallery</h3>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                gap: '1rem',
                                marginTop: '1rem'
                            }}>
                                {blog.images.map((img) => (
                                    <div key={img.id} style={{ borderRadius: '8px', overflow: 'hidden' }}>
                                        <img
                                            src={img.image_url}
                                            alt={img.image_alt || 'Blog image'}
                                            style={{
                                                width: '100%',
                                                height: '250px',
                                                objectFit: 'cover',
                                                display: 'block'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </article>

                {/* Related posts */}
                {relatedBlogs.length > 0 && (
                    <div style={{
                        backgroundColor: '#f9f9f9',
                        padding: '2rem',
                        borderRadius: '8px',
                        marginBottom: '2rem'
                    }}>
                        <h2 style={{ marginTop: 0 }}>Related Posts</h2>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {relatedBlogs.map((relatedBlog) => (
                                <Link
                                    key={relatedBlog.id}
                                    to={`/blog/${relatedBlog.slug}`}
                                    style={{
                                        textDecoration: 'none',
                                        backgroundColor: 'white',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.transform = 'translateY(-4px)';
                                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.transform = 'translateY(0)';
                                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                    }}
                                >
                                    {relatedBlog.featured_image && (
                                        <img
                                            src={relatedBlog.featured_image}
                                            alt={relatedBlog.featured_image_alt}
                                            style={{
                                                width: '100%',
                                                height: '160px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    )}
                                    <div style={{ padding: '1rem' }}>
                                        <h4 style={{ marginTop: 0, color: '#333' }}>
                                            {relatedBlog.title}
                                        </h4>
                                        <p style={{ margin: '0.5rem 0 0 0', color: '#666', fontSize: '0.9rem' }}>
                                            {relatedBlog.excerpt.substring(0, 100)}...
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to blog link */}
                <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                    <Link to="/blog" style={{
                        color: '#1976d2',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}>
                        ← Back to Blog
                    </Link>
                </div>
            </div>
        </div>
    );
};
