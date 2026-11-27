import { Link } from 'react-router-dom';

/** The two cuts of the original hourglass, folded into a single speed mark. */
export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`ed-brand__mark ${className}`} viewBox="0 0 38 40" fill="currentColor" aria-hidden="true">
      <path d="M5 2h31l-6.4 7.4H1.4zM3 12h24.5l-8 8.6H12zM17.6 22h8.2l8.9 8.4H9.8zM7.1 33H36L32.4 40H.8z" />
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
