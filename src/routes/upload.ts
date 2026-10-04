/**
 * Upload API Endpoint Handler
 * Handles file uploads to R2 storage
 */

import { Hono } from 'hono';
import { CloudflareEnv, File, APIResponse } from '../types';
import { getDB, stringifyJSON } from '../db';
import { AuthService, requireAuth } from '../auth';
import { getStorageService } from '../storage';

const uploadRouter = new Hono<{ Bindings: CloudflareEnv }>();

/**
 * Allowed file types and max sizes
 */
const ALLOWED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const MAX_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  document: 5 * 1024 * 1024 // 5MB
};

/**
 * Upload file to R2 (Admin only)
 * POST /upload?category=blogs
 */
uploadRouter.post('/', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const category = c.req.query('category') || 'general';

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  try {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return c.json(
        { success: false, error: 'No file provided' } as APIResponse<null>,
        400
      );
    }

    // Determine file type from MIME type
    let fileType: 'image' | 'video' | 'document' = 'document';
    if (file.type.startsWith('image/')) fileType = 'image';
    else if (file.type.startsWith('video/')) fileType = 'video';

    // Validate file type
    if (!ALLOWED_TYPES[fileType].includes(file.type)) {
      return c.json(
        {
          success: false,
          error: `File type not allowed. Allowed types: ${ALLOWED_TYPES[fileType].join(', ')}`
        } as APIResponse<null>,
        400
      );
    }

    // Validate file size
    if (file.size > MAX_SIZES[fileType]) {
      return c.json(
        {
          success: false,
          error: `File size exceeds maximum of ${MAX_SIZES[fileType] / 1024 / 1024}MB`
        } as APIResponse<null>,
        400
      );
    }

    // Upload to R2
    const storage = getStorageService(c.env);
    const buffer = await file.arrayBuffer();
    const { url, key } = await storage.uploadToCategory(category, file.name, buffer, file.type);

    // Store metadata in database
    const fileId = await db.insert(
      `INSERT INTO files (
        filename, original_name, type, category, mimetype, size, r2_key, uploaded_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        key,
        file.name,
        fileType,
        category,
        file.type,
        file.size,
        key,
        auth.admin!.id
      ]
    );

    return c.json(
      {
        success: true,
        message: 'File uploaded successfully',
        data: {
          id: fileId,
          url,
          key,
          filename: file.name,
          size: file.size,
          type: fileType,
          category
        }
      } as APIResponse<any>,
      201
    );
  } catch (error) {
    console.error('Upload error:', error);
    return c.json(
      { success: false, error: 'File upload failed' } as APIResponse<null>,
      500
    );
  }
});

/**
 * List uploaded files by category (Admin only)
 * GET /upload/list/:category?page=1&limit=10
 */
uploadRouter.get('/list/:category', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const category = c.req.param('category');
  const page = parseInt(c.req.query('page') || '1');
  const limit = parseInt(c.req.query('limit') || '10');

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  try {
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db.queryOne<{ total: number }>(
      'SELECT COUNT(*) as total FROM files WHERE category = ?',
      [category]
    );
    const totalCount = countResult?.total || 0;

    // Get paginated files
    const files = await db.query<File>(
      `SELECT f.*, a.username as uploaded_by_name
       FROM files f
       LEFT JOIN admins a ON f.uploaded_by = a.id
       WHERE f.category = ?
       ORDER BY f.uploaded_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      [category]
    );

    return c.json({
      success: true,
      data: files,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    } as APIResponse<File[]>);
  } catch (error) {
    console.error('List files error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch files' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Get file info (Admin only)
 * GET /upload/:id/info
 */
uploadRouter.get('/:id/info', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const id = parseInt(c.req.param('id'));

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  try {
    const file = await db.queryOne<File>(
      `SELECT f.*, a.username as uploaded_by_name
       FROM files f
       LEFT JOIN admins a ON f.uploaded_by = a.id
       WHERE f.id = ?`,
      [id]
    );

    if (!file) {
      return c.json({ success: false, error: 'File not found' } as APIResponse<null>, 404);
    }

    return c.json({ success: true, data: file } as APIResponse<File>);
  } catch (error) {
    console.error('Get file error:', error);
    return c.json(
      { success: false, error: 'Failed to fetch file' } as APIResponse<null>,
      500
    );
  }
});

/**
 * Delete file from R2 (Admin only)
 * DELETE /upload/:id
 */
uploadRouter.delete('/:id', async (c) => {
  const db = getDB(c.env);
  const authService = new AuthService(db, c.env.JWT_SECRET);
  const id = parseInt(c.req.param('id'));

  const auth = await requireAuth(c.request, authService);
  if (auth.error) {
    return c.json({ success: false, error: auth.error } as APIResponse<null>, 401);
  }

  try {
    const file = await db.queryOne<File>('SELECT * FROM files WHERE id = ?', [id]);

    if (!file) {
      return c.json({ success: false, error: 'File not found' } as APIResponse<null>, 404);
    }

    // Delete from R2
    const storage = getStorageService(c.env);
    await storage.deleteFile(file.r2_key);

    // Delete from database
    await db.execute('DELETE FROM files WHERE id = ?', [id]);

    return c.json({ success: true, message: 'File deleted successfully' } as APIResponse<null>);
  } catch (error) {
    console.error('Delete file error:', error);
    return c.json(
      { success: false, error: 'Failed to delete file' } as APIResponse<null>,
      500
    );
  }
});

export default uploadRouter;
