import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { MainSite } from './MainSite';
import { AdminLayout } from './admin/AdminLayout';
import { AdminLogin } from './admin/pages/Login';
import { Dashboard } from './admin/pages/Dashboard';
import { Leads } from './admin/pages/Leads';
import { Projects } from './admin/pages/Projects';
import { ProjectVideoUpload } from './admin/pages/ProjectVideoUpload';
import { Testimonials } from './admin/pages/Testimonials';
import { Content } from './admin/pages/Content';
import { Settings } from './admin/pages/Settings';
import { SiteSettings } from './admin/pages/SiteSettings';
import { HomePageEditor } from './admin/pages/HomePageEditor';
import { PagesEditor } from './admin/pages/PagesEditor';
import { PricingManagement } from './admin/pages/Pricing';
import PortfolioManager from './admin/pages/PortfolioManager';
import ProjectRequests from './admin/pages/ProjectRequests';
import FormSettings from './admin/pages/FormSettings';
import { AuthProvider } from './admin/context/AuthContext';
import { ProtectedRoute } from './admin/context/ProtectedRoute';

// Import new manager pages
import { ContentManager } from './admin/pages/ContentManager';
import { ServicesManager } from './admin/pages/ServicesManager';
import { PricingManager } from './admin/pages/PricingManager';
import { ProjectsManager } from './admin/pages/ProjectsManager';
import { BlogsAdmin } from './admin/pages/Blogs';

// Import page components
import { TermsOfService, PrivacyPolicy, RefundPolicy, About, Services, Contact, Portfolio, FAQ, Pricing, BlogListing, BlogPost, Industries, Locations, FiverrAlternative } from './pages';

function LegacyGuidesRedirect() {
  const { slug } = useParams<{ slug?: string }>();
  return <Navigate to={slug ? `/blog/${slug}` : '/blog'} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Main Website */}
          <Route path="/" element={<MainSite />} />
          
          {/* Legal Pages */}
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/refunds" element={<RefundPolicy />} />
          
          {/* Main Pages */}
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/locations" element={<Locations />} />
          <Route path="/fiverr-upwork-alternative" element={<FiverrAlternative />} />
          
          {/* Legacy guide URLs mirror the current /blog routes outside Vercel too */}
          <Route path="/guides" element={<Navigate to="/blog" replace />} />
          <Route path="/guides/:slug" element={<LegacyGuidesRedirect />} />

          {/* Blog Pages */}
          <Route path="/blog" element={<BlogListing />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/blog/category/:category" element={<BlogListing />} />
          <Route path="/blog/search" element={<BlogListing />} />
          
          {/* Admin Login */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Admin Dashboard - Protected */}
          <Route 
            path="/admin" 
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
        </Routes>
        <Analytics />
      </AuthProvider>
    </BrowserRouter>
  );
}
