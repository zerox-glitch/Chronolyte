/**
 * Literal rewrite target for vercel.json rewrites.
 *
 * Vercel's api-directory router matches only ONE path segment per bracket
 * file (both [[...slug]] and [...slug] behave like a single :param), so
 * multi-segment paths (/api/auth/login, /api/blogs/1001, /uploads/...)
 * never reach the function. All unmatched requests are funneled here by
 * vercel.json rewrites, which auto-append the captured original path as
 * the `__orig` query param (plus `__ns` for namespace prefixes). The entry
 * in [...slug].js reconstructs the real pathname from those params.
 */
export { default } from './[...slug].js';
