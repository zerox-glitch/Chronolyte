// ============================================
// MOCK DATA - Simulates MySQL Database
// ============================================

import type { User, Lead, Project, Testimonial, ActivityLog, DashboardStats, ChartData } from './types';

export const mockUsers: User[] = [
  {
    id: 1,
    email: 'admin@chronolyte.io',
    name: 'Alex Thompson',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    created_at: '2024-01-15T10:30:00Z',
    last_login: '2025-01-20T14:22:00Z',
    status: 'active'
  },
  {
    id: 2,
    email: 'sarah@chronolyte.io',
    name: 'Sarah Chen',
    role: 'editor',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    created_at: '2024-03-20T08:15:00Z',
    last_login: '2025-01-19T09:45:00Z',
    status: 'active'
  },
  {
    id: 3,
    email: 'mike@chronolyte.io',
    name: 'Mike Rodriguez',
    role: 'viewer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    created_at: '2024-06-10T11:00:00Z',
    last_login: '2025-01-18T16:30:00Z',
    status: 'active'
  }
];

export const mockLeads: Lead[] = [
  {
    id: 1,
    name: 'James Wilson',
    email: 'james@techstartup.io',
    phone: '+1 555-0123',
    company: 'TechStartup Inc',
    message: 'Looking for a custom SaaS solution for our inventory management needs. Budget is flexible for the right solution.',
    source: 'website',
    status: 'qualified',
    priority: 'high',
    assigned_to: 1,
    created_at: '2025-01-20T09:15:00Z',
    updated_at: '2025-01-20T14:30:00Z'
  },
  {
    id: 2,
    name: 'Emily Davis',
    email: 'emily@designagency.co',
    phone: '+1 555-0456',
    company: 'Design Agency Co',
    message: 'We need AI automation for our client onboarding process. Currently handling 50+ new clients monthly.',
    source: 'referral',
    status: 'proposal',
    priority: 'high',
    assigned_to: 2,
    created_at: '2025-01-19T11:30:00Z',
    updated_at: '2025-01-20T10:15:00Z'
  },
  {
    id: 3,
    name: 'Robert Kim',
    email: 'robert@ecommerce.shop',
    company: 'E-Commerce Shop',
    message: 'Interested in a premium website redesign with advanced animations.',
    source: 'organic',
    status: 'new',
    priority: 'medium',
    created_at: '2025-01-20T08:45:00Z',
    updated_at: '2025-01-20T08:45:00Z'
  },
  {
    id: 4,
    name: 'Lisa Chen',
    email: 'lisa@healthtech.med',
    phone: '+1 555-0789',
    company: 'HealthTech Medical',
    message: 'Need custom AI tools for patient data analysis and appointment scheduling.',
    source: 'ads',
    status: 'contacted',
    priority: 'high',
    assigned_to: 1,
    created_at: '2025-01-18T14:20:00Z',
    updated_at: '2025-01-19T16:45:00Z'
  },
  {
    id: 5,
    name: 'David Brown',
    email: 'david@localcafe.biz',
    company: 'Local Cafe',
    message: 'Small business looking for a simple website with online ordering.',
    source: 'social',
    status: 'new',
    priority: 'low',
    created_at: '2025-01-20T07:30:00Z',
    updated_at: '2025-01-20T07:30:00Z'
  },
  {
    id: 6,
    name: 'Amanda Foster',
    email: 'amanda@saasfounder.io',
    phone: '+1 555-0321',
    company: 'SaaS Founder LLC',
    message: 'Building an AI-powered CRM and need a development partner for the entire project.',
    source: 'website',
    status: 'qualified',
    priority: 'high',
    assigned_to: 1,
    created_at: '2025-01-17T10:00:00Z',
    updated_at: '2025-01-20T09:00:00Z'
  }
];

export const mockProjects: Project[] = [
  {
    id: 1,
    name: 'FlowMetrics SaaS Platform',
    client_name: 'TechStartup Inc',
    description: 'Full-stack analytics SaaS with real-time dashboards, custom reporting, and AI-powered insights.',
    status: 'in_progress',
    type: 'saas',
    budget: 85000,
    start_date: '2024-11-15',
    deadline: '2025-03-30',
    progress: 65,
    team_members: [1, 2],
    created_at: '2024-11-01T10:00:00Z'
  },
  {
    id: 2,
    name: 'Luxe Real Estate Website',
    client_name: 'Prestige Properties',
    description: 'Premium real estate website with 3D property tours, advanced search, and lead capture automation.',
    status: 'review',
    type: 'website',
    budget: 35000,
    start_date: '2024-12-01',
    deadline: '2025-02-15',
    progress: 90,
    team_members: [2, 3],
    created_at: '2024-11-20T09:30:00Z'
  },
  {
    id: 3,
    name: 'AI Customer Support Bot',
    client_name: 'E-Commerce Shop',
    description: 'Intelligent chatbot with NLP, sentiment analysis, and seamless handoff to human agents.',
    status: 'planning',
    type: 'ai_tool',
    budget: 25000,
    start_date: '2025-02-01',
    deadline: '2025-04-30',
    progress: 10,
    team_members: [1],
    created_at: '2025-01-10T14:00:00Z'
  },
  {
    id: 4,
    name: 'CRM Automation Suite',
    client_name: 'Design Agency Co',
    description: 'Complete CRM automation including lead scoring, email sequences, and workflow automation.',
    status: 'in_progress',
    type: 'automation',
    budget: 45000,
    start_date: '2024-12-15',
    deadline: '2025-03-01',
    progress: 45,
    team_members: [1, 2, 3],
    created_at: '2024-12-01T11:15:00Z'
  },
  {
    id: 5,
    name: 'HealthTrack Mobile App',
    client_name: 'HealthTech Medical',
    description: 'Patient health tracking app with wearable integration and AI health insights.',
    status: 'completed',
    type: 'saas',
    budget: 120000,
    start_date: '2024-06-01',
    deadline: '2024-12-31',
    progress: 100,
    team_members: [1, 2],
    created_at: '2024-05-15T08:00:00Z'
  }
];

