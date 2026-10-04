// ============================================
// TYPE DEFINITIONS - Mirrors MySQL Schema
// ============================================

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  created_at: string;
  last_login?: string;
  status: 'active' | 'inactive' | 'suspended';
}

export interface Lead {
  id: number | string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  notes?: string;
  message?: string;
  service_interested?: string;
  budget?: string;
  timeline?: string;
  reference_number?: string;
  meta?: Record<string, unknown> | null;
  source: string;
  status: string;
  priority: string;
  assigned_to?: number | string;
  created_at: string;
  updated_at?: string;
}

export interface Project {
  id: number;
  name: string;
  client_name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'review' | 'completed' | 'on_hold';
  type: 'saas' | 'website' | 'automation' | 'ai_tool';
  budget: number;
  start_date: string;
  deadline: string;
  progress: number;
  team_members: number[];
  created_at: string;
}

export interface Testimonial {
  id: number;
  client_name: string;
  client_title: string;
  company: string;
  avatar?: string;
  content: string;
  rating: number;
  featured: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ContentBlock {
  id: number;
  section: string;
  key: string;
  content: string;
  type: 'text' | 'html' | 'json';
  updated_by: number;
  updated_at: string;
}

export interface ActivityLog {
  id: number;
  user_id: number;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: number;
  details?: string;
  ip_address: string;
  created_at: string;
}

export interface DashboardStats {
  total_leads: number;
  new_leads_today: number;
  active_projects: number;
  revenue_this_month: number;
  conversion_rate: number;
  avg_project_value: number;
}

export interface ChartData {
  name: string;
  value: number;
  leads?: number;
  revenue?: number;
}
