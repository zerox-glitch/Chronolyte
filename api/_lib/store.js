/** Store factory: Neon Postgres when DATABASE_URL is set, JSON file store otherwise. */

export async function createStore() {
  if (process.env.DATABASE_URL) {
    const { createNeonStore } = await import('./store-neon.js');
    return createNeonStore(process.env.DATABASE_URL);
  }
  const { createJsonStore } = await import('./store-json.js');
  const path = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const here = path.dirname(fileURLToPath(import.meta.url));
  return createJsonStore(path.resolve(here, '..', '..', 'data'));
}
