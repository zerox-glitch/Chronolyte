/**
 * API Fetch Utility for React Frontend
 * Provides helper functions for API calls with automatic token handling
 */

interface APIResponse<T = any> {
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

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8787');
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

// ===== TOKEN MANAGEMENT =====

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getAuthUser(): any {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
}

export function setAuthUser(user: any): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// ===== FETCH HELPER =====

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
  parseResponse?: boolean;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<{ data: T; pagination?: any; success: boolean; error?: string }> {
  const { skipAuth = false, parseResponse = true, ...fetchOptions } = options;
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = new Headers(fetchOptions.headers || {});

  // Set Content-Type for JSON requests
  if (fetchOptions.body && typeof fetchOptions.body === 'string') {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }
  }

  // Add authorization header
  if (!skipAuth) {
    const token = getAuthToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    if (!parseResponse) {
      return { data: (await response.json()) as T, success: true };
    }

    const jsonData: APIResponse<T> = await response.json();
    return {
      data: jsonData.data as T,
      pagination: jsonData.pagination,
      success: jsonData.success,
      error: jsonData.error
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error(`API Error [${endpoint}]:`, errorMessage);
    throw new Error(errorMessage);
  }
}

// ===== AUTHENTICATION ENDPOINTS =====

export async function login(
  username: string,
  password: string
): Promise<{ token: string; admin: any }> {
  const { data } = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
    skipAuth: true
  });

  if (data?.token) {
    setAuthToken(data.token);
    setAuthUser(data.admin);
  }

  return data;
}

export async function logout(): Promise<void> {
  clearAuthToken();
  await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {
    // Ignore errors on logout
  });
}

export async function getCurrentUser(): Promise<any> {
  const { data } = await apiFetch('/auth/me');
  return data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

// ===== BLOGS ENDPOINTS =====

export async function getBlogs(page: number = 1, limit: number = 10, filters?: any) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...filters
  });

  return apiFetch(`/blogs?${params.toString()}`);
}

export async function getBlog(slugOrId: string | number) {
  return apiFetch(`/blogs/${slugOrId}`);
}

export async function getFeaturedBlogs(limit: number = 3) {
  return apiFetch(`/blogs/featured?limit=${limit}`);
}

export async function createBlog(blogData: any) {
  return apiFetch('/blogs', {
    method: 'POST',
    body: JSON.stringify(blogData)
  });
}

export async function updateBlog(id: number, blogData: any) {
  return apiFetch(`/blogs/${id}`, {
    method: 'PUT',
    body: JSON.stringify(blogData)
  });
}

export async function deleteBlog(id: number) {
  return apiFetch(`/blogs/${id}`, {
    method: 'DELETE'
  });
}

// ===== PROJECTS ENDPOINTS =====

export async function getProjects(page: number = 1, limit: number = 6, filters?: any) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...filters
  });

  return apiFetch(`/projects?${params.toString()}`);
}

export async function getProject(slugOrId: string | number) {
  return apiFetch(`/projects/${slugOrId}`);
}

export async function getFeaturedProjects(limit: number = 3) {
  return apiFetch(`/projects/featured?limit=${limit}`);
}

export async function createProject(projectData: any) {
  return apiFetch('/projects', {
    method: 'POST',
    body: JSON.stringify(projectData)
  });
}

export async function updateProject(id: number, projectData: any) {
  return apiFetch(`/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(projectData)
  });
}

export async function deleteProject(id: number) {
  return apiFetch(`/projects/${id}`, {
    method: 'DELETE'
  });
}

// ===== TESTIMONIALS ENDPOINTS =====

export async function getTestimonials(page: number = 1, limit: number = 6) {
  return apiFetch(`/testimonials?page=${page}&limit=${limit}`);
}

export async function getFeaturedTestimonials(limit: number = 3) {
  return apiFetch(`/testimonials/featured?limit=${limit}`);
}

export async function submitTestimonial(testimonialData: any) {
  return apiFetch('/testimonials', {
    method: 'POST',
    body: JSON.stringify(testimonialData),
    skipAuth: true
  });
}

export async function updateTestimonial(id: number, testimonialData: any) {
  return apiFetch(`/testimonials/${id}`, {
    method: 'PUT',
    body: JSON.stringify(testimonialData)
  });
}

export async function deleteTestimonial(id: number) {
  return apiFetch(`/testimonials/${id}`, {
    method: 'DELETE'
  });
}

// ===== LEADS ENDPOINTS =====

export async function getLeads(page: number = 1, limit: number = 20, filters?: any) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    ...filters
  });

  return apiFetch(`/leads?${params.toString()}`);
}

export async function getLead(id: number) {
  return apiFetch(`/leads/${id}`);
}

export async function submitLead(leadData: any) {
  return apiFetch('/leads', {
    method: 'POST',
    body: JSON.stringify(leadData),
    skipAuth: true
  });
}

export async function updateLead(id: number, leadData: any) {
  return apiFetch(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(leadData)
  });
}

export async function deleteLead(id: number) {
  return apiFetch(`/leads/${id}`, {
    method: 'DELETE'
  });
}

// ===== FILE UPLOAD ENDPOINTS =====

export async function uploadFile(file: File, category: string = 'general') {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload?category=${category}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAuthToken() || ''}`
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return response.json();
}

export async function getUploadedFiles(category: string, page: number = 1, limit: number = 10) {
  return apiFetch(`/upload/list/${category}?page=${page}&limit=${limit}`);
}

export async function deleteFile(id: number) {
  return apiFetch(`/upload/${id}`, {
    method: 'DELETE'
  });
}

// ===== PAGES ENDPOINTS =====

export async function getPage(slug: string) {
  return apiFetch(`/pages/${slug}`, { skipAuth: true });
}

export async function getAllPages() {
  return apiFetch('/pages');
}

export async function updatePage(slug: string, pageData: any) {
  return apiFetch(`/pages/${slug}`, {
    method: 'PUT',
    body: JSON.stringify(pageData)
  });
}

export async function deletePage(slug: string) {
  return apiFetch(`/pages/${slug}`, {
    method: 'DELETE'
  });
}

// ===== PRICING ENDPOINTS =====

export async function getPricing(category?: string) {
  const url = category ? `/pricing?category=${category}` : '/pricing';
  return apiFetch(url, { skipAuth: true });
}

export async function getAllPricingPlans() {
  return apiFetch('/pricing/admin/all');
}

export async function createPricingPlan(planData: any) {
  return apiFetch('/pricing', {
    method: 'POST',
    body: JSON.stringify(planData)
  });
}

export async function updatePricingPlan(id: number, planData: any) {
  return apiFetch(`/pricing/${id}`, {
    method: 'PUT',
    body: JSON.stringify(planData)
  });
}

export async function deletePricingPlan(id: number) {
  return apiFetch(`/pricing/${id}`, {
    method: 'DELETE'
  });
}

// ===== SETTINGS ENDPOINTS =====

export async function getAllSettings() {
  return apiFetch('/settings');
}

export async function getSetting(key: string) {
  return apiFetch(`/settings/${key}`, { skipAuth: true });
}

export async function updateSetting(key: string, value: string) {
  return apiFetch(`/settings/${key}`, {
    method: 'PUT',
    body: JSON.stringify({ setting_value: value })
  });
}

export async function deleteSetting(key: string) {
  return apiFetch(`/settings/${key}`, {
    method: 'DELETE'
  });
}

// ===== ERROR HANDLER =====

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}
