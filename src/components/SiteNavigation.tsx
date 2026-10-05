import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { CallNowButton } from './CallNowButton';
import { HourglassLogo } from './HourglassLogo';
import { BrandWordmark } from './NavLogo';
import { PhoneIcon } from './PhoneIcon';
import { WhatsAppIcon } from './WhatsAppIcon';

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
    const handleScroll = () => setScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileMenuOpen]);

  const isActive = (to: string) =>
    to === '/blog' ? location.pathname.startsWith('/blog') : location.pathname === to;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 backdrop-blur-2xl backdrop-saturate-150 shadow-lg shadow-black/20 transition-all duration-300 ${
          scrolled ? 'bg-dark-900/85 py-3' : 'bg-dark-900/45 py-4'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          <Link to="/" aria-label="Chronolyte home" className="flex shrink-0 items-center gap-2.5">
            <HourglassLogo className="h-9 w-9 md:h-11 md:w-11" />
            <BrandWordmark className="text-base sm:text-lg md:text-2xl" />
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-5 text-sm text-white/70 lg:flex xl:gap-7">
            {navigationItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                aria-current={isActive(item.to) ? 'page' : undefined}
                className={`whitespace-nowrap transition-colors hover:text-cyan-300 ${isActive(item.to) ? 'text-cyan-300' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden shrink-0 lg:block">
            <CallNowButton />
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="site-mobile-menu"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-white transition hover:border-cyan-400/40 hover:bg-white/10 lg:hidden"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="site-mobile-menu"
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-xl lg:hidden"
          >
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute right-4 top-4 rounded-xl border border-white/10 bg-white/5 p-2.5 text-white transition hover:border-cyan-400/40 hover:bg-white/10 md:right-6 md:top-6"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.nav
              aria-label="Mobile navigation"
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="flex min-h-full flex-col items-center justify-center gap-5 overflow-y-auto px-8 pb-10 pt-24"
            >
              {navigationItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={isActive(item.to) ? 'page' : undefined}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-2xl font-semibold transition-colors hover:text-cyan-300 ${isActive(item.to) ? 'text-cyan-300' : 'text-white'}`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 flex w-full max-w-xs flex-col gap-3">
                <a
                  href="https://wa.me/18126906121"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/15 px-6 py-3.5 font-semibold text-emerald-200 transition hover:bg-emerald-500/25"
                >
                  <WhatsAppIcon className="h-5 w-5" /> WhatsApp
                </a>
                <a
                  href="tel:+18126906121"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-3.5 font-semibold text-black transition hover:shadow-lg hover:shadow-cyan-500/30"
                >
                  <PhoneIcon className="h-5 w-5" /> Call Now
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
