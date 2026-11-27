import { Link } from 'react-router-dom';
import { useId } from 'react';

/** The two cuts of the original hourglass, folded into a single speed mark. */
export function BrandMark({ className = '' }: { className?: string }) {
  const clip = useId();
  const top = 'M5 2h31l-6.4 7.4H1.4zM3 12h24.5l-8 8.6H12z';
  const bottom = 'M17.6 22h8.2l8.9 8.4H9.8zM7.1 33H36L32.4 40H.8z';
  return (
    <svg className={`ed-brand__mark ${className}`} viewBox="0 0 38 40" fill="currentColor" aria-hidden="true">
      <defs><clipPath id={clip}><path d={top}/><path d={bottom}/></clipPath></defs>
      <path className="brand-time-top" d={top} /><path className="brand-time-bottom" d={bottom} />
      <g clipPath={`url(#${clip})`}><path className="brand-light" d="M-14 0h12l32 40H18z" fill="#fff5d9" /><circle className="brand-light-seed" cx="19" cy="4" r="3.6" fill="#fff6de" /></g>
    </svg>
  );
}
export function BrandWordmark({ className = '' }: { className?: string }) {
  return <span className={`ed-brand__word ${className}`}>Chronolyte</span>;
}
export function BrandLockup({ to = '/', className = '' }: { to?: string; className?: string }) {
  return (
    <Link to={to} aria-label="Chronolyte home" className={`ed-brand ${className}`}>
      <BrandMark />
      <BrandWordmark />
    </Link>
  );
}
