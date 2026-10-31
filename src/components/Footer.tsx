import { useState, useEffect, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BrandMark, BrandWordmark } from './editorial/Brand';
import { CONTACT_PHONE_DISPLAY, CONTACT_PHONE_TEL, CONTACT_WHATSAPP_URL } from '../constants/siteContact.js';

type SocialKey = 'twitter' | 'linkedin' | 'github' | 'facebook' | 'instagram' | 'youtube' | 'whatsapp';

const socialDefaults: Record<SocialKey, string> = {
  twitter: '',
  linkedin: '',
  github: '',
  facebook: '',
  instagram: '',
  youtube: '',
  whatsapp: CONTACT_WHATSAPP_URL
};

const socialIcons: Record<SocialKey, ReactNode> = {
  twitter: <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />,
  linkedin: <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />,
  github: <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />,
  facebook: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />,
  instagram: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />,
  youtube: <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />,
  whatsapp: <path d="M20 12.1a8 8 0 10-14.1 5L4 21l4-1a8 8 0 0012-7.9zm-4.1 2.7c-.17-.09-1-.53-1.16-.6-.15-.06-.26-.09-.37.08-.11.17-.43.6-.52.72-.09.12-.19.13-.36.04-.17-.09-.7-.26-1.33-.84-.49-.44-.82-.98-.92-1.15-.1-.17-.01-.26.08-.35.08-.08.17-.21.25-.31.08-.1.11-.17.17-.29.06-.12.03-.22-.02-.31-.05-.09-.37-.9-.51-1.24-.14-.33-.28-.29-.37-.3h-.32c-.12 0-.31.04-.47.22-.16.17-.61.6-.61 1.46 0 .86.63 1.7.72 1.82.09.12 1.23 1.88 3 2.63.42.18.75.29 1.01.37.42.13.8.11 1.1.07.34-.05 1-.41 1.14-.82.14-.41.14-.76.1-.82-.04-.06-.15-.09-.32-.18z" />
};

export function Footer() {
  const [socialLinks, setSocialLinks] = useState<Record<SocialKey, string>>(socialDefaults);
  const [siteSettings, setSiteSettings] = useState({
    contact_email: 'contact@chronolyte.com',
    contact_phone: CONTACT_PHONE_DISPLAY,
    footer_copyright: '© 2026 Chronolyte. All rights reserved.',
    footer_tagline: 'We bend time with AI.',
    footer_show_social: true
  });

  useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const settingsRes = await fetch('/backend/api/settings.php?action=get&key=site_settings');
        if (settingsRes.ok) {
          const json = await settingsRes.json();
          if (json?.success && json?.data?.value) {
            const parsed = typeof json.data.value === 'string' ? JSON.parse(json.data.value) : json.data.value;
            if (mounted) {
              setSiteSettings(prev => ({ ...prev, ...parsed }));
              const socials: Record<string, string> = {};
              if (parsed.social_twitter) socials.twitter = parsed.social_twitter;
              if (parsed.social_linkedin) socials.linkedin = parsed.social_linkedin;
              if (parsed.social_github) socials.github = parsed.social_github;
              if (parsed.social_facebook) socials.facebook = parsed.social_facebook;
              if (parsed.social_instagram) socials.instagram = parsed.social_instagram;
              if (parsed.social_youtube) socials.youtube = parsed.social_youtube;
              if (parsed.social_whatsapp) socials.whatsapp = parsed.social_whatsapp;
              setSocialLinks(prev => ({ ...prev, ...socials }));
            }
          }
        }
      } catch (err) {
        console.warn('Settings fetch failed', err);
      }
    };
    loadSettings();
    return () => { mounted = false; };
  }, []);

  const socialEntries = Object.entries(socialLinks).filter(([, url]) => Boolean(url));

  return (
    <footer className="ed-footer">
      <div className="ed-footer__top">
        <div className="ed-footer__brand">
          <div className="ed-brand" style={{ marginBottom: '0.9rem' }}>
            <BrandMark />
            <BrandWordmark />
          </div>
          <p className="ed-footer__blurb">
            An independent digital studio building websites, apps and SaaS products on fixed quotes —
            one team for design, development and launch, working worldwide.
          </p>
          {siteSettings.footer_show_social && socialEntries.length > 0 && (
            <div className="ed-footer__social">
              {socialEntries.map(([social, url]) => (
                <a key={social} href={url} target="_blank" rel="noopener noreferrer" aria-label={social}>
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    {socialIcons[social as SocialKey]}
                  </svg>
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="ed-footer__title">Services</h2>
          <ul className="ed-footer__list">
            <li><Link className="ed-footer__link" to="/website-design">Website design</Link></li>
            <li><Link className="ed-footer__link" to="/affordable-web-design">Affordable web design</Link></li>
            <li><Link className="ed-footer__link" to="/website-redesign">Website redesign</Link></li>
            <li><Link className="ed-footer__link" to="/ai-automation">AI automation</Link></li>
            <li><Link className="ed-footer__link" to="/custom-software">Custom software</Link></li>
            <li><Link className="ed-footer__link" to="/services">All services</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="ed-footer__title">Studio</h2>
          <ul className="ed-footer__list">
            <li><Link className="ed-footer__link" to="/about">About</Link></li>
            <li><Link className="ed-footer__link" to="/pricing">Pricing</Link></li>
            <li><Link className="ed-footer__link" to="/portfolio">Portfolio</Link></li>
            <li><Link className="ed-footer__link" to="/industries">Industries</Link></li>
            <li><Link className="ed-footer__link" to="/locations">Locations</Link></li>
            <li><Link className="ed-footer__link" to="/blog">Guides</Link></li>
            <li><Link className="ed-footer__link" to="/faq">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="ed-footer__title">Start a project</h2>
          <div className="ed-footer__contact">
            <a href={`mailto:${siteSettings.contact_email}`}>{siteSettings.contact_email}</a>
            <a href={CONTACT_PHONE_TEL}>{CONTACT_PHONE_DISPLAY}</a>
            <a href={CONTACT_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp us</a>
            <Link className="ed-btn ed-btn--onDark ed-btn--sm" to="/contact" style={{ marginTop: '0.6rem', width: 'fit-content' }}>
              Start your project free
            </Link>
          </div>
        </div>
      </div>

      <div className="ed-footer__seo">
        <p>
          <span className="ed-footer__title" style={{ display: 'inline', marginRight: '0.6rem' }}>Worldwide</span>
          <Link to="/international-web-development">Web development for USA, UK, Pakistan, Canada, Australia &amp; more</Link>
          {' · '}
          <Link to="/fiverr-upwork-alternative">Fiverr &amp; Upwork alternative</Link>
        </p>
        <p>
          <span className="ed-footer__title" style={{ display: 'inline', marginRight: '0.6rem' }}>Guides</span>
          <Link to="/blog/best-website-development-service-for-small-business-on-a-budget">Choose a web designer</Link>
          {' · '}
          <Link to="/blog/what-does-a-499-dollar-business-website-include">What a $499 website includes</Link>
          {' · '}
          <Link to="/blog/how-to-compare-fast-web-design-agencies">Compare fast web design agencies</Link>
        </p>
      </div>

      <div className="ed-footer__bottom">
        <p>{siteSettings.footer_copyright}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.1rem' }}>
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/refunds">Refunds</Link>
        </div>
        <p>{siteSettings.footer_tagline}</p>
      </div>
    </footer>
  );
}
