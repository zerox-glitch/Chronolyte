import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string;
    featured_image_alt: string;
    author_name: string;
    category: string;
    reading_time: number;
    published_at: string;
}

interface FeaturedBlogsProps {
    limit?: number;
}

export const FeaturedBlogs: React.FC<FeaturedBlogsProps> = ({ limit = 3 }) => {
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedBlogs();
    }, []);

    const fetchFeaturedBlogs = async () => {
        try {
            const response = await fetch(`/api/blogs.php?action=featured&limit=${limit}`);
            const data = await response.json();

            if (data.success) {
                setBlogs(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch featured blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Loading blogs...</div>;
    }

    if (blogs.length === 0) {
        return null;
    }

    return (
        <section style={{
            padding: '3rem 1rem',
            backgroundColor: '#fafafa'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                {/* Section Header */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '2rem'
                }}>
                    <h2 style={{
                        fontSize: '2rem',
                        marginBottom: '0.5rem',
                        color: '#333'
                    }}>
                        Latest Blog Posts
                    </h2>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#666',
                        marginBottom: '1rem'
                    }}>
                        Tips, insights, and best practices for your digital success
                    </p>
                    <Link
                        to="/blog"
                        style={{
                            display: 'inline-block',
                            color: '#1976d2',
                            textDecoration: 'none',
                            fontWeight: '500',
                            fontSize: '1rem'
                        }}
                    >
                        View All Blog Posts →
                    </Link>
                </div>

                {/* Blogs Grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {blogs.map((blog) => {
                        const publishedDate = new Date(blog.published_at);
                        const formattedDate = publishedDate.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        });

                        return (
                            <Link
                                key={blog.id}
                                to={`/blog/${blog.slug}`}
                                style={{
                                    textDecoration: 'none',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-8px)';
                                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                                }}
                            >
                                {/* Featured Image */}
                                {blog.featured_image && (
                                    <div style={{
                                        height: '200px',
                                        backgroundImage: `url(${blog.featured_image})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                        position: 'relative'
                                    }}>
                                        {blog.category && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '1rem',
                                                left: '1rem',
                                                backgroundColor: 'rgba(25, 118, 210, 0.9)',
                                                color: 'white',
                                                padding: '0.35rem 0.75rem',
                                                borderRadius: '12px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600'
                                            }}>
                                                {blog.category}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Content */}
                                <div style={{
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flex: 1
                                }}>
                                    {/* Title */}
                                    <h3 style={{
                                        margin: '0 0 0.75rem 0',
                                        color: '#1976d2',
                                        fontSize: '1.25rem',
                                        fontWeight: '600',
                                        lineHeight: '1.4'
                                    }}>
                                        {blog.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p style={{
                                        margin: '0 0 1rem 0',
                                        color: '#666',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.6',
                                        flex: 1
                                    }}>
                                        {blog.excerpt.substring(0, 120)}...
                                    </p>

                                    {/* Meta Info */}
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        fontSize: '0.85rem',
                                        color: '#999',
                                        paddingTop: '1rem',
                                        borderTop: '1px solid #eee'
                                    }}>
                                        <div>
                                            <span>{formattedDate}</span>
                                            {blog.reading_time && (
                                                <span> · {blog.reading_time} min</span>
                                            )}
                                        </div>
                                        <div>{blog.author_name}</div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};
