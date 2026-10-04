import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye } from 'lucide-react';

interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  is_published: number;
  view_count: number;
  published_at: string;
  author_name: string;
}

export const BlogsAdmin = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchBlogs();
    fetchCategories();
  }, [page, filterStatus, searchQuery]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      let url = `/api/blogs.php?action=list&page=${page}&limit=15`;
      
      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
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

  const handleDeleteBlog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await fetch(`/api/blogs.php?action=delete&id=${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await response.json();

      if (data.success) {
        alert('Blog deleted successfully');
        fetchBlogs();
      } else {
        alert('Error deleting blog: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      alert('Error deleting blog');
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
          <p className="text-gray-400 mt-1">Manage your blog content</p>
        </div>
        <a
          href="/admin/blogs/add.php"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add New Blog
        </a>
      </div>

      {/* Filters Card */}
      <div className="bg-[#0d0d14] border border-white/5 rounded-lg p-6">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value as 'all' | 'published' | 'draft');
                setPage(1);
              }}
              className="bg-[#1a1a20] border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Blogs Table */}
      <div className="bg-[#0d0d14] border border-white/5 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            Loading blogs...
          </div>
        ) : blogs.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-[#1a1a20]">
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Title</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Author</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Category</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Views</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Published</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="border-b border-white/5 hover:bg-[#1a1a20] transition">
                      <td className="px-6 py-4">
                        <div className="max-w-xs">
                          <div className="font-medium text-white truncate">{blog.title}</div>
                          <div className="text-sm text-gray-400 truncate">{blog.slug}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {blog.author_name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {blog.category ? (
                          <span className="inline-block bg-blue-500/20 text-blue-300 px-2 py-1 rounded text-xs">
                            {blog.category}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {blog.is_published ? (
                          <span className="inline-block bg-green-500/20 text-green-300 px-2 py-1 rounded text-xs">
                            Published
                          </span>
                        ) : (
                          <span className="inline-block bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded text-xs">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {blog.view_count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {blog.published_at
                          ? new Date(blog.published_at).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/blogs/add.php?id=${blog.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 transition"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </a>
                          <a
                            href={`/blog/${blog.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-300 transition"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="text-red-400 hover:text-red-300 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-6 border-t border-white/5">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-3 py-1 bg-[#1a1a20] text-gray-300 rounded disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 bg-[#1a1a20] text-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>

                <div className="text-gray-400 text-sm">
                  Page {page} of {totalPages}
                </div>

                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-[#1a1a20] text-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-3 py-1 bg-[#1a1a20] text-gray-300 rounded disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">📝</div>
            <p>No blogs found</p>
            <p className="text-sm mt-1">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first blog post'}
            </p>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h3 className="text-white font-medium mb-2">💡 Blog Management Tips</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Use descriptive titles and categories to improve SEO</li>
          <li>• Add featured images to make blog posts more engaging</li>
          <li>• Write detailed excerpts for preview snippets</li>
          <li>• Use tags to help readers find related content</li>
          <li>• Feature popular posts to boost engagement</li>
        </ul>
      </div>
    </div>
  );
};

export default BlogsAdmin;
