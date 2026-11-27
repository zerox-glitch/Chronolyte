import { useDialogFocus } from './useDialogFocus';
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { CallNowButton } from './CallNowButton';
import { BrandLockup } from './editorial/Brand';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, CONTACT_WHATSAPP_URL } from '../constants/siteContact.js';

const navigationItems = [
  { label: 'Services', to: '/services' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Portfolio', to: '/portfolio' },
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Guides', to: '/blog' },
  { label: 'Contact', to: '/contact' }
];

export function SiteNavigation() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  const menuRef = useDialogFocus(mobileMenuOpen, () => setMobileMenuOpen(false));
  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px)');
    const resize = () => { if (media.matches) setMobileMenuOpen(false); };
    media.addEventListener('change', resize);
    return () => media.removeEventListener('change', resize);
  }, []);

  const isActive = (to: string) =>
    to === '/blog' ? location.pathname.startsWith('/blog') : location.pathname === to;

  return (
    <>
      <header className={`ed-nav ${scrolled ? 'ed-nav--scrolled' : ''}`}>
        <div className="ed-nav__inner">
          <BrandLockup />

          <nav aria-label="Main navigation" className="ed-nav__links">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive(item.to) ? 'page' : undefined}
                className="ed-nav__link"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ed-nav__actions">
            <div className="ed-nav-cta">
              <CallNowButton />
            </div>
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="site-mobile-menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="ed-nav__menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            ref={menuRef}
            role="dialog" aria-modal="true" aria-label="Site navigation"
            id="site-mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="ed-mobile"
          >
            <div className="ed-mobile__top">
              <span onClick={() => setMobileMenuOpen(false)}><BrandLockup /></span>
              <button
                type="button"
                aria-label="Close navigation menu"
                onClick={() => setMobileMenuOpen(false)}
                className="ed-nav__menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav aria-label="Mobile navigation" className="ed-mobile__links">
              {navigationItems.map((item, index) => (
                <Link key={item.to} to={item.to} aria-current={isActive(item.to) ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)} className="ed-mobile__link">
                  {item.label}
                  <small>{String(index + 1).padStart(2, '0')} / {String(navigationItems.length).padStart(2, '0')}</small>
                </Link>
              ))}
            </nav>

            <div className="ed-mobile__contact">
              <a href={CONTACT_PHONE_TEL}>Call {CONTACT_PHONE_DISPLAY}</a>
              <a href={CONTACT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp {CONTACT_PHONE_DISPLAY}</a>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="ed-btn" style={{ marginTop: '0.8rem' }}>
                Start your project free <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
