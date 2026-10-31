import { InternationalServices } from './pages/InternationalServices';
import { ServiceLanding } from './pages/ServiceLanding';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { MainSite } from './MainSite';
import { NotFound } from './pages/NotFound';
import { EditorialPage } from './components/editorial/EditorialPage';
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

function PublicPage({ children }: { children: React.ReactNode }) {
  return <EditorialPage>{children}</EditorialPage>;
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
          <Route path="/terms" element={<PublicPage><TermsOfService /></PublicPage>} />
          <Route path="/privacy" element={<PublicPage><PrivacyPolicy /></PublicPage>} />
          <Route path="/refunds" element={<PublicPage><RefundPolicy /></PublicPage>} />
          
          {/* Main Pages */}
          <Route path="/about" element={<PublicPage><About /></PublicPage>} />
          <Route path="/services" element={<PublicPage><Services /></PublicPage>} />
          <Route path="/website-design" element={<PublicPage><ServiceLanding slug="website-design" /></PublicPage>} />
          <Route path="/affordable-web-design" element={<PublicPage><ServiceLanding slug="affordable-web-design" /></PublicPage>} />
          <Route path="/website-redesign" element={<PublicPage><ServiceLanding slug="website-redesign" /></PublicPage>} />
          <Route path="/ai-automation" element={<PublicPage><ServiceLanding slug="ai-automation" /></PublicPage>} />
          <Route path="/custom-software" element={<PublicPage><ServiceLanding slug="custom-software" /></PublicPage>} />
          <Route path="/contact" element={<PublicPage><Contact /></PublicPage>} />
          <Route path="/portfolio" element={<PublicPage><Portfolio /></PublicPage>} />
          <Route path="/faq" element={<PublicPage><FAQ /></PublicPage>} />
          <Route path="/pricing" element={<PublicPage><Pricing /></PublicPage>} />
          <Route path="/industries" element={<PublicPage><Industries /></PublicPage>} />
          <Route path="/locations" element={<PublicPage><Locations /></PublicPage>} />
          <Route path="/international-web-development" element={<PublicPage><InternationalServices /></PublicPage>} />
          <Route path="/fiverr-upwork-alternative" element={<PublicPage><FiverrAlternative /></PublicPage>} />
          
          {/* Legacy guide URLs mirror the current /blog routes outside Vercel too */}
          <Route path="/guides" element={<Navigate to="/blog" replace />} />
          <Route path="/guides/:slug" element={<LegacyGuidesRedirect />} />

          {/* Blog Pages */}
          <Route path="/blog" element={<PublicPage><BlogListing /></PublicPage>} />
          <Route path="/blog/:slug" element={<PublicPage><BlogPost /></PublicPage>} />
          <Route path="/blog/category/:category" element={<PublicPage><BlogListing /></PublicPage>} />
          <Route path="/blog/search" element={<PublicPage><BlogListing /></PublicPage>} />
          
          {/* Unknown public URL */}
          <Route path="*" element={<PublicPage><NotFound /></PublicPage>} />

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
