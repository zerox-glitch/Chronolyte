/**
 * Authentication API Endpoint
 * Handles login and token management
 */

import { Hono } from 'hono';
import { CloudflareEnv, APIResponse } from '../types';
import { getDB } from '../db';
import { AuthService, requireAuth } from '../auth';

const authRouter = new Hono<{ Bindings: CloudflareEnv }>();

/**
 * Login endpoint
 * POST /auth/login
 * Body: { username, password }
 */
authRouter.post('/login', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);

  try {
    const { username, password } = await c.req.json();

    if (!username || !password) {
      return c.json(
        { success: false, error: 'Username and password required' } as APIResponse<null>,
        400
      );
    }

    const result = await authService.authenticate(username, password);

    if (!result) {
      return c.json(
        { success: false, error: 'Invalid credentials' } as APIResponse<null>,
        401
      );
    }

    return c.json({
      success: true,
      message: 'Login successful',
      data: {
        admin: result.admin,
        token: result.token
      }
    } as APIResponse<any>);
  } catch (error) {
    console.error('Login error:', error);
    return c.json(
      { success: false, error: 'Login failed' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get current user info
 * GET /auth/me
 * Requires: Authorization header with Bearer token
 */
authRouter.get('/me', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);

  try {
    const auth = await requireAuth(c.request, authService);

    if (auth.error || !auth.admin) {
      return c.json(
        { success: false, error: 'Not authenticated' } as APIResponse<null>,
        401
      );
    }

    // Don't send password hash
    const { password_hash, ...admin } = auth.admin;

    return c.json({
      success: true,
      data: admin
    } as APIResponse<any>);
  } catch (error) {
    console.error('Get user error:', error);
    return c.json(
      { success: false, error: 'Failed to get user info' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Change password
 * PUT /auth/password
 * Requires: Authorization header
 * Body: { currentPassword, newPassword }
 */
authRouter.put('/password', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);

  try {
    const auth = await requireAuth(c.request, authService);

    if (auth.error || !auth.admin) {
      return c.json(
        { success: false, error: 'Not authenticated' } as APIResponse<null>,
        401
      );
    }

    const { currentPassword, newPassword } = await c.req.json();

    if (!currentPassword || !newPassword) {
      return c.json(
        { success: false, error: 'Current and new passwords required' } as APIResponse<null>,
        400
      );
    }

    // Verify current password
    const passwordValid = await authService.verifyPassword(currentPassword, auth.admin.password_hash);
    if (!passwordValid) {
      return c.json(
        { success: false, error: 'Current password is incorrect' } as APIResponse<null>,
        401
      );
    }

    // Update password
    const success = await authService.updatePassword(auth.admin.id, newPassword);

    if (!success) {
      return c.json(
        { success: false, error: 'Failed to update password' } as APIResponse<null>,
        500
      );
    }

    return c.json({
      success: true,
      message: 'Password updated successfully'
    } as APIResponse<null>);
  } catch (error) {
    console.error('Change password error:', error);
    return c.json(
      { success: false, error: 'Failed to change password' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Logout endpoint
 * POST /auth/logout
 * Requires: Authorization header (just for validation)
 */
authRouter.post('/logout', async (c) => {
  // In JWT-based auth, logout is client-side (delete token)
  // This endpoint just validates the token and confirms logout
  return c.json({
    success: true,
    message: 'Logged out successfully. Please delete your token.'
  } as APIResponse<null>);
});

export default authRouter;
