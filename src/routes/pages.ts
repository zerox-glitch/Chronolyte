/**
 * Pages API Endpoint Handler
 * Handles static page content management
 */

import { Hono } from 'hono';
import { CloudflareEnv, APIResponse } from '../types';
import { getDB } from '../db';
import { AuthService, requireAuth, requireRole } from '../auth';

const pagesRouter = new Hono<{ Bindings: CloudflareEnv }>();

interface PageContent {
  id: number;
  page_slug: string;
  page_title: string;
  page_description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  content_sections?: string;
  is_published: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get page by slug (Public)
 * GET /pages/:slug
 */
pagesRouter.get('/:slug', async (c) => {
  const db = getDB(c.env);
  const slug = c.req.param('slug');

  try {
    const page = await db.queryOne<PageContent>(
      'SELECT * FROM page_content WHERE page_slug = ? AND is_published = 1',
      [slug]
    );

    if (!page) {
      return c.json({ success: false, error: 'Page not found' } as APIResponse<null>, 404);
    }

    return c.json({ success: true, data: page } as APIResponse<PageContent>);
  } catch (error) {
    console.error('Get page error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch page' } as APIResponse<null>,
      500
    );
  }
});

/**
 * List all pages (Admin only)
 * GET /pages
 */
pagesRouter.get('/', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin', 'admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    const pages = await db.query<PageContent>(
      'SELECT * FROM page_content ORDER BY page_slug ASC'
    );

    return c.json({ success: true, data: pages } as APIResponse<PageContent[]>);
  } catch (error) {
    console.error('List pages error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch pages' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Create or update page (Admin only)
 * PUT /pages/:slug
 */
pagesRouter.put('/:slug', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const slug = c.req.param('slug');

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin', 'admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    const body = await c.req.json();
    const {
      page_title,
      page_description,
      meta_title,
      meta_description,
      meta_keywords,
      content_sections,
      is_published
    } = body;

    // Check if page exists
    const existing = await db.queryOne<PageContent>(
      'SELECT id FROM page_content WHERE page_slug = ?',
      [slug]
    );

    if (existing) {
      // Update existing page
      await db.execute(
        `UPDATE page_content SET
          page_title = ?, page_description = ?, meta_title = ?,
          meta_description = ?, meta_keywords = ?, content_sections = ?,
          is_published = ?, updated_by = ?, updated_at = datetime("now")
         WHERE page_slug = ?`,
        [
          page_title || null,
          page_description || null,
          meta_title || null,
          meta_description || null,
          meta_keywords || null,
          content_sections || null,
          is_published ? 1 : 0,
          auth.admin!.id,
          slug
        ]
      );
    } else {
      // Create new page
      await db.insert(
        `INSERT INTO page_content (
          page_slug, page_title, page_description, meta_title,
          meta_description, meta_keywords, content_sections,
          is_published, created_by, updated_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          slug,
          page_title || null,
          page_description || null,
          meta_title || null,
          meta_description || null,
          meta_keywords || null,
          content_sections || null,
          is_published ? 1 : 0,
          auth.admin!.id,
          auth.admin!.id
        ]
      );
    }

    return c.json({
      success: true,
      message: existing ? 'Page updated successfully' : 'Page created successfully'
    } as APIResponse<null>);
  } catch (error) {
    console.error('Update page error:', error);
    return c.json(
      { success: false, error: 'Failed to update page' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Delete page (Admin only)
 * DELETE /pages/:slug
 */
pagesRouter.delete('/:slug', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const slug = c.req.param('slug');

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin', 'admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    await db.execute('DELETE FROM page_content WHERE page_slug = ?', [slug]);
    return c.json({ success: true, message: 'Page deleted successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Delete page error:', error);
    return c.json(
      { success: false, error: 'Failed to delete page' } as APIResponse<null>,
      500
    );
  }
});

export default pagesRouter;