export const mockTestimonials: Testimonial[] = [
  {
    id: 1,
    client_name: 'Jennifer Martinez',
    client_title: 'CEO',
    company: 'InnovateTech Solutions',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
    content: 'Chronolyte transformed our entire digital infrastructure. Their AI automation saved us 200+ hours monthly. The ROI was visible within the first month.',
    rating: 5,
    featured: true,
    status: 'approved',
    created_at: '2024-12-15T10:00:00Z'
  },
  {
    id: 2,
    client_name: 'Marcus Thompson',
    client_title: 'Founder',
    company: 'ScaleUp Ventures',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    content: 'The SaaS platform they built exceeded all expectations. Clean architecture, beautiful UI, and it scales flawlessly. True professionals.',
    rating: 5,
    featured: true,
    status: 'approved',
    created_at: '2024-11-20T14:30:00Z'
  },
  {
    id: 3,
    client_name: 'Rachel Kim',
    client_title: 'Marketing Director',
    company: 'Global Brands Inc',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
    content: 'Our new website is absolutely stunning. The animations and interactions are cinema-quality. Leads increased by 340% since launch.',
    rating: 5,
    featured: false,
    status: 'approved',
    created_at: '2024-10-05T09:15:00Z'
  },
  {
    id: 4,
    client_name: 'Tom Anderson',
    client_title: 'CTO',
    company: 'DataDriven Co',
    content: 'Excellent technical execution and communication throughout the project.',
    rating: 4,
    featured: false,
    status: 'pending',
    created_at: '2025-01-18T16:00:00Z'
  }
];

export const mockActivityLog: ActivityLog[] = [
  {
    id: 1,
    user_id: 1,
    user_name: 'Alex Thompson',
    action: 'Updated lead status',
    entity_type: 'lead',
    entity_id: 1,
    details: 'Status changed from "contacted" to "qualified"',
    ip_address: '192.168.1.100',
    created_at: '2025-01-20T14:30:00Z'
  },
  {
    id: 2,
    user_id: 2,
    user_name: 'Sarah Chen',
    action: 'Created project',
    entity_type: 'project',
    entity_id: 3,
    details: 'New project: AI Customer Support Bot',
    ip_address: '192.168.1.105',
    created_at: '2025-01-20T12:15:00Z'
  },
  {
    id: 3,
    user_id: 1,
    user_name: 'Alex Thompson',
    action: 'Approved testimonial',
    entity_type: 'testimonial',
    entity_id: 3,
    details: 'Testimonial from Rachel Kim approved',
    ip_address: '192.168.1.100',
    created_at: '2025-01-20T10:45:00Z'
  },
  {
    id: 4,
    user_id: 1,
    user_name: 'Alex Thompson',
    action: 'Updated project progress',
    entity_type: 'project',
    entity_id: 1,
    details: 'Progress updated to 65%',
    ip_address: '192.168.1.100',
    created_at: '2025-01-20T09:30:00Z'
  },
  {
    id: 5,
    user_id: 3,
    user_name: 'Mike Rodriguez',
    action: 'Viewed lead details',
    entity_type: 'lead',
    entity_id: 2,
    ip_address: '192.168.1.110',
    created_at: '2025-01-19T16:00:00Z'
  }
];

export const mockDashboardStats: DashboardStats = {
  total_leads: 156,
  new_leads_today: 8,
  active_projects: 4,
  revenue_this_month: 245000,
  conversion_rate: 23.5,
  avg_project_value: 52000
};

export const mockLeadsByMonth: ChartData[] = [
  { name: 'Aug', value: 12, leads: 12 },
  { name: 'Sep', value: 18, leads: 18 },
  { name: 'Oct', value: 25, leads: 25 },
  { name: 'Nov', value: 22, leads: 22 },
  { name: 'Dec', value: 31, leads: 31 },
  { name: 'Jan', value: 28, leads: 28 }
];

export const mockRevenueByMonth: ChartData[] = [
  { name: 'Aug', value: 45000, revenue: 45000 },
  { name: 'Sep', value: 62000, revenue: 62000 },
  { name: 'Oct', value: 78000, revenue: 78000 },
  { name: 'Nov', value: 95000, revenue: 95000 },
  { name: 'Dec', value: 120000, revenue: 120000 },
  { name: 'Jan', value: 145000, revenue: 145000 }
];

export const mockLeadSources: ChartData[] = [
  { name: 'Website', value: 45 },
  { name: 'Referral', value: 25 },
  { name: 'Organic', value: 15 },
  { name: 'Ads', value: 10 },
  { name: 'Social', value: 5 }
];

export const mockProjectTypes: ChartData[] = [
  { name: 'SaaS', value: 40 },
  { name: 'Website', value: 30 },
  { name: 'Automation', value: 20 },
  { name: 'AI Tools', value: 10 }
];
