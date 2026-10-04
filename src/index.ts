/**
 * Chronolyte Backend API - Main Entry Point
 * Cloudflare Workers + Hono
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { CloudflareEnv, APIResponse } from './types';
import authRouter from './routes/auth';
import blogsRouter from './routes/blogs';
import projectsRouter from './routes/projects';
import leadsRouter from './routes/leads';
import testimonialsRouter from './routes/testimonials';
import uploadRouter from './routes/upload';
import pagesRouter from './routes/pages';
import pricingRouter from './routes/pricing';
import settingsRouter from './routes/settings';

// Create main app
const app = new Hono<{ Bindings: CloudflareEnv }>();

// ===== MIDDLEWARE =====

// CORS Configuration
app.use('*', cors({
  origin: ['https://chronolyte.com', 'https://www.chronolyte.com', 'http://localhost:3000', 'http://localhost:5173'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Type'],
  maxAge: 86400
}));

// Request logging middleware
app.use('*', async (c, next) => {
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`);
  
  await next();
  
  const duration = Date.now() - startTime;
  console.log(`  → ${c.res.status} (${duration}ms)`);
});

// ===== HEALTH CHECK =====

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: c.env.ENVIRONMENT
  });
});

// ===== API ROUTES =====

// API Routes
app.route('/auth', authRouter);
app.route('/blogs', blogsRouter);
app.route('/projects', projectsRouter);
app.route('/leads', leadsRouter);
app.route('/testimonials', testimonialsRouter);
app.route('/upload', uploadRouter);
app.route('/pages', pagesRouter);
app.route('/pricing', pricingRouter);
app.route('/settings', settingsRouter);

// ===== ROOT ENDPOINT =====

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Chronolyte API v1.0',
    endpoints: {
      auth: '/auth',
      blogs: '/blogs',
      health: '/health',
      version: 'v1'
    }
  } as APIResponse<any>);
});

// ===== 404 HANDLER =====

app.notFound((c) => {
  return c.json(
    { success: false, error: 'Endpoint not found' } as APIResponse<null>,
    404
  );
});

// ===== ERROR HANDLER =====

app.onError((err, c) => {
  console.error('Application error:', err);
  
  return c.json(
    {
      success: false,
      error: c.env.ENVIRONMENT === 'production' ? 'Internal server error' : err.message
    } as APIResponse<null>,
    500
  );
});

export default app;
