import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

interface Blog {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    featured_image: string;
    featured_image_alt: string;
    author_name: string;
    category: string;
    tags: string[];
    reading_time: number;
    published_at: string;
    view_count: number;
}

export const BlogListing = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
    const [totalPages, setTotalPages] = useState(1);
    const [categories, setCategories] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

    useEffect(() => {
        fetchBlogs();
        fetchCategories();
        
        // Update meta tags
        document.title = 'Blog | Chronolyte';
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', 'Read our latest blog posts about web design, SEO, and digital marketing.');
        }
    }, [page, selectedCategory, searchQuery]);

    const fetchBlogs = async () => {
        setLoading(true);
        try {
            let url = `/api/blogs.php?action=list&page=${page}&limit=9`;
            
            if (selectedCategory) {
                url = `/api/blogs.php?action=category&category=${selectedCategory}&page=${page}&limit=9`;
            } else if (searchQuery) {
                url = `/api/blogs.php?action=search&q=${encodeURIComponent(searchQuery)}&page=${page}&limit=9`;
            }

            const response = await fetch(url);
            const data = await response.json();

            if (data.success) {
                setBlogs(data.data);
                if (data.pagination) {
                    setTotalPages(data.pagination.pages);
                }
            }
        } catch (error) {
            console.error('Failed to fetch blogs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await fetch('/api/blogs.php?action=list&limit=100');
            const data = await response.json();

            if (data.success) {
                const cats = [...new Set(data.data.map((b: Blog) => b.category).filter(Boolean))];
                setCategories(cats as string[]);
            }
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSelectedCategory('');
    };

    const handleCategorySelect = (category: string) => {
        setPage(1);
        setSearchQuery('');
        setSelectedCategory(category === selectedCategory ? '' : category);
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
            {/* Header */}
            <div style={{
                backgroundColor: '#1976d2',
                color: 'white',
                padding: '3rem 1rem',
                textAlign: 'center'
            }}>
                <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem' }}>Blog</h1>
                <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
                    Tips, trends, and insights for web design and digital marketing
                </p>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                {/* Search and Filter Section */}
                <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '8px',
                    marginBottom: '2rem',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                    {/* Search Form */}
                    <form onSubmit={handleSearch} style={{ marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input
                                type="text"
                                placeholder="Search blog posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    flex: 1,
                                    padding: '0.75rem',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '1rem'
                                }}
                            />
                            <button
                                type="submit"
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: '500'
                                }}
                            >
                                Search
                            </button>
                            {(searchQuery || selectedCategory) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery('');
                                        setSelectedCategory('');
                                        setPage(1);
                                    }}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        backgroundColor: '#f0f0f0',
                                        color: '#333',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '1rem'
                                    }}
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    </form>

                    {/* Category Filter */}
                    {categories.length > 0 && (
                        <div>
                            <p style={{ margin: '0 0 0.75rem 0', fontWeight: '500' }}>Filter by Category:</p>
                            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                {categories.map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => handleCategorySelect(cat)}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            backgroundColor: selectedCategory === cat ? '#1976d2' : '#f0f0f0',
                                            color: selectedCategory === cat ? 'white' : '#333',
                                            border: selectedCategory === cat ? 'none' : '1px solid #ddd',
                                            borderRadius: '20px',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Blogs Grid */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        <div style={{ fontSize: '1.5rem' }}>Loading blogs...</div>
                    </div>
                ) : blogs.length > 0 ? (
                    <>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                            gap: '2rem',
                            marginBottom: '2rem'
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
                                            flexDirection: 'column'
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
                                                height: '180px',
                                                backgroundImage: `url(${blog.featured_image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }} />
                                        )}

                                        {/* Content */}
                                        <div style={{
                                            padding: '1.5rem',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            flex: 1
                                        }}>
                                            {/* Category Badge */}
                                            {blog.category && (
                                                <span style={{
                                                    display: 'inline-block',
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#1976d2',
                                                    padding: '0.25rem 0.75rem',
                                                    borderRadius: '12px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    marginBottom: '0.75rem',
                                                    width: 'fit-content'
                                                }}>
                                                    {blog.category}
                                                </span>
                                            )}

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
                                                {blog.excerpt.substring(0, 150)}...
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
                                                        <span> · {blog.reading_time} min read</span>
                                                    )}
                                                </div>
                                                <div>By {blog.author_name}</div>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                marginTop: '3rem',
                                flexWrap: 'wrap'
                            }}>
                                {page > 1 && (
                                    <>
                                        <button
                                            onClick={() => setPage(1)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#f0f0f0',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            First
                                        </button>
                                        <button
                                            onClick={() => setPage(page - 1)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#f0f0f0',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            ← Previous
                                        </button>
                                    </>
                                )}

                                <div style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    borderRadius: '4px'
                                }}>
                                    {page} of {totalPages}
                                </div>

                                {page < totalPages && (
                                    <>
                                        <button
                                            onClick={() => setPage(page + 1)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#f0f0f0',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Next →
                                        </button>
                                        <button
                                            onClick={() => setPage(totalPages)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: '#f0f0f0',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Last
                                        </button>
                                    </>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{
                        textAlign: 'center',
                        padding: '3rem 1rem',
                        backgroundColor: 'white',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
                        <h2>No blog posts found</h2>
                        <p style={{ color: '#666' }}>
                            {searchQuery || selectedCategory 
                                ? 'Try adjusting your search or filters'
                                : 'Check back soon for new content!'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
