/**
 * Leads API Endpoint Handler
 * Handles lead capture and CRM operations
 */

import { Hono } from 'hono';
import { CloudflareEnv, Lead, APIResponse } from '../types';
import { getDB } from '../db';
import { AuthService, requireAuth, requireRole } from '../auth';

const leadsRouter = new Hono<{ Bindings: CloudflareEnv }>();

/**
 * List leads with filtering and pagination (Admin only)
 * GET /leads?page=1&limit=20&status=new&priority=high
 */
leadsRouter.get('/', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '20');
  const status = c.req.query('status');
  const priority = c.req.query('priority');

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin', 'admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    let whereClauses = [];
    let params: any[] = [];

    if (status) {
      whereClauses.push('status = ?');
      params.push(status);
    }

    if (priority) {
      whereClauses.push('priority = ?');
      params.push(priority);
    }

    const whereClause = whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : '';

    // Get total count
    const countSql = `SELECT COUNT(*) as total FROM leads ${whereClause}`;
    const countResult = await db.queryOne<{ total: number }>(countSql, params);
    const totalCount = countResult?.total || 0;

    // Get paginated results
    const offset = (page - 1) * limit;
    const sql = `
      SELECT l.*, a.username as assigned_to_name
      FROM leads l
      LEFT JOIN admins a ON l.assigned_to = a.id
      ${whereClause}
      ORDER BY l.priority DESC, l.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const leads = await db.query<Lead>(sql, params);

    return c.json({
      success: true,
      data: leads,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    } as APIResponse<Lead[]>);
  } catch (error) {
    console.error('List leads error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch leads' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get single lead (Admin only)
 * GET /leads/:id
 */
leadsRouter.get('/:id', async (c) => {
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
    const lead = await db.queryOne<Lead>(
      'SELECT l.*, a.username as assigned_to_name FROM leads l LEFT JOIN admins a ON l.assigned_to = a.id WHERE l.id = ?',
      [id]
    );

    if (!lead) {
      return c.json({ success: false, error: 'Lead not found' } as APIResponse<null>, 404);
    }

    return c.json({ success: true, data: lead } as APIResponse<Lead>);
  } catch (error) {
    console.error('Get lead error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch lead' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Create lead (Public - no auth required)
 * POST /leads
 */
leadsRouter.post('/', async (c) => {
  const db = getDB(c.env);

  try {
    const body = await c.req.json();
    const { name, email, phone, company, service_interested, budget, source, notes } = body;

    if (!name || !email) {
      return c.json(
        { success: false, error: 'Name and email are required' } as APIResponse<null>,
        400
      );
    }

    const id = await db.insert(
      `INSERT INTO leads (
        name, email, phone, company, service_interested, budget,
        status, priority, source, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phone || null,
        company || null,
        service_interested || null,
        budget || null,
        'new',
        'medium',
        source || 'website',
        notes || null
      ]
    );

    return c.json(
      {
        success: true,
        message: 'Lead created successfully. We will contact you soon!',
        data: { id }
      } as APIResponse<any>,
      201
    );
  } catch (error) {
    console.error('Create lead error:', error);
    return c.json(
      { success: false, error: 'Failed to create lead' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Update lead (Admin only)
 * PUT /leads/:id
 */
leadsRouter.put('/:id', async (c) => {
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
      'name', 'email', 'phone', 'company', 'service_interested', 'budget',
      'status', 'priority', 'notes', 'assigned_to', 'expected_value', 'follow_up_date'
    ];

    for (const field of updateableFields) {
      if (field in body) {
        updates.push(`${field} = ?`);
        params.push(body[field] || null);
      }
    }

    updates.push('updated_at = datetime("now")');
    params.push(id);

    const sql = `UPDATE leads SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);

    return c.json({ success: true, message: 'Lead updated successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Update lead error:', error);
    return c.json(
      { success: false, error: 'Failed to update lead' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Delete lead (Admin only)
 * DELETE /leads/:id
 */
leadsRouter.delete('/:id', async (c) => {
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
    await db.execute('DELETE FROM leads WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Lead deleted successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Delete lead error:', error);
    return c.json(
      { success: false, error: 'Failed to delete lead' } as APIResponse<null>,
      500
    );
  }
});

export default leadsRouter;
