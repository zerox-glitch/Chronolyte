/**
 * Projects API Endpoint Handler
 * Handles all project portfolio operations
 */

import { Hono } from 'hono';
import { CloudflareEnv, Project, APIResponse } from '../types';
import { Database, getDB, parseJSON, stringifyJSON } from '../db';
import { AuthService, requireAuth, requireRole } from '../auth';
import { slugify } from '../utils';

const projectsRouter = new Hono<{ Bindings: CloudflareEnv }>();

/**
 * List projects with pagination and filtering
 * GET /projects?page=1&limit=6&featured=true&status=published
 */
projectsRouter.get('/', async (c) => {
  const db = getDB(c.env);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '6');
  const featured = c.req.query('featured');
  const status = c.req.query('status') || 'published';

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

    if (featured === 'true') {
      whereClauses.push('is_featured = 1');
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM projects ${whereClause}`;
    const countResult = await db.queryOne<{ total: number }>(countSql, params);
    const totalCount = countResult?.total || 0;

    // Get paginated results
    const offset = (page - 1) * limit;
    const sql = `
      SELECT * FROM projects
      ${whereClause}
      ORDER BY display_order ASC, created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const projects = await db.query<Project>(sql, params);

    // Parse JSON fields
    const projectsWithParsedData = projects.map(p => ({
      ...p,
      tech_stack: parseJSON(p.tech_stack as any, []),
      features: parseJSON(p.features as any, []),
      metrics: parseJSON(p.metrics as any, {})
    }));

    return c.json({
      success: true,
      data: projectsWithParsedData,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    } as APIResponse<Project[]>);
  } catch (error) {
    console.error('List projects error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch projects' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get single project by ID or slug
 * GET /projects/:id
 */
projectsRouter.get('/:id', async (c) => {
  const db = getDB(c.env);
  const id = c.req.param('id');

  try {
    let project: Project | null;

    if (/^\d+$/.test(id)) {
      project = await db.queryOne<Project>(
        'SELECT * FROM projects WHERE id = ?',
        [parseInt(id)]
      );
    } else {
      project = await db.queryOne<Project>(
        'SELECT * FROM projects WHERE slug = ?',
        [id]
      );
    }

    if (!project) {
      return c.json({ success: false, error: 'Project not found' } as APIResponse<null>, 404);
    }

    // Check if non-authenticated user can view
    if (project.is_published === 0) {
      const authHeader = c.req.header('Authorization');
      if (!authHeader) {
        return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
      }
    }

    // Increment view count
    await db.execute('UPDATE projects SET view_count = view_count + 1 WHERE id = ?', [project.id]);
    project.view_count++;

    // Parse JSON fields
    const projectWithParsedData = {
      ...project,
      tech_stack: parseJSON(project.tech_stack as any, []),
      features: parseJSON(project.features as any, []),
      metrics: parseJSON(project.metrics as any, {})
    };

    return c.json({ success: true, data: projectWithParsedData } as APIResponse<Project>);
  } catch (error) {
    console.error('Get project error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch project' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get featured projects
 * GET /projects/featured?limit=3
 */
projectsRouter.get('/featured', async (c) => {
  const db = getDB(c.env);
  const limit = parseInt(c.req.query('limit') || '3');

  try {
    const projects = await db.query<Project>(
      `SELECT * FROM projects
       WHERE is_featured = 1 AND is_published = 1
       ORDER BY display_order ASC, created_at DESC
       LIMIT ?`,
      [limit]
    );

    const projectsWithParsedData = projects.map(p => ({
      ...p,
      tech_stack: parseJSON(p.tech_stack as any, []),
      features: parseJSON(p.features as any, []),
      metrics: parseJSON(p.metrics as any, {})
    }));

    return c.json({ success: true, data: projectsWithParsedData } as APIResponse<Project[]>);
  } catch (error) {
    console.error('Get featured projects error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch featured projects' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Create project (Admin only)
 * POST /projects
 */
projectsRouter.post('/', async (c) => {
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
    const body = await c.req.json();
    const {
      title,
      client_name,
      short_description,
      full_description,
      project_type,
      tech_stack,
      features,
      metrics,
      live_url,
      demo_url,
      github_url,
      case_study_url,
      start_date,
      end_date,
      thumbnail_image,
      featured_image,
      is_featured,
      is_published,
      display_order
    } = body;

    if (!title || !client_name) {
      return c.json(
        { success: false, error: 'Title and client name are required' } as APIResponse<null>,
        400
      );
    }

    const slug = slugify(title);
    const existing = await db.queryOne('SELECT id FROM projects WHERE slug = ?', [slug]);
    if (existing) {
      return c.json(
        { success: false, error: 'Project with this title already exists' } as APIResponse<null>,
        400
      );
    }

    // Calculate duration
    let durationWeeks = null;
    if (start_date && end_date) {
      const start = new Date(start_date).getTime();
      const end = new Date(end_date).getTime();
      durationWeeks = Math.ceil((end - start) / (7 * 24 * 60 * 60 * 1000));
    }

    const id = await db.insert(
      `INSERT INTO projects (
        title, slug, client_name, short_description, full_description,
        project_type, tech_stack, features, metrics, live_url, demo_url,
        github_url, case_study_url, start_date, end_date, duration_weeks,
        thumbnail_image, featured_image, is_featured, is_published, display_order,
        created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        slug,
        client_name,
        short_description || null,
        full_description || null,
        project_type || 'web',
        stringifyJSON(tech_stack),
        stringifyJSON(features),
        stringifyJSON(metrics),
        live_url || null,
        demo_url || null,
        github_url || null,
        case_study_url || null,
        start_date || null,
        end_date || null,
        durationWeeks,
        thumbnail_image || null,
        featured_image || null,
        is_featured ? 1 : 0,
        is_published ? 1 : 0,
        display_order || 0,
        auth.admin!.id,
        auth.admin!.id
      ]
    );

    return c.json(
      { success: true, message: 'Project created successfully', data: { id, slug } } as APIResponse<any>,
      201
    );
  } catch (error) {
    console.error('Create project error:', error);
    return c.json(
      { success: false, error: 'Failed to create project' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Update project (Admin only)
 * PUT /projects/:id
 */
projectsRouter.put('/:id', async (c) => {
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
      'title', 'client_name', 'short_description', 'full_description', 'project_type',
      'live_url', 'demo_url', 'github_url', 'case_study_url', 'start_date', 'end_date',
      'thumbnail_image', 'featured_image', 'is_featured', 'is_published', 'display_order'
    ];

    for (const field of updateableFields) {
      if (field in body) {
        updates.push(`${field} = ?`);
        params.push(body[field] || null);
      }
    }

    // Handle JSON fields
    if ('tech_stack' in body) {
      updates.push('tech_stack = ?');
      params.push(stringifyJSON(body.tech_stack));
    }

    if ('features' in body) {
      updates.push('features = ?');
      params.push(stringifyJSON(body.features));
    }

    if ('metrics' in body) {
      updates.push('metrics = ?');
      params.push(stringifyJSON(body.metrics));
    }

    updates.push('updated_by = ?');
    params.push(auth.admin!.id);

    updates.push('updated_at = datetime("now")');
    params.push(id);

    const sql = `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);

    return c.json({ success: true, message: 'Project updated successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Update project error:', error);
    return c.json(
      { success: false, error: 'Failed to update project' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Delete project (Admin only)
 * DELETE /projects/:id
 */
projectsRouter.delete('/:id', async (c) => {
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
    await db.execute('DELETE FROM projects WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Project deleted successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Delete project error:', error);
    return c.json(
      { success: false, error: 'Failed to delete project' } as APIResponse<null>,
      500
    );
  }
});

export default projectsRouter;
