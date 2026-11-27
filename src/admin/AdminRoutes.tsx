import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './AdminLayout';
import { AdminLogin } from './pages/Login';
import { lazy } from 'react';
import { Leads } from './pages/Leads';
import { ProjectVideoUpload } from './pages/ProjectVideoUpload';
import { Testimonials } from './pages/Testimonials';
import { Settings } from './pages/Settings';
import { SiteSettings } from './pages/SiteSettings';
import PortfolioManager from './pages/PortfolioManager';
import ProjectRequests from './pages/ProjectRequests';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './context/ProtectedRoute';

// Import new manager pages
import { ContentManager } from './pages/ContentManager';
import { ServicesManager } from './pages/ServicesManager';
import { PricingManager } from './pages/PricingManager';
import { ProjectsManager } from './pages/ProjectsManager';
import { BlogsAdmin } from './pages/Blogs';

const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })));

export default function AdminRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Admin Login */}
        <Route path="login" element={<AdminLogin />} />

        {/* Admin Dashboard - Protected */}
        <Route
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="project-requests" element={<ProjectRequests />} />
          <Route path="projects-manager" element={<ProjectsManager />} />
          <Route path="services" element={<ServicesManager />} />
          <Route path="pricing" element={<PricingManager />} />
          <Route path="videos" element={<ProjectVideoUpload />} />
          <Route path="blogs" element={<BlogsAdmin />} />
          <Route path="content" element={<ContentManager />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="portfolio" element={<PortfolioManager />} />
          <Route path="site-settings" element={<SiteSettings />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </AuthProvider>
  );
}
