import { Link } from 'react-router-dom';

/**
 * Chronolyte brand mark in the editorial palette: cherry ink on a lime disc.
 * The admin area keeps its own neon logo; the public site uses this lockup.
 */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <span className={`ed-brand__mark ${className}`} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="21" fill="#c5de97" />
        <circle cx="24" cy="24" r="21" stroke="#7b182a" strokeWidth="2" />
        <circle cx="24" cy="24" r="17.5" stroke="#7b182a" strokeWidth="0.8" opacity="0.45" />
        <path d="M16 11.5h16M16 36.5h16" stroke="#7b182a" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M17.5 12c0 6.6 6.5 8.6 6.5 12s-6.5 5.4-6.5 12M30.5 12c0 6.6-6.5 8.6-6.5 12s6.5 5.4 6.5 12"
          stroke="#7b182a" strokeWidth="2.1" strokeLinejoin="round" />
        <path d="M20.4 15.4h7.2L24 21.2z" fill="#7b182a" />
        <path d="M24 27.4 20.4 32.6h7.2z" fill="#7b182a" opacity="0.55" />
        <circle cx="24" cy="24" r="1.6" fill="#7b182a" />
      </svg>
    </span>
  );
}

export function BrandWordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`ed-brand__word ${className}`}>
      CHR<span className="ed-brand__o" aria-hidden="true" />NOLYTE
    </span>
  );
}

export function BrandLockup({ to = '/', className = '' }: { to?: string; className?: string }) {
  return (
    <Link to={to} aria-label="Chronolyte home" className={`ed-brand ${className}`}>
      <BrandMark />
      <BrandWordmark />
    </Link>
  );
}
