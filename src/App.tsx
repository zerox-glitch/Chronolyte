import { InternationalServices } from './pages/InternationalServices';
import { ServiceLanding } from './pages/ServiceLanding';
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

function PublicCanvas({ children }: { children: React.ReactNode }) {
  return <div className="chronolyte-editorial editorial-inner-page">{children}</div>;
}

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
          <Route path="/terms" element={<PublicCanvas><TermsOfService /></PublicCanvas>} />
          <Route path="/privacy" element={<PublicCanvas><PrivacyPolicy /></PublicCanvas>} />
          <Route path="/refunds" element={<PublicCanvas><RefundPolicy /></PublicCanvas>} />
          
          {/* Main Pages */}
          <Route path="/about" element={<PublicCanvas><About /></PublicCanvas>} />
          <Route path="/services" element={<PublicCanvas><Services /></PublicCanvas>} />
          <Route path="/website-design" element={<PublicCanvas><ServiceLanding slug="website-design" /></PublicCanvas>} />
          <Route path="/affordable-web-design" element={<PublicCanvas><ServiceLanding slug="affordable-web-design" /></PublicCanvas>} />
          <Route path="/website-redesign" element={<PublicCanvas><ServiceLanding slug="website-redesign" /></PublicCanvas>} />
          <Route path="/ai-automation" element={<PublicCanvas><ServiceLanding slug="ai-automation" /></PublicCanvas>} />
          <Route path="/custom-software" element={<PublicCanvas><ServiceLanding slug="custom-software" /></PublicCanvas>} />
          <Route path="/contact" element={<PublicCanvas><Contact /></PublicCanvas>} />
          <Route path="/portfolio" element={<PublicCanvas><Portfolio /></PublicCanvas>} />
          <Route path="/faq" element={<PublicCanvas><FAQ /></PublicCanvas>} />
          <Route path="/pricing" element={<PublicCanvas><Pricing /></PublicCanvas>} />
          <Route path="/industries" element={<PublicCanvas><Industries /></PublicCanvas>} />
          <Route path="/locations" element={<PublicCanvas><Locations /></PublicCanvas>} />
          <Route path="/international-web-development" element={<PublicCanvas><InternationalServices /></PublicCanvas>} />
          <Route path="/fiverr-upwork-alternative" element={<PublicCanvas><FiverrAlternative /></PublicCanvas>} />
          
          {/* Legacy guide URLs mirror the current /blog routes outside Vercel too */}
          <Route path="/guides" element={<Navigate to="/blog" replace />} />
          <Route path="/guides/:slug" element={<LegacyGuidesRedirect />} />

          {/* Blog Pages */}
          <Route path="/blog" element={<PublicCanvas><BlogListing /></PublicCanvas>} />
          <Route path="/blog/:slug" element={<PublicCanvas><BlogPost /></PublicCanvas>} />
          <Route path="/blog/category/:category" element={<PublicCanvas><BlogListing /></PublicCanvas>} />
          <Route path="/blog/search" element={<PublicCanvas><BlogListing /></PublicCanvas>} />
          
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
            <Route path="services" element={<PublicCanvas><ServicesManager /></PublicCanvas>} />
            <Route path="pricing" element={<PublicCanvas><PricingManager /></PublicCanvas>} />
            <Route path="videos" element={<ProjectVideoUpload />} />
            <Route path="blogs" element={<BlogsAdmin />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="portfolio" element={<PublicCanvas><PortfolioManager /></PublicCanvas>} />
            <Route path="site-settings" element={<SiteSettings />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Analytics />
      </AuthProvider>
    </BrowserRouter>
  );
}
