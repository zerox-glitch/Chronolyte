/**
 * Settings API Endpoint Handler
 * Manages site-wide configuration
 */

import { Hono } from 'hono';
import { CloudflareEnv, APIResponse } from '../types';
import { getDB } from '../db';
import { AuthService, requireAuth, requireRole } from '../auth';

const settingsRouter = new Hono<{ Bindings: CloudflareEnv }>();

interface Setting {
  id: number;
  setting_key: string;
  setting_value?: string;
  setting_type?: string;
  description?: string;
  updated_at: string;
}

/**
 * Get all settings (Admin only)
 * GET /settings
 */
settingsRouter.get('/', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    const settings = await db.query<Setting>(
      'SELECT * FROM settings ORDER BY setting_key ASC'
    );

    return c.json({ success: true, data: settings } as APIResponse<Setting[]>);
  } catch (error) {
    console.error('Get settings error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch settings' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get single setting by key (Public for some, admin for others)
 * GET /settings/:key
 */
settingsRouter.get('/:key', async (c) => {
  const db = getDB(c.env);
  const key = c.req.param('key');

  try {
    const setting = await db.queryOne<Setting>(
      'SELECT * FROM settings WHERE setting_key = ?',
      [key]
    );

    if (!setting) {
      return c.json({ success: false, error: 'Setting not found' } as APIResponse<null>, 404);
    }

    return c.json({ success: true, data: setting } as APIResponse<Setting>);
  } catch (error) {
    console.error('Get setting error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch setting' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Update setting (Admin only)
 * PUT /settings/:key
 */
settingsRouter.put('/:key', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const key = c.req.param('key');

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    const body = await c.req.json();
    const { setting_value, setting_type, description } = body;

    // Check if setting exists
    const existing = await db.queryOne<Setting>(
      'SELECT id FROM settings WHERE setting_key = ?',
      [key]
    );

    if (existing) {
      // Update existing setting
      await db.execute(
        `UPDATE settings SET
          setting_value = ?, setting_type = ?, description = ?,
          updated_at = datetime("now")
         WHERE setting_key = ?`,
        [setting_value || null, setting_type || null, description || null, key]
      );
    } else {
      // Create new setting
      await db.insert(
        `INSERT INTO settings (setting_key, setting_value, setting_type, description)
         VALUES (?, ?, ?, ?)`,
        [key, setting_value || null, setting_type || null, description || null]
      );
    }

    return c.json({
      success: true,
      message: existing ? 'Setting updated successfully' : 'Setting created successfully'
    } as APIResponse<null>);
  } catch (error) {
    console.error('Update setting error:', error);
    return c.json(
      { success: false, error: 'Failed to update setting' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Delete setting (Admin only)
 * DELETE /settings/:key
 */
settingsRouter.delete('/:key', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const key = c.req.param('key');

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  if (!requireRole(auth.admin, ['super_admin'])) {
    return c.json({ success: false, error: 'Access denied' } as APIResponse<null>, 403);
  }

  try {
    await db.execute('DELETE FROM settings WHERE setting_key = ?', [key]);
    return c.json({ success: true, message: 'Setting deleted successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Delete setting error:', error);
    return c.json(
      { success: false, error: 'Failed to delete setting' } as APIResponse<null>,
      500
    );
  }
});

export default settingsRouter;
