import { lazy, Suspense, useLayoutEffect } from 'react';
import { MotionPreferences } from './components/editorial/MotionPreferences';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigationType,
  useParams,
} from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { MainSite } from './MainSite';
import { NotFound } from './pages/NotFound';
import { EditorialPage } from './components/editorial/EditorialPage';
const Services = lazy(() => import('./pages/Services').then((m) => ({ default: m.Services })));
const Pricing = lazy(() => import('./pages/Pricing').then((m) => ({ default: m.Pricing })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
const FAQ = lazy(() => import('./pages/FAQ').then((m) => ({ default: m.FAQ })));
const Portfolio = lazy(() => import('./pages/Portfolio').then((m) => ({ default: m.Portfolio })));
const TermsOfService = lazy(() =>
  import('./pages/TermsOfService').then((m) => ({ default: m.TermsOfService })),
);
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then((m) => ({ default: m.PrivacyPolicy })));
const RefundPolicy = lazy(() => import('./pages/RefundPolicy').then((m) => ({ default: m.RefundPolicy })));
const Industries = lazy(() => import('./pages/Industries').then((m) => ({ default: m.Industries })));
const Locations = lazy(() => import('./pages/Locations').then((m) => ({ default: m.Locations })));
const InternationalServices = lazy(() =>
  import('./pages/InternationalServices').then((m) => ({ default: m.InternationalServices })),
);
const ServiceLanding = lazy(() =>
  import('./pages/ServiceLanding').then((m) => ({ default: m.ServiceLanding })),
);
const FiverrAlternative = lazy(() =>
  import('./pages/FiverrAlternative').then((m) => ({ default: m.FiverrAlternative })),
);
const BlogListing = lazy(() => import('./pages/BlogListing').then((m) => ({ default: m.BlogListing })));
const BlogPost = lazy(() => import('./pages/Blog').then((m) => ({ default: m.BlogPost })));

const AdminRoutes = lazy(() => import('./admin/AdminRoutes'));

function RoutePosition() {
  const { pathname, hash } = useLocation();
  const navigation = useNavigationType();
  useLayoutEffect(() => {
    if (hash) {
      // An entry URL can point into a lazy route or CMS-loaded section. Wait for
      // that target rather than scrolling a loading indicator or losing the hash.
      const scrollToTarget = () => {
        const target = document.getElementById(hash.slice(1));
        target?.scrollIntoView({ behavior: 'instant' });
        return Boolean(target);
      };
      if (scrollToTarget()) return;
      const observer = new MutationObserver(() => {
        if (scrollToTarget()) observer.disconnect();
      });
      observer.observe(document.getElementById('root')!, { childList: true, subtree: true });
      const timer = setTimeout(() => observer.disconnect(), 6000);
      return () => {
        observer.disconnect();
        clearTimeout(timer);
      };
    }
    if (navigation !== 'POP') window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname, hash, navigation]);
  return null;
}

function PublicPage({ children }: { children: React.ReactNode }) {
  return (
    <EditorialPage>
      <Suspense
        fallback={
          <div className="route-loading" role="status">
            <span className="ed-loading-dot" />
            Loading…
          </div>
        }
      >
        {children}
      </Suspense>
    </EditorialPage>
  );
}

function LegacyGuidesRedirect() {
  const { slug } = useParams<{ slug?: string }>();
  return <Navigate to={slug ? `/blog/${slug}` : '/blog'} replace />;
}

export function App() {
  return (
    <BrowserRouter>
      <MotionPreferences>
        <RoutePosition />
        <Routes>
          {/* Main Website */}
          <Route path="/" element={<MainSite />} />

          {/* Legal Pages */}
          <Route
            path="/terms"
            element={
              <PublicPage>
                <TermsOfService />
              </PublicPage>
            }
          />
          <Route
            path="/privacy"
            element={
              <PublicPage>
                <PrivacyPolicy />
              </PublicPage>
            }
          />
          <Route
            path="/refunds"
            element={
              <PublicPage>
                <RefundPolicy />
              </PublicPage>
            }
          />

          {/* Main Pages */}
          <Route
            path="/about"
            element={
              <PublicPage>
                <About />
              </PublicPage>
            }
          />
          <Route
            path="/services"
            element={
              <PublicPage>
                <Services />
              </PublicPage>
            }
          />
          <Route
            path="/website-design"
            element={
              <PublicPage>
                <ServiceLanding slug="website-design" />
              </PublicPage>
            }
          />
          <Route
            path="/affordable-web-design"
            element={
              <PublicPage>
                <ServiceLanding slug="affordable-web-design" />
              </PublicPage>
            }
          />
          <Route
            path="/website-redesign"
            element={
              <PublicPage>
                <ServiceLanding slug="website-redesign" />
              </PublicPage>
            }
          />
          <Route
            path="/ai-automation"
            element={
              <PublicPage>
                <ServiceLanding slug="ai-automation" />
              </PublicPage>
            }
          />
          <Route
            path="/custom-software"
            element={
              <PublicPage>
                <ServiceLanding slug="custom-software" />
              </PublicPage>
            }
          />
          <Route
            path="/contact"
            element={
              <PublicPage>
                <Contact />
              </PublicPage>
            }
          />
          <Route
            path="/portfolio"
            element={
              <PublicPage>
                <Portfolio />
              </PublicPage>
            }
          />
          <Route
            path="/faq"
            element={
              <PublicPage>
                <FAQ />
              </PublicPage>
            }
          />
          <Route
            path="/pricing"
            element={
              <PublicPage>
                <Pricing />
              </PublicPage>
            }
          />
          <Route
            path="/industries"
            element={
              <PublicPage>
                <Industries />
              </PublicPage>
            }
          />
          <Route
            path="/locations"
            element={
              <PublicPage>
                <Locations />
              </PublicPage>
            }
          />
          <Route
            path="/international-web-development"
            element={
              <PublicPage>
                <InternationalServices />
              </PublicPage>
            }
          />
          <Route
            path="/fiverr-upwork-alternative"
            element={
              <PublicPage>
                <FiverrAlternative />
              </PublicPage>
            }
          />

          {/* Legacy guide URLs mirror the current /blog routes outside Vercel too */}
          <Route path="/guides" element={<Navigate to="/blog" replace />} />
          <Route path="/guides/:slug" element={<LegacyGuidesRedirect />} />

          {/* Blog Pages */}
          <Route
            path="/blog"
            element={
              <PublicPage>
                <BlogListing />
              </PublicPage>
            }
          />
          <Route
            path="/blog/:slug"
            element={
              <PublicPage>
                <BlogPost />
              </PublicPage>
            }
          />
          <Route
            path="/blog/category/:category"
            element={
              <PublicPage>
                <BlogListing />
              </PublicPage>
            }
          />
          <Route
            path="/blog/search"
            element={
              <PublicPage>
                <BlogListing />
              </PublicPage>
            }
          />

          {/* Unknown public URL */}
          <Route
            path="*"
            element={
              <PublicPage>
                <NotFound />
              </PublicPage>
            }
          />

          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<div className="desk desk-loading">Loading...</div>}>
                <AdminRoutes />
              </Suspense>
            }
          />
        </Routes>
        {import.meta.env.PROD && import.meta.env.VERCEL_INSIGHTS && <Analytics />}
      </MotionPreferences>
    </BrowserRouter>
  );
}
