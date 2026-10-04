/**
 * Testimonials API Endpoint Handler
 * Handles client testimonials and reviews
 */

import { Hono } from 'hono';
import { CloudflareEnv, Testimonial, APIResponse } from '../types';
import { getDB } from '../db';
import { AuthService, requireAuth, requireRole } from '../auth';

const testimonialsRouter = new Hono<{ Bindings: CloudflareEnv }>();

/**
 * List public testimonials with pagination
 * GET /testimonials?page=1&limit=6
 */
testimonialsRouter.get('/', async (c) => {
  const db = getDB(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '6');

  try {
    const offset = (page - 1) * limit;

    // Get total count of approved testimonials
    const countResult = await db.queryOne<{ total: number }>(
      'SELECT COUNT(*) as total FROM testimonials WHERE is_approved = 1'
    );
    const totalCount = countResult?.total || 0;

    // Get paginated testimonials
    const testimonials = await db.query<Testimonial>(
      `SELECT * FROM testimonials
       WHERE is_approved = 1
       ORDER BY is_featured DESC, created_at DESC
       LIMIT ${limit} OFFSET ${offset}`
    );

    return c.json({
      success: true,
      data: testimonials,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    } as APIResponse<Testimonial[]>);
  } catch (error) {
    console.error('List testimonials error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch testimonials' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get featured testimonials
 * GET /testimonials/featured?limit=3
 */
testimonialsRouter.get('/featured', async (c) => {
  const db = getDB(c.env);
  const limit = parseInt(c.req.query('limit') || '3');

  try {
    const testimonials = await db.query<Testimonial>(
      `SELECT * FROM testimonials
       WHERE is_approved = 1 AND is_featured = 1
       ORDER BY display_order ASC, created_at DESC
       LIMIT ?`,
      [limit]
    );

    return c.json({ success: true, data: testimonials } as APIResponse<Testimonial[]>);
  } catch (error) {
    console.error('Get featured testimonials error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch featured testimonials' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Create testimonial (Public - no auth required)
 * POST /testimonials
 */
testimonialsRouter.post('/', async (c) => {
  const db = getDB(c.env);

  try {
    const body = await c.req.json();
    const { client_name, client_title, client_company, project_name, content, rating, image_url } = body;

    if (!client_name || !content) {
      return c.json(
        { success: false, error: 'Client name and content are required' } as APIResponse<null>,
        400
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return c.json(
        { success: false, error: 'Rating must be between 1 and 5' } as APIResponse<null>,
        400
      );
    }

    const id = await db.insert(
      `INSERT INTO testimonials (
        client_name, client_title, client_company, project_name,
        content, rating, image_url, is_approved, is_featured, display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_name,
        client_title || null,
        client_company || null,
        project_name || null,
        content,
        rating || 5,
        image_url || null,
        0, // Not approved by default
        0, // Not featured by default
        0
      ]
    );

    return c.json(
      {
        success: true,
        message: 'Testimonial submitted successfully. Thank you!',
        data: { id }
      } as APIResponse<any>,
      201
    );
  } catch (error) {
    console.error('Create testimonial error:', error);
    return c.json(
      { success: false, error: 'Failed to create testimonial' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get all testimonials (Admin only)
 * GET /testimonials/admin/all
 */
testimonialsRouter.get('/admin/all', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin', 'admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    const offset = (page - 1) * limit;
    const countResult = await db.queryOne<{ total: number }>(
      'SELECT COUNT(*) as total FROM testimonials'
    );
    const totalCount = countResult?.total || 0;

    const testimonials = await db.query<Testimonial>(
      `SELECT * FROM testimonials
       ORDER BY is_approved DESC, created_at DESC
       LIMIT ${limit} OFFSET ${offset}`
    );

    return c.json({
      success: true,
      data: testimonials,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    } as APIResponse<Testimonial[]>);
  } catch (error) {
    console.error('Get admin testimonials error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch testimonials' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Update testimonial (Admin only)
 * PUT /testimonials/:id
 */
testimonialsRouter.put('/:id', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const id = parseInt(c.req.param('id'));

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin', 'admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    const body = await c.req.json();
    const updates: string[] = [];
    const params: any[] = [];

    const updateableFields = [
      'client_name', 'client_title', 'client_company', 'project_name',
      'content', 'rating', 'image_url', 'is_approved', 'is_featured', 'display_order'
    ];

    for (const field of updateableFields) {
      if (field in body) {
        updates.push(`${field} = ?`);
        params.push(body[field] || null);
      }
    }

    updates.push('updated_at = datetime("now")');
    params.push(id);

    const sql = `UPDATE testimonials SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);

    return c.json({ success: true, message: 'Testimonial updated successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Update testimonial error:', error);
    return c.json(
      { success: false, error: 'Failed to update testimonial' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Approve testimonial (Admin only)
 * PUT /testimonials/:id/approve
 */
testimonialsRouter.put('/:id/approve', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const id = parseInt(c.req.param('id'));

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin', 'admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    await db.execute('UPDATE testimonials SET is_approved = 1, updated_at = datetime("now") WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Testimonial approved' } as APIResponse<null>);
  } catch (error) {
    console.error('Approve testimonial error:', error);
    return c.json(
      { success: false, error: 'Failed to approve testimonial' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Delete testimonial (Admin only)
 * DELETE /testimonials/:id
 */
testimonialsRouter.delete('/:id', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const id = parseInt(c.req.param('id'));

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin', 'admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    await db.execute('DELETE FROM testimonials WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Testimonial deleted successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Delete testimonial error:', error);
    return c.json(
      { success: false, error: 'Failed to delete testimonial' } as APIResponse<null>,
      500
    );
  }
});

export default testimonialsRouter;
