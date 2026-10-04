/**
 * Pricing Plans API Endpoint Handler
 */

import { Hono } from 'hono';
import { CloudflareEnv, APIResponse } from '../types';
import { getDB, parseJSON, stringifyJSON } from '../db';
import { AuthService, requireAuth, requireRole } from '../auth';

const pricingRouter = new Hono<{ Bindings: CloudflareEnv }>();

interface PricingPlan {
  id: number;
  name: string;
  category: string;
  price?: number;
  price_display?: string;
  description?: string;
  timeline?: string;
  is_popular: number;
  features: string[];
  display_order: number;
  is_active: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get pricing plans (Public)
 * GET /pricing?category=web-design
 */
pricingRouter.get('/', async (c) => {
  const db = getDB(c.env);
  const category = c.req.query('category');

  try {
    let sql = 'SELECT * FROM pricing_plans WHERE is_active = 1';
    let params: any[] = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY display_order ASC';

    const plans = await db.query<any>(sql, params);

    const plansWithParsedFeatures = plans.map(plan => ({
      ...plan,
      features: parseJSON(plan.features, [])
    }));

    return c.json({
      success: true,
      data: plansWithParsedFeatures
    } as APIResponse<PricingPlan[]>);
  } catch (error) {
    console.error('Get pricing error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch pricing' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get all pricing plans (Admin only)
 * GET /pricing/admin/all
 */
pricingRouter.get('/admin/all', async (c) => {
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
    const plans = await db.query<any>(
      'SELECT * FROM pricing_plans ORDER BY display_order ASC'
    );

    const plansWithParsedFeatures = plans.map(plan => ({
      ...plan,
      features: parseJSON(plan.features, [])
    }));

    return c.json({
      success: true,
      data: plansWithParsedFeatures
    } as APIResponse<PricingPlan[]>);
  } catch (error) {
    console.error('Get admin pricing error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch pricing' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Create pricing plan (Admin only)
 * POST /pricing
 */
pricingRouter.post('/', async (c) => {
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
    const { name, category, price, price_display, description, timeline, is_popular, features, display_order } = body;

    if (!name || !category) {
      return c.json(
        { success: false, error: 'Name and category are required' } as APIResponse<null>,
        400
      );
    }

    const id = await db.insert(
      `INSERT INTO pricing_plans (
        name, category, price, price_display, description, timeline,
        is_popular, features, display_order, is_active, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        name,
        category,
        price || null,
        price_display || null,
        description || null,
        timeline || null,
        is_popular ? 1 : 0,
        stringifyJSON(features),
        display_order || 0,
        auth.admin!.id,
        auth.admin!.id
      ]
    );

    return c.json(
      {
        success: true,
        message: 'Pricing plan created successfully',
        data: { id }
      } as APIResponse<any>,
      201
    );
  } catch (error) {
    console.error('Create pricing error:', error);
    return c.json(
      { success: false, error: 'Failed to create pricing plan' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Update pricing plan (Admin only)
 * PUT /pricing/:id
 */
pricingRouter.put('/:id', async (c) => {
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
      'name', 'category', 'price', 'price_display', 'description',
      'timeline', 'is_popular', 'display_order', 'is_active'
    ];

    for (const field of updateableFields) {
      if (field in body) {
        updates.push(`${field} = ?`);
        params.push(body[field] || null);
      }
    }

    if ('features' in body) {
      updates.push('features = ?');
      params.push(stringifyJSON(body.features));
    }

    updates.push('updated_by = ?');
    params.push(auth.admin!.id);

    updates.push('updated_at = datetime("now")');
    params.push(id);

    const sql = `UPDATE pricing_plans SET ${updates.join(', ')} WHERE id = ?`;
    await db.execute(sql, params);

    return c.json({ success: true, message: 'Pricing plan updated successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Update pricing error:', error);
    return c.json(
      { success: false, error: 'Failed to update pricing plan' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Delete pricing plan (Admin only)
 * DELETE /pricing/:id
 */
pricingRouter.delete('/:id', async (c) => {
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
    await db.execute('DELETE FROM pricing_plans WHERE id = ?', [id]);
    return c.json({ success: true, message: 'Pricing plan deleted successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Delete pricing error:', error);
    return c.json(
      { success: false, error: 'Failed to delete pricing plan' } as APIResponse<null>,
      500
    );
  }
});

export default pricingRouter;
