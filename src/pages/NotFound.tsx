import { Link } from 'react-router-dom';
import { ArrowRight, Compass, LifeBuoy, MapPin } from 'lucide-react';
import { PageHero, Sheet, SectionHead } from '../components/editorial/EditorialPage';

const routes = [
  { to: '/', label: 'Homepage', note: 'Start at the top of the sheet' },
  { to: '/services', label: 'Services', note: 'Websites, apps, SaaS and automation' },
  { to: '/pricing', label: 'Pricing', note: 'Current packages and starting prices' },
  { to: '/portfolio', label: 'Portfolio', note: 'Recent builds and live products' },
  { to: '/blog', label: 'Guides', note: 'Plain-English cost and hiring answers' },
  { to: '/contact', label: 'Contact', note: 'Get a free plan and fixed quote' }
];

export function NotFound() {
  return (
    <>
      <PageHero
        study="turbine"
        eyebrow="404 — Nothing on this sheet"
        title={<>This page slipped <em>off the slab.</em></>}
        lede="The link may be old, mistyped, or the page has moved. Nothing is lost — pick a route below and carry on."
        actions={
          <>
            <Link to="/" className="ed-btn">Back to homepage <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/contact" className="ed-btn ed-btn--ghost">Tell us what you needed</Link>
          </>
        }
        meta={
          <>
            <span><Compass /> Every public page is one click away</span>
            <span><LifeBuoy /> Broken link? Email contact@chronolyte.com</span>
            <span><MapPin /> Working worldwide, remotely</span>
          </>
        }
      />

      <Sheet tone="paper">
        <SectionHead
          rubric="Popular routes"
          number="02 / 02"
          title={<>Where most people <em>go next</em></>}
          lede="The pages clients ask for most often."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {routes.map((route) => (
            <Link key={route.to} to={route.to} className="ed-card" style={{ textDecoration: 'none' }}>
              <h3 className="ed-card__title">{route.label}</h3>
              <p className="ed-card__body">{route.note}</p>
              <span style={{ marginTop: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-ink)' }}>
                Open <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </Sheet>
    </>
  );
}
