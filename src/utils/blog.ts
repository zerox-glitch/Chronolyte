export interface BlogImage {
  id: number | string;
  image_url: string;
  image_alt: string;
}

export interface BlogRecord {
  id: number | string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  featured_image_alt: string;
  author_name: string;
  category: string;
  tags: string[];
  meta_title: string;
  meta_description: string;
  view_count: number;
  reading_time: number;
  published_at: string;
  created_at: string;
  updated_at: string;
  images: BlogImage[];
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null ? value as Record<string, unknown> : {};
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

function asNumber(value: unknown): number {
  const result = Number(value);
  return Number.isFinite(result) ? result : 0;
}

export function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((tag): tag is string => typeof tag === 'string');
  if (typeof value !== 'string' || !value.trim()) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed.filter((tag): tag is string => typeof tag === 'string');
  } catch {
    return value.split(',').map((tag) => tag.trim()).filter(Boolean);
  }
  return [];
}

export function normalizeBlog(value: unknown): BlogRecord {
  const raw = asRecord(value);
  const images = Array.isArray(raw.images)
    ? raw.images.map((image, index) => {
        const item = asRecord(image);
        return {
          id: (typeof item.id === 'number' || typeof item.id === 'string') ? item.id : index,
          image_url: asText(item.image_url || item.url),
          image_alt: asText(item.image_alt || item.alt)
        };
      }).filter((image) => image.image_url)
    : [];
  const publishedAt = asText(raw.published_at || raw.updated_at || raw.created_at);

  return {
    id: (typeof raw.id === 'number' || typeof raw.id === 'string') ? raw.id : asText(raw.slug),
    title: asText(raw.title) || 'Untitled guide',
    slug: asText(raw.slug),
    excerpt: asText(raw.excerpt),
    content: asText(raw.content),
    featured_image: asText(raw.featured_image || raw.cover_image || raw.image_url),
    featured_image_alt: asText(raw.featured_image_alt || raw.cover_image_alt || raw.title) || 'Chronolyte guide',
    author_name: asText(raw.author_name || raw.author) || 'Chronolyte',
    category: asText(raw.category) || 'Guide',
    tags: normalizeTags(raw.tags),
    meta_title: asText(raw.meta_title || raw.seo_title),
    meta_description: asText(raw.meta_description || raw.seo_description),
    view_count: asNumber(raw.view_count ?? raw.views),
    reading_time: asNumber(raw.reading_time ?? raw.read_time),
    published_at: publishedAt,
    created_at: asText(raw.created_at),
    updated_at: asText(raw.updated_at),
    images
  };
}

export function formatBlogDate(value: string, options: Intl.DateTimeFormatOptions = {
  year: 'numeric', month: 'short', day: 'numeric'
}): string {
  if (!value) return 'Recently updated';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Recently updated'
    : date.toLocaleDateString('en-US', options);
}
