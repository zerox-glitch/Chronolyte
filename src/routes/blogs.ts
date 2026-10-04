/**
 * Blogs API Endpoint Handler
 * Handles all blog-related operations
 */

import { Hono } from 'hono';
import { CloudflareEnv, Blog, BlogImage, APIResponse } from '../types';
import { Database, getDB, parseJSON } from '../db';
import { AuthService, requireAuth, requireRole } from '../auth';

const blogsRouter = new Hono<{ Bindings: CloudflareEnv }>();

/**
 * List blogs with pagination, filtering, and search
 * GET /blogs?page=1&limit=10&status=published&search=query&category=web
 */
blogsRouter.get('/', async (c) => {
  const db = getDB(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');
  const status = c.req.query('status') || 'published';
  const search = c.req.query('search') || '';
  const category = c.req.query('category') || '';

  try {
    let whereClauses = [];
    let params: any[] = [];

    // Auth check - if not authenticated, only show published
    const authHeader = c.req.header('Authorization');
    if (!authHeader) {
      whereClauses.push('is_published = 1');
    } else if (status === 'published') {
      whereClauses.push('is_published = 1');
    } else if (status === 'draft') {
      whereClauses.push('is_published = 0');
    }

    if (search) {
      whereClauses.push('(title LIKE ? OR excerpt LIKE ? OR content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (category) {
      whereClauses.push('category = ?');
      params.push(category);
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM blogs ${whereClause}`;
    const countResult = await db.queryOne<{ total: number }>(countSql, params);
    const totalCount = countResult?.total || 0;

    // Get paginated results
    const offset = (page - 1) * limit;
    const sql = `
      SELECT b.*, a.username as author_name
      FROM blogs b
      LEFT JOIN admins a ON b.author_id = a.id
      ${whereClause}
      ORDER BY b.published_at DESC, b.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const blogs = await db.query<Blog>(sql, params);

    // Parse tags
    const blogsWithParsedTags = blogs.map(blog => ({
      ...blog,
      tags: parseJSON(blog.tags as any, [])
    }));

    return c.json({
      success: true,
      data: blogsWithParsedTags,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    } as APIResponse<Blog[]>);
  } catch (error) {
    console.error('List blogs error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch blogs' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get single blog by ID or slug
 * GET /blogs/:id or /blogs/my-post-slug
 */
blogsRouter.get('/:id', async (c) => {
  const db = getDB(c.env);
  const id = c.req.param('id');

  try {
    let blog: Blog | null;

    // Check if it's a number (ID) or string (slug)
    if (/^\d+$/.test(id)) {
      blog = await db.queryOne<Blog>(
        'SELECT b.*, a.username as author_name FROM blogs b LEFT JOIN admins a ON b.author_id = a.id WHERE b.id = ?',
        [parseInt(id)]
      );
    } else {
      blog = await db.queryOne<Blog>(
        'SELECT b.*, a.username as author_name FROM blogs b LEFT JOIN admins a ON b.author_id = a.id WHERE b.slug = ?',
        [id]
      );
    }

    if (!blog) {
      return c.json({ success: false, error: 'Blog not found' } as APIResponse<null>, 404);
    }

    // Check if non-authenticated user can view
    if (blog.is_published === 0) {
      const authHeader = c.req.header('Authorization');
      if (!authHeader) {
        return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
      }
    }

    // Get blog images
    const images = await db.query<BlogImage>(
      'SELECT * FROM blog_images WHERE blog_id = ? ORDER BY display_order ASC',
      [blog.id]
    );

    // Increment view count
    await db.execute('UPDATE blogs SET view_count = view_count + 1 WHERE id = ?', [blog.id]);
    blog.view_count++;

    // Parse tags
    const blogWithParsedData = {
      ...blog,
      tags: parseJSON(blog.tags as any, []),
      images
    };

    return c.json({ success: true, data: blogWithParsedData } as APIResponse<Blog>);
  } catch (error) {
    console.error('Get blog error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch blog' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get featured blogs
 * GET /blogs/featured?limit=3
 */
blogsRouter.get('/featured', async (c) => {
  const db = getDB(c.env);
  const limit = parseInt(c.req.query('limit') || '3');

  try {
    const blogs = await db.query<Blog>(
      `SELECT b.*, a.username as author_name
       FROM blogs b
       LEFT JOIN admins a ON b.author_id = a.id
       WHERE b.is_featured = 1 AND b.is_published = 1
       ORDER BY b.published_at DESC
       LIMIT ?`,
      [limit]
    );

    const blogsWithParsedTags = blogs.map(blog => ({
      ...blog,
      tags: parseJSON(blog.tags as any, [])
    }));

    return c.json({ success: true, data: blogsWithParsedTags } as APIResponse<Blog[]>);
  } catch (error) {
    console.error('Get featured blogs error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch featured blogs' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Create blog (Admin only)
 * POST /blogs
 */
blogsRouter.post('/', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);

  // Check authentication
  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json(
      { success: false, error: auth.error } as APIResponse<null>,
      401
    );
  }

  try {
    const body = await c.req.json();
    const { title, content, excerpt, featured_image, category, tags, meta_title, meta_description, is_published, is_featured } = body;

    if (!title || !content) {
      return c.json(
        { success: false, error: 'Title and content are required' } as APIResponse<null>,
        400
      );
    }

    // Generate slug
    const slug = generateSlug(title);

    // Check for duplicate slug
    const existing = await db.queryOne('SELECT id FROM blogs WHERE slug = ?', [slug]);
    if (existing) {
      return c.json(
        { success: false, error: 'Blog with this title already exists' } as APIResponse<null>,
        400
      );
    }

    const publishedAt = is_published ? new Date().toISOString() : null;
    const readingTime = calculateReadingTime(content);

    const id = await db.insert(
      `INSERT INTO blogs (
        title, slug, excerpt, content, featured_image, author_id, category, tags,
        meta_title, meta_description, is_published, is_featured, reading_time, published_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        excerpt || null,
        content,
        featured_image || null,
        auth.admin!.id,
        category || null,
        tags ? JSON.stringify(tags) : null,
        meta_title || title,
        meta_description || excerpt,
        is_published ? 1 : 0,
        is_featured ? 1 : 0,
        readingTime,
        publishedAt
      ]
    );

    return c.json(
      { success: true, message: 'Blog created successfully', data: { id, slug } } as APIResponse<any>,
      201
    );
  } catch (error) {
    console.error('Create blog error:', error);
    return c.json(
      { success: false, error: 'Failed to create blog' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Update blog (Admin only)
 * PUT /blogs/:id
 */
blogsRouter.put('/:id', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const id = parseInt(c.req.param('id'));

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  try {
    const body = await c.req.json();
    const updates: string[] = [];
    const params: any[] = [];

    const updateableFields = ['title', 'excerpt', 'content', 'featured_image', 'category', 'meta_title', 'meta_description', 'is_featured'];

    for (const field of updateableFields) {
      if (field in body) {
        updates.push(`${field} = ?`);
        params.push(body[field] || null);
      }
    }

    if ('tags' in body) {
      updates.push('tags = ?');
      params.push(JSON.stringify(body.tags));
    }

    if ('is_published' in body) {
      updates.push('is_published = ?');
      params.push(body.is_published ? 1 : 0);
      if (body.is_published) {
        updates.push('published_at = ?');
        params.push(new Date().toISOString());
      }
    }

    if ('content' in body) {
      updates.push('reading_time = ?');
      params.push(calculateReadingTime(body.content));
    }

    updates.push('updated_at = datetime("now")');
    params.push(id);

    const sql = `UPDATE blogs SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);

    return c.json({ success: true, message: 'Blog updated successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Update blog error:', error);
    return c.json({ success: false, error: 'Failed to update blog' } as APIResponse<null>, 500);
  }
});

/**
 * Delete blog (Admin only)
 * DELETE /blogs/:id
 */
blogsRouter.delete('/:id', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const id = parseInt(c.req.param('id'));

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  try {
    await db.execute('DELETE FROM blogs WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Blog deleted successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Delete blog error:', error);
    return c.json({ success: false, error: 'Failed to delete blog' } as APIResponse<null>, 500);
  }
});

/**
 * Helper: Generate URL-friendly slug
 */
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Helper: Calculate reading time (200 words/min)
 */
function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, '');
  const words = text.split(/\s+/).length;
  return Math.ceil(words / 200);
}

export default blogsRouter;
