/**
 * Shared TypeScript Interfaces & Types
 */

export interface Admin {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'admin' | 'editor' | 'viewer';
  avatar?: string;
  is_active: number;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  featured_image_alt?: string;
  author_id: number;
  author_name?: string;
  category?: string;
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  is_published: number;
  is_featured: number;
  view_count: number;
  reading_time?: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  images?: BlogImage[];
}

export interface BlogImage {
  id: number;
  blog_id: number;
  image_url: string;
  image_alt?: string;
  image_title?: string;
  display_order: number;
  uploaded_at: string;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  client_name: string;
  client_logo?: string;
  short_description?: string;
  full_description?: string;
  project_type: string;
  tech_stack?: string[];
  features?: string[];
  metrics?: Record<string, any>;
  live_url?: string;
  demo_url?: string;
  github_url?: string;
  case_study_url?: string;
  start_date?: string;
  end_date?: string;
  duration_weeks?: number;
  thumbnail_image?: string;
  featured_image?: string;
  is_featured: number;
  is_published: number;
  display_order: number;
  meta_title?: string;
  meta_description?: string;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  service_interested?: string;
  budget?: string;
  status: 'new' | 'contacted' | 'interested' | 'proposal_sent' | 'negotiating' | 'won' | 'lost';
  notes?: string;
  source?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: number;
  expected_value?: number;
  follow_up_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_title?: string;
  client_company?: string;
  project_name?: string;
  content: string;
  rating: number;
  image_url?: string;
  is_approved: number;
  is_featured: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface File {
  id: number;
  filename: string;
  original_name: string;
  type: 'image' | 'video' | 'document';
  category: string;
  mimetype?: string;
  size: number;
  r2_key: string;
  uploaded_by?: number;
  uploaded_at: string;
  updated_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface JWTPayload {
  id: number;
  username: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface AuthContext {
  user?: Admin;
  isAuthenticated: boolean;
  token?: string;
}

export interface CloudflareEnv {
  DB: D1Database;
  UPLOADS: R2Bucket;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  API_URL: string;
  ENVIRONMENT: string;
}
