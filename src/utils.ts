/**
 * Common Utility Functions
 */

/**
 * Format date for display
 */
export function formatDate(date: string | Date, format: 'short' | 'long' | 'full' = 'long'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' });
    case 'long':
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    case 'full':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
  }
}

/**
 * Slugify a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Generate random string
 */
export function randomString(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculate reading time
 */
export function calculateReadingTime(content: string): number {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  // Count words (assuming 200 words per minute)
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Get excerpt from content
 */
export function getExcerpt(content: string, maxLength: number = 150): string {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, '');
  // Remove extra whitespace
  const clean = text.replace(/\s+/g, ' ').trim();
  // Truncate and add ellipsis
  return clean.length > maxLength ? clean.substring(0, maxLength) + '...' : clean;
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate SEO meta description
 */
export function generateMetaDescription(content: string, maxLength: number = 160): string {
  const excerpt = getExcerpt(content, maxLength);
  return excerpt.substring(0, maxLength);
}

/**
 * Deep clone object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Merge objects
 */
export function merge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  return { ...target, ...source };
}

/**
 * Sanitize HTML (basic)
 */
export function sanitizeHTML(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Paginate array
 */
export function paginate<T>(array: T[], page: number = 1, limit: number = 10): { data: T[]; total: number; pages: number } {
  const total = array.length;
  const pages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  const data = array.slice(start, end);

  return { data, total, pages };
}

/**
 * Retry function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      const delay = delayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw new Error('Retry failed');
}

/**
 * Cache wrapper
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttl: number = 3600,
  cache?: Map<string, { data: T; expires: number }>
): Promise<T> {
  if (!cache) {
    cache = new Map();
  }

  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const data = await fn();
  cache.set(key, { data, expires: Date.now() + ttl * 1000 });

  return data;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function (...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 300
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

/**
 * Parse query string
 */
export function parseQuery(query: string): Record<string, string> {
  const params = new URLSearchParams(query);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Build query string
 */
export function buildQuery(params: Record<string, any>): string {
  const entries = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);

  return entries.length > 0 ? '?' + entries.join('&') : '';
}

/**
 * Handle errors gracefully
 */
export function handleError(error: unknown): { message: string; status: number } {
  if (error instanceof Error) {
    return { message: error.message, status: 500 };
  }

  if (typeof error === 'string') {
    return { message: error, status: 400 };
  }

  return { message: 'An unknown error occurred', status: 500 };
}
