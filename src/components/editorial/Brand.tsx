import { Link } from 'react-router-dom';
import { useId } from 'react';

/** The Chronolyte hourglass: a grain of light travels through the original speed mark. */
export function BrandMark({ className = '' }: { className?: string }) {
  const id = useId();
  const top = 'M5 2h31l-6.4 7.4H1.4zM3 12h24.5l-8 8.6H12z';
  const bottom = 'M17.6 22h8.2l8.9 8.4H9.8zM7.1 33H36L32.4 40H.8z';
  return (
    <svg className={`ed-brand__mark ${className}`} viewBox="0 0 38 40" fill="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-metal`} x1="2" y1="2" x2="34" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff9c69"/><stop offset=".35" stopColor="currentColor"/><stop offset="1" stopColor="#d7380a"/>
        </linearGradient>
        <clipPath id={`${id}-clip`}><path d={top}/><path d={bottom}/></clipPath>
      </defs>
      <path className="brand-time-top" d={top} fill={`url(#${id}-metal)`}/>
      <path className="brand-time-bottom" d={bottom} fill={`url(#${id}-metal)`}/>
      <g clipPath={`url(#${id}-clip)`}>
        <path className="brand-light" d="M-17 0h7l29 40h-7z" fill="#fff5df" />
        <path className="brand-fill-glow" d={bottom} fill="#ffc08a" />
      </g>
      <path className="brand-light-trail" d="M19 12v17" stroke="#fff6e4" strokeWidth="1.2" strokeLinecap="round"/>
      <circle className="brand-light-seed" cx="19" cy="7" r="2.45" fill="#fff9e8" stroke="#ff8b48" strokeWidth=".8"/>
      <path className="brand-flash" d="M19 16.5v7M15.5 20h7" stroke="#fff8e7" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}
export function BrandWordmark({ className = '' }: { className?: string }) {
  return <span className={`ed-brand__word ${className}`}>Chrono<span className="brand-word-light">lyte</span></span>;
}
export function BrandLockup({ to = '/', className = '' }: { to?: string; className?: string }) {
  return (
    <Link to={to} aria-label="Chronolyte home" className={`ed-brand ${className}`}>
      <BrandMark />
      <BrandWordmark />
    </Link>
  );
}
